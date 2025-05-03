import { Variable } from "../variable"
import { defaultEqualityComparer, type EqualityComparer, } from "../comparer"
import type { Func } from "../action"
import { LinkedActionChain } from "../linked-chain"
import type { Disposiq } from "@tioniq/disposiq"
import type { IMutableVariable } from "../types";

/**
 * A class that implements the Variable class and provides the ability to change the value of the variable.
 * The value will be changed only if the new value is different from the old value (checked by the equality comparer)
 * @typeparam T - the type of the variable value
 */
export class MutableVariable<T> extends Variable<T> implements IMutableVariable<T> {
  /**
   * @internal
   */
  private readonly _chain = new LinkedActionChain<T>()

  /**
   * @internal
   */
  private readonly _equalityComparer: EqualityComparer<T>

  /**
   * @internal
   */
  private _value: T

  constructor(value: T, equalityComparer?: EqualityComparer<T>) {
    super()
    this._value = value
    this._equalityComparer = equalityComparer ?? defaultEqualityComparer
  }

  get value(): T {
    return this._value
  }

  /**
   * Sets the value of the variable. The value will be changed only if the new value is different from the old value
   * @param value the new value for the variable
   */
  set value(value: T) {
    if (this._equalityComparer(value, this._value)) {
      return
    }
    this._value = value
    this._chain.forEach(value)
  }

  /**
   * Returns the equality comparer used to compare the old and new values of the variable
   */
  get equalityComparer(): EqualityComparer<T> {
    return this._equalityComparer
  }

  subscribe(callback: Func<T, void>): Disposiq {
    const [disposable, added] = this._chain.addUnique(callback)
    if (added) {
      callback(this._value)
    }
    return disposable
  }

  subscribeSilent(callback: Func<T, void>): Disposiq {
    return this._chain.addUnique(callback)[0]
  }

  /**
   * Sets the value of the variable without notifying the subscribers
   * @param value the new value for the variable
   * @remarks Use this method only if you are sure what you are doing. Combine this method with the `notify` method
   */
  setSilent(value: T): void {
    this._value = value
  }

  /**
   * Notifies all subscribers about the change of the value forcibly
   * @remarks Use this method only if you are sure what you are doing. Combine this method with the `setSilent` method
   */
  notify(): void {
    this._chain.forEach(this._value)
  }
}
