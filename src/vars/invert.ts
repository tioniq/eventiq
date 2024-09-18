import {DisposableAction, DisposableCompat, DisposableContainer} from "@tioniq/disposiq";
import {Action, Func} from "../action";
import {EqualityComparer, functionEqualityComparer} from "../comparer";
import {Variable} from "../variable";
import {LinkedChain} from "../linked-chain";

/**
 * A variable that inverts the value of another variable
 */
export class InvertVariable extends Variable<boolean> {
  /**
   * @internal
   */
  private readonly _variable: Variable<boolean>

  /**
   * @internal
   */
  private readonly _chain = new LinkedChain<Action<boolean>>(functionEqualityComparer)

  /**
   * @internal
   */
  private _value: boolean = false

  /**
   * @internal
   */
  private readonly _subscription = new DisposableContainer()

  constructor(variable: Variable<boolean>) {
    super()
    this._variable = variable
  }

  get value(): boolean {
    if (this._chain.hasAny) {
      return this._value
    }
    return !this._variable.value
  }

  get equalityComparer(): EqualityComparer<boolean> {
    return this._variable.equalityComparer
  }

  subscribe(callback: Func<boolean, void>): DisposableCompat {
    if (this._chain.empty) {
      this._activate()
    }
    const [disposable, added] = this._chain.addUnique(callback)
    if (added) {
      callback(this._value)
    }
    return new DisposableAction(() => {
      disposable.dispose()
      if (this._chain.empty) {
        this._deactivate()
      }
    })
  }

  subscribeSilent(callback: Func<boolean, void>): DisposableCompat {
    return this._variable.subscribeSilent(value => callback(!value))
  }

  /**
   * @internal
   */
  private _activate() {
    this._subscription.disposeCurrent()
    this._subscription.set(this._variable.subscribeSilent(v => {
      const value = this._value = !v
      this._chain.forEach(a => a(value))
    }))
    this._value = !this._variable.value
  }

  /**
   * @internal
   */
  private _deactivate() {
    this._subscription.disposeCurrent()
  }
}