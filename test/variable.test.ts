import { MutableVariable, type Variable } from "../src"

describe("base var", () => {
  it("should work base equalsTo method", () => {
    const var1 = new MutableVariable(1)

    expect(var1.value).toBe(1)
    expect(var1.value).not.toBe(2)

    var1.value = 2

    expect(var1.value).not.toBe(1)
    expect(var1.value).toBe(2)

    const var2 = new MutableVariable("test")

    expect(var2.value).toBe("test")
    expect(var2.value).not.toBe("test2")

    var2.value = "test2"

    expect(var2.value).not.toBe("test")
    expect(var2.value).toBe("test2")
  })

  it("should work base toString method", () => {
    const var1 = new MutableVariable(1)

    expect(var1.toString()).toBe("1")

    var1.value = 2

    expect(var1.toString()).toBe("2")

    const var2 = new MutableVariable("test")

    expect(var2.toString()).toBe("test")

    var2.value = "test2"

    expect(var2.toString()).toBe("test2")

    const var3 = new MutableVariable<null | undefined>(null)

    expect(var3.toString()).toBe("null")

    var3.value = undefined

    expect(var3.toString()).toBe("undefined")
  })

  it("should Variable be covariant", () => {
    const mVar: Variable<number> = new MutableVariable(10)

    const covariantVar: Variable<number | undefined | null | string> = mVar

    expect(covariantVar.toString()).toBe("10")
  })
})
