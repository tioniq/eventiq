import { EventDispatcher, type EventObserver } from "../../src"
import { MutableVariable } from "../../src"

describe("extensions.subscribeOnce", () => {
  it("should subscribe only for the next event", () => {
    const dispatcher = new EventDispatcher<number>()
    const observer: EventObserver<number> = dispatcher
    const callback = jest.fn()

    observer.subscribeOnce(callback)
    dispatcher.dispatch(1)
    dispatcher.dispatch(2)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(1)
  })

  it("should not call callback after subscription dispose", () => {
    const dispatcher = new EventDispatcher<number>()
    const observer: EventObserver<number> = dispatcher
    const callback = jest.fn()

    const subscription = observer.subscribeOnce(callback)
    subscription.dispose()
    dispatcher.dispatch(1)

    expect(callback).not.toHaveBeenCalled()
  })
})

describe("extensions.subscribeOnceWhere", () => {
  it("should subscribe only for the next event that satisfies the condition", () => {
    const dispatcher = new EventDispatcher<number>()
    const observer: EventObserver<number> = dispatcher
    const callback = jest.fn()

    observer.subscribeOnceWhere(callback, (value) => value > 0)
    dispatcher.dispatch(-1)
    dispatcher.dispatch(1)
    dispatcher.dispatch(2)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(1)
  })

  it("should not call callback after subscription dispose", () => {
    const dispatcher = new EventDispatcher<number>()
    const observer: EventObserver<number> = dispatcher
    const callback = jest.fn()

    const subscription = observer.subscribeOnceWhere(
      callback,
      (value) => value > 0,
    )
    subscription.dispose()
    dispatcher.dispatch(1)

    expect(callback).not.toHaveBeenCalled()
  })
})

describe("extensions.subscribeWhere", () => {
  it("should subscribe only for events that satisfy the condition", () => {
    const dispatcher = new EventDispatcher<number>()
    const observer: EventObserver<number> = dispatcher
    const callback = jest.fn()

    observer.subscribeWhere(callback, (value) => value > 0)
    dispatcher.dispatch(-1)
    dispatcher.dispatch(1)
    dispatcher.dispatch(2)

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(1)
    expect(callback).toHaveBeenCalledWith(2)
  })

  it("should not call callback after subscription dispose", () => {
    const dispatcher = new EventDispatcher<number>()
    const observer: EventObserver<number> = dispatcher
    const callback = jest.fn()

    const subscription = observer.subscribeWhere(callback, (value) => value > 0)
    subscription.dispose()
    dispatcher.dispatch(1)

    expect(callback).not.toHaveBeenCalled()
  })
})

describe("extensions.subscribeOn", () => {
  it("should subscribe only when condition is true", () => {
    const dispatcher = new EventDispatcher<number>()
    const observer: EventObserver<number> = dispatcher
    const callback = jest.fn()
    const condition = new MutableVariable(false)

    observer.subscribeOn(callback, condition)
    dispatcher.dispatch(1)
    condition.value = true
    dispatcher.dispatch(2)
    condition.value = false
    dispatcher.dispatch(3)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(2)
  })

  it("should not call callback after subscription dispose", () => {
    const dispatcher = new EventDispatcher<number>()
    const observer: EventObserver<number> = dispatcher
    const callback = jest.fn()
    const condition = new MutableVariable(false)

    const subscription = observer.subscribeOn(callback, condition)
    subscription.dispose()
    dispatcher.dispatch(1)
    condition.value = true
    dispatcher.dispatch(2)

    expect(callback).not.toHaveBeenCalled()
  })
})

