import {DisposableCompat} from "@tioniq/disposiq"
import {Func} from "./action"
import {EqualityComparer} from "./comparer"

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
  abstract subscribe(callback: Func<T, void>): DisposableCompat

  /**
   * Subscribes to the variable. The callback will not be called immediately after the subscription, only when the value
   * of the variable changes. You can unsubscribe by calling the `dispose` method of the returned object.
   * @param callback the callback that will be called every time the value of the variable changes
   * @returns an object that can be used to unsubscribe
   */
  abstract subscribeSilent(callback: Func<T, void>): DisposableCompat

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
