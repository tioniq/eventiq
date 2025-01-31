import { CompoundVariable } from "./compound"
import type { Variable } from "../variable"
import { DisposableContainer } from "@tioniq/disposiq"
import { EqualityComparer } from "../comparer";

export type SwitchMapMapper<TInput, TResult> = (
  input: TInput,
) => Variable<TResult>

/**
 * A variable that switches the value of another variable to a new value based on mapper that returns another variable
 * @typeparam TInput - the type of the input variable value
 * @typeparam TResult - the type of the output variable value
 */
export class SwitchMapVariable<
  TInput,
  TResult,
> extends CompoundVariable<TResult> {
  /**
   * @internal
   */
  private readonly _switchSubscription = new DisposableContainer()

  /**
   * @internal
   */
  private readonly _varSubscription = new DisposableContainer()

  /**
   * @internal
   */
  private readonly _var: Variable<TInput>

  /**
   * @internal
   */
  private readonly _mapper: SwitchMapMapper<TInput, TResult>

  constructor(
    vary: Variable<TInput>,
    mapper: SwitchMapMapper<TInput, TResult>,
    equalityComparer?: EqualityComparer<TResult>,
  ) {
    // biome-ignore lint/style/noNonNullAssertion: base value will not be used
    super(null!, equalityComparer)
    this._var = vary
    this._mapper = mapper
  }

  protected activate(): void {
    this._switchSubscription.disposeCurrent()
    this._switchSubscription.set(
      this._var.subscribeSilent((i) => this._handleSwitch(i)),
    )
    this._handleSwitch(this._var.value)
  }

  protected deactivate(): void {
    this._switchSubscription.disposeCurrent()
    this._varSubscription.disposeCurrent()
  }

  protected getExactValue(): TResult {
    return this._mapper(this._var.value).value
  }

  /**
   * @internal
   */
  private _handleSwitch(input: TInput): void {
    this._varSubscription.disposeCurrent()
    const mappedVariable = this._mapper(input)
    this._varSubscription.set(
      mappedVariable.subscribeSilent((result) => {
        this.value = result
      }),
    )
    this.value = mappedVariable.value
  }
}
