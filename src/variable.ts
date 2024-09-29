import {Disposiq, IDisposable} from "@tioniq/disposiq"
import {Action, Func} from "./action"
import {EqualityComparer} from "./comparer"
import {MutableVariable, SwitchMapMapper} from "./vars";
import {EventObserver} from "./events";

/**
 * Base Variable class. **All variables should extend this class**.
 * <p>
 * The general idea is that a **variable is a value that can be observed**. When the value changes, all subscribers are
 * notified. When we say 'changed', we mean that the value has changed according to the equality comparer. The default
 * equality comparer is the strict equality comparer.
 * </p>
 * <p>
 * You can subscribe to the variable using the `subscribe` or `subscribeSilent` methods.
 * The difference between them is that the **`subscribe` method will notify the subscriber immediately** after the
 * subscription, while the `subscribeSilent` method will not notify the subscriber immediately after the subscription.
 * </p>
 * @typeparam T - the type of the variable value
 */
export abstract class Variable<T> {
  /**
   * The current value of the variable
   */
  abstract get value(): T

  /**
   * The equality comparer used to compare the values of the variable
   */
  abstract get equalityComparer(): EqualityComparer<T>

  /**
   * Subscribes to the variable. The callback will be called immediately after the subscription and every time the value
   * of the variable changes. You can unsubscribe by calling the `dispose` method of the returned object.
   * @param callback the callback that will be called immediately after the subscription and every time the value of the
   * variable changes
   * @returns an object that can be used to unsubscribe
   */
  abstract subscribe(callback: Func<T, void>): Disposiq

  /**
   * Subscribes to the variable. The callback will not be called immediately after the subscription, only when the value
   * of the variable changes. You can unsubscribe by calling the `dispose` method of the returned object.
   * @param callback the callback that will be called every time the value of the variable changes
   * @returns an object that can be used to unsubscribe
   */
  abstract subscribeSilent(callback: Func<T, void>): Disposiq

  /**
   * Checks if the value of the variable is equal to the specified value
   * @param value the value to compare with
   * @returns true if the value of the variable is equal to the specified value, false otherwise
   */
  equalTo(value: T): boolean {
    return this.equalityComparer(this.value, value)
  }

  /**
   * Overload of the `toString` method. Returns the string representation of the value of the variable
   * @returns the string representation of the value of the variable
   */
  public toString(): string {
    const _value = this.value
    if (_value === null || _value === undefined) {
      return `${_value}`
    }
    return _value.toString()
  }

  /**
   * Overload of the `valueOf` method. Converts the variable to a primitive value, in this case, the value of the variable
   * @returns the primitive value of the variable
   */
  public valueOf(): T {
    return this.value
  }
}

/**
 * Variable extensions
 */
export interface Variable<T> {
  /**
   * Subscribes to the variable. The callback can return a disposable object that will be disposed when a value is
   * changed or the subscription is disposed
   * @param callback the callback
   * @returns an object that can be used to unsubscribe
   */
  subscribeDisposable(callback: Func<T, IDisposable>): Disposiq

  /**
   * Subscribes to the variable and calls the callback once if the condition is met
   * @param callback the callback
   * @param condition the condition
   * @returns an object that can be used to unsubscribe
   */
  subscribeOnceWhere(callback: Action<T>, condition: Func<T, boolean>): Disposiq

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
  streamTo(receiver: MutableVariable<T>): Disposiq

  /**
   * Keeps the variable's subscription alive
   * @returns an object that can be used to stop the persistence
   */
  startPersistent(): Disposiq

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
