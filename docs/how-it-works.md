# How It Works

depretec runs two passes over a TypeScript Program built via [ts-morph](https://ts-morph.com).

## File discovery

depretec never loads your whole dependency tree. Instead:

1. **Inside a git repo**: uses `git ls-files --cached --others --exclude-standard` scoped to the target directory. This automatically honors `.gitignore`, `.git/info/exclude`, and the user's global `core.excludesfile` — so generated code, build outputs, caches, and minified files are skipped without any config.
2. **Outside a git repo**: falls back to a broad `**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}` glob with minimal excludes (`node_modules`, `dist`, `build`, `*.min.*`).
3. **With `--include`**: user-supplied globs take over entirely.

On top of that, any file whose first 512 bytes contain `@generated`, `GENERATED FILE/CODE`, or `DO NOT EDIT` is skipped. This catches Prisma clients, GraphQL codegen output, protobuf, Flow, and other tools that follow the generated-code convention.

`.d.ts` files in `node_modules` are **never** explicitly loaded — the TypeScript type checker resolves them lazily when it needs to, keeping memory proportional to imports rather than dep count.

## Pass 1: Collect deprecated declarations (user source)

Walks every declaration in the project's source files — `function`, `method`, `class`, `property`, `variable`, `type`, `interface`, `enum`, and accessor — and checks for a `@deprecated` JSDoc tag.

Produces the `deprecations` list in the report (user-declared deprecated symbols).

## Pass 2: Match identifiers lazily

Every identifier in your source files is resolved through the TypeScript type checker. For each identifier:

1. Get its symbol (follows re-exports and aliases)
2. For each declaration of that symbol, check for `@deprecated` JSDoc
3. If found, record an occurrence

This pass handles both user-defined and dependency-defined deprecations. TypeScript loads the relevant `.d.ts` on demand — we never pre-scan `node_modules`.

The checker follows:
- Re-exports (`export { foo } from './bar'`)
- Method chains (`z.string().email()` resolves through each call)
- Property access (`obj.deprecatedProp`)

## Replacement extraction

For each deprecated declaration, depretec tries to extract the replacement hint in this order:

| Strategy | Example JSDoc |
|----------|--------------|
| `{@link X}` | `@deprecated Use {@link newFn} instead` |
| `{@linkcode X}` | `@deprecated {@linkcode newFn}` |
| `{@linkplain X}` | `@deprecated {@linkplain newFn}` |
| Free-text: use | `@deprecated Use \`newFn\` instead` |
| Free-text: replaced by | `@deprecated Replaced by \`newFn\`` |
| Free-text: prefer | `@deprecated Prefer \`newFn\`` |
| Bareword variants | `@deprecated newFn` |

If no hint is found, `replacement` is `null`.

## Non-goals

- **Auto-fix** - writing replacements back to files (planned for `--fix`)
- **`.vue` / `.svelte` / `.astro`** - only `.ts`, `.tsx`, `.js`, `.jsx`, `.d.ts`
- **Runtime detection** - only static analysis via JSDoc, not runtime `console.warn` deprecations
