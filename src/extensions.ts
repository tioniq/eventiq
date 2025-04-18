import type { Action, Func } from "./action"
import { Variable } from "./variable"
import {
  AndVariable,
  CombinedVariable,
  ConstantVariable,
  InvertVariable,
  MapVariable,
  type MutableVariable,
  OrVariable,
  SealVariable,
  SumVariable,
  type SwitchMapMapper,
  SwitchMapVariable,
  ThrottledVariable,
} from "./vars"
import {
  DisposableAction,
  DisposableContainer,
  type DisposableLike,
  type Disposiq,
  emptyDisposable,
  toDisposable,
} from "@tioniq/disposiq"
import type { EventObserver } from "./events"
import { noop } from "./noop"
import { createDelayDispatcher } from "./functions"
import { defaultEqualityComparer, type EqualityComparer, strictEqualityComparer } from "./comparer"
import { FuncVar } from "./aliases";

Variable.prototype.subscribeDisposable = function <T>(
  this: Variable<T>,
  callback: Func<T, DisposableLike | null | undefined>,
): Disposiq {
  const container = new DisposableContainer()
  const subscription = this.subscribe((v) => {
    container.disposeCurrent()
    container.set(toDisposable(callback(v)))
  })
  return new DisposableAction(() => {
    subscription.dispose()
    container.dispose()
  })
}

Variable.prototype.subscribeOnceWhere = function <T>(
  this: Variable<T>,
  callback: Action<T>,
  condition: Func<T, boolean>,
): Disposiq {
  const container = new DisposableContainer()
  container.set(
    this.subscribeSilent((v) => {
      if (!condition(v)) {
        return
      }
      container.dispose()
      callback(v)
    }),
  )
  const value = this.value
  if (!condition(value)) {
    return container
  }
  container.dispose()
  callback(value)
  return emptyDisposable
}

Variable.prototype.subscribeWhere = function <T>(
  this: Variable<T>,
  callback: Action<T>,
  condition: Func<T, boolean> | T,
  equalityComparer?: EqualityComparer<T>,
): Disposiq {
  if (typeof condition === "function") {
    return this.subscribe((v) => {
      if ((condition as Func<T, boolean>)(v)) {
        callback(v)
      }
    })
  }
  const comparer = equalityComparer ?? defaultEqualityComparer
  return this.subscribe((v) => {
    if (comparer(v, condition)) {
      callback(v)
    }
  })
}

Variable.prototype.map = function <T, TOutput>(
  this: Variable<T>,
  mapper: Func<T, TOutput>,
  equalityComparer?: EqualityComparer<TOutput>,
): Variable<TOutput> {
  return new MapVariable<T, TOutput>(this, mapper, equalityComparer)
}

Variable.prototype.or = function (
  this: Variable<boolean>,
  other: Variable<boolean>,
): Variable<boolean> {
  return new OrVariable([this, other])
}

Variable.prototype.and = function (
  this: Variable<boolean>,
  other: Variable<boolean>,
): Variable<boolean> {
  return new AndVariable([this, other])
}

Variable.prototype.invert = function (
  this: Variable<boolean>,
): Variable<boolean> {
  return new InvertVariable(this)
}

Variable.prototype.with = function <T, O extends unknown[]>(
  this: Variable<T>,
  ...others: { [K in keyof O]: Variable<O[K]> }
): Variable<[T, ...O]> {
  return new CombinedVariable<[T, ...O]>([this, ...others])
}

Variable.prototype.switchMap = function <TInput, TResult>(
  this: Variable<TInput>,
  mapper: SwitchMapMapper<TInput, TResult>,
  equalityComparer?: EqualityComparer<TResult>,
): Variable<TResult> {
  return new SwitchMapVariable<TInput, TResult>(this, mapper, equalityComparer)
}

Variable.prototype.throttle = function <T>(
  this: Variable<T>,
  delay: number | EventObserver,
  equalityComparer?: EqualityComparer<T>,
): Variable<T> {
  if (typeof delay === "number") {
    return new ThrottledVariable(
      this,
      createDelayDispatcher(delay),
      equalityComparer,
    )
  }
  return new ThrottledVariable(this, delay, equalityComparer)
}

Variable.prototype.streamTo = function <T>(
  this: Variable<T>,
  receiver: MutableVariable<T>,
): Disposiq {
  return this.subscribe((value) => {
    receiver.value = value
  })
}

Variable.prototype.startPersistent = function <T>(this: Variable<T>): Disposiq {
  return this.subscribeSilent(noop)
}

