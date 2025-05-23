# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.1] - 2025-05-19

### Changed

- Improved performance of `LinkedChain` classes (again)
- Fixed `LinkedActionChain`'s `forEach` method when passing a `null` value

## [1.3.0] - 2025-05-04

### Changed

- Refactored internal class `LinkedChain` to improve performance, reduce memory allocation and reduce stack calls

## [1.2.8] - 2025-04-25

### Added

- New extension method `subscribeDisposable` for `EventObserver` class

## [1.2.7] - 2025-04-18

### Added

- New `flat` and `join` methods for `Variable` class

## [1.2.6] - 2025-04-11

### Added

- New `subscribeWhere` method for `Variable` class

## [1.2.5] - 2025-04-05

### Changed

- Allow `subscribeDisposable` action return nullable values

## [1.2.4] - 2025-02-08

### Added

- Added equalityComparer support to FuncVariable and createFuncVar

## [1.2.3] - 2025-02-08

### Added

- New `IMutableVariable` class and it's aliases 'IMutableVar' and `IVary`. `MutableVariable` and `FuncVariable` now
  implement this interface

### Changed

- Deprecated `setValueForce` and `setValueSilent` in favor of `setForce` and `setSilent` methods in `CompoundVariable`
  class

## [1.2.2] - 2025-02-08

### Added

- New `toVariable` function that converts a value to a `Variable` object

## [1.2.1] - 2025-02-02

### Added

- New `notifyOn` extension method for `Variable` class

## [1.2.0] - 2025-01-31

### Added

- Map functions now accept a custom equality comparer
- New `setDefaultEqualityComparer` function

## [1.1.7] - 2025-01-10

### Added

- New `awaited` method for `EventObserver` class

## [1.1.6] - 2024-11-29

### Added

- New `EventSafeDispatcher` class

## [1.1.5] - 2024-11-15

### Added

- Equality comparer parameter for `createVar` function

## [1.1.4] - 2024-10-25

### Added

- New functions `isMutableVariable` and `isDelegateVariable`
- Allowing to return a `DisposableLike` object in activator for FuncVariable and LazyEventDispatcher instead of strict
  `IDisposable` object

## [1.1.3] - 2024-10-17

### Fix

- Added missing EventObserver export

## [1.1.2] - 2024-10-11

### Added

- New aliases for functions: createLazyVar, createConstVar, createDelegateVar, createDirectVar

## [1.1.1] - 2024-10-05

### Added

- `combine` function

## [1.1.0] - 2024-10-04

### Changed

- `Variable` class now is covariant

### Added

- Equality comparers for object, array and general types
- Possibility to change the default equality comparer

### Removed

- `equalityComparer` getter from `Variable` class

## [1.0.6] - 2024-09-29

### Changed

- Disabled minification for the package
- Removed source maps from the package

### Added

- Alpha version of `ObservableList` class

## [1.0.5] - 2024-09-23

### Changed

- All subscriptions are now returned a Disposiq object instead of DisposableCompat interface

## [1.0.4] - 2024-09-20

### Changed

- Class alias export fix

## [1.0.3] - 2024-09-20

### Changed

- Export extensions without module declaration

## [1.0.2] - 2024-09-19

### Added

- Extensions export fix

## [1.0.1] - 2024-09-19

### Changed

- Renamed 'createVar' to 'createFuncVar'

### Added

- Added a new 'createVar' function

## [1.0.0] - 2024-09-19

### Added

- Initial release