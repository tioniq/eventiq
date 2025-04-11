import { Disposiq, DisposableLike, IDisposable } from '@tioniq/disposiq';

type Action$1<T = void> = (value: T) => void;
type Func0<R> = () => R;
type Func<T, R> = (arg: T) => R;

/**
 * A base class for event observers. **All event observers should extend this class**.
 * <p>
 *   The general idea is that an **event observer is an object that can be subscribed to**. When the event is
 *   dispatched, all subscribers are notified. You can subscribe to the event observer using the `subscribe` method.
 *   The callback will be called every time the event is dispatched. You can unsubscribe by calling the `dispose`
 *   method of the returned object
 * </p>
 */
declare abstract class EventObserver<T = void> {
    /**
     * Subscribes to the event observer. The callback will be called every time the event is dispatched. You can
     * unsubscribe by calling the `dispose` method of the returned object
     * @param callback the callback for the subscription
     * @returns an object that can be used to unsubscribe
     */
    abstract subscribe(callback: Action$1<T>): Disposiq;
}
/**
 * EventObserver extensions
 */
interface EventObserver<T> {
    /**
     * Subscribes to the event observer. The callback will be called only once
     * @param callback the callback for the subscription
     * @returns an object that can be used to unsubscribe
     */
    subscribeOnce(callback: Action$1<T>): Disposiq;
    /**
     * Subscribes to the event observer. The callback will be called only once when the condition is met
     * @param callback the callback for the subscription
     * @param condition the condition that must be met to call the callback
     * @returns an object that can be used to unsubscribe
     */
    subscribeOnceWhere(callback: Action$1<T>, condition: Func<T, boolean>): Disposiq;
    /**
     * Subscribes to the event observer. The callback will be called every time the event is dispatched when the
     * condition is met
     * @param callback the callback for the subscription
     * @param condition the condition that must be met to call the callback
     * @returns an object that can be used to unsubscribe
     */
    subscribeWhere(callback: Action$1<T>, condition: Func<T, boolean>): Disposiq;
    /**
     * Subscribes to the event observer. The callback will be called only when the condition variable is true
     * @param callback the callback for the subscription
     * @param condition the condition that must be met to call the callback
     * @returns an object that can be used to unsubscribe
     */
    subscribeOn(callback: Action$1<T>, condition: Variable<boolean>): Disposiq;
    /**
     * Maps the event observer to a new event observer with a different type
     * @param mapper the function that maps the value of the event observer to a new value
     * @returns the new event observer
     * @typeparam TOutput - the type of the new event observer
     */
    map<TOutput>(mapper: Func<T, TOutput>): EventObserver<TOutput>;
    /**
     * Maps the event observer to a new by filtering the values
     * @param condition the condition that must be met to dispatch the event
     * @returns the new event observer
     */
    where(condition: Func<T, boolean>): EventObserver<T>;
    /**
     * Maps the event observer to an awaited event observer. The observer will try to await every value and call the
     * onRejection callback if the value is rejected
     *
     * @param onRejection the callback that will be called when the value is rejected
     * @returns the awaited event observer
     * @typeparam T - the type of the event value. If the event value is a promise, the awaited event observer will
     *  await the promise and call the onRejection callback if the promise is rejected. If the event value is not a
     *  promise, the awaited event observer will trigger an event with the value
     */
    awaited(onRejection?: (error: unknown, value: T) => void): EventObserver<Awaited<T>>;
}

/**
 * A class that implements the EventObserver class and provides the ability to dispatch events by calling the `dispatch`
 * method
 * @typeparam T - the type of the event value
 */
declare class EventDispatcher<T = void> extends EventObserver<T> {
    subscribe(action: Action$1<T>): Disposiq;
    /**
     * Dispatches the event to all subscribers
     * @param value the value of the event
     */
    dispatch(value: T): void;
    /**
     * Checks if there are any subscriptions
     * @returns true if there are any subscriptions, false otherwise
     */
    get hasSubscriptions(): boolean;
}
/**
 * EventDispatcher extensions
 */
interface EventDispatcher<T> {
    /**
     * Dispatches the event to all subscribers. If an error occurs while dispatching the event, it will be caught
     * @param value the value of the event
     */
    dispatchSafe(value: T): void;
}

/**
 * A class that implements the EventObserver class and provides the ability to dispatch events by calling the `dispatch`
 * method. The method `dispatch` will fire events and catch exceptions unlike {@link EventDispatcher}
 * @typeparam T - the type of the event value
 */
declare class EventSafeDispatcher<T = void> extends EventObserver<T> {
    subscribe(action: Action$1<T>): Disposiq;
    /**
     * Dispatches the event to all subscribers safely
     * @param value the value of the event
     * @param onError error callback
     */
    dispatch(value: T, onError?: (e: unknown) => void): void;
    /**
     * Checks if there are any subscriptions
     * @returns true if there are any subscriptions, false otherwise
     */
    get hasSubscriptions(): boolean;
}

/**
 * A stub for the EventObserver class.
 * <p>
 *   The purpose of this class is to provide a stub for the EventObserver class that does nothing
 * </p>
 * @typeparam T - the type of the event value
 */
declare class EventObserverStub<T> extends EventObserver<T> {
    subscribe(): Disposiq;
}

