---
title: WireguardConfig.ts
nav_order: 3
parent: Modules
---

## WireguardConfig.ts overview

Wireguard config schema definitions

Since v1.0.0

---

## Exports Grouped by Category

- [Constructors](#constructors)
  - [fromConfigFile](#fromconfigfile)
- [Schema Transformations](#schema-transformations)
  - [WireguardIniConfig](#wireguardiniconfig)
- [Schemas](#schemas)
  - [WireguardConfig](#wireguardconfig)

---

# Constructors

## fromConfigFile

Loads a wireguard interface configuration from an INI file.

**Signature**

```ts
declare const fromConfigFile: (
  file: string
) => Effect.Effect<
  circular.WireguardConfig,
  ParseResult.ParseError | PlatformError.PlatformError,
  FileSystem.FileSystem
>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardConfig.ts#L43)

Since v1.0.0

# Schema Transformations

## WireguardIniConfig

A wireguard configuration encoded in the INI format.

**See**

- `WireguardConfig`

**Signature**

```ts
declare const WireguardIniConfig: typeof circular.WireguardIniConfig
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardConfig.ts#L33)

Since v1.0.0

# Schemas

## WireguardConfig

A wireguard configuration.

**Signature**

```ts
declare const WireguardConfig: typeof circular.WireguardConfig
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardConfig.ts#L22)

Since v1.0.0
