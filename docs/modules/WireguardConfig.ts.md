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

- [Datatypes](#datatypes)
  - [WireguardConfig (class)](#wireguardconfig-class)
    - [writeToFile (property)](#writetofile-property)
    - [up (property)](#up-property)
    - [upScoped (property)](#upscoped-property)
- [Transformations](#transformations)
  - [WireguardIniConfig](#wireguardiniconfig)
  - [WireguardUapiConfig](#wireguarduapiconfig)

---

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
  Effect.Effect<
    void,
    ParseResult.ParseError | Platform.Error.PlatformError,
    Platform.FileSystem.FileSystem | Platform.Path.Path
  >
```

Added in v1.0.0

### up (property)

Starts a wireguard tunnel that will continue to run and serve traffic
even after the nodejs process exits.

**Signature**

```ts
up: (
  options: {
    how?:
      | "bundled-wireguard-go+userspace-api"
      | "system-wireguard-go+userspace-api"
      | "system-wireguard+system-wg-quick"
      | "system-wireguard+bundled-wg-quick"
      | "system-wireguard-go+system-wg-quick"
      | "bundled-wireguard-go+system-wg-quick"
      | "system-wireguard-go+bundled-wg-quick"
      | "bundled-wireguard-go+bundled-wg-quick"
      | undefined
    sudo?: boolean | "ask"
  },
  interfaceObject?: WireguardInterface.WireguardInterface | undefined
) =>
  Effect.Effect<
    WireguardInterface.WireguardInterface,
    WireguardErrors.WireguardError | ParseResult.ParseError | Platform.Error.PlatformError,
    Platform.FileSystem.FileSystem | Platform.Path.Path
  >
```

Added in v1.0.0

### upScoped (property)

Starts a wireguard tunnel that will be gracefully shutdown and stop
serving traffic once the scope is closed.

**Signature**

```ts
upScoped: (
  options: {
    how?:
      | "bundled-wireguard-go+userspace-api"
      | "system-wireguard-go+userspace-api"
      | "system-wireguard+system-wg-quick"
      | "system-wireguard+bundled-wg-quick"
      | "system-wireguard-go+system-wg-quick"
      | "bundled-wireguard-go+system-wg-quick"
      | "system-wireguard-go+bundled-wg-quick"
      | "bundled-wireguard-go+bundled-wg-quick"
      | undefined
    sudo?: boolean | "ask"
  },
  interfaceObject?: WireguardInterface.WireguardInterface | undefined
) =>
  Effect.Effect<
    WireguardInterface.WireguardInterface,
    WireguardErrors.WireguardError | ParseResult.ParseError | Platform.Error.PlatformError,
    Platform.FileSystem.FileSystem | Platform.Path.Path | Scope.Scope
  >
```

Added in v1.0.0

# Transformations

## WireguardIniConfig

A wireguard configuration encoded in the INI format.

TODO: Write an api interface type

**Signature**

```ts
export declare const WireguardIniConfig: Schema.transformOrFail<typeof WireguardConfig, Schema.$string, never>
```

Added in v1.0.0

## WireguardUapiConfig

A wireguard configuration encoded in the userspace api format.

TODO: Write an api interface type

**Signature**

```ts
export declare const WireguardUapiConfig: Schema.transformOrFail<
  typeof WireguardConfig,
  Schema.tuple<[Schema.$string, InternetSchemas.$CidrBlockFromString]>,
  never
>
```

Added in v1.0.0
