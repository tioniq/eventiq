import {FuncVariable} from "../../src";
import {emptyDisposable} from "@tioniq/disposiq";

describe('func var', () => {
  it('should return exact value when no subscription', () => {
    const func = new FuncVariable(v => {
      v.value = 10
      return emptyDisposable;
    }, () => 1)
    expect(func.value).toBe(1)
  })

  it('should set value on activate', () => {
    const func = new FuncVariable(v => {
      v.value = 10
      return emptyDisposable;
    }, () => 1)
    expect(func.value).toBe(1)

    const callback = jest.fn()
    func.subscribe(callback)

    expect(func.value).toBe(10)
  })

  it('should use exact value after deactivate', () => {
    const func = new FuncVariable(v => {
      v.value = 10
      return emptyDisposable;
    }, () => 1)
    expect(func.value).toBe(1)

    const callback = jest.fn()
    const subscription = func.subscribe(callback)

    expect(func.value).toBe(10)

    subscription.dispose()

    expect(func.value).toBe(1)
  })

  it('should notify on value change', () => {
    const func = new FuncVariable(v => {
      v.value = 10
      return emptyDisposable;
    }, () => 1)
    expect(func.value).toBe(1)

    const callback = jest.fn()
    func.subscribe(callback)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(10)

    func.value = 20

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(20)
  })

  it('should set silent and notify', () => {
    const func = new FuncVariable(v => {
      v.value = 10
      return emptyDisposable;
    }, () => 1)
    expect(func.value).toBe(1)

    const callback = jest.fn()
    func.subscribe(callback)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(10)

    func.setValueSilent(20)

    expect(callback).toHaveBeenCalledTimes(1)

    func.notify()

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(20)
  })

  it('should set force and notify', () => {
    const func = new FuncVariable(v => {
      v.value = 10
      return emptyDisposable;
    }, () => 1)
    expect(func.value).toBe(1)

    const callback = jest.fn()
    func.subscribe(callback)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(10)

    func.setValueForce(20)

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(20)
  })

  it('should subscribe silent', () => {
    const func = new FuncVariable(v => {
      v.value = 10
      return emptyDisposable;
    }, () => 1)
    expect(func.value).toBe(1)

    const callback = jest.fn()
    const subscription = func.subscribeSilent(callback)

    expect(callback).toHaveBeenCalledTimes(0)

    func.value = 20

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(20)

    subscription.dispose()

    func.value = 30

    expect(callback).toHaveBeenCalledTimes(1)
  })
})