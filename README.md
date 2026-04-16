# depdet

Find `@deprecated` JSDoc usages in your JS/TS project and map them to their replacements.

- Scans your source **and** your `node_modules` types for `@deprecated` symbols.
- Extracts the replacement hint from both `{@link X}` and free-text ("Use `X` instead", "Replaced by `X`", "Prefer `X`").
- Outputs a pretty table, JSON (LLM-friendly), or Markdown (PR-friendly).
- Zero config. Respects your `.gitignore` and `tsconfig.json`, skips `@generated` files.

## Install / run

```sh
# no install
npx depretec
bunx depretec

# or pin it
bun add -D depretec
```

## Example: zod v4

`src/schema.ts`:

```ts
import { z } from 'zod'
export const Schema = z.object({
  email: z.string().email(),
  site: z.string().url(),
})
```

```sh
$ npx depretec
┌───────────────────┬─────────────────┬───┬─────────────┐
│ Location          │ Deprecated      │ → │ Replacement │
├───────────────────┼─────────────────┼───┼─────────────┤
│ src/schema.ts:3:21│ ZodString.email │ → │ z.email()   │
├───────────────────┼─────────────────┼───┼─────────────┤
│ src/schema.ts:4:20│ ZodString.url   │ → │ z.url()     │
└───────────────────┴─────────────────┴───┴─────────────┘
```

## Feed it to an LLM

```sh
npx depretec --format json | llm -s "Apply these replacements to the files."
```

## Options

```
Usage: depretec [paths...] [options]

Options:
  -f, --format <fmt>   pretty | json | md            (default: pretty)
  -p, --project <p>    path to tsconfig.json         (default: auto-detect)
      --include <g>    extra glob (repeatable)
      --exclude <g>    exclude glob (repeatable)
      --no-deps        only scan user source, skip node_modules
      --fail-on-found  exit 1 if any occurrence      (for CI)
  -h, --help
  -v, --version
```

Positional `paths` pick the project root (first path wins). Defaults to `cwd`.

## Programmatic API

```ts
import { scan } from 'depretec'

const report = await scan({ cwd: './my-project' })
for (const o of report.occurrences) {
  console.log(`${o.file}:${o.line} ${o.deprecation.qualifiedName} → ${o.deprecation.replacement ?? '?'}`)
}
```

## How it works

Two passes over a TypeScript Program built via [`ts-morph`](https://ts-morph.com):

1. **Collect** every declaration (`function`, `method`, `class`, `property`, `variable`, `type`, `interface`, `enum`, accessors) that carries a `@deprecated` JSDoc tag — both in your source and in dep `.d.ts`.
2. **Match** every identifier in your source against those declarations using the TypeScript type checker (follows re-exports, resolves property access through method chains like `z.string().email()`).

Replacement extraction tries, in order: `{@link X}` / `{@linkcode X}` / `{@linkplain X}`, then free-text heuristics (`use \`X\``, `replaced by \`X\``, `prefer \`X\``, and bareword variants).

## Non-goals (for now)

- Auto-fix / write files (planned for `--fix`).
- `.vue` / `.svelte` / `.astro`.
- Runtime deprecation detection.

## License

MIT
