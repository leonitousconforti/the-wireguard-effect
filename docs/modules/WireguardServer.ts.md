---
title: WireguardServer.ts
nav_order: 10
parent: Modules
---

## WireguardServer overview

Utilities for connecting to the Wireguard demo server at demo.wireguard.com

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Encoded types](#encoded-types)
  - [WireguardDemoServerSchemaEncoded (type alias)](#wireguarddemoserverschemaencoded-type-alias)
- [Schema](#schema)
  - [WireguardDemoServerSchema](#wireguarddemoserverschema)
- [Unbranded types](#unbranded-types)
  - [WireguardDemoServerSchema (type alias)](#wireguarddemoserverschema-type-alias)
- [utils](#utils)
  - [WireguardDemoServer](#wireguarddemoserver)
  - [requestGoogle](#requestgoogle)
  - [requestHiddenPage](#requesthiddenpage)
  - [requestWireguardDemoConfig](#requestwireguarddemoconfig)

---

# Encoded types

## WireguardDemoServerSchemaEncoded (type alias)

**Signature**

```ts
export type WireguardDemoServerSchemaEncoded = Schema.Schema.Encoded<typeof WireguardDemoServerSchema>
```

Added in v1.0.0

# Schema

## WireguardDemoServerSchema

**Signature**

```ts
export declare const WireguardDemoServerSchema: Schema.transform<
  Schema.SchemaClass<`OK:${string}:${number}:${string}\n`, `OK:${string}:${number}:${string}\n`, never>,
  Schema.Struct<{
    serverPort: InternetSchemas.$Port
    serverPublicKey: Schema.brand<Schema.refine<string, Schema.Schema<string, string, never>>, "WireguardKey">
    yourWireguardAddress: InternetSchemas.$Address
  }>
>
```

Added in v1.0.0

# Unbranded types

## WireguardDemoServerSchema (type alias)

**Signature**

```ts
export type WireguardDemoServerSchema = Schema.Schema.Type<typeof WireguardDemoServerSchema>
```

Added in v1.0.0

# utils

## WireguardDemoServer

Mock implementation of the Wireguard demo server at demo.wireguard.com

**Signature**

```ts
export declare const WireguardDemoServer: (options: {
  maxPeers?: number | undefined
  serverEndpoint: InternetSchemas.Endpoint
  wireguardNetwork: InternetSchemas.CidrBlockFromStringEncoded
}) => Effect.Effect<
  void,
  | Socket.SocketError
  | ParseResult.ParseError
  | Cause.UnknownException
  | WireguardErrors.WireguardError
  | PlatformError.PlatformError
  | SocketServer.SocketServerError,
  | Scope.Scope
  | FileSystem.FileSystem
  | Path.Path
  | SocketServer.SocketServer
  | WireguardControl.WireguardControl
  | CommandExecutor.CommandExecutor
>
```

Added in v1.0.0

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
