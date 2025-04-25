import type { Action, Func } from "../action"
import type { CanBeDisposable, Disposiq } from "@tioniq/disposiq"
import type { Variable } from "../variable"

/**
 * A base class for event observers. **All event observers should extend this class**.
 * <p>
 *   The general idea is that an **event observer is an object that can be subscribed to**. When the event is
 *   dispatched, all subscribers are notified. You can subscribe to the event observer using the `subscribe` method.
 *   The callback will be called every time the event is dispatched. You can unsubscribe by calling the `dispose`
 *   method of the returned object
 * </p>
 */
export abstract class EventObserver<T = void> {
  /**
   * Subscribes to the event observer. The callback will be called every time the event is dispatched. You can
   * unsubscribe by calling the `dispose` method of the returned object
   * @param callback the callback for the subscription
   * @returns an object that can be used to unsubscribe
   */
  abstract subscribe(callback: Action<T>): Disposiq
}

/**
 * EventObserver extensions
 */
export interface EventObserver<T> {
  /**
   * Subscribes to the event observer. The callback will be called only once
   * @param callback the callback for the subscription
   * @returns an object that can be used to unsubscribe
   */
  subscribeOnce(callback: Action<T>): Disposiq

  /**
   * Subscribes to the event observer. The callback will be called only once when the condition is met
   * @param callback the callback for the subscription
   * @param condition the condition that must be met to call the callback
   * @returns an object that can be used to unsubscribe
   */
  subscribeOnceWhere(callback: Action<T>, condition: Func<T, boolean>): Disposiq

  /**
   * Subscribes to the event observer. The callback will be called every time the event is dispatched when the
   * condition is met
   * @param callback the callback for the subscription
   * @param condition the condition that must be met to call the callback
   * @returns an object that can be used to unsubscribe
   */
  subscribeWhere(callback: Action<T>, condition: Func<T, boolean>): Disposiq

  /**
   * Subscribes to the event observer. The callback will be called only when the condition variable is true
   * @param callback the callback for the subscription
   * @param condition the condition that must be met to call the callback
   * @returns an object that can be used to unsubscribe
   */
  subscribeOn(callback: Action<T>, condition: Variable<boolean>): Disposiq

  /**
   * Subscribes a callback function that can return a disposable resource, which will be automatically disposed of
   * when a new event is dispatched or when the subscription is disposed of.
   *
   * @param callback the callback for the subscription, which can return a disposable resource
   * @return an object that can be used to unsubscribe
   */
  subscribeDisposable(callback: Func<T, CanBeDisposable | null | undefined>): Disposiq

  /**
   * Maps the event observer to a new event observer with a different type
   * @param mapper the function that maps the value of the event observer to a new value
   * @returns the new event observer
   * @typeparam TOutput - the type of the new event observer
   */
  map<TOutput>(mapper: Func<T, TOutput>): EventObserver<TOutput>

  /**
   * Maps the event observer to a new by filtering the values
   * @param condition the condition that must be met to dispatch the event
   * @returns the new event observer
   */
  where(condition: Func<T, boolean>): EventObserver<T>

  /**
   * Maps the event observer to an awaited event observer. The observer will try to await every value and call the
   * onRejection callback if the value is rejected
   *
   * @param onRejection the callback that will be called when the value is rejected
   * @returns the awaited event observer
   * @typeparam T - the type of the event value. If the event value is a promise, the awaited event observer will
   *  await the promise and call the onRejection callback if the promise is rejected. If the event value is not a
   *  promise, the awaited event observer will trigger an event with the value
   */
  awaited(onRejection?: (error: unknown, value: T) => void): EventObserver<Awaited<T>>
}
