---
title: WireguardServer.ts
nav_order: 10
parent: Modules
---

## WireguardServer.ts overview

Utilities for connecting to the Wireguard demo server at demo.wireguard.com

Since v1.0.0

---

## Exports Grouped by Category

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
type WireguardDemoServerSchemaEncoded = Schema.Schema.Encoded<typeof WireguardDemoServerSchema>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardServer.ts#L56)

Since v1.0.0

# Schema

## WireguardDemoServerSchema

**Signature**

```ts
declare const WireguardDemoServerSchema: Schema.transform<
  Schema.TemplateLiteral<`OK:${string}:${number}:${string}
`>,
  Schema.Struct<{
    serverPort: InternetSchemas.$Port
    serverPublicKey: Schema.brand<Schema.refine<string, typeof Schema.String>, "WireguardKey">
    yourWireguardAddress: InternetSchemas.$Address
  }>
>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardServer.ts#L62)

Since v1.0.0

# Unbranded types

## WireguardDemoServerSchema (type alias)

**Signature**

```ts
type WireguardDemoServerSchema = Schema.Schema.Type<typeof WireguardDemoServerSchema>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardServer.ts#L50)

Since v1.0.0

# utils

## WireguardDemoServer

Mock implementation of the Wireguard demo server at demo.wireguard.com

**See**

- https://git.zx2c4.com/wireguard-tools/plain/contrib/ncat-client-server/server.sh

**Signature**

```ts
declare const WireguardDemoServer: (options: {
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

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardServer.ts#L187)

Since v1.0.0

## requestWireguardDemoConfig

Creates a Wireguard configuration to connect to demo.wireguard.com. When
connected, you should be able to see the hidden page at 192.168.4.1

**See**

- https://git.zx2c4.com/wireguard-tools/plain/contrib/ncat-client-server/client.sh

**Signature**

```ts
declare const requestWireguardDemoConfig: (
  connectOptions?: { port: number; host: string },
  {
    privateKey,
    publicKey
  }?: { readonly privateKey: WireguardKey.WireguardKey; readonly publicKey: WireguardKey.WireguardKey }
) => Effect.Effect<WireguardConfig.WireguardConfig, Socket.SocketError | ParseResult.ParseError, never>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardServer.ts#L120)

Since v1.0.0
