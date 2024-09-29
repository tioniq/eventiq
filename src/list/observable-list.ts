import {EventDispatcher, EventObserver} from "../events";

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
  private readonly list: T[];
  private readonly _onRemove = new EventDispatcher<ObservableListRemoveEvent<T>>();
  private readonly _onAdd = new EventDispatcher<ObservableListAddEvent<T>>();
  private readonly _onReplace = new EventDispatcher<ObservableListReplaceEvent<T>>();
  private readonly _onMove = new EventDispatcher<ObservableListMoveEvent<T>>();
  private readonly _onAnyChange = new EventDispatcher<ObservableListChangeEvent<T>>();

  constructor(items?: T[]) {
    this.list = Array.isArray(items) ? [...items] : [];
  }

  get onRemove(): EventObserver<ObservableListRemoveEvent<T>> {
    return this._onRemove;
  }

  get onAdd(): EventObserver<ObservableListAddEvent<T>> {
    return this._onAdd;
  }

  get onReplace(): EventObserver<ObservableListReplaceEvent<T>> {
    return this._onReplace;
  }

  get onMove(): EventObserver<ObservableListMoveEvent<T>> {
    return this._onMove;
  }

  get onAnyChange(): EventObserver<ObservableListChangeEvent<T>> {
    return this._onAnyChange;
  }

  get length(): number {
    return this.list.length
  }

  get(index: number): T {
    return this.list[index]
  }

  set(index: number, value: T): void {
    const hasSubscriptions = this._onReplace.hasSubscriptions || this._onAnyChange.hasSubscriptions;
    if (!hasSubscriptions) {
      this.list[index] = value;
      return
    }
    const old = this.list[index];
    this.list[index] = value;
    const event: ObservableListReplaceEvent<T> = {
      type: "replace",
      oldItems: [old],
      newItems: [value],
      startIndex: index
    }
    this._onReplace.dispatch(event);
    this._onAnyChange.dispatch(event);
  }

  push(...items: T[]): void {
    this.pushAll(items)
  }

  pushAll(items: T[]): void {
    if (items === undefined || items.length === 0) {
      return
    }
    if (items.length === 1) {
      const item = items[0]
      const hasSubscriptions = this._onAdd.hasSubscriptions || this._onAnyChange.hasSubscriptions;
      this.list.push(item);
      if (!hasSubscriptions) {
        return;
      }
      const event: ObservableListAddEvent<T> = {
        type: "add",
        items: [item],
        startIndex: this.list.length - 1
      }
      this._onAdd.dispatch(event);
      this._onAnyChange.dispatch(event);
      return
    }
    const hasSubscriptions = this._onAdd.hasSubscriptions || this._onAnyChange.hasSubscriptions;
    this.list.push(...items);
    if (!hasSubscriptions) {
      return;
    }
    const event: ObservableListAddEvent<T> = {
      type: "add",
      items: [...items],
      startIndex: this.list.length - items.length
    }
    this._onAdd.dispatch(event);
    this._onAnyChange.dispatch(event);
  }

  copyTo(array: T[]): void {
    array.push(...this.list)
  }

  getRange(index: number, count: number): T[] {
    return this.list.slice(index, index + count)
  }

  insertRange(index: number, items: T[]): void {
    const hasSubscriptions = this._onAdd.hasSubscriptions || this._onAnyChange.hasSubscriptions
    if (!hasSubscriptions) {
      this.list.splice(index, 0, ...items)
      return
    }
    this.list.splice(index, 0, ...items)
    const event: ObservableListAddEvent<T> = {
      type: "add",
      items: [...items],
      startIndex: index
    }
    this._onAdd.dispatch(event)
    this._onAnyChange.dispatch(event)
  }

  remove(item: T): boolean {
    const hasSubscriptions = this._onRemove.hasSubscriptions || this._onAnyChange.hasSubscriptions
    const index = this.list.indexOf(item)
    if (index === -1) {
      return false
    }
    this.list.splice(index, 1)
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

  removeRange(index: number, count: number): void {
    const hasSubscriptions = this._onRemove.hasSubscriptions || this._onAnyChange.hasSubscriptions
    if (!hasSubscriptions) {
      this.list.splice(index, count)
      return
    }
    const items = this.list.slice(index, index + count)
    this.list.splice(index, count)
    const event: ObservableListRemoveEvent<T> = {
      type: "remove",
      items: items,
      startIndex: index
    }
    this._onRemove.dispatch(event)
    this._onAnyChange.dispatch(event)
  }

  toArray(): T[] {
    return this.list.slice()
  }

  private get _hasAnySubscription() {
    return this._onRemove.hasSubscriptions || this._onAdd.hasSubscriptions ||
      this._onReplace.hasSubscriptions || this._onMove.hasSubscriptions ||
      this._onAnyChange.hasSubscriptions;
  }

  replace(replacement: T[]): void {
    if (!this._hasAnySubscription) {
      this.list.length = 0
      this.list.push(...replacement)
      return
    }
    if (this.list.length === 0) {
      this.insertRange(0, replacement)
      return
    }
    for (let i = this.list.length - 1; i >= 0; i--) {
      const t = this.list[i]
      const index = replacement.indexOf(t)
      if (index !== -1) {
        continue
      }
      this.removeAt(i)
    }
    for (let i = 0; i < replacement.length; i++) {
      const t = replacement[i]
      const index = this.list.indexOf(t)
      if (index !== -1) {
        continue
      }
      this.insert(i, t)
    }
    const changedItems: { item: T, from: number, to: number }[] = []
    for (let i = 0; i < replacement.length; i++) {
      const t = replacement[i]
      const resultIndex = this.list.indexOf(t)
      if (resultIndex === i) {
        continue
      }
      this.list.splice(resultIndex, 1)
      this.list.splice(i, 0, t)
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

  indexOf(item: T): number {
    return this.list.indexOf(item)
  }

  lastIndexOf(item: T): number {
    return this.list.lastIndexOf(item)
  }

  contains(item: T): boolean {
    return this.list.indexOf(item) !== -1
  }

  insert(index: number, item: T): void {
    const hasSubscriptions = this._onAdd.hasSubscriptions || this._onAnyChange.hasSubscriptions
    this.list.splice(index, 0, item)
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

  removeAt(index: number): void {
    const hasSubscriptions = this._onRemove.hasSubscriptions || this._onAnyChange.hasSubscriptions
    if (!hasSubscriptions) {
      this.list.splice(index, 1)
      return
    }
    const removed = this.list.splice(index, 1)
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

  get asReadonly(): ReadonlyArray<T> {
    // TODO
    return [...this.list]
  }

  sort(compareFn?: (a: T, b: T) => number): void {
    const hasSubscriptions = this._onMove.hasSubscriptions || this._onAnyChange.hasSubscriptions;
    if (!hasSubscriptions) {
      this.list.sort(compareFn);
      return;
    }
    const array = this.list.slice();
    array.sort(compareFn);
    this.updateSorted(array)
  }

  clear(): void {
    const hasSubscriptions = this._onRemove.hasSubscriptions || this._onAnyChange.hasSubscriptions;
    if (!hasSubscriptions) {
      this.list.length = 0
      return
    }
    const items = this.list.slice()
    this.list.length = 0
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
      const item = this.list[i]
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
      this.list.splice(moveFrom, 1)
      this.list.splice(item.index, 0, item.item!)
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

