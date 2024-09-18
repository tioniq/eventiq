import {Variable} from "./variable";

export type VariableOrValue<T> = T | Variable<T>;

export type VarOrVal<T> = VariableOrValue<T>;