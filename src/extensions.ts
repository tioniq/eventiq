import {Action, Func} from "./action"
import {Variable} from "./variable"
import {
  ConstantVariable,
  MapVariable,
  MutableVariable,
  SealVariable,
  SumVariable,
  SwitchMapMapper,
  SwitchMapVariable
} from "./vars"
import {OrVariable} from "./vars"
import {AndVariable} from "./vars"
import {InvertVariable} from "./vars"
import {
  DisposableAction,
  DisposableCompat,
  DisposableContainer,
  emptyDisposable,
  IDisposable,
  toDisposable
} from "@tioniq/disposiq"
import {CombinedVariable} from "./vars"
import {ThrottledVariable} from "./vars";
import {EventObserver} from "./events";
import {noop} from "./noop";
import {createDelayDispatcher} from "./functions";

Variable.prototype.subscribeDisposable = function <T>(this: Variable<T>, callback: Func<T, IDisposable>): DisposableCompat {
  const container = new DisposableContainer()
  const subscription = this.subscribe(v => {
    container.disposeCurrent()
    container.set(toDisposable(callback(v)))
  })
  return new DisposableAction(() => {
    subscription.dispose()
    container.dispose()
  })
}

Variable.prototype.subscribeOnceWhere = function <T>(this: Variable<T>, callback: Action<T>, condition: Func<T, boolean>): DisposableCompat {
  const container = new DisposableContainer()
  container.set(this.subscribeSilent(v => {
    if (!condition(v)) {
      return
    }
    container.dispose()
    callback(v)
  }))
  const value = this.value
  if (!condition(value)) {
    return container
  }
  container.dispose()
  callback(value)
  return emptyDisposable
}

Variable.prototype.map = function <T, TOutput>(this: Variable<T>, mapper: Func<T, TOutput>): Variable<TOutput> {
  return new MapVariable<T, TOutput>(this, mapper)
}

Variable.prototype.or = function (this: Variable<boolean>, other: Variable<boolean>): Variable<boolean> {
  return new OrVariable([this, other])
}

Variable.prototype.and = function (this: Variable<boolean>, other: Variable<boolean>): Variable<boolean> {
  return new AndVariable([this, other])
}

Variable.prototype.invert = function (this: Variable<boolean>): Variable<boolean> {
  return new InvertVariable(this)
}

Variable.prototype.with = function <T, O extends any[]>(this: Variable<T>, ...others: { [K in keyof O]: Variable<O[K]> }): Variable<[T, ...O]> {
  return new CombinedVariable<[T, ...O]>([this, ...others])
}

Variable.prototype.switchMap = function <TInput, TResult>(this: Variable<TInput>, mapper: SwitchMapMapper<TInput, TResult>): Variable<TResult> {
  return new SwitchMapVariable<TInput, TResult>(this, mapper)
}

Variable.prototype.throttle = function <T>(this: Variable<T>, delay: number | EventObserver): Variable<T> {
  if (typeof delay === 'number') {
    return new ThrottledVariable(this, createDelayDispatcher(delay))
  } else {
    return new ThrottledVariable(this, delay)
  }
}

Variable.prototype.streamTo = function <T>(this: Variable<T>, receiver: MutableVariable<T>): DisposableCompat {
  return this.subscribe(value => receiver.value = value)
}

Variable.prototype.startPersistent = function <T>(this: Variable<T>): DisposableCompat {
  return this.subscribeSilent(noop)
}

Variable.prototype.plus = function (this: Variable<number>, other: Variable<number> | number): Variable<number> {
  if (other instanceof Variable) {
    return new SumVariable([this, other])
  }
  return new MapVariable<number, number>(this, v => v + other)
}

Variable.prototype.minus = function (this: Variable<number>, other: Variable<number> | number): Variable<number> {
  if (other instanceof Variable) {
    return new SumVariable([this, new MapVariable<number, number>(other, v => -v)])
  }
  return new MapVariable<number, number>(this, v => v - other)
}

Variable.prototype.multiply = function (this: Variable<number>, other: Variable<number> | number): Variable<number> {
  if (other instanceof Variable) {
    return this.with(other).map(([a, b]) => a * b)
  }
  return new MapVariable<number, number>(this, v => v * other)
}

Variable.prototype.divide = function (this: Variable<number>, other: Variable<number> | number): Variable<number> {
  if (other instanceof Variable) {
    return this.with(other).map(([a, b]) => a / b)
  }
  return new MapVariable<number, number>(this, v => v / other)
}

Variable.prototype.round = function (this: Variable<number>): Variable<number> {
  return new MapVariable<number, number>(this, Math.round)
}

Variable.prototype.moreThan = function (this: Variable<number>, other: Variable<number> | number): Variable<boolean> {
  if (other instanceof Variable) {
    return this.with(other).map(([a, b]) => a > b)
  }
  return new MapVariable<number, boolean>(this, v => v > other)
}

Variable.prototype.lessThan = function (this: Variable<number>, other: Variable<number> | number): Variable<boolean> {
  if (other instanceof Variable) {
    return this.with(other).map(([a, b]) => a < b)
  }
  return new MapVariable<number, boolean>(this, v => v < other)
}

Variable.prototype.moreOrEqual = function (this: Variable<number>, other: Variable<number> | number): Variable<boolean> {
  if (other instanceof Variable) {
    return this.with(other).map(([a, b]) => a >= b)
  }
  return new MapVariable<number, boolean>(this, v => v >= other)
}

Variable.prototype.lessOrEqual = function (this: Variable<number>, other: Variable<number> | number): Variable<boolean> {
  if (other instanceof Variable) {
    return this.with(other).map(([a, b]) => a <= b)
  }
  return new MapVariable<number, boolean>(this, v => v <= other)
}

Variable.prototype.equal = function <T>(this: Variable<T>, other: Variable<T> | T): Variable<boolean> {
  if (other instanceof Variable) {
    return this.with(other).map(([a, b]) => this.equalityComparer(a, b))
  }
  return new MapVariable<T, boolean>(this, v => this.equalityComparer(v, other))
}

Variable.prototype.sealed = function <T>(this: Variable<T>): Variable<T> {
  return new ConstantVariable(this.value)
}

Variable.prototype.sealWhen = function <T>(this: Variable<T>, condition: Func<T, boolean> | T): Variable<T> {
  const vary = new SealVariable(this)
  if (typeof condition === 'function') {
    vary.subscribeOnceWhere(v => vary.seal(v), condition as Func<T, boolean>)
    return vary
  }
  vary.subscribeOnceWhere(v => vary.seal(v), v => this.equalityComparer(v, condition))
  return vary
}

export {}