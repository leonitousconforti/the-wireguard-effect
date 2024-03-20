---
title: WireguardConfig.ts
nav_order: 3
parent: Modules
---

## WireguardConfig overview

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
up: (interfaceObject: Option.Option<WireguardInterface.WireguardInterface> | undefined) =>
  Effect.Effect<
    WireguardInterface.WireguardInterface,
    WireguardError.WireguardError | Cause.TimeoutException,
    Platform.FileSystem.FileSystem | Platform.Path.Path
  >
```

Added in v1.0.0

### upScoped (property)

Starts a wireguard tunnel that will be gracefully shutdown and stop
serving traffic once the scope is closed.

**Signature**

```ts
upScoped: (interfaceObject: Option.Option<WireguardInterface.WireguardInterface> | undefined) =>
  Effect.Effect<
    WireguardInterface.WireguardInterface,
    WireguardError.WireguardError | Cause.TimeoutException,
    Platform.FileSystem.FileSystem | Platform.Path.Path | Scope.Scope
  >
```

Added in v1.0.0

# Transformations

## WireguardIniConfig

A wireguard configuration encoded in the INI format.

**Signature**

```ts
export declare const WireguardIniConfig: Schema.brand<
  Schema.transformOrFail<typeof WireguardConfig, Schema.$string, never>,
  "WireguardIniConfig"
>
```

Added in v1.0.0

## WireguardUapiConfig

A wireguard configuration encoded in the userspace api format.

**Signature**

```ts
export declare const WireguardUapiConfig: Schema.brand<
  Schema.transformOrFail<
    typeof WireguardConfig,
    Schema.tuple<
      [
        Schema.$string,
        Schema.brand<
          Schema.transformOrFail<
            Schema.union<
              [
                Schema.struct<{
                  ipv4: Schema.brand<Schema.Schema<string, string, never>, "IPv4">
                  mask: Schema.brand<Schema.Schema<number, number, never>, "IPv4CidrMask">
                }>,
                Schema.struct<{
                  ipv6: Schema.brand<Schema.Schema<string, string, never>, "IPv6">
                  mask: Schema.brand<Schema.Schema<number, number, never>, "IPv6CidrMask">
                }>,
                Schema.Schema<`${string}/${number}`, `${string}/${number}`, never>
              ]
            >,
            Schema.union<[typeof InternetSchemas.IPv4CidrBlock, typeof InternetSchemas.IPv6CidrBlock]>,
            never
          >,
          "CidrBlock"
        >
      ]
    >,
    never
  >,
  "WireguardUapiConfig"
>
```

Added in v1.0.0
