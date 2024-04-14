---
title: WireguardDemo.ts
nav_order: 4
parent: Modules
---

## WireguardDemo overview

Utilities for connecting to the Wireguard demo server at demo.wireguard.com

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Api interface](#api-interface)
  - [$WireguardDemoSchema (interface)](#wireguarddemoschema-interface)
- [Schema](#schema)
  - [WireguardDemoSchema](#wireguarddemoschema)
- [utils](#utils)
  - [requestGoogle](#requestgoogle)
  - [requestHiddenPage](#requesthiddenpage)
  - [requestWireguardDemoConfig](#requestwireguarddemoconfig)

---

# Api interface

## $WireguardDemoSchema (interface)

**Signature**

```ts
export interface $WireguardDemoSchema
  extends Schema.Annotable<
    $WireguardDemoSchema,
    {
      readonly serverPort: InternetSchemas.PortBrand
      readonly serverPublicKey: WireguardKey.WireguardKey
      readonly internalAddress: InternetSchemas.Address
    },
    `OK:${string}:${number}:${string}\n`,
    never
  > {}
```

Added in v1.0.0

# Schema

## WireguardDemoSchema

**Signature**

```ts
export declare const WireguardDemoSchema: $WireguardDemoSchema
```

Added in v1.0.0

# utils

## requestGoogle

Attempts to connect to https://www.google.com to ensure that dns is still
working and we can connect to the internet when the wireguard tunnel is up.

**Signature**

```ts
export declare const requestGoogle: Effect.Effect<
  void,
  HttpClient.error.HttpClientError | Cause.TimeoutException,
  HttpClient.client.Client.Default
>
```

Added in v1.0.0

## requestHiddenPage

Attempts to view the hidden page on the demo.wireguard.com server, you should
only be able to see it when connected as a peer.

**Signature**

```ts
export declare const requestHiddenPage: Effect.Effect<
  string,
  HttpClient.error.HttpClientError | Cause.TimeoutException,
  HttpClient.client.Client.Default
>
```

Added in v1.0.0

## requestWireguardDemoConfig

Creates a Wireguard configuration to connect to demo.wireguard.com. When
connected, you should be able to see the hidden page at 192.168.4.1

**Signature**

```ts
export declare const requestWireguardDemoConfig: ({
  publicKey,
  privateKey
}?: {
  readonly privateKey: string & Brand<"WireguardKey">
  readonly publicKey: string & Brand<"WireguardKey">
}) => Effect.Effect<WireguardConfig.WireguardConfig, Socket.SocketError | ParseResult.ParseError, never>
```

Added in v1.0.0
