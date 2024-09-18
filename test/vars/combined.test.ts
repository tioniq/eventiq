import {CombinedVariable, MutableVariable} from "../../src";

describe('combined var', () => {
  it('should return combined array value', () => {
    const var1 = new MutableVariable(1)
    const var2 = new MutableVariable(2)
    const combined = new CombinedVariable([var1, var2])

    expect(combined.value).toEqual([1, 2])

    var1.value = 7

    expect(combined.value).toEqual([7, 2])

    var2.value = 9

    expect(combined.value).toEqual([7, 9])
  })

  it('should throw an error when combined array is empty', () => {
    expect(() => new CombinedVariable([])).toThrow("No variables provided")
  })

  it('should notify subscribers when value is changed', () => {
    const var1 = new MutableVariable(1)
    const var2 = new MutableVariable(2)
    const combined = new CombinedVariable([var1, var2])
    const fn = jest.fn()

    combined.subscribe(fn)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith([1, 2])

    var1.value = 7

    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith([7, 2])

    var2.value = 9

    expect(fn).toHaveBeenCalledTimes(3)
    expect(fn).toHaveBeenCalledWith([7, 9])
  })
})