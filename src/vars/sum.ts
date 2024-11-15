import { CompoundVariable } from "./compound"
import type { Variable } from "../variable"
import { DisposableStore } from "@tioniq/disposiq"

/**
 * A variable that represents the sum of multiple provided variables. If the type of the variables is boolean, the
 * sum will be the number of true values. If the type of the variables is number, the sum will be the sum of the values
 * @typeparam T - the type of the variables
 */
export class SumVariable<
  T extends number | boolean,
> extends CompoundVariable<number> {
  /**
   * @internal
   */
  private readonly _vars: Variable<T>[]

  /**
   * @internal
   */
  private readonly _subscriptions = new DisposableStore()

  constructor(vars: Variable<T>[]) {
    super(0)
    this._vars = vars.slice()
  }

  protected activate(): void {
    const vars = this._vars
    const length = vars.length
    const subscriptions = this._subscriptions
    subscriptions.disposeCurrent()
    for (let i = 0; i < length; ++i) {
      const variable = vars[i]
      subscriptions.add(
        variable.subscribeSilent(() => {
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
    let result = 0
    for (let i = 0; i < length; ++i) {
      result += vars[i].value as number
    }
    return result
  }

  protected postValue(): void {
    const vars = this._vars
    const length = vars.length
    let result = 0
    for (let i = 0; i < length; ++i) {
      result += vars[i].value as number
    }
    this.value = result
  }
}
