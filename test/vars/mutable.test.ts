import {MutableVariable} from "../../src";

describe('mutable var', () => {
  it('should be able to change the value of a variable', () => {
    const variable = new MutableVariable(1)

    expect(variable.value).toBe(1)

    variable.value = 2

    expect(variable.value).toBe(2)
  })

  it('should notify subscribers when value is changed', () => {
    const variable = new MutableVariable(1)
    const fn = jest.fn()

    variable.subscribe(fn)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)

    variable.value = 2

    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith(2)
  })

  it('should not notify subscribers when value is changed to the same value', () => {
    const variable = new MutableVariable(1)
    const fn = jest.fn()

    variable.subscribe(fn)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)

    variable.value = 1

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should not notify subscribers when value is changed silently', () => {
    const variable = new MutableVariable(1)
    const fn = jest.fn()

    variable.subscribe(fn)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)

    variable.setSilent(2)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)
  })

  it('should notify subscribers when notify is called', () => {
    const variable = new MutableVariable(1)
    const fn = jest.fn()

    variable.subscribe(fn)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)

    variable.notify()

    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith(1)
  })

  it('should not call callback when subscribing silently', () => {
    const variable = new MutableVariable(1)
    const fn = jest.fn()

    variable.subscribeSilent(fn)

    expect(fn).not.toHaveBeenCalled()
  })

  it('should call callback when subscribing silently and value is changed', () => {
    const variable = new MutableVariable(1)
    const fn = jest.fn()

    variable.subscribeSilent(fn)

    expect(fn).not.toHaveBeenCalled()

    variable.value = 2

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(2)
  })
});