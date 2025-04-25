// src/variable.ts
var Variable = class {
  /**
   * Overload of the `toString` method. Returns the string representation of the value of the variable
   * @returns the string representation of the value of the variable
   */
  toString() {
    const _value = this.value;
    if (_value === null || _value === void 0) {
      return `${_value}`;
    }
    return _value.toString();
  }
  /**
   * Overload of the `valueOf` method. Converts the variable to a primitive value, in this case, the value of the variable
   * @returns the primitive value of the variable
   */
  valueOf() {
    return this.value;
  }
};

// src/comparer.ts
function strictEqualityComparer(a, b) {
  return a === b;
}
function simpleEqualityComparer(a, b) {
  return a == b;
}
var defaultEqualityComparer = strictEqualityComparer;
function setDefaultEqualityComparer(comparer) {
  defaultEqualityComparer = comparer;
}
function functionEqualityComparer(a, b) {
  return a === b;
}
function generalEqualityComparer(a, b) {
  if (a === b) {
    return true;
  }
  const typeA = typeof a;
  const typeB = typeof b;
  if (typeA !== typeB) {
    return false;
  }
  if (typeA === "object") {
    return objectEqualityComparer(a, b);
  }
  if (typeA === "function") {
    return functionEqualityComparer(a, b);
  }
  return simpleEqualityComparer(a, b);
}
function objectEqualityComparer(a, b) {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  const arrayA = Array.isArray(a);
  const arrayB = Array.isArray(b);
  if (arrayA !== arrayB) {
    return false;
  }
  if (arrayA) {
    return arrayEqualityComparer(a, b);
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }
  for (const key of keysA) {
    if (!keysB.includes(key)) {
      return false;
    }
    const valueA = a[key];
    const valueB = b[key];
    if (!generalEqualityComparer(valueA, valueB)) {
      return false;
    }
  }
  return true;
}
function arrayEqualityComparer(a, b) {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; ++i) {
    if (!generalEqualityComparer(a[i], b[i])) {
      return false;
    }
  }
  return true;
}

// src/linked-chain.ts
import { DisposableAction } from "@tioniq/disposiq";
var LinkedChain = class _LinkedChain {
  constructor(equalityComparer) {
    /**
     * @internal
     */
    this._head = null;
    /**
     * @internal
     */
    this._tail = null;
    /**
     * @internal
     */
    this._invoking = false;
    /**
     * @internal
     */
    this._pendingHead = null;
    /**
     * @internal
     */
    this._pendingTail = null;
    /**
     * @internal
     */
    this._actionHead = null;
    this._equalityComparer = equalityComparer != null ? equalityComparer : defaultEqualityComparer;
  }
  /**
   * Checks if the chain has any elements
   */
  get hasAny() {
    return this._head !== null || this._pendingHead !== null;
  }
  /**
   * Checks if the chain is empty
   */
  get empty() {
    return this._head === null && this._pendingHead === null;
  }
  /**
   * Gets the number of elements in the chain
   * @remarks This getter should be used only for debugging purposes
   */
  get count() {
    let count = 0;
    let node = this._head;
    if (node !== null) {
      do {
        ++count;
        node = node.next;
      } while (node !== null);
    }
    node = this._pendingHead;
    if (node !== null) {
      do {
        count++;
        node = node.next;
      } while (node !== null);
    }
    return count;
  }
  /**
   * Converts the chain to an array
   * @returns an array containing the elements of the chain
   * @remarks This method should be used only for debugging purposes
   */
  toArray() {
    const count = this.count;
    if (count === 0) {
      return [];
    }
    const array = new Array(count);
    let node = this._head;
    let index = 0;
    if (node !== null) {
      do {
        array[index++] = node.value;
        node = node.next;
      } while (node !== null);
    }
    node = this._pendingHead;
    if (node !== null) {
      do {
        array[index++] = node.value;
        node = node.next;
      } while (node !== null);
    }
    return array;
  }
  /**
   * Adds an element to the chain. If the element is already in the chain, it will not be added again.
   * @param value the element to add
   * @returns an array containing the subscription and a boolean value indicating if the element was added
   */
  addUnique(value) {
    const existing = this._findNode(value);
    if (existing !== null) {
      return [new DisposableAction(() => this._unlinkNode(existing)), false];
    }
    return [this.add(value), true];
  }
  /**
   * Adds an element to the end of the chain
   * @param value the element to add
   * @returns a subscription that can be used to remove the element from the chain
   */
  add(value) {
    let node;
    if (this._invoking) {
      if (this._pendingHead === null) {
        node = new ChainNode(value);
        this._pendingHead = node;
        this._pendingTail = node;
      } else {
        node = new ChainNode(value, this._pendingTail, null);
        this._pendingTail.next = node;
        this._pendingTail = node;
      }
      return new DisposableAction(() => this._unlinkNode(node));
    }
    if (this._head === null) {
      node = new ChainNode(value);
      this._head = node;
      this._tail = node;
    } else {
      node = new ChainNode(value, this._tail, null);
      this._tail.next = node;
      this._tail = node;
    }
    return new DisposableAction(() => this._unlinkNode(node));
  }
  /**
   * Adds an element to the beginning of the chain. If the element is already in the chain, it will not be added again.
   * @param value the element to add
   * @returns an array containing the subscription and a boolean value indicating if the element was added
   */
  addToBeginUnique(value) {
    const existing = this._findNode(value);
    if (existing !== null) {
      return [new DisposableAction(() => this._unlinkNode(existing)), false];
    }
    return [this.addToBegin(value), true];
  }
  /**
   * Adds an element to the beginning of the chain
   * @param value the element to add
   * @returns a subscription that can be used to remove the element from the chain
   */
  addToBegin(value) {
    let node;
    if (this._head === null) {
      node = new ChainNode(value);
      this._head = node;
      this._tail = node;
    } else {
      node = new ChainNode(value, null, this._head);
      this._head.previous = node;
      this._head = node;
    }
    return new DisposableAction(() => this._unlinkNode(node));
  }
  /**
   * Adds a node and its children to the end of the chain
   * @param node
   * @remarks This method does not check if the node is already in a chain
   */
  addToBeginNode(node) {
    let chainNode = _LinkedChain._clearNode(node);
    if (chainNode === null) {
      return;
    }
    if (this._head === null) {
      this._head = chainNode;
      while (chainNode.next !== null) {
        chainNode = chainNode.next;
      }
      this._tail = chainNode;
      return;
    }
    let tail = chainNode;
    while (tail.next !== null) {
      tail = tail.next;
    }
    tail.next = this._head;
    this._head.previous = tail;
    this._head = chainNode;
  }
  /**
   * Removes an element from the chain
   * @param value the element to remove
   * @returns true if the element was removed, false otherwise
   */
  remove(value) {
    let checkNode = this._head;
    while (checkNode !== null) {
      if (this._equalityComparer(checkNode.value, value)) {
        this._unlinkNode(checkNode);
        return true;
      }
      checkNode = checkNode.next;
    }
    checkNode = this._pendingHead;
    while (checkNode !== null) {
      if (this._equalityComparer(checkNode.value, value)) {
        this._unlinkNode(checkNode);
        return true;
      }
      checkNode = checkNode.next;
    }
    return false;
  }
  /**
   * Removes all elements from the chain
   */
  clear() {
    let node = this._head;
    if (node !== null) {
      while (node !== null) {
        node.disposed = true;
        node = node.next;
      }
      this._head = null;
      this._tail = null;
    }
    node = this._pendingHead;
    if (node !== null) {
      while (node !== null) {
        node.disposed = true;
        node = node.next;
      }
      this._pendingHead = null;
      this._pendingTail = null;
    }
  }
  /**
   * Removes all elements from the chain and returns the head node
   * @returns the head node of the chain or null if the chain is empty
   */
  removeAll() {
    const node = this._head;
    this._head = null;
    this._tail = null;
    return node;
  }
  /**
   * Iterates over the elements of the chain and invokes the specified action for each element
   * @param valueHandler the action to invoke for each element
   */
  forEach(valueHandler) {
    let handler = valueHandler;
    while (handler !== null) {
      if (this._head !== null) {
        if (this._invoking) {
          if (this._actionHead == null) {
            this._actionHead = new ChainNode(handler);
            return;
          }
          let actionTail = this._actionHead;
          while (actionTail.next !== null) {
            actionTail = actionTail.next;
          }
          actionTail.next = new ChainNode(handler, actionTail, null);
          return;
        }
        this._invoking = true;
        let node = this._head;
        while (node !== null) {
          if (!node.disposed) {
            handler(node.value);
          }
          node = node.next;
        }
        this._invoking = false;
        if (this._pendingHead != null) {
          if (this._head == null) {
            this._head = this._pendingHead;
            this._tail = this._pendingTail;
          } else {
            this._pendingHead.previous = this._tail;
            this._tail.next = this._pendingHead;
            this._tail = this._pendingTail;
          }
          this._pendingHead = null;
          this._pendingTail = null;
        }
      }
      if (this._actionHead == null) {
        return;
      }
      const nextActionNode = this._actionHead;
      nextActionNode.disposed = true;
      this._actionHead = nextActionNode.next;
      if (this._actionHead != null) {
        this._actionHead.previous = null;
        nextActionNode.next = null;
      }
      handler = nextActionNode.value;
    }
  }
  /**
   * @internal
   */
  _findNode(value) {
    let checkNode = this._head;
    while (checkNode !== null) {
      if (this._equalityComparer(checkNode.value, value)) {
        return checkNode;
      }
      checkNode = checkNode.next;
    }
    if (this._invoking) {
      checkNode = this._pendingHead;
      while (checkNode !== null) {
        if (this._equalityComparer(checkNode.value, value)) {
          return checkNode;
        }
        checkNode = checkNode.next;
      }
    }
    return null;
  }
  /**
   * @internal
   */
  _unlinkNode(node) {
    if (node.disposed) {
      return;
    }
    node.disposed = true;
    if (node === this._head) {
      if (node.next === null) {
        this._head = null;
        this._tail = null;
        return;
      }
      this._head = node.next;
      this._head.previous = null;
      return;
    }
    if (node === this._tail) {
      this._tail = node.previous;
      this._tail.next = null;
      return;
    }
    if (node === this._pendingHead) {
      if (node.next == null) {
        this._pendingHead = null;
        this._pendingTail = null;
        return;
      }
      this._pendingHead = node.next;
      this._pendingHead.previous = null;
      return;
    }
    if (node === this._pendingTail) {
      this._pendingTail = node.previous;
      this._pendingTail.next = null;
      return;
    }
    if (node.previous !== null) {
      node.previous.next = node.next;
    }
    if (node.next !== null) {
      node.next.previous = node.previous;
    }
  }
  /**
   * @internal
   */
  static _clearNode(chainNode) {
    let node = chainNode;
    let root = null;
    let tail = null;
    let next = node;
    while (next !== null) {
      node = next;
      next = node.next;
      if (node.disposed) {
        continue;
      }
      if (root === null) {
        root = node;
        tail = node;
        node.previous = null;
        continue;
      }
      tail.next = node;
      node.previous = tail;
      tail = node;
    }
    if (tail !== null) {
      tail.next = null;
    }
    return root;
  }
};
var ChainNode = class {
  constructor(value, previous, next) {
    this.disposed = false;
    this.value = value;
    this.previous = previous != null ? previous : null;
    this.next = next != null ? next : null;
  }
};

