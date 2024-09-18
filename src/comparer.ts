export type EqualityComparer<T> = (a: T, b: T) => boolean

export function strictEqualityComparer<T>(a: T, b: T) {
  return a === b
}

export function simpleEqualityComparer<T>(a: T, b: T) {
  return a == b
}

export const defaultEqualityComparer = strictEqualityComparer

export function functionEqualityComparer(a: Function, b: Function): boolean {
  return a === b
}
