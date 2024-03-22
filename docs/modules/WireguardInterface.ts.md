---
title: WireguardInterface.ts
nav_order: 5
parent: Modules
---

## WireguardInterface overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Datatypes](#datatypes)
  - [WireguardInterface (class)](#wireguardinterface-class)
    - [upScoped (property)](#upscoped-property)
    - [up (property)](#up-property)
    - [down (property)](#down-property)

---

# Datatypes

## WireguardInterface (class)

A wireguard interface name.

**Signature**

```ts
export declare class WireguardInterface
```

Added in v1.0.0

### upScoped (property)

Starts a wireguard tunnel that will be gracefully shutdown and stop serving
traffic once the scope is closed.

**Signature**

```ts
upScoped: (
  config: WireguardIniConfig.WireguardConfig,
  options?: { replacePeers?: boolean | undefined; replaceAllowedIPs?: boolean | undefined } | undefined
) =>
  Effect.Effect<
    WireguardInterface,
    WireguardErrors.WireguardError | ParseResult.ParseError | Platform.Error.PlatformError,
    Platform.FileSystem.FileSystem | Platform.Path.Path | Scope.Scope
  >
```

Added in v1.0.0

### up (property)

Starts a wireguard tunnel that will continue to run and serve traffic
even after the nodejs process exits.

**Signature**

```ts
up: (
  config: WireguardIniConfig.WireguardConfig,
  options?: { replacePeers?: boolean | undefined; replaceAllowedIPs?: boolean | undefined } | undefined
) =>
  Effect.Effect<
    WireguardInterface,
    WireguardErrors.WireguardError | ParseResult.ParseError | Platform.Error.PlatformError,
    Platform.FileSystem.FileSystem | Platform.Path.Path
  >
```

Added in v1.0.0

### down (property)

Stops a previously started wireguard tunnel.

**Signature**

```ts
down: () => Effect.Effect<void, Platform.Error.PlatformError, Platform.FileSystem.FileSystem>
```

Added in v1.0.0
