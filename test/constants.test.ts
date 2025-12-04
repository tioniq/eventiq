import { emptyString, falseVar, nullVar, trueVar, undefinedVar, zeroVar } from "../src";

describe('constants', () => {
  it("should be null", () => {
    expect(nullVar.value).toBeNull()
  })

  it("should be undefined", () => {
    expect(undefinedVar.value).toBeUndefined()
  })

  it("should be true", () => {
    expect(trueVar.value).toBe(true)
  })

  it("should be false", () => {
    expect(falseVar.value).toBe(false)
  })

  it("should be zero", () => {
    expect(zeroVar.value).toBe(0)
  })

  it("should be empty string", () => {
    expect(emptyString.value).toBe("")
  })
})