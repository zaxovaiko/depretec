# Programmatic API

depdet exposes a `scan()` function for use in scripts, custom tooling, or editor integrations.

## Installation

```sh
npm add depretec
pnpm add depretec
bun add depretec
```

## `scan(options?)`

```ts
import { scan } from 'depretec'

const report = await scan({ cwd: './my-project' })
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `cwd` | `string` | `process.cwd()` | Project root to scan |
| `project` | `string` | auto-detect | Path to `tsconfig.json` |
| `include` | `string[]` | `[]` | Extra globs to include |
| `exclude` | `string[]` | `[]` | Globs to exclude |
| `deps` | `boolean` | `true` | Include `node_modules` type definitions |

### Return value

```ts
interface Report {
  occurrences: Occurrence[]
}

interface Occurrence {
  file: string
  line: number
  column: number
  deprecation: {
    qualifiedName: string
    replacement: string | null
    message: string | null
  }
}
```

## Examples

### List all deprecated usages

```ts
import { scan } from 'depretec'

const { occurrences } = await scan()

for (const o of occurrences) {
  const repl = o.deprecation.replacement ?? '(unknown)'
  console.log(`${o.file}:${o.line}  ${o.deprecation.qualifiedName} → ${repl}`)
}
```

### Fail a script if deprecated APIs are found

```ts
import { scan } from 'depretec'

const { occurrences } = await scan({ cwd: './packages/core' })

if (occurrences.length > 0) {
  console.error(`Found ${occurrences.length} deprecated API usages.`)
  process.exit(1)
}
```

### Filter to a specific package

```ts
import { scan } from 'depretec'

const { occurrences } = await scan({
  cwd: '.',
  include: ['packages/ui/src/**'],
  deps: false,
})
```
