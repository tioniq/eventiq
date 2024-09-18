import {Variable} from "../variable"
import {Func} from "../action"
import {DisposableCompat, emptyDisposable} from "@tioniq/disposiq"
import {defaultEqualityComparer, EqualityComparer} from "../comparer"

/**
 * A variable that always has the same value
 * @typeparam T - the type of the variable value
 */
export class ConstantVariable<T> extends Variable<T> {
  /**
   * @internal
   */
  private readonly _value: T

  /**
   * @internal
   */
  private readonly _equalityComparer: EqualityComparer<T>

  constructor(value: T, equalityComparer?: EqualityComparer<T>) {
    super()
    this._value = value
    this._equalityComparer = equalityComparer ?? defaultEqualityComparer
  }

  get value(): T {
    return this._value
  }

  get equalityComparer(): EqualityComparer<T> {
    return this._equalityComparer
  }

  subscribe(callback: Func<T, void>): DisposableCompat {
    callback(this._value)
    return emptyDisposable
  }

  subscribeSilent(_: Func<T, void>): DisposableCompat {
    return emptyDisposable
  }
}