Variable.prototype.plus = function (
  this: Variable<number>,
  other: Variable<number> | number,
): Variable<number> {
  if (other instanceof Variable) {
    return new SumVariable([this, other])
  }
  return new MapVariable<number, number>(this, (v) => v + other)
}

Variable.prototype.minus = function (
  this: Variable<number>,
  other: Variable<number> | number,
): Variable<number> {
  if (other instanceof Variable) {
    return new SumVariable([
      this,
      new MapVariable<number, number>(other, (v) => -v),
    ])
  }
  return new MapVariable<number, number>(this, (v) => v - other)
}

Variable.prototype.multiply = function (
  this: Variable<number>,
  other: Variable<number> | number,
): Variable<number> {
  if (other instanceof Variable) {
    return this.with(other).map(([a, b]) => a * b)
  }
  return new MapVariable<number, number>(this, (v) => v * other)
}

Variable.prototype.divide = function (
  this: Variable<number>,
  other: Variable<number> | number,
): Variable<number> {
  if (other instanceof Variable) {
    return this.with(other).map(([a, b]) => a / b)
  }
  return new MapVariable<number, number>(this, (v) => v / other)
}

Variable.prototype.round = function (this: Variable<number>): Variable<number> {
  return new MapVariable<number, number>(this, Math.round)
}

Variable.prototype.moreThan = function (
  this: Variable<number>,
  other: Variable<number> | number,
): Variable<boolean> {
  if (other instanceof Variable) {
    return this.with(other).map(([a, b]) => a > b)
  }
  return new MapVariable<number, boolean>(this, (v) => v > other)
}

Variable.prototype.lessThan = function (
  this: Variable<number>,
  other: Variable<number> | number,
): Variable<boolean> {
  if (other instanceof Variable) {
    return this.with(other).map(([a, b]) => a < b)
  }
  return new MapVariable<number, boolean>(this, (v) => v < other)
}

Variable.prototype.moreOrEqual = function (
  this: Variable<number>,
  other: Variable<number> | number,
): Variable<boolean> {
  if (other instanceof Variable) {
    return this.with(other).map(([a, b]) => a >= b)
  }
  return new MapVariable<number, boolean>(this, (v) => v >= other)
}

Variable.prototype.lessOrEqual = function (
  this: Variable<number>,
  other: Variable<number> | number,
): Variable<boolean> {
  if (other instanceof Variable) {
    return this.with(other).map(([a, b]) => a <= b)
  }
  return new MapVariable<number, boolean>(this, (v) => v <= other)
}

Variable.prototype.equal = function <T>(
  this: Variable<T>,
  other: Variable<T> | T,
  equalityComparer?: EqualityComparer<T>,
): Variable<boolean> {
  const comparer = equalityComparer ?? defaultEqualityComparer
  if (other instanceof Variable) {
    return this.with(other).map(([a, b]) => comparer(a, b))
  }
  return new MapVariable<T, boolean>(this, (v) => comparer(v, other))
}

Variable.prototype.sealed = function <T>(this: Variable<T>): Variable<T> {
  return new ConstantVariable(this.value)
}

Variable.prototype.sealWhen = function <T>(
  this: Variable<T>,
  condition: Func<T, boolean> | T,
  equalityComparer?: EqualityComparer<T>,
): Variable<T> {
  const comparer = equalityComparer ?? defaultEqualityComparer
  const vary = new SealVariable(this, comparer)
  if (typeof condition === "function") {
    vary.subscribeOnceWhere((v) => vary.seal(v), condition as Func<T, boolean>)
    return vary
  }
  vary.subscribeOnceWhere(
    (v) => vary.seal(v),
    (v) => comparer(v, condition),
  )
  return vary
}

Variable.prototype.notifyOn = function <T>(
  this: Variable<T>,
  event: EventObserver,
): Variable<T> {
  return new FuncVar(vary => {
    const subscription1 = this.subscribe(v => {
      vary.setForce(v)
    })
    const subscription2 = event.subscribe(() => {
      vary.notify()
    })
    return new DisposableAction(() => {
      subscription1.dispose()
      subscription2.dispose()
    })
  }, () => this.value)
}

Variable.prototype.flat = function <R>(
  this: Variable<Array<Array<R>>>,
  equalityComparer?: EqualityComparer<Array<R>>
): Variable<Array<R>> {
  return new MapVariable<Array<Array<R>>, Array<R>>(this, v => v.flat(), equalityComparer)
}

Variable.prototype.join = function (
  this: Variable<Array<string>>,
  separator?: string
): Variable<string> {
  return new MapVariable<Array<string>, string>(this, v => v.join(separator), strictEqualityComparer)
}

// biome-ignore lint/complexity/noUselessEmptyExport: required for extensions
export {}
