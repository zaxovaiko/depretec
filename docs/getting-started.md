# Getting Started

## Installation

Run without installing:

```sh
npx depretec
bunx depretec
```

Pin as a dev dependency:

```sh
npm add -D depretec
pnpm add -D depretec
bun add -D depretec
```

**Requirements:** Node.js ≥18 or Bun ≥1.1

## Quick example

Given this file using zod v3 APIs:

```ts
// src/schema.ts
import { z } from 'zod'

export const Schema = z.object({
  email: z.string().email(),
  site: z.string().url(),
})
```

Run depretec in your project root:

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

## Feed results to an LLM

```sh
npx depretec --format json | llm -s "Apply these replacements to the files."
```

## Use in CI

Block merges when deprecated APIs are detected:

```sh
npx depretec --fail-on-found
```

Exit code is `1` if any occurrences are found, `0` otherwise.

## Scan a subdirectory

```sh
npx depretec packages/core
```