/**
 * A class that implements the EventObserver class in a lazy way. The implementation receives an activator function.
 * The activator will be activated only when there is at least one subscription. When the last subscription is disposed,
 * the activator will be deactivated. The activator can be reactivated when a new subscription is added.
 * <p>
 *   This class is useful when you need to activate some resources only when there are subscribers.
 *   subscribers.
 * </p>
 * @typeparam T - the type of the event value
 */
declare class LazyEventDispatcher<T = void> extends EventObserver<T> {
    constructor(activator: Func<LazyEventDispatcher<T>, DisposableLike>);
    /**
     * Checks if there are any subscriptions
     * @returns true if there are any subscriptions, false otherwise
     */
    get hasSubscription(): boolean;
    subscribe(callback: Action$1<T>): Disposiq;
    /**
     * Dispatches the event to all subscribers
     * @param value the value of the event
     */
    dispatch(value: T): void;
}

/**
 * Merges multiple event observers into a single event observer. The resulting event observer will dispatch events
 * from all the given event observers.
 * @param observers the event observers to merge
 * @returns the merged event observer
 * @typeparam T - the type of the event value
 */
declare function merge<T>(...observers: EventObserver<T>[]): EventObserver<T>;

type EqualityComparer<T> = (a: T, b: T) => boolean;
declare function strictEqualityComparer<T>(a: T, b: T): boolean;
declare function simpleEqualityComparer<T>(a: T, b: T): boolean;
declare var defaultEqualityComparer: EqualityComparer<unknown>;
declare function setDefaultEqualityComparer(comparer: EqualityComparer<unknown>): void;
declare function functionEqualityComparer(a: Function, b: Function): boolean;
declare function generalEqualityComparer<T>(a: T, b: T): boolean;
declare function objectEqualityComparer<T extends object>(a: T, b: T): boolean;
declare function arrayEqualityComparer<K, T extends ArrayLike<K>>(a: T, b: T): boolean;

/**
 * Base Variable class. **All variables should extend this class**.
 * <p>
 * The general idea is that a **variable is a value that can be observed**. When the value changes, all subscribers are
 * notified. When we say 'changed', we mean that the value has changed according to the equality comparer. The default
 * equality comparer is the strict equality comparer.
 * </p>
 * <p>
 * You can subscribe to the variable using the `subscribe` or `subscribeSilent` methods.
 * The difference between them is that the **`subscribe` method will notify the subscriber immediately** after the
 * subscription, while the `subscribeSilent` method will not notify the subscriber immediately after the subscription.
 * </p>
 * @typeparam T - the type of the variable value
 */
declare abstract class Variable<out T> {
    /**
     * The current value of the variable
     */
    abstract get value(): T;
    /**
     * Subscribes to the variable. The callback will be called immediately after the subscription and every time the value
     * of the variable changes. You can unsubscribe by calling the `dispose` method of the returned object.
     * @param callback the callback that will be called immediately after the subscription and every time the value of the
     * variable changes
     * @returns an object that can be used to unsubscribe
     */
    abstract subscribe(callback: Func<T, void>): Disposiq;
    /**
     * Subscribes to the variable. The callback will not be called immediately after the subscription, only when the value
     * of the variable changes. You can unsubscribe by calling the `dispose` method of the returned object.
     * @param callback the callback that will be called every time the value of the variable changes
     * @returns an object that can be used to unsubscribe
     */
    abstract subscribeSilent(callback: Func<T, void>): Disposiq;
    /**
     * Overload of the `toString` method. Returns the string representation of the value of the variable
     * @returns the string representation of the value of the variable
     */
    toString(): string;
    /**
     * Overload of the `valueOf` method. Converts the variable to a primitive value, in this case, the value of the variable
     * @returns the primitive value of the variable
     */
    valueOf(): T;
}
/**
 * Variable extensions
 */