// src/vars/compound.ts
import { DisposableAction as DisposableAction2 } from "@tioniq/disposiq";
var CompoundVariable = class extends Variable {
  constructor(initValue, equalityComparer) {
    super();
    /**
     * @internal
     */
    this._chain = new LinkedChain(functionEqualityComparer);
    this._value = initValue;
    this._equalityComparer = equalityComparer != null ? equalityComparer : defaultEqualityComparer;
  }
  /**
   * Checks if there are any subscriptions
   * @returns true if there are any subscriptions, false otherwise
   */
  get active() {
    return this._chain.hasAny;
  }
  get value() {
    if (this._chain.hasAny) {
      return this._value;
    }
    return this.getExactValue();
  }
  /**
   * Sets the value of the variable. If the value is the same as the current value, the method will do nothing
   * @param value the new value of the variable
   * @protected internal use only
   */
  set value(value) {
    if (this._equalityComparer(value, this._value)) {
      return;
    }
    this._value = value;
    this._chain.forEach((a) => a(value));
  }
  subscribe(callback) {
    if (this._chain.empty) {
      this.activate();
    }
    const [disposable, added] = this._chain.addUnique(callback);
    if (added) {
      callback(this._value);
    }
    return new DisposableAction2(() => {
      disposable.dispose();
      if (this._chain.empty) {
        this.deactivate();
      }
    });
  }
  subscribeSilent(callback) {
    if (this._chain.empty) {
      this.activate();
    }
    const disposable = this._chain.addUnique(callback)[0];
    return new DisposableAction2(() => {
      disposable.dispose();
      if (this._chain.empty) {
        this.deactivate();
      }
    });
  }
  /**
   * A method for getting the exact value of the variable. It is called when there are no subscriptions
   * @protected internal use only
   * @returns the default behavior is to return the current (last) value of the variable
   * @remarks this method should be implemented in the derived class
   */
  getExactValue() {
    return this._value;
  }
  /**
   * A method for setting the value of the variable without notifying subscribers
   * @protected internal use only
   * @param value the new value of the variable
   * @deprecated user `setSilent` instead
   */
  setValueSilent(value) {
    this._value = value;
  }
  /**
   * A method for setting the value of the variable and notifying subscribers without checking the equality
   * @protected internal use only
   * @param value the new value of the variable
   * @deprecated user `setForce` instead
   */
  setValueForce(value) {
    this._value = value;
    this._chain.forEach((a) => a(value));
  }
  /**
   * A method for setting the value of the variable without notifying subscribers
   * @protected internal use only
   * @param value the new value of the variable
   */
  setSilent(value) {
    this._value = value;
  }
  /**
   * A method for setting the value of the variable and notifying subscribers without checking the equality
   * @protected internal use only
   * @param value the new value of the variable
   */
  setForce(value) {
    this._value = value;
    this._chain.forEach((a) => a(value));
  }
  /**
   * A method for notifying subscribers about the value change
   * @protected internal use only
   */
  notify() {
    const value = this._value;
    this._chain.forEach((a) => a(value));
  }
};

// src/vars/and.ts
import { disposeAll } from "@tioniq/disposiq";
var AndVariable = class extends CompoundVariable {
  constructor(variables) {
    super(false);
    /**
     * @internal
     */
    this._subscriptions = [];
    this._variables = variables;
  }
  activate() {
    this._listen(0);
  }
  deactivate() {
    disposeAll(this._subscriptions);
  }
  getExactValue() {
    const variables = this._variables;
    for (let i = 0; i < variables.length; ++i) {
      if (!variables[i].value) {
        return false;
      }
    }
    return true;
  }
  /**
   * @internal
   */
  _listen(index) {
    if (index >= this._variables.length) {
      this.value = true;
      return;
    }
    if (this._subscriptions.length > index) {
      return;
    }
    const __listener = (value) => {
      if (value) {
        this._listen(index + 1);
      } else {
        this._unsubscribeFrom(index + 1);
        this.value = false;
      }
    };
    const variable = this._variables[index];
    this._subscriptions.push(variable.subscribeSilent(__listener));
    __listener(variable.value);
    return;
  }
  /**
   * @internal
   */
  _unsubscribeFrom(index) {
    var _a;
    while (index < this._subscriptions.length) {
      (_a = this._subscriptions.pop()) == null ? void 0 : _a.dispose();
    }
  }
};

