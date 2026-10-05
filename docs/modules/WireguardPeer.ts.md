---
title: WireguardPeer.ts
nav_order: 9
parent: Modules
---

## WireguardPeer.ts overview

Wireguard peer schema definitions

Since v1.0.0

---

## Exports Grouped by Category

- [Datatypes](#datatypes)
  - [WireguardPeer (class)](#wireguardpeer-class)
- [Refinements](#refinements)
  - [hasBidirectionalTraffic](#hasbidirectionaltraffic)
  - [hasHandshakedRecently](#hashandshakedrecently)
- [Schemas](#schemas)
  - [WireguardUapiGetPeer](#wireguarduapigetpeer)
  - [WireguardUapiSetPeer](#wireguarduapisetpeer)
- [Transformations](#transformations)
  - [WireguardIniPeer](#wireguardinipeer)

---

# Datatypes

## WireguardPeer (class)

A wireguard peer configuration.

**Example**

````ts

    import * as Schema from "effect/Schema";
    import * as WireguardKey from "the-wireguard-effect/WireguardKey";

    import { WireguardPeer } from "the-wireguard-effect/WireguardPeer";

    const preshareKey = WireguardKey.generatePreshareKey();
    const { publicKey, privateKey: _privateKey } =
        WireguardKey.generateKeyPair();

    const peerSchemaInstantiation = Schema.decodeEffect(WireguardPeer)({
        PublicKey: publicKey,
        PresharedKey: preshareKey,
        Endpoint: "192.168.0.1:51820",
        AllowedIPs: new Set(["192.168.0.0/24"]),
        PersistentKeepalive: 20,
    });
    ```;

**Signature**

```ts
declare class WireguardPeer
````

[Source](https://github.com/leonitousconforti/the-wireguard-effect/blob/main/src/WireguardPeer.ts#L53)

Since v1.0.0

# Refinements

## hasBidirectionalTraffic

**Signature**

```ts
declare const hasBidirectionalTraffic: (
  wireguardPeer: Schema.Schema.Type<(typeof WireguardPeer)["uapi"]>
) => Effect.Effect<boolean, never, never>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/blob/main/src/WireguardPeer.ts#L377)

Since v1.0.0

## hasHandshakedRecently

**Signature**

```ts
declare const hasHandshakedRecently: (
  wireguardPeer: Schema.Schema.Type<(typeof WireguardPeer)["uapi"]>
) => Effect.Effect<boolean, never, never>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/blob/main/src/WireguardPeer.ts#L385)

Since v1.0.0

# Schemas

## WireguardUapiGetPeer

**See**

- https://www.wireguard.com/xplatform/

**Signature**

```ts
declare const WireguardUapiGetPeer: Schema.decodeTo<
  Schema.Struct<{
    readonly PersistentKeepalive: Schema.OptionFromOptionalNullOr<
      Schema.decodeTo<Schema.Duration, Schema.Int, never, never>
    >
    readonly AllowedIPs: Schema.withDecodingDefault<
      Schema.$ReadonlySet<
        Schema.decodeTo<
          Schema.Union<readonly [typeof InternetSchemas.IPv4CidrBlock, typeof InternetSchemas.IPv6CidrBlock]>,
          Schema.TemplateLiteral<readonly [Schema.String, "/", Schema.Finite]>,
          never,
          never
        >
      >,
      never
    >
    readonly Endpoint: Schema.optional<
      Schema.NullOr<
        Schema.Union<
          readonly [
            Schema.decodeTo<
              Schema.Struct<{
                readonly address: Schema.decodeTo<
                  Schema.Struct<{
                    readonly family: Schema.Literal<"ipv4">
                    readonly ip: Schema.brand<Schema.String, "IPv4">
                  }>,
                  Schema.String,
                  never,
                  never
                >
                readonly natPort: Schema.brand<Schema.Int, "Port">
                readonly listenPort: Schema.brand<Schema.Int, "Port">
              }>,
              Schema.Union<
                readonly [
                  Schema.Struct<{
                    readonly ip: Schema.String
                    readonly port: Schema.Finite
                    readonly family: Schema.Literal<"ipv4">
                  }>,
                  Schema.Struct<{
                    readonly ip: Schema.String
                    readonly natPort: Schema.Finite
                    readonly listenPort: Schema.Finite
                    readonly family: Schema.Literal<"ipv4">
                  }>,
                  Schema.TemplateLiteral<readonly [Schema.String, Schema.Literal<":">, Schema.Finite]>,
                  Schema.TemplateLiteral<
                    readonly [Schema.String, Schema.Literal<":">, Schema.Finite, Schema.Literal<":">, Schema.Finite]
                  >
                ]
              >,
              never,
              never
            >,
            Schema.decodeTo<
              Schema.Struct<{
                readonly address: Schema.decodeTo<
                  Schema.Struct<{
                    readonly family: Schema.Literal<"ipv6">
                    readonly ip: Schema.brand<Schema.String, "IPv6">
                  }>,
                  Schema.String,
                  never,
                  never
                >
                readonly natPort: Schema.brand<Schema.Int, "Port">
                readonly listenPort: Schema.brand<Schema.Int, "Port">
              }>,
              Schema.Union<
                readonly [
                  Schema.Struct<{
                    readonly ip: Schema.String
                    readonly port: Schema.Finite
                    readonly family: Schema.Literal<"ipv6">
                  }>,
                  Schema.Struct<{
                    readonly ip: Schema.String
                    readonly natPort: Schema.Finite
                    readonly listenPort: Schema.Finite
                    readonly family: Schema.Literal<"ipv6">
                  }>,
                  Schema.TemplateLiteral<
                    readonly [
                      Schema.Literal<"[">,
                      Schema.String,
                      Schema.Literal<"]">,
                      Schema.Literal<":">,
                      Schema.Finite
                    ]
                  >,
                  Schema.TemplateLiteral<
                    readonly [
                      Schema.Literal<"[">,
                      Schema.String,
                      Schema.Literal<"]">,
                      Schema.Literal<":">,
                      Schema.Finite,
                      Schema.Literal<":">,
                      Schema.Finite
                    ]
                  >
                ]
              >,
              never,
              never
            >,
            Schema.decodeTo<
              Schema.Struct<{
                readonly host: Schema.String
                readonly natPort: Schema.brand<Schema.Int, "Port">
                readonly listenPort: Schema.brand<Schema.Int, "Port">
              }>,
              Schema.Union<
                readonly [
                  Schema.Struct<{ readonly host: Schema.String; readonly port: Schema.Finite }>,
                  Schema.Struct<{
                    readonly host: Schema.String
                    readonly natPort: Schema.Finite
                    readonly listenPort: Schema.Finite
                  }>,
                  Schema.TemplateLiteral<readonly [Schema.String, Schema.Literal<":">, Schema.Finite]>,
                  Schema.TemplateLiteral<
                    readonly [Schema.String, Schema.Literal<":">, Schema.Finite, Schema.Literal<":">, Schema.Finite]
                  >
                ]
              >,
              never,
              never
            >
          ]
        >
      >
    >
    readonly PublicKey: Schema.brand<Schema.String, "WireguardKey">
    readonly PresharedKey: Schema.OptionFromOptionalNullOr<Schema.brand<Schema.String, "WireguardKey">>
    readonly rxBytes: Schema.FiniteFromString
    readonly txBytes: Schema.FiniteFromString
    readonly lastHandshake: Schema.compose<
      Schema.DateTimeUtcFromMillis,
      Schema.decodeTo<Schema.toType<Schema.FiniteFromString>, Schema.FiniteFromString, never, never>
    >
  }>,
  Schema.String,
  never,
  never
>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/blob/main/src/WireguardPeer.ts#L301)

Since v1.0.0

## WireguardUapiSetPeer

**See**

- https://www.wireguard.com/xplatform/

**Signature**

```ts
declare const WireguardUapiSetPeer: Schema.decodeTo<Schema.String, typeof WireguardPeer, never, never>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/blob/main/src/WireguardPeer.ts#L245)

Since v1.0.0

# Transformations

## WireguardIniPeer

A wireguard peer configuration encoded in INI format.

**Example**

````ts

    import * as Effect from "effect/Effect";
    import * as Function from "effect/Function";
    import * as Schema from "effect/Schema";
    import * as WireguardKey from "the-wireguard-effect/WireguardKey";
    import * as WireguardPeer from "the-wireguard-effect/WireguardPeer";

    const preshareKey = WireguardKey.generatePreshareKey();
    const { publicKey, privateKey: _privateKey } =
        WireguardKey.generateKeyPair();

    const peer = Schema.decodeEffect(WireguardPeer.WireguardPeer)({
        PublicKey: publicKey,
        PresharedKey: preshareKey,
        AllowedIPs: new Set(["192.168.0.0/24"]),
        Endpoint: "192.168.0.1:51820",
        PersistentKeepalive: 20,
    });

    const iniPeer = Function.pipe(
        peer,
        Effect.flatMap(Schema.encodeEffect(WireguardPeer.WireguardPeer)),
        Effect.flatMap(Schema.decodeEffect(WireguardPeer.WireguardIniPeer))
    );
    ```;

**See**

- `WireguardPeer`

**Signature**

```ts
declare const WireguardIniPeer: Schema.decodeTo<Schema.String, typeof WireguardPeer, never, never>
````

[Source](https://github.com/leonitousconforti/the-wireguard-effect/blob/main/src/WireguardPeer.ts#L152)

Since v1.0.0
