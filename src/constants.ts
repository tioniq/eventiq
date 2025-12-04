import { createConstVar } from "./functions";
import type { Variable } from "./variable";

export const nullVariable: Variable<null> = createConstVar(null)

export const undefinedVariable: Variable<undefined> = createConstVar(undefined)

export const falseVariable: Variable<false> = createConstVar(false)

export const trueVariable: Variable<true> = createConstVar(true)

export const zeroVariable: Variable<0> = createConstVar(0)

export const emptyStringVariable: Variable<""> = createConstVar("")