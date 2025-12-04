import { DisposableContainer, DisposableStore } from "@tioniq/disposiq";
import { defaultEqualityComparer, type EqualityComparer } from "../comparer";
import type { Variable } from "../variable";
import { CompoundVariable } from "./compound";

export class EqualsToValueVariable<T> extends CompoundVariable<boolean> {
  private readonly _subscription = new DisposableContainer()
  private readonly __equalityComparer: EqualityComparer<T>
  private readonly _variable: Variable<T>
  private readonly __value: T

  constructor(variable: Variable<T>, value: T, equalityComparer?: EqualityComparer<T>) {
    super(false)
    this._variable = variable
    this.__value = value
    this.__equalityComparer = equalityComparer ?? defaultEqualityComparer
  }

  protected activate() {
    this._subscription.disposeCurrent()
    this._subscription.set(this._variable.subscribe((v) => {
      this.value = this.__equalityComparer(this.__value, v)
    }))
  }

  protected deactivate() {
    this._subscription.disposeCurrent()
  }

  protected getExactValue(): boolean {
    return this.__equalityComparer(this.__value, this._variable.value)
  }
}


export class EqualsToVariableVariable<T> extends CompoundVariable<boolean> {
  private readonly _subscription = new DisposableStore()
  private readonly __equalityComparer: EqualityComparer<T>
  private readonly _variable: Variable<T>
  private readonly _otherVariable: Variable<T>

  constructor(variable: Variable<T>, otherVariable: Variable<T>, equalityComparer?: EqualityComparer<T>) {
    super(false)
    this._variable = variable
    this._otherVariable = otherVariable
    this.__equalityComparer = equalityComparer ?? defaultEqualityComparer
  }

  protected activate() {
    this._subscription.disposeCurrent()
    this._subscription.add(this._variable.subscribeSilent((v) => {
      this.value = this.__equalityComparer(v, this._otherVariable.value)
    }))
    this._subscription.add(this._otherVariable.subscribe((v) => {
      this.value = this.__equalityComparer(this._variable.value, v)
    }))
  }

  protected deactivate() {
    this._subscription.disposeCurrent()
  }

  protected getExactValue(): boolean {
    return this.__equalityComparer(this._variable.value, this._otherVariable.value)
  }
}