interface Variable<out T> {
    /**
     * Subscribes to the variable. The callback can return a disposable object that will be disposed when a value is
     * changed or the subscription is disposed
     * @param callback the callback
     * @returns an object that can be used to unsubscribe
     */
    subscribeDisposable(callback: Func<T, IDisposable>): Disposiq;
    /**
     * Subscribes to the variable and calls the callback once if the condition is met
     * @param callback the callback
     * @param condition the condition
     * @returns an object that can be used to unsubscribe
     */
    subscribeOnceWhere(callback: Action$1<T>, condition: Func<T, boolean>): Disposiq;
    /**
     * Subscribes to a callback that will be executed only when a specified condition is met.
     *
     * @param callback the function to execute whenever the condition is fulfilled.
     * @param condition a value that determines whether the given condition is satisfied.
     * @param equalityComparer an optional equality comparer that will be used to compare the condition value with the
     * @return a disposable object that can be used to unsubscribe from the subscription.
     */
    subscribeWhere(callback: Action$1<T>, condition: T, equalityComparer?: EqualityComparer<T>): Disposiq;
    /**
     * Subscribes to a callback that will be executed only when a specified condition is met.
     *
     * @param callback the function to execute whenever the condition is fulfilled.
     * @param condition a function that determines whether the given condition is satisfied.
     * @return a disposable object that can be used to unsubscribe from the subscription.
     */
    subscribeWhere(callback: Action$1<T>, condition: Func<T, boolean>): Disposiq;
    /**
     * Maps the variable value to another value
     * @param mapper the mapper
     * @param equalityComparer the equality comparer for the mapped value
     * @returns a new variable with the mapped value
     */
    map<TOutput>(mapper: Func<T, TOutput>, equalityComparer?: EqualityComparer<TOutput>): Variable<TOutput>;
    /**
     * Creates a new variable that will return true if any of the variable values are true
     * @param other the other variable
     * @returns a new OR variable
     */
    or(this: Variable<boolean>, other: Variable<boolean>): Variable<boolean>;
    /**
     * Creates a new variable that will return true if all the variable values are true
     * @param other the other variable
     * @returns a new AND variable
     */
    and(this: Variable<boolean>, other: Variable<boolean>): Variable<boolean>;
    /**
     * Inverts the variable value. If the value is true, the new value will be false and vice versa
     * @returns a new variable with the inverted value
     */
    invert(this: Variable<boolean>): Variable<boolean>;
    /**
     * Combines the variable with other variables
     * @param others the other variables
     * @returns a new variable with the combined values
     */
    with<O extends unknown[]>(...others: {
        [K in keyof O]: Variable<O[K]>;
    }): Variable<[T, ...O]>;
    /**
     * Maps the variable value to another value using the mapper that returns a new variable to subscribe
     * @param mapper the mapper that returns another variable to subscribe
     * @param equalityComparer the equality comparer for the mapped value
     * @returns a new variable with the mapped value
     */
    switchMap<TResult>(mapper: SwitchMapMapper<T, TResult>, equalityComparer?: EqualityComparer<TResult>): Variable<TResult>;
    /**
     * Throttles the variable value changes
     * @param delay the delay in milliseconds
     * @param equalityComparer the equality comparer
     * @returns a new variable with the throttled value
     */
    throttle<T>(delay: number, equalityComparer?: EqualityComparer<T>): Variable<T>;
    /**
     * Throttles the variable value changes
     * @param onUpdate the event observer that will be used to throttle the value changes
     * @param equalityComparer the equality comparer
     * @returns a new variable with the throttled value
     */
    throttle<T>(onUpdate: EventObserver, equalityComparer?: EqualityComparer<T>): Variable<T>;
    /**
     * Streams the variable value to another mutable variable
     * @param receiver the receiver variable
     * @returns an object that can be used to unsubscribe
     */
    streamTo<R extends T>(receiver: MutableVariable<R>): Disposiq;
    /**
     * Keeps the variable's subscription alive
     * @returns an object that can be used to stop the persistence
     */
    startPersistent(): Disposiq;
    /**
     * Creates a new variable that will return the sum of the variable values
     * @param other the other variable or a value
     * @returns a new SUM variable
     */
    plus(this: Variable<number>, other: Variable<number> | number): Variable<number>;
    /**
     * Creates a new variable that will return the difference of the variable values
     * @param other the other variable or a value
     * @returns a new SUM variable
     */
    minus(this: Variable<number>, other: Variable<number> | number): Variable<number>;
    /**
     * Creates a new variable that will return the product of the variable values
     * @param other the other variable or a value
     * @returns a new MULTIPLY variable
     */
    multiply(this: Variable<number>, other: Variable<number> | number): Variable<number>;
    /**
     * Creates a new variable that will return the quotient of the variable values
     * @param other the other variable or a value
     * @returns a new DIVIDE variable
     */
    divide(this: Variable<number>, other: Variable<number> | number): Variable<number>;
    /**
     * Creates a new variable that will return the rounded value of the variable
     * @returns a new variable with the rounded value
     */
    round(this: Variable<number>): Variable<number>;
    /**
     * Creates a new variable that will return true if the variable value is greater than the other value
     * @param other the other variable or a value
     * @returns a new variable with the comparison result
     */
    moreThan(this: Variable<number>, other: Variable<number> | number): Variable<boolean>;
    /**
     * Creates a new variable that will return true if the variable value is less than the other value
     * @param other the other variable or a value
     * @returns a new variable with the comparison result
     */
    lessThan(this: Variable<number>, other: Variable<number> | number): Variable<boolean>;
    /**
     * Creates a new variable that will return true if the variable value is greater or equal to the other value
     * @param other the other variable or a value
     * @returns a new variable with the comparison result
     */
    moreOrEqual(this: Variable<number>, other: Variable<number> | number): Variable<boolean>;
    /**
     * Creates a new variable that will return true if the variable value is less or equal to the other value
     * @param other the other variable or a value
     * @returns a new variable with the comparison result
     */
    lessOrEqual(this: Variable<number>, other: Variable<number> | number): Variable<boolean>;
    /**
     * Creates a new variable that will return true if the variable value is equal to the other value
     * @param other the other variable or a value
     * @param equalityComparer the equality comparer
     * @returns a new variable with the comparison result
     */
    equal<R extends T>(other: Variable<R> | R, equalityComparer?: EqualityComparer<R>): Variable<boolean>;
    /**
     * Creates a new constant variable with the current value
     * @returns a new variable with the sealed value
     */
    sealed(): Variable<T>;
    /**
     * Creates a new variable that will stream the variable value until the condition is met
     * @param condition the condition
     * @returns a new variable that will be sealed when the condition is met
     */
    sealWhen<R extends T>(condition: Func<R, boolean> | R): Variable<R>;
    /**
     * Creates a new variable that will stream the variable value until the condition is met
     * @param condition the condition value to seal
     * @param equalityComparer the equality comparer
     * @returns a new variable that will be sealed when the condition is met
     */
    sealWhen<R extends T>(condition: R, equalityComparer?: EqualityComparer<R>): Variable<R>;
    /**
     * Creates a new variable that will stream the variable value and notify when the variable value is changed or the
     * event is triggered
     * @param event the event observer
     */
    notifyOn(event: EventObserver): Variable<T>;
}

