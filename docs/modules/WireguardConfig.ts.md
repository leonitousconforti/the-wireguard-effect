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
export declare const fromConfigFile: (
  file: string
) => Effect.Effect<
  circular.WireguardConfig,
  ParseResult.ParseError | PlatformError.PlatformError,
  FileSystem.FileSystem
>
```

Added in v1.0.0

# Schema Transformations

## WireguardIniConfig

A wireguard configuration encoded in the INI format.

**Signature**

```ts
export declare const WireguardIniConfig: typeof circular.WireguardIniConfig
```

Added in v1.0.0

# Schemas

## WireguardConfig

A wireguard configuration.

**Signature**

```ts
export declare const WireguardConfig: typeof circular.WireguardConfig
```

Added in v1.0.0
