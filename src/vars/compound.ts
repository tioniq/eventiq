import { Variable } from "../variable"
import { defaultEqualityComparer, type EqualityComparer, } from "../comparer"
import { LinkedActionChain } from "../linked-chain"
import type { Func } from "../action"
import { DisposableAction, type Disposiq } from "@tioniq/disposiq"

/**
 * A Variable class that is base for common compound variables. It provides a functionality to react on subscription
 * activation and deactivation. Most variables are extending this class
 * @typeparam T - the type of the variable value
 */
export abstract class CompoundVariable<T> extends Variable<T> {
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

  protected constructor(initValue: T, equalityComparer?: EqualityComparer<T>) {
    super()
    this._value = initValue
    this._equalityComparer = equalityComparer ?? defaultEqualityComparer
  }

  /**
   * Checks if there are any subscriptions
   * @returns true if there are any subscriptions, false otherwise
   */
  protected get active(): boolean {
    return this._chain.hasAny
  }

  get value(): T {
    if (this._chain.hasAny) {
      return this._value
    }
    return this.getExactValue()
  }

  /**
   * Sets the value of the variable. If the value is the same as the current value, the method will do nothing
   * @param value the new value of the variable
   * @protected internal use only
   */
  protected set value(value: T) {
    if (this._equalityComparer(value, this._value)) {
      return
    }
    this._value = value
    this._chain.forEach(value)
  }

  subscribe(callback: Func<T, void>): Disposiq {
    if (this._chain.empty) {
      this.activate()
    }
    const [disposable, added] = this._chain.addUnique(callback)
    if (added) {
      callback(this._value)
    }
    return new DisposableAction(() => {
      disposable.dispose()
      if (this._chain.empty) {
        this.deactivate()
      }
    })
  }

  subscribeSilent(callback: Func<T, void>): Disposiq {
    if (this._chain.empty) {
      this.activate()
    }
    const disposable = this._chain.addUnique(callback)[0]
    return new DisposableAction(() => {
      disposable.dispose()
      if (this._chain.empty) {
        this.deactivate()
      }
    })
  }

  /**
   * A method for activating functionality for the variable. It is called when at least one subscription is added
   * @protected internal use only
   */
  protected abstract activate(): void

  /**
   * A method for deactivating functionality for the variable. It is called when the last subscription is removed
   * @protected internal use only
   */
  protected abstract deactivate(): void

  /**
   * A method for getting the exact value of the variable. It is called when there are no subscriptions
   * @protected internal use only
   * @returns the default behavior is to return the current (last) value of the variable
   * @remarks this method should be implemented in the derived class
   */
  protected getExactValue(): T {
    return this._value
  }

  /**
   * A method for setting the value of the variable without notifying subscribers
   * @protected internal use only
   * @param value the new value of the variable
   * @deprecated user `setSilent` instead
   */
  protected setValueSilent(value: T): void {
    this._value = value
  }

  /**
   * A method for setting the value of the variable and notifying subscribers without checking the equality
   * @protected internal use only
   * @param value the new value of the variable
   * @deprecated user `setForce` instead
   */
  protected setValueForce(value: T): void {
    this._value = value
    this._chain.forEach(value)
  }

  /**
   * A method for setting the value of the variable without notifying subscribers
   * @protected internal use only
   * @param value the new value of the variable
   */
  protected setSilent(value: T): void {
    this._value = value
  }

  /**
   * A method for setting the value of the variable and notifying subscribers without checking the equality
   * @protected internal use only
   * @param value the new value of the variable
   */
  protected setForce(value: T): void {
    this._value = value
    this._chain.forEach(value)
  }

  /**
   * A method for notifying subscribers about the value change
   * @protected internal use only
   */
  protected notify(): void {
    const value = this._value
    this._chain.forEach(value)
  }
}
