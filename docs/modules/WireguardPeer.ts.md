---
title: WireguardPeer.ts
nav_order: 9
parent: Modules
---

## WireguardPeer overview

Wireguard peer schema definitions

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Datatypes](#datatypes)
  - [WireguardPeer (class)](#wireguardpeer-class)
- [Refinements](#refinements)
  - [hasBidirectionalTraffic](#hasbidirectionaltraffic)
  - [hasHandshakedRecently](#hashandshakedrecently)
- [Schemas](#schemas)
  - [WireguardUapiGetPeer (class)](#wireguarduapigetpeer-class)
  - [WireguardUapiSetPeer (class)](#wireguarduapisetpeer-class)
- [Transformations](#transformations)
  - [WireguardIniPeer (class)](#wireguardinipeer-class)

---

# Datatypes

## WireguardPeer (class)

A wireguard peer configuration.

**Signature**

```ts
export declare class WireguardPeer
```

**Example**

```ts
import * as Schema from "effect/Schema"
import * as Duration from "effect/Duration"
import * as Option from "effect/Option"
import * as InternetSchemas from "the-wireguard-effect/InternetSchemas"
import * as WireguardKey from "the-wireguard-effect/WireguardKey"

import { WireguardPeer } from "the-wireguard-effect/WireguardPeer"

const preshareKey = WireguardKey.generatePreshareKey()
const { publicKey, privateKey: _privateKey } = WireguardKey.generateKeyPair()

// WireguardPeer
const peerDirectInstantiation = new WireguardPeer({
  PublicKey: publicKey,
  AllowedIPs: [
    InternetSchemas.CidrBlock({
      ipv4: InternetSchemas.IPv4("192.168.0.0"),
      mask: InternetSchemas.IPv4CidrMask(24)
    })
  ],
  Endpoint: InternetSchemas.Endpoint(
    InternetSchemas.IPv4Endpoint({
      ip: InternetSchemas.IPv4("192.168.0.1"),
      natPort: InternetSchemas.Port(51820),
      listenPort: InternetSchemas.Port(51820)
    })
  ),
  PersistentKeepalive: Duration.seconds(20),
  PresharedKey: Option.none()
})

// Effect.Effect<WireguardPeer, ParseResult.ParseError, never>
const peerSchemaInstantiation = Schema.decode(WireguardPeer)({
  PublicKey: publicKey,
  PresharedKey: preshareKey,
  Endpoint: "192.168.0.1:51820",
  AllowedIPs: ["192.168.0.0/24"],
  PersistentKeepalive: Duration.seconds(20)
})
```

Added in v1.0.0

# Refinements

## hasBidirectionalTraffic

**Signature**

```ts
export declare const hasBidirectionalTraffic: (
  wireguardPeer: Schema.Schema.Type<(typeof WireguardPeer)["uapi"]>
) => Effect.Effect<boolean, never, never>
```

Added in v1.0.0

## hasHandshakedRecently

**Signature**

```ts
export declare const hasHandshakedRecently: (
  wireguardPeer: Schema.Schema.Type<(typeof WireguardPeer)["uapi"]>
) => Effect.Effect<boolean, never, never>
```

Added in v1.0.0

# Schemas

## WireguardUapiGetPeer (class)

**Signature**

```ts
export declare class WireguardUapiGetPeer
```

Added in v1.0.0

## WireguardUapiSetPeer (class)

**Signature**

```ts
export declare class WireguardUapiSetPeer
```

Added in v1.0.0

# Transformations

## WireguardIniPeer (class)

A wireguard peer configuration encoded in INI format.

**Signature**

```ts
export declare class WireguardIniPeer
```

**Example**

```ts
import * as Effect from "effect/Effect"
import * as Function from "effect/Function"
import * as Schema from "effect/Schema"
import * as WireguardKey from "the-wireguard-effect/WireguardKey"
import * as WireguardPeer from "the-wireguard-effect/WireguardPeer"

const preshareKey = WireguardKey.generatePreshareKey()
const { publicKey, privateKey: _privateKey } = WireguardKey.generateKeyPair()

const peer = Schema.decode(WireguardPeer.WireguardPeer)({
  PublicKey: publicKey,
  PresharedKey: preshareKey,
  AllowedIPs: new Set(["192.168.0.0/24"]),
  Endpoint: "192.168.0.1:51820",
  PersistentKeepalive: 20
})

const iniPeer = Function.pipe(
  peer,
  Effect.flatMap(Schema.encode(WireguardPeer.WireguardPeer)),
  Effect.flatMap(Schema.decode(WireguardPeer.WireguardIniPeer))
)
```

Added in v1.0.0
