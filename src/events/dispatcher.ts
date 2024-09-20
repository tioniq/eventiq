import {LinkedChain} from "../linked-chain";
import {Action} from "../action";
import {functionEqualityComparer} from "../comparer";
import {DisposableCompat} from "@tioniq/disposiq";
import {EventObserver} from "./observer";

/**
 * A class that implements the EventObserver class and provides the ability to dispatch events by calling the `dispatch`
 * method
 * @typeparam T - the type of the event value
 */
export class EventDispatcher<T = void> extends EventObserver<T> {
  /**
   * @internal
   */
  private readonly _nodes = new LinkedChain<Action<T>>(functionEqualityComparer);

  override subscribe(action: Action<T>): DisposableCompat {
    return this._nodes.add(action);
  }

  /**
   * Dispatches the event to all subscribers
   * @param value the value of the event
   */
  dispatch(value: T): void {
    this._nodes.forEach(a => a(value));
  }

  /**
   * Checks if there are any subscriptions
   * @returns true if there are any subscriptions, false otherwise
   */
  get hasSubscriptions(): boolean {
    return this._nodes.hasAny
  }
}

/**
 * EventDispatcher extensions
 */
export interface EventDispatcher<T> {
  /**
   * Dispatches the event to all subscribers. If an error occurs while dispatching the event, it will be caught
   * @param value the value of the event
   */
  dispatchSafe(value: T): void
}