// src/vars/combined.ts
import { DisposableStore } from "@tioniq/disposiq";
var CombinedVariable = class extends CompoundVariable {
  constructor(vars) {
    if (!(vars == null ? void 0 : vars.length)) {
      throw new Error("No variables provided");
    }
    super(stubArray, arrayEqualityComparer);
    /**
     * @internal
     */
    this._subscriptions = new DisposableStore();
    this._vars = vars.slice();
  }
  activate() {
    this._subscriptions.disposeCurrent();
    const length = this._vars.length;
    const result = new Array(length);
    for (let i = 0; i < length; ++i) {
      const vary = this._vars[i];
      this._subscriptions.add(
        vary.subscribeSilent((value) => {
          result[i] = value;
          this.setForce(result);
        })
      );
      result[i] = vary.value;
    }
    this.setForce(result);
  }
  deactivate() {
    this._subscriptions.disposeCurrent();
  }
  getExactValue() {
    const length = this._vars.length;
    const result = new Array(length);
    for (let i = 0; i < length; ++i) {
      result[i] = this._vars[i].value;
    }
    return result;
  }
};
var stubArray = Object.freeze([]);

// src/vars/constant.ts
import { emptyDisposable } from "@tioniq/disposiq";
var ConstantVariable = class extends Variable {
  constructor(value, equalityComparer) {
    super();
    this._value = value;
    this._equalityComparer = equalityComparer != null ? equalityComparer : defaultEqualityComparer;
  }
  get value() {
    return this._value;
  }
  get equalityComparer() {
    return this._equalityComparer;
  }
  subscribe(callback) {
    callback(this._value);
    return emptyDisposable;
  }
  subscribeSilent(_) {
    return emptyDisposable;
  }
};

// src/vars/delegate.ts
import {
  DisposableAction as DisposableAction3,
  DisposableContainer,
  emptyDisposable as emptyDisposable2
} from "@tioniq/disposiq";
var DelegateVariable = class extends CompoundVariable {
  constructor(sourceOrDefaultValue) {
    super(
      sourceOrDefaultValue instanceof Variable ? (
        // biome-ignore lint/style/noNonNullAssertion: base value will not be used
        null
      ) : sourceOrDefaultValue != void 0 ? sourceOrDefaultValue : (
        // biome-ignore lint/style/noNonNullAssertion: base value will not be used
        null
      )
    );
    /**
     * @internal
     */
    this._sourceSubscription = new DisposableContainer();
    if (sourceOrDefaultValue instanceof Variable) {
      this._source = sourceOrDefaultValue;
    } else {
      this._source = null;
    }
  }
  /**
   * Sets the source variable. The source variable will be used to get the value for the delegate variable
   * @param source the source variable or null to remove the source
   * @returns a disposable that will remove the source when disposed
   */
  setSource(source) {
    if (!source) {
      if (this._source) {
        this.value = this._source.value;
        this._source = null;
      }
      this._sourceSubscription.disposeCurrent();
      return emptyDisposable2;
    }
    this._source = source;
    this._sourceSubscription.disposeCurrent();
    if (this.active) {
      this._sourceSubscription.set(
        source.subscribeSilent((v) => this.setForce(v))
      );
      this.value = source.value;
    }
    return new DisposableAction3(() => {
      if (this._source !== source) {
        return;
      }
      this.setSource(null);
    });
  }
  activate() {
    if (this._source === null) {
      return;
    }
    this._sourceSubscription.disposeCurrent();
    this._sourceSubscription.set(
      this._source.subscribeSilent((v) => this.setForce(v))
    );
    this.value = this._source.value;
  }
  deactivate() {
    if (this._source === null) {
      return;
    }
    this._sourceSubscription.disposeCurrent();
  }
  getExactValue() {
    return this._source !== null ? this._source.value : super.getExactValue();
  }
};

// src/vars/direct.ts
var DirectVariable = class extends Variable {
  constructor(initialValue, equalityComparer) {
    super();
    /**
     * @internal
     */
    this._chain = new LinkedChain(functionEqualityComparer);
    this._value = initialValue;
    this._equalityComparer = equalityComparer != null ? equalityComparer : defaultEqualityComparer;
  }
  get value() {
    return this._value;
  }
  /**
   * Sets the value of the variable and notifies all subscribers without checking the equality
   * @param value the new value for the variable
   */
  set value(value) {
    this._value = value;
    this._chain.forEach((a) => a(value));
  }
  get equalityComparer() {
    return this._equalityComparer;
  }
  subscribe(callback) {
    const [disposable, added] = this._chain.addUnique(callback);
    if (added) {
      callback(this._value);
    }
    return disposable;
  }
  subscribeSilent(callback) {
    return this._chain.addUnique(callback)[0];
  }
  /**
   * Sets the value of the variable without notifying the subscribers
   * @param value the new value for the variable
   * @remarks Use this method only if you are sure what you are doing. Combine this method with the `notify` method
   */
  setSilent(value) {
    this._value = value;
  }
  /**
   * Notifies all subscribers about the change of the value forcibly
   * @remarks Use this method only if you are sure what you are doing. Combine this method with the `setSilent` method
   */
  notify() {
    const value = this._value;
    this._chain.forEach((a) => a(value));
  }
};

// src/vars/func.ts
import {
  DisposableContainer as DisposableContainer2,
  toDisposable
} from "@tioniq/disposiq";
var FuncVariable = class extends CompoundVariable {
  constructor(activate, exactValue, equalityComparer) {
    super(null, equalityComparer);
    const disposable = new DisposableContainer2();
    this._activator = (self) => {
      disposable.disposeCurrent();
      disposable.set(toDisposable(activate(self)));
    };
    this._deactivator = () => {
      disposable.disposeCurrent();
    };
    this._exactValue = exactValue;
  }
  get value() {
    return super.value;
  }
  /**
   * Sets the value of the variable. If the value is the same as the current value, the method will do nothing
   * @param value the new value of the variable
   */
  set value(value) {
    super.value = value;
  }
  setValueForce(value) {
    super.setForce(value);
  }
  setValueSilent(value) {
    super.setSilent(value);
  }
  /**
   * A method for setting the value of the variable and notifying subscribers without checking the equality
   * @param value the new value of the variable
   */
  setForce(value) {
    super.setForce(value);
  }
  /**
   * A method for setting the value of the variable without notifying subscribers
   * @param value the new value of the variable
   */
  setSilent(value) {
    super.setSilent(value);
  }
  /**
   * A method for notifying subscribers about the value change
   */
  notify() {
    super.notify();
  }
  activate() {
    this._activator(this);
  }
  deactivate() {
    this._deactivator(this);
  }
  getExactValue() {
    return this._exactValue();
  }
};

// src/vars/invert.ts
import {
  DisposableAction as DisposableAction4,
  DisposableContainer as DisposableContainer3
} from "@tioniq/disposiq";
var InvertVariable = class extends Variable {
  constructor(variable) {
    super();
    /**
     * @internal
     */
    this._chain = new LinkedChain(
      functionEqualityComparer
    );
    /**
     * @internal
     */
    this._value = false;
    /**
     * @internal
     */
    this._subscription = new DisposableContainer3();
    this._variable = variable;
  }
  get value() {
    if (this._chain.hasAny) {
      return this._value;
    }
    return !this._variable.value;
  }
  subscribe(callback) {
    if (this._chain.empty) {
      this._activate();
    }
    const [disposable, added] = this._chain.addUnique(callback);
    if (added) {
      callback(this._value);
    }
    return new DisposableAction4(() => {
      disposable.dispose();
      if (this._chain.empty) {
        this._deactivate();
      }
    });
  }
  subscribeSilent(callback) {
    return this._variable.subscribeSilent((value) => callback(!value));
  }
  /**
   * @internal
   */
  _activate() {
    this._subscription.disposeCurrent();
    this._subscription.set(
      this._variable.subscribeSilent((v) => {
        const value = !v;
        this._value = value;
        this._chain.forEach((a) => a(value));
      })
    );
    this._value = !this._variable.value;
  }
  /**
   * @internal
   */
  _deactivate() {
    this._subscription.disposeCurrent();
  }
};

