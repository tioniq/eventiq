import { CompoundVariable } from "./compound"
import type { Variable } from "../variable"
import { disposeAll, type IDisposable } from "@tioniq/disposiq"

/**
 * A variable that will return true if all the variable values are true
 */
export class AndVariable extends CompoundVariable<boolean> {
  /**
   * @internal
   */
  private readonly _variables: Variable<boolean>[]

  /**
   * @internal
   */
  private readonly _subscriptions: IDisposable[] = []

  constructor(variables: Variable<boolean>[]) {
    super(false)
    this._variables = variables
  }

  protected activate(): void {
    this._listen(0)
  }

  protected deactivate(): void {
    disposeAll(this._subscriptions)
  }

  protected getExactValue(): boolean {
    const variables = this._variables
    for (let i = 0; i < variables.length; ++i) {
      if (!variables[i].value) {
        return false
      }
    }
    return true
  }

  /**
   * @internal
   */
  private _listen(index: number): void {
    if (index >= this._variables.length) {
      this.value = true
      return
    }
    if (this._subscriptions.length > index) {
      return
    }
    const __listener = (value: boolean) => {
      if (value) {
        this._listen(index + 1)
      } else {
        this._unsubscribeFrom(index + 1)
        this.value = false
      }
    }
    const variable = this._variables[index]
    this._subscriptions.push(variable.subscribeSilent(__listener))
    __listener(variable.value)
    return
  }

  /**
   * @internal
   */
  private _unsubscribeFrom(index: number): void {
    while (index < this._subscriptions.length) {
      this._subscriptions.pop()?.dispose()
    }
  }
}
