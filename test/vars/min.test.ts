import {MinVariable, MutableVariable} from "../../src";

describe('min var', () => {
  it('should calculate min', () => {
    const vars = [new MutableVariable(1), new MutableVariable(2), new MutableVariable(3)]
    const max = new MinVariable(vars)

    expect(max.value).toBe(1)

    vars[0].value = -1

    expect(max.value).toBe(-1)

    vars[1].value = -100

    expect(max.value).toBe(-100)
  })

  it('should notify on change', () => {
    const vars = [new MutableVariable(1), new MutableVariable(3), new MutableVariable(2)]
    const max = new MinVariable(vars)
    const callback = jest.fn()

    max.subscribe(callback)

    expect(callback).toHaveBeenCalledTimes(1)

    vars[0].value = -2

    expect(callback).toHaveBeenCalledTimes(2)

    vars[1].value = -5

    expect(callback).toHaveBeenCalledTimes(3)
  })

  it('should not notify on same value', () => {
    const vars = [new MutableVariable(1), new MutableVariable(2), new MutableVariable(3)]
    const max = new MinVariable(vars)
    const callback = jest.fn()

    max.subscribe(callback)

    expect(callback).toHaveBeenCalledTimes(1)

    vars[0].value = -1

    expect(callback).toHaveBeenCalledTimes(2)

    vars[0].value = -1

    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('should dispose subscription', () => {
    const vars = [new MutableVariable(1), new MutableVariable(2), new MutableVariable(3)]
    const max = new MinVariable(vars)
    const callback = jest.fn()

    const subscription = max.subscribe(callback)

    subscription.dispose()

    vars[0].value = 0

    expect(callback).toHaveBeenCalledTimes(1)
  })
})