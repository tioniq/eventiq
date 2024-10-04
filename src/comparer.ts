export type EqualityComparer<T> = (a: T, b: T) => boolean

export function strictEqualityComparer<T>(a: T, b: T) {
  return a === b
}

export function simpleEqualityComparer<T>(a: T, b: T) {
  return a == b
}

export var defaultEqualityComparer: EqualityComparer<any> = strictEqualityComparer

export function functionEqualityComparer(a: Function, b: Function): boolean {
  return a === b
}

export function generalEqualityComparer<T extends any>(a: T, b: T): boolean {
  if (a === b) {
    return true
  }
  const typeA = typeof a
  const typeB = typeof b
  if (typeA !== typeB) {
    return false
  }
  if (typeA === 'object') {
    return objectEqualityComparer(a as object, b as object)
  }
  if (typeA === 'function') {
    return functionEqualityComparer(a as Function, b as Function)
  }
  return simpleEqualityComparer(a, b)
}

export function objectEqualityComparer<T extends object>(a: T, b: T): boolean {
  if (a === b) {
    return true
  }
  if (!a || !b) {
    return false
  }
  let arrayA = Array.isArray(a)
  let arrayB = Array.isArray(b)
  if (arrayA !== arrayB) {
    return false
  }
  if (arrayA) {
    return arrayEqualityComparer(a as any[], b as any[])
  }
  const keysA = Object.keys(a) as Array<keyof T>
  const keysB = Object.keys(b) as Array<keyof T>
  if (keysA.length !== keysB.length) {
    return false
  }
  for (const key of keysA) {
    if (!keysB.includes(key)) {
      return false
    }
    const valueA = a[key]
    const valueB = b[key]
    if (!generalEqualityComparer(valueA, valueB)) {
      return false
    }
  }
  return true
}

export function arrayEqualityComparer<K, T extends ArrayLike<K>>(a: T, b: T): boolean {
  if (a === b) {
    return true
  }
  if (!a || !b) {
    return false
  }
  if (a.length !== b.length) {
    return false
  }
  for (let i = 0; i < a.length; ++i) {
    if (!generalEqualityComparer(a[i], b[i])) {
      return false
    }
  }
  return true
}