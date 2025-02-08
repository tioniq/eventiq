import type { Variable } from "./variable"

export type VariableOrValue<T> = T | Variable<T>

export type VarOrVal<T> = VariableOrValue<T>

export interface IMutableVariable<T> extends Variable<T> {
  get value(): T

  set value(value: T)

  setSilent(value: T): void

  notify(): void
}