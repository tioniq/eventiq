import { LinkedChain } from "../linked-chain"
import type { Action } from "../action"
import { functionEqualityComparer } from "../comparer"
import type { Disposiq } from "@tioniq/disposiq"
import { EventObserver } from "./observer"

/**
 * A class that implements the EventObserver class and provides the ability to dispatch events by calling the `dispatch`
 * method. The method `dispatch` will fire events and catch exceptions unlike {@link EventDispatcher}
 * @typeparam T - the type of the event value
 */
export class EventSafeDispatcher<T = void> extends EventObserver<T> {
  /**
   * @internal
   */
  private readonly _nodes = new LinkedChain<Action<T>>(functionEqualityComparer)

  override subscribe(action: Action<T>): Disposiq {
    return this._nodes.add(action)
  }

  /**
   * Dispatches the event to all subscribers safely
   * @param value the value of the event
   * @param onError error callback
   */
  dispatch(value: T, onError?: (e: unknown) => void): void {
    this._nodes.forEach((a) => {
      try {
        a(value)
      } catch (e) {
        onError?.(e)
      }
    })
  }

  /**
   * Checks if there are any subscriptions
   * @returns true if there are any subscriptions, false otherwise
   */
  get hasSubscriptions(): boolean {
    return this._nodes.hasAny
  }
}