/**
 * A Variable class that is base for common compound variables. It provides a functionality to react on subscription
 * activation and deactivation. Most variables are extending this class
 * @typeparam T - the type of the variable value
 */
declare abstract class CompoundVariable<T> extends Variable<T> {
    protected constructor(initValue: T, equalityComparer?: EqualityComparer<T>);
    /**
     * Checks if there are any subscriptions
     * @returns true if there are any subscriptions, false otherwise
     */
    protected get active(): boolean;
    get value(): T;
    /**
     * Sets the value of the variable. If the value is the same as the current value, the method will do nothing
     * @param value the new value of the variable
     * @protected internal use only
     */
    protected set value(value: T);
    subscribe(callback: Func<T, void>): Disposiq;
    subscribeSilent(callback: Func<T, void>): Disposiq;
    /**
     * A method for activating functionality for the variable. It is called when at least one subscription is added
     * @protected internal use only
     */
    protected abstract activate(): void;
    /**
     * A method for deactivating functionality for the variable. It is called when the last subscription is removed
     * @protected internal use only
     */
    protected abstract deactivate(): void;
    /**
     * A method for getting the exact value of the variable. It is called when there are no subscriptions
     * @protected internal use only
     * @returns the default behavior is to return the current (last) value of the variable
     * @remarks this method should be implemented in the derived class
     */
    protected getExactValue(): T;
    /**
     * A method for setting the value of the variable without notifying subscribers
     * @protected internal use only
     * @param value the new value of the variable
     * @deprecated user `setSilent` instead
     */
    protected setValueSilent(value: T): void;
    /**
     * A method for setting the value of the variable and notifying subscribers without checking the equality
     * @protected internal use only
     * @param value the new value of the variable
     * @deprecated user `setForce` instead
     */
    protected setValueForce(value: T): void;
    /**
     * A method for setting the value of the variable without notifying subscribers
     * @protected internal use only
     * @param value the new value of the variable
     */
    protected setSilent(value: T): void;
    /**
     * A method for setting the value of the variable and notifying subscribers without checking the equality
     * @protected internal use only
     * @param value the new value of the variable
     */
    protected setForce(value: T): void;
    /**
     * A method for notifying subscribers about the value change
     * @protected internal use only
     */
    protected notify(): void;
}

/**
 * A variable that will return true if all the variable values are true
 */
declare class AndVariable extends CompoundVariable<boolean> {
    constructor(variables: Variable<boolean>[]);
    protected activate(): void;
    protected deactivate(): void;
    protected getExactValue(): boolean;
}

/**
 * A variable that combines multiple variables into a single variable. The value presents an array of the values of the
 * variables. The variable will notify the subscribers on any of the variables change
 */
declare class CombinedVariable<T extends unknown[]> extends CompoundVariable<T> {
    constructor(vars: {
        [K in keyof T]: Variable<T[K]>;
    });
    protected activate(): void;
    protected deactivate(): void;
    protected getExactValue(): T;
}

/**
 * A variable that always has the same value
 * @typeparam T - the type of the variable value
 */
declare class ConstantVariable<T> extends Variable<T> {
    constructor(value: T, equalityComparer?: EqualityComparer<T>);
    get value(): T;
    get equalityComparer(): EqualityComparer<T>;
    subscribe(callback: Func<T, void>): Disposiq;
    subscribeSilent(_: Func<T, void>): Disposiq;
}

/**
 * A variable that delegates its value to another variable
 * @typeparam T - the type of the variable value
 */
declare class DelegateVariable<T> extends CompoundVariable<T> {
    constructor(sourceOrDefaultValue?: Variable<T> | T | null);
    /**
     * Sets the source variable. The source variable will be used to get the value for the delegate variable
     * @param source the source variable or null to remove the source
     * @returns a disposable that will remove the source when disposed
     */
    setSource(source: Variable<T> | null): IDisposable;
    protected activate(): void;
    protected deactivate(): void;
    protected getExactValue(): T;
}

/**
 * A variable that can be changed by setting the value property. The 'direct' means that the change will not be checked
 * by the equality comparer
 */
declare class DirectVariable<T> extends Variable<T> {
    constructor(initialValue: T, equalityComparer?: EqualityComparer<T>);
    get value(): T;
    /**
     * Sets the value of the variable and notifies all subscribers without checking the equality
     * @param value the new value for the variable
     */
    set value(value: T);
    get equalityComparer(): EqualityComparer<T>;
    subscribe(callback: Func<T, void>): Disposiq;
    subscribeSilent(callback: Func<T, void>): Disposiq;
    /**
     * Sets the value of the variable without notifying the subscribers
     * @param value the new value for the variable
     * @remarks Use this method only if you are sure what you are doing. Combine this method with the `notify` method
     */
    setSilent(value: T): void;
    /**
     * Notifies all subscribers about the change of the value forcibly
     * @remarks Use this method only if you are sure what you are doing. Combine this method with the `setSilent` method
     */
    notify(): void;
}

