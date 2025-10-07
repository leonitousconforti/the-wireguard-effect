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

- [Schema](#schema)
  - [WireguardDemoServerSchema (class)](#wireguarddemoserverschema-class)
- [utils](#utils)
  - [WireguardDemoServer](#wireguarddemoserver)
  - [requestWireguardDemoConfig](#requestwireguarddemoconfig)

---

# Schema

## WireguardDemoServerSchema (class)

**Signature**

```ts
declare class WireguardDemoServerSchema
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardServer.ts#L51)

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
  serverEndpoint: Schema.Schema.Type<WireguardInternetSchemas.Endpoint>
  wireguardNetwork: Schema.Schema.Encoded<InternetSchemas.CidrBlockFromString>
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

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardServer.ts#L176)

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

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardServer.ts#L109)

Since v1.0.0
