import {DisposableAction, DisposableCompat} from "@tioniq/disposiq"
import {defaultEqualityComparer, EqualityComparer} from "./comparer"

type Action<T> = (value: T) => void

/**
 * A linked chain is a collection of elements that can be iterated over. It is similar to a linked list, but it is
 * optimized for adding and removing elements. The implementation safely handles the addition and removal of elements during
 * iteration. The implementation is based on the Disposable pattern.
 */
export class LinkedChain<T> {
  /**
   * @internal
   */
  private readonly _equalityComparer: EqualityComparer<T>
  /**
   * @internal
   */
  private _head: ChainNode<T> | null = null
  /**
   * @internal
   */
  private _tail: ChainNode<T> | null = null
  /**
   * @internal
   */
  private _invoking: boolean = false
  /**
   * @internal
   */
  private _pendingHead: ChainNode<T> | null = null
  /**
   * @internal
   */
  private _pendingTail: ChainNode<T> | null = null
  /**
   * @internal
   */
  private _actionHead: ChainNode<Action<T>> | null = null

  constructor(equalityComparer?: EqualityComparer<T>) {
    this._equalityComparer = equalityComparer ?? defaultEqualityComparer
  }

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
  addUnique(value: T): [subscription: DisposableCompat, added: boolean] {
    const existing = this._findNode(value)
    if (existing !== null) {
      return [new DisposableAction(() => this._unlinkNode(existing)), false]
    }
    return [this.add(value), true]
  }

  /**
   * Adds an element to the end of the chain
   * @param value the element to add
   * @returns a subscription that can be used to remove the element from the chain
   */
  add(value: T): DisposableCompat {
    let node: ChainNode<T>
    if (this._invoking) {
      if (this._pendingHead === null) {
        node = new ChainNode(value)
        this._pendingHead = node
        this._pendingTail = node
      } else {
        node = new ChainNode(value, this._pendingTail, null)
        this._pendingTail!.next = node
        this._pendingTail = node
      }
      return new DisposableAction(() => this._unlinkNode(node))
    }
    if (this._head === null) {
      node = new ChainNode(value)
      this._head = node
      this._tail = node
    } else {
      node = new ChainNode(value, this._tail, null)
      this._tail!.next = node
      this._tail = node
    }
    return new DisposableAction(() => this._unlinkNode(node))
  }

  /**
   * Adds an element to the beginning of the chain. If the element is already in the chain, it will not be added again.
   * @param value the element to add
   * @returns an array containing the subscription and a boolean value indicating if the element was added
   */
  addToBeginUnique(value: T): [subscription: DisposableCompat, added: boolean] {
    const existing = this._findNode(value)
    if (existing !== null) {
      return [new DisposableAction(() => this._unlinkNode(existing)), false]
    }
    return [this.addToBegin(value), true]
  }

  /**
   * Adds an element to the beginning of the chain
   * @param value the element to add
   * @returns a subscription that can be used to remove the element from the chain
   */
  addToBegin(value: T): DisposableCompat {
    let node: ChainNode<T>
    if (this._head === null) {
      node = new ChainNode(value)
      this._head = node
      this._tail = node
    } else {
      node = new ChainNode(value, null, this._head)
      this._head.previous = node
      this._head = node
    }
    return new DisposableAction(() => this._unlinkNode(node))
  }

  /**
   * Adds a node and its children to the end of the chain
   * @param node
   * @remarks This method does not check if the node is already in a chain
   */
  addToBeginNode(node: ChainNode<T>): void {
    let chainNode = LinkedChain._clearNode(node)
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
        this._unlinkNode(checkNode)
        return true
      }
      checkNode = checkNode.next
    }
    checkNode = this._pendingHead
    while (checkNode !== null) {
      if (this._equalityComparer(checkNode.value, value)) {
        this._unlinkNode(checkNode)
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
  }

  /**
   * Removes all elements from the chain and returns the head node
   * @returns the head node of the chain or null if the chain is empty
   */
  removeAll(): ChainNode<T> | null {
    let node = this._head
    this._head = null
    this._tail = null
    return node
  }

  /**
   * Iterates over the elements of the chain and invokes the specified action for each element
   * @param valueHandler the action to invoke for each element
   */
  forEach(valueHandler: Action<T>): void {
    while (valueHandler !== null) {
      if (this._head !== null) {
        if (this._invoking) {
          if (this._actionHead == null) {
            this._actionHead = new ChainNode<Action<T>>(valueHandler)
            return
          }
          let actionTail = this._actionHead
          while (actionTail.next !== null) {
            actionTail = actionTail.next
          }
          actionTail.next = new ChainNode<Action<T>>(valueHandler, actionTail, null)
          return
        }
        this._invoking = true
        let node: ChainNode<T> | null = this._head
        while (node !== null) {
          if (!node.disposed) {
            valueHandler(node.value)
          }
          node = node.next
        }
        this._invoking = false

        if (this._pendingHead != null) {
          if (this._head == null) {
            this._head = this._pendingHead
            this._tail = this._pendingTail
          } else {
            this._pendingHead.previous = this._tail
            this._tail!.next = this._pendingHead
            this._tail = this._pendingTail
          }
          this._pendingHead = null
          this._pendingTail = null
        }
      }
      if (this._actionHead == null) {
        return
      }
      let nextActionNode = this._actionHead
      nextActionNode.disposed = true
      this._actionHead = nextActionNode.next
      if (this._actionHead != null) {
        this._actionHead.previous = null
        nextActionNode.next = null
      }
      valueHandler = nextActionNode.value
    }
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

  /**
   * @internal
   */
  private _unlinkNode(node: ChainNode<T>): void {
    if (node.disposed) {
      return
    }
    node.disposed = true
    if (node === this._head) {
      if (node.next === null) {
        this._head = null
        this._tail = null
        return
      }
      this._head = node.next
      this._head.previous = null
      return
    }
    if (node === this._tail) {
      this._tail = node.previous
      this._tail!.next = null
      return
    }
    if (node === this._pendingHead) {
      if (node.next == null) {
        this._pendingHead = null
        this._pendingTail = null
        return
      }
      this._pendingHead = node.next
      this._pendingHead.previous = null
      return
    }
    if (node === this._pendingTail) {
      this._pendingTail = node.previous
      this._pendingTail!.next = null
      return
    }
    if (node.previous !== null) {
      node.previous.next = node.next
    }
    if (node.next !== null) {
      node.next.previous = node.previous
    }
  }

  /**
   * @internal
   */
  private static _clearNode<T>(node: ChainNode<T> | null): ChainNode<T> | null {
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
      tail!.next = node
      node.previous = tail
      tail = node
    }
    if (tail !== null) {
      tail.next = null
    }
    return root
  }
}

class ChainNode<T> {
  readonly value: T
  next: ChainNode<T> | null
  previous: ChainNode<T> | null
  disposed: boolean = false

  constructor(value: T, previous?: ChainNode<T> | null, next?: ChainNode<T> | null) {
    this.value = value
    this.previous = previous ?? null
    this.next = next ?? null
  }
}