type VariableOrValue<T> = T | Variable<T>;
type VarOrVal<T> = VariableOrValue<T>;
interface IMutableVariable<T> extends Variable<T> {
    get value(): T;
    set value(value: T);
    setSilent(value: T): void;
    notify(): void;
}

/**
 * A variable that reacts on subscription activation and deactivation using provided function called `activator`.
 * If there is no subscription, the variable will return the exact value provided by the `exactValue` function
 */
declare class FuncVariable<T> extends CompoundVariable<T> implements IMutableVariable<T> {
    constructor(activate: Func<FuncVariable<T>, DisposableLike>, exactValue: Func0<T>, equalityComparer?: EqualityComparer<T>);
    get value(): T;
    /**
     * Sets the value of the variable. If the value is the same as the current value, the method will do nothing
     * @param value the new value of the variable
     */
    set value(value: T);
    setValueForce(value: T): void;
    setValueSilent(value: T): void;
    /**
     * A method for setting the value of the variable and notifying subscribers without checking the equality
     * @param value the new value of the variable
     */
    setForce(value: T): void;
    /**
     * A method for setting the value of the variable without notifying subscribers
     * @param value the new value of the variable
     */
    setSilent(value: T): void;
    /**
     * A method for notifying subscribers about the value change
     */
    notify(): void;
    protected activate(): void;
    protected deactivate(): void;
    protected getExactValue(): T;
}

/**
 * A variable that inverts the value of another variable
 */
declare class InvertVariable extends Variable<boolean> {
    constructor(variable: Variable<boolean>);
    get value(): boolean;
    subscribe(callback: Func<boolean, void>): Disposiq;
    subscribeSilent(callback: Func<boolean, void>): Disposiq;
}

/**
 * A variable that maps the value of another variable to a new value
 * @typeparam TInput - the type of the input variable value
 * @typeparam TOutput - the type of the output variable value
 */
declare class MapVariable<TInput, TOutput> extends CompoundVariable<TOutput> {
    constructor(variable: Variable<TInput>, mapper: Func<TInput, TOutput>, equalityComparer?: EqualityComparer<TOutput>);
    protected activate(): void;
    protected deactivate(): void;
    protected getExactValue(): TOutput;
}

/**
 * A variable that represents the maximum value of multiple provided variables
 */
declare class MaxVariable extends CompoundVariable<number> {
    constructor(vars: Variable<number>[]);
    protected activate(): void;
    protected deactivate(): void;
    protected getExactValue(): number;
    protected postValue(): void;
}

/**
 * A variable that represents the minimum value of multiple provided variables
 */
declare class MinVariable extends CompoundVariable<number> {
    constructor(vars: Variable<number>[]);
    protected activate(): void;
    protected deactivate(): void;
    protected getExactValue(): number;
    protected postValue(): void;
}

/**
 * A class that implements the Variable class and provides the ability to change the value of the variable.
 * The value will be changed only if the new value is different from the old value (checked by the equality comparer)
 * @typeparam T - the type of the variable value
 */
declare class MutableVariable<T> extends Variable<T> implements IMutableVariable<T> {
    constructor(value: T, equalityComparer?: EqualityComparer<T>);
    get value(): T;
    /**
     * Sets the value of the variable. The value will be changed only if the new value is different from the old value
     * @param value the new value for the variable
     */
    set value(value: T);
    /**
     * Returns the equality comparer used to compare the old and new values of the variable
     */
    get equalityComparer(): EqualityComparer<T>;
    subscribe(callback: Func<T, void>): Disposiq;
    subscribeSilent(callback: Func<T, void>): Disposiq;
    /**
     * Sets the value of the variable without notifying the subscribers
     * @param value the new value for the variable
     * @remarks Use this method only if you are sure what you are doing. Combine this method with the `notify` method
     */
    setSilent(value: T): void;
    /**
     * Notifies all subscribers about the change of the value forcibly
     * @remarks Use this method only if you are sure what you are doing. Combine this method with the `setSilent` method
     */
    notify(): void;
}

/**
 * A variable that will return true if any of the variable values are true
 */
declare class OrVariable extends CompoundVariable<boolean> {
    constructor(variables: Variable<boolean>[]);
    protected activate(): void;
    protected deactivate(): void;
    protected getExactValue(): boolean;
}

/**
 * A variable that seals the value of another variable. When sealed, the variable will not change its value
 * @typeparam T - the type of the variable value
 */
declare class SealVariable<T> extends Variable<T> {
    constructor(vary: Variable<T>, equalityComparer?: EqualityComparer<T>);
    get value(): T;
    get equalityComparer(): EqualityComparer<T>;
    subscribe(callback: Func<T, void>): Disposiq;
    subscribeSilent(callback: Func<T, void>): Disposiq;
    /**
     * Seals the variable. If the variable is already sealed, the method will do nothing
     * @param valueToSeal the value to seal. If the value is not provided, the current value of the variable will be
     * sealed
     * @returns true if the variable was sealed, false if the variable was already sealed
     */
    seal(valueToSeal?: T): boolean;
}

