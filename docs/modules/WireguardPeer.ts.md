---
title: WireguardPeer.ts
nav_order: 7
parent: Modules
---

## WireguardPeer overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Datatypes](#datatypes)
  - [WireguardPeer (class)](#wireguardpeer-class)
- [Transformations](#transformations)
  - [WireguardIniPeer](#wireguardinipeer)
  - [WireguardUapiPeer](#wireguarduapipeer)

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
import * as Schema from "@effect/schema/Schema"
import * as Duration from "effect/Duration"
import * as Option from "effect/Option"
import * as InternetSchemas from "the-wireguard-effect/InternetSchemas"
import * as WireguardKey from "the-wireguard-effect/WireguardKey"

import { WireguardPeer } from "the-wireguard-effect/WireguardPeer"

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
  PersistentKeepaliveInterval: Duration.seconds(20),
  PresharedKey: Option.none()
})

// Effect.Effect<WireguardPeer, ParseResult.ParseError, never>
const peerSchemaInstantiation = Schema.decode(WireguardPeer)({
  PublicKey: publicKey,
  AllowedIPs: ["192.168.0.0/24"],
  Endpoint: "192.168.0.1:51820",
  PersistentKeepaliveInterval: Duration.seconds(20)
})
```

Added in v1.0.0

# Transformations

## WireguardIniPeer

A wireguard peer configuration encoded in INI format.

**Signature**

```ts
export declare const WireguardIniPeer: Schema.brand<
  Schema.transformOrFail<typeof WireguardPeer, Schema.$string, never>,
  "WireguardIniPeer"
>
```

**Example**

```ts
import * as Effect from "effect/Effect"
import * as Duration from "effect/Duration"
import * as Function from "effect/Function"
import * as Schema from "@effect/schema/Schema"
import * as WireguardKey from "the-wireguard-effect/WireguardKey"
import * as WireguardPeer from "the-wireguard-effect/WireguardPeer"

const { publicKey, privateKey: _privateKey } = WireguardKey.generateKeyPair()

const peer = Schema.decode(WireguardPeer.WireguardPeer)({
  PublicKey: publicKey,
  AllowedIPs: ["192.168.0.0/24"],
  Endpoint: "192.168.0.1:51820",
  PersistentKeepaliveInterval: Duration.seconds(20)
})

const iniPeer = Function.pipe(
  peer,
  Effect.flatMap(Schema.encode(WireguardPeer.WireguardPeer)),
  Effect.flatMap(Schema.decode(WireguardPeer.WireguardIniPeer))
)
```

Added in v1.0.0

## WireguardUapiPeer

A wireguard peer configuration encoded in the userspace api format.

**Signature**

```ts
export declare const WireguardUapiPeer: Schema.brand<
  Schema.transformOrFail<typeof WireguardPeer, Schema.$string, never>,
  "WireguardUapiPeer"
>
```

**Example**

```ts
import * as Effect from "effect/Effect"
import * as Duration from "effect/Duration"
import * as Function from "effect/Function"
import * as Schema from "@effect/schema/Schema"
import * as WireguardKey from "the-wireguard-effect/WireguardKey"
import * as WireguardPeer from "the-wireguard-effect/WireguardPeer"

const { publicKey, privateKey: _privateKey } = WireguardKey.generateKeyPair()

const peer = Schema.decode(WireguardPeer.WireguardPeer)({
  PublicKey: publicKey,
  AllowedIPs: ["192.168.0.0/24"],
  Endpoint: "192.168.0.1:51820",
  PersistentKeepaliveInterval: Duration.seconds(20)
})

const uapiPeer = Function.pipe(
  peer,
  Effect.flatMap(Schema.encode(WireguardPeer.WireguardPeer)),
  Effect.flatMap(Schema.decode(WireguardPeer.WireguardUapiPeer))
)
```

Added in v1.0.0
