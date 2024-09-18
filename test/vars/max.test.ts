import {MaxVariable, MutableVariable} from "../../src";

describe('max var', () => {
  it('should calculate max', () => {
    const vars = [new MutableVariable(1), new MutableVariable(2), new MutableVariable(3)]
    const max = new MaxVariable(vars)

    expect(max.value).toBe(3)

    vars[0].value = 4

    expect(max.value).toBe(4)

    vars[1].value = 5

    expect(max.value).toBe(5)
  })

  it('should notify on change', () => {
    const vars = [new MutableVariable(1), new MutableVariable(2), new MutableVariable(3)]
    const max = new MaxVariable(vars)
    const callback = jest.fn()

    max.subscribe(callback)

    expect(callback).toHaveBeenCalledTimes(1)

    vars[0].value = 4

    expect(callback).toHaveBeenCalledTimes(2)

    vars[1].value = 5

    expect(callback).toHaveBeenCalledTimes(3)
  })

  it('should not notify on same value', () => {
    const vars = [new MutableVariable(1), new MutableVariable(2), new MutableVariable(3)]
    const max = new MaxVariable(vars)
    const callback = jest.fn()

    max.subscribe(callback)

    expect(callback).toHaveBeenCalledTimes(1)

    vars[0].value = 4

    expect(callback).toHaveBeenCalledTimes(2)

    vars[0].value = 4

    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('should dispose subscription', () => {
    const vars = [new MutableVariable(1), new MutableVariable(2), new MutableVariable(3)]
    const max = new MaxVariable(vars)
    const callback = jest.fn()

    const subscription = max.subscribe(callback)

    subscription.dispose()

    vars[0].value = 4

    expect(callback).toHaveBeenCalledTimes(1)
  })
})