import {CompoundVariable} from "./compound"
import {Variable} from "../variable";
import {DisposableContainer} from "@tioniq/disposiq";
import {EventObserver} from "../events";

const noScheduledValue = Object.freeze({})

/**
 * A variable that will throttle the updates of the given variable. The throttler is an event observer that will
 * be subscribed where the updates will be scheduled. When the event is dispatched, the throttler will update the
 * value of the variable
 * @typeparam T - the type of the variable value
 */
export class ThrottledVariable<T> extends CompoundVariable<T> {
  /**
   * @internal
   */
  private readonly _subscription = new DisposableContainer()

  /**
   * @internal
   */
  private readonly _updateSubscription = new DisposableContainer()

  /**
   * @internal
   */
  private readonly _var: Variable<T>

  /**
   * @internal
   */
  private readonly _onUpdate: EventObserver

  /**
   * @internal
   */
  private _scheduledValue: T | typeof noScheduledValue = noScheduledValue

  constructor(vary: Variable<T>, onUpdate: EventObserver) {
    super(null!, vary.equalityComparer)
    this._var = vary
    this._onUpdate = onUpdate
  }

  protected activate(): void {
    this._subscription.disposeCurrent()
    this._subscription.set(this._var.subscribeSilent(v => {
      this._scheduleUpdate(v)
    }))
    this.value = this._var.value
  }

  protected deactivate(): void {
    this._subscription.disposeCurrent()
    this._updateSubscription.disposeCurrent()
  }

  protected getExactValue(): T {
    return this._var.value
  }

  /**
   * @internal
   */
  private _scheduleUpdate(value: T) {
    if (this._scheduledValue !== noScheduledValue) {
      this._scheduledValue = value
      return
    }
    this._scheduledValue = value
    this._updateSubscription.disposeCurrent();
    this._updateSubscription.set(this._onUpdate.subscribeOnce(() => {
      const val = this._scheduledValue
      this._scheduledValue = noScheduledValue
      this.value = val === noScheduledValue ? this._var.value : val as T
    }))
  }
}