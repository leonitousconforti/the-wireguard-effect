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
  - [DurationFromSeconds (class)](#durationfromseconds-class)
  - [DurationFromSecondsString (class)](#durationfromsecondsstring-class)
  - [Endpoint (class)](#endpoint-class)
  - [HostnameEndpoint (class)](#hostnameendpoint-class)
  - [HostnameIPv4SetupData (class)](#hostnameipv4setupdata-class)
  - [HostnameIPv6SetupData (class)](#hostnameipv6setupdata-class)
  - [IPv4Endpoint (class)](#ipv4endpoint-class)
  - [IPv4SetupData (class)](#ipv4setupdata-class)
  - [IPv6Endpoint (class)](#ipv6endpoint-class)
  - [IPv6SetupData (class)](#ipv6setupdata-class)
  - [SetupData (class)](#setupdata-class)

---

# Schemas

## DurationFromSeconds (class)

Transforms a `number` of seconds into a `Duration`.

**Signature**

```ts
declare class DurationFromSeconds
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/InternetSchemas.ts#L20)

Since v1.0.0

## DurationFromSecondsString (class)

Transforms a `string` of seconds into a `Duration`.

**Signature**

```ts
declare class DurationFromSecondsString
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/InternetSchemas.ts#L34)

Since v1.0.0

## Endpoint (class)

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
declare class Endpoint
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/InternetSchemas.ts#L280)

Since v1.0.0

## HostnameEndpoint (class)

A hostname wireguard endpoint, which consists of a hostname followed by a\
Nat port then an optional local port. If only one port is provided, it is
assumed that the nat port and listen port are the same.

**Signature**

```ts
declare class HostnameEndpoint
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/InternetSchemas.ts#L200)

Since v1.0.0

## HostnameIPv4SetupData (class)

A wireguard setup data, which consists of an endpoint followed by an address.

**See**

- `IPv4`
- `HostnameEndpoint`

**Signature**

```ts
declare class HostnameIPv4SetupData
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/InternetSchemas.ts#L329)

Since v1.0.0

## HostnameIPv6SetupData (class)

A wireguard setup data, which consists of an endpoint followed by an address.

**See**

- `IPv6`
- `HostnameEndpoint`

**Signature**

```ts
declare class HostnameIPv6SetupData
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/InternetSchemas.ts#L342)

Since v1.0.0

## IPv4Endpoint (class)

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
declare class IPv4Endpoint
````

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/InternetSchemas.ts#L74)

Since v1.0.0

## IPv4SetupData (class)

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
declare class IPv4SetupData
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/InternetSchemas.ts#L298)

Since v1.0.0

## IPv6Endpoint (class)

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
declare class IPv6Endpoint
````

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/InternetSchemas.ts#L143)

Since v1.0.0

## IPv6SetupData (class)

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
declare class IPv6SetupData
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/InternetSchemas.ts#L316)

Since v1.0.0

## SetupData (class)

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
declare class SetupData
````

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/InternetSchemas.ts#L367)

Since v1.0.0
