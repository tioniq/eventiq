import type { Disposiq } from "@tioniq/disposiq"
import { DirectVariable, InvertVariable, MutableVariable, SealVariable, type Variable, } from "../src"

type Factory = () => { variable: Variable<number>; emit: (value: number) => void }

const factories: Record<string, Factory> = {
  MutableVariable: () => {
    const variable = new MutableVariable(0)
    return { variable, emit: (v) => { variable.value = v } }
  },
  DirectVariable: () => {
    const variable = new DirectVariable(0)
    return { variable, emit: (v) => { variable.value = v } }
  },
  "MapVariable (CompoundVariable)": () => {
    const source = new MutableVariable(0)
    return { variable: source.map((x) => x), emit: (v) => { source.value = v } }
  },
  SealVariable: () => {
    const source = new MutableVariable(0)
    return { variable: new SealVariable(source), emit: (v) => { source.value = v } }
  },
}

describe.each(Object.entries(factories))("%s subscriptions", (_, factory) => {
  it("calls the same handler once per subscription", () => {
    const { variable, emit } = factory()
    const fn = jest.fn()
    const first = variable.subscribe(fn)
    const second = variable.subscribe(fn)
    expect(fn).toHaveBeenCalledTimes(2)

    emit(1)
    expect(fn).toHaveBeenCalledTimes(4)

    first.dispose()
    emit(2)
    expect(fn).toHaveBeenCalledTimes(5)

    second.dispose()
    emit(3)
    expect(fn).toHaveBeenCalledTimes(5)
  })

  it("calls the same silent handler once per subscription", () => {
    const { variable, emit } = factory()
    const fn = jest.fn()
    const first = variable.subscribeSilent(fn)
    variable.subscribeSilent(fn)
    expect(fn).toHaveBeenCalledTimes(0)

    emit(1)
    expect(fn).toHaveBeenCalledTimes(2)

    first.dispose()
    first.dispose()
    emit(2)
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it("emits in subscription order", () => {
    const { variable, emit } = factory()
    const log: string[] = []
    const a = (v: number) => log.push(`a${v}`)
    const b = (v: number) => log.push(`b${v}`)
    variable.subscribeSilent(a)
    variable.subscribeSilent(b)
    variable.subscribeSilent(a)
    emit(1)
    expect(log).toEqual(["a1", "b1", "a1"])
  })

  it("does not call a handler subscribed during an emit until the next emit", () => {
    const { variable, emit } = factory()
    const log: string[] = []
    const late = (v: number) => log.push(`late${v}`)
    let added = false
    variable.subscribeSilent((v) => {
      log.push(`first${v}`)
      if (!added) {
        added = true
        variable.subscribeSilent(late)
      }
    })
    variable.subscribeSilent((v) => log.push(`second${v}`))

    emit(1)
    expect(log).toEqual(["first1", "second1"])

    emit(2)
    expect(log).toEqual(["first1", "second1", "first2", "second2", "late2"])
  })

  it("does not call a handler disposed earlier in the same emit", () => {
    const { variable, emit } = factory()
    const log: string[] = []
    let later: Disposiq | null = null
    variable.subscribeSilent((v) => {
      log.push(`first${v}`)
      later?.dispose()
    })
    later = variable.subscribeSilent((v) => log.push(`later${v}`))
    variable.subscribeSilent((v) => log.push(`last${v}`))

    emit(1)
    expect(log).toEqual(["first1", "last1"])
  })

  it("keeps iterating when a handler disposes itself during an emit", () => {
    const { variable, emit } = factory()
    const log: string[] = []
    const self: Disposiq = variable.subscribeSilent((v) => {
      log.push(`self${v}`)
      self.dispose()
      self.dispose()
    })
    variable.subscribeSilent((v) => log.push(`other${v}`))

    emit(1)
    emit(2)
    expect(log).toEqual(["self1", "other1", "other2"])
  })

  it("disposes a subscription added during an emit before it runs", () => {
    const { variable, emit } = factory()
    const late = jest.fn()
    let lateSub: Disposiq | null = null
    variable.subscribeSilent(() => {
      if (lateSub === null) {
        lateSub = variable.subscribeSilent(late)
        lateSub.dispose()
      }
    })
    emit(1)
    emit(2)
    expect(late).not.toHaveBeenCalled()
  })
})

describe("subscription deactivation", () => {
  it("activates a compound variable once and deactivates it after the last duplicate is disposed", () => {
    const source = new MutableVariable(0)
    const mapper = jest.fn((x: number) => x * 2)
    const mapped = source.map(mapper)
    const fn = jest.fn()
    const first = mapped.subscribeSilent(fn)
    const second = mapped.subscribeSilent(fn)
    const calls = mapper.mock.calls.length

    first.dispose()
    source.value = 1
    expect(mapper.mock.calls.length).toBe(calls + 1)
    expect(fn).toHaveBeenLastCalledWith(2)

    second.dispose()
    second.dispose()
    source.value = 2
    expect(mapper.mock.calls.length).toBe(calls + 1)
  })

  it("keeps a variable persistent until every startPersistent handle is disposed", () => {
    const source = new MutableVariable(0)
    const mapper = jest.fn((x: number) => x)
    const mapped = source.map(mapper)
    const first = mapped.startPersistent()
    const second = mapped.startPersistent()

    first.dispose()
    const calls = mapper.mock.calls.length
    source.value = 1
    expect(mapper.mock.calls.length).toBe(calls + 1)

    second.dispose()
    source.value = 2
    expect(mapper.mock.calls.length).toBe(calls + 1)
  })

  it("InvertVariable calls the same handler once per subscription", () => {
    const source = new MutableVariable(false)
    const inverted = new InvertVariable(source)
    const fn = jest.fn()
    const first = inverted.subscribe(fn)
    inverted.subscribe(fn)
    expect(fn).toHaveBeenCalledTimes(2)
    source.value = true
    expect(fn).toHaveBeenCalledTimes(4)
    first.dispose()
    source.value = false
    expect(fn).toHaveBeenCalledTimes(5)
  })

  it("queues a value set during an emit and delivers it after the current pass", () => {
    const variable = new MutableVariable(0)
    const log: string[] = []
    variable.subscribeSilent((v) => {
      log.push(`a${v}`)
      if (v === 1) {
        variable.value = 2
      }
    })
    variable.subscribeSilent((v) => log.push(`b${v}`))
    variable.value = 1
    expect(log).toEqual(["a1", "b1", "a2", "b2"])
  })

  it("handles many subscriptions and disposes them in any order", () => {
    const source = new MutableVariable(0)
    const mapped = source.map((x) => x)
    const fn = jest.fn()
    const subs = Array.from({ length: 10_000 }, () => mapped.subscribeSilent(fn))
    source.value = 1
    expect(fn).toHaveBeenCalledTimes(10_000)
    for (let i = 0; i < subs.length; i += 2) subs[i].dispose()
    for (let i = subs.length - 1; i >= 0; i -= 2) subs[i].dispose()
    fn.mockClear()
    source.value = 2
    expect(fn).not.toHaveBeenCalled()
    expect(mapped.value).toBe(2)
  })
})
