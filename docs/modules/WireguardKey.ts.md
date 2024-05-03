---
title: WireguardKey.ts
nav_order: 7
parent: Modules
---

## WireguardKey overview

Wireguard key schemas and helpers

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Crypto](#crypto)
  - [generateKeyPair](#generatekeypair)
  - [generatePreshareKey](#generatepresharekey)
- [Schemas](#schemas)
  - [WireguardKey](#wireguardkey)
- [Unbranded Types](#unbranded-types)
  - [WireguardKey (type alias)](#wireguardkey-type-alias)

---

# Crypto

## generateKeyPair

Generates a wireguard public private key pair.

**Signature**

```ts
export declare const generateKeyPair: () => { readonly privateKey: WireguardKey; readonly publicKey: WireguardKey }
```

**Example**

```ts
import { generateKeyPair } from "the-wireguard-effect/WireguardKey"
const { privateKey, publicKey } = generateKeyPair()
```

Added in v1.0.0

## generatePreshareKey

Generates a wireguard preshare key.

**Signature**

```ts
export declare const generatePreshareKey: () => WireguardKey
```

**Example**

```ts
import { generatePreshareKey } from "the-wireguard-effect/WireguardKey"
const preshareKey = generatePreshareKey()
```

Added in v1.0.0

# Schemas

## WireguardKey

A wireguard key, which is a 44 character base64 string.

**Signature**

```ts
export declare const WireguardKey: Schema.brand<Schema.Schema<string, string, never>, "WireguardKey">
```

Added in v1.0.0

# Unbranded Types

## WireguardKey (type alias)

**Signature**

```ts
export type WireguardKey = Schema.Schema.Type<typeof WireguardKey>
```

Added in v1.0.0
