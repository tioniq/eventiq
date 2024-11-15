import { MutableVariable, ThrottledVariable } from "../../src"
import { type EventObserver, LazyEventDispatcher } from "../../src"
import { DisposableAction } from "@tioniq/disposiq"

describe("throttled var", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.useRealTimers()
  })
  it("should throttle variable", () => {
    const var1 = new MutableVariable("test1")
    const throttled = new ThrottledVariable(
      var1,
      createIntervalObserverEvent(100),
    )
    const callback = jest.fn()
    throttled.subscribe(callback)

    expect(throttled.value).toBe("test1")
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenLastCalledWith("test1")

    var1.value = "test2"

    expect(callback).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(100)

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenLastCalledWith("test2")

    var1.value = "test3"

    expect(callback).toHaveBeenCalledTimes(2)

    jest.advanceTimersByTime(100)

    expect(callback).toHaveBeenCalledTimes(3)
    expect(callback).toHaveBeenLastCalledWith("test3")

    var1.value = "test4"

    expect(callback).toHaveBeenCalledTimes(3)

    var1.value = "test5"

    expect(callback).toHaveBeenCalledTimes(3)

    jest.advanceTimersByTime(100)

    expect(callback).toHaveBeenCalledTimes(4)
    expect(callback).toHaveBeenLastCalledWith("test5")
  })

  it("should dispose subscription", () => {
    const var1 = new MutableVariable("test1")
    const throttled = new ThrottledVariable(
      var1,
      createIntervalObserverEvent(100),
    )
    const callback = jest.fn()
    const subscription = throttled.subscribe(callback)

    expect(throttled.value).toBe("test1")
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenLastCalledWith("test1")

    var1.value = "test2"

    expect(callback).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(100)

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenLastCalledWith("test2")

    subscription.dispose()

    var1.value = "test3"

    expect(callback).toHaveBeenCalledTimes(2)

    jest.advanceTimersByTime(100)

    expect(callback).toHaveBeenCalledTimes(2)
  })

  it("should return exact value if no subscription", () => {
    const var1 = new MutableVariable("test1")
    const throttled = new ThrottledVariable(
      var1,
      createIntervalObserverEvent(100),
    )

    expect(throttled.value).toBe("test1")

    var1.value = "test2"

    expect(throttled.value).toBe("test2")

    jest.advanceTimersByTime(100)

    expect(throttled.value).toBe("test2")
  })
})

function createIntervalObserverEvent(time: number): EventObserver {
  return new LazyEventDispatcher((dispatcher) => {
    const interval = setInterval(() => {
      dispatcher.dispatch()
    }, time)
    return new DisposableAction(() => {
      clearInterval(interval)
    })
  })
}
