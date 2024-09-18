import {Action} from "../action";
import {DisposableCompat} from "@tioniq/disposiq";

/**
 * A base class for event observers. **All event observers should extend this class**.
 * <p>
 *   The general idea is that an **event observer is an object that can be subscribed to**. When the event is
 *   dispatched, all subscribers are notified. You can subscribe to the event observer using the `subscribe` method.
 *   The callback will be called every time the event is dispatched. You can unsubscribe by calling the `dispose`
 *   method of the returned object
 * </p>
 */
export abstract class EventObserver<T = void> {
  /**
   * Subscribes to the event observer. The callback will be called every time the event is dispatched. You can
   * unsubscribe by calling the `dispose` method of the returned object
   * @param callback the callback for the subscription
   * @returns an object that can be used to unsubscribe
   */
  abstract subscribe(callback: Action<T>): DisposableCompat
}
