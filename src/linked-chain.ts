import { Disposiq } from "@tioniq/disposiq"
import { defaultEqualityComparer, type EqualityComparer, functionEqualityComparer } from "./comparer"

type Action<T> = (value: T) => void

/**
 * A linked chain is a collection of elements that can be iterated over. It is similar to a linked list, but it is
 * optimized for adding and removing elements. The implementation safely handles the addition and removal of elements during
 * iteration. The implementation is based on the Disposable pattern.
 */
export class BaseLinkedChain<T> {
  /**
   * @internal
   */
  private readonly _equalityComparer: EqualityComparer<T>
  /**
   * @internal
   */
  _head: ChainNode<T> | null = null
  /**
   * @internal
   */
  _tail: ChainNode<T> | null = null
  /**
   * @internal
   */
  protected _invoking = false
  /**
   * @internal
   */
  _pendingHead: ChainNode<T> | null = null
  /**
   * @internal
   */
  _pendingTail: ChainNode<T> | null = null

  constructor(equalityComparer?: EqualityComparer<T>) {
    this._equalityComparer = equalityComparer ?? defaultEqualityComparer
  }

  /**
   * Represents a callback action triggered when a specific condition
   * or state is determined to be empty.
   *
   */
  onEmpty: Action<void> | null = null

  /**
   * Checks if the chain has any elements
   */
  get hasAny(): boolean {
    return this._head !== null || this._pendingHead !== null
  }

  /**
   * Checks if the chain is empty
   */
  get empty(): boolean {
    return this._head === null && this._pendingHead === null
  }

  /**
   * Gets the number of elements in the chain
   * @remarks This getter should be used only for debugging purposes
   */
  get count(): number {
    let count = 0
    let node = this._head
    if (node !== null) {
      do {
        ++count
        node = node.next
      } while (node !== null)
    }
    node = this._pendingHead
    if (node !== null) {
      do {
        count++
        node = node.next
      } while (node !== null)
    }
    return count
  }

  /**
   * Converts the chain to an array
   * @returns an array containing the elements of the chain
   * @remarks This method should be used only for debugging purposes
   */
  toArray(): T[] {
    const count = this.count
    if (count === 0) {
      return []
    }
    const array = new Array<T>(count)
    let node = this._head
    let index = 0
    if (node !== null) {
      do {
        array[index++] = node.value
        node = node.next
      } while (node !== null)
    }
    node = this._pendingHead
    if (node !== null) {
      do {
        array[index++] = node.value
        node = node.next
      } while (node !== null)
    }
    return array
  }

  /**
   * Adds an element to the chain. If the element is already in the chain, it will not be added again.
   * @param value the element to add
   * @returns an array containing the subscription and a boolean value indicating if the element was added
   */
  addUnique(value: T): [subscription: Disposiq, added: boolean] {
    const existing = this._findNode(value)
    if (existing !== null) {
      return [existing, false]
    }
    return [this.add(value), true]
  }

  /**
   * Adds an element to the end of the chain
   * @param value the element to add
   * @returns a subscription that can be used to remove the element from the chain
   */
  add(value: T): Disposiq {
    let node: ChainNode<T>
    if (this._invoking) {
      if (this._pendingHead === null) {
        node = new ChainNode(this, value)
        this._pendingHead = node
      } else {
        node = new ChainNode(this, value, this._pendingTail, null)
        // biome-ignore lint/style/noNonNullAssertion: _pendingTail is always not null when _pendingHead is not null
        this._pendingTail!.next = node
      }
      this._pendingTail = node
      return node
    }
    if (this._head === null) {
      node = new ChainNode(this, value)
      this._head = node
    } else {
      node = new ChainNode(this, value, this._tail, null)
      // biome-ignore lint/style/noNonNullAssertion: _tail is always not null when _head is not null
      this._tail!.next = node
    }
    this._tail = node
    return node
  }

  /**
   * Adds an element to the beginning of the chain. If the element is already in the chain, it will not be added again.
   * @param value the element to add
   * @returns an array containing the subscription and a boolean value indicating if the element was added
   */
  addToBeginUnique(value: T): [subscription: Disposiq, added: boolean] {
    const existing = this._findNode(value)
    if (existing !== null) {
      return [existing, false]
    }
    return [this.addToBegin(value), true]
  }

