import { EventDispatcher, EventObserver } from "../events";

export type ObservableListChangeEvent<T> =
  ObservableListRemoveEvent<T>
  | ObservableListAddEvent<T>
  | ObservableListReplaceEvent<T>
  | ObservableListMoveEvent<T>

export interface ObservableListChangeBaseEvent<T> {
  type: "remove" | "add" | "replace" | "move"
}

export interface ObservableListRemoveEvent<T> extends ObservableListChangeBaseEvent<T> {
  type: "remove"
  items: T[]
  startIndex: number
}

export interface ObservableListAddEvent<T> extends ObservableListChangeBaseEvent<T> {
  type: "add"
  items: T[]
  startIndex: number
}

export interface ObservableListReplaceEvent<T> extends ObservableListChangeBaseEvent<T> {
  type: "replace"
  oldItems: T[]
  newItems: T[]
  startIndex: number
}

export interface ObservableListMoveEvent<T> extends ObservableListChangeBaseEvent<T> {
  type: "move"
  items: {
    item: T
    from: number
    to: number
  }[]
}

/**
 * Represents a list that can be observed for changes. The list is mutable and can be changed by adding, removing, or
 * replacing items. The list can be observed for changes using the `onRemove`, `onAdd`, `onReplace`, `onMove`, and
 * `onAnyChange` events. The implementation is still in alpha and may change in the future.
 * @alpha
 */
export class ObservableList<T> {
  /**
   * @internal
   */
  private readonly _list: T[];
  /**
   * @internal
   */
  private readonly _onRemove = new EventDispatcher<ObservableListRemoveEvent<T>>()

  /**
   * @internal
   */

  /**
   * @internal
   */
  private readonly _onAdd = new EventDispatcher<ObservableListAddEvent<T>>()

  /**
   * @internal
   */
  private readonly _onReplace = new EventDispatcher<ObservableListReplaceEvent<T>>()

  /**
   * @internal
   */
  private readonly _onMove = new EventDispatcher<ObservableListMoveEvent<T>>()

  /**
   * @internal
   */
  private readonly _onAnyChange = new EventDispatcher<ObservableListChangeEvent<T>>()

  constructor(items?: T[]) {
    this._list = Array.isArray(items) ? [...items] : [];
  }

  /**
   * An event that is triggered when an item is removed from the list
   */
  get onRemove(): EventObserver<ObservableListRemoveEvent<T>> {
    return this._onRemove;
  }

  /**
   * An event that is triggered when an item is added to the list
   */
  get onAdd(): EventObserver<ObservableListAddEvent<T>> {
    return this._onAdd;
  }

  /**
   * An event that is triggered when an item is replaced in the list
   */
  get onReplace(): EventObserver<ObservableListReplaceEvent<T>> {
    return this._onReplace;
  }

  /**
   * An event that is triggered when an item is moved in the list
   */
  get onMove(): EventObserver<ObservableListMoveEvent<T>> {
    return this._onMove;
  }

  /**
   * An event that is triggered when any change is made to the list
   */
  get onAnyChange(): EventObserver<ObservableListChangeEvent<T>> {
    return this._onAnyChange;
  }

  /**
   * The number of items in the list
   */
  get length(): number {
    return this._list.length
  }

  /**
   * Gets the item at the specified index
   * @param index the index of the item
   * @returns the item at the specified index
   */
  get(index: number): T {
    return this._list[index]
  }

  /**
   * Sets the item at the specified index
   * @param index the index of the item
   * @param value the new value of the item
   */
  set(index: number, value: T): void {
    const hasSubscriptions = this._onReplace.hasSubscriptions || this._onAnyChange.hasSubscriptions;
    if (!hasSubscriptions) {
      this._list[index] = value;
      return
    }
    const old = this._list[index];
    this._list[index] = value;
    const event: ObservableListReplaceEvent<T> = {
      type: "replace",
      oldItems: [old],
      newItems: [value],
      startIndex: index
    }
    this._onReplace.dispatch(event);
    this._onAnyChange.dispatch(event);
  }

  /**
   * Adds vararg items to the list
   * @param items
   */
  push(...items: T[]): void {
    this.pushAll(items)
  }

  /**
   * Adds items to the list
   * @param items
   */
  pushAll(items: T[]): void {
    if (items === undefined || items.length === 0) {
      return
    }
    if (items.length === 1) {
      const item = items[0]
      const hasSubscriptions = this._onAdd.hasSubscriptions || this._onAnyChange.hasSubscriptions;
      this._list.push(item);
      if (!hasSubscriptions) {
        return;
      }
      const event: ObservableListAddEvent<T> = {
        type: "add",
        items: [item],
        startIndex: this._list.length - 1
      }
      this._onAdd.dispatch(event);
      this._onAnyChange.dispatch(event);
      return
    }
    const hasSubscriptions = this._onAdd.hasSubscriptions || this._onAnyChange.hasSubscriptions;
    this._list.push(...items);
    if (!hasSubscriptions) {
      return;
    }
    const event: ObservableListAddEvent<T> = {
      type: "add",
      items: [...items],
      startIndex: this._list.length - items.length
    }
    this._onAdd.dispatch(event);
    this._onAnyChange.dispatch(event);
  }