// src/vars/map.ts
import { DisposableContainer as DisposableContainer4 } from "@tioniq/disposiq";
var MapVariable = class extends CompoundVariable {
  constructor(variable, mapper, equalityComparer) {
    super(mapper(variable.value), equalityComparer);
    /**
     * @internal
     */
    this._subscription = new DisposableContainer4();
    /**
     * @internal
     */
    this._listener = (value) => {
      this.value = this._mapper(value);
    };
    this._variable = variable;
    this._mapper = mapper;
  }
  activate() {
    this._subscription.disposeCurrent();
    this._subscription.set(this._variable.subscribeSilent(this._listener));
    this._listener(this._variable.value);
  }
  deactivate() {
    this._subscription.disposeCurrent();
  }
  getExactValue() {
    return this._mapper(this._variable.value);
  }
};

// src/vars/max.ts
import { DisposableStore as DisposableStore2 } from "@tioniq/disposiq";
var MaxVariable = class extends CompoundVariable {
  constructor(vars) {
    super(0);
    /**
     * @internal
     */
    this._subscriptions = new DisposableStore2();
    this._vars = vars.slice();
  }
  activate() {
    const vars = this._vars;
    const length = vars.length;
    const subscriptions = this._subscriptions;
    subscriptions.disposeCurrent();
    for (let i = 0; i < length; ++i) {
      subscriptions.add(
        vars[i].subscribeSilent(() => {
          this.postValue();
        })
      );
    }
    this.postValue();
  }
  deactivate() {
    this._subscriptions.dispose();
  }
  getExactValue() {
    const vars = this._vars;
    const length = vars.length;
    let result = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < length; ++i) {
      result = Math.max(result, vars[i].value);
    }
    return result;
  }
  postValue() {
    const vars = this._vars;
    const length = vars.length;
    let result = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < length; ++i) {
      result = Math.max(result, vars[i].value);
    }
    this.value = result;
  }
};

// src/vars/min.ts
import { DisposableStore as DisposableStore3 } from "@tioniq/disposiq";
var MinVariable = class extends CompoundVariable {
  constructor(vars) {
    super(0);
    /**
     * @internal
     */
    this._subscriptions = new DisposableStore3();
    this._vars = vars.slice();
  }
  activate() {
    const vars = this._vars;
    const length = vars.length;
    const subscriptions = this._subscriptions;
    subscriptions.disposeCurrent();
    for (let i = 0; i < length; ++i) {
      subscriptions.add(
        vars[i].subscribeSilent(() => {
          this.postValue();
        })
      );
    }
    this.postValue();
  }
  deactivate() {
    this._subscriptions.dispose();
  }
  getExactValue() {
    const vars = this._vars;
    const length = vars.length;
    let result = Number.POSITIVE_INFINITY;
    for (let i = 0; i < length; ++i) {
      result = Math.min(result, vars[i].value);
    }
    return result;
  }
  postValue() {
    const vars = this._vars;
    const length = vars.length;
    let result = Number.POSITIVE_INFINITY;
    for (let i = 0; i < length; ++i) {
      result = Math.min(result, vars[i].value);
    }
    this.value = result;
  }
};

// src/vars/mutable.ts
var MutableVariable = class extends Variable {
  constructor(value, equalityComparer) {
    super();
    /**
     * @internal
     */
    this._chain = new LinkedChain(functionEqualityComparer);
    this._value = value;
    this._equalityComparer = equalityComparer != null ? equalityComparer : defaultEqualityComparer;
  }
  get value() {
    return this._value;
  }
  /**
   * Sets the value of the variable. The value will be changed only if the new value is different from the old value
   * @param value the new value for the variable
   */
  set value(value) {
    if (this._equalityComparer(value, this._value)) {
      return;
    }
    this._value = value;
    this._chain.forEach((a) => a(value));
  }
  /**
   * Returns the equality comparer used to compare the old and new values of the variable
   */
  get equalityComparer() {
    return this._equalityComparer;
  }
  subscribe(callback) {
    const [disposable, added] = this._chain.addUnique(callback);
    if (added) {
      callback(this._value);
    }
    return disposable;
  }
  subscribeSilent(callback) {
    return this._chain.addUnique(callback)[0];
  }
  /**
   * Sets the value of the variable without notifying the subscribers
   * @param value the new value for the variable
   * @remarks Use this method only if you are sure what you are doing. Combine this method with the `notify` method
   */
  setSilent(value) {
    this._value = value;
  }
  /**
   * Notifies all subscribers about the change of the value forcibly
   * @remarks Use this method only if you are sure what you are doing. Combine this method with the `setSilent` method
   */
  notify() {
    const value = this._value;
    this._chain.forEach((a) => a(value));
  }
};

// src/vars/or.ts
import { disposeAll as disposeAll2 } from "@tioniq/disposiq";
var OrVariable = class extends CompoundVariable {
  constructor(variables) {
    super(false);
    /**
     * @internal
     */
    this._subscriptions = [];
    this._variables = variables;
  }
  activate() {
    this._listen(0);
  }
  deactivate() {
    disposeAll2(this._subscriptions);
  }
  getExactValue() {
    const variables = this._variables;
    for (let i = 0; i < variables.length; ++i) {
      if (variables[i].value) {
        return true;
      }
    }
    return false;
  }
  /**
   * @internal
   */
  _listen(index) {
    if (index >= this._variables.length) {
      this.value = false;
      return;
    }
    if (this._subscriptions.length > index) {
      return;
    }
    const __listener = (value) => {
      if (value) {
        this._unsubscribeFrom(index + 1);
        this.value = true;
      } else {
        this._listen(index + 1);
      }
    };
    const variable = this._variables[index];
    this._subscriptions.push(variable.subscribeSilent(__listener));
    __listener(variable.value);
    return;
  }
  /**
   * @internal
   */
  _unsubscribeFrom(index) {
    var _a;
    while (index < this._subscriptions.length) {
      (_a = this._subscriptions.pop()) == null ? void 0 : _a.dispose();
    }
  }
};

// src/vars/seal.ts
import {
  DisposableAction as DisposableAction5,
  DisposableContainer as DisposableContainer5,
  emptyDisposable as emptyDisposable3
} from "@tioniq/disposiq";
var SealVariable = class extends Variable {
  constructor(vary, equalityComparer) {
    super();
    /**
     * @internal
     */
    this._chain = new LinkedChain(functionEqualityComparer);
    /**
     * @internal
     */
    this._varSubscription = new DisposableContainer5();
    /**
     * @internal
     */
    // biome-ignore lint/style/noNonNullAssertion: the field access is safe because it used only in the sealed state
    this._value = null;
    /**
     * @internal
     */
    this._sealed = false;
    this._var = vary;
    this._equalityComparer = typeof equalityComparer === "function" ? equalityComparer : defaultEqualityComparer;
  }
  get value() {
    if (this._sealed) {
      return this._value;
    }
    if (this._chain.empty) {
      return this._var.value;
    }
    return this._value;
  }
  get equalityComparer() {
    return this._equalityComparer;
  }
  subscribe(callback) {
    if (this._sealed) {
      callback(this._value);
      return emptyDisposable3;
    }
    if (this._chain.empty) {
      this._activate();
    }
    const [disposable, added] = this._chain.addUnique(callback);
    if (added) {
      callback(this._value);
    }
    return new DisposableAction5(() => {
      disposable.dispose();
      if (!this._sealed && this._chain.empty) {
        this._deactivate();
      }
    });
  }
  subscribeSilent(callback) {
    if (this._sealed) {
      return emptyDisposable3;
    }
    if (this._chain.empty) {
      this._activate();
    }
    const disposable = this._chain.addUnique(callback)[0];
    return new DisposableAction5(() => {
      disposable.dispose();
      if (!this._sealed && this._chain.empty) {
        this._deactivate();
      }
    });
  }
  /**
   * Seals the variable. If the variable is already sealed, the method will do nothing
   * @param valueToSeal the value to seal. If the value is not provided, the current value of the variable will be
   * sealed
   * @returns true if the variable was sealed, false if the variable was already sealed
   */
  seal(valueToSeal) {
    if (this._sealed) {
      return false;
    }
    this._sealed = true;
    this._varSubscription.dispose();
    if (arguments.length === 0) {
      const currentValue = this._chain.empty ? this._var.value : this._value;
      this._varSubscription.dispose();
      this._sealValue(currentValue);
      return true;
    }
    this._varSubscription.dispose();
    this._sealValue(valueToSeal);
    return true;
  }
  /**
   * @internal
   */
  _activate() {
    this._varSubscription.disposeCurrent();
    this._varSubscription.set(
      this._var.subscribeSilent((v) => {
        this._value = v;
        this._chain.forEach((a) => a(v));
      })
    );
    this._value = this._var.value;
  }
  /**
   * @internal
   */
  _deactivate() {
    this._varSubscription.disposeCurrent();
  }
  /**
   * @internal
   */
  _sealValue(value) {
    if (this._equalityComparer(value, this._value)) {
      this._chain.clear();
      return;
    }
    this._value = value;
    this._chain.forEach((a) => a(value));
    this._chain.clear();
  }
};

