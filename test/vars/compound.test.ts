import { CompoundVariable, type EqualityComparer } from "../../src"

describe("compound var", () => {
  it("should activate and deactivate", () => {
    const vary = new TestVar(0)

    expect(vary.activated).toBe(false)

    const subscription = vary.subscribe(() => {})

    expect(vary.activated).toBe(true)

    vary.subscribe(() => {}).dispose()

    expect(vary.activated).toBe(true)

    subscription.dispose()

    expect(vary.activated).toBe(false)
  })
})

class TestVar<T> extends CompoundVariable<T> {
  private _active = false

  // biome-ignore lint/complexity/noUselessConstructor: constructor is needed for testing
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