  /**
   * Copies the items to the specified array
   * @param array the array to copy the items to
   */
  copyTo(array: T[]): void {
    array.push(...this._list)
  }

  /**
   * Gets a range of items from the list
   * @param index the index of the first item
   * @param count the number of items to get
   */
  getRange(index: number, count: number): T[] {
    return this._list.slice(index, index + count)
  }

  /**
   * Insert items at the specified index
   * @param index the index to insert the items at
   * @param items the items to insert
   */
  insertRange(index: number, items: T[]): void {
    const hasSubscriptions = this._onAdd.hasSubscriptions || this._onAnyChange.hasSubscriptions
    if (!hasSubscriptions) {
      this._list.splice(index, 0, ...items)
      return
    }
    this._list.splice(index, 0, ...items)
    const event: ObservableListAddEvent<T> = {
      type: "add",
      items: [...items],
      startIndex: index
    }
    this._onAdd.dispatch(event)
    this._onAnyChange.dispatch(event)
  }

  /**
   * Removes the specified item from the list
   * @param item the item to remove
   * @returns true if the item was removed, false otherwise
   */
  remove(item: T): boolean {
    const hasSubscriptions = this._onRemove.hasSubscriptions || this._onAnyChange.hasSubscriptions
    const index = this._list.indexOf(item)
    if (index === -1) {
      return false
    }
    this._list.splice(index, 1)
    if (!hasSubscriptions) {
      return true
    }
    const event: ObservableListRemoveEvent<T> = {
      type: "remove",
      items: [item],
      startIndex: index
    }
    this._onRemove.dispatch(event)
    this._onAnyChange.dispatch(event)
    return true
  }

  /**
   * Removes a range of items from the list
   * @param index the index of the first item to remove
   * @param count the number of items to remove
   */
  removeRange(index: number, count: number): void {
    const hasSubscriptions = this._onRemove.hasSubscriptions || this._onAnyChange.hasSubscriptions
    if (!hasSubscriptions) {
      this._list.splice(index, count)
      return
    }
    const items = this._list.slice(index, index + count)
    this._list.splice(index, count)
    const event: ObservableListRemoveEvent<T> = {
      type: "remove",
      items: items,
      startIndex: index
    }
    this._onRemove.dispatch(event)
    this._onAnyChange.dispatch(event)
  }

  /**
   * Creates a new array with the items of the list
   */
  toArray(): T[] {
    return this._list.slice()
  }

  private get _hasAnySubscription() {
    return this._onRemove.hasSubscriptions || this._onAdd.hasSubscriptions ||
      this._onReplace.hasSubscriptions || this._onMove.hasSubscriptions ||
      this._onAnyChange.hasSubscriptions;
  }

  /**
   * Replaces the items in the list with the specified items
   * @param replacement the items to replace the current items with
   */
  replace(replacement: T[]): void {
    if (!this._hasAnySubscription) {
      this._list.length = 0
      this._list.push(...replacement)
      return
    }
    if (this._list.length === 0) {
      this.insertRange(0, replacement)
      return
    }
    for (let i = this._list.length - 1; i >= 0; i--) {
      const t = this._list[i]
      const index = replacement.indexOf(t)
      if (index !== -1) {
        continue
      }
      this.removeAt(i)
    }
    for (let i = 0; i < replacement.length; i++) {
      const t = replacement[i]
      const index = this._list.indexOf(t)
      if (index !== -1) {
        continue
      }
      this.insert(i, t)
    }
    const changedItems: { item: T, from: number, to: number }[] = []
    for (let i = 0; i < replacement.length; i++) {
      const t = replacement[i]
      const resultIndex = this._list.indexOf(t)
      if (resultIndex === i) {
        continue
      }
      this._list.splice(resultIndex, 1)
      this._list.splice(i, 0, t)
      changedItems.push({item: t, from: resultIndex, to: i})
    }
    if (changedItems.length <= 0) {
      return
    }
    const event: ObservableListMoveEvent<T> = {
      type: "move",
      items: changedItems
    }
    this._onMove.dispatch(event)
    this._onAnyChange.dispatch(event)
  }

  /**
   * Gets the index of the specified item
   * @param item the item to get the index of
   */
  indexOf(item: T): number {
    return this._list.indexOf(item)
  }

  /**
   * Gets the last index of the specified item
   * @param item the item to get the last index of
   */
  lastIndexOf(item: T): number {
    return this._list.lastIndexOf(item)
  }

  /**
   * Checks if the list contains the specified item
   * @param item the item to check
   */
  contains(item: T): boolean {
    return this._list.indexOf(item) !== -1
  }

