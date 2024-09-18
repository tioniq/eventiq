import {EventDispatcher, EventObserver, merge} from "../../src/events";

describe('functions.merge', () => {
  it('should merge events', () => {
    const dispatcher1 = new EventDispatcher<number>()
    const dispatcher2 = new EventDispatcher<number>()
    const observer1: EventObserver<number> = dispatcher1
    const observer2: EventObserver<number> = dispatcher2
    const merged = merge(observer1, observer2)
    const callback = jest.fn()

    merged.subscribe(callback)
    dispatcher1.dispatch(1)
    dispatcher2.dispatch(2)

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(1)
    expect(callback).toHaveBeenCalledWith(2)
  })

  it('should dispose all subscriptions', () => {
    const dispatcher1 = new EventDispatcher<number>()
    const dispatcher2 = new EventDispatcher<number>()
    const observer1: EventObserver<number> = dispatcher1
    const observer2: EventObserver<number> = dispatcher2
    const merged = merge(observer1, observer2)
    const callback = jest.fn()

    const subscription = merged.subscribe(callback)
    subscription.dispose()
    dispatcher1.dispatch(1)
    dispatcher2.dispatch(2)

    expect(callback).not.toHaveBeenCalled()
  })
});