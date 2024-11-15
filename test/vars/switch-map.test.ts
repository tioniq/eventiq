import {
  createConst,
  FuncVariable,
  MutableVariable,
  SwitchMapVariable,
  type Variable,
} from "../../src"
import { DisposableAction } from "@tioniq/disposiq"

describe("switchMap var", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  it("should switch variable", () => {
    const var1 = new MutableVariable("test1")
    const var2 = new MutableVariable("test2")
    const switched = new SwitchMapVariable(var1, (v) => {
      return !v ? var2 : var2.map((v2) => `${v}_${v2}`)
    })

    expect(switched.value).toBe("test1_test2")

    var1.value = "test3"

    expect(switched.value).toBe("test3_test2")

    var2.value = "test4"
    var1.value = "test5"

    expect(switched.value).toBe("test5_test4")

    var1.value = ""

    expect(switched.value).toBe("test4")
  })

  it("should switch map", () => {
    const var1 = new MutableVariable(0)
    const switched = new SwitchMapVariable(var1, (v) => {
      return v === 1 ? createConst(0) : createTimerVar()
    })

    expect(switched.value).toBe(0)

    const persistence = switched.startPersistent()

    var1.value = 1

    expect(switched.value).toBe(0)

    jest.advanceTimersByTime(1000)

    expect(switched.value).toBe(0)

    var1.value = 2

    expect(switched.value).toBe(0)

    jest.advanceTimersByTime(1000)

    expect(switched.value).toBe(1)

    jest.advanceTimersByTime(1000)

    expect(switched.value).toBe(2)

    var1.value = 3

    expect(switched.value).toBe(0)

    jest.advanceTimersByTime(1000)

    expect(switched.value).toBe(1)

    persistence.dispose()

    var1.value = 4

    expect(switched.value).toBe(0)

    jest.advanceTimersByTime(1000)

    expect(switched.value).toBe(0)
  })
})

function createTimerVar(delay = 1000): Variable<number> {
  return new FuncVariable(
    (vary) => {
      vary.value = 0
      const interval = setInterval(() => vary.value++, delay)
      return new DisposableAction(() => clearInterval(interval))
    },
    () => 0,
  )
}
