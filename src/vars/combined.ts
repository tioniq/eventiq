import {CompoundVariable} from "./compound";
import {Variable} from "../variable";
import {EqualityComparer} from "../comparer";
import {DisposableStore} from "@tioniq/disposiq";

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
    const comparers = vars.map(v => v.equalityComparer)
    super(getStubArray(vars.length), createArrayEqualityComparer(comparers))
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

function createArrayEqualityComparer<K, T extends Array<K>>(itemEqualityComparers: EqualityComparer<K>[]): EqualityComparer<T> {
  return function (a: T, b: T) {
    if (a.length !== b.length) {
      return false
    }
    for (let i = 0; i < a.length; ++i) {
      if (!itemEqualityComparers[i](a[i], b[i])) {
        return false
      }
    }
    return true
  }
}

const stubArray = Object.freeze([]) as unknown as any[]

function getStubArray<T extends Array<unknown>>(_: number): T {
  return stubArray as T
}