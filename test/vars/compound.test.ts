import {CompoundVariable, EqualityComparer} from "../../src";

describe('compound var', () => {
  it('should return the same equality comparer', () => {
    const equalityComparer = (a: number, b: number) => a === b
    const vary = new TestVar(0, equalityComparer)
    expect(vary.equalityComparer).toBe(equalityComparer)
  })

  it('should activate and deactivate', () => {
    const vary = new TestVar(0)

    expect(vary.activated).toBe(false)

    const subscription = vary.subscribe(() => {
    })

    expect(vary.activated).toBe(true)

    vary.subscribe(() => {
    }).dispose()

    expect(vary.activated).toBe(true)

    subscription.dispose()

    expect(vary.activated).toBe(false)
  })
})

class TestVar<T> extends CompoundVariable<T> {
  private _active = false

  constructor(initValue: T, equalityComparer?: EqualityComparer<T>) {
    super(initValue, equalityComparer)
  }

  get activated(): boolean {
    return this._active
  }

  protected activate(): void {
    this._active = true
  }

  protected deactivate(): void {
    this._active = false
  }
}