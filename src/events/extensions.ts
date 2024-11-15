import {
  DisposableContainer,
  type Disposiq,
  emptyDisposable,
} from "@tioniq/disposiq"
import type { Action, Func } from "../action"
import { EventObserver } from "./observer"
import type { Variable } from "../variable"
import { LazyEventDispatcher } from "./lazy"
import { EventDispatcher } from "./dispatcher"

EventObserver.prototype.subscribeOnce = function <T>(
  this: EventObserver<T>,
  callback: Action<T>,
): Disposiq {
  const subscription = new DisposableContainer()
  subscription.set(
    this.subscribe((value) => {
      subscription.dispose()
      callback(value)
    }),
  )
  return subscription
}

EventObserver.prototype.subscribeOnceWhere = function <T>(
  this: EventObserver<T>,
  callback: Action<T>,
  condition: Func<T, boolean>,
): Disposiq {
  const subscription = new DisposableContainer()
  subscription.set(
    this.subscribe((value) => {
      if (!condition(value)) {
        return
      }
      subscription.dispose()
      callback(value)
    }),
  )
  return subscription
}

EventObserver.prototype.subscribeWhere = function <T>(
  this: EventObserver<T>,
  callback: Action<T>,
  condition: Func<T, boolean>,
): Disposiq {
  return this.subscribe((value) => {
    if (condition(value)) {
      callback(value)
    }
  })
}

EventObserver.prototype.subscribeOn = function <T>(
  this: EventObserver<T>,
  callback: Action<T>,
  condition: Variable<boolean>,
): Disposiq {
  return condition.subscribeDisposable((value) =>
    value ? this.subscribe(callback) : emptyDisposable,
  )
}

EventObserver.prototype.map = function <T, TOutput>(
  this: EventObserver<T>,
  mapper: Func<T, TOutput>,
): EventObserver<TOutput> {
  return new LazyEventDispatcher((dispatcher) =>
    this.subscribe((value) => dispatcher.dispatch(mapper(value))),
  )
}

EventObserver.prototype.where = function <T>(
  this: EventObserver<T>,
  condition: Func<T, boolean>,
): EventObserver<T> {
  return new LazyEventDispatcher((dispatcher) =>
    this.subscribe((value) => {
      if (condition(value)) {
        dispatcher.dispatch(value)
      }
    }),
  )
}

EventDispatcher.prototype.dispatchSafe = function <T>(
  this: EventDispatcher<T>,
  value: T,
): void {
  try {
    this.dispatch(value)
  } catch (e) {}
}
