import {Variable} from "../variable"
import {DisposableAction, DisposableContainer, Disposiq, emptyDisposable} from "@tioniq/disposiq";
import {Action, Func} from "../action";
import {LinkedChain} from "../linked-chain";
import {EqualityComparer, functionEqualityComparer} from "../comparer";

/**
 * A variable that seals the value of another variable. When sealed, the variable will not change its value
 * @typeparam T - the type of the variable value
 */
export class SealVariable<T> extends Variable<T> {
  /**
   * @internal
   */
  private readonly _chain = new LinkedChain<Action<T>>(functionEqualityComparer)

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
  private _value: T = null!

  /**
   * @internal
   */
  private _sealed = false

  constructor(vary: Variable<T>, equalityComparer?: EqualityComparer<T>) {
    super()
    this._var = vary
    this._equalityComparer = typeof equalityComparer === "function" ? equalityComparer : vary.equalityComparer
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
    return new DisposableAction(() => {
      disposable.dispose()
      if (!this._sealed && this._chain.empty) {
        this._deactivate()
      }
    })
  }

  subscribeSilent(callback: Func<T, void>): Disposiq {
    if (this._sealed) {
      return emptyDisposable
    }
    if (this._chain.empty) {
      this._activate()
    }
    const disposable = this._chain.addUnique(callback)[0]
    return new DisposableAction(() => {
      disposable.dispose()
      if (!this._sealed && this._chain.empty) {
        this._deactivate()
      }
    })
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
    if (arguments.length === 0) {
      let currentValue = this._chain.empty ? this._var.value : this._value
      this._varSubscription.dispose()
      this._sealValue(currentValue)
      return true
    }
    this._varSubscription.dispose()
    this._sealValue(valueToSeal!)
    return true
  }

  /**
   * @internal
   */
  private _activate() {
    this._varSubscription.disposeCurrent()
    this._varSubscription.set(this._var.subscribeSilent(v => {
      this._value = v
      this._chain.forEach(a => a(v))
    }))
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
    this._chain.forEach(a => a(value))
    this._chain.clear()
  }
}