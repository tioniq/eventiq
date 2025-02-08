import { CompoundVariable } from "./compound"
import { Variable } from "../variable"
import {
  DisposableAction,
  DisposableContainer,
  emptyDisposable,
  type IDisposable,
} from "@tioniq/disposiq"

/**
 * A variable that delegates its value to another variable
 * @typeparam T - the type of the variable value
 */
export class DelegateVariable<T> extends CompoundVariable<T> {
  /**
   * @internal
   */
  private readonly _sourceSubscription = new DisposableContainer()

  /**
   * @internal
   */
  private _source: Variable<T> | null

  constructor(sourceOrDefaultValue?: Variable<T> | T | null) {
    super(
      sourceOrDefaultValue instanceof Variable
        ? // biome-ignore lint/style/noNonNullAssertion: base value will not be used
          null!
        : sourceOrDefaultValue != undefined
          ? sourceOrDefaultValue
          : // biome-ignore lint/style/noNonNullAssertion: base value will not be used
            null!,
    )
    if (sourceOrDefaultValue instanceof Variable) {
      this._source = sourceOrDefaultValue
    } else {
      this._source = null
    }
  }

  /**
   * Sets the source variable. The source variable will be used to get the value for the delegate variable
   * @param source the source variable or null to remove the source
   * @returns a disposable that will remove the source when disposed
   */
  setSource(source: Variable<T> | null): IDisposable {
    if (!source) {
      if (this._source) {
        this.value = this._source.value
        this._source = null
      }
      this._sourceSubscription.disposeCurrent()
      return emptyDisposable
    }
    this._source = source
    this._sourceSubscription.disposeCurrent()
    if (this.active) {
      this._sourceSubscription.set(
        source.subscribeSilent((v) => this.setForce(v)),
      )
      this.value = source.value
    }
    return new DisposableAction(() => {
      if (this._source !== source) {
        return
      }
      this.setSource(null)
    })
  }

  protected activate() {
    if (this._source === null) {
      return
    }
    this._sourceSubscription.disposeCurrent()
    this._sourceSubscription.set(
      this._source.subscribeSilent((v) => this.setForce(v)),
    )
    this.value = this._source.value
  }

  protected deactivate() {
    if (this._source === null) {
      return
    }
    this._sourceSubscription.disposeCurrent()
  }

  protected getExactValue(): T {
    return this._source !== null ? this._source.value : super.getExactValue()
  }
}
