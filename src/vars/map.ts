import { CompoundVariable } from "./compound"
import type { Variable } from "../variable"
import type { Func } from "../action"
import { DisposableContainer } from "@tioniq/disposiq"
import type { EqualityComparer } from "../comparer"

/**
 * A variable that maps the value of another variable to a new value
 * @typeparam TInput - the type of the input variable value
 * @typeparam TOutput - the type of the output variable value
 */
export class MapVariable<TInput, TOutput> extends CompoundVariable<TOutput> {
  /**
   * @internal
   */
  private readonly _variable: Variable<TInput>

  /**
   * @internal
   */
  private readonly _mapper: Func<TInput, TOutput>

  /**
   * @internal
   */
  private readonly _subscription = new DisposableContainer()

  constructor(
    variable: Variable<TInput>,
    mapper: Func<TInput, TOutput>,
    equalityComparer?: EqualityComparer<TOutput>,
  ) {
    super(mapper(variable.value), equalityComparer)
    this._variable = variable
    this._mapper = mapper
  }

  /**
   * @internal
   */
  private readonly _listener = (value: TInput) => {
    this.value = this._mapper(value)
  }

  protected override activate(): void {
    this._subscription.disposeCurrent()
    this._subscription.set(this._variable.subscribeSilent(this._listener))
    this._listener(this._variable.value)
  }

  protected override deactivate(): void {
    this._subscription.disposeCurrent()
  }

  protected override getExactValue(): TOutput {
    return this._mapper(this._variable.value)
  }
}
