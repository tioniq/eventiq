import { EventObserver } from "./observer"
import type { Action, Func } from "../action"
import {
  DisposableAction,
  DisposableContainer,
  type DisposableLike,
  type Disposiq,
  toDisposable,
} from "@tioniq/disposiq"
import { LinkedActionChain } from "../linked-chain"

/**
 * A class that implements the EventObserver class in a lazy way. The implementation receives an activator function.
 * The activator will be activated only when there is at least one subscription. When the last subscription is disposed,
 * the activator will be deactivated. The activator can be reactivated when a new subscription is added.
 * <p>
 *   This class is useful when you need to activate some resources only when there are subscribers.
 *   subscribers.
 * </p>
 * @typeparam T - the type of the event value
 */
export class LazyEventDispatcher<T = void> extends EventObserver<T> {
  /**
   * @internal
   */
  private readonly _nodes = new LinkedActionChain<T>()

  /**
   * @internal
   */
  private readonly _subscription = new DisposableContainer()

  /**
   * @internal
   */
  private readonly _activator: Func<this, DisposableLike>

  constructor(activator: Func<LazyEventDispatcher<T>, DisposableLike>) {
    super()
    this._activator = activator
    this._nodes.onEmpty = () => this._deactivate()
  }

  /**
   * Checks if there are any subscriptions
   * @returns true if there are any subscriptions, false otherwise
   */
  get hasSubscription(): boolean {
    return this._nodes.hasAny
  }

  override subscribe(callback: Action<T>): Disposiq {
    let subscription: Disposiq
    if (this._nodes.empty) {
      subscription = this._nodes.add(callback)
      this._activate()
    } else {
      subscription = this._nodes.add(callback)
    }
    return subscription
  }

  /**
   * Dispatches the event to all subscribers
   * @param value the value of the event
   */
  dispatch(value: T): void {
    this._nodes.forEach(value)
  }

  /**
   * @internal
   */
  private _activate() {
    this._subscription.disposeCurrent()
    this._subscription.set(toDisposable(this._activator(this)))
  }

  /**
   * @internal
   */
  private _deactivate() {
    this._subscription.disposeCurrent()
  }
}
