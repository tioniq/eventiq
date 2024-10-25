import { CompoundVariable } from "./compound"
import { Action, Func, Func0 } from "../action"
import { DisposableContainer, DisposableLike, toDisposable } from "@tioniq/disposiq"

/**
 * A variable that reacts on subscription activation and deactivation using provided function called `activator`.
 * If there is no subscription, the variable will return the exact value provided by the `exactValue` function
 */
export class FuncVariable<T> extends CompoundVariable<T> {
  /**
   * @internal
   */
  private readonly _activator: Action<this>

  /**
   * @internal
   */
  private readonly _deactivator: Action<this>

  /**
   * @internal
   */
  private readonly _exactValue: Func0<T>

  constructor(activate: Func<FuncVariable<T>, DisposableLike>, exactValue: Func0<T>) {
    super(null!)
    const disposable = new DisposableContainer()
    this._activator = (self) => {
      disposable.disposeCurrent()
      disposable.set(toDisposable(activate(self)))
    }
    this._deactivator = () => {
      disposable.disposeCurrent()
    }
    this._exactValue = exactValue
  }

  get value(): T {
    return super.value
  }

  /**
   * Sets the value of the variable. If the value is the same as the current value, the method will do nothing
   * @param value the new value of the variable
   */
  set value(value: T) {
    super.value = value
  }

  /**
   * A method for setting the value of the variable and notifying subscribers without checking the equality
   * @param value the new value of the variable
   */
  setValueForce(value: T) {
    super.setValueForce(value)
  }

  /**
   * A method for setting the value of the variable without notifying subscribers
   * @param value the new value of the variable
   */
  setValueSilent(value: T) {
    super.setValueSilent(value)
  }

  /**
   * A method for notifying subscribers about the value change
   */
  notify() {
    super.notify()
  }

  protected override activate(): void {
    this._activator(this)
  }

  protected override deactivate(): void {
    this._deactivator(this)
  }

  protected override getExactValue(): T {
    return this._exactValue()
  }
}