  /**
   * Adds an element to the beginning of the chain
   * @param value the element to add
   * @returns a subscription that can be used to remove the element from the chain
   */
  addToBegin(value: T): Disposiq {
    let node: ChainNode<T>
    if (this._head === null) {
      node = new ChainNode(this, value)
      this._head = node
      this._tail = node
    } else {
      node = new ChainNode(this, value, null, this._head)
      this._head.previous = node
      this._head = node
    }
    return node
  }

  /**
   * Adds a node and its children to the end of the chain
   * @param node
   * @remarks This method does not check if the node is already in a chain
   */
  addToBeginNode(node: ChainNode<T>): void {
    let chainNode = _clearNode(node)
    if (chainNode === null) {
      return
    }
    if (this._head === null) {
      this._head = chainNode
      while (chainNode.next !== null) {
        chainNode = chainNode.next
      }
      this._tail = chainNode
      return
    }
    let tail = chainNode
    while (tail.next !== null) {
      tail = tail.next
    }
    tail.next = this._head
    this._head.previous = tail
    this._head = chainNode
  }

  /**
   * Removes an element from the chain
   * @param value the element to remove
   * @returns true if the element was removed, false otherwise
   */
  remove(value: T): boolean {
    let checkNode = this._head
    while (checkNode !== null) {
      if (this._equalityComparer(checkNode.value, value)) {
        checkNode.dispose()
        return true
      }
      checkNode = checkNode.next
    }
    checkNode = this._pendingHead
    while (checkNode !== null) {
      if (this._equalityComparer(checkNode.value, value)) {
        checkNode.dispose()
        return true
      }
      checkNode = checkNode.next
    }
    return false
  }

  /**
   * Removes all elements from the chain
   */
  clear(): void {
    let node = this._head
    if (node === null && this._pendingHead === null) {
      return
    }
    if (node !== null) {
      while (node !== null) {
        node.disposed = true
        node = node.next
      }
      this._head = null
      this._tail = null
    }
    node = this._pendingHead
    if (node !== null) {
      while (node !== null) {
        node.disposed = true
        node = node.next
      }
      this._pendingHead = null
      this._pendingTail = null
    }
    this.onEmpty?.()
  }

  /**
   * Removes all elements from the chain and returns the head node
   * @returns the head node of the chain or null if the chain is empty
   */
  removeAll(): ChainNode<T> | null {
    const node = this._head
    if (node === null) {
      return null
    }
    this._head = null
    this._tail = null
    if (this._pendingHead === null) {
      this.onEmpty?.()
    }
    return node
  }

  /**
   * @internal
   */
  private _findNode(value: T): ChainNode<T> | null {
    let checkNode = this._head
    while (checkNode !== null) {
      if (this._equalityComparer(checkNode.value, value)) {
        return checkNode
      }
      checkNode = checkNode.next
    }
    if (this._invoking) {
      checkNode = this._pendingHead
      while (checkNode !== null) {
        if (this._equalityComparer(checkNode.value, value)) {
          return checkNode
        }
        checkNode = checkNode.next
      }
    }
    return null
  }
}

export class LinkedChain<T> extends BaseLinkedChain<T> {
  /**
   * @internal
   */
  private _actionHead: Action<T>[] | null = null


  /**
   * Iterates over the elements of the chain and invokes the specified action for each element
   * @param valueHandler the action to invoke for each element
   */
  forEach(valueHandler: Action<T>): void {
    let handler = valueHandler
    while (handler !== null) {
      if (this._head !== null) {
        if (this._invoking) {
          if (this._actionHead === null) {
            this._actionHead = [handler]
            return
          }
          this._actionHead.push(handler)
          return
        }
        this._invoking = true
        let node: ChainNode<T> | null = this._head
        while (node !== null) {
          if (!node.disposed) {
            handler(node.value)
          }
          node = node.next
        }
        this._invoking = false

        if (this._pendingHead != null) {
          if (this._head == null) {
            this._head = this._pendingHead
          } else {
            this._pendingHead.previous = this._tail
            // biome-ignore lint/style/noNonNullAssertion: _tail is not null when _head is not null
            this._tail!.next = this._pendingHead
          }
          this._tail = this._pendingTail
          this._pendingHead = null
          this._pendingTail = null
        }
      }
      if (this._actionHead === null) {
        return
      }
      handler = this._actionHead.shift() as Action<T>
      if (this._actionHead.length === 0) {
        this._actionHead = null
      }
    }
  }
}

export class LinkedActionChain<T = void> extends BaseLinkedChain<Action<T>> {
  /**
   * @internal
   */
  private _actionHead: Array<T> | null = null

  constructor() {
    super(functionEqualityComparer)
  }

  /**
   * Iterates over the elements of the chain and invokes each element
   * @param value the value to pass to each element
   */
  forEach(value: T): void {
    let theValue = value
    while (theValue !== null) {
      if (this._head !== null) {
        if (this._invoking) {
          if (this._actionHead === null) {
            this._actionHead = [theValue]
            return
          }
          this._actionHead.push(theValue)
          return
        }
        this._invoking = true
        let node: ChainNode<Action<T>> | null = this._head
        while (node !== null) {
          if (!node.disposed) {
            node.value(theValue)
          }
          node = node.next
        }
        this._invoking = false

        if (this._pendingHead != null) {
          if (this._head == null) {
            this._head = this._pendingHead
          } else {
            this._pendingHead.previous = this._tail
            // biome-ignore lint/style/noNonNullAssertion: _tail is not null when _head is not null
            this._tail!.next = this._pendingHead
          }
          this._tail = this._pendingTail
          this._pendingHead = null
          this._pendingTail = null
        }
      }
      if (this._actionHead === null) {
        return
      }
      theValue = this._actionHead.shift() as T
      if (this._actionHead.length === 0) {
        this._actionHead = null
      }
    }
  }
}

class ChainNode<T> extends Disposiq {
  readonly value: T
  readonly chain: BaseLinkedChain<T>
  next: ChainNode<T> | null
  previous: ChainNode<T> | null
  disposed = false

  constructor(
    chain: BaseLinkedChain<T>,
    value: T,
    previous?: ChainNode<T> | null,
    next?: ChainNode<T> | null,
  ) {
    super()
    this.chain = chain
    this.value = value
    this.previous = previous ?? null
    this.next = next ?? null
  }

  dispose() {
    if (this.disposed) {
      return
    }
    this.disposed = true
    const chain = this.chain
    if (this === chain._head) {
      if (this.next === null) {
        chain._head = null
        chain._tail = null
        if (chain._pendingHead === null) {
          chain.onEmpty?.()
        }
        return
      }
      chain._head = this.next
      chain._head.previous = null
      return
    }
    if (this === chain._tail) {
      chain._tail = this.previous
      // biome-ignore lint/style/noNonNullAssertion: _tail is not null because the chain has more one node
      chain._tail!.next = null
      return
    }
    if (this === chain._pendingHead) {
      if (this.next === null) {
        chain._pendingHead = null
        chain._pendingTail = null
        if (chain._head === null) {
          chain.onEmpty?.()
        }
        return
      }
      chain._pendingHead = this.next
      chain._pendingHead.previous = null
      return
    }
    if (this === chain._pendingTail) {
      chain._pendingTail = this.previous
      // biome-ignore lint/style/noNonNullAssertion: _pendingTail is not null because the pending chain has more one node
      chain._pendingTail!.next = null
      return
    }
    if (this.previous !== null) {
      this.previous.next = this.next
    }
    if (this.next !== null) {
      this.next.previous = this.previous
    }
  }
}


/**
 * @internal
 */
function _clearNode<T>(chainNode: ChainNode<T> | null): ChainNode<T> | null {
  let node = chainNode
  let root: ChainNode<T> | null = null
  let tail: ChainNode<T> | null = null
  let next: ChainNode<T> | null = node
  while (next !== null) {
    node = next
    next = node.next
    if (node.disposed) {
      continue
    }
    if (root === null) {
      root = node
      tail = node
      node.previous = null
      continue
    }
    // biome-ignore lint/style/noNonNullAssertion: tail is not null when root is not null
    tail!.next = node
    node.previous = tail
    tail = node
  }
  if (tail !== null) {
    tail.next = null
  }
  return root
}