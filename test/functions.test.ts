import { DisposableAction } from "@tioniq/disposiq"
import {
  createFuncVar,
  createConst,
  createDelegate,
  createDirect,
  or,
  and,
  sum,
  min,
  max,
  createDelayDispatcher,
  ConstantVariable,
  MutableVariable,
  createVar,
  combine, toVariable,
} from "../src"
import { FuncVariable } from "../src"

describe("functions", () => {
  it("should create and return a mutable variable", () => {
    const variable = createVar(10)
    expect(variable.value).toBe(10)
    expect(variable instanceof MutableVariable).toBe(true)

    variable.value = 20

    expect(variable.value).toBe(20)
  })

  it("should create and return a function variable", () => {
    const staticVar = 10
    const variable = createFuncVar(
      (vary) => {
        vary.value = staticVar
        return new DisposableAction(() => {
        })
      },
      () => staticVar,
    )

    expect(variable.value).toBe(staticVar)
    expect(variable instanceof FuncVariable).toBe(true)
  })

  it("should create and return a constant variable", () => {
    const variable = createConst(10)
    expect(variable.value).toBe(10)
    expect(variable instanceof ConstantVariable).toBe(true)
  })

  it("should create and return a delegate variable", () => {
    const variable = createDelegate(10)
    expect(variable.value).toBe(10)

    const source = new MutableVariable(20)
    variable.setSource(source)

    expect(variable.value).toBe(20)

    source.value = 30

    expect(variable.value).toBe(30)
  })

  it("should create and return a direct variable", () => {
    const variable = createDirect(10)
    expect(variable.value).toBe(10)

    variable.value = 20
    expect(variable.value).toBe(20)
  })

  it("should create and return an OR variable", () => {
    const variable1 = createConst(false)
    const variable2 = createConst(true)
    const variable3 = createConst(true)

    const variable = or(variable1, variable2, variable3)
    expect(variable.value).toBe(true)
  })

  it("should create and return an AND variable", () => {
    const variable1 = createConst(false)
    const variable2 = createConst(true)
    const variable3 = createConst(true)

    const variable = and(variable1, variable2, variable3)
    expect(variable.value).toBe(false)
  })

  it("should create and return a SUM variable", () => {
    const variable1 = createConst(10)
    const variable2 = createConst(20)
    const variable3 = createConst(30)

    const variable = sum(variable1, variable2, variable3)
    expect(variable.value).toBe(60)
  })

  it("should create and return a MIN variable", () => {
    const variable1 = createConst(10)
    const variable2 = createConst(20)
    const variable3 = createConst(30)

    const variable = min(variable1, variable2, variable3)
    expect(variable.value).toBe(10)
  })

  it("should create and return a MAX variable", () => {
    const variable1 = createConst(10)
    const variable2 = createConst(20)
    const variable3 = createConst(30)

    const variable = max(variable1, variable2, variable3)
    expect(variable.value).toBe(30)
  })

  it("should combine multiple variables into a single variable", () => {
    const variable1 = createConst(10)
    const variable2 = createVar(20)
    const variable3 = createConst(30)

    const variable = combine(variable1, variable2, variable3)
    expect(variable.value).toEqual([10, 20, 30])

    variable2.value = 40

    expect(variable.value).toEqual([10, 40, 30])
  })

  it("should combine throw an error if no variables are provided", () => {
    expect(() => combine()).toThrow("At least one variable must be provided")
  })

  it("should combine return the variable if only one variable is provided", () => {
    const variable = createConst(10)
    expect(combine(variable)).toBe(variable)
  })
})

describe("delay dispatcher function", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.useRealTimers()
  })
  it("should create and return a delay dispatcher", () => {
    const dispatcher = createDelayDispatcher(1000)
    const spy = jest.fn()
    dispatcher.subscribe(spy)

    expect(spy).toHaveBeenCalledTimes(0)

    jest.advanceTimersByTime(900)

    expect(spy).toHaveBeenCalledTimes(0)

    jest.advanceTimersByTime(1000)

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it("should dispose the subscription", () => {
    const dispatcher = createDelayDispatcher(1000)
    const spy = jest.fn()
    const subscription = dispatcher.subscribe(spy)

    expect(spy).toHaveBeenCalledTimes(0)

    jest.advanceTimersByTime(900)

    expect(spy).toHaveBeenCalledTimes(0)

    subscription.dispose()

    jest.advanceTimersByTime(1000)

    expect(spy).toHaveBeenCalledTimes(0)
  })
})

describe('to variable function', () => {
  it('should return the variable if it is already a variable', () => {
    const variable = createConst(10)
    expect(toVariable(variable)).toBe(variable)

    const variable2 = createVar(20)
    expect(toVariable(variable2)).toBe(variable2)
  })

  it('should return a new variable if the value is not a variable', () => {
    const value = 10
    const variable = toVariable(value)
    expect(variable.value).toBe(value)
  })
})