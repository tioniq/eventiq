import {EventDispatcher} from "../../src/events";

describe('dispatcher', () => {
  it('should dispatch event to all observers', () => {
    const dispatcher = new EventDispatcher<number>()
    const observer1 = jest.fn()
    const observer2 = jest.fn()
    dispatcher.subscribe(observer1)
    dispatcher.subscribe(observer2)

    dispatcher.dispatch(42)

    expect(observer1).toHaveBeenCalledWith(42)
    expect(observer2).toHaveBeenCalledWith(42)
  })

  it('should return true if has subscriptions', () => {
    const dispatcher = new EventDispatcher<number>()
    const observer = jest.fn()
    dispatcher.subscribe(observer)

    expect(dispatcher.hasSubscriptions).toBe(true)
  })

  it('should return false if has no subscriptions', () => {
    const dispatcher = new EventDispatcher<number>()

    expect(dispatcher.hasSubscriptions).toBe(false)
  })

  it('should return false if all subscriptions are disposed', () => {
    const dispatcher = new EventDispatcher<number>()
    const observer = jest.fn()
    const disposable = dispatcher.subscribe(observer)
    disposable.dispose()

    expect(dispatcher.hasSubscriptions).toBe(false)
  })

  it('should not dispatch event to disposed observer', () => {
    const dispatcher = new EventDispatcher<number>()
    const observer = jest.fn()
    const disposable = dispatcher.subscribe(observer)
    disposable.dispose()

    dispatcher.dispatch(42)

    expect(observer).not.toHaveBeenCalled()
  })

  it('should dispatch event to all observers except disposed', () => {
    const dispatcher = new EventDispatcher<number>()
    const observer1 = jest.fn()
    const observer2 = jest.fn()
    const disposable = dispatcher.subscribe(observer2)
    dispatcher.subscribe(observer1)
    disposable.dispose()

    dispatcher.dispatch(42)

    expect(observer1).toHaveBeenCalledWith(42)
    expect(observer2).not.toHaveBeenCalled()
  })
})