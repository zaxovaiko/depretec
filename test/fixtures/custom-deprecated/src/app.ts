import { Legacy, oldFn, pick, stale, uncatalogued } from './lib.ts'

const a = oldFn()
const b = stale
const obj = new Legacy()
obj.oldMethod()
uncatalogued()
const c = pick(1)
const d = pick('one')
const e = [1].map(pick)

export { a, b, c, d, e, obj }
