import {EventDispatcher, EventObserver} from "../../src/events";
import {MutableVariable} from "../../src";

describe('extensions.subscribeOnce', () => {
  it('should subscribe only for the next event', () => {
    const dispatcher = new EventDispatcher<number>()
    const observer: EventObserver<number> = dispatcher
    const callback = jest.fn()

    observer.subscribeOnce(callback)
    dispatcher.dispatch(1)
    dispatcher.dispatch(2)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(1)
  })

  it('should not call callback after subscription dispose', () => {
    const dispatcher = new EventDispatcher<number>()
    const observer: EventObserver<number> = dispatcher
    const callback = jest.fn()

    const subscription = observer.subscribeOnce(callback)
    subscription.dispose()
    dispatcher.dispatch(1)

    expect(callback).not.toHaveBeenCalled()
  })
})

describe('extensions.subscribeOnceWhere', () => {
  it('should subscribe only for the next event that satisfies the condition', () => {
    const dispatcher = new EventDispatcher<number>()
    const observer: EventObserver<number> = dispatcher
    const callback = jest.fn()

    observer.subscribeOnceWhere(callback, value => value > 0)
    dispatcher.dispatch(-1)
    dispatcher.dispatch(1)
    dispatcher.dispatch(2)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(1)
  })

  it('should not call callback after subscription dispose', () => {
    const dispatcher = new EventDispatcher<number>()
    const observer: EventObserver<number> = dispatcher
    const callback = jest.fn()

    const subscription = observer.subscribeOnceWhere(callback, value => value > 0)
    subscription.dispose()
    dispatcher.dispatch(1)

    expect(callback).not.toHaveBeenCalled()
  })
})

describe('extensions.subscribeWhere', () => {
  it('should subscribe only for events that satisfy the condition', () => {
    const dispatcher = new EventDispatcher<number>()
    const observer: EventObserver<number> = dispatcher
    const callback = jest.fn()

    observer.subscribeWhere(callback, value => value > 0)
    dispatcher.dispatch(-1)
    dispatcher.dispatch(1)
    dispatcher.dispatch(2)

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(1)
    expect(callback).toHaveBeenCalledWith(2)
  })

  it('should not call callback after subscription dispose', () => {
    const dispatcher = new EventDispatcher<number>()
    const observer: EventObserver<number> = dispatcher
    const callback = jest.fn()

    const subscription = observer.subscribeWhere(callback, value => value > 0)
    subscription.dispose()
    dispatcher.dispatch(1)

    expect(callback).not.toHaveBeenCalled()
  })
})

describe('extensions.subscribeOn', () => {
  it('should subscribe only when condition is true', () => {
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

  it('should not call callback after subscription dispose', () => {
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

describe('extensions.map', () => {
  it('should map event values', () => {
    const dispatcher = new EventDispatcher<number>()
    const observer: EventObserver<number> = dispatcher
    const callback = jest.fn()

    observer.map(value => value * 2).subscribe(callback)
    dispatcher.dispatch(1)
    dispatcher.dispatch(2)

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(2)
    expect(callback).toHaveBeenCalledWith(4)
  })
})

describe('extensions.where', () => {
  it('should filter event values', () => {
    const dispatcher = new EventDispatcher<number>()
    const observer: EventObserver<number> = dispatcher
    const callback = jest.fn()

    observer.where(value => value > 0).subscribe(callback)
    dispatcher.dispatch(-1)
    dispatcher.dispatch(1)
    dispatcher.dispatch(2)

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(1)
    expect(callback).toHaveBeenCalledWith(2)
  })
})

describe('extensions.dispatchSafe', () => {
  it('should not throw an error when dispatching', () => {
    const dispatcher = new EventDispatcher<number>()
    dispatcher.subscribe(() => {
      throw new Error('Error')
    })
    expect(() => dispatcher.dispatchSafe(1)).not.toThrow()
  })
})