import {ObservableList} from "../../src/list/observable-list";

describe('observable list', () => {
  it('should dispatch add event when push', () => {
    const list = new ObservableList<number>()
    const onAdd = jest.fn()
    list.onAdd.subscribe(onAdd)
    list.push(1)
    expect(onAdd).toHaveBeenCalledWith({type: 'add', items: [1], startIndex: 0})
  })

  it('should dispatch add event when push multiple items', () => {
    const list = new ObservableList<number>()
    const onAdd = jest.fn()
    list.onAdd.subscribe(onAdd)
    list.push(1, 2, 3)
    expect(onAdd).toHaveBeenCalledWith({type: 'add', items: [1, 2, 3], startIndex: 0})
  })

  it('should dispatch add event when insertRange', () => {
    const list = new ObservableList<number>()
    const onAdd = jest.fn()
    list.onAdd.subscribe(onAdd)
    list.insertRange(0, [1, 2, 3])
    expect(onAdd).toHaveBeenCalledWith({type: 'add', items: [1, 2, 3], startIndex: 0})
  })

  it('should dispatch add event when insertRange at the end', () => {
    const list = new ObservableList<number>()
    const onAdd = jest.fn()
    list.onAdd.subscribe(onAdd)
    list.push(1, 2)
    list.insertRange(2, [3, 4])
    expect(onAdd).toHaveBeenCalledWith({type: 'add', items: [3, 4], startIndex: 2})
  })

  it('should dispatch remove event when removeRange', () => {
    const list = new ObservableList<number>()
    const onRemove = jest.fn()
    list.onRemove.subscribe(onRemove)
    list.push(1, 2, 3)
    list.removeRange(1, 2)
    expect(onRemove).toHaveBeenCalledWith({type: 'remove', items: [2, 3], startIndex: 1})
  })

  it('should dispatch remove event when remove', () => {
    const list = new ObservableList<number>()
    const onRemove = jest.fn()
    list.onRemove.subscribe(onRemove)
    list.push(1, 2, 3)
    list.remove(2)
    expect(onRemove).toHaveBeenCalledWith({type: 'remove', items: [2], startIndex: 1})
  })

  it.skip('should dispatch replace event when replace', () => {
    const list = new ObservableList<number>()
    const onReplace = jest.fn()
    list.onReplace.subscribe(onReplace)
    list.push(1, 2, 3)
    list.replace([4, 5, 6])
    expect(onReplace).toHaveBeenCalledWith({type: 'replace', oldItems: [1, 2, 3], newItems: [4, 5, 6], startIndex: 0})
  })

  it('should dispatch clear event when clear', () => {
    const list = new ObservableList<number>()
    const onClear = jest.fn()
    list.onRemove.subscribe(onClear)
    list.push(1, 2, 3)
    list.clear()
    expect(onClear).toHaveBeenCalledWith({type: 'remove', items: [1, 2, 3], startIndex: 0})
  })

  it('should dispatch replace event when set a new value for index', () => {
    const list = new ObservableList<number>()
    const onReplace = jest.fn()
    list.onReplace.subscribe(onReplace)
    list.push(1, 2, 3)
    list.set(1, 4)
    expect(onReplace).toHaveBeenCalledWith({type: 'replace', oldItems: [2], newItems: [4], startIndex: 1})
  })

  it('push not fail on empty list', () => {
    const list = new ObservableList<number>()
    list.push()
    expect(list.length).toBe(0)
  })

  it('push not fail when no subscribers', () => {
    const list = new ObservableList<number>()
    list.push(1)
    expect(list.length).toBe(1)
  })

  it('get should return the value at the specified index', () => {
    const list = new ObservableList<number>()
    list.push(1, 2, 3)

    expect(list.get(1)).toBe(2)
    expect(list.get(0)).toBe(1)
    expect(list.get(2)).toBe(3)

    list.push(4)

    expect(list.get(3)).toBe(4)
  })

  it('get should return undefined when index is out of range', () => {
    const list = new ObservableList<number>()
    expect(list.get(0)).toBeUndefined()
  })

  it('set should replace the value at the specified index', () => {
    const list = new ObservableList<number>()
    list.push(1, 2, 3)

    list.set(1, 4)

    expect(list.get(1)).toBe(4)
  })

  it('copyTo should copy the items to the specified array', () => {
    const list = new ObservableList<number>()
    list.push(1, 2, 3)

    const array: number[] = []
    list.copyTo(array)

    expect(array).toEqual([1, 2, 3])
  })

  it('getRange should return the items in the specified range', () => {
    const list = new ObservableList<number>()
    list.push(1, 2, 3)

    const range = list.getRange(1, 2)

    expect(range).toEqual([2, 3])
  })

  it('getRange should return the items in the specified range when start index is greater than end index', () => {
    const list = new ObservableList<number>()
    list.push(1, 2, 3)

    const range = list.getRange(2, 1)

    expect(range).toEqual([3])
  })

  it('insertRange should insert the items at the specified index', () => {
    const list = new ObservableList<number>()
    list.push(1, 2, 3)

    list.insertRange(1, [4, 5])

    expect(list.toArray()).toEqual([1, 4, 5, 2, 3])
  })

  it('remove should remove the item at the specified index', () => {
    const list = new ObservableList<number>()
    list.push(1, 2, 3)

    list.remove(1)

    expect(list.toArray()).toEqual([2, 3])
  })

  it('remove should not fail when index is out of range', () => {
    const list = new ObservableList<number>()
    list.push(1, 2, 3)

    list.remove(10)

    expect(list.toArray()).toEqual([1, 2, 3])
  })

  it('removeRange should remove the items in the specified range', () => {
    const list = new ObservableList<number>()
    list.push(1, 2, 3, 4, 5)

    list.removeRange(1, 3)

    expect(list.toArray()).toEqual([1, 5])
  })

  it('indexOf should return the index of the specified item', () => {
    const list = new ObservableList<number>()
    list.push(1, 2, 3)

    expect(list.indexOf(2)).toBe(1)

    list.push(2)

    expect(list.indexOf(2)).toBe(1)

    list.push(2)

    expect(list.indexOf(2)).toBe(1)
  })

  it('indexOf should return -1 when the item is not found', () => {
    const list = new ObservableList<number>()
    list.push(1, 2, 3)

    expect(list.indexOf(4)).toBe(-1)
  })

  it('lastIndexOf should return the last index of the specified item', () => {
    const list = new ObservableList<number>()
    list.push(1, 2, 3, 2)

    expect(list.lastIndexOf(2)).toBe(3)
  })

  it('lastIndexOf should return -1 when the item is not found', () => {
    const list = new ObservableList<number>()
    list.push(1, 2, 3)

    expect(list.lastIndexOf(4)).toBe(-1)
  })

  it('contains should return true when the item is found', () => {
    const list = new ObservableList<number>()
    list.push(1, 2, 3)

    expect(list.contains(2)).toBe(true)
  })

  it('contains should return false when the item is not found', () => {
    const list = new ObservableList<number>()
    list.push(1, 2, 3)

    expect(list.contains(4)).toBe(false)
  })

  it('removeAt should dispatch remove event', () => {
    const list = new ObservableList<number>()
    const onRemove = jest.fn()
    list.onRemove.subscribe(onRemove)
    list.push(1, 2, 3)
    list.removeAt(1)
    expect(onRemove).toHaveBeenCalledWith({type: 'remove', items: [2], startIndex: 1})
  })

  it('removeAt should remove the item at the specified index', () => {
    const list = new ObservableList<number>()
    list.push(1, 2, 3)

    list.removeAt(1)

    expect(list.toArray()).toEqual([1, 3])
  })

  it('removeAt should not fail when index is out of range', () => {
    const list = new ObservableList<number>()
    list.push(1, 2, 3)

    list.removeAt(10)

    expect(list.toArray()).toEqual([1, 2, 3])
  })

  it('clear should remove all items', () => {
    const list = new ObservableList<number>()
    list.push(1, 2, 3)

    list.clear()

    expect(list.toArray()).toEqual([])
  })

  it('should sort the items', () => {
    const list = new ObservableList<number>()
    list.push(3, 2, 1)

    list.sort()

    expect(list.toArray()).toEqual([1, 2, 3])
  })

  it('should sort the items in descending order', () => {
    const list = new ObservableList<number>()
    list.push(1, 2, 3)

    list.sort((a, b) => b - a)

    expect(list.toArray()).toEqual([3, 2, 1])
  })

  it('should sort and dispatch move events', () => {
    const list = new ObservableList<number>()
    const onMove = jest.fn()
    list.onMove.subscribe(onMove)
    list.push(3, 2, 1)

    list.sort()

    expect(onMove).toHaveBeenCalledWith({
      type: 'move',
      items: [{
        item: 1,
        from: 2,
        to: 0
      }]
    })
    expect(onMove).toHaveBeenCalledWith({
      type: 'move',
      items: [{
        item: 3,
        from: 0,
        to: 2
      }]
    })
  })
})