// src/vars/sum.ts
import { DisposableStore as DisposableStore4 } from "@tioniq/disposiq";
var SumVariable = class extends CompoundVariable {
  constructor(vars) {
    super(0);
    /**
     * @internal
     */
    this._subscriptions = new DisposableStore4();
    this._vars = vars.slice();
  }
  activate() {
    const vars = this._vars;
    const length = vars.length;
    const subscriptions = this._subscriptions;
    subscriptions.disposeCurrent();
    for (let i = 0; i < length; ++i) {
      const variable = vars[i];
      subscriptions.add(
        variable.subscribeSilent(() => {
          this.postValue();
        })
      );
    }
    this.postValue();
  }
  deactivate() {
    this._subscriptions.dispose();
  }
  getExactValue() {
    const vars = this._vars;
    const length = vars.length;
    let result = 0;
    for (let i = 0; i < length; ++i) {
      result += vars[i].value;
    }
    return result;
  }
  postValue() {
    const vars = this._vars;
    const length = vars.length;
    let result = 0;
    for (let i = 0; i < length; ++i) {
      result += vars[i].value;
    }
    this.value = result;
  }
};

// src/vars/switch-map.ts
import { DisposableContainer as DisposableContainer6 } from "@tioniq/disposiq";
var SwitchMapVariable = class extends CompoundVariable {
  constructor(vary, mapper, equalityComparer) {
    super(null, equalityComparer);
    /**
     * @internal
     */
    this._switchSubscription = new DisposableContainer6();
    /**
     * @internal
     */
    this._varSubscription = new DisposableContainer6();
    this._var = vary;
    this._mapper = mapper;
  }
  activate() {
    this._switchSubscription.disposeCurrent();
    this._switchSubscription.set(
      this._var.subscribeSilent((i) => this._handleSwitch(i))
    );
    this._handleSwitch(this._var.value);
  }
  deactivate() {
    this._switchSubscription.disposeCurrent();
    this._varSubscription.disposeCurrent();
  }
  getExactValue() {
    return this._mapper(this._var.value).value;
  }
  /**
   * @internal
   */
  _handleSwitch(input) {
    this._varSubscription.disposeCurrent();
    const mappedVariable = this._mapper(input);
    this._varSubscription.set(
      mappedVariable.subscribeSilent((result) => {
        this.value = result;
      })
    );
    this.value = mappedVariable.value;
  }
};

// src/vars/throttled.ts
import { DisposableContainer as DisposableContainer7 } from "@tioniq/disposiq";
var noScheduledValue = Object.freeze({});
var ThrottledVariable = class extends CompoundVariable {
  constructor(vary, onUpdate, equalityComparer) {
    super(null, equalityComparer);
    /**
     * @internal
     */
    this._subscription = new DisposableContainer7();
    /**
     * @internal
     */
    this._updateSubscription = new DisposableContainer7();
    /**
     * @internal
     */
    this._scheduledValue = noScheduledValue;
    this._var = vary;
    this._onUpdate = onUpdate;
  }
  activate() {
    this._subscription.disposeCurrent();
    this._subscription.set(
      this._var.subscribeSilent((v) => {
        this._scheduleUpdate(v);
      })
    );
    this.value = this._var.value;
  }
  deactivate() {
    this._subscription.disposeCurrent();
    this._updateSubscription.disposeCurrent();
  }
  getExactValue() {
    return this._var.value;
  }
  /**
   * @internal
   */
  _scheduleUpdate(value) {
    if (this._scheduledValue !== noScheduledValue) {
      this._scheduledValue = value;
      return;
    }
    this._scheduledValue = value;
    this._updateSubscription.disposeCurrent();
    this._updateSubscription.set(
      this._onUpdate.subscribeOnce(() => {
        const val = this._scheduledValue;
        this._scheduledValue = noScheduledValue;
        this.value = val === noScheduledValue ? this._var.value : val;
      })
    );
  }
};

// src/functions.ts
import { DisposableAction as DisposableAction8 } from "@tioniq/disposiq";

// src/events/observer.ts
var EventObserver = class {
};

// src/events/dispatcher.ts
var EventDispatcher = class extends EventObserver {
  constructor() {
    super(...arguments);
    /**
     * @internal
     */
    this._nodes = new LinkedChain(functionEqualityComparer);
  }
  subscribe(action) {
    return this._nodes.add(action);
  }
  /**
   * Dispatches the event to all subscribers
   * @param value the value of the event
   */
  dispatch(value) {
    this._nodes.forEach((a) => a(value));
  }
  /**
   * Checks if there are any subscriptions
   * @returns true if there are any subscriptions, false otherwise
   */
  get hasSubscriptions() {
    return this._nodes.hasAny;
  }
};

// src/events/safe-dispatcher.ts
var EventSafeDispatcher = class extends EventObserver {
  constructor() {
    super(...arguments);
    /**
     * @internal
     */
    this._nodes = new LinkedChain(functionEqualityComparer);
  }
  subscribe(action) {
    return this._nodes.add(action);
  }
  /**
   * Dispatches the event to all subscribers safely
   * @param value the value of the event
   * @param onError error callback
   */
  dispatch(value, onError) {
    this._nodes.forEach((a) => {
      try {
        a(value);
      } catch (e) {
        onError == null ? void 0 : onError(e);
      }
    });
  }
  /**
   * Checks if there are any subscriptions
   * @returns true if there are any subscriptions, false otherwise
   */
  get hasSubscriptions() {
    return this._nodes.hasAny;
  }
};

// src/events/stub.ts
import { emptyDisposable as emptyDisposable4 } from "@tioniq/disposiq";
var EventObserverStub = class extends EventObserver {
  subscribe() {
    return emptyDisposable4;
  }
};

// src/events/lazy.ts
import {
  DisposableAction as DisposableAction6,
  DisposableContainer as DisposableContainer8,
  toDisposable as toDisposable2
} from "@tioniq/disposiq";
var LazyEventDispatcher = class extends EventObserver {
  constructor(activator) {
    super();
    /**
     * @internal
     */
    this._nodes = new LinkedChain(functionEqualityComparer);
    /**
     * @internal
     */
    this._subscription = new DisposableContainer8();
    this._activator = activator;
  }
  /**
   * Checks if there are any subscriptions
   * @returns true if there are any subscriptions, false otherwise
   */
  get hasSubscription() {
    return this._nodes.hasAny;
  }
  subscribe(callback) {
    let subscription;
    if (this._nodes.empty) {
      subscription = this._nodes.add(callback);
      this._activate();
    } else {
      subscription = this._nodes.add(callback);
    }
    return new DisposableAction6(() => {
      subscription.dispose();
      if (this._nodes.hasAny) {
        return;
      }
      this._deactivate();
    });
  }
  /**
   * Dispatches the event to all subscribers
   * @param value the value of the event
   */
  dispatch(value) {
    this._nodes.forEach((a) => a(value));
  }
  /**
   * @internal
   */
  _activate() {
    this._subscription.disposeCurrent();
    this._subscription.set(toDisposable2(this._activator(this)));
  }
  /**
   * @internal
   */
  _deactivate() {
    this._subscription.disposeCurrent();
  }
};

