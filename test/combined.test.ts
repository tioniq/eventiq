import { MutableVariable } from "../src"

describe("combined", () => {
  it("should combine variables", () => {
    const v1 = new MutableVariable("kek")
    const v2 = new MutableVariable(20)
    const combined = v1.with(v2)
    expect(combined.value).toEqual(["kek", 20])
    const receiver = jest.fn()
    const subscription = combined.subscribe(receiver)
    v1.value = "Tek"
    expect(receiver).toHaveBeenCalledTimes(2)
    expect(receiver).toHaveBeenCalledWith(["Tek", 20])
    v2.value = 40
    expect(receiver).toHaveBeenCalledTimes(3)
    expect(receiver).toHaveBeenCalledWith(["Tek", 40])
    subscription.dispose()
    v1.value = "Check"
    expect(receiver).toHaveBeenCalledTimes(3)
  })
})