describe('extensions.subscribeDisposable', () => {
  it("should not fail when return no subscription", () => {
    const dispatcher = new EventDispatcher<number>()
    const observer: EventObserver<number> = dispatcher
    const callback = jest.fn()

    observer.subscribeDisposable(() => {
      callback()
      return null
    })

    dispatcher.dispatch(1)

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it("should dispose the callback disposable when a new event is dispatched", () => {
    const dispatcher = new EventDispatcher<number>()
    const observer: EventObserver<number> = dispatcher
    const callback = jest.fn()
    const disposable = {
      dispose: jest.fn(),
    }

    observer.subscribeDisposable(() => {
      callback()
      return disposable
    })

    dispatcher.dispatch(1)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(disposable.dispose).toHaveBeenCalledTimes(0)

    dispatcher.dispatch(2)
    expect(callback).toHaveBeenCalledTimes(2)
    expect(disposable.dispose).toHaveBeenCalledTimes(1)
  })

  it("should dispose the callback disposable when the subscription is disposed", () => {
    const dispatcher = new EventDispatcher<number>()
    const observer: EventObserver<number> = dispatcher
    const callback = jest.fn()
    const disposable = {
      dispose: jest.fn(),
    }

    const subscription = observer.subscribeDisposable(() => {
      callback()
      return disposable
    })

    dispatcher.dispatch(1)

    expect(disposable.dispose).toHaveBeenCalledTimes(0)

    subscription.dispose()

    expect(disposable.dispose).toHaveBeenCalledTimes(1)
  })
})

describe("extensions.map", () => {
  it("should map event values", () => {
    const dispatcher = new EventDispatcher<number>()
    const observer: EventObserver<number> = dispatcher
    const callback = jest.fn()

    observer.map((value) => value * 2).subscribe(callback)
    dispatcher.dispatch(1)
    dispatcher.dispatch(2)

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(2)
    expect(callback).toHaveBeenCalledWith(4)
  })
})

describe("extensions.where", () => {
  it("should filter event values", () => {
    const dispatcher = new EventDispatcher<number>()
    const observer: EventObserver<number> = dispatcher
    const callback = jest.fn()

    observer.where((value) => value > 0).subscribe(callback)
    dispatcher.dispatch(-1)
    dispatcher.dispatch(1)
    dispatcher.dispatch(2)

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(1)
    expect(callback).toHaveBeenCalledWith(2)
  })
})

describe("extensions.awaited", () => {
  it("should await event values", async () => {
    const dispatcher = new EventDispatcher<number | Promise<number>>()
    const observer: EventObserver<number | Promise<number>> = dispatcher
    const callback = jest.fn()

    observer.awaited().subscribe(callback)
    dispatcher.dispatch(1)
    dispatcher.dispatch(2)

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(1)
    expect(callback).toHaveBeenCalledWith(2)

    dispatcher.dispatch(Promise.resolve(3))

    await Promise.resolve()

    expect(callback).toHaveBeenCalledTimes(3)
    expect(callback).toHaveBeenCalledWith(3)
  })

  it("should await event values when onRejection param is passed", async () => {
    const dispatcher = new EventDispatcher<number | Promise<number>>()
    const observer: EventObserver<number | Promise<number>> = dispatcher
    const callback = jest.fn()

    observer.awaited(() => {
    }).subscribe(callback)
    dispatcher.dispatch(1)
    dispatcher.dispatch(2)

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(1)
    expect(callback).toHaveBeenCalledWith(2)

    dispatcher.dispatch(Promise.resolve(3))

    await Promise.resolve()

    expect(callback).toHaveBeenCalledTimes(3)
    expect(callback).toHaveBeenCalledWith(3)
  })

  it("should call onRejection callback when a value is rejected", async () => {
    const dispatcher = new EventDispatcher<number | Promise<number>>()
    const observer: EventObserver<number | Promise<number>> = dispatcher
    const callback = jest.fn()
    const onRejection = jest.fn()

    const rejection = Promise.reject("Error")
    observer.awaited(onRejection).subscribe(callback)
    dispatcher.dispatch(rejection)

    await Promise.resolve()

    expect(callback).not.toHaveBeenCalled()
    expect(onRejection).toHaveBeenCalledTimes(1)
    expect(onRejection).toHaveBeenCalledWith("Error", rejection)
  })
})

describe("extensions.dispatchSafe", () => {
  it("should not throw an error when dispatching", () => {
    const dispatcher = new EventDispatcher<number>()
    dispatcher.subscribe(() => {
      throw new Error("Error")
    })
    expect(() => dispatcher.dispatchSafe(1)).not.toThrow()
  })
})
