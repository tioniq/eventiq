import {DirectVariable} from "../../src"

describe('direct var', () => {
  it('should return the same value', () => {
    const direct = new DirectVariable(1)

    expect(direct.value).toBe(1)

    direct.value = 2

    expect(direct.value).toBe(2)
  })

  it('should notify callback even a new value is set and the value is the same as previous', () => {
    const direct = new DirectVariable(1)

    const callback = jest.fn()
    direct.subscribe(callback)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(1)

    direct.value = 1

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenLastCalledWith(1)
  })

  it('should not notify callback on silent set', () => {
    const direct = new DirectVariable(1)

    const callback = jest.fn()
    direct.subscribe(callback)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(1)

    direct.setSilent(1)

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should notify callback on notify', () => {
    const direct = new DirectVariable(1)

    const callback = jest.fn()
    direct.subscribe(callback)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(1)

    direct.notify()

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenLastCalledWith(1)

    direct.notify()

    expect(callback).toHaveBeenCalledTimes(3)
    expect(callback).toHaveBeenLastCalledWith(1)
  })

  it('should subscribeSilent', () => {
    const direct = new DirectVariable(1)

    const callback = jest.fn()
    direct.subscribeSilent(callback)

    expect(callback).toHaveBeenCalledTimes(0)

    direct.notify()

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should equalityComparer be the same as passed', () => {
    const equalityComparer = jest.fn((a, b) => a === b)
    const direct = new DirectVariable(1, equalityComparer)

    expect(direct.equalityComparer).toBe(equalityComparer)
  })
})