// src/events/functions.ts
import { DisposableStore as DisposableStore5 } from "@tioniq/disposiq";
function merge(...observers) {
  return new LazyEventDispatcher((dispatcher) => {
    const disposableStore = new DisposableStore5();
    for (const t of observers) {
      disposableStore.add(t.subscribe((v) => dispatcher.dispatch(v)));
    }
    return disposableStore;
  });
}

// src/events/extensions.ts
import {
  DisposableAction as DisposableAction7,
  DisposableContainer as DisposableContainer9,
  emptyDisposable as emptyDisposable5
} from "@tioniq/disposiq";

// src/noop.ts
var noop = Object.freeze(() => {
});

// src/events/extensions.ts
EventObserver.prototype.subscribeOnce = function(callback) {
  const subscription = new DisposableContainer9();
  subscription.set(
    this.subscribe((value) => {
      subscription.dispose();
      callback(value);
    })
  );
  return subscription;
};
EventObserver.prototype.subscribeOnceWhere = function(callback, condition) {
  const subscription = new DisposableContainer9();
  subscription.set(
    this.subscribe((value) => {
      if (!condition(value)) {
        return;
      }
      subscription.dispose();
      callback(value);
    })
  );
  return subscription;
};
EventObserver.prototype.subscribeWhere = function(callback, condition) {
  return this.subscribe((value) => {
    if (condition(value)) {
      callback(value);
    }
  });
};
EventObserver.prototype.subscribeOn = function(callback, condition) {
  return condition.subscribeDisposable(
    (value) => value ? this.subscribe(callback) : emptyDisposable5
  );
};
EventObserver.prototype.subscribeDisposable = function(callback) {
  const container = new DisposableContainer9();
  const subscription = this.subscribe((v) => {
    container.disposeCurrent();
    container.set(callback(v));
  });
  return new DisposableAction7(() => {
    subscription.dispose();
    container.dispose();
  });
};
EventObserver.prototype.map = function(mapper) {
  return new LazyEventDispatcher(
    (dispatcher) => this.subscribe((value) => dispatcher.dispatch(mapper(value)))
  );
};
EventObserver.prototype.where = function(condition) {
  return new LazyEventDispatcher(
    (dispatcher) => this.subscribe((value) => {
      if (condition(value)) {
        dispatcher.dispatch(value);
      }
    })
  );
};
EventObserver.prototype.awaited = function(onRejection) {
  if (typeof onRejection === "function") {
    return new LazyEventDispatcher(
      (dispatcher) => this.subscribe((value) => {
        if (value instanceof Promise) {
          value.then(
            (v) => {
              dispatcher.dispatch(v);
            },
            (e) => {
              onRejection(e, value);
            }
          );
        } else {
          dispatcher.dispatch(value);
        }
      })
    );
  }
  return new LazyEventDispatcher(
    (dispatcher) => this.subscribe((value) => {
      if (value instanceof Promise) {
        value.then((v) => {
          dispatcher.dispatch(v);
        }, noop);
      } else {
        dispatcher.dispatch(value);
      }
    })
  );
};
EventDispatcher.prototype.dispatchSafe = function(value) {
  try {
    this.dispatch(value);
  } catch (e) {
  }
};

// src/is.ts
function isVariable(value) {
  return value instanceof Variable;
}
function isVariableOf(value, typeCheckerOrExampleValue) {
  if (!(value instanceof Variable)) {
    return false;
  }
  if (typeCheckerOrExampleValue == void 0) {
    return true;
  }
  if (typeof typeCheckerOrExampleValue === "function") {
    return typeCheckerOrExampleValue(value.value);
  }
  return typeof value.value === typeof typeCheckerOrExampleValue;
}
function isMutableVariable(value) {
  return value instanceof MutableVariable;
}
function isDelegateVariable(value) {
  return value instanceof DelegateVariable;
}

// src/functions.ts
function createVar(initialValue, equalityComparer) {
  return new MutableVariable(initialValue, equalityComparer);
}
function createFuncVar(activator, exactValue, equalityComparer) {
  return new FuncVariable(activator, exactValue, equalityComparer);
}
function createConst(value) {
  return new ConstantVariable(value);
}
function createDelegate(sourceOrDefaultValue) {
  return new DelegateVariable(sourceOrDefaultValue);
}
function createDirect(initialValue) {
  return new DirectVariable(initialValue);
}
function or(...variables) {
  return new OrVariable(variables);
}
function and(...variables) {
  return new AndVariable(variables);
}
function sum(...variables) {
  return new SumVariable(variables);
}
function min(...variables) {
  return new MinVariable(variables);
}
function max(...variables) {
  return new MaxVariable(variables);
}
function combine(...vars) {
  if (vars.length === 0) {
    throw new Error("At least one variable must be provided");
  }
  if (vars.length === 1) {
    return vars[0];
  }
  return new CombinedVariable(vars);
}
function createDelayDispatcher(delay) {
  return new LazyEventDispatcher((dispatcher) => {
    const timeout = setTimeout(() => dispatcher.dispatch(), delay);
    return new DisposableAction8(() => clearTimeout(timeout));
  });
}
function toVariable(value) {
  return isVariableOf(value) ? value : createConst(value);
}

// src/extensions.ts
import {
  DisposableAction as DisposableAction9,
  DisposableContainer as DisposableContainer10,
  emptyDisposable as emptyDisposable6
} from "@tioniq/disposiq";
Variable.prototype.subscribeDisposable = function(callback) {
  const container = new DisposableContainer10();
  const subscription = this.subscribe((v) => {
    container.disposeCurrent();
    container.set(callback(v));
  });
  return new DisposableAction9(() => {
    subscription.dispose();
    container.dispose();
  });
};
Variable.prototype.subscribeOnceWhere = function(callback, condition) {
  const container = new DisposableContainer10();
  container.set(
    this.subscribeSilent((v) => {
      if (!condition(v)) {
        return;
      }
      container.dispose();
      callback(v);
    })
  );
  const value = this.value;
  if (!condition(value)) {
    return container;
  }
  container.dispose();
  callback(value);
  return emptyDisposable6;
};
Variable.prototype.subscribeWhere = function(callback, condition, equalityComparer) {
  if (typeof condition === "function") {
    return this.subscribe((v) => {
      if (condition(v)) {
        callback(v);
      }
    });
  }
  const comparer = equalityComparer != null ? equalityComparer : defaultEqualityComparer;
  return this.subscribe((v) => {
    if (comparer(v, condition)) {
      callback(v);
    }
  });
};
Variable.prototype.map = function(mapper, equalityComparer) {
  return new MapVariable(this, mapper, equalityComparer);
};
Variable.prototype.or = function(other) {
  return new OrVariable([this, other]);
};
Variable.prototype.and = function(other) {
  return new AndVariable([this, other]);
};
Variable.prototype.invert = function() {
  return new InvertVariable(this);
};
Variable.prototype.with = function(...others) {
  return new CombinedVariable([this, ...others]);
};
Variable.prototype.switchMap = function(mapper, equalityComparer) {
  return new SwitchMapVariable(this, mapper, equalityComparer);
};
Variable.prototype.throttle = function(delay, equalityComparer) {
  if (typeof delay === "number") {
    return new ThrottledVariable(
      this,
      createDelayDispatcher(delay),
      equalityComparer
    );
  }
  return new ThrottledVariable(this, delay, equalityComparer);
};
Variable.prototype.streamTo = function(receiver) {
  return this.subscribe((value) => {
    receiver.value = value;
  });
};
Variable.prototype.startPersistent = function() {
  return this.subscribeSilent(noop);
};
Variable.prototype.plus = function(other) {
  if (other instanceof Variable) {
    return new SumVariable([this, other]);
  }
  return new MapVariable(this, (v) => v + other);
};
Variable.prototype.minus = function(other) {
  if (other instanceof Variable) {
    return new SumVariable([
      this,
      new MapVariable(other, (v) => -v)
    ]);
  }
  return new MapVariable(this, (v) => v - other);
};
Variable.prototype.multiply = function(other) {
  if (other instanceof Variable) {
    return this.with(other).map(([a, b]) => a * b);
  }
  return new MapVariable(this, (v) => v * other);
};
Variable.prototype.divide = function(other) {
  if (other instanceof Variable) {
    return this.with(other).map(([a, b]) => a / b);
  }
  return new MapVariable(this, (v) => v / other);
};
Variable.prototype.round = function() {
  return new MapVariable(this, Math.round);
};
Variable.prototype.moreThan = function(other) {
  if (other instanceof Variable) {
    return this.with(other).map(([a, b]) => a > b);
  }
  return new MapVariable(this, (v) => v > other);
};
Variable.prototype.lessThan = function(other) {
  if (other instanceof Variable) {
    return this.with(other).map(([a, b]) => a < b);
  }
  return new MapVariable(this, (v) => v < other);
};
Variable.prototype.moreOrEqual = function(other) {
  if (other instanceof Variable) {
    return this.with(other).map(([a, b]) => a >= b);
  }
  return new MapVariable(this, (v) => v >= other);
};
Variable.prototype.lessOrEqual = function(other) {
  if (other instanceof Variable) {
    return this.with(other).map(([a, b]) => a <= b);
  }
  return new MapVariable(this, (v) => v <= other);
};
Variable.prototype.equal = function(other, equalityComparer) {
  const comparer = equalityComparer != null ? equalityComparer : defaultEqualityComparer;
  if (other instanceof Variable) {
    return this.with(other).map(([a, b]) => comparer(a, b));
  }
  return new MapVariable(this, (v) => comparer(v, other));
};
Variable.prototype.sealed = function() {
  return new ConstantVariable(this.value);
};
Variable.prototype.sealWhen = function(condition, equalityComparer) {
  const comparer = equalityComparer != null ? equalityComparer : defaultEqualityComparer;
  const vary = new SealVariable(this, comparer);
  if (typeof condition === "function") {
    vary.subscribeOnceWhere((v) => vary.seal(v), condition);
    return vary;
  }
  vary.subscribeOnceWhere(
    (v) => vary.seal(v),
    (v) => comparer(v, condition)
  );
  return vary;
};
Variable.prototype.notifyOn = function(event) {
  return new FuncVariable((vary) => {
    const subscription1 = this.subscribe((v) => {
      vary.setForce(v);
    });
    const subscription2 = event.subscribe(() => {
      vary.notify();
    });
    return new DisposableAction9(() => {
      subscription1.dispose();
      subscription2.dispose();
    });
  }, () => this.value);
};
Variable.prototype.flat = function(equalityComparer) {
  return new MapVariable(this, (v) => v.flat(), equalityComparer);
};
Variable.prototype.join = function(separator) {
  return new MapVariable(this, (v) => v.join(separator), strictEqualityComparer);
};

