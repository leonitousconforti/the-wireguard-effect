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
  - [UserspaceLayer](#userspacelayer)
  - [WgQuickLayer](#wgquicklayer)
  - [makeUserspaceLayer](#makeuserspacelayer)
  - [makeWgQuickLayer](#makewgquicklayer)
- [Models](#models)
  - [WireguardControlImpl (interface)](#wireguardcontrolimpl-interface)
- [Tags](#tags)
  - [WireguardControl](#wireguardcontrol)
  - [WireguardControl (interface)](#wireguardcontrol-interface)

---

# Constructors

## UserspaceLayer

**Signature**

```ts
export declare const UserspaceLayer: Layer.Layer<WireguardControl, never, never>
```

Added in v1.0.0

## WgQuickLayer

**Signature**

```ts
export declare const WgQuickLayer: Layer.Layer<WireguardControl, never, never>
```

Added in v1.0.0

## makeUserspaceLayer

**Signature**

```ts
export declare const makeUserspaceLayer: () => WireguardControlImpl
```

Added in v1.0.0

## makeWgQuickLayer

**Signature**

```ts
export declare const makeWgQuickLayer: (_options: { sudo: boolean | "ask" }) => WireguardControlImpl
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
  ) => Effect.Effect<void, never, never>

  readonly upScoped: (
    wireguardConfig: WireguardConfig.WireguardConfig,
    wireguardInterface: WireguardInterface.WireguardInterface
  ) => Effect.Effect<void, never, Scope.Scope>

  readonly down: (
    wireguardConfig: WireguardConfig.WireguardConfig,
    wireguardInterface: WireguardInterface.WireguardInterface
  ) => Effect.Effect<void, never, never>

  readonly getConfig: (
    wireguardConfig: WireguardConfig.WireguardConfig,
    wireguardInterface: WireguardInterface.WireguardInterface
  ) => Effect.Effect<void, never, never>

  readonly setConfig: (
    wireguardConfig: WireguardConfig.WireguardConfig,
    wireguardInterface: WireguardInterface.WireguardInterface
  ) => Effect.Effect<void, never, never>
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
