# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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