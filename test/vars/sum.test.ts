import { MutableVariable, SumVariable } from "../../src"

describe("sum var", () => {
  it("should calc sum of numbers", () => {
    const var1 = new MutableVariable(1)
    const var2 = new MutableVariable(2)
    const sum = new SumVariable([var1, var2])

    expect(sum.value).toBe(3)

    var1.value = 3

    expect(sum.value).toBe(5)

    var2.value = 4

    expect(sum.value).toBe(7)
  })

  it("should calc sum of booleans", () => {
    const var1 = new MutableVariable(true)
    const var2 = new MutableVariable(false)
    const sum = new SumVariable([var1, var2])

    expect(sum.value).toBe(1)

    var1.value = false

    expect(sum.value).toBe(0)

    var2.value = true

    expect(sum.value).toBe(1)

    var1.value = true
    var2.value = true

    expect(sum.value).toBe(2)
  })

  it("should notify about changes", () => {
    const var1 = new MutableVariable(1)
    const var2 = new MutableVariable(2)
    const sum = new SumVariable([var1, var2])

    const callback = jest.fn()

    sum.subscribe(callback)
    var1.value = 3

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenNthCalledWith(1, 3)

    var2.value = 4

    expect(callback).toHaveBeenCalledTimes(3)
    expect(callback).toHaveBeenCalledWith(7)
  })

  it("should not notify about changes after subscription dispose", () => {
    const var1 = new MutableVariable(1)
    const var2 = new MutableVariable(2)
    const sum = new SumVariable([var1, var2])

    const callback = jest.fn()

    const subscription = sum.subscribe(callback)
    var1.value = 3

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenNthCalledWith(1, 3)

    subscription.dispose()

    var2.value = 4

    expect(callback).toHaveBeenCalledTimes(2)
  })
})
