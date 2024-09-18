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

declare module './variable' {
  interface Variable<T> {
    /**
     * Subscribes to the variable. The callback can return a disposable object that will be disposed when a value is
     * changed or the subscription is disposed
     * @param callback the callback
     * @returns an object that can be used to unsubscribe
     */
    subscribeDisposable<T>(callback: Func<T, IDisposable>): DisposableCompat

    /**
     * Subscribes to the variable and calls the callback once if the condition is met
     * @param callback the callback
     * @param condition the condition
     * @returns an object that can be used to unsubscribe
     */
    subscribeOnceWhere(callback: Action<T>, condition: Func<T, boolean>): DisposableCompat

    /**
     * Maps the variable value to another value
     * @param mapper the mapper
     * @returns a new variable with the mapped value
     */
    map<TOutput>(mapper: Func<T, TOutput>): Variable<TOutput>

    /**
     * Creates a new variable that will return true if any of the variable values are true
     * @param other the other variable
     * @returns a new OR variable
     */
    or(this: Variable<boolean>, other: Variable<boolean>): Variable<boolean>

    /**
     * Creates a new variable that will return true if all the variable values are true
     * @param other the other variable
     * @returns a new AND variable
     */
    and(this: Variable<boolean>, other: Variable<boolean>): Variable<boolean>

    /**
     * Inverts the variable value. If the value is true, the new value will be false and vice versa
     * @returns a new variable with the inverted value
     */
    invert(this: Variable<boolean>): Variable<boolean>

    /**
     * Combines the variable with other variables
     * @param others the other variables
     * @returns a new variable with the combined values
     */
    with<O extends any[]>(...others: { [K in keyof O]: Variable<O[K]> }): Variable<[T, ...O]>

    /**
     * Maps the variable value to another value using the mapper that returns a new variable to subscribe
     * @param mapper the mapper that returns another variable to subscribe
     * @returns a new variable with the mapped value
     */
    switchMap<TResult>(mapper: SwitchMapMapper<T, TResult>): Variable<TResult>

    /**
     * Throttles the variable value changes
     * @param delay the delay in milliseconds
     * @returns a new variable with the throttled value
     */
    throttle<T>(delay: number): Variable<T>

    /**
     * Throttles the variable value changes
     * @param onUpdate the event observer that will be used to throttle the value changes
     * @returns a new variable with the throttled value
     */
    throttle<T>(onUpdate: EventObserver): Variable<T>

    /**
     * Streams the variable value to another mutable variable
     * @param receiver the receiver variable
     * @returns an object that can be used to unsubscribe
     */
    streamTo(receiver: MutableVariable<T>): DisposableCompat

    /**
     * Keeps the variable's subscription alive
     * @returns an object that can be used to stop the persistence
     */
    startPersistent(): DisposableCompat

    /**
     * Creates a new variable that will return the sum of the variable values
     * @param other the other variable or a value
     * @returns a new SUM variable
     */
    plus(this: Variable<number>, other: Variable<number> | number): Variable<number>

    /**
     * Creates a new variable that will return the difference of the variable values
     * @param other the other variable or a value
     * @returns a new SUM variable
     */
    minus(this: Variable<number>, other: Variable<number> | number): Variable<number>

    /**
     * Creates a new variable that will return the product of the variable values
     * @param other the other variable or a value
     * @returns a new MULTIPLY variable
     */
    multiply(this: Variable<number>, other: Variable<number> | number): Variable<number>

    /**
     * Creates a new variable that will return the quotient of the variable values
     * @param other the other variable or a value
     * @returns a new DIVIDE variable
     */
    divide(this: Variable<number>, other: Variable<number> | number): Variable<number>

    /**
     * Creates a new variable that will return the rounded value of the variable
     * @returns a new variable with the rounded value
     */
    round(this: Variable<number>): Variable<number>

    /**
     * Creates a new variable that will return true if the variable value is greater than the other value
     * @param other the other variable or a value
     * @returns a new variable with the comparison result
     */
    moreThan(this: Variable<number>, other: Variable<number> | number): Variable<boolean>

    /**
     * Creates a new variable that will return true if the variable value is less than the other value
     * @param other the other variable or a value
     * @returns a new variable with the comparison result
     */
    lessThan(this: Variable<number>, other: Variable<number> | number): Variable<boolean>

    /**
     * Creates a new variable that will return true if the variable value is greater or equal to the other value
     * @param other the other variable or a value
     * @returns a new variable with the comparison result
     */
    moreOrEqual(this: Variable<number>, other: Variable<number> | number): Variable<boolean>

    /**
     * Creates a new variable that will return true if the variable value is less or equal to the other value
     * @param other the other variable or a value
     * @returns a new variable with the comparison result
     */
    lessOrEqual(this: Variable<number>, other: Variable<number> | number): Variable<boolean>

    /**
     * Creates a new variable that will return true if the variable value is equal to the other value
     * @param other the other variable or a value
     * @returns a new variable with the comparison result
     */
    equal(other: Variable<T> | T): Variable<boolean>

    /**
     * Creates a new constant variable with the current value
     * @returns a new variable with the sealed value
     */
    sealed(): Variable<T>

    /**
     * Creates a new variable that will stream the variable value until the condition is met
     * @param condition the condition
     * @returns a new variable that will be sealed when the condition is met
     */
    sealWhen(condition: Func<T, boolean> | T): Variable<T>
  }
}

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
