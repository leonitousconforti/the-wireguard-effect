---
title: WireguardKey.ts
nav_order: 8
parent: Modules
---

## WireguardKey.ts overview

Wireguard key schemas and helpers

Since v1.0.0

---

## Exports Grouped by Category

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

**Example**

````ts

    import { generateKeyPair } from "the-wireguard-effect/WireguardKey";
    const { privateKey, publicKey } = generateKeyPair();
    ```;

**Signature**

```ts
declare const generateKeyPair: () => { readonly privateKey: WireguardKey; readonly publicKey: WireguardKey; }
````

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardKey.ts#L45)

Since v1.0.0

## generatePreshareKey

Generates a wireguard preshare key.

**Example**

````ts

    import { generatePreshareKey } from "the-wireguard-effect/WireguardKey";
    const preshareKey = generatePreshareKey();
    ```;

**Signature**

```ts
declare const generatePreshareKey: () => WireguardKey
````

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardKey.ts#L67)

Since v1.0.0

# Schemas

## WireguardKey

A wireguard key, which is a 44 character base64 string.

**See**

- `generateKeyPair`
- https://lists.zx2c4.com/pipermail/wireguard/2020-December/006222.html

**Signature**

```ts
declare const WireguardKey: Schema.brand<Schema.refine<string, typeof Schema.String>, "WireguardKey">
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardKey.ts#L20)

Since v1.0.0

# Unbranded Types

## WireguardKey (type alias)

**Signature**

```ts
type WireguardKey = Schema.Schema.Type<typeof WireguardKey>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardKey.ts#L31)

Since v1.0.0
