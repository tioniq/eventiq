export type Action<T = void> = (value: T) => void;

export type Func0<R> = () => R

export type Func<T, R> = (arg: T) => R

export type Action0 = () => void