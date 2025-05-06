import { DisposableContainer, type Disposiq, } from "@tioniq/disposiq"
import type { Func } from "../action"
import { Variable } from "../variable"
import { LinkedActionChain } from "../linked-chain"

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
  private readonly _chain = new LinkedActionChain<boolean>()

  /**
   * @internal
   */
  private _value = false

  /**
   * @internal
   */
  private readonly _subscription = new DisposableContainer()

  constructor(variable: Variable<boolean>) {
    super()
    this._variable = variable
    this._chain.onEmpty = () => this._deactivate()
  }

  get value(): boolean {
    if (this._chain.hasAny) {
      return this._value
    }
    return !this._variable.value
  }

  subscribe(callback: Func<boolean, void>): Disposiq {
    if (this._chain.empty) {
      this._activate()
    }
    const [disposable, added] = this._chain.addUnique(callback)
    if (added) {
      callback(this._value)
    }
    return disposable
  }

  subscribeSilent(callback: Func<boolean, void>): Disposiq {
    return this._variable.subscribeSilent((value) => callback(!value))
  }

  /**
   * @internal
   */
  private _activate() {
    this._subscription.disposeCurrent()
    this._subscription.set(
      this._variable.subscribeSilent((v) => {
        const value = !v
        this._value = value
        this._chain.forEach(value)
      }),
    )
    this._value = !this._variable.value
  }

  /**
   * @internal
   */
  private _deactivate() {
    this._subscription.disposeCurrent()
  }
}
