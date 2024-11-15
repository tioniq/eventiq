import { LazyEventDispatcher } from "../../src"
import { DisposableAction } from "@tioniq/disposiq"

describe("lazy dispatcher", () => {
  it("should subscribe to event only when needed", () => {
    let activated = false
    const dispatcher = new LazyEventDispatcher<number>((_) => {
      activated = true
      return new DisposableAction(() => {
        activated = false
      })
    })

    expect(activated).toBe(false)

    const observer = jest.fn()
    const disposable = dispatcher.subscribe(observer)

    expect(observer).not.toHaveBeenCalled()
    expect(activated).toBe(true)

    dispatcher.dispatch(42)

    expect(observer).toHaveBeenCalledWith(42)

    disposable.dispose()

    expect(dispatcher.hasSubscription).toBe(false)
    expect(activated).toBe(false)

    dispatcher.dispatch(42)

    expect(observer).toHaveBeenCalledTimes(1)
    expect(activated).toBe(false)
  })

  it("should not deactivate when there are still subscriptions", () => {
    let activated = false
    const dispatcher = new LazyEventDispatcher<number>((_) => {
      activated = true
      return new DisposableAction(() => {
        activated = false
      })
    })

    expect(activated).toBe(false)

    const observer1 = jest.fn()
    const observer2 = jest.fn()
    const disposable1 = dispatcher.subscribe(observer1)
    const disposable2 = dispatcher.subscribe(observer2)

    expect(activated).toBe(true)

    disposable1.dispose()

    expect(activated).toBe(true)

    disposable2.dispose()

    expect(activated).toBe(false)
  })
})
