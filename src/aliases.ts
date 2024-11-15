import {
  createConst,
  createDelegate,
  createDirect,
  createFuncVar,
} from "./functions"
import { Variable } from "./variable"
import { MutableVariable } from "./vars"
import { ConstantVariable } from "./vars"
import { FuncVariable } from "./vars"

export {
  Variable as Var,
  MutableVariable as MutableVar,
  MutableVariable as Vary,
  ConstantVariable as ConstVariable,
  ConstantVariable as ConstVar,
  ConstantVariable as ImmutableVar,
  ConstantVariable as ReadonlyVar,
  FuncVariable as FuncVar,
  FuncVariable as LazyVariable,
  createFuncVar as createLazyVar,
  createConst as createConstVar,
  createDelegate as createDelegateVar,
  createDirect as createDirectVar,
}
