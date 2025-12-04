import {
  emptyStringVariable,
  falseVariable,
  nullVariable,
  trueVariable,
  undefinedVariable,
  zeroVariable
} from "./constants"
import { createConstVar, createDelegate, createDirect, createFuncVar, } from "./functions"
import { IMutableVariable } from "./types"
import { Variable } from "./variable"
import { ConstantVariable, FuncVariable, MutableVariable } from "./vars"

export {
  Variable as Var,
  MutableVariable as MutableVar,
  MutableVariable as Vary,
  IMutableVariable as IMutableVar,
  IMutableVariable as IVary,
  ConstantVariable as ConstVariable,
  ConstantVariable as ConstVar,
  ConstantVariable as ImmutableVar,
  ConstantVariable as ReadonlyVar,
  FuncVariable as FuncVar,
  FuncVariable as LazyVariable,
  createFuncVar as createLazyVar,
  // deprecated
  createConstVar as createConst,
  createDelegate as createDelegateVar,
  createDirect as createDirectVar,
  nullVariable as nullVar,
  undefinedVariable as undefinedVar,
  falseVariable as falseVar,
  trueVariable as trueVar,
  zeroVariable as zeroVar,
  emptyStringVariable as emptyString
}
