import {EventObserver} from "./observer"
import {Disposiq, emptyDisposable} from "@tioniq/disposiq";

/**
 * A stub for the EventObserver class.
 * <p>
 *   The purpose of this class is to provide a stub for the EventObserver class that does nothing
 * </p>
 * @typeparam T - the type of the event value
 */
export class EventObserverStub<T> extends EventObserver<T> {
  subscribe(): Disposiq {
    return emptyDisposable
  }
}