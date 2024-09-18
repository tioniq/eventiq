import {functionEqualityComparer, simpleEqualityComparer, strictEqualityComparer} from "../src";

describe('default comparers', () => {
  it('strict comparer should compare values strictly', () => {
    const comparer = strictEqualityComparer

    expect(comparer(1, 1)).toBe(true)
    expect(comparer(1, 2)).toBe(false)
    expect(comparer('a', 'a')).toBe(true)
    expect(comparer('a', 'b')).toBe(false)
    expect(comparer(true, true)).toBe(true)
    expect(comparer(true, false)).toBe(false)
    expect(comparer(null, null)).toBe(true)
    expect(comparer(null, undefined)).toBe(false)
    expect(comparer<any>('1', 1)).toBe(false)
    expect(comparer<any>(1, '1')).toBe(false)
  })

  it('strict comparer should compare objects strictly', () => {
    const comparer = strictEqualityComparer
    const obj1 = {a: 1}
    const obj2 = {a: 1}

    expect(comparer(obj1, obj1)).toBe(true)
    expect(comparer(obj1, obj2)).toBe(false)
  })

  it('strict comparer should compare arrays strictly', () => {
    const comparer = strictEqualityComparer
    const arr1 = [1, 2, 3]
    const arr2 = [1, 2, 3]

    expect(comparer(arr1, arr1)).toBe(true)
    expect(comparer(arr1, arr2)).toBe(false)
  })

  it('strict comparer should compare functions strictly', () => {
    const comparer = strictEqualityComparer
    const fn1 = () => {
    }
    const fn2 = () => {
    }

    expect(comparer(fn1, fn1)).toBe(true)
    expect(comparer(fn1, fn2)).toBe(false)
  })

  it('simple comparer should not compare values strictly', () => {
    const comparer = simpleEqualityComparer

    expect(comparer(1, 1)).toBe(true)
    expect(comparer(1, 2)).toBe(false)
    expect(comparer('a', 'a')).toBe(true)
    expect(comparer('a', 'b')).toBe(false)
    expect(comparer(true, true)).toBe(true)
    expect(comparer<any>(true, 'true')).toBe(false)
    expect(comparer(true, false)).toBe(false)
    expect(comparer(null, null)).toBe(true)
    expect(comparer(null, undefined)).toBe(true)
    expect(comparer<any>('1', 1)).toBe(true)
    expect(comparer<any>(1, '1')).toBe(true)
  })

  it('function comparer should compare functions strictly', () => {
    const comparer = functionEqualityComparer
    const fn1 = () => {
    }
    const fn2 = () => {
    }

    expect(comparer(fn1, fn1)).toBe(true)
    expect(comparer(fn1, fn2)).toBe(false)
  })
})