import type { EventObserver } from "./observer"
import { LazyEventDispatcher } from "./lazy"
import { DisposableStore } from "@tioniq/disposiq"

/**
 * Merges multiple event observers into a single event observer. The resulting event observer will dispatch events
 * from all the given event observers.
 * @param observers the event observers to merge
 * @returns the merged event observer
 * @typeparam T - the type of the event value
 */
export function merge<T>(...observers: EventObserver<T>[]): EventObserver<T> {
  return new LazyEventDispatcher<T>((dispatcher) => {
    const disposableStore = new DisposableStore()
    for (const t of observers) {
      disposableStore.add(t.subscribe((v) => dispatcher.dispatch(v)))
    }
    return disposableStore
  })
}
