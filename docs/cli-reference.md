# CLI Reference

## Usage

```sh
depdet [paths...] [options]
```

The first positional `path` sets the project root. Defaults to the current working directory.

## Options

| Flag | Short | Type | Default | Description |
|------|-------|------|---------|-------------|
| `--format` | `-f` | `pretty \| json \| md` | `pretty` | Output format |
| `--project` | `-p` | `string` | auto-detect | Path to `tsconfig.json` |
| `--include` | | `glob` | — | Extra glob to include (repeatable) |
| `--exclude` | | `glob` | — | Glob to exclude (repeatable) |
| `--no-deps` | | `boolean` | `false` | Skip `node_modules`, scan user source only |
| `--fail-on-found` | | `boolean` | `false` | Exit with code `1` if any occurrence found |
| `--help` | `-h` | | | Show help |
| `--version` | `-v` | | | Show version |

## Output formats

### `--format pretty` (default)

Human-readable table printed to stdout.

```sh
npx depretec
```

```
┌───────────────────┬─────────────────┬───┬─────────────┐
│ Location          │ Deprecated      │ → │ Replacement │
├───────────────────┼─────────────────┼───┼─────────────┤
│ src/schema.ts:3:21│ ZodString.email │ → │ z.email()   │
└───────────────────┴─────────────────┴───┴─────────────┘
```

### `--format json`

Machine-readable JSON — ideal for piping to LLMs or custom scripts.

```sh
npx depretec --format json
```

```json
{
  "occurrences": [
    {
      "file": "src/schema.ts",
      "line": 3,
      "column": 21,
      "deprecation": {
        "qualifiedName": "ZodString.email",
        "replacement": "z.email()"
      }
    }
  ]
}
```

### `--format md`

Markdown table — paste directly into PR descriptions or GitHub comments.

```sh
npx depretec --format md
```

## Examples

```sh
# scan current directory
npx depretec

# scan a specific package in a monorepo
npx depretec packages/core

# only your source, skip node_modules types
npx depretec --no-deps

# fail in CI if any deprecated APIs are used
npx depretec --fail-on-found

# output markdown for a PR description
npx depretec --format md >> pr-body.md

# pipe JSON to an LLM
npx depretec --format json | llm -s "Apply these replacements."

# use a non-standard tsconfig
npx depretec --project tsconfig.build.json
```
