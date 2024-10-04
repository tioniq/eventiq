import {CompoundVariable} from "./compound";
import {Variable} from "../variable";
import {DisposableStore} from "@tioniq/disposiq";
import {arrayEqualityComparer} from "../comparer";

/**
 * A variable that combines multiple variables into a single variable. The value presents an array of the values of the
 * variables. The variable will notify the subscribers on any of the variables change
 */
export class CombinedVariable<T extends any[]> extends CompoundVariable<T> {
  /**
   * @internal
   */
  private readonly _vars: Variable<T>[]

  /**
   * @internal
   */
  private readonly _subscriptions = new DisposableStore()

  constructor(vars: { [K in keyof T]: Variable<T[K]> }) {
    if (!vars?.length) {
      throw new Error("No variables provided")
    }
    super(stubArray as T, arrayEqualityComparer)
    this._vars = vars.slice()
  }

  protected activate(): void {
    this._subscriptions.disposeCurrent()
    const length = this._vars.length
    const result = new Array(length) as T
    for (let i = 0; i < length; ++i) {
      const vary = this._vars[i]
      this._subscriptions.add(vary.subscribeSilent(value => {
        result[i] = value
        this.setValueForce(result)
      }))
      result[i] = vary.value
    }
    this.setValueForce(result)
  }

  protected deactivate(): void {
    this._subscriptions.disposeCurrent()
  }

  protected override getExactValue(): T {
    const length = this._vars.length
    const result = new Array(length) as T
    for (let i = 0; i < length; ++i) {
      result[i] = this._vars[i].value
    }
    return result
  }
}

const stubArray = Object.freeze([]) as unknown as any[]