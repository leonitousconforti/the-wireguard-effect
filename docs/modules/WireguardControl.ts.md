---
title: WireguardControl.ts
nav_order: 4
parent: Modules
---

## WireguardControl.ts overview

Wireguard control mechanisms.

Since v1.0.0

---

## Exports Grouped by Category

- [Constructors](#constructors)
  - [makeBundledWgQuickLayer](#makebundledwgquicklayer)
  - [makeUserspaceLayer](#makeuserspacelayer)
- [Layers](#layers)
  - [BundledWgQuickLayer](#bundledwgquicklayer)
  - [UserspaceLayer](#userspacelayer)
- [Models](#models)
  - [WireguardControl (interface)](#wireguardcontrol-interface)
- [Tags](#tags)
  - [WireguardControl](#wireguardcontrol)
- [Type ids](#type-ids)
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)

---

# Constructors

## makeBundledWgQuickLayer

**Signature**

```ts
declare const makeBundledWgQuickLayer: (options: { sudo: boolean }) => WireguardControl
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardControl.ts#L82)

Since v1.0.0

## makeUserspaceLayer

**Signature**

```ts
declare const makeUserspaceLayer: () => WireguardControl
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardControl.ts#L89)

Since v1.0.0

# Layers

## BundledWgQuickLayer

**Signature**

```ts
declare const BundledWgQuickLayer: Layer.Layer<WireguardControl, never, never>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardControl.ts#L101)

Since v1.0.0

## UserspaceLayer

**Signature**

```ts
declare const UserspaceLayer: Layer.Layer<WireguardControl, never, never>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardControl.ts#L95)

Since v1.0.0

# Models

## WireguardControl (interface)

**Signature**

```ts
export interface WireguardControl {
  readonly [TypeId]: TypeId

  readonly up: (
    wireguardConfig: WireguardConfig.WireguardConfig,
    wireguardInterface: WireguardInterface.WireguardInterface
  ) => Effect.Effect<
    WireguardInterface.WireguardInterface,
    Socket.SocketError | ParseResult.ParseError | PlatformError.PlatformError | Cause.TimeoutException,
    FileSystem.FileSystem | Path.Path | CommandExecutor.CommandExecutor
  >

  readonly down: (
    wireguardConfig: WireguardConfig.WireguardConfig,
    wireguardInterface: WireguardInterface.WireguardInterface,
    wireguardGoProcess?: exec.ChildProcess
  ) => Effect.Effect<
    WireguardInterface.WireguardInterface,
    PlatformError.PlatformError | ParseResult.ParseError | Cause.TimeoutException,
    FileSystem.FileSystem | Path.Path | CommandExecutor.CommandExecutor
  >

  readonly upScoped: (
    wireguardConfig: WireguardConfig.WireguardConfig,
    wireguardInterface: WireguardInterface.WireguardInterface
  ) => Effect.Effect<
    WireguardInterface.WireguardInterface,
    Socket.SocketError | ParseResult.ParseError | PlatformError.PlatformError | Cause.TimeoutException,
    FileSystem.FileSystem | Path.Path | Scope.Scope | CommandExecutor.CommandExecutor
  >
}
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardControl.ts#L40)

Since v1.0.0

# Tags

## WireguardControl

**Signature**

```ts
declare const WireguardControl: Context.Tag<WireguardControl, WireguardControl>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardControl.ts#L76)

Since v1.0.0

# Type ids

## TypeId

**Signature**

```ts
declare const TypeId: unique symbol
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardControl.ts#L28)

Since v1.0.0

## TypeId (type alias)

**Signature**

```ts
type TypeId = typeof TypeId
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardControl.ts#L34)

Since v1.0.0
