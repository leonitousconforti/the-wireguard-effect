---
title: WireguardConfig.ts
nav_order: 3
parent: Modules
---

## WireguardConfig overview

Wireguard config schema definitions

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Api interface](#api-interface)
  - [$WireguardIniConfig (interface)](#wireguardiniconfig-interface)
  - [$WireguardUapiConfig (interface)](#wireguarduapiconfig-interface)
- [Datatypes](#datatypes)
  - [WireguardConfig (class)](#wireguardconfig-class)
    - [writeToFile (property)](#writetofile-property)
    - [up (property)](#up-property)
    - [upScoped (property)](#upscoped-property)
- [Transformations](#transformations)
  - [WireguardIniConfig](#wireguardiniconfig)
  - [WireguardUapiConfig](#wireguarduapiconfig)

---

# Api interface

## $WireguardIniConfig (interface)

**Signature**

```ts
export interface $WireguardIniConfig
  extends Schema.Annotable<$WireguardIniConfig, string, Schema.Schema.Encoded<typeof WireguardConfig>, never> {}
```

Added in v1.0.0

## $WireguardUapiConfig (interface)

**Signature**

```ts
export interface $WireguardUapiConfig
  extends Schema.Annotable<
    $WireguardUapiConfig,
    readonly [string, InternetSchemas.CidrBlock],
    Schema.Schema.Encoded<typeof WireguardConfig>,
    never
  > {}
```

Added in v1.0.0

# Datatypes

## WireguardConfig (class)

A wireguard configuration.

**Signature**

```ts
export declare class WireguardConfig
```

Added in v1.0.0

### writeToFile (property)

Writes a wireguard interface configuration to an INI file.

**Signature**

```ts
writeToFile: (file: string) =>
  Effect.Effect<void, ParseResult.ParseError | PlatformError.PlatformError, FileSystem.FileSystem | Path.Path>
```

Added in v1.0.0

### up (property)

Starts a wireguard tunnel that will continue to run and serve traffic
even after the nodejs process exits.

**Signature**

```ts
up: { (options: {    how?: "bundled-wireguard-go+userspace-api" | "system-wireguard-go+userspace-api" | undefined;    sudo?: boolean | "ask" | undefined;}, interfaceObject?: WireguardInterface.WireguardInterface | undefined): Effect.Effect<void, WireguardErrors.WireguardError | ParseResult.ParseError | PlatformError.PlatformError | Cause.UnknownException, FileSystem.FileSystem | Path.Path>; (options: {    how: "system-wireguard+system-wg-quick" | "system-wireguard+bundled-wg-quick" | "system-wireguard-go+system-wg-quick" | "bundled-wireguard-go+system-wg-quick" | "system-wireguard-go+bundled-wg-quick" | "bundled-wireguard-go+bundled-wg-quick";    sudo?: boolean | "ask" | undefined;}, interfaceObject?: WireguardInterface.WireguardInterface | undefined): Effect.Effect<string, WireguardErrors.WireguardError | ParseResult.ParseError | PlatformError.PlatformError | Cause.UnknownException, FileSystem.FileSystem | Path.Path>; }
```

Added in v1.0.0

### upScoped (property)

Starts a wireguard tunnel that will be gracefully shutdown and stop
serving traffic once the scope is closed.

**Signature**

```ts
upScoped: { (options: {    how?: "bundled-wireguard-go+userspace-api" | "system-wireguard-go+userspace-api" | undefined;    sudo?: boolean | "ask" | undefined;}, interfaceObject?: WireguardInterface.WireguardInterface | undefined): Effect.Effect<void, WireguardErrors.WireguardError | ParseResult.ParseError | PlatformError.PlatformError | Cause.UnknownException, FileSystem.FileSystem | Path.Path | Scope.Scope>; (options: {    how: "system-wireguard+system-wg-quick" | "system-wireguard+bundled-wg-quick" | "system-wireguard-go+system-wg-quick" | "bundled-wireguard-go+system-wg-quick" | "system-wireguard-go+bundled-wg-quick" | "bundled-wireguard-go+bundled-wg-quick";    sudo?: boolean | "ask" | undefined;}, interfaceObject?: WireguardInterface.WireguardInterface | undefined): Effect.Effect<string, WireguardErrors.WireguardError | ParseResult.ParseError | PlatformError.PlatformError | Cause.UnknownException, FileSystem.FileSystem | Path.Path | Scope.Scope>; }
```

Added in v1.0.0

# Transformations

## WireguardIniConfig

A wireguard configuration encoded in the INI format.

**Signature**

```ts
export declare const WireguardIniConfig: $WireguardIniConfig
```

Added in v1.0.0

## WireguardUapiConfig

A wireguard configuration encoded in the userspace api format.

**Signature**

```ts
export declare const WireguardUapiConfig: $WireguardUapiConfig
```

Added in v1.0.0