  /**
   * Inserts the specified item at the specified index
   * @param index the index to insert the item at
   * @param item the item to insert
   */
  insert(index: number, item: T): void {
    const hasSubscriptions = this._onAdd.hasSubscriptions || this._onAnyChange.hasSubscriptions
    this._list.splice(index, 0, item)
    if (!hasSubscriptions) {
      return
    }
    const event: ObservableListAddEvent<T> = {
      type: "add",
      items: [item],
      startIndex: index
    }
    this._onAdd.dispatch(event)
    this._onAnyChange.dispatch(event)
  }

  /**
   * Removes the item at the specified index
   * @param index the index of the item to remove
   */
  removeAt(index: number): void {
    const hasSubscriptions = this._onRemove.hasSubscriptions || this._onAnyChange.hasSubscriptions
    if (!hasSubscriptions) {
      this._list.splice(index, 1)
      return
    }
    const removed = this._list.splice(index, 1)
    if (removed.length === 0) {
      return
    }
    const event: ObservableListRemoveEvent<T> = {
      type: "remove",
      items: removed,
      startIndex: index
    }
    this._onRemove.dispatch(event)
    this._onAnyChange.dispatch(event)
  }

  /**
   * Gets a readonly array of the current items in the list
   */
  get asReadonly(): ReadonlyArray<T> {
    return Object.freeze([...this._list])
  }

  /**
   * Sorts the list
   * @param compareFn the compare function to use for sorting the list
   */
  sort(compareFn?: (a: T, b: T) => number): void {
    const hasSubscriptions = this._onMove.hasSubscriptions || this._onAnyChange.hasSubscriptions;
    if (!hasSubscriptions) {
      this._list.sort(compareFn);
      return;
    }
    const array = this._list.slice();
    array.sort(compareFn);
    this.updateSorted(array)
  }

  /**
   * Clears the list
   */
  clear(): void {
    const hasSubscriptions = this._onRemove.hasSubscriptions || this._onAnyChange.hasSubscriptions;
    if (!hasSubscriptions) {
      this._list.length = 0
      return
    }
    const items = this._list.slice()
    this._list.length = 0
    const event: ObservableListRemoveEvent<T> = {
      type: "remove",
      items: items,
      startIndex: 0
    }
    this._onRemove.dispatch(event);
    this._onAnyChange.dispatch(event);
  }

  private updateSorted(sortedItems: T[]): void {
    const itemCount = sortedItems.length
    const items: SortItemData<T>[] = []
    for (let i = 0; i < itemCount; i++) {
      const item = this._list[i]
      const endPosition = sortedItems.indexOf(item)
      const distance = endPosition - i
      items.push({
        item,
        index: i,
        distance,
        distanceMoved: 0
      })
    }
    while (true) {
      let maxDistance = 0
      let index: SortItemData<T> | undefined = undefined
      let hasDistanceMoved = false
      for (const it of items) {
        let distance = it.distance
        if (distance < 0) {
          distance = -distance
        }
        if (distance <= maxDistance) {
          continue
        }
        if (it.distanceMoved !== 0) {
          hasDistanceMoved = true
        }
        maxDistance = distance
        index = it
      }
      if (maxDistance === 0) {
        if (hasDistanceMoved) {
          console.error("Bad state: hasDistanceMoved is true but maxDistance is 0")
          // throw new Error("Bad state: hasDistanceMoved is true but maxDistance is 0")
        }
        break
      }
      const item = index!
      const dist = item.distance
      item.distance = 0
      item.distanceMoved += dist
      const moveFrom = item.index
      item.index += dist

      if (dist > 0) {
        let nextNode = index;
        const indexIndex = items.indexOf(item)
        for (let i = 0; i < dist; i++) {
          nextNode = items[indexIndex + i + 1]
          nextNode.distance++;
          nextNode.index--;
        }
        items.splice(indexIndex, 1)
        const nextNodeIndex = items.indexOf(nextNode!)
        items.splice(nextNodeIndex + 1, 0, item)
      } else {
        let prevNode = index;
        const indexIndex = items.indexOf(item)
        for (let i = 0; i < -dist; i++) {
          prevNode = items[indexIndex - i - 1]
          prevNode.distance--;
          prevNode.index++;
        }
        items.splice(indexIndex, 1)
        const prevNodeIndex = items.indexOf(prevNode!)
        items.splice(prevNodeIndex, 0, item)
      }

      const event: ObservableListMoveEvent<T> = {
        type: "move",
        items: [{
          item: item.item!,
          from: moveFrom,
          to: item.index
        }]
      }
      this._list.splice(moveFrom, 1)
      this._list.splice(item.index, 0, item.item!)
      this._onMove.dispatch(event)
      this._onAnyChange.dispatch(event)
    }
  }
}


interface SortItemData<T> {
  item?: T
  index: number
  distance: number
  distanceMoved: number
}

