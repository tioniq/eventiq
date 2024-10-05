import {
  FuncVariable,
  ConstantVariable,
  OrVariable,
  AndVariable,
  MinVariable,
  MaxVariable,
  SumVariable, DelegateVariable, DirectVariable, MutableVariable, CombinedVariable
} from "./vars"
import {DisposableAction, IDisposable} from "@tioniq/disposiq"
import {Func, Func0} from "./action"
import {Variable} from "./variable"
import {EventObserver, LazyEventDispatcher} from "./events";

/**
 * Creates a new mutable variable
 * @param initialValue the initial value of the variable
 * @returns a new mutable variable
 */
export function createVar<T>(initialValue: T): MutableVariable<T> {
  return new MutableVariable(initialValue)
}

/**
 * Creates a new variable based on FuncVariable parameters
 * @param activator a function that will be called to activate the variable when it is subscribed
 * @param exactValue a function that returns the exact value of the variable when there is no subscriptions
 * @returns a new variable
 */
export function createFuncVar<T>(activator: Func<FuncVariable<T>, IDisposable>, exactValue: Func0<T>): Variable<T> {
  return new FuncVariable(activator, exactValue)
}

/**
 * Creates a new constant variable that will always have the same value
 * @param value the value of the variable
 * @returns a new constant variable
 */
export function createConst<T>(value: T): Variable<T> {
  return new ConstantVariable(value)
}

/**
 * Creates a new delegate variable that can be changed by setting a source variable
 * @param sourceOrDefaultValue the source variable or the default value of the variable
 * @returns a new delegate variable
 */
export function createDelegate<T>(sourceOrDefaultValue?: Variable<T> | T | null): DelegateVariable<T> {
  return new DelegateVariable(sourceOrDefaultValue)
}

/**
 * Creates a new direct variable that can be changed by setting the value property. The 'direct' means that the change
 * will not be checked by the equality comparer
 * @param initialValue the initial value of the variable
 * @returns a new direct variable
 */
export function createDirect<T>(initialValue: T): DirectVariable<T> {
  return new DirectVariable(initialValue)
}

/**
 * Creates a new variable that will return true if any of the variables are true
 * @param variables the variables to check
 * @returns a new OR variable
 */
export function or(...variables: Variable<boolean>[]): Variable<boolean> {
  return new OrVariable(variables)
}

/**
 * Creates a new variable that will return true if all the variables are true
 * @param variables the variables to check
 * @returns a new AND variable
 */
export function and(...variables: Variable<boolean>[]): Variable<boolean> {
  return new AndVariable(variables)
}

/**
 * Creates a new variable that will return the sum of the variables
 * @param variables the variables to sum
 * @returns a new SUM variable
 */
export function sum<T extends number | boolean>(...variables: Variable<T>[]): Variable<number> {
  return new SumVariable(variables)
}

/**
 * Creates a new variable that will return the minimum value of the variables
 * @param variables the variables to compare
 * @returns a new MIN variable
 */
export function min(...variables: Variable<number>[]): Variable<number> {
  return new MinVariable(variables)
}

/**
 * Creates a new variable that will return the maximum value of the variables
 * @param variables the variables to compare
 * @returns a new MAX variable
 */
export function max(...variables: Variable<number>[]): Variable<number> {
  return new MaxVariable(variables)
}

/**
 * Creates a new variable that combines multiple variables into a single variable
 * @param vars the variables to combine
 * @returns a new combined variable that contains an array of the values of the variables
 */
export function combine<O extends any[]>(...vars: { [K in keyof O]: Variable<O[K]> }): Variable<O> {
  if (vars.length === 0) {
    throw new Error("At least one variable must be provided")
  }
  if (vars.length === 1) {
    return vars[0]
  }
  return new CombinedVariable<O>(vars)
}

/**
 * Creates a new event dispatcher that will dispatch an event after a specified delay
 * @param delay the delay in milliseconds
 * @returns a new event dispatcher
 */
export function createDelayDispatcher(delay: number): EventObserver {
  return new LazyEventDispatcher((dispatcher) => {
    const timeout = setTimeout(() => dispatcher.dispatch(), delay)
    return new DisposableAction(() => clearTimeout(timeout))
  })
}
