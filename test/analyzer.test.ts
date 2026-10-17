import { describe, expect, test } from 'bun:test'
import { resolve } from 'node:path'
import { findOccurrences } from '../src/analyzer.ts'
import { loadProject } from '../src/project.ts'

const fixture = resolve(import.meta.dirname, 'fixtures/custom-deprecated')

describe('findOccurrences (custom-deprecated fixture)', () => {
  const project = loadProject({ cwd: fixture })
  const occurrences = findOccurrences(project, true)
  const byName = occurrences.map((o) => o.deprecation.qualifiedName)

  test('finds usage of each deprecated symbol', () => {
    expect(byName).toContain('oldFn')
    expect(byName).toContain('stale')
    expect(byName).toContain('Legacy.oldMethod')
    expect(byName).toContain('uncatalogued')
  })

  test('no occurrences point at app.ts Legacy class usage without method', () => {
    const legacyOccurrences = occurrences.filter((o) => o.deprecation.qualifiedName === 'Legacy')
    expect(legacyOccurrences.length).toBe(0)
  })

  test('flags only calls that resolve to a deprecated overload', () => {
    const pickOccurrences = occurrences.filter((o) => o.deprecation.qualifiedName === 'pick')
    expect(pickOccurrences.map((o) => o.snippet)).toEqual(["const d = pick('one')"])
  })

  test('occurrences carry file + line + snippet', () => {
    occurrences.forEach((o) => {
      expect(o.file).toMatch(/app\.ts$/)
      expect(o.line).toBeGreaterThan(0)
      expect(o.column).toBeGreaterThan(0)
      expect(o.snippet.length).toBeGreaterThan(0)
    })
  })
})