/**
 * A variable that represents the sum of multiple provided variables. If the type of the variables is boolean, the
 * sum will be the number of true values. If the type of the variables is number, the sum will be the sum of the values
 * @typeparam T - the type of the variables
 */
declare class SumVariable<T extends number | boolean> extends CompoundVariable<number> {
    constructor(vars: Variable<T>[]);
    protected activate(): void;
    protected deactivate(): void;
    protected getExactValue(): number;
    protected postValue(): void;
}

type SwitchMapMapper<TInput, TResult> = (input: TInput) => Variable<TResult>;
/**
 * A variable that switches the value of another variable to a new value based on mapper that returns another variable
 * @typeparam TInput - the type of the input variable value
 * @typeparam TResult - the type of the output variable value
 */
declare class SwitchMapVariable<TInput, TResult> extends CompoundVariable<TResult> {
    constructor(vary: Variable<TInput>, mapper: SwitchMapMapper<TInput, TResult>, equalityComparer?: EqualityComparer<TResult>);
    protected activate(): void;
    protected deactivate(): void;
    protected getExactValue(): TResult;
}

/**
 * A variable that will throttle the updates of the given variable. The throttler is an event observer that will
 * be subscribed where the updates will be scheduled. When the event is dispatched, the throttler will update the
 * value of the variable
 * @typeparam T - the type of the variable value
 */
declare class ThrottledVariable<T> extends CompoundVariable<T> {
    constructor(vary: Variable<T>, onUpdate: EventObserver, equalityComparer?: EqualityComparer<T>);
    protected activate(): void;
    protected deactivate(): void;
    protected getExactValue(): T;
}

/**
 * Creates a new mutable variable
 * @param initialValue the initial value of the variable
 * @param equalityComparer the equality comparer to use when checking for changes
 * @returns a new mutable variable
 */
declare function createVar<T>(initialValue: T, equalityComparer?: EqualityComparer<T>): MutableVariable<T>;
/**
 * Creates a new variable based on FuncVariable parameters
 * @param activator a function that will be called to activate the variable when it is subscribed
 * @param exactValue a function that returns the exact value of the variable when there is no subscriptions
 * @param equalityComparer the equality comparer to use when checking for changes
 * @returns a new variable
 */
declare function createFuncVar<T>(activator: Func<FuncVariable<T>, IDisposable>, exactValue: Func0<T>, equalityComparer?: EqualityComparer<T>): Variable<T>;
/**
 * Creates a new constant variable that will always have the same value
 * @param value the value of the variable
 * @returns a new constant variable
 */
declare function createConst<T>(value: T): Variable<T>;
/**
 * Creates a new delegate variable that can be changed by setting a source variable
 * @param sourceOrDefaultValue the source variable or the default value of the variable
 * @returns a new delegate variable
 */
declare function createDelegate<T>(sourceOrDefaultValue?: Variable<T> | T | null): DelegateVariable<T>;
/**
 * Creates a new direct variable that can be changed by setting the value property. The 'direct' means that the change
 * will not be checked by the equality comparer
 * @param initialValue the initial value of the variable
 * @returns a new direct variable
 */
declare function createDirect<T>(initialValue: T): DirectVariable<T>;
/**
 * Creates a new variable that will return true if any of the variables are true
 * @param variables the variables to check
 * @returns a new OR variable
 */
declare function or(...variables: Variable<boolean>[]): Variable<boolean>;
/**
 * Creates a new variable that will return true if all the variables are true
 * @param variables the variables to check
 * @returns a new AND variable
 */
declare function and(...variables: Variable<boolean>[]): Variable<boolean>;
/**
 * Creates a new variable that will return the sum of the variables
 * @param variables the variables to sum
 * @returns a new SUM variable
 */
declare function sum<T extends number | boolean>(...variables: Variable<T>[]): Variable<number>;
/**
 * Creates a new variable that will return the minimum value of the variables
 * @param variables the variables to compare
 * @returns a new MIN variable
 */
declare function min(...variables: Variable<number>[]): Variable<number>;
/**
 * Creates a new variable that will return the maximum value of the variables
 * @param variables the variables to compare
 * @returns a new MAX variable
 */
declare function max(...variables: Variable<number>[]): Variable<number>;
/**
 * Creates a new variable that combines multiple variables into a single variable
 * @param vars the variables to combine
 * @returns a new combined variable that contains an array of the values of the variables
 */
declare function combine<O extends any[]>(...vars: {
    [K in keyof O]: Variable<O[K]>;
}): Variable<O>;
/**
 * Creates a new event dispatcher that will dispatch an event after a specified delay
 * @param delay the delay in milliseconds
 * @returns a new event dispatcher
 */
declare function createDelayDispatcher(delay: number): EventObserver;
/**
 * Converts a value to a variable. If the value is already a variable, it will be returned as is
 * @param value the value or variable to convert
 * @returns if the value is a variable, it will be returned as is, otherwise a new constant variable will be created
 */
declare function toVariable<T>(value: VarOrVal<T>): Variable<T>;

