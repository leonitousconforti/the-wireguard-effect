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

- [Api interface](#api-interface)
  - [$WireguardIniPeer (interface)](#wireguardinipeer-interface)
- [Datatypes](#datatypes)
  - [WireguardPeer (class)](#wireguardpeer-class)
- [Requests](#requests)
  - [WireguardGetPeerRequest (class)](#wireguardgetpeerrequest-class)
  - [WireguardSetPeerRequest (class)](#wireguardsetpeerrequest-class)
- [Resolvers](#resolvers)
  - [WireguardGetPeerResolver](#wireguardgetpeerresolver)
  - [WireguardSetPeerResolver](#wireguardsetpeerresolver)
- [Responses](#responses)
  - [WireguardGetPeerResponse (class)](#wireguardgetpeerresponse-class)
- [Transformations](#transformations)
  - [WireguardIniPeer](#wireguardinipeer)

---

# Api interface

## $WireguardIniPeer (interface)

**Signature**

```ts
export interface $WireguardIniPeer
  extends Schema.Annotable<$WireguardIniPeer, string, Schema.Schema.Encoded<typeof WireguardPeer>, never> {}
```

Added in v1.0.0

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
  PersistentKeepalive: Duration.seconds(20),
  PresharedKey: Option.none()
})

// Effect.Effect<WireguardPeer, ParseResult.ParseError, never>
const peerSchemaInstantiation = Schema.decode(WireguardPeer)({
  PublicKey: publicKey,
  AllowedIPs: ["192.168.0.0/24"],
  Endpoint: "192.168.0.1:51820",
  PersistentKeepalive: Duration.seconds(20)
})
```

Added in v1.0.0

# Requests

## WireguardGetPeerRequest (class)

**Signature**

```ts
export declare class WireguardGetPeerRequest
```

Added in v1.0.0

## WireguardSetPeerRequest (class)

**Signature**

```ts
export declare class WireguardSetPeerRequest
```

Added in v1.0.0

# Resolvers

## WireguardGetPeerResolver

**Signature**

```ts
export declare const WireguardGetPeerResolver: Resolver.RequestResolver<WireguardGetPeerRequest, never>
```

Added in v1.0.0

## WireguardSetPeerResolver

**Signature**

```ts
export declare const WireguardSetPeerResolver: Resolver.RequestResolver<WireguardSetPeerRequest, never>
```

Added in v1.0.0

# Responses

## WireguardGetPeerResponse (class)

A wireguard peer from an interface inspection request contains three
additional fields.

**Signature**

```ts
export declare class WireguardGetPeerResponse
```

Added in v1.0.0

# Transformations

## WireguardIniPeer

A wireguard peer configuration encoded in INI format.

**Signature**

```ts
export declare const WireguardIniPeer: $WireguardIniPeer
```

**Example**

```ts
import * as Effect from "effect/Effect"
import * as Function from "effect/Function"
import * as Schema from "@effect/schema/Schema"
import * as WireguardKey from "the-wireguard-effect/WireguardKey"
import * as WireguardPeer from "the-wireguard-effect/WireguardPeer"

const { publicKey, privateKey: _privateKey } = WireguardKey.generateKeyPair()

const peer = Schema.decode(WireguardPeer.WireguardPeer)({
  PublicKey: publicKey,
  AllowedIPs: ["192.168.0.0/24"],
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
