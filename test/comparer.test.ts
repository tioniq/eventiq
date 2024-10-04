import {
  arrayEqualityComparer,
  functionEqualityComparer, generalEqualityComparer,
  objectEqualityComparer,
  simpleEqualityComparer,
  strictEqualityComparer
} from "../src";

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

  it('should compare arrays', () => {
    const comparer = arrayEqualityComparer
    const arr1 = [1, 2, 3]
    const arr2 = [1, 2, 3]

    expect(comparer(arr1, arr2)).toBe(true)
  })

  it('should compare arrays with different lengths', () => {
    const comparer = arrayEqualityComparer
    const arr1 = [1, 2, 3]
    const arr2 = [1, 2]

    expect(comparer(arr1, arr2)).toBe(false)
  })

  it('should compare arrays with different values', () => {
    const comparer = arrayEqualityComparer
    const arr1 = [1, 2, 3]
    const arr2 = [1, 2, 4]

    expect(comparer(arr1, arr2)).toBe(false)
  })

  it('should compare array with itself', () => {
    const comparer = arrayEqualityComparer
    const arr1 = [1, 2, 3]

    expect(comparer(arr1, arr1)).toBe(true)
  })

  it('should compare null arrays', () => {
    const comparer = arrayEqualityComparer

    expect(comparer(null as any, null as any)).toBe(true)

    expect(comparer(null as any, [1, 2, 3])).toBe(false)

    expect(comparer([1, 2, 3], null as any)).toBe(false)

    expect(comparer(undefined as any, [] as any)).toBe(false)

    expect(comparer([], undefined as any)).toBe(false)
  })

  it('should compare objects', () => {
    const comparer = objectEqualityComparer
    const obj1 = {a: 1}
    const obj2 = {a: 1}

    expect(comparer(obj1, obj2)).toBe(true)
  })

  it('should compare objects with different keys', () => {
    const comparer = objectEqualityComparer
    const obj1 = {a: 1}
    const obj2 = {b: 1}

    expect(comparer(obj1, obj2 as any)).toBe(false)
  })

  it('should compare objects with different values', () => {
    const comparer = objectEqualityComparer
    const obj1 = {a: 1}
    const obj2 = {a: 2}

    expect(comparer(obj1, obj2)).toBe(false)
  })

  it('should compare null objects', () => {
    const comparer = objectEqualityComparer

    expect(comparer(null as any, null as any)).toBe(true)

    expect(comparer(null as any, {a: 1})).toBe(false)

    expect(comparer({a: 1}, null as any)).toBe(false)

    expect(comparer(undefined as any, {} as any)).toBe(false)

    expect(comparer({}, undefined as any)).toBe(false)
  })

  it('should compare object with array', () => {
    const comparer = objectEqualityComparer
    const obj = {a: 1}
    const arr = [1]

    expect(comparer(obj, arr as any)).toBe(false)

    expect(comparer(arr as any, obj)).toBe(false)

    expect(comparer(arr as any, arr as any)).toBe(true)

    expect(comparer(obj, obj)).toBe(true)
  })

  it('should compare arrays as objects', () => {
    const comparer = objectEqualityComparer
    const arr1 = [1, 2, 3]
    const arr2 = [1, 2, 3]

    expect(comparer(arr1, arr2)).toBe(true)
  })

  it('should compare objects with undefined key and without key', () => {
    const comparer = objectEqualityComparer
    const obj1 = {a: 1}
    const obj2 = {a: 1, b: undefined}

    expect(comparer(obj1, obj2)).toBe(false)
  })

  it('should compare general values', () => {
    const comparer = generalEqualityComparer

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
    expect(comparer({a: 1}, {a: 1})).toBe(true)
    expect(comparer({a: 1}, {a: 2})).toBe(false)
    expect(comparer([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(comparer([1, 2, 3], [1, 2, 4])).toBe(false)
    expect(comparer({0: 100}, [100])).toBe(false)
    expect(comparer([100], {0: 100})).toBe(false)
    expect(comparer(() => {
    }, () => {
    })).toBe(false)
    const fn = jest.fn()
    expect(comparer(fn, fn)).toBe(true)
  })
})