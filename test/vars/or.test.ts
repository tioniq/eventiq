import { OrVariable, MutableVariable } from "../../src"

describe("or var", () => {
  it("should return true when any var is true", () => {
    const var1 = new MutableVariable(false)
    const var2 = new MutableVariable(false)
    const or = new OrVariable([var1, var2])

    expect(or.value).toBe(false)

    var1.value = true

    expect(or.value).toBe(true)

    var2.value = true

    expect(or.value).toBe(true)

    var1.value = false

    expect(or.value).toBe(true)

    var2.value = false

    expect(or.value).toBe(false)
  })

  it("should notify subscribers when value is changed", () => {
    const var1 = new MutableVariable(false)
    const var2 = new MutableVariable(false)
    const or = new OrVariable([var1, var2])
    const fn = jest.fn()

    or.subscribe(fn)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(false)

    var1.value = true

    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith(true)

    var2.value = true

    expect(fn).toHaveBeenCalledTimes(2)

    var1.value = false

    expect(fn).toHaveBeenCalledTimes(2)

    var2.value = false

    expect(fn).toHaveBeenCalledTimes(3)
    expect(fn).toHaveBeenCalledWith(false)
  })

  it("should not notify subscriber when subscriber is disposed", () => {
    const var1 = new MutableVariable(false)
    const var2 = new MutableVariable(false)
    const or = new OrVariable([var1, var2])
    const fn = jest.fn()

    const subscription = or.subscribe(fn)

    subscription.dispose()

    var1.value = true

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(false)
  })
})
