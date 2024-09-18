import {MutableVariable} from "../src";

describe('base var', () => {
  it('should work base equalsTo method', () => {
    const var1 = new MutableVariable(1)

    expect(var1.equalTo(1)).toBe(true)
    expect(var1.equalTo(2)).toBe(false)

    var1.value = 2

    expect(var1.equalTo(1)).toBe(false)
    expect(var1.equalTo(2)).toBe(true)

    const var2 = new MutableVariable("test")

    expect(var2.equalTo("test")).toBe(true)
    expect(var2.equalTo("test2")).toBe(false)

    var2.value = "test2"

    expect(var2.equalTo("test")).toBe(false)
    expect(var2.equalTo("test2")).toBe(true)
  })

  it('should work base toString method', () => {
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
})