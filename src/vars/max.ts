import { CompoundVariable } from "./compound"
import type { Variable } from "../variable"
import { DisposableStore } from "@tioniq/disposiq"

/**
 * A variable that represents the maximum value of multiple provided variables
 */
export class MaxVariable extends CompoundVariable<number> {
  /**
   * @internal
   */
  private readonly _vars: Variable<number>[]

  /**
   * @internal
   */
  private readonly _subscriptions = new DisposableStore()

  constructor(vars: Variable<number>[]) {
    super(0)
    this._vars = vars.slice()
  }

  protected activate(): void {
    const vars = this._vars
    const length = vars.length
    const subscriptions = this._subscriptions
    subscriptions.disposeCurrent()
    for (let i = 0; i < length; ++i) {
      subscriptions.add(
        vars[i].subscribeSilent(() => {
          this.postValue()
        }),
      )
    }
    this.postValue()
  }

  protected deactivate(): void {
    this._subscriptions.dispose()
  }

  protected getExactValue(): number {
    const vars = this._vars
    const length = vars.length
    let result = Number.NEGATIVE_INFINITY
    for (let i = 0; i < length; ++i) {
      result = Math.max(result, vars[i].value)
    }
    return result
  }

  protected postValue(): void {
    const vars = this._vars
    const length = vars.length
    let result = Number.NEGATIVE_INFINITY
    for (let i = 0; i < length; ++i) {
      result = Math.max(result, vars[i].value)
    }
    this.value = result
  }
}
