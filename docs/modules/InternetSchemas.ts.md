---
title: InternetSchemas.ts
nav_order: 2
parent: Modules
---

## InternetSchemas overview

Internet schemas for wireguard configuration.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Api interface](#api-interface)
  - [$Address (interface)](#address-interface)
  - [$AddressFromString (interface)](#addressfromstring-interface)
  - [$CidrBlockFromString (interface)](#cidrblockfromstring-interface)
  - [$DurationFromSeconds (interface)](#durationfromseconds-interface)
  - [$Endpoint (interface)](#endpoint-interface)
  - [$IPv4CidrMask (interface)](#ipv4cidrmask-interface)
  - [$IPv4Endpoint (interface)](#ipv4endpoint-interface)
  - [$IPv4FromString (interface)](#ipv4fromstring-interface)
  - [$IPv6CidrMask (interface)](#ipv6cidrmask-interface)
  - [$IPv6Endpoint (interface)](#ipv6endpoint-interface)
  - [$IPv6FromString (interface)](#ipv6fromstring-interface)
  - [$Port (interface)](#port-interface)
  - [$SetupData (interface)](#setupdata-interface)
- [Branded constructors](#branded-constructors)
  - [DurationFromSecondsBrand](#durationfromsecondsbrand)
  - [IPv4CidrMaskBrand](#ipv4cidrmaskbrand)
  - [IPv6CidrMaskBrand](#ipv6cidrmaskbrand)
  - [PortBrand](#portbrand)
- [Branded types](#branded-types)
  - [DurationFromSecondsBrand (type alias)](#durationfromsecondsbrand-type-alias)
  - [IPv4CidrMaskBrand (type alias)](#ipv4cidrmaskbrand-type-alias)
  - [IPv6CidrMaskBrand (type alias)](#ipv6cidrmaskbrand-type-alias)
  - [PortBrand (type alias)](#portbrand-type-alias)
- [Encoded types](#encoded-types)
  - [AddressEncoded (type alias)](#addressencoded-type-alias)
  - [AddressFromStringEncoded (type alias)](#addressfromstringencoded-type-alias)
  - [CidrBlockFromStringEncoded (type alias)](#cidrblockfromstringencoded-type-alias)
  - [EndpointEncoded (type alias)](#endpointencoded-type-alias)
  - [IPv4FromStringEncoded (type alias)](#ipv4fromstringencoded-type-alias)
  - [IPv6FromStringEncoded (type alias)](#ipv6fromstringencoded-type-alias)
  - [SetupDataEncoded (type alias)](#setupdataencoded-type-alias)
- [Schemas](#schemas)
  - [Address](#address)
  - [AddressFromString](#addressfromstring)
  - [CidrBlock (class)](#cidrblock-class)
    - [family (property)](#family-property)
  - [CidrBlockFromString](#cidrblockfromstring)
  - [DurationFromSeconds](#durationfromseconds)
  - [Endpoint](#endpoint)
  - [IPv4 (class)](#ipv4-class)
    - [family (property)](#family-property-1)
  - [IPv4CidrMask](#ipv4cidrmask)
  - [IPv4Endpoint](#ipv4endpoint)
  - [IPv4FromString](#ipv4fromstring)
  - [IPv6 (class)](#ipv6-class)
    - [family (property)](#family-property-2)
  - [IPv6CidrMask](#ipv6cidrmask)
  - [IPv6Endpoint](#ipv6endpoint)
  - [IPv6FromString](#ipv6fromstring)
  - [Port](#port)
  - [SetupData](#setupdata)
- [Unbranded types](#unbranded-types)
  - [Address (type alias)](#address-type-alias)
  - [AddressFromString (type alias)](#addressfromstring-type-alias)
  - [CidrBlockFromString (type alias)](#cidrblockfromstring-type-alias)
  - [Endpoint (type alias)](#endpoint-type-alias)
  - [IPv4FromString (type alias)](#ipv4fromstring-type-alias)
  - [IPv6FromString (type alias)](#ipv6fromstring-type-alias)
  - [SetupData (type alias)](#setupdata-type-alias)

---

# Api interface

## $Address (interface)

**Signature**

```ts
export interface $Address extends Schema.union<[typeof IPv4, typeof IPv6]> {}
```

Added in v1.0.0

## $AddressFromString (interface)

**Signature**

```ts
export interface $AddressFromString extends Schema.union<[typeof IPv4FromString, typeof IPv6FromString]> {}
```

Added in v1.0.0

## $CidrBlockFromString (interface)

**Signature**

```ts
export interface $CidrBlockFromString
  extends Schema.Annotable<$CidrBlockFromString, CidrBlock, `${string}/${number}`, never> {}
```

Added in v1.0.0

## $DurationFromSeconds (interface)

**Signature**

```ts
export interface $DurationFromSeconds
  extends Schema.Annotable<$DurationFromSeconds, DurationFromSecondsBrand, number, never> {}
```

Added in v1.0.0

## $Endpoint (interface)

**Signature**

```ts
export interface $Endpoint extends Schema.union<[$IPv4Endpoint, $IPv6Endpoint]> {}
```

Added in v1.0.0

## $IPv4CidrMask (interface)

**Signature**

```ts
export interface $IPv4CidrMask
  extends Schema.Annotable<$IPv4CidrMask, IPv4CidrMaskBrand, Brand.Brand.Unbranded<IPv4CidrMaskBrand>, never> {}
```

Added in v1.0.0

## $IPv4Endpoint (interface)

**Signature**

```ts
export interface $IPv4Endpoint
  extends Schema.Annotable<
    $IPv4Endpoint,
    { readonly address: IPv4; readonly natPort: PortBrand; readonly listenPort: PortBrand },
    | `${string}:${number}`
    | `${string}:${number}:${number}`
    | { readonly ip: string; readonly port: number }
    | { readonly ip: string; readonly natPort: number; readonly listenPort: number },
    never
  > {}
```

Added in v1.0.0

## $IPv4FromString (interface)

**Signature**

```ts
export interface $IPv4FromString extends Schema.Annotable<$IPv4FromString, IPv4, string, never> {}
```

Added in v1.0.0

## $IPv6CidrMask (interface)

**Signature**

```ts
export interface $IPv6CidrMask
  extends Schema.Annotable<$IPv6CidrMask, IPv6CidrMaskBrand, Brand.Brand.Unbranded<IPv6CidrMaskBrand>, never> {}
```

Added in v1.0.0

## $IPv6Endpoint (interface)

**Signature**

```ts
export interface $IPv6Endpoint
  extends Schema.Annotable<
    $IPv6Endpoint,
    { readonly address: IPv6; readonly natPort: PortBrand; readonly listenPort: PortBrand },
    | `[${string}]:${number}`
    | `[${string}]:${number}:${number}`
    | { readonly ip: string; readonly port: number }
    | { readonly ip: string; readonly natPort: number; readonly listenPort: number },
    never
  > {}
```

Added in v1.0.0

## $IPv6FromString (interface)

**Signature**

```ts
export interface $IPv6FromString extends Schema.Annotable<$IPv6FromString, IPv6, string, never> {}
```

Added in v1.0.0

## $Port (interface)

**Signature**

```ts
export interface $Port extends Schema.Annotable<$Port, PortBrand, Brand.Brand.Unbranded<PortBrand>, never> {}
```

Added in v1.0.0

## $SetupData (interface)

**Signature**

```ts
export interface $SetupData extends Schema.tuple<[$Endpoint, $AddressFromString]> {}
```

Added in v1.0.0

# Branded constructors

## DurationFromSecondsBrand

**Signature**

```ts
export declare const DurationFromSecondsBrand: Brand.Brand.Constructor<DurationFromSecondsBrand>
```

Added in v1.0.0

## IPv4CidrMaskBrand

**Signature**

```ts
export declare const IPv4CidrMaskBrand: Brand.Brand.Constructor<IPv4CidrMaskBrand>
```

Added in v1.0.0

## IPv6CidrMaskBrand

**Signature**

```ts
export declare const IPv6CidrMaskBrand: Brand.Brand.Constructor<IPv6CidrMaskBrand>
```

Added in v1.0.0

## PortBrand

**Signature**

```ts
export declare const PortBrand: Brand.Brand.Constructor<PortBrand>
```

Added in v1.0.0

# Branded types

## DurationFromSecondsBrand (type alias)

**Signature**

```ts
export type DurationFromSecondsBrand = Duration.Duration & Brand.Brand<"DurationFromSeconds">
```

Added in v1.0.0

## IPv4CidrMaskBrand (type alias)

**Signature**

```ts
export type IPv4CidrMaskBrand = number & Brand.Brand<"IPv4CidrMask">
```

Added in v1.0.0

## IPv6CidrMaskBrand (type alias)

**Signature**

```ts
export type IPv6CidrMaskBrand = number & Brand.Brand<"IPv6CidrMask">
```

Added in v1.0.0

## PortBrand (type alias)

**Signature**

```ts
export type PortBrand = number & Brand.Brand<"Port">
```

Added in v1.0.0

# Encoded types

## AddressEncoded (type alias)

**Signature**

```ts
export type AddressEncoded = Schema.Schema.Encoded<typeof Address>
```

Added in v1.0.0

## AddressFromStringEncoded (type alias)

**Signature**

```ts
export type AddressFromStringEncoded = Schema.Schema.Encoded<typeof AddressFromString>
```

Added in v1.0.0

## CidrBlockFromStringEncoded (type alias)

**Signature**

```ts
export type CidrBlockFromStringEncoded = Schema.Schema.Encoded<typeof CidrBlockFromString>
```

Added in v1.0.0

## EndpointEncoded (type alias)

**Signature**

```ts
export type EndpointEncoded = Schema.Schema.Encoded<typeof Endpoint>
```

Added in v1.0.0

## IPv4FromStringEncoded (type alias)

**Signature**

```ts
export type IPv4FromStringEncoded = Schema.Schema.Encoded<typeof IPv4FromString>
```

Added in v1.0.0

## IPv6FromStringEncoded (type alias)

**Signature**

```ts
export type IPv6FromStringEncoded = Schema.Schema.Encoded<typeof IPv6FromString>
```

Added in v1.0.0

## SetupDataEncoded (type alias)

**Signature**

```ts
export type SetupDataEncoded = Schema.Schema.Encoded<typeof SetupData>
```

Added in v1.0.0

# Schemas

## Address

An IP address, which is either an IPv4 or IPv6 address.

**Signature**

```ts
export declare const Address: $Address
```

**Example**

```ts
import * as Schema from "@effect/schema/Schema"
import { Address } from "the-wireguard-effect/InternetSchemas"

const address1: Address = Address("1.1.1.1")
const address2: Address = Address("2001:0db8:85a3:0000:0000:8a2e:0370:7334")

const decodeAddress = Schema.decodeSync(Address)
assert.throws(() => decodeAddress("1.1.b.1"))
assert.throws(() => decodeAddress("2001:0db8:85a3:0000:0000:8a2e:0370:7334:"))
assert.doesNotThrow(() => decodeAddress("1.1.1.2"))
assert.doesNotThrow(() => decodeAddress("2001:0db8:85a3:0000:0000:8a2e:0370:7334"))
```

Added in v1.0.0

## AddressFromString

An IP address, which is either an IPv4 or IPv6 address. This schema
transforms a `string` into an `Address`.

**Signature**

```ts
export declare const AddressFromString: $AddressFromString
```

Added in v1.0.0

## CidrBlock (class)

Internal helper representation of a cidr range so that we can do
transformations to and from it as we cannot represent a stream using

**Signature**

```ts
export declare class CidrBlock
```

Added in v1.0.0

### family (property)

The address family of this cidr block.

**Signature**

```ts
readonly family: "ipv4" | "ipv6"
```

Added in v1.0.0

## CidrBlockFromString

A schema that transforms a `string` into a `CidrBlock`.

**Signature**

```ts
export declare const CidrBlockFromString: $CidrBlockFromString
```

Added in v1.0.0

## DurationFromSeconds

A schema that transforms a `number` tuple into a `Duration`. Treats the value
as the number of seconds.

**Signature**

```ts
export declare const DurationFromSeconds: $DurationFromSeconds
```

Added in v1.0.0

## Endpoint

A wireguard endpoint, which is either an IPv4 or IPv6 endpoint.

**Signature**

```ts
export declare const Endpoint: $Endpoint
```

**Example**

```ts
import * as Schema from "@effect/schema/Schema"

import { Endpoint, IPv4, IPv6, Port } from "the-wireguard-effect/InternetSchemas"

const endpoint1 = Schema.decodeSync(Endpoint)("1.2.3.4:51820")
const endpoint2 = Schema.decodeSync(Endpoint)("1.2.3.4:51820:41820")

const endpoint3 = Schema.decodeSync(Endpoint)({
  ip: "1.2.3.4",
  port: 51820
})

const endpoint4: Endpoint = Endpoint({
  ip: IPv4("1.2.3.4"),
  natPort: Port(51820),
  listenPort: Port(41820)
})

const endpoint5 = Schema.decodeSync(Endpoint)("[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820")
const endpoint6 = Schema.decodeSync(Endpoint)("[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820:41820")

const endpoint7 = Schema.decodeSync(Endpoint)({
  ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
  port: 51820
})

const endpoint8: Endpoint = Endpoint({
  ip: IPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334"),
  natPort: Port(51820),
  listenPort: Port(41820)
})
```

Added in v1.0.0

## IPv4 (class)

An IPv4 address.

**Signature**

```ts
export declare class IPv4
```

**Example**

```ts
import * as Schema from "@effect/schema/Schema"
import { IPv4 } from "the-wireguard-effect/InternetSchemas"

const ipv4: IPv4 = IPv4("1.1.1.1")
assert.strictEqual(ipv4, "1.1.1.1")

const decodeIPv4 = Schema.decodeSync(IPv4)
assert.strictEqual(decodeIPv4("1.1.1.1"), "1.1.1.1")

assert.throws(() => decodeIPv4("1.1.a.1"))
assert.doesNotThrow(() => decodeIPv4("1.1.1.1"))
```

Added in v1.0.0

### family (property)

**Signature**

```ts
readonly family: "ipv4"
```

Added in v1.0.0

## IPv4CidrMask

An ipv4 cidr mask, which is a number between 0 and 32.

**Signature**

```ts
export declare const IPv4CidrMask: $IPv4CidrMask
```

**Example**

```ts
import * as Schema from "@effect/schema/Schema"
import { IPv4CidrMask } from "the-wireguard-effect/InternetSchemas"

const mask: IPv4CidrMask = IPv4CidrMask(24)
assert.strictEqual(mask, 24)

const decodeMask = Schema.decodeSync(IPv4CidrMask)
assert.strictEqual(decodeMask(24), 24)

assert.throws(() => IPv4CidrMask(33))
assert.doesNotThrow(() => IPv4CidrMask(0))
assert.doesNotThrow(() => IPv4CidrMask(32))
```

Added in v1.0.0

## IPv4Endpoint

An IPv4 wireguard endpoint, which consists of an IPv4 address followed by a
nat port then an optional local port. If only one port is provided, it is
assumed that the nat port and listen port are the same.

**Signature**

```ts
export declare const IPv4Endpoint: Schema.transform<
  Schema.union<
    [
      Schema.struct<{ ip: Schema.$string; port: Schema.$number }>,
      Schema.struct<{ ip: Schema.$string; natPort: Schema.$number; listenPort: Schema.$number }>,
      Schema.Schema<`${string}:${number}`, `${string}:${number}`, never>,
      Schema.Schema<`${string}:${number}:${number}`, `${string}:${number}:${number}`, never>
    ]
  >,
  Schema.struct<{ address: $IPv4FromString; natPort: $Port; listenPort: $Port }>
>
```

**Example**

```ts
import * as Schema from "@effect/schema/Schema"

import { Port, IPv4, IPv4Endpoint } from "the-wireguard-effect/InternetSchemas"

const endpoint1 = Schema.decodeSync(IPv4Endpoint)("1.2.3.4:51820")
const endpoint2 = Schema.decodeSync(IPv4Endpoint)("1.2.3.4:51820:41820")

const endpoint3 = Schema.decodeSync(IPv4Endpoint)({
  ip: "1.2.3.4",
  port: 51820
})

const endpoint4: IPv4Endpoint = IPv4Endpoint({
  ip: IPv4("1.2.3.4"),
  natPort: Port(51820),
  listenPort: Port(41820)
})
```

Added in v1.0.0

## IPv4FromString

A schema that transforms a `string` into an `IPv4`.

**Signature**

```ts
export declare const IPv4FromString: $IPv4FromString
```

Added in v1.0.0

## IPv6 (class)

An IPv6 address.

**Signature**

```ts
export declare class IPv6
```

**Example**

```ts
import * as Schema from "@effect/schema/Schema"
import { IPv6 } from "the-wireguard-effect/InternetSchemas"

const ipv6: IPv6 = IPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334")
assert.strictEqual(ipv6, "2001:0db8:85a3:0000:0000:8a2e:0370:7334")

const decodeIPv6 = Schema.decodeSync(IPv6)
assert.deepStrictEqual(decodeIPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334"), "2001:0db8:85a3:0000:0000:8a2e:0370:7334")

assert.throws(() => decodeIPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334:"))
assert.throws(() => decodeIPv6("2001::85a3::0000::0370:7334"))
assert.doesNotThrow(() => decodeIPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334"))
```

Added in v1.0.0

### family (property)

**Signature**

```ts
readonly family: "ipv6"
```

Added in v1.0.0

## IPv6CidrMask

An ipv6 cidr mask, which is a number between 0 and 128.

**Signature**

```ts
export declare const IPv6CidrMask: $IPv6CidrMask
```

**Example**

```ts
import * as Schema from "@effect/schema/Schema"
import { IPv6CidrMask } from "the-wireguard-effect/InternetSchemas"

const mask: IPv6CidrMask = IPv6CidrMask(64)
assert.strictEqual(mask, 64)

const decodeMask = Schema.decodeSync(IPv6CidrMask)
assert.strictEqual(decodeMask(64), 64)

assert.throws(() => IPv6CidrMask(129))
assert.doesNotThrow(() => IPv6CidrMask(0))
assert.doesNotThrow(() => IPv6CidrMask(128))
```

Added in v1.0.0

## IPv6Endpoint

An IPv6 wireguard endpoint, which consists of an IPv6 address in square
brackets followed by a nat port then an optional local port. If only one port
is provided, it is assumed that the nat port and listen port are the same.

**Signature**

```ts
export declare const IPv6Endpoint: $IPv6Endpoint
```

**Example**

```ts
import * as Schema from "@effect/schema/Schema"

import { Port, IPv6, IPv6Endpoint } from "the-wireguard-effect/InternetSchemas"

const endpoint1 = Schema.decodeSync(IPv6Endpoint)("[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820")
const endpoint2 = Schema.decodeSync(IPv6Endpoint)("[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820:41820")

const endpoint3 = Schema.decodeSync(IPv6Endpoint)({
  ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
  port: 51820
})

const endpoint4: IPv6Endpoint = IPv6Endpoint({
  ip: IPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334"),
  natPort: Port(51820),
  listenPort: Port(41820)
})
```

Added in v1.0.0

## IPv6FromString

A schema that transforms a `string` into an `IPv6`.

**Signature**

```ts
export declare const IPv6FromString: $IPv6FromString
```

Added in v1.0.0

## Port

An operating system port number.

**Signature**

```ts
export declare const Port: $Port
```

**Example**

```ts
import * as Schema from "@effect/schema/Schema"
import { Port } from "the-wireguard-effect/InternetSchemas"

const port: Port = Port(8080)
assert.strictEqual(port, 8080)

const decodePort = Schema.decodeSync(Port)
assert.strictEqual(decodePort(8080), 8080)

assert.throws(() => decodePort(65536))
assert.doesNotThrow(() => decodePort(8080))
```

Added in v1.0.0

## SetupData

A wireguard setup data, which consists of an endpoint followed by an address.

**Signature**

```ts
export declare const SetupData: $SetupData
```

**Example**

```ts
import * as Schema from "@effect/schema/Schema"

import { Address, Endpoint, SetupData } from "the-wireguard-effect/InternetSchemas"

const setupData1 = Schema.decodeSync(SetupData)(["1.1.1.1:51280", "10.0.0.1"])

const address = Schema.decodeSync(Address)("10.0.0.1")
const endpoint = Schema.decodeSync(Endpoint)("1.1.1.1:51820")
const setupData2: SetupData = SetupData([endpoint, address])
```

Added in v1.0.0

# Unbranded types

## Address (type alias)

**Signature**

```ts
export type Address = Schema.Schema.Type<typeof Address>
```

Added in v1.0.0

## AddressFromString (type alias)

**Signature**

```ts
export type AddressFromString = Schema.Schema.Type<typeof AddressFromString>
```

Added in v1.0.0

## CidrBlockFromString (type alias)

**Signature**

```ts
export type CidrBlockFromString = Schema.Schema.Type<typeof CidrBlockFromString>
```

Added in v1.0.0

## Endpoint (type alias)

**Signature**

```ts
export type Endpoint = Schema.Schema.Type<typeof Endpoint>
```

Added in v1.0.0

## IPv4FromString (type alias)

**Signature**

```ts
export type IPv4FromString = Schema.Schema.Type<typeof IPv4FromString>
```

Added in v1.0.0

## IPv6FromString (type alias)

**Signature**

```ts
export type IPv6FromString = Schema.Schema.Type<typeof IPv6FromString>
```

Added in v1.0.0

## SetupData (type alias)

**Signature**

```ts
export type SetupData = Schema.Schema.Type<typeof SetupData>
```

Added in v1.0.0
