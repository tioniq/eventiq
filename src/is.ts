import {Variable} from "./variable";

/**
 * Check if the value is a variable
 * @param value The value to check
 * @returns true if the value is a variable, false otherwise
 */
export function isVariable(value: any): value is Variable<unknown> {
  return value instanceof Variable
}

/**
 * Check if the value is a variable of the specified type
 * @param value The value to check
 * @param typeCheckerOrExampleValue The type checker or the example value of the variable
 * @returns true if the value is a variable of the specified type, false otherwise
 * @remarks If the `typeCheckerOrExampleValue` is not provided, the function will return true if the value is a variable
 * @remarks If the `typeCheckerOrExampleValue` is an example value, the function will only check if the value type
 * matches the type of the example value. This means that if both the value and the example value are objects, the
 * function will return true without checking their properties or inheritance.
 */
export function isVariableOf<T>(value: any, typeCheckerOrExampleValue?: ((t: any) => t is T) | T): value is Variable<T> {
  if (!(value instanceof Variable)) {
    return false
  }
  let checker: (t: Variable<any>) => boolean
  if (typeof typeCheckerOrExampleValue === "function") {
    checker = typeCheckerOrExampleValue as (t: any) => boolean
  } else if (typeof typeCheckerOrExampleValue === "undefined") {
    checker = () => true
  } else {
    checker = (v: any) => typeof v === typeof typeCheckerOrExampleValue
  }
  return checker(value.value)
}
