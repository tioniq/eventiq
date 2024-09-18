import {MutableVariable} from "./vars"
import {Variable} from "./variable"
import {ConstantVariable} from "./vars";

export type Var<T> = Variable<T>

export type MutableVar<T> = MutableVariable<T>
export type Vary<T> = MutableVariable<T>

export type ConstVariable<T> = ConstantVariable<T>
export type ConstVar<T> = ConstantVariable<T>
export type ImmutableVar<T> = ConstantVariable<T>
export type ReadonlyVar<T> = ConstantVariable<T>
