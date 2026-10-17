import { describe, expect, test } from 'bun:test'
import { resolve } from 'node:path'
import { loadProject } from '../src/project.ts'
import { collectDeprecations } from '../src/scanner.ts'

const fixture = resolve(import.meta.dirname, 'fixtures/custom-deprecated')

describe('collectDeprecations (custom-deprecated fixture)', () => {
  const project = loadProject({ cwd: fixture })
  const deprecations = collectDeprecations(project, true)
  const byName = new Map(deprecations.map((d) => [d.qualifiedName, d]))

  test('finds all 4 deprecated symbols', () => {
    expect(deprecations.length).toBe(5)
  })

  test('oldFn uses {@link} source', () => {
    const d = byName.get('oldFn')
    expect(d).toBeDefined()
    expect(d?.kind).toBe('function')
    expect(d?.replacement).toBe('newFn')
    expect(d?.replacementSource).toBe('link')
  })

  test('stale uses heuristic source', () => {
    const d = byName.get('stale')
    expect(d).toBeDefined()
    expect(d?.kind).toBe('variable')
    expect(d?.replacement).toBe('fresh')
    expect(d?.replacementSource).toBe('heuristic')
  })

  test('Legacy.oldMethod has qualified name', () => {
    const d = byName.get('Legacy.oldMethod')
    expect(d).toBeDefined()
    expect(d?.kind).toBe('method')
    expect(d?.replacement).toBe('Legacy.newMethod')
  })

  test('uncatalogued has no replacement', () => {
    const d = byName.get('uncatalogued')
    expect(d).toBeDefined()
    expect(d?.replacement).toBeNull()
    expect(d?.replacementSource).toBeNull()
  })
})
