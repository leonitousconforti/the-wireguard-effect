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
  - [WireguardDemoServerSchema](#wireguarddemoserverschema)
- [utils](#utils)
  - [WireguardDemoServer](#wireguarddemoserver)
  - [requestWireguardDemoConfig](#requestwireguarddemoconfig)

---

# Schema

## WireguardDemoServerSchema

**Signature**

```ts
declare const WireguardDemoServerSchema: Schema.decodeTo<
  Schema.Struct<{
    readonly serverPort: Schema.brand<Schema.Int, "Port">
    readonly serverPublicKey: Schema.brand<Schema.String, "WireguardKey">
    readonly yourWireguardAddress: Schema.Union<
      readonly [
        Schema.decodeTo<
          Schema.Struct<{ readonly family: Schema.Literal<"ipv4">; readonly ip: Schema.brand<Schema.String, "IPv4"> }>,
          Schema.String,
          never,
          never
        >,
        Schema.decodeTo<
          Schema.Struct<{ readonly family: Schema.Literal<"ipv6">; readonly ip: Schema.brand<Schema.String, "IPv6"> }>,
          Schema.String,
          never,
          never
        >
      ]
    >
  }>,
  Schema.TemplateLiteral<
    readonly [
      Schema.Literal<"OK">,
      Schema.Literal<":">,
      Schema.String,
      Schema.Literal<":">,
      Schema.Number,
      Schema.Literal<":">,
      Schema.String,
      Schema.Literal<"\n">
    ]
  >,
  never,
  never
>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardServer.ts#L54)

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
  serverEndpoint: Schema.Schema.Type<typeof WireguardInternetSchemas.Endpoint>
  wireguardNetwork: (typeof InternetSchemas.CidrBlockFromString)["Encoded"]
}) => Effect.Effect<
  void,
  | Socket.SocketError
  | Schema.SchemaError
  | Cause.TimeoutError
  | WireguardErrors.WireguardError
  | PlatformError.PlatformError
  | PlatformError.SystemError
  | PlatformError.BadArgument
  | SocketServer.SocketServerError,
  | Scope.Scope
  | FileSystem.FileSystem
  | Path.Path
  | SocketServer.SocketServer
  | WireguardControl.WireguardControl
  | ChildProcessSpawner.ChildProcessSpawner
>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardServer.ts#L188)

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
) => Effect.Effect<WireguardConfig.WireguardConfig, Socket.SocketError | Schema.SchemaError, never>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardServer.ts#L121)

Since v1.0.0
