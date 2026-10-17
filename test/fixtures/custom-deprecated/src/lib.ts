/**
 * @deprecated Use {@link newFn} instead.
 */
export function oldFn(): number {
  return 1
}

export function newFn(): number {
  return 2
}

/**
 * @deprecated Use `fresh` instead.
 */
export const stale = 1

export const fresh = 2

export class Legacy {
  /**
   * @deprecated Replaced by `Legacy.newMethod`.
   */
  oldMethod(): void {}

  newMethod(): void {}
}

/**
 * @deprecated
 */
export function uncatalogued(): void {}

/**
 * @deprecated Pass a number instead.
 */
export function pick(value: string): string
export function pick(value: number): number
export function pick(value: string | number): string | number {
  return value
}
