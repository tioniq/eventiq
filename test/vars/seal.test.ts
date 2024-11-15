import { MutableVariable, SealVariable } from "../../src"

describe("seal var", () => {
  it("should return source value until sealed", () => {
    const vary = new MutableVariable(1)
    const sealed = new SealVariable(vary)

    expect(sealed.value).toBe(1)

    vary.value = 2

    expect(sealed.value).toBe(2)

    sealed.seal()
    vary.value = 3

    expect(sealed.value).toBe(2)
  })

  it("should notify subscribers until sealed", () => {
    const vary = new MutableVariable(1)
    const sealed = new SealVariable(vary)
    const fn = jest.fn()

    sealed.subscribe(fn)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)

    vary.value = 2

    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith(2)

    sealed.seal()
    vary.value = 3

    expect(fn).toHaveBeenCalledTimes(2)
  })

  it("should return current value while subscribed and not sealed", () => {
    const vary = new MutableVariable(1)
    const sealed = new SealVariable(vary)
    const fn = jest.fn()

    sealed.subscribe(fn)

    expect(sealed.value).toBe(1)

    vary.value = 2

    expect(sealed.value).toBe(2)
  })

  it("should not notify subscribers when sealed", () => {
    const vary = new MutableVariable(1)
    const sealed = new SealVariable(vary)
    const fn = jest.fn()

    sealed.seal()
    sealed.subscribe(fn)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)

    vary.value = 2

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it("should return sealed value after sealing", () => {
    const vary = new MutableVariable(1)
    const sealed = new SealVariable(vary)

    sealed.seal(2)

    expect(sealed.value).toBe(2)

    vary.value = 3

    expect(sealed.value).toBe(2)
  })

  it("should notify subscribers after sealing", () => {
    const vary = new MutableVariable(1)
    const sealed = new SealVariable(vary)
    const fn = jest.fn()

    sealed.seal(2)
    sealed.subscribe(fn)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(2)

    vary.value = 3

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it("should dispose all subscriptions when sealed", () => {
    const vary = new MutableVariable(1)
    const sealed = new SealVariable(vary)
    const fn = jest.fn()

    const subscription = sealed.subscribe(fn)

    sealed.seal()

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)

    vary.value = 2

    expect(fn).toHaveBeenCalledTimes(1)

    subscription.dispose()

    vary.value = 3

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it("should dispose subscription before sealing", () => {
    const vary = new MutableVariable(1)
    const sealed = new SealVariable(vary)
    const fn = jest.fn()

    const subscription = sealed.subscribe(fn)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)

    subscription.dispose()

    vary.value = 2

    expect(fn).toHaveBeenCalledTimes(1)

    sealed.seal()

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it("should seal return false when already sealed", () => {
    const vary = new MutableVariable(1)
    const sealed = new SealVariable(vary)

    expect(sealed.seal()).toBe(true)
    expect(sealed.seal()).toBe(false)
  })

  it("should subscribe silent", () => {
    const vary = new MutableVariable(1)
    const sealed = new SealVariable(vary)
    const fn = jest.fn()

    const subscription = sealed.subscribeSilent(fn)

    expect(fn).toHaveBeenCalledTimes(0)

    vary.value = 2

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(2)

    subscription.dispose()

    vary.value = 3

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it("should subscribe silent do nothing when sealed", () => {
    const vary = new MutableVariable(1)
    const sealed = new SealVariable(vary)
    const fn = jest.fn()

    sealed.seal()
    const subscription = sealed.subscribeSilent(fn)

    expect(fn).toHaveBeenCalledTimes(0)

    vary.value = 2

    expect(fn).toHaveBeenCalledTimes(0)

    subscription.dispose()

    vary.value = 3

    expect(fn).toHaveBeenCalledTimes(0)
  })

  it("should equality comparer be the same as source's equality comparer", () => {
    const vary = new MutableVariable(1)
    const sealed = new SealVariable(vary)

    expect(sealed.equalityComparer).toBe(vary.equalityComparer)
  })
})
