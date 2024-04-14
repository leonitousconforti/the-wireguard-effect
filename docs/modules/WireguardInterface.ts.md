---
title: WireguardInterface.ts
nav_order: 6
parent: Modules
---

## WireguardInterface overview

Wireguard interface helpers

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

Starts a wireguard tunnel that will be gracefully shutdown and stop
serving traffic once the scope is closed. If no how options is specified,
then the interface will be brought up using the
bundled-wireguard-go+userspace-api method.

**Signature**

```ts
upScoped: { (config: WireguardConfig.WireguardConfig, options: {    how?: "bundled-wireguard-go+userspace-api" | "system-wireguard-go+userspace-api" | undefined;    sudo?: boolean | "ask" | undefined;}): Effect.Effect<void, WireguardErrors.WireguardError | ParseResult.ParseError | PlatformError.PlatformError | Cause.UnknownException, FileSystem.FileSystem | Path.Path | Scope.Scope>; (config: WireguardConfig.WireguardConfig, options: {    how: "system-wireguard+system-wg-quick" | "system-wireguard+bundled-wg-quick" | "system-wireguard-go+system-wg-quick" | "bundled-wireguard-go+system-wg-quick" | "system-wireguard-go+bundled-wg-quick" | "bundled-wireguard-go+bundled-wg-quick";    sudo?: boolean | "ask" | undefined;}): Effect.Effect<string, WireguardErrors.WireguardError | ParseResult.ParseError | PlatformError.PlatformError | Cause.UnknownException, FileSystem.FileSystem | Path.Path | Scope.Scope>; }
```

Added in v1.0.0

### up (property)

Starts a wireguard tunnel that will continue to run and serve traffic
even after the nodejs process exits. If no how options is specified, then
the interface will be brought up using the
bundled-wireguard-go+userspace-api method.

**Signature**

```ts
up: { (config: WireguardConfig.WireguardConfig, options: {    how?: "bundled-wireguard-go+userspace-api" | "system-wireguard-go+userspace-api" | undefined;    sudo?: boolean | "ask" | undefined;}): Effect.Effect<void, WireguardErrors.WireguardError | ParseResult.ParseError | PlatformError.PlatformError | Cause.UnknownException, FileSystem.FileSystem | Path.Path>; (config: WireguardConfig.WireguardConfig, options: {    how: "system-wireguard+system-wg-quick" | "system-wireguard+bundled-wg-quick" | "system-wireguard-go+system-wg-quick" | "bundled-wireguard-go+system-wg-quick" | "system-wireguard-go+bundled-wg-quick" | "bundled-wireguard-go+bundled-wg-quick";    sudo?: boolean | "ask" | undefined;}): Effect.Effect<string, WireguardErrors.WireguardError | ParseResult.ParseError | PlatformError.PlatformError | Cause.UnknownException, FileSystem.FileSystem | Path.Path>; }
```

Added in v1.0.0

### down (property)

Stops a previously started wireguard tunnel.

**Signature**

```ts
down: { (options: {    sudo?: boolean | "ask" | undefined;    how: "userspace-api";}): Effect.Effect<void, Cause.UnknownException, FileSystem.FileSystem>; (options: {    sudo?: boolean | "ask" | undefined;    how: "bundled-wg-quick" | "system-wg-quick";    file: string;}): Effect.Effect<void, Cause.UnknownException, FileSystem.FileSystem>; }
```

Added in v1.0.0