/**
 * Check if the value is a variable
 * @param value The value to check
 * @returns true if the value is a variable, false otherwise
 */
declare function isVariable(value: unknown): value is Variable<unknown>;
/**
 * Check if the value is a variable of the specified type
 * @param value The value to check
 * @param typeCheckerOrExampleValue The type checker or the example value of the variable
 * @returns true if the value is a variable of the specified type, false otherwise
 * @remarks If the `typeCheckerOrExampleValue` is not provided, the function will return true if the value is a variable
 * @remarks If the `typeCheckerOrExampleValue` is an example value, the function will only check if the value type
 * matches the type of the example value. This means that if both the value and the example value are objects, the
 * function will return true without checking their properties or inheritance.
 */
declare function isVariableOf<T>(value: unknown, typeCheckerOrExampleValue?: ((t: unknown) => t is T) | T): value is Variable<T>;
/**
 * Check if the value is a mutable variable
 * @param value The value to check
 * @returns true if the value is a mutable variable, false otherwise
 */
declare function isMutableVariable<T>(value: unknown): value is MutableVariable<T>;
/**
 * Check if the value is a delegate variable
 * @param value The value to check
 * @returns true if the value is a delegate variable, false otherwise
 */
declare function isDelegateVariable<T>(value: unknown): value is DelegateVariable<T>;

type Action<T> = (value: T) => void;
/**
 * A linked chain is a collection of elements that can be iterated over. It is similar to a linked list, but it is
 * optimized for adding and removing elements. The implementation safely handles the addition and removal of elements during
 * iteration. The implementation is based on the Disposable pattern.
 */
declare class LinkedChain<T> {
    constructor(equalityComparer?: EqualityComparer<T>);
    /**
     * Checks if the chain has any elements
     */
    get hasAny(): boolean;
    /**
     * Checks if the chain is empty
     */
    get empty(): boolean;
    /**
     * Gets the number of elements in the chain
     * @remarks This getter should be used only for debugging purposes
     */
    get count(): number;
    /**
     * Converts the chain to an array
     * @returns an array containing the elements of the chain
     * @remarks This method should be used only for debugging purposes
     */
    toArray(): T[];
    /**
     * Adds an element to the chain. If the element is already in the chain, it will not be added again.
     * @param value the element to add
     * @returns an array containing the subscription and a boolean value indicating if the element was added
     */
    addUnique(value: T): [subscription: Disposiq, added: boolean];
    /**
     * Adds an element to the end of the chain
     * @param value the element to add
     * @returns a subscription that can be used to remove the element from the chain
     */
    add(value: T): Disposiq;
    /**
     * Adds an element to the beginning of the chain. If the element is already in the chain, it will not be added again.
     * @param value the element to add
     * @returns an array containing the subscription and a boolean value indicating if the element was added
     */
    addToBeginUnique(value: T): [subscription: Disposiq, added: boolean];
    /**
     * Adds an element to the beginning of the chain
     * @param value the element to add
     * @returns a subscription that can be used to remove the element from the chain
     */
    addToBegin(value: T): Disposiq;
    /**
     * Adds a node and its children to the end of the chain
     * @param node
     * @remarks This method does not check if the node is already in a chain
     */
    addToBeginNode(node: ChainNode<T>): void;
    /**
     * Removes an element from the chain
     * @param value the element to remove
     * @returns true if the element was removed, false otherwise
     */
    remove(value: T): boolean;
    /**
     * Removes all elements from the chain
     */
    clear(): void;
    /**
     * Removes all elements from the chain and returns the head node
     * @returns the head node of the chain or null if the chain is empty
     */
    removeAll(): ChainNode<T> | null;
    /**
     * Iterates over the elements of the chain and invokes the specified action for each element
     * @param valueHandler the action to invoke for each element
     */
    forEach(valueHandler: Action<T>): void;
}
declare class ChainNode<T> {
    readonly value: T;
    next: ChainNode<T> | null;
    previous: ChainNode<T> | null;
    disposed: boolean;
    constructor(value: T, previous?: ChainNode<T> | null, next?: ChainNode<T> | null);
}

type ObservableListChangeEvent<T> = ObservableListRemoveEvent<T> | ObservableListAddEvent<T> | ObservableListReplaceEvent<T> | ObservableListMoveEvent<T>;
interface ObservableListChangeBaseEvent<T> {
    type: "remove" | "add" | "replace" | "move";
}
interface ObservableListRemoveEvent<T> extends ObservableListChangeBaseEvent<T> {
    type: "remove";
    items: T[];
    startIndex: number;
}
interface ObservableListAddEvent<T> extends ObservableListChangeBaseEvent<T> {
    type: "add";
    items: T[];
    startIndex: number;
}
interface ObservableListReplaceEvent<T> extends ObservableListChangeBaseEvent<T> {
    type: "replace";
    oldItems: T[];
    newItems: T[];
    startIndex: number;
}
interface ObservableListMoveEvent<T> extends ObservableListChangeBaseEvent<T> {
    type: "move";
    items: {
        item: T;
        from: number;
        to: number;
    }[];
}
/**
 * Represents a list that can be observed for changes. The list is mutable and can be changed by adding, removing, or
 * replacing items. The list can be observed for changes using the `onRemove`, `onAdd`, `onReplace`, `onMove`, and
 * `onAnyChange` events. The implementation is still in alpha and may change in the future.
 * @alpha
 */
