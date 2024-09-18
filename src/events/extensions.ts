import {DisposableCompat, DisposableContainer, emptyDisposable} from "@tioniq/disposiq"
import {Action, Func} from "../action"
import {EventObserver} from "./observer"
import {Variable} from "../variable";
import {LazyEventDispatcher} from "./lazy";
import {EventDispatcher} from "./dispatcher";

declare module './observer' {
  interface EventObserver<T> {
    /**
     * Subscribes to the event observer. The callback will be called only once
     * @param callback the callback for the subscription
     * @returns an object that can be used to unsubscribe
     */
    subscribeOnce(callback: Action<T>): DisposableCompat

    /**
     * Subscribes to the event observer. The callback will be called only once when the condition is met
     * @param callback the callback for the subscription
     * @param condition the condition that must be met to call the callback
     * @returns an object that can be used to unsubscribe
     */
    subscribeOnceWhere(callback: Action<T>, condition: Func<T, boolean>): DisposableCompat

    /**
     * Subscribes to the event observer. The callback will be called every time the event is dispatched when the
     * condition is met
     * @param callback the callback for the subscription
     * @param condition the condition that must be met to call the callback
     * @returns an object that can be used to unsubscribe
     */
    subscribeWhere(callback: Action<T>, condition: Func<T, boolean>): DisposableCompat

    /**
     * Subscribes to the event observer. The callback will be called only when the condition variable is true
     * @param callback the callback for the subscription
     * @param condition the condition that must be met to call the callback
     * @returns an object that can be used to unsubscribe
     */
    subscribeOn(callback: Action<T>, condition: Variable<boolean>): DisposableCompat

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
  }
}

declare module './dispatcher' {
  interface EventDispatcher<T> {
    /**
     * Dispatches the event to all subscribers. If an error occurs while dispatching the event, it will be caught
     * @param value the value of the event
     */
    dispatchSafe(value: T): void
  }
}

EventObserver.prototype.subscribeOnce = function <T>(this: EventObserver<T>, callback: Action<T>): DisposableCompat {
  const subscription = new DisposableContainer()
  subscription.set(this.subscribe(value => {
    subscription.dispose()
    callback(value)
  }))
  return subscription
}

EventObserver.prototype.subscribeOnceWhere = function <T>(this: EventObserver<T>, callback: Action<T>, condition: Func<T, boolean>): DisposableCompat {
  const subscription = new DisposableContainer()
  subscription.set(this.subscribe(value => {
    if (!condition(value)) {
      return
    }
    subscription.dispose()
    callback(value)
  }))
  return subscription
}

EventObserver.prototype.subscribeWhere = function <T>(this: EventObserver<T>, callback: Action<T>, condition: Func<T, boolean>): DisposableCompat {
  return this.subscribe(value => {
    if (condition(value)) {
      callback(value)
    }
  })
}

EventObserver.prototype.subscribeOn = function <T>(this: EventObserver<T>, callback: Action<T>, condition: Variable<boolean>): DisposableCompat {
  return condition.subscribeDisposable(value => value ? this.subscribe(callback) : emptyDisposable)
}

EventObserver.prototype.map = function <T, TOutput>(this: EventObserver<T>, mapper: Func<T, TOutput>): EventObserver<TOutput> {
  return new LazyEventDispatcher(dispatcher => this.subscribe(value => dispatcher.dispatch(mapper(value))))
}

EventObserver.prototype.where = function <T>(this: EventObserver<T>, condition: Func<T, boolean>): EventObserver<T> {
  return new LazyEventDispatcher(dispatcher => this.subscribe(value => {
    if (condition(value)) {
      dispatcher.dispatch(value)
    }
  }))
}

EventDispatcher.prototype.dispatchSafe = function <T>(this: EventDispatcher<T>, value: T): void {
  try {
    this.dispatch(value)
  } catch (e) {
  }
}