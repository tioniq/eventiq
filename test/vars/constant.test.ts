import {ConstantVariable} from "../../src";

describe('constant var', () => {
  it('should return the same value', () => {
    const constant = new ConstantVariable(1)

    expect(constant.value).toBe(1)
  })

  it('should not notify callback on subscribeSilent', () => {
    const constant = new ConstantVariable(1)
    const fn = jest.fn()

    constant.subscribeSilent(fn)

    expect(fn).toHaveBeenCalledTimes(0)
  })

  it('should notify callback on subscribe', () => {
    const constant = new ConstantVariable(1)
    const fn = jest.fn()

    constant.subscribe(fn)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)
  })

  it('should equality comparer return true', () => {
    const constant = new ConstantVariable(1)
    const comparer = constant.equalityComparer

    expect(comparer(1, 1)).toBe(true)
    expect(comparer(1, 2)).toBe(false)
    expect(comparer(1, -1)).toBe(false)
  })
})