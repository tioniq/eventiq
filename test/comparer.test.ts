import {
  arrayEqualityComparer, createVar,
  functionEqualityComparer,
  generalEqualityComparer,
  objectEqualityComparer, setDefaultEqualityComparer,
  simpleEqualityComparer,
  strictEqualityComparer,
} from "../src"
import ArrayLike = jasmine.ArrayLike

describe("default comparers", () => {
  it("strict comparer should compare values strictly", () => {
    const comparer = strictEqualityComparer

    expect(comparer(1, 1)).toBe(true)
    expect(comparer(1, 2)).toBe(false)
    expect(comparer("a", "a")).toBe(true)
    expect(comparer("a", "b")).toBe(false)
    expect(comparer(true, true)).toBe(true)
    expect(comparer(true, false)).toBe(false)
    expect(comparer(null, null)).toBe(true)
    expect(comparer(null, undefined)).toBe(false)
    expect(comparer<unknown>("1", 1)).toBe(false)
    expect(comparer<unknown>(1, "1")).toBe(false)
  })

  it("strict comparer should compare objects strictly", () => {
    const comparer = strictEqualityComparer
    const obj1 = {a: 1}
    const obj2 = {a: 1}

    expect(comparer(obj1, obj1)).toBe(true)
    expect(comparer(obj1, obj2)).toBe(false)
  })

  it("strict comparer should compare arrays strictly", () => {
    const comparer = strictEqualityComparer
    const arr1 = [1, 2, 3]
    const arr2 = [1, 2, 3]

    expect(comparer(arr1, arr1)).toBe(true)
    expect(comparer(arr1, arr2)).toBe(false)
  })

  it("strict comparer should compare functions strictly", () => {
    const comparer = strictEqualityComparer
    const fn1 = () => {
    }
    const fn2 = () => {
    }

    expect(comparer(fn1, fn1)).toBe(true)
    expect(comparer(fn1, fn2)).toBe(false)
  })

  it("simple comparer should not compare values strictly", () => {
    const comparer = simpleEqualityComparer

    expect(comparer(1, 1)).toBe(true)
    expect(comparer(1, 2)).toBe(false)
    expect(comparer("a", "a")).toBe(true)
    expect(comparer("a", "b")).toBe(false)
    expect(comparer(true, true)).toBe(true)
    expect(comparer<unknown>(true, "true")).toBe(false)
    expect(comparer(true, false)).toBe(false)
    expect(comparer(null, null)).toBe(true)
    expect(comparer(null, undefined)).toBe(true)
    expect(comparer<unknown>("1", 1)).toBe(true)
    expect(comparer<unknown>(1, "1")).toBe(true)
  })

  it("function comparer should compare functions strictly", () => {
    const comparer = functionEqualityComparer
    const fn1 = () => {
    }
    const fn2 = () => {
    }

    expect(comparer(fn1, fn1)).toBe(true)
    expect(comparer(fn1, fn2)).toBe(false)
  })

  it("should compare arrays", () => {
    const comparer = arrayEqualityComparer
    const arr1 = [1, 2, 3]
    const arr2 = [1, 2, 3]

    expect(comparer(arr1, arr2)).toBe(true)
  })

  it("should compare arrays with different lengths", () => {
    const comparer = arrayEqualityComparer
    const arr1 = [1, 2, 3]
    const arr2 = [1, 2]

    expect(comparer(arr1, arr2)).toBe(false)
  })

  it("should compare arrays with different values", () => {
    const comparer = arrayEqualityComparer
    const arr1 = [1, 2, 3]
    const arr2 = [1, 2, 4]

    expect(comparer(arr1, arr2)).toBe(false)
  })

  it("should compare array with itself", () => {
    const comparer = arrayEqualityComparer
    const arr1 = [1, 2, 3]

    expect(comparer(arr1, arr1)).toBe(true)
  })

  it("should compare null arrays", () => {
    const comparer = arrayEqualityComparer

    expect(
      comparer(
        null as unknown as ArrayLike<unknown>,
        null as unknown as ArrayLike<unknown>,
      ),
    ).toBe(true)

    expect(comparer(null as unknown as ArrayLike<unknown>, [1, 2, 3])).toBe(
      false,
    )

    expect(comparer([1, 2, 3], null as unknown as ArrayLike<unknown>)).toBe(
      false,
    )

    expect(
      comparer(
        undefined as unknown as ArrayLike<unknown>,
        [] as unknown as ArrayLike<unknown>,
      ),
    ).toBe(false)

    expect(comparer([], undefined as unknown as ArrayLike<unknown>)).toBe(false)
  })

  it("should compare objects", () => {
    const comparer = objectEqualityComparer
    const obj1 = {a: 1}
    const obj2 = {a: 1}

    expect(comparer(obj1, obj2)).toBe(true)
  })

  it("should compare objects with different keys", () => {
    const comparer = objectEqualityComparer
    const obj1 = {a: 1}
    const obj2 = {b: 1}

    expect(comparer<object>(obj1, obj2)).toBe(false)
  })

  it("should compare objects with different values", () => {
    const comparer = objectEqualityComparer
    const obj1 = {a: 1}
    const obj2 = {a: 2}

    expect(comparer(obj1, obj2)).toBe(false)
  })

  it("should compare null objects", () => {
    const comparer = objectEqualityComparer

    expect(comparer(null as unknown as object, null as unknown as object)).toBe(
      true,
    )

    expect(comparer(null as unknown as object, {a: 1})).toBe(false)

    expect(comparer({a: 1}, null as unknown as object)).toBe(false)

    expect(comparer(undefined as unknown as object, {} as object)).toBe(false)

    expect(comparer({}, undefined as unknown as object)).toBe(false)
  })

  it("should compare object with array", () => {
    const comparer = objectEqualityComparer
    const obj = {a: 1}
    const arr = [1]

    expect(comparer(obj, arr as object)).toBe(false)

    expect(comparer(arr as object, obj)).toBe(false)

    expect(comparer(arr as object, arr as object)).toBe(true)

    expect(comparer(obj, obj)).toBe(true)
  })

  it("should compare arrays as objects", () => {
    const comparer = objectEqualityComparer
    const arr1 = [1, 2, 3]
    const arr2 = [1, 2, 3]

    expect(comparer(arr1, arr2)).toBe(true)
  })

  it("should compare objects with undefined key and without key", () => {
    const comparer = objectEqualityComparer
    const obj1 = {a: 1}
    const obj2 = {a: 1, b: undefined}

    expect(comparer(obj1, obj2)).toBe(false)
  })

  it("should compare general values", () => {
    const comparer = generalEqualityComparer

    expect(comparer(1, 1)).toBe(true)
    expect(comparer(1, 2)).toBe(false)
    expect(comparer("a", "a")).toBe(true)
    expect(comparer("a", "b")).toBe(false)
    expect(comparer(true, true)).toBe(true)
    expect(comparer(true, false)).toBe(false)
    expect(comparer(null, null)).toBe(true)
    expect(comparer(null, undefined)).toBe(false)
    expect(comparer<unknown>("1", 1)).toBe(false)
    expect(comparer<unknown>(1, "1")).toBe(false)
    expect(comparer({a: 1}, {a: 1})).toBe(true)
    expect(comparer({a: 1}, {a: 2})).toBe(false)
    expect(comparer([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(comparer([1, 2, 3], [1, 2, 4])).toBe(false)
    expect(comparer({0: 100}, [100])).toBe(false)
    expect(comparer([100], {0: 100})).toBe(false)
    expect(
      comparer(
        () => {
        },
        () => {
        },
      ),
    ).toBe(false)
    const fn = jest.fn()
    expect(comparer(fn, fn)).toBe(true)
  })

  it("should set default equality comparer", () => {
    const point1 = new Point(1, 2)
    const point2 = new Point(1, 2)
    const variable = createVar(point1)
    const fn = jest.fn()
    const subscription = variable.subscribeSilent(fn)
    variable.value = point2

    expect(fn).toHaveBeenCalled()

    subscription.dispose()

    const pointComparer = (a: unknown, b: unknown) => {
      if (a === b) {
        return true
      }
      if (!a || !b) {
        return false
      }
      if (a instanceof Point && b instanceof Point) {
        return a.equals(b)
      }
      return simpleEqualityComparer(a, b)
    }
    setDefaultEqualityComparer(pointComparer)

    const point3 = new Point(1, 2)
    const point4 = new Point(1, 2)
    const variable2 = createVar(point3)
    const fn2 = jest.fn()
    const subscription2 = variable2.subscribeSilent(fn2)
    variable2.value = point4

    expect(fn2).not.toHaveBeenCalled()

    subscription2.dispose()
  })
})

class Point {
  constructor(public x: number, public y: number) {
  }

  equals(other: Point): boolean {
    return this.x === other.x && this.y === other.y
  }
}
