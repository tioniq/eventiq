import {MutableVariable} from "../../src"

describe('invert var', () => {
  it('should invert a var', () => {
    const boolVar = new MutableVariable(true)
    const invertVar = boolVar.invert()

    expect(invertVar.value).toBe(false)

    boolVar.value = false

    expect(invertVar.value).toBe(true)
  })

  it('should notify on change', () => {
    const boolVar = new MutableVariable(true)
    const invertVar = boolVar.invert()
    const callback = jest.fn()

    const subscription = invertVar.subscribe(callback)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenLastCalledWith(false)

    boolVar.value = false

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenLastCalledWith(true)

    subscription.dispose()
    boolVar.value = true

    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('should return current value if there is subscription', () => {
    const boolVar = new MutableVariable(true)
    const invertVar = boolVar.invert()
    const callback = jest.fn()

    invertVar.subscribe(callback)

    expect(invertVar.value).toBe(false)
  })

  it('should subscribeSilent work', () => {
    const boolVar = new MutableVariable(true)
    const invertVar = boolVar.invert()
    const callback = jest.fn()

    invertVar.subscribeSilent(callback)

    expect(callback).toHaveBeenCalledTimes(0)

    boolVar.value = false

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenLastCalledWith(true)
  })
})