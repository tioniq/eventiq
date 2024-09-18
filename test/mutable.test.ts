import {MutableVariable} from "../src";

describe('Mutable', () => {
  it('should be mutable', () => {
    const variable = new MutableVariable<number>(10)
    expect(variable.value).toBe(10)
    variable.value = 20
    expect(variable.value).toBe(20)
    const receiver = jest.fn()
    const subscription = variable.subscribe(receiver)
    variable.value = 30
    expect(receiver).toHaveBeenCalledTimes(2)
    expect(receiver).toHaveBeenCalledWith(30)
    variable.value = 50
    expect(receiver).toHaveBeenCalledTimes(3)
    expect(receiver).toHaveBeenCalledWith(50)
    subscription.dispose()
    variable.value = 100
    expect(receiver).toHaveBeenCalledTimes(3)
  });
})