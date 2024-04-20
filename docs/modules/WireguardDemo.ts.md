---
title: WireguardDemo.ts
nav_order: 5
parent: Modules
---

## WireguardDemo overview

Utilities for connecting to the Wireguard demo server at demo.wireguard.com

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Encoded types](#encoded-types)
  - [WireguardDemoSchemaEncoded (type alias)](#wireguarddemoschemaencoded-type-alias)
- [Schema](#schema)
  - [WireguardDemoSchema](#wireguarddemoschema)
- [Unbranded types](#unbranded-types)
  - [WireguardDemoSchema (type alias)](#wireguarddemoschema-type-alias)
- [utils](#utils)
  - [requestGoogle](#requestgoogle)
  - [requestHiddenPage](#requesthiddenpage)
  - [requestWireguardDemoConfig](#requestwireguarddemoconfig)

---

# Encoded types

## WireguardDemoSchemaEncoded (type alias)

**Signature**

```ts
export type WireguardDemoSchemaEncoded = Schema.Schema.Encoded<typeof WireguardDemoSchema>
```

Added in v1.0.0

# Schema

## WireguardDemoSchema

**Signature**

```ts
export declare const WireguardDemoSchema: Schema.transform<
  Schema.Schema<`OK:${string}:${number}:${string}\n`, `OK:${string}:${number}:${string}\n`, never>,
  Schema.Struct<{
    serverPort: InternetSchemas.$Port
    serverPublicKey: Schema.brand<Schema.Schema<string, string, never>, "WireguardKey">
    yourWireguardAddress: InternetSchemas.$AddressFromString
  }>
>
```

Added in v1.0.0

# Unbranded types

## WireguardDemoSchema (type alias)

**Signature**

```ts
export type WireguardDemoSchema = Schema.Schema.Type<typeof WireguardDemoSchema>
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
export declare const requestHiddenPage: (
  hiddenPageLocation: string
) => Effect.Effect<string, HttpClient.error.HttpClientError | Cause.TimeoutException, HttpClient.client.Client.Default>
```

Added in v1.0.0

## requestWireguardDemoConfig

Creates a Wireguard configuration to connect to demo.wireguard.com. When
connected, you should be able to see the hidden page at 192.168.4.1

**Signature**

```ts
export declare const requestWireguardDemoConfig: (
  connectOptions?: { port: number; host: string },
  {
    privateKey,
    publicKey
  }?: { readonly privateKey: string & Brand<"WireguardKey">; readonly publicKey: string & Brand<"WireguardKey"> }
) => Effect.Effect<WireguardConfig.WireguardConfig, Socket.SocketError | ParseResult.ParseError, never>
```

Added in v1.0.0
