---
title: WireguardControl.ts
nav_order: 4
parent: Modules
---

## WireguardControl overview

Wireguard control mechanisms.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

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
export declare const makeBundledWgQuickLayer: (options: { sudo: boolean }) => WireguardControl
```

Added in v1.0.0

## makeUserspaceLayer

**Signature**

```ts
export declare const makeUserspaceLayer: () => WireguardControl
```

Added in v1.0.0

# Layers

## BundledWgQuickLayer

**Signature**

```ts
export declare const BundledWgQuickLayer: Layer.Layer<WireguardControl, never, never>
```

Added in v1.0.0

## UserspaceLayer

**Signature**

```ts
export declare const UserspaceLayer: Layer.Layer<WireguardControl, never, never>
```

Added in v1.0.0

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

Added in v1.0.0

# Tags

## WireguardControl

**Signature**

```ts
export declare const WireguardControl: Context.Tag<WireguardControl, WireguardControl>
```

Added in v1.0.0

# Type ids

## TypeId

**Signature**

```ts
export declare const TypeId: typeof TypeId
```

Added in v1.0.0

## TypeId (type alias)

**Signature**

```ts
export type TypeId = typeof TypeId
```

Added in v1.0.0