// src/list/observable-list.ts
var ObservableList = class {
  constructor(items) {
    /**
     * @internal
     */
    this._onRemove = new EventDispatcher();
    /**
     * @internal
     */
    /**
     * @internal
     */
    this._onAdd = new EventDispatcher();
    /**
     * @internal
     */
    this._onReplace = new EventDispatcher();
    /**
     * @internal
     */
    this._onMove = new EventDispatcher();
    /**
     * @internal
     */
    this._onAnyChange = new EventDispatcher();
    this._list = Array.isArray(items) ? [...items] : [];
  }
  /**
   * An event that is triggered when an item is removed from the list
   */
  get onRemove() {
    return this._onRemove;
  }
  /**
   * An event that is triggered when an item is added to the list
   */
  get onAdd() {
    return this._onAdd;
  }
  /**
   * An event that is triggered when an item is replaced in the list
   */
  get onReplace() {
    return this._onReplace;
  }
  /**
   * An event that is triggered when an item is moved in the list
   */
  get onMove() {
    return this._onMove;
  }
  /**
   * An event that is triggered when any change is made to the list
   */
  get onAnyChange() {
    return this._onAnyChange;
  }
  /**
   * The number of items in the list
   */
  get length() {
    return this._list.length;
  }
  /**
   * Gets the item at the specified index
   * @param index the index of the item
   * @returns the item at the specified index
   */
  get(index) {
    return this._list[index];
  }
  /**
   * Sets the item at the specified index
   * @param index the index of the item
   * @param value the new value of the item
   */
  set(index, value) {
    const hasSubscriptions = this._onReplace.hasSubscriptions || this._onAnyChange.hasSubscriptions;
    if (!hasSubscriptions) {
      this._list[index] = value;
      return;
    }
    const old = this._list[index];
    this._list[index] = value;
    const event = {
      type: "replace",
      oldItems: [old],
      newItems: [value],
      startIndex: index
    };
    this._onReplace.dispatch(event);
    this._onAnyChange.dispatch(event);
  }
  /**
   * Adds vararg items to the list
   * @param items
   */
  push(...items) {
    this.pushAll(items);
  }
  /**
   * Adds items to the list
   * @param items
   */
  pushAll(items) {
    if (items === void 0 || items.length === 0) {
      return;
    }
    if (items.length === 1) {
      const item = items[0];
      const hasSubscriptions2 = this._onAdd.hasSubscriptions || this._onAnyChange.hasSubscriptions;
      this._list.push(item);
      if (!hasSubscriptions2) {
        return;
      }
      const event2 = {
        type: "add",
        items: [item],
        startIndex: this._list.length - 1
      };
      this._onAdd.dispatch(event2);
      this._onAnyChange.dispatch(event2);
      return;
    }
    const hasSubscriptions = this._onAdd.hasSubscriptions || this._onAnyChange.hasSubscriptions;
    this._list.push(...items);
    if (!hasSubscriptions) {
      return;
    }
    const event = {
      type: "add",
      items: [...items],
      startIndex: this._list.length - items.length
    };
    this._onAdd.dispatch(event);
    this._onAnyChange.dispatch(event);
  }
  /**
   * Copies the items to the specified array
   * @param array the array to copy the items to
   */
  copyTo(array) {
    array.push(...this._list);
  }
  /**
   * Gets a range of items from the list
   * @param index the index of the first item
   * @param count the number of items to get
   */
  getRange(index, count) {
    return this._list.slice(index, index + count);
  }
  /**
   * Insert items at the specified index
   * @param index the index to insert the items at
   * @param items the items to insert
   */
  insertRange(index, items) {
    const hasSubscriptions = this._onAdd.hasSubscriptions || this._onAnyChange.hasSubscriptions;
    if (!hasSubscriptions) {
      this._list.splice(index, 0, ...items);
      return;
    }
    this._list.splice(index, 0, ...items);
    const event = {
      type: "add",
      items: [...items],
      startIndex: index
    };
    this._onAdd.dispatch(event);
    this._onAnyChange.dispatch(event);
  }
  /**
   * Removes the specified item from the list
   * @param item the item to remove
   * @returns true if the item was removed, false otherwise
   */
  remove(item) {
    const hasSubscriptions = this._onRemove.hasSubscriptions || this._onAnyChange.hasSubscriptions;
    const index = this._list.indexOf(item);
    if (index === -1) {
      return false;
    }
    this._list.splice(index, 1);
    if (!hasSubscriptions) {
      return true;
    }
    const event = {
      type: "remove",
      items: [item],
      startIndex: index
    };
    this._onRemove.dispatch(event);
    this._onAnyChange.dispatch(event);
    return true;
  }
  /**
   * Removes a range of items from the list
   * @param index the index of the first item to remove
   * @param count the number of items to remove
   */
  removeRange(index, count) {
    const hasSubscriptions = this._onRemove.hasSubscriptions || this._onAnyChange.hasSubscriptions;
    if (!hasSubscriptions) {
      this._list.splice(index, count);
      return;
    }
    const items = this._list.slice(index, index + count);
    this._list.splice(index, count);
    const event = {
      type: "remove",
      items,
      startIndex: index
    };
    this._onRemove.dispatch(event);
    this._onAnyChange.dispatch(event);
  }
  /**
   * Creates a new array with the items of the list
   */
  toArray() {
    return this._list.slice();
  }
  get _hasAnySubscription() {
    return this._onRemove.hasSubscriptions || this._onAdd.hasSubscriptions || this._onReplace.hasSubscriptions || this._onMove.hasSubscriptions || this._onAnyChange.hasSubscriptions;
  }
  /**
   * Replaces the items in the list with the specified items
   * @param replacement the items to replace the current items with
   */
  replace(replacement) {
    if (!this._hasAnySubscription) {
      this._list.length = 0;
      this._list.push(...replacement);
      return;
    }
    if (this._list.length === 0) {
      this.insertRange(0, replacement);
      return;
    }
    for (let i = this._list.length - 1; i >= 0; i--) {
      const t = this._list[i];
      const index = replacement.indexOf(t);
      if (index !== -1) {
        continue;
      }
      this.removeAt(i);
    }
    for (let i = 0; i < replacement.length; i++) {
      const t = replacement[i];
      const index = this._list.indexOf(t);
      if (index !== -1) {
        continue;
      }
      this.insert(i, t);
    }
    const changedItems = [];
    for (let i = 0; i < replacement.length; i++) {
      const t = replacement[i];
      const resultIndex = this._list.indexOf(t);
      if (resultIndex === i) {
        continue;
      }
      this._list.splice(resultIndex, 1);
      this._list.splice(i, 0, t);
      changedItems.push({ item: t, from: resultIndex, to: i });
    }
    if (changedItems.length <= 0) {
      return;
    }
    const event = {
      type: "move",
      items: changedItems
    };
    this._onMove.dispatch(event);
    this._onAnyChange.dispatch(event);
  }
  /**
   * Gets the index of the specified item
   * @param item the item to get the index of
   */
  indexOf(item) {
    return this._list.indexOf(item);
  }
  /**
   * Gets the last index of the specified item
   * @param item the item to get the last index of
   */
  lastIndexOf(item) {
    return this._list.lastIndexOf(item);
  }
  /**
   * Checks if the list contains the specified item
   * @param item the item to check
   */
  contains(item) {
    return this._list.indexOf(item) !== -1;
  }
  /**
   * Inserts the specified item at the specified index
   * @param index the index to insert the item at
   * @param item the item to insert
   */
  insert(index, item) {
    const hasSubscriptions = this._onAdd.hasSubscriptions || this._onAnyChange.hasSubscriptions;
    this._list.splice(index, 0, item);
    if (!hasSubscriptions) {
      return;
    }
    const event = {
      type: "add",
      items: [item],
      startIndex: index
    };
    this._onAdd.dispatch(event);
    this._onAnyChange.dispatch(event);
  }
  /**
   * Removes the item at the specified index
   * @param index the index of the item to remove
   */
  removeAt(index) {
    const hasSubscriptions = this._onRemove.hasSubscriptions || this._onAnyChange.hasSubscriptions;
    if (!hasSubscriptions) {
      this._list.splice(index, 1);
      return;
    }
    const removed = this._list.splice(index, 1);
    if (removed.length === 0) {
      return;
    }
    const event = {
      type: "remove",
      items: removed,
      startIndex: index
    };
    this._onRemove.dispatch(event);
    this._onAnyChange.dispatch(event);
  }
  /**
   * Gets a readonly array of the current items in the list
   */
  get asReadonly() {
    return Object.freeze([...this._list]);
  }
  /**
   * Sorts the list
   * @param compareFn the compare function to use for sorting the list
   */
  sort(compareFn) {
    const hasSubscriptions = this._onMove.hasSubscriptions || this._onAnyChange.hasSubscriptions;
    if (!hasSubscriptions) {
      this._list.sort(compareFn);
      return;
    }
    const array = this._list.slice();
    array.sort(compareFn);
    this.updateSorted(array);
  }
  /**
   * Clears the list
   */
  clear() {
    const hasSubscriptions = this._onRemove.hasSubscriptions || this._onAnyChange.hasSubscriptions;
    if (!hasSubscriptions) {
      this._list.length = 0;
      return;
    }
    const items = this._list.slice();
    this._list.length = 0;
    const event = {
      type: "remove",
      items,
      startIndex: 0
    };
    this._onRemove.dispatch(event);
    this._onAnyChange.dispatch(event);
  }
  updateSorted(sortedItems) {
    const itemCount = sortedItems.length;
    const items = [];
    for (let i = 0; i < itemCount; i++) {
      const item = this._list[i];
      const endPosition = sortedItems.indexOf(item);
      const distance = endPosition - i;
      items.push({
        item,
        index: i,
        distance,
        distanceMoved: 0
      });
    }
    while (true) {
      let maxDistance = 0;
      let index = void 0;
      let hasDistanceMoved = false;
      for (const it of items) {
        let distance = it.distance;
        if (distance < 0) {
          distance = -distance;
        }
        if (distance <= maxDistance) {
          continue;
        }
        if (it.distanceMoved !== 0) {
          hasDistanceMoved = true;
        }
        maxDistance = distance;
        index = it;
      }
      if (maxDistance === 0) {
        if (hasDistanceMoved) {
          console.error(
            "Bad state: hasDistanceMoved is true but maxDistance is 0"
          );
        }
        break;
      }
      if (index === void 0) {
        continue;
      }
      const item = index;
      const dist = item.distance;
      item.distance = 0;
      item.distanceMoved += dist;
      const moveFrom = item.index;
      item.index += dist;
      if (dist > 0) {
        let nextNode = index;
        const indexIndex = items.indexOf(item);
        for (let i = 0; i < dist; i++) {
          nextNode = items[indexIndex + i + 1];
          nextNode.distance++;
          nextNode.index--;
        }
        items.splice(indexIndex, 1);
        const nextNodeIndex = items.indexOf(nextNode);
        items.splice(nextNodeIndex + 1, 0, item);
      } else if (dist < 0) {
        let prevNode = index;
        const indexIndex = items.indexOf(item);
        for (let i = 0; i < -dist; i++) {
          prevNode = items[indexIndex - i - 1];
          prevNode.distance--;
          prevNode.index++;
        }
        items.splice(indexIndex, 1);
        const prevNodeIndex = items.indexOf(prevNode);
        items.splice(prevNodeIndex, 0, item);
      }
      const event = {
        type: "move",
        items: [
          {
            item: item.item,
            from: moveFrom,
            to: item.index
          }
        ]
      };
      this._list.splice(moveFrom, 1);
      this._list.splice(item.index, 0, item.item);
      this._onMove.dispatch(event);
      this._onAnyChange.dispatch(event);
    }
  }
};
export {
  AndVariable,
  CombinedVariable,
  CompoundVariable,
  ConstantVariable as ConstVar,
  ConstantVariable as ConstVariable,
  ConstantVariable,
  DelegateVariable,
  DirectVariable,
  EventDispatcher,
  EventObserver,
  EventObserverStub,
  EventSafeDispatcher,
  FuncVariable as FuncVar,
  FuncVariable,
  ConstantVariable as ImmutableVar,
  InvertVariable,
  LazyEventDispatcher,
  FuncVariable as LazyVariable,
  LinkedChain,
  MapVariable,
  MaxVariable,
  MinVariable,
  MutableVariable as MutableVar,
  MutableVariable,
  ObservableList,
  OrVariable,
  ConstantVariable as ReadonlyVar,
  SealVariable,
  SumVariable,
  SwitchMapVariable,
  ThrottledVariable,
  Variable as Var,
  Variable,
  MutableVariable as Vary,
  and,
  arrayEqualityComparer,
  combine,
  createConst,
  createConst as createConstVar,
  createDelayDispatcher,
  createDelegate,
  createDelegate as createDelegateVar,
  createDirect,
  createDirect as createDirectVar,
  createFuncVar,
  createFuncVar as createLazyVar,
  createVar,
  defaultEqualityComparer,
  functionEqualityComparer,
  generalEqualityComparer,
  isDelegateVariable,
  isMutableVariable,
  isVariable,
  isVariableOf,
  max,
  merge,
  min,
  objectEqualityComparer,
  or,
  setDefaultEqualityComparer,
  simpleEqualityComparer,
  strictEqualityComparer,
  sum,
  toVariable
};
