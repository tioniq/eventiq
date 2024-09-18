import {isVariable, isVariableOf, MutableVariable} from "../src";

describe('is var', () => {
  it('should check inheritance', () => {
    const var1 = new MutableVariable("test")

    expect(isVariable(var1)).toBe(true)

    const value1 = "test"

    expect(isVariable(value1)).toBe(false)

    const varLike = {
      value: "test",
      subscribe() {

      }
    }
    expect(isVariable(varLike)).toBe(false)
  })

  it('should check generic type', () => {
    const strVar = new MutableVariable("test")
    const numVar = new MutableVariable(1)
    const boolVar = new MutableVariable(true)

    expect(isVariableOf(strVar, "stringExampleValue")).toBe(true)
    expect(isVariableOf(strVar, 1)).toBe(false)
    expect(isVariableOf(strVar, (v): v is string => typeof v === "string")).toBe(true)
    expect(isVariableOf(strVar, (v): v is number => typeof v === "number")).toBe(false)
    expect(isVariableOf(strVar)).toBe(true)

    expect(isVariableOf(numVar, 1)).toBe(true)
    expect(isVariableOf(numVar, "stringExampleValue")).toBe(false)
    expect(isVariableOf(numVar, (v): v is number => typeof v === "number")).toBe(true)
    expect(isVariableOf(numVar, (v): v is string => typeof v === "string")).toBe(false)
    expect(isVariableOf(numVar)).toBe(true)

    expect(isVariableOf(boolVar, true)).toBe(true)
    expect(isVariableOf(boolVar, "stringExampleValue")).toBe(false)
    expect(isVariableOf(boolVar, (v): v is boolean => typeof v === "boolean")).toBe(true)
    expect(isVariableOf(boolVar, (v): v is string => typeof v === "string")).toBe(false)
    expect(isVariableOf(boolVar)).toBe(true)
  })

  it('should not check non-variable in isVariableOf', () => {
    const value1 = "test"

    expect(isVariableOf(value1)).toBe(false)

    const varLike = {
      value: "test",
      subscribe() {

      }
    }
    expect(isVariableOf(varLike)).toBe(false)

    expect(isVariableOf(varLike, () => true)).toBe(false)
  })
})