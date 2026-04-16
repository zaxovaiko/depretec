import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { Project, type ProjectOptions, type SourceFile } from "ts-morph";

const walkUp = (start: string): readonly string[] => {
  const steps: string[] = [];
  let dir = start;
  while (true) {
    steps.push(dir);
    const parent = dirname(dir);
    if (parent === dir) return steps;
    dir = parent;
  }
};

const findTsConfig = (cwd: string): string | undefined =>
  walkUp(cwd)
    .map((dir) => join(dir, "tsconfig.json"))
    .find((p) => existsSync(p) && statSync(p).isFile());

const baseCompilerOptions = {
  allowJs: true,
  checkJs: false,
  target: 99,
  module: 99,
  moduleResolution: 100,
  esModuleInterop: true,
  skipLibCheck: true,
  strict: false,
} as const;

const syntheticOptions = (): ProjectOptions => ({
  compilerOptions: { ...baseCompilerOptions },
  skipAddingFilesFromTsConfig: true,
  useInMemoryFileSystem: false,
  tsConfigFilePath: undefined,
});

const SCANNABLE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mts", ".cts", ".mjs", ".cjs"]);

// Generated-code markers by convention (Prisma, GraphQL codegen, protobuf, Flow, etc.)
const GENERATED_MARKER = /@generated\b|GENERATED\s+(FILE|CODE)|DO NOT EDIT/i;
const GENERATED_HEADER_BYTES = 512;

// Minimal safety-net excludes used only when we fall back to glob-based discovery
// (i.e. not inside a git repo). Git repos use `git ls-files` which already
// honors .gitignore, so this list stays intentionally small.
const FALLBACK_EXCLUDES = [
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/*.min.js",
  "**/*.min.mjs",
  "**/*.min.cjs",
];

const FALLBACK_GLOBS = [
  "**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}",
];

export type LoadProjectOptions = {
  cwd: string;
  tsConfigPath?: string;
  include?: readonly string[];
  exclude?: readonly string[];
};

const isGitRepo = (cwd: string): boolean => {
  try {
    execFileSync("git", ["rev-parse", "--is-inside-work-tree"], {
      cwd,
      stdio: ["ignore", "pipe", "ignore"],
    });
    return true;
  } catch {
    return false;
  }
};

// Lists files tracked by git + untracked-but-not-ignored, scoped to cwd subtree.
// Honors .gitignore, .git/info/exclude, and core.excludesfile automatically.
const gitListedFiles = (cwd: string): readonly string[] => {
  const out = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z", "--", "."],
    { cwd, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 },
  );
  return out.split("\0").filter(Boolean).map((rel) => resolve(cwd, rel));
};

const isScannable = (file: string): boolean => SCANNABLE_EXT.has(extname(file));

// True if file starts with a well-known generated-code marker in its first bytes.
// Cheap: partial read, no full-file parse.
const isGenerated = (file: string): boolean => {
  try {
    const fd = readFileSync(file, { encoding: "utf8", flag: "r" });
    const head = fd.slice(0, GENERATED_HEADER_BYTES);
    return GENERATED_MARKER.test(head);
  } catch {
    return false;
  }
};

const discoverFiles = (cwd: string): readonly string[] => {
  if (isGitRepo(cwd)) {
    return gitListedFiles(cwd).filter(isScannable).filter((f) => !isGenerated(f));
  }
  return [];
};

// Always use our own file list (never auto-add files from tsconfig). tsconfig's
// `include` often pulls in generated code / build artifacts which balloon memory.
// tsconfig is still honored for compiler options (moduleResolution, paths, etc.)
// so symbol resolution through the TS type checker works correctly.
export const loadProject = (opts: LoadProjectOptions): Project => {
  const cwd = resolve(opts.cwd);
  const tsConfigFilePath = opts.tsConfigPath
    ? resolve(cwd, opts.tsConfigPath)
    : findTsConfig(cwd);

  const project = tsConfigFilePath
    ? new Project({ tsConfigFilePath, skipAddingFilesFromTsConfig: true })
    : new Project(syntheticOptions());

  // Explicit user includes override auto-discovery entirely.
  if (opts.include && opts.include.length > 0) {
    const patterns = opts.include.map((g) => join(cwd, g));
    const excludes = (opts.exclude ?? []).map((g) => `!${join(cwd, g)}`);
    project.addSourceFilesAtPaths([...patterns, ...excludes]);
    return project;
  }

  const discovered = discoverFiles(cwd);
  if (discovered.length > 0) {
    const userExcludeMatches = (opts.exclude ?? []).map((g) => join(cwd, g));
    const filtered =
      userExcludeMatches.length > 0
        ? discovered.filter((f) => !userExcludeMatches.some((pat) => f.includes(pat.replace(/\*/g, ""))))
        : discovered;
    for (const file of filtered) project.addSourceFileAtPathIfExists(file);
    return project;
  }

  // Fallback: not a git repo and no explicit includes — use broad glob with
  // a minimal exclude list.
  const patterns = FALLBACK_GLOBS.map((g) => join(cwd, g));
  const excludes = [...FALLBACK_EXCLUDES, ...(opts.exclude ?? [])].map((g) => `!${join(cwd, g)}`);
  project.addSourceFilesAtPaths([...patterns, ...excludes]);
  return project;
};

// Returns only explicitly added source files (user source). Dep .d.ts files are
// resolved lazily by the TypeScript type checker on demand — never loaded in bulk.
export const allSourceFiles = (project: Project): readonly SourceFile[] => project.getSourceFiles();

// Count dep files from the TS program without loading them into ts-morph's cache.
export const countDepFiles = (project: Project): number =>
  project
    .getProgram()
    .compilerObject.getSourceFiles()
    .filter((sf) => sf.fileName.includes("/node_modules/")).length;
