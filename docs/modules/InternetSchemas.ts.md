---
title: InternetSchemas.ts
nav_order: 2
parent: Modules
---

## InternetSchemas.ts overview

Internet schemas for wireguard configuration.

Since v1.0.0

---

## Exports Grouped by Category

- [Schemas](#schemas)
  - [DurationFromSeconds](#durationfromseconds)
  - [Endpoint](#endpoint)
  - [HostnameEndpoint](#hostnameendpoint)
  - [HostnameIPv4SetupData](#hostnameipv4setupdata)
  - [HostnameIPv6SetupData](#hostnameipv6setupdata)
  - [IPv4Endpoint](#ipv4endpoint)
  - [IPv4SetupData](#ipv4setupdata)
  - [IPv6Endpoint](#ipv6endpoint)
  - [IPv6SetupData](#ipv6setupdata)
  - [SetupData](#setupdata)

---

# Schemas

## DurationFromSeconds

Transforms a `number` of seconds into a `Duration`.

**Signature**

```ts
declare const DurationFromSeconds: Schema.decodeTo<Schema.Duration, Schema.Int, never, never>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/InternetSchemas.ts#L22)

Since v1.0.0

## Endpoint

A wireguard endpoint, which is either an IPv4 or IPv6 endpoint.

**Example**

````ts
import * as Schema from "effect/Schema";

    import { Endpoint } from "the-wireguard-effect/InternetSchemas";

    const decodeEndpoint = Schema.decodeSync(Endpoint);
    const endpoint1 = decodeEndpoint("1.2.3.4:51820");
    const endpoint2 = decodeEndpoint("1.2.3.4:51820:41820");

    const endpoint3 = decodeEndpoint({
        ip: "1.2.3.4",
        port: 51820,
        family: "ipv4",
    });

    const endpoint4: Endpoint = decodeEndpoint({
        ip: "1.2.3.4",
        natPort: 51820,
        listenPort: 41820,
        family: "ipv4",
    });

    const endpoint5 = decodeEndpoint(
        "[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820"
    );
    const endpoint6 = decodeEndpoint(
        "[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820:41820"
    );

    const endpoint7 = decodeEndpoint({
        ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
        port: 51820,
        family: "ipv6",
    });

    const endpoint8: Endpoint = decodeEndpoint({
        ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
        natPort: 51820,
        listenPort: 41820,
        family: "ipv6",
    });
    ```;
````

**Signature**

```ts
declare const Endpoint: Schema.Union<
  readonly [
    Schema.decodeTo<
      Schema.Struct<{
        readonly address: Schema.decodeTo<
          Schema.Struct<{ readonly family: Schema.Literal<"ipv4">; readonly ip: Schema.brand<Schema.String, "IPv4"> }>,
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
            readonly port: Schema.Number
            readonly family: Schema.Literal<"ipv4">
          }>,
          Schema.Struct<{
            readonly ip: Schema.String
            readonly natPort: Schema.Number
            readonly listenPort: Schema.Number
            readonly family: Schema.Literal<"ipv4">
          }>,
          Schema.TemplateLiteral<readonly [Schema.String, Schema.Literal<":">, Schema.Number]>,
          Schema.TemplateLiteral<
            readonly [Schema.String, Schema.Literal<":">, Schema.Number, Schema.Literal<":">, Schema.Number]
          >
        ]
      >,
      never,
      never
    >,
    Schema.decodeTo<
      Schema.Struct<{
        readonly address: Schema.decodeTo<
          Schema.Struct<{ readonly family: Schema.Literal<"ipv6">; readonly ip: Schema.brand<Schema.String, "IPv6"> }>,
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
            readonly port: Schema.Number
            readonly family: Schema.Literal<"ipv6">
          }>,
          Schema.Struct<{
            readonly ip: Schema.String
            readonly natPort: Schema.Number
            readonly listenPort: Schema.Number
            readonly family: Schema.Literal<"ipv6">
          }>,
          Schema.TemplateLiteral<
            readonly [Schema.Literal<"[">, Schema.String, Schema.Literal<"]">, Schema.Literal<":">, Schema.Number]
          >,
          Schema.TemplateLiteral<
            readonly [
              Schema.Literal<"[">,
              Schema.String,
              Schema.Literal<"]">,
              Schema.Literal<":">,
              Schema.Number,
              Schema.Literal<":">,
              Schema.Number
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
          Schema.Struct<{ readonly host: Schema.String; readonly port: Schema.Number }>,
          Schema.Struct<{
            readonly host: Schema.String
            readonly natPort: Schema.Number
            readonly listenPort: Schema.Number
          }>,
          Schema.TemplateLiteral<readonly [Schema.String, Schema.Literal<":">, Schema.Number]>,
          Schema.TemplateLiteral<
            readonly [Schema.String, Schema.Literal<":">, Schema.Number, Schema.Literal<":">, Schema.Number]
          >
        ]
      >,
      never,
      never
    >
  ]
>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/InternetSchemas.ts#L269)

Since v1.0.0

## HostnameEndpoint

A hostname wireguard endpoint, which consists of a hostname followed by a\
Nat port then an optional local port. If only one port is provided, it is
assumed that the nat port and listen port are the same.

**Signature**

```ts
declare const HostnameEndpoint: Schema.decodeTo<
  Schema.Struct<{
    readonly host: Schema.String
    readonly natPort: Schema.brand<Schema.Int, "Port">
    readonly listenPort: Schema.brand<Schema.Int, "Port">
  }>,
  Schema.Union<
    readonly [
      Schema.Struct<{ readonly host: Schema.String; readonly port: Schema.Number }>,
      Schema.Struct<{
        readonly host: Schema.String
        readonly natPort: Schema.Number
        readonly listenPort: Schema.Number
      }>,
      Schema.TemplateLiteral<readonly [Schema.String, Schema.Literal<":">, Schema.Number]>,
      Schema.TemplateLiteral<
        readonly [Schema.String, Schema.Literal<":">, Schema.Number, Schema.Literal<":">, Schema.Number]
      >
    ]
  >,
  never,
  never
>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/InternetSchemas.ts#L190)

Since v1.0.0

## HostnameIPv4SetupData

A wireguard setup data, which consists of an endpoint followed by an address.

**See**

- `IPv4`
- `HostnameEndpoint`

**Signature**

```ts
declare const HostnameIPv4SetupData: Schema.Tuple<
  readonly [
    Schema.decodeTo<
      Schema.Struct<{
        readonly host: Schema.String
        readonly natPort: Schema.brand<Schema.Int, "Port">
        readonly listenPort: Schema.brand<Schema.Int, "Port">
      }>,
      Schema.Union<
        readonly [
          Schema.Struct<{ readonly host: Schema.String; readonly port: Schema.Number }>,
          Schema.Struct<{
            readonly host: Schema.String
            readonly natPort: Schema.Number
            readonly listenPort: Schema.Number
          }>,
          Schema.TemplateLiteral<readonly [Schema.String, Schema.Literal<":">, Schema.Number]>,
          Schema.TemplateLiteral<
            readonly [Schema.String, Schema.Literal<":">, Schema.Number, Schema.Literal<":">, Schema.Number]
          >
        ]
      >,
      never,
      never
    >,
    Schema.decodeTo<
      Schema.Struct<{ readonly family: Schema.Literal<"ipv4">; readonly ip: Schema.brand<Schema.String, "IPv4"> }>,
      Schema.String,
      never,
      never
    >
  ]
>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/InternetSchemas.ts#L318)

Since v1.0.0

## HostnameIPv6SetupData

A wireguard setup data, which consists of an endpoint followed by an address.

**See**

- `IPv6`
- `HostnameEndpoint`

**Signature**

```ts
declare const HostnameIPv6SetupData: Schema.Tuple<
  readonly [
    Schema.decodeTo<
      Schema.Struct<{
        readonly host: Schema.String
        readonly natPort: Schema.brand<Schema.Int, "Port">
        readonly listenPort: Schema.brand<Schema.Int, "Port">
      }>,
      Schema.Union<
        readonly [
          Schema.Struct<{ readonly host: Schema.String; readonly port: Schema.Number }>,
          Schema.Struct<{
            readonly host: Schema.String
            readonly natPort: Schema.Number
            readonly listenPort: Schema.Number
          }>,
          Schema.TemplateLiteral<readonly [Schema.String, Schema.Literal<":">, Schema.Number]>,
          Schema.TemplateLiteral<
            readonly [Schema.String, Schema.Literal<":">, Schema.Number, Schema.Literal<":">, Schema.Number]
          >
        ]
      >,
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
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/InternetSchemas.ts#L331)

Since v1.0.0

## IPv4Endpoint

An IPv4 wireguard endpoint, which consists of an IPv4 address followed by a
nat port then an optional local port. If only one port is provided, it is
assumed that the nat port and listen port are the same.

**Example**

````ts

    import * as assert from "node:assert";

    import * as Schema from "effect/Schema";
    import { IPv4Endpoint } from "the-wireguard-effect/InternetSchemas";

    const decodeEndpoint = Schema.decodeSync(IPv4Endpoint);
    const endpoint1 = decodeEndpoint("1.2.3.4:51820");
    const endpoint2 = decodeEndpoint("1.2.3.4:51820:41820");

    const endpoint3 = decodeEndpoint({
        ip: "1.2.3.4",
        port: 51820,
        family: "ipv4",
    });

    const endpoint4 = decodeEndpoint({
        ip: "1.2.3.4",
        natPort: 51820,
        listenPort: 41820,
        family: "ipv4",
    });
    ```;

**Signature**

```ts
declare const IPv4Endpoint: Schema.decodeTo<Schema.Struct<{ readonly address: Schema.decodeTo<Schema.Struct<{ readonly family: Schema.Literal<"ipv4">; readonly ip: Schema.brand<Schema.String, "IPv4">; }>, Schema.String, never, never>; readonly natPort: Schema.brand<Schema.Int, "Port">; readonly listenPort: Schema.brand<Schema.Int, "Port">; }>, Schema.Union<readonly [Schema.Struct<{ readonly ip: Schema.String; readonly port: Schema.Number; readonly family: Schema.Literal<"ipv4">; }>, Schema.Struct<{ readonly ip: Schema.String; readonly natPort: Schema.Number; readonly listenPort: Schema.Number; readonly family: Schema.Literal<"ipv4">; }>, Schema.TemplateLiteral<readonly [Schema.String, Schema.Literal<":">, Schema.Number]>, Schema.TemplateLiteral<readonly [Schema.String, Schema.Literal<":">, Schema.Number, Schema.Literal<":">, Schema.Number]>]>, never, never>
````

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/InternetSchemas.ts#L62)

Since v1.0.0

## IPv4SetupData

A wireguard setup data, which consists of an endpoint followed by an address.

**Example**

````ts
import * as Schema from "effect/Schema";
    import { SetupData } from "the-wireguard-effect/InternetSchemas";

    const decodeSetupData = Schema.decodeSync(SetupData);
    const setupData = decodeSetupData(["1.1.1.1:51280", "10.0.0.1"]);
    ```;
````

**Signature**

```ts
declare const IPv4SetupData: Schema.Tuple<
  readonly [
    Schema.decodeTo<
      Schema.Struct<{
        readonly address: Schema.decodeTo<
          Schema.Struct<{ readonly family: Schema.Literal<"ipv4">; readonly ip: Schema.brand<Schema.String, "IPv4"> }>,
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
            readonly port: Schema.Number
            readonly family: Schema.Literal<"ipv4">
          }>,
          Schema.Struct<{
            readonly ip: Schema.String
            readonly natPort: Schema.Number
            readonly listenPort: Schema.Number
            readonly family: Schema.Literal<"ipv4">
          }>,
          Schema.TemplateLiteral<readonly [Schema.String, Schema.Literal<":">, Schema.Number]>,
          Schema.TemplateLiteral<
            readonly [Schema.String, Schema.Literal<":">, Schema.Number, Schema.Literal<":">, Schema.Number]
          >
        ]
      >,
      never,
      never
    >,
    Schema.decodeTo<
      Schema.Struct<{ readonly family: Schema.Literal<"ipv4">; readonly ip: Schema.brand<Schema.String, "IPv4"> }>,
      Schema.String,
      never,
      never
    >
  ]
>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/InternetSchemas.ts#L287)

Since v1.0.0

## IPv6Endpoint

An IPv6 wireguard endpoint, which consists of an IPv6 address in square
brackets followed by a nat port then an optional local port. If only one port
is provided, it is assumed that the nat port and listen port are the same.

**Example**

````ts

    import * as assert from "node:assert";

    import * as Schema from "effect/Schema";
    import { IPv6Endpoint } from "the-wireguard-effect/InternetSchemas";

    const decodeEndpoint = Schema.decodeSync(IPv6Endpoint);
    const endpoint1 = decodeEndpoint(
        "[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820"
    );
    const endpoint2 = decodeEndpoint(
        "[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820:41820"
    );

    const endpoint3 = decodeEndpoint({
        ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
        port: 51820,
        family: "ipv6",
    });

    const endpoint4 = decodeEndpoint({
        ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
        natPort: 51820,
        listenPort: 41820,
        family: "ipv6",
    });
    ```;

**Signature**

```ts
declare const IPv6Endpoint: Schema.decodeTo<Schema.Struct<{ readonly address: Schema.decodeTo<Schema.Struct<{ readonly family: Schema.Literal<"ipv6">; readonly ip: Schema.brand<Schema.String, "IPv6">; }>, Schema.String, never, never>; readonly natPort: Schema.brand<Schema.Int, "Port">; readonly listenPort: Schema.brand<Schema.Int, "Port">; }>, Schema.Union<readonly [Schema.Struct<{ readonly ip: Schema.String; readonly port: Schema.Number; readonly family: Schema.Literal<"ipv6">; }>, Schema.Struct<{ readonly ip: Schema.String; readonly natPort: Schema.Number; readonly listenPort: Schema.Number; readonly family: Schema.Literal<"ipv6">; }>, Schema.TemplateLiteral<readonly [Schema.Literal<"[">, Schema.String, Schema.Literal<"]">, Schema.Literal<":">, Schema.Number]>, Schema.TemplateLiteral<readonly [Schema.Literal<"[">, Schema.String, Schema.Literal<"]">, Schema.Literal<":">, Schema.Number, Schema.Literal<":">, Schema.Number]>]>, never, never>
````

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/InternetSchemas.ts#L132)

Since v1.0.0

## IPv6SetupData

A wireguard setup data, which consists of an endpoint followed by an address.

**Example**

````ts
import * as Schema from "effect/Schema";
    import { SetupData } from "the-wireguard-effect/InternetSchemas";

    const decodeSetupData = Schema.decodeSync(SetupData);
    const setupData = decodeSetupData(["1.1.1.1:51280", "10.0.0.1"]);
    ```;
````

**Signature**

```ts
declare const IPv6SetupData: Schema.Tuple<
  readonly [
    Schema.decodeTo<
      Schema.Struct<{
        readonly address: Schema.decodeTo<
          Schema.Struct<{ readonly family: Schema.Literal<"ipv6">; readonly ip: Schema.brand<Schema.String, "IPv6"> }>,
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
            readonly port: Schema.Number
            readonly family: Schema.Literal<"ipv6">
          }>,
          Schema.Struct<{
            readonly ip: Schema.String
            readonly natPort: Schema.Number
            readonly listenPort: Schema.Number
            readonly family: Schema.Literal<"ipv6">
          }>,
          Schema.TemplateLiteral<
            readonly [Schema.Literal<"[">, Schema.String, Schema.Literal<"]">, Schema.Literal<":">, Schema.Number]
          >,
          Schema.TemplateLiteral<
            readonly [
              Schema.Literal<"[">,
              Schema.String,
              Schema.Literal<"]">,
              Schema.Literal<":">,
              Schema.Number,
              Schema.Literal<":">,
              Schema.Number
            ]
          >
        ]
      >,
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
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/InternetSchemas.ts#L305)

Since v1.0.0

## SetupData

A wireguard setup data, which consists of an endpoint followed by an address.

**Example**

````ts

    import * as assert from "node:assert";

    import * as Schema from "effect/Schema";
    import { SetupData } from "the-wireguard-effect/InternetSchemas";

    const decodeSetupData = Schema.decodeSync(SetupData);
    const setupData = decodeSetupData(["1.1.1.1:51280", "10.0.0.1"]);
    ```;

**See**

- `Address`
- `Endpoint`

**Signature**

```ts
declare const SetupData: Schema.Union<readonly [Schema.Tuple<readonly [Schema.decodeTo<Schema.Struct<{ readonly address: Schema.decodeTo<Schema.Struct<{ readonly family: Schema.Literal<"ipv4">; readonly ip: Schema.brand<Schema.String, "IPv4">; }>, Schema.String, never, never>; readonly natPort: Schema.brand<Schema.Int, "Port">; readonly listenPort: Schema.brand<Schema.Int, "Port">; }>, Schema.Union<readonly [Schema.Struct<{ readonly ip: Schema.String; readonly port: Schema.Number; readonly family: Schema.Literal<"ipv4">; }>, Schema.Struct<{ readonly ip: Schema.String; readonly natPort: Schema.Number; readonly listenPort: Schema.Number; readonly family: Schema.Literal<"ipv4">; }>, Schema.TemplateLiteral<readonly [Schema.String, Schema.Literal<":">, Schema.Number]>, Schema.TemplateLiteral<readonly [Schema.String, Schema.Literal<":">, Schema.Number, Schema.Literal<":">, Schema.Number]>]>, never, never>, Schema.decodeTo<Schema.Struct<{ readonly family: Schema.Literal<"ipv4">; readonly ip: Schema.brand<Schema.String, "IPv4">; }>, Schema.String, never, never>]>, Schema.Tuple<readonly [Schema.decodeTo<Schema.Struct<{ readonly address: Schema.decodeTo<Schema.Struct<{ readonly family: Schema.Literal<"ipv6">; readonly ip: Schema.brand<Schema.String, "IPv6">; }>, Schema.String, never, never>; readonly natPort: Schema.brand<Schema.Int, "Port">; readonly listenPort: Schema.brand<Schema.Int, "Port">; }>, Schema.Union<readonly [Schema.Struct<{ readonly ip: Schema.String; readonly port: Schema.Number; readonly family: Schema.Literal<"ipv6">; }>, Schema.Struct<{ readonly ip: Schema.String; readonly natPort: Schema.Number; readonly listenPort: Schema.Number; readonly family: Schema.Literal<"ipv6">; }>, Schema.TemplateLiteral<readonly [Schema.Literal<"[">, Schema.String, Schema.Literal<"]">, Schema.Literal<":">, Schema.Number]>, Schema.TemplateLiteral<readonly [Schema.Literal<"[">, Schema.String, Schema.Literal<"]">, Schema.Literal<":">, Schema.Number, Schema.Literal<":">, Schema.Number]>]>, never, never>, Schema.decodeTo<Schema.Struct<{ readonly family: Schema.Literal<"ipv6">; readonly ip: Schema.brand<Schema.String, "IPv6">; }>, Schema.String, never, never>]>, Schema.Tuple<readonly [Schema.decodeTo<Schema.Struct<{ readonly host: Schema.String; readonly natPort: Schema.brand<Schema.Int, "Port">; readonly listenPort: Schema.brand<Schema.Int, "Port">; }>, Schema.Union<readonly [Schema.Struct<{ readonly host: Schema.String; readonly port: Schema.Number; }>, Schema.Struct<{ readonly host: Schema.String; readonly natPort: Schema.Number; readonly listenPort: Schema.Number; }>, Schema.TemplateLiteral<readonly [Schema.String, Schema.Literal<":">, Schema.Number]>, Schema.TemplateLiteral<readonly [Schema.String, Schema.Literal<":">, Schema.Number, Schema.Literal<":">, Schema.Number]>]>, never, never>, Schema.decodeTo<Schema.Struct<{ readonly family: Schema.Literal<"ipv4">; readonly ip: Schema.brand<Schema.String, "IPv4">; }>, Schema.String, never, never>]>, Schema.Tuple<readonly [Schema.decodeTo<Schema.Struct<{ readonly host: Schema.String; readonly natPort: Schema.brand<Schema.Int, "Port">; readonly listenPort: Schema.brand<Schema.Int, "Port">; }>, Schema.Union<readonly [Schema.Struct<{ readonly host: Schema.String; readonly port: Schema.Number; }>, Schema.Struct<{ readonly host: Schema.String; readonly natPort: Schema.Number; readonly listenPort: Schema.Number; }>, Schema.TemplateLiteral<readonly [Schema.String, Schema.Literal<":">, Schema.Number]>, Schema.TemplateLiteral<readonly [Schema.String, Schema.Literal<":">, Schema.Number, Schema.Literal<":">, Schema.Number]>]>, never, never>, Schema.decodeTo<Schema.Struct<{ readonly family: Schema.Literal<"ipv6">; readonly ip: Schema.brand<Schema.String, "IPv6">; }>, Schema.String, never, never>]>]>
````

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/InternetSchemas.ts#L356)

Since v1.0.0
