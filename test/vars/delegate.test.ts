import { DelegateVariable, MutableVariable } from "../../src"

describe("delegate var", () => {
  it("should return the same value", () => {
    const delegate = new DelegateVariable(1)

    expect(delegate.value).toBe(1)

    const source = new MutableVariable(2)
    delegate.setSource(source)

    expect(delegate.value).toBe(2)

    source.value = 3

    expect(delegate.value).toBe(3)
  })

  it("should follow source", () => {
    const source = new MutableVariable(1)
    const delegate = new DelegateVariable(source)

    expect(delegate.value).toBe(1)

    source.value = 2

    expect(delegate.value).toBe(2)

    const callback = jest.fn()
    delegate.subscribe(callback)

    source.value = 3

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(3)
  })

  it("should change source", () => {
    const source = new MutableVariable(1)
    const delegate = new DelegateVariable(source)

    expect(delegate.value).toBe(1)

    const source2 = new MutableVariable(2)
    delegate.setSource(source2)

    expect(delegate.value).toBe(2)

    source2.value = 3

    expect(delegate.value).toBe(3)

    source.value = 4

    expect(delegate.value).toBe(3)
  })

  it("should reset source", () => {
    const source = new MutableVariable(1)
    const delegate = new DelegateVariable(source)

    expect(delegate.value).toBe(1)

    delegate.setSource(null)

    expect(delegate.value).toBe(1)

    source.value = 2

    expect(delegate.value).toBe(1)
  })

  it("should notify value change on source change", () => {
    const source = new MutableVariable(1)
    const delegate = new DelegateVariable(source)
    const callback = jest.fn()
    delegate.subscribe(callback)

    source.value = 2

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(2)

    const source2 = new MutableVariable(3)
    delegate.setSource(source2)

    expect(callback).toHaveBeenCalledTimes(3)
    expect(callback).toHaveBeenCalledWith(3)
  })

  it("should remove source on dispose", () => {
    const source = new MutableVariable(1)
    const delegate = new DelegateVariable<number>()

    const disposable = delegate.setSource(source)

    expect(delegate.value).toBe(1)

    disposable.dispose()

    source.value = 2

    expect(delegate.value).toBe(1)
  })

  it("should not remove source on dispose if source changed", () => {
    const source = new MutableVariable(1)
    const delegate = new DelegateVariable<number>()

    const disposable = delegate.setSource(source)

    expect(delegate.value).toBe(1)

    const source2 = new MutableVariable(2)
    delegate.setSource(source2)

    disposable.dispose()

    source2.value = 3

    expect(delegate.value).toBe(3)
  })

  it("should return default value if not source", () => {
    const delegate = new DelegateVariable<number>()

    expect(delegate.value).toBe(null)

    const delegate2 = new DelegateVariable<number>(10)

    expect(delegate2.value).toBe(10)
  })

  it("should dispatch default value if not source", () => {
    const delegate = new DelegateVariable<number>()

    const callback = jest.fn()
    delegate.subscribe(callback)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(null)
  })

  it("should not notify callback on dispose", () => {
    const source = new MutableVariable(1)
    const delegate = new DelegateVariable(source)
    const fn = jest.fn()

    const disposable = delegate.subscribe(fn)

    disposable.dispose()

    source.value = 2

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it("should not notify callback on dispose when was no source", () => {
    const delegate = new DelegateVariable<number>()
    const fn = jest.fn()

    const disposable = delegate.subscribe(fn)

    disposable.dispose()

    expect(fn).toHaveBeenCalledTimes(1)

    delegate.setSource(new MutableVariable(1))
  })
})
