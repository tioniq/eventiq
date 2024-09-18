import {Variable} from "../variable"
import {DisposableCompat} from "@tioniq/disposiq"
import {Action, Func} from "../action"
import {defaultEqualityComparer, EqualityComparer, functionEqualityComparer} from "../comparer"
import {LinkedChain} from "../linked-chain";

/**
 * A variable that can be changed by setting the value property. The 'direct' means that the change will not be checked
 * by the equality comparer
 */
export class DirectVariable<T> extends Variable<T> {
  /**
   * @internal
   */
  private readonly _chain = new LinkedChain<Action<T>>(functionEqualityComparer)

  /**
   * @internal
   */
  private readonly _equalityComparer: EqualityComparer<T>

  /**
   * @internal
   */
  private _value: T

  constructor(initialValue: T, equalityComparer?: EqualityComparer<T>) {
    super()
    this._value = initialValue
    this._equalityComparer = equalityComparer ?? defaultEqualityComparer
  }

  get value(): T {
    return this._value
  }

  /**
   * Sets the value of the variable and notifies all subscribers without checking the equality
   * @param value the new value for the variable
   */
  set value(value: T) {
    this._value = value
    this._chain.forEach(a => a(value))
  }

  get equalityComparer(): EqualityComparer<T> {
    return this._equalityComparer
  }

  subscribe(callback: Func<T, void>): DisposableCompat {
    const [disposable, added] = this._chain.addUnique(callback)
    if (added) {
      callback(this._value)
    }
    return disposable
  }

  subscribeSilent(callback: Func<T, void>): DisposableCompat {
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
    const value = this._value
    this._chain.forEach(a => a(value))
  }
}