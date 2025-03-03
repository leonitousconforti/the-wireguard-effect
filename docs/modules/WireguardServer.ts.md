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
  Schema.TemplateLiteral<`OK:${string}:${number}:${string}\n`>,
  Schema.Struct<{
    serverPort: InternetSchemas.$Port
    serverPublicKey: Schema.brand<Schema.refine<string, typeof Schema.String>, "WireguardKey">
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
  | Cause.TimeoutException
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
  }?: { readonly privateKey: WireguardKey.WireguardKey; readonly publicKey: WireguardKey.WireguardKey }
) => Effect.Effect<WireguardConfig.WireguardConfig, Socket.SocketError | ParseResult.ParseError, never>
```

Added in v1.0.0
