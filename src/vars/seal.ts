import { Variable } from "../variable"
import { DisposableAction, DisposableContainer, type Disposiq, emptyDisposable, } from "@tioniq/disposiq"
import type { Func } from "../action"
import { LinkedActionChain } from "../linked-chain"
import { defaultEqualityComparer, type EqualityComparer, } from "../comparer"

/**
 * A variable that seals the value of another variable. When sealed, the variable will not change its value
 * @typeparam T - the type of the variable value
 */
export class SealVariable<T> extends Variable<T> {
  /**
   * @internal
   */
  private readonly _chain = new LinkedActionChain<T>()

  /**
   * @internal
   */
  private readonly _varSubscription = new DisposableContainer()

  /**
   * @internal
   */
  private readonly _equalityComparer: EqualityComparer<T>

  /**
   * @internal
   */
  private readonly _var: Variable<T>

  /**
   * @internal
   */
    // biome-ignore lint/style/noNonNullAssertion: the field access is safe because it used only in the sealed state
  private _value: T = null!

  /**
   * @internal
   */
  private _sealed = false

  constructor(vary: Variable<T>, equalityComparer?: EqualityComparer<T>) {
    super()
    this._var = vary
    this._equalityComparer =
      typeof equalityComparer === "function"
        ? equalityComparer
        : defaultEqualityComparer
    this._chain.onEmpty = () => {
      if (!this._sealed) {
        this._deactivate()
      }
    }
  }

  get value(): T {
    if (this._sealed) {
      return this._value
    }
    if (this._chain.empty) {
      return this._var.value
    }
    return this._value
  }

  get equalityComparer(): EqualityComparer<T> {
    return this._equalityComparer
  }

  subscribe(callback: Func<T, void>): Disposiq {
    if (this._sealed) {
      callback(this._value)
      return emptyDisposable
    }
    if (this._chain.empty) {
      this._activate()
    }
    const [disposable, added] = this._chain.addUnique(callback)
    if (added) {
      callback(this._value)
    }
    return disposable
  }

  subscribeSilent(callback: Func<T, void>): Disposiq {
    if (this._sealed) {
      return emptyDisposable
    }
    if (this._chain.empty) {
      this._activate()
    }
    return this._chain.addUnique(callback)[0]
  }

  /**
   * Seals the variable. If the variable is already sealed, the method will do nothing
   * @param valueToSeal the value to seal. If the value is not provided, the current value of the variable will be
   * sealed
   * @returns true if the variable was sealed, false if the variable was already sealed
   */
  seal(valueToSeal?: T): boolean {
    if (this._sealed) {
      return false
    }
    this._sealed = true
    this._varSubscription.dispose()
    // biome-ignore lint/style/noArguments: used because we accept the value as an argument event if it is undefined
    if (arguments.length === 0) {
      const currentValue = this._chain.empty ? this._var.value : this._value
      this._varSubscription.dispose()
      this._sealValue(currentValue)
      return true
    }
    this._varSubscription.dispose()
    // biome-ignore lint/style/noNonNullAssertion: use any value that is provided by the caller
    this._sealValue(valueToSeal!)
    return true
  }

  /**
   * @internal
   */
  private _activate() {
    this._varSubscription.disposeCurrent()
    this._varSubscription.set(
      this._var.subscribeSilent((v) => {
        this._value = v
        this._chain.forEach(v)
      }),
    )
    this._value = this._var.value
  }

  /**
   * @internal
   */
  private _deactivate() {
    this._varSubscription.disposeCurrent()
  }

  /**
   * @internal
   */
  private _sealValue(value: T): void {
    if (this._equalityComparer(value, this._value)) {
      this._chain.clear()
      return
    }
    this._value = value
    this._chain.forEach(value)
    this._chain.clear()
  }
}