declare class ObservableList<T> {
    constructor(items?: T[]);
    /**
     * An event that is triggered when an item is removed from the list
     */
    get onRemove(): EventObserver<ObservableListRemoveEvent<T>>;
    /**
     * An event that is triggered when an item is added to the list
     */
    get onAdd(): EventObserver<ObservableListAddEvent<T>>;
    /**
     * An event that is triggered when an item is replaced in the list
     */
    get onReplace(): EventObserver<ObservableListReplaceEvent<T>>;
    /**
     * An event that is triggered when an item is moved in the list
     */
    get onMove(): EventObserver<ObservableListMoveEvent<T>>;
    /**
     * An event that is triggered when any change is made to the list
     */
    get onAnyChange(): EventObserver<ObservableListChangeEvent<T>>;
    /**
     * The number of items in the list
     */
    get length(): number;
    /**
     * Gets the item at the specified index
     * @param index the index of the item
     * @returns the item at the specified index
     */
    get(index: number): T;
    /**
     * Sets the item at the specified index
     * @param index the index of the item
     * @param value the new value of the item
     */
    set(index: number, value: T): void;
    /**
     * Adds vararg items to the list
     * @param items
     */
    push(...items: T[]): void;
    /**
     * Adds items to the list
     * @param items
     */
    pushAll(items: T[]): void;
    /**
     * Copies the items to the specified array
     * @param array the array to copy the items to
     */
    copyTo(array: T[]): void;
    /**
     * Gets a range of items from the list
     * @param index the index of the first item
     * @param count the number of items to get
     */
    getRange(index: number, count: number): T[];
    /**
     * Insert items at the specified index
     * @param index the index to insert the items at
     * @param items the items to insert
     */
    insertRange(index: number, items: T[]): void;
    /**
     * Removes the specified item from the list
     * @param item the item to remove
     * @returns true if the item was removed, false otherwise
     */
    remove(item: T): boolean;
    /**
     * Removes a range of items from the list
     * @param index the index of the first item to remove
     * @param count the number of items to remove
     */
    removeRange(index: number, count: number): void;
    /**
     * Creates a new array with the items of the list
     */
    toArray(): T[];
    private get _hasAnySubscription();
    /**
     * Replaces the items in the list with the specified items
     * @param replacement the items to replace the current items with
     */
    replace(replacement: T[]): void;
    /**
     * Gets the index of the specified item
     * @param item the item to get the index of
     */
    indexOf(item: T): number;
    /**
     * Gets the last index of the specified item
     * @param item the item to get the last index of
     */
    lastIndexOf(item: T): number;
    /**
     * Checks if the list contains the specified item
     * @param item the item to check
     */
    contains(item: T): boolean;
    /**
     * Inserts the specified item at the specified index
     * @param index the index to insert the item at
     * @param item the item to insert
     */
    insert(index: number, item: T): void;
    /**
     * Removes the item at the specified index
     * @param index the index of the item to remove
     */
    removeAt(index: number): void;
    /**
     * Gets a readonly array of the current items in the list
     */
    get asReadonly(): ReadonlyArray<T>;
    /**
     * Sorts the list
     * @param compareFn the compare function to use for sorting the list
     */
    sort(compareFn?: (a: T, b: T) => number): void;
    /**
     * Clears the list
     */
    clear(): void;
    private updateSorted;
}

export { AndVariable, CombinedVariable, CompoundVariable, ConstantVariable as ConstVar, ConstantVariable as ConstVariable, ConstantVariable, DelegateVariable, DirectVariable, type EqualityComparer, EventDispatcher, EventObserver, EventObserverStub, EventSafeDispatcher, FuncVariable as FuncVar, FuncVariable, type IMutableVariable as IMutableVar, type IMutableVariable, type IMutableVariable as IVary, ConstantVariable as ImmutableVar, InvertVariable, LazyEventDispatcher, FuncVariable as LazyVariable, LinkedChain, MapVariable, MaxVariable, MinVariable, MutableVariable as MutableVar, MutableVariable, ObservableList, type ObservableListAddEvent, type ObservableListChangeBaseEvent, type ObservableListChangeEvent, type ObservableListMoveEvent, type ObservableListRemoveEvent, type ObservableListReplaceEvent, OrVariable, ConstantVariable as ReadonlyVar, SealVariable, SumVariable, type SwitchMapMapper, SwitchMapVariable, ThrottledVariable, Variable as Var, type VarOrVal, Variable, type VariableOrValue, MutableVariable as Vary, and, arrayEqualityComparer, combine, createConst, createConst as createConstVar, createDelayDispatcher, createDelegate, createDelegate as createDelegateVar, createDirect, createDirect as createDirectVar, createFuncVar, createFuncVar as createLazyVar, createVar, defaultEqualityComparer, functionEqualityComparer, generalEqualityComparer, isDelegateVariable, isMutableVariable, isVariable, isVariableOf, max, merge, min, objectEqualityComparer, or, setDefaultEqualityComparer, simpleEqualityComparer, strictEqualityComparer, sum, toVariable };
