import { AndVariable, MutableVariable } from "../../src"

describe("and var", () => {
  it("should return true when all vars are true", () => {
    const var1 = new MutableVariable(true)
    const var2 = new MutableVariable(true)
    const and = new AndVariable([var1, var2])

    expect(and.value).toBe(true)

    var1.value = false

    expect(and.value).toBe(false)

    var2.value = false

    expect(and.value).toBe(false)

    var1.value = true

    expect(and.value).toBe(false)

    var2.value = true

    expect(and.value).toBe(true)
  })

  it("should notify subscribers when value is changed", () => {
    const var1 = new MutableVariable(true)
    const var2 = new MutableVariable(true)
    const and = new AndVariable([var1, var2])
    const fn = jest.fn()

    and.subscribe(fn)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(true)

    var1.value = false

    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith(false)

    var2.value = false

    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith(false)

    var1.value = true

    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith(false)

    var2.value = true

    expect(fn).toHaveBeenCalledTimes(3)
    expect(fn).toHaveBeenCalledWith(true)
  })

  it("should not notify subscriber when subscriber is disposed", () => {
    const var1 = new MutableVariable(true)
    const var2 = new MutableVariable(true)
    const and = new AndVariable([var1, var2])
    const fn = jest.fn()

    const disposable = and.subscribe(fn)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(true)

    disposable.dispose()

    var1.value = false

    expect(fn).toHaveBeenCalledTimes(1)
  })
})
