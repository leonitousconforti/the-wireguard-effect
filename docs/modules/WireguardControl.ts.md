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
  - [makeSystemWgQuickLayer](#makesystemwgquicklayer)
  - [makeUserspaceLayer](#makeuserspacelayer)
- [Layers](#layers)
  - [BundledWgQuickLayer](#bundledwgquicklayer)
  - [SystemWgQuickLayer](#systemwgquicklayer)
  - [UserspaceLayer](#userspacelayer)
- [Models](#models)
  - [WireguardControlImpl (interface)](#wireguardcontrolimpl-interface)
- [Tags](#tags)
  - [WireguardControl](#wireguardcontrol)
  - [WireguardControl (interface)](#wireguardcontrol-interface)

---

# Constructors

## makeBundledWgQuickLayer

**Signature**

```ts
export declare const makeBundledWgQuickLayer: (options: { sudo: boolean }) => WireguardControlImpl
```

Added in v1.0.0

## makeSystemWgQuickLayer

**Signature**

```ts
export declare const makeSystemWgQuickLayer: (options: { sudo: boolean }) => WireguardControlImpl
```

Added in v1.0.0

## makeUserspaceLayer

**Signature**

```ts
export declare const makeUserspaceLayer: () => WireguardControlImpl
```

Added in v1.0.0

# Layers

## BundledWgQuickLayer

**Signature**

```ts
export declare const BundledWgQuickLayer: Layer.Layer<WireguardControl, never, never>
```

Added in v1.0.0

## SystemWgQuickLayer

**Signature**

```ts
export declare const SystemWgQuickLayer: Layer.Layer<WireguardControl, never, never>
```

Added in v1.0.0

## UserspaceLayer

**Signature**

```ts
export declare const UserspaceLayer: Layer.Layer<WireguardControl, never, never>
```

Added in v1.0.0

# Models

## WireguardControlImpl (interface)

**Signature**

```ts
export interface WireguardControlImpl {
  readonly up: (
    wireguardConfig: WireguardConfig.WireguardConfig,
    wireguardInterface: WireguardInterface.WireguardInterface
  ) => Effect.Effect<
    WireguardInterface.WireguardInterface,
    Socket.SocketError | ParseResult.ParseError | PlatformError.PlatformError | Cause.UnknownException,
    FileSystem.FileSystem | Path.Path
  >

  readonly down: (
    wireguardConfig: WireguardConfig.WireguardConfig,
    wireguardInterface: WireguardInterface.WireguardInterface
  ) => Effect.Effect<
    WireguardInterface.WireguardInterface,
    PlatformError.PlatformError | ParseResult.ParseError | Cause.UnknownException,
    FileSystem.FileSystem | Path.Path
  >

  readonly upScoped: (
    wireguardConfig: WireguardConfig.WireguardConfig,
    wireguardInterface: WireguardInterface.WireguardInterface
  ) => Effect.Effect<
    WireguardInterface.WireguardInterface,
    Socket.SocketError | ParseResult.ParseError | PlatformError.PlatformError | Cause.UnknownException,
    FileSystem.FileSystem | Path.Path | Scope.Scope
  >

  readonly getConfigRequestResolver: Resolver.RequestResolver<WireguardConfig.WireguardGetConfigRequest, never>
  readonly setConfigRequestResolver: Resolver.RequestResolver<WireguardConfig.WireguardSetConfigRequest, never>
}
```

Added in v1.0.0

# Tags

## WireguardControl

**Signature**

```ts
export declare const WireguardControl: Context.Tag<WireguardControl, WireguardControlImpl>
```

Added in v1.0.0

## WireguardControl (interface)

**Signature**

```ts
export interface WireguardControl {
  readonly _: unique symbol
}
```

Added in v1.0.0
