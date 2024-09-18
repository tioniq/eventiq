import {MutableVariable} from "../../src";

describe('map var', () => {
  it('should map var', () => {
    const vary = new MutableVariable(1)
    const mapped = vary.map((v) => v * 2)

    expect(mapped.value).toBe(2)

    vary.value = 2

    expect(mapped.value).toBe(4)
  })

  it('should notify on change', () => {
    const vary = new MutableVariable(1)
    const mapped = vary.map((v) => v * 2)
    const callback = jest.fn()

    mapped.subscribe(callback)

    expect(callback).toHaveBeenCalledTimes(1)

    vary.value = 2

    expect(callback).toHaveBeenCalledTimes(2)

    vary.value = 0

    expect(callback).toHaveBeenCalledTimes(3)
  })

  it('should not notify on same value', () => {
    const vary = new MutableVariable(1)
    const mapped = vary.map((v) => v % 2)
    const callback = jest.fn()

    mapped.subscribe(callback)

    expect(callback).toHaveBeenCalledTimes(1)

    vary.value = 2

    expect(callback).toHaveBeenCalledTimes(2)

    vary.value = 4

    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('should dispose subscription', () => {
    const vary = new MutableVariable(1)
    const mapped = vary.map((v) => v * 2)
    const callback = jest.fn()

    const subscription = mapped.subscribe(callback)

    subscription.dispose()

    vary.value = 2

    expect(callback).toHaveBeenCalledTimes(1)
  })
})