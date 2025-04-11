import {
  AndVariable,
  CombinedVariable,
  FuncVariable,
  InvertVariable,
  MapVariable, MutableVar,
  MutableVariable,
  OrVariable,
  SumVariable,
  SwitchMapVariable,
  ThrottledVariable,
} from "../src"
import { DisposableAction } from "@tioniq/disposiq"
import { EventDispatcher } from "../src"

describe("extensions", () => {
  it("should subscribeDisposable work correctly", () => {
    const disposableFnc = jest.fn()
    const variable = new MutableVariable(1)
    const disposable = variable.subscribeDisposable((_) => {
      return new DisposableAction(disposableFnc)
    })

    expect(disposableFnc).toHaveBeenCalledTimes(0)

    variable.value = 2

    expect(disposableFnc).toHaveBeenCalledTimes(1)

    disposable.dispose()

    expect(disposableFnc).toHaveBeenCalledTimes(2)

    variable.value = 3

    expect(disposableFnc).toHaveBeenCalledTimes(2)
  })

  it("should subscribeOnceWhere trigger callback only once", () => {
    const callback = jest.fn()
    const variable = new MutableVariable(1)
    const disposable = variable.subscribeOnceWhere(callback, (v) => v === 2)

    expect(callback).toHaveBeenCalledTimes(0)

    variable.value = 10

    expect(callback).toHaveBeenCalledTimes(0)

    variable.value = 2

    expect(callback).toHaveBeenCalledTimes(1)

    variable.value = 3

    expect(callback).toHaveBeenCalledTimes(1)

    disposable.dispose()
    variable.value = 2

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it("should subscribeOnceWhere trigger callback immediately", () => {
    const callback = jest.fn()
    const variable = new MutableVariable(1)
    const disposable = variable.subscribeOnceWhere(callback, (v) => v === 1)

    expect(callback).toHaveBeenCalledTimes(1)

    variable.value = 2
    variable.value = 1
    disposable.dispose()

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it("should subscribeWhere work for function condition", () => {
    const callback = jest.fn()
    const variable = new MutableVariable(1)
    const disposable = variable.subscribeWhere(callback, (v) => v === 2)

    expect(callback).toHaveBeenCalledTimes(0)

    variable.value = 10

    expect(callback).toHaveBeenCalledTimes(0)

    variable.value = 2

    expect(callback).toHaveBeenCalledTimes(1)

    variable.value = 3

    expect(callback).toHaveBeenCalledTimes(1)

    variable.value = 2

    expect(callback).toHaveBeenCalledTimes(2)

    variable.value = 1

    expect(callback).toHaveBeenCalledTimes(2)

    disposable.dispose()
    variable.value = 2

    expect(callback).toHaveBeenCalledTimes(2)
  })

  it("should subscribeWhere work for value condition", () => {
    const callback = jest.fn()
    const variable = new MutableVariable(1)
    const disposable = variable.subscribeWhere(callback, 2)

    expect(callback).toHaveBeenCalledTimes(0)

    variable.value = 10

    expect(callback).toHaveBeenCalledTimes(0)

    variable.value = 2

    expect(callback).toHaveBeenCalledTimes(1)

    variable.value = 3

    expect(callback).toHaveBeenCalledTimes(1)

    variable.value = 2

    expect(callback).toHaveBeenCalledTimes(2)

    variable.value = 1

    expect(callback).toHaveBeenCalledTimes(2)

    disposable.dispose()
    variable.value = 2

    expect(callback).toHaveBeenCalledTimes(2)
  })

  it("should map create MapVariable", () => {
    const variable = new MutableVariable(1)
    const mapVariable = variable.map((v) => v + 1)

    expect(mapVariable.value).toBe(2)
    expect(mapVariable instanceof MapVariable).toBeTruthy()
  })

  it("should or create OrVariable", () => {
    const variable1 = new MutableVariable(true)
    const variable2 = new MutableVariable(false)
    const orVariable = variable1.or(variable2)

    expect(orVariable.value).toBe(true)
    expect(orVariable instanceof OrVariable).toBeTruthy()
  })

  it("should and create AndVariable", () => {
    const variable1 = new MutableVariable(true)
    const variable2 = new MutableVariable(false)
    const andVariable = variable1.and(variable2)

    expect(andVariable.value).toBe(false)
    expect(andVariable instanceof AndVariable).toBeTruthy()
  })

  it("should invert create InvertVariable", () => {
    const variable = new MutableVariable(true)
    const invertVariable = variable.invert()

    expect(invertVariable.value).toBe(false)
    expect(invertVariable instanceof InvertVariable).toBeTruthy()
  })

  it("should with create CombinedVariable", () => {
    const variable1 = new MutableVariable(1)
    const variable2 = new MutableVariable(2)
    const combinedVariable = variable1.with(variable2)

    expect(combinedVariable.value).toEqual([1, 2])
    expect(combinedVariable instanceof CombinedVariable).toBeTruthy()
  })

  it("should switchMap create SwitchMapVariable", () => {
    const variable = new MutableVariable(1)
    const switchMapVariable = variable.switchMap(
      (v) => new MutableVariable(v + 1),
    )

    expect(switchMapVariable.value).toBe(2)
    expect(switchMapVariable instanceof SwitchMapVariable).toBeTruthy()
  })

  it("should throttle create ThrottledVariable", () => {
    const variable = new MutableVariable(1)
    const throttledVariable = variable.throttle(1000)

    expect(throttledVariable.value).toBe(1)
    expect(throttledVariable instanceof ThrottledVariable).toBeTruthy()

    const eventDispatcher = new EventDispatcher()
    const throttledVariable2 = variable.throttle(eventDispatcher)

    expect(throttledVariable2.value).toBe(1)
    expect(throttledVariable2 instanceof ThrottledVariable).toBeTruthy()
  })

  it("should streamTo work correctly", () => {
    const variable = new MutableVariable(1)
    const receiver = new MutableVariable(0)
    const disposable = variable.streamTo(receiver)

    expect(receiver.value).toBe(1)

    variable.value = 2

    expect(receiver.value).toBe(2)

    disposable.dispose()

    variable.value = 3

    expect(receiver.value).toBe(2)
  })

  it("should startPersistent work correctly", () => {
    const variable = new FuncVariable(
      (vary) => {
        vary.value = 2
        return new DisposableAction(() => {
          vary.value = 0
        })
      },
      () => 1,
    )

    expect(variable.value).toBe(1)

    const disposable = variable.startPersistent()

    variable.value = 2

    expect(variable.value).toBe(2)

    disposable.dispose()

    variable.value = 3

    expect(variable.value).toBe(1)
  })

  it("should plus work correctly", () => {
    const variable1 = new MutableVariable(1)
    const variable2 = new MutableVariable(2)
    const sumVariable = variable1.plus(variable2)

    expect(sumVariable.value).toBe(3)
    expect(sumVariable instanceof SumVariable).toBeTruthy()

    const sumVariable2 = variable1.plus(2)

    expect(sumVariable2.value).toBe(3)
    expect(sumVariable2 instanceof MapVariable).toBeTruthy()
  })

  it("should minus work correctly", () => {
    const variable1 = new MutableVariable(1)
    const variable2 = new MutableVariable(2)
    const sumVariable = variable1.minus(variable2)

    expect(sumVariable.value).toBe(-1)
    expect(sumVariable instanceof SumVariable).toBeTruthy()

    const sumVariable2 = variable1.minus(2)

    expect(sumVariable2.value).toBe(-1)
    expect(sumVariable2 instanceof MapVariable).toBeTruthy()
  })

  it("should multiply work correctly", () => {
    const variable1 = new MutableVariable(1)
    const variable2 = new MutableVariable(2)
    const sumVariable = variable1.multiply(variable2)

    expect(sumVariable.value).toBe(2)
    expect(sumVariable instanceof MapVariable).toBeTruthy()

    const sumVariable2 = variable1.multiply(2)

    expect(sumVariable2.value).toBe(2)
    expect(sumVariable2 instanceof MapVariable).toBeTruthy()
  })

  it("should divide work correctly", () => {
    const variable1 = new MutableVariable(1)
    const variable2 = new MutableVariable(2)
    const sumVariable = variable1.divide(variable2)

    expect(sumVariable.value).toBe(0.5)
    expect(sumVariable instanceof MapVariable).toBeTruthy()

    const sumVariable2 = variable1.divide(2)

    expect(sumVariable2.value).toBe(0.5)
    expect(sumVariable2 instanceof MapVariable).toBeTruthy()
  })

  it("should round work correctly", () => {
    const variable = new MutableVariable(1.5)
    const roundVariable = variable.round()

    expect(roundVariable.value).toBe(2)

    variable.value = 1.4

    expect(roundVariable.value).toBe(1)
  })

  it("should moreThan work correctly", () => {
    const variable1 = new MutableVariable(1)
    const variable2 = new MutableVariable(2)
    const moreThanVariable = variable1.moreThan(variable2)

    expect(moreThanVariable.value).toBe(false)

    variable1.value = 3
    expect(moreThanVariable.value).toBe(true)

    const moreThanVariable2 = variable1.moreThan(2)

    expect(moreThanVariable2.value).toBe(true)

    variable1.value = 1

    expect(moreThanVariable2.value).toBe(false)
  })

  it("should lessThan work correctly", () => {
    const variable1 = new MutableVariable(1)
    const variable2 = new MutableVariable(2)
    const lessThanVariable = variable1.lessThan(variable2)

    expect(lessThanVariable.value).toBe(true)

    variable1.value = 3
    expect(lessThanVariable.value).toBe(false)

    const lessThanVariable2 = variable1.lessThan(2)

    expect(lessThanVariable2.value).toBe(false)

    variable1.value = 1

    expect(lessThanVariable2.value).toBe(true)
  })

  it("should moreOrEqual work correctly", () => {
    const variable1 = new MutableVariable(1)
    const variable2 = new MutableVariable(2)
    const moreOrEqualVariable = variable1.moreOrEqual(variable2)

    expect(moreOrEqualVariable.value).toBe(false)

    variable1.value = 3
    expect(moreOrEqualVariable.value).toBe(true)

    const moreOrEqualVariable2 = variable1.moreOrEqual(2)

    expect(moreOrEqualVariable2.value).toBe(true)

    variable1.value = 1

    expect(moreOrEqualVariable2.value).toBe(false)
  })

  it("should lessOrEqual work correctly", () => {
    const variable1 = new MutableVariable(1)
    const variable2 = new MutableVariable(2)
    const lessOrEqualVariable = variable1.lessOrEqual(variable2)

    expect(lessOrEqualVariable.value).toBe(true)

    variable1.value = 3
    expect(lessOrEqualVariable.value).toBe(false)

    const lessOrEqualVariable2 = variable1.lessOrEqual(2)

    expect(lessOrEqualVariable2.value).toBe(false)

    variable1.value = 1

    expect(lessOrEqualVariable2.value).toBe(true)
  })

  it("should equal work correctly", () => {
    const variable1 = new MutableVariable(1)
    const variable2 = new MutableVariable(2)
    const equalVariable = variable1.equal(variable2)

    expect(equalVariable.value).toBe(false)

    variable1.value = 2
    expect(equalVariable.value).toBe(true)

    const equalVariable2 = variable1.equal(2)

    expect(equalVariable2.value).toBe(true)

    variable1.value = 1

    expect(equalVariable2.value).toBe(false)
  })

  it("should sealed work correctly", () => {
    const variable = new MutableVariable(1)
    const sealedVariable = variable.sealed()

    expect(sealedVariable.value).toBe(1)

    variable.value = 2

    expect(sealedVariable.value).toBe(1)
  })

  it("should sealWhen work correctly", () => {
    const variable = new MutableVariable(1)
    const sealedVariable = variable.sealWhen(2)

    expect(sealedVariable.value).toBe(1)

    variable.value = 2

    expect(sealedVariable.value).toBe(2)

    variable.value = 3

    expect(sealedVariable.value).toBe(2)

    const sealedVariable2 = variable.sealWhen((v) => v === 3)

    expect(sealedVariable2.value).toBe(3)

    variable.value = 4

    expect(sealedVariable2.value).toBe(3)
  })

  it("should notifyOn work correctly", () => {
    const variable = new MutableVar(1)
    const dispatcher = new EventDispatcher()
    const callback = jest.fn()
    const notifyOnVar = variable.notifyOn(dispatcher)
    const subscription = notifyOnVar.subscribe(callback)

    expect(callback).toHaveBeenCalledTimes(1)

    dispatcher.dispatch()

    expect(callback).toHaveBeenCalledTimes(2)

    dispatcher.dispatch()

    expect(callback).toHaveBeenCalledTimes(3)

    variable.value = 2

    expect(callback).toHaveBeenCalledTimes(4)

    subscription.dispose()

    dispatcher.dispatch()

    expect(callback).toHaveBeenCalledTimes(4)

    expect(notifyOnVar.value).toBe(2)
  })
})
