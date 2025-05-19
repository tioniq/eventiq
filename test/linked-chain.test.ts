import { LinkedActionChain, LinkedChain } from "../src"
import type { Action } from "../src/action"

describe("linked chain", () => {
  it("should be empty", () => {
    const chain = new LinkedChain<number>()

    expect(chain.empty).toBe(true)
  })

  it("should not be empty", () => {
    const chain = new LinkedChain<number>()
    chain.add(10)

    expect(chain.empty).toBe(false)
  })

  it("should have any", () => {
    const chain = new LinkedChain<number>()
    chain.add(10)

    expect(chain.hasAny).toBe(true)
  })

  it("should not have any", () => {
    const chain = new LinkedChain<number>()

    expect(chain.hasAny).toBe(false)
  })

  it("should have count 0", () => {
    const chain = new LinkedChain<number>()

    expect(chain.count).toBe(0)
  })

  it("should have count 1", () => {
    const chain = new LinkedChain<number>()
    chain.add(10)

    expect(chain.count).toBe(1)
  })

  it("should have count 10", () => {
    const chain = new LinkedChain<number>()
    for (let i = 0; i < 10; i++) {
      chain.add(i)
    }

    expect(chain.count).toBe(10)
  })

  it("should have count 9 after removing an item", () => {
    const chain = new LinkedChain<number>()
    for (let i = 0; i < 10; i++) {
      chain.add(i)
    }
    chain.remove(5)

    expect(chain.count).toBe(9)
  })

  it("should toArray return empty array", () => {
    const chain = new LinkedChain<number>()

    expect(chain.toArray()).toEqual([])
  })

  it("should toArray return array with one item", () => {
    const chain = new LinkedChain<number>()
    chain.add(10)

    expect(chain.toArray()).toEqual([10])
  })

  it("should toArray return array with 10 items", () => {
    const chain = new LinkedChain<number>()
    for (let i = 0; i < 10; i++) {
      chain.add(i)
    }

    expect(chain.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it("should addUnique return true", () => {
    const chain = new LinkedChain<number>()

    const [_, added] = chain.addUnique(10)

    expect(added).toBe(true)

    const [__, added2] = chain.addUnique(60)

    expect(added2).toBe(true)
  })

  it("should addUnique return false", () => {
    const chain = new LinkedChain<number>()
    chain.add(10)

    const [_, added] = chain.addUnique(10)

    expect(added).toBe(false)
  })

  it("should add and remove item using disposable subscription", () => {
    const chain = new LinkedChain<number>()
    const [subscription, added] = chain.addUnique(10)

    expect(added).toBe(true)
    expect(chain.count).toBe(1)

    subscription.dispose()

    expect(chain.count).toBe(0)
  })

  it("should addToBeginUnique work properly", () => {
    const chain = new LinkedChain<number>()
    chain.addToBeginUnique(10)
    chain.addToBeginUnique(20)
    chain.addToBeginUnique(30)

    expect(chain.toArray()).toEqual([30, 20, 10])

    chain.addToBeginUnique(20)

    expect(chain.toArray()).toEqual([30, 20, 10])

    chain.remove(20)
    chain.addToBeginUnique(20)

    expect(chain.toArray()).toEqual([20, 30, 10])
  })

  it("should addToBegin work properly", () => {
    const chain = new LinkedChain<number>()
    chain.addToBegin(10)
    chain.addToBegin(20)
    chain.addToBegin(30)

    expect(chain.toArray()).toEqual([30, 20, 10])

    chain.addToBegin(20)

    expect(chain.toArray()).toEqual([20, 30, 20, 10])
  })

  it("should remove not fail when removing non-existing item", () => {
    const chain = new LinkedChain<number>()
    chain.add(10)
    chain.add(20)

    chain.remove(30)

    expect(chain.count).toBe(2)
  })

  it("should clear work properly", () => {
    const chain = new LinkedChain<number>()
    chain.add(10)
    chain.add(20)
    chain.add(30)

    chain.clear()

    expect(chain.count).toBe(0)

    chain.add(10)

    expect(chain.count).toBe(1)

    chain.clear()

    expect(chain.count).toBe(0)
  })

  it("should removeAll return null when no items contained", () => {
    const chain = new LinkedChain<number>()
    const removed = chain.removeAll()

    expect(removed).toBeNull()
  })

  it("should removeAll return removed item node", () => {
    const chain = new LinkedChain<number>()
    chain.add(30)

    const removed = chain.removeAll()

    expect(removed).not.toBeNull()
    expect(removed?.value).toBe(30)
  })

  it("should removeAll return removed item node and clear the chain", () => {
    const chain = new LinkedChain<number>()
    chain.add(30)
    chain.add(40)

    const removed = chain.removeAll()

    expect(removed).not.toBeNull()
    expect(removed?.value).toBe(30)
    expect(chain.count).toBe(0)
  })

  it("should removeAll return multiple removed item nodes and clear the chain", () => {
    const chain = new LinkedChain<number>()
    chain.add(30)
    chain.add(40)
    chain.add(50)

    const removed = chain.removeAll()

    expect(removed).not.toBeNull()
    expect(removed?.value).toBe(30)
    expect(removed?.next?.value).toBe(40)
    expect(removed?.next?.next?.value).toBe(50)
    expect(chain.count).toBe(0)
  })

  it("should addToBeginNode work properly", () => {
    const chain = new LinkedChain<number>()
    chain.add(10)
    const node1 = chain.removeAll()

    expect(node1).not.toBeNull()

    chain.add(20)
    const node2 = chain.removeAll()

    expect(node2).not.toBeNull()

    chain.add(30)
    chain.add(40)
    const node3 = chain.removeAll()

    expect(node3).not.toBeNull()

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    chain.addToBeginNode(node1!)

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    chain.addToBeginNode(node2!)

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    chain.addToBeginNode(node3!)

    expect(chain.count).toBe(4)
    expect(chain.toArray()).toEqual([30, 40, 20, 10])
  })

  it("should not addToBeginNode add disposed nodes", () => {
    const chain = new LinkedChain<number>()
    chain.add(10)
    const node1 = chain.removeAll()

    expect(node1).not.toBeNull()

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    chain.addToBeginNode(node1!)
    chain.clear()

    expect(chain.count).toBe(0)

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    chain.addToBeginNode(node1!)

    expect(chain.count).toBe(0)
  })

  it("should addToBeginNode add multiple nodes at once on empty chain", () => {
    const chain = new LinkedChain<number>()
    chain.add(10)
    chain.add(20)
    chain.add(30)
    const node = chain.removeAll()

    expect(node).not.toBeNull()

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    chain.addToBeginNode(node!)

    expect(chain.count).toBe(3)
    expect(chain.toArray()).toEqual([10, 20, 30])
  })

  it("should unlink tail properly", () => {
    const chain = new LinkedChain<number>()
    chain.add(10)
    chain.add(20)
    chain.add(30)
    chain.remove(30)
    chain.add(40)
    chain.add(50)

    expect(chain.toArray()).toEqual([10, 20, 40, 50])
  })
})

describe("linked chain pending", () => {
  it("should calc pending count", () => {
    const chain = new LinkedChain<Action>()
    const func2 = jest.fn()
    const func1 = () => {
      expect(chain.count).toBe(1)
      chain.add(func2)
      expect(chain.count).toBe(2)
    }
    chain.add(func1)
    chain.forEach((a) => a())
    expect(chain.count).toBe(2)
  })

  it("action should calc pending count", () => {
    const chain = new LinkedActionChain()
    const func2 = jest.fn()
    const func1 = () => {
      expect(chain.count).toBe(1)
      chain.add(func2)
      expect(chain.count).toBe(2)
    }
    chain.add(func1)
    chain.forEach()
    expect(chain.count).toBe(2)
  })

  it("should return pending in toArray", () => {
    const chain = new LinkedChain<Action>()
    const func2 = jest.fn()
    const func1 = () => {
      expect(chain.toArray()).toEqual([func1])
      chain.add(func2)
      expect(chain.toArray()).toEqual([func1, func2])
    }
    chain.add(func1)
    chain.forEach((a) => a())
    expect(chain.toArray()).toEqual([func1, func2])
  })

  it("action should return pending in toArray", () => {
    const chain = new LinkedActionChain()
    const func2 = jest.fn()
    const func1 = () => {
      expect(chain.toArray()).toEqual([func1])
      chain.add(func2)
      expect(chain.toArray()).toEqual([func1, func2])
    }
    chain.add(func1)
    chain.forEach()
    expect(chain.toArray()).toEqual([func1, func2])
  })

  it("should add multiple actions to pending node", () => {
    const chain = new LinkedChain<Action>()
    const func2 = jest.fn()
    const func3 = jest.fn()
    const func1 = () => {
      chain.addUnique(func2)
      chain.addUnique(func3)
    }
    chain.add(func1)
    chain.forEach((a) => a())
    expect(func2).toHaveBeenCalledTimes(0)
    expect(func3).toHaveBeenCalledTimes(0)

    chain.forEach((a) => a())

    expect(func2).toHaveBeenCalledTimes(1)
    expect(func3).toHaveBeenCalledTimes(1)
  })

  it("action should add multiple actions to pending node", () => {
    const chain = new LinkedActionChain()
    const func2 = jest.fn()
    const func3 = jest.fn()
    const func1 = () => {
      chain.addUnique(func2)
      chain.addUnique(func3)
    }
    chain.add(func1)
    chain.forEach()
    expect(func2).toHaveBeenCalledTimes(0)
    expect(func3).toHaveBeenCalledTimes(0)

    chain.forEach()

    expect(func2).toHaveBeenCalledTimes(1)
    expect(func3).toHaveBeenCalledTimes(1)
  })

  it("should clear pending", () => {
    const chain = new LinkedChain<Action>()
    const func2 = jest.fn()
    const func1 = () => {
      chain.add(func2)
      chain.clear()
    }
    chain.add(func1)
    chain.forEach((a) => a())
    expect(chain.count).toBe(0)
  })

  it("action should clear pending", () => {
    const chain = new LinkedActionChain()
    const func2 = jest.fn()
    const func1 = () => {
      chain.add(func2)
      chain.clear()
    }
    chain.add(func1)
    chain.forEach()
    expect(chain.count).toBe(0)
  })

  it("should remove pending", () => {
    const chain = new LinkedChain<Action>()
    const func2 = jest.fn()
    const func1 = () => {
      chain.add(func2)
      chain.remove(func2)
    }
    chain.add(func1)
    chain.forEach((a) => a())
    expect(chain.count).toBe(1)
    expect(chain.toArray()).toEqual([func1])
  })

  it("action should remove pending", () => {
    const chain = new LinkedActionChain()
    const func2 = jest.fn()
    const func1 = () => {
      chain.add(func2)
      chain.remove(func2)
    }
    chain.add(func1)
    chain.forEach()
    expect(chain.count).toBe(1)
    expect(chain.toArray()).toEqual([func1])
  })

  it("should remove pending using disposable", () => {
    const chain = new LinkedChain<Action>()
    const func2 = jest.fn()
    const func1 = () => {
      const itemDisposable = chain.add(func2)
      itemDisposable.dispose()
    }
    chain.add(func1)
    chain.forEach((a) => a())
    expect(chain.count).toBe(1)
    expect(chain.toArray()).toEqual([func1])
  })

  it("action should remove pending using disposable", () => {
    const chain = new LinkedActionChain()
    const func2 = jest.fn()
    const func1 = () => {
      const itemDisposable = chain.add(func2)
      itemDisposable.dispose()
    }
    chain.add(func1)
    chain.forEach()
    expect(chain.count).toBe(1)
    expect(chain.toArray()).toEqual([func1])
  })

  it("should not fail on remove pending twice", () => {
    const chain = new LinkedChain<Action>()
    const func2 = jest.fn()
    const func3 = jest.fn()
    const func1 = () => {
      chain.add(func2)
      chain.add(func3)
      chain.remove(func2)
      chain.remove(func2)
    }
    chain.add(func1)
    chain.forEach((a) => a())
    expect(chain.count).toBe(2)
    expect(chain.toArray()).toEqual([func1, func3])
  })

  it("action should not fail on remove pending twice", () => {
    const chain = new LinkedActionChain()
    const func2 = jest.fn()
    const func3 = jest.fn()
    const func1 = () => {
      chain.add(func2)
      chain.add(func3)
      chain.remove(func2)
      chain.remove(func2)
    }
    chain.add(func1)
    chain.forEach()
    expect(chain.count).toBe(2)
    expect(chain.toArray()).toEqual([func1, func3])
  })

  it("should not add existing pending", () => {
    const chain = new LinkedChain<Action>()
    const func2 = jest.fn()
    const func1 = () => {
      chain.add(func2)
      chain.addUnique(func2)
    }
    chain.add(func1)
    chain.forEach((a) => a())
    expect(chain.count).toBe(2)
    expect(chain.toArray()).toEqual([func1, func2])
  })

  it("action should not add existing pending", () => {
    const chain = new LinkedActionChain()
    const func2 = jest.fn()
    const func1 = () => {
      chain.add(func2)
      chain.addUnique(func2)
    }
    chain.add(func1)
    chain.forEach()
    expect(chain.count).toBe(2)
    expect(chain.toArray()).toEqual([func1, func2])
  })

  it("should unlink pending tail properly", () => {
    const chain = new LinkedChain<Action>()
    const func2 = jest.fn()
    const func3 = jest.fn()
    const func4 = jest.fn()
    const func1 = () => {
      chain.add(func2)
      chain.add(func3)
      chain.remove(func3)
    }
    chain.add(func1)

    chain.forEach((a) => a())

    chain.add(func4)

    expect(chain.toArray()).toEqual([func1, func2, func4])
  })

  it("action should unlink pending tail properly", () => {
    const chain = new LinkedActionChain()
    const func2 = jest.fn()
    const func3 = jest.fn()
    const func4 = jest.fn()
    const func1 = () => {
      chain.add(func2)
      chain.add(func3)
      chain.remove(func3)
    }
    chain.add(func1)

    chain.forEach()

    chain.add(func4)

    expect(chain.toArray()).toEqual([func1, func2, func4])
  })

  it("should support recursive forEach", () => {
    const chain = new LinkedChain<Action<number>>()
    const func2 = jest.fn()
    const func3 = jest.fn()
    const func1 = () => {
      chain.forEach((a) => a(2))
      chain.remove(func1)
      chain.add(func2)
      chain.add(func3)
    }
    chain.add(func1)

    chain.forEach((a) => a(1))

    expect(func2).toHaveBeenCalledTimes(1)
    expect(func2).toHaveBeenCalledWith(2)
    expect(func3).toHaveBeenCalledTimes(1)
    expect(func3).toHaveBeenCalledWith(2)
  })

  it("action should support recursive forEach", () => {
    const chain = new LinkedActionChain<number>()
    const func2 = jest.fn()
    const func3 = jest.fn()
    const func1 = () => {
      chain.forEach(2)
      chain.remove(func1)
      chain.add(func2)
      chain.add(func3)
    }
    chain.add(func1)

    chain.forEach(1)

    expect(func2).toHaveBeenCalledTimes(1)
    expect(func2).toHaveBeenCalledWith(2)
    expect(func3).toHaveBeenCalledTimes(1)
    expect(func3).toHaveBeenCalledWith(2)
  })

  it("should support multiple pending recursive forEach-es", () => {
    const chain = new LinkedChain<Action<number>>()
    const func2 = jest.fn()
    const func3 = jest.fn()
    const func1 = () => {
      chain.forEach((a) => a(2))
      chain.forEach((a) => a(3))
      chain.forEach((a) => a(4))
      chain.remove(func1)
      chain.add(func2)
      chain.add(func3)
    }
    chain.add(func1)

    chain.forEach((a) => a(1))

    expect(func2).toHaveBeenCalledTimes(3)
    expect(func2).toHaveBeenCalledWith(2)
    expect(func2).toHaveBeenCalledWith(3)
    expect(func2).toHaveBeenCalledWith(4)
    expect(func3).toHaveBeenCalledTimes(3)
    expect(func3).toHaveBeenCalledWith(2)
    expect(func3).toHaveBeenCalledWith(3)
    expect(func3).toHaveBeenCalledWith(4)
  })


  it("action should support multiple pending recursive forEach-es", () => {
    const chain = new LinkedActionChain<number>()
    const func2 = jest.fn()
    const func3 = jest.fn()
    const func1 = () => {
      chain.forEach(2)
      chain.forEach(3)
      chain.forEach(4)
      chain.remove(func1)
      chain.add(func2)
      chain.add(func3)
    }
    chain.add(func1)

    chain.forEach(1)

    expect(func2).toHaveBeenCalledTimes(3)
    expect(func2).toHaveBeenCalledWith(2)
    expect(func2).toHaveBeenCalledWith(3)
    expect(func2).toHaveBeenCalledWith(4)
    expect(func3).toHaveBeenCalledTimes(3)
    expect(func3).toHaveBeenCalledWith(2)
    expect(func3).toHaveBeenCalledWith(3)
    expect(func3).toHaveBeenCalledWith(4)
  })

  it("action should dispatch when the value is null", () => {
    const chain = new LinkedActionChain<unknown>()
    const func1 = jest.fn()
    chain.add(func1)

    chain.forEach(null)

    expect(func1).toHaveBeenCalledTimes(1)
  })
})
