---
title: WireguardKey.ts
nav_order: 6
parent: Modules
---

## WireguardKey overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Crypto](#crypto)
  - [generateKeyPair](#generatekeypair)
- [Datatypes](#datatypes)
  - [WireguardKey](#wireguardkey)
- [utils](#utils)
  - [WireguardKey (type alias)](#wireguardkey-type-alias)

---

# Crypto

## generateKeyPair

Generates a wireguard public private key pair.

**Signature**

```ts
export declare const generateKeyPair: () => { privateKey: WireguardKey; publicKey: WireguardKey }
```

**Example**

```ts
import { generateKeyPair } from "the-wireguard-effect/WireguardKey"
const { privateKey, publicKey } = generateKeyPair()
```

Added in v1.0.0

# Datatypes

## WireguardKey

A wireguard key, which is a 44 character base64 string.

**Signature**

```ts
export declare const WireguardKey: Schema.brand<Schema.Schema<string, string, never>, "WireguardKey">
```

Added in v1.0.0

# utils

## WireguardKey (type alias)

**Signature**

```ts
export type WireguardKey = Schema.Schema.Type<typeof WireguardKey>
```

Added in v1.0.0
