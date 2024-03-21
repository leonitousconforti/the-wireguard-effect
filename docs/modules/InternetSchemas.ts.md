---
title: InternetSchemas.ts
nav_order: 2
parent: Modules
---

## InternetSchemas overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Datatypes](#datatypes)
  - [Address](#address)
  - [BigintFromAddress](#bigintfromaddress)
  - [CidrBlock](#cidrblock)
  - [Endpoint](#endpoint)
  - [IPv4](#ipv4)
  - [IPv4Bigint](#ipv4bigint)
  - [IPv4CidrMask](#ipv4cidrmask)
  - [IPv4Endpoint](#ipv4endpoint)
  - [IPv6](#ipv6)
  - [IPv6Bigint](#ipv6bigint)
  - [IPv6CidrMask](#ipv6cidrmask)
  - [IPv6Endpoint](#ipv6endpoint)
  - [Port](#port)
  - [SetupData](#setupdata)
- [utils](#utils)
  - [Address (type alias)](#address-type-alias)
  - [BigintFromAddress (type alias)](#bigintfromaddress-type-alias)
  - [CidrBlock (type alias)](#cidrblock-type-alias)
  - [CidrBlockEncoded (type alias)](#cidrblockencoded-type-alias)
  - [Endpoint (type alias)](#endpoint-type-alias)
  - [EndpointEncoded (type alias)](#endpointencoded-type-alias)
  - [IPv4 (type alias)](#ipv4-type-alias)
  - [IPv4Bigint (type alias)](#ipv4bigint-type-alias)
  - [IPv4CidrMask (type alias)](#ipv4cidrmask-type-alias)
  - [IPv4Endpoint (type alias)](#ipv4endpoint-type-alias)
  - [IPv4EndpointEncoded (type alias)](#ipv4endpointencoded-type-alias)
  - [IPv6 (type alias)](#ipv6-type-alias)
  - [IPv6Bigint (type alias)](#ipv6bigint-type-alias)
  - [IPv6CidrMask (type alias)](#ipv6cidrmask-type-alias)
  - [IPv6Endpoint (type alias)](#ipv6endpoint-type-alias)
  - [IPv6EndpointEncoded (type alias)](#ipv6endpointencoded-type-alias)
  - [Port (type alias)](#port-type-alias)
  - [SetupData (type alias)](#setupdata-type-alias)
  - [SetupDataEncoded (type alias)](#setupdataencoded-type-alias)

---

# Datatypes

## Address

An IP address, which is either an IPv4 or IPv6 address.

**Signature**

```ts
export declare const Address: Schema.brand<
  Schema.union<
    [
      Schema.brand<Schema.Schema<string, string, never>, "IPv4">,
      Schema.brand<Schema.Schema<string, string, never>, "IPv6">
    ]
  >,
  "Address"
>
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

## BigintFromAddress

An IP address as a bigint, helpful for some cidr and subnet related calculations.

**Signature**

```ts
export declare const BigintFromAddress: Schema.union<
  [
    Schema.transformOrFail<
      Schema.brand<Schema.Schema<string, string, never>, "IPv4">,
      Schema.struct<{ value: Schema.bigintFromSelf; family: Schema.literal<["ipv4"]> }>,
      never
    >,
    Schema.transformOrFail<
      Schema.brand<Schema.Schema<string, string, never>, "IPv6">,
      Schema.struct<{ value: Schema.bigintFromSelf; family: Schema.literal<["ipv6"]> }>,
      never
    >
  ]
>
```

**Example**

```ts
import * as Schema from "@effect/schema/Schema"

import { Address, BigintFromAddress } from "the-wireguard-effect/InternetSchemas"
const address1 = Schema.decode(BigintFromAddress)(Address("1.1.1.1"))
const address2 = Schema.decode(BigintFromAddress)(Address("2001:0db8:85a3:0000:0000:8a2e:0370:7334"))
```

Added in v1.0.0

## CidrBlock

A cidr block, which is an IP address followed by a slash and then a subnet mask.

**Signature**

```ts
export declare const CidrBlock: Schema.brand<
  Schema.transformOrFail<
    Schema.union<
      [
        Schema.struct<{
          ipv4: Schema.brand<Schema.Schema<string, string, never>, "IPv4">
          mask: Schema.brand<Schema.Schema<number, number, never>, "IPv4CidrMask">
        }>,
        Schema.struct<{
          ipv6: Schema.brand<Schema.Schema<string, string, never>, "IPv6">
          mask: Schema.brand<Schema.Schema<number, number, never>, "IPv6CidrMask">
        }>,
        Schema.Schema<`${string}/${number}`, `${string}/${number}`, never>
      ]
    >,
    Schema.union<[typeof IPv4CidrBlock, typeof IPv6CidrBlock]>,
    never
  >,
  "CidrBlock"
>
```

**Example**

```ts
import * as Schema from "@effect/schema/Schema"

import { CidrBlock, IPv4, IPv4CidrMask, IPv6, IPv6CidrMask } from "the-wireguard-effect/InternetSchemas"

const block1 = Schema.decode(CidrBlock)("192.168.1.1/24")
const block2 = Schema.decode(CidrBlock)("2001:0db8:85a3:0000:0000:8a2e:0370:7334/64")
```

Added in v1.0.0

## Endpoint

A wireguard endpoint, which is either an IPv4 or IPv6 endpoint.

**Signature**

```ts
export declare const Endpoint: Schema.brand<
  Schema.union<
    [
      Schema.brand<
        Schema.transformOrFail<
          Schema.union<
            [
              Schema.struct<{
                ip: Schema.brand<Schema.Schema<string, string, never>, "IPv4">
                port: Schema.brand<Schema.Schema<number, number, never>, "Port">
              }>,
              Schema.struct<{
                ip: Schema.brand<Schema.Schema<string, string, never>, "IPv4">
                natPort: Schema.brand<Schema.Schema<number, number, never>, "Port">
                listenPort: Schema.brand<Schema.Schema<number, number, never>, "Port">
              }>,
              Schema.Schema<`${string}:${number}`, `${string}:${number}`, never>,
              Schema.Schema<`${string}:${number}:${number}`, `${string}:${number}:${number}`, never>
            ]
          >,
          Schema.struct<{
            ip: Schema.brand<Schema.Schema<string, string, never>, "IPv4">
            natPort: Schema.brand<Schema.Schema<number, number, never>, "Port">
            listenPort: Schema.brand<Schema.Schema<number, number, never>, "Port">
          }>,
          never
        >,
        "IPv4Endpoint"
      >,
      Schema.brand<
        Schema.transformOrFail<
          Schema.union<
            [
              Schema.struct<{
                ip: Schema.brand<Schema.Schema<string, string, never>, "IPv6">
                port: Schema.brand<Schema.Schema<number, number, never>, "Port">
              }>,
              Schema.struct<{
                ip: Schema.brand<Schema.Schema<string, string, never>, "IPv6">
                natPort: Schema.brand<Schema.Schema<number, number, never>, "Port">
                listenPort: Schema.brand<Schema.Schema<number, number, never>, "Port">
              }>,
              Schema.Schema<`[${string}]:${number}`, `[${string}]:${number}`, never>,
              Schema.Schema<`[${string}]:${number}:${number}`, `[${string}]:${number}:${number}`, never>
            ]
          >,
          Schema.struct<{
            ip: Schema.brand<Schema.Schema<string, string, never>, "IPv6">
            natPort: Schema.brand<Schema.Schema<number, number, never>, "Port">
            listenPort: Schema.brand<Schema.Schema<number, number, never>, "Port">
          }>,
          never
        >,
        "IPv6Endpoint"
      >
    ]
  >,
  "Endpoint"
>
```

**Example**

```ts
import * as Schema from "@effect/schema/Schema"
import { Endpoint, IPv4, IPv6, Port } from "the-wireguard-effect/InternetSchemas"

const endpoint1 = Schema.decode(Endpoint)("1.2.3.4:51820")
const endpoint2 = Schema.decode(Endpoint)("1.2.3.4:51820:41820")

const endpoint3 = Schema.decode(Endpoint)({
  ip: "1.2.3.4",
  port: 51820
})

const endpoint4: Endpoint = Endpoint({
  ip: IPv4("1.2.3.4"),
  natPort: Port(51820),
  listenPort: Port(41820)
})

const endpoint5 = Schema.decode(Endpoint)("[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820")
const endpoint6 = Schema.decode(Endpoint)("[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820:41820")

const endpoint7 = Schema.decode(Endpoint)({
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

## IPv4

An IPv4 address.

**Signature**

```ts
export declare const IPv4: Schema.brand<Schema.Schema<string, string, never>, "IPv4">
```

**Example**

```ts
import * as Schema from "@effect/schema/Schema"
import { IPv4 } from "the-wireguard-effect/InternetSchemas"

const ipv4: IPv4 = IPv4("1.1.1.1")

const decodeIPv4 = Schema.decodeSync(IPv4)
assert.throws(() => decodeIPv4("1.1.a.1"))
assert.doesNotThrow(() => decodeIPv4("1.1.1.1"))
```

Added in v1.0.0

## IPv4Bigint

An IPv4 address as a bigint, helpful for some cidr and subnet related calculations.

**Signature**

```ts
export declare const IPv4Bigint: Schema.transformOrFail<
  Schema.brand<Schema.Schema<string, string, never>, "IPv4">,
  Schema.struct<{ value: Schema.bigintFromSelf; family: Schema.literal<["ipv4"]> }>,
  never
>
```

**Example**

```ts
import * as Schema from "@effect/schema/Schema"
import { Address, IPv4Bigint } from "the-wireguard-effect/InternetSchemas"

const address1 = Schema.decode(IPv4Bigint)(Address("1.1.1.1"))
```

Added in v1.0.0

## IPv4CidrMask

An ipv4 cidr mask, which is a number between 0 and 32.

**Signature**

```ts
export declare const IPv4CidrMask: Schema.brand<Schema.Schema<number, number, never>, "IPv4CidrMask">
```

**Example**

```ts
import { IPv4CidrMask } from "the-wireguard-effect/InternetSchemas"

const mask: IPv4CidrMask = IPv4CidrMask(24)
```

Added in v1.0.0

## IPv4Endpoint

An IPv4 wireguard endpoint, which consists of an IPv4 address followed by a
nat port then an optional local port. If only one port is provided, it is
assumed that the nat port and listen port are the same.

**Signature**

```ts
export declare const IPv4Endpoint: Schema.brand<
  Schema.transformOrFail<
    Schema.union<
      [
        Schema.struct<{
          ip: Schema.brand<Schema.Schema<string, string, never>, "IPv4">
          port: Schema.brand<Schema.Schema<number, number, never>, "Port">
        }>,
        Schema.struct<{
          ip: Schema.brand<Schema.Schema<string, string, never>, "IPv4">
          natPort: Schema.brand<Schema.Schema<number, number, never>, "Port">
          listenPort: Schema.brand<Schema.Schema<number, number, never>, "Port">
        }>,
        Schema.Schema<`${string}:${number}`, `${string}:${number}`, never>,
        Schema.Schema<`${string}:${number}:${number}`, `${string}:${number}:${number}`, never>
      ]
    >,
    Schema.struct<{
      ip: Schema.brand<Schema.Schema<string, string, never>, "IPv4">
      natPort: Schema.brand<Schema.Schema<number, number, never>, "Port">
      listenPort: Schema.brand<Schema.Schema<number, number, never>, "Port">
    }>,
    never
  >,
  "IPv4Endpoint"
>
```

**Example**

```ts
import * as Schema from "@effect/schema/Schema"

import { Port, IPv4, IPv4Endpoint } from "the-wireguard-effect/InternetSchemas"

const endpoint1 = Schema.decode(IPv4Endpoint)("1.2.3.4:51820")
const endpoint2 = Schema.decode(IPv4Endpoint)("1.2.3.4:51820:41820")

const endpoint3 = Schema.decode(IPv4Endpoint)({
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

## IPv6

An IPv6 address.

**Signature**

```ts
export declare const IPv6: Schema.brand<Schema.Schema<string, string, never>, "IPv6">
```

**Example**

```ts
import * as Schema from "@effect/schema/Schema"
import { IPv6 } from "the-wireguard-effect/InternetSchemas"

const ipv6: IPv6 = IPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334")

const decodeIPv6 = Schema.decodeSync(IPv6)
assert.throws(() => decodeIPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334:"))
assert.doesNotThrow(() => decodeIPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334"))
```

Added in v1.0.0

## IPv6Bigint

An IPv6 address as a bigint, helpful for some cidr and subnet related calculations.

**Signature**

```ts
export declare const IPv6Bigint: Schema.transformOrFail<
  Schema.brand<Schema.Schema<string, string, never>, "IPv6">,
  Schema.struct<{ value: Schema.bigintFromSelf; family: Schema.literal<["ipv6"]> }>,
  never
>
```

**Example**

```ts
import * as Schema from "@effect/schema/Schema"

import { Address, IPv6Bigint } from "the-wireguard-effect/InternetSchemas"
const address1 = Schema.decode(IPv6Bigint)(Address("2001:0db8:85a3:0000:0000:8a2e:0370:7334"))
```

Added in v1.0.0

## IPv6CidrMask

An ipv6 cidr mask, which is a number between 0 and 128.

**Signature**

```ts
export declare const IPv6CidrMask: Schema.brand<Schema.Schema<number, number, never>, "IPv6CidrMask">
```

**Example**

```ts
import { IPv6CidrMask } from "the-wireguard-effect/InternetSchemas"

const mask: IPv6CidrMask = IPv6CidrMask(64)
```

Added in v1.0.0

## IPv6Endpoint

An IPv6 wireguard endpoint, which consists of an IPv6 address in square
brackets followed by a nat port then an optional local port. If only one
port is provided, it is assumed that the nat port and listen port are the
same.

**Signature**

```ts
export declare const IPv6Endpoint: Schema.brand<
  Schema.transformOrFail<
    Schema.union<
      [
        Schema.struct<{
          ip: Schema.brand<Schema.Schema<string, string, never>, "IPv6">
          port: Schema.brand<Schema.Schema<number, number, never>, "Port">
        }>,
        Schema.struct<{
          ip: Schema.brand<Schema.Schema<string, string, never>, "IPv6">
          natPort: Schema.brand<Schema.Schema<number, number, never>, "Port">
          listenPort: Schema.brand<Schema.Schema<number, number, never>, "Port">
        }>,
        Schema.Schema<`[${string}]:${number}`, `[${string}]:${number}`, never>,
        Schema.Schema<`[${string}]:${number}:${number}`, `[${string}]:${number}:${number}`, never>
      ]
    >,
    Schema.struct<{
      ip: Schema.brand<Schema.Schema<string, string, never>, "IPv6">
      natPort: Schema.brand<Schema.Schema<number, number, never>, "Port">
      listenPort: Schema.brand<Schema.Schema<number, number, never>, "Port">
    }>,
    never
  >,
  "IPv6Endpoint"
>
```

**Example**

```ts
import * as Schema from "@effect/schema/Schema"

import { Port, IPv6, IPv6Endpoint } from "the-wireguard-effect/InternetSchemas"

const endpoint1 = Schema.decode(IPv6Endpoint)("[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820")
const endpoint2 = Schema.decode(IPv6Endpoint)("[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820:41820")

const endpoint3 = Schema.decode(IPv6Endpoint)({
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

## Port

An operating system port number.

**Signature**

```ts
export declare const Port: Schema.brand<Schema.Schema<number, number, never>, "Port">
```

**Example**

```ts
import * as Schema from "@effect/schema/Schema"
import { Port } from "the-wireguard-effect/InternetSchemas"

const port: Port = Port(8080)

const decodePort = Schema.decodeSync(Port)
assert.throws(() => decodePort(65536))
assert.doesNotThrow(() => decodePort(8080))
```

Added in v1.0.0

## SetupData

A wireguard setup data, which consists of an endpoint followed by an address.

**Signature**

```ts
export declare const SetupData: Schema.brand<
  Schema.tuple<
    [
      Schema.brand<
        Schema.union<
          [
            Schema.brand<
              Schema.transformOrFail<
                Schema.union<
                  [
                    Schema.struct<{
                      ip: Schema.brand<Schema.Schema<string, string, never>, "IPv4">
                      port: Schema.brand<Schema.Schema<number, number, never>, "Port">
                    }>,
                    Schema.struct<{
                      ip: Schema.brand<Schema.Schema<string, string, never>, "IPv4">
                      natPort: Schema.brand<Schema.Schema<number, number, never>, "Port">
                      listenPort: Schema.brand<Schema.Schema<number, number, never>, "Port">
                    }>,
                    Schema.Schema<`${string}:${number}`, `${string}:${number}`, never>,
                    Schema.Schema<`${string}:${number}:${number}`, `${string}:${number}:${number}`, never>
                  ]
                >,
                Schema.struct<{
                  ip: Schema.brand<Schema.Schema<string, string, never>, "IPv4">
                  natPort: Schema.brand<Schema.Schema<number, number, never>, "Port">
                  listenPort: Schema.brand<Schema.Schema<number, number, never>, "Port">
                }>,
                never
              >,
              "IPv4Endpoint"
            >,
            Schema.brand<
              Schema.transformOrFail<
                Schema.union<
                  [
                    Schema.struct<{
                      ip: Schema.brand<Schema.Schema<string, string, never>, "IPv6">
                      port: Schema.brand<Schema.Schema<number, number, never>, "Port">
                    }>,
                    Schema.struct<{
                      ip: Schema.brand<Schema.Schema<string, string, never>, "IPv6">
                      natPort: Schema.brand<Schema.Schema<number, number, never>, "Port">
                      listenPort: Schema.brand<Schema.Schema<number, number, never>, "Port">
                    }>,
                    Schema.Schema<`[${string}]:${number}`, `[${string}]:${number}`, never>,
                    Schema.Schema<`[${string}]:${number}:${number}`, `[${string}]:${number}:${number}`, never>
                  ]
                >,
                Schema.struct<{
                  ip: Schema.brand<Schema.Schema<string, string, never>, "IPv6">
                  natPort: Schema.brand<Schema.Schema<number, number, never>, "Port">
                  listenPort: Schema.brand<Schema.Schema<number, number, never>, "Port">
                }>,
                never
              >,
              "IPv6Endpoint"
            >
          ]
        >,
        "Endpoint"
      >,
      Schema.brand<
        Schema.union<
          [
            Schema.brand<Schema.Schema<string, string, never>, "IPv4">,
            Schema.brand<Schema.Schema<string, string, never>, "IPv6">
          ]
        >,
        "Address"
      >
    ]
  >,
  "SetupData"
>
```

**Example**

```ts
import * as Schema from "@effect/schema/Schema"

import { Address, Endpoint, SetupData } from "the-wireguard-effect/InternetSchemas"

const setupData1 = Schema.decode(SetupData)(["1.1.1.1:51280", "10.0.0.1"])

const address = Schema.decodeSync(Address)("10.0.0.1")
const endpoint = Schema.decodeSync(Endpoint)("1.1.1.1:51820")
const setupData2: SetupData = SetupData([endpoint, address])
```

Added in v1.0.0

# utils

## Address (type alias)

**Signature**

```ts
export type Address = Schema.Schema.Type<typeof Address>
```

Added in v1.0.0

## BigintFromAddress (type alias)

**Signature**

```ts
export type BigintFromAddress = Schema.Schema.Type<typeof BigintFromAddress>
```

Added in v1.0.0

## CidrBlock (type alias)

**Signature**

```ts
export type CidrBlock = Schema.Schema.Type<typeof CidrBlock>
```

Added in v1.0.0

## CidrBlockEncoded (type alias)

**Signature**

```ts
export type CidrBlockEncoded = Schema.Schema.Encoded<typeof CidrBlock>
```

Added in v1.0.0

## Endpoint (type alias)

**Signature**

```ts
export type Endpoint = Schema.Schema.Type<typeof Endpoint>
```

Added in v1.0.0

## EndpointEncoded (type alias)

**Signature**

```ts
export type EndpointEncoded = Schema.Schema.Encoded<typeof Endpoint>
```

Added in v1.0.0

## IPv4 (type alias)

**Signature**

```ts
export type IPv4 = Schema.Schema.Type<typeof IPv4>
```

Added in v1.0.0

## IPv4Bigint (type alias)

**Signature**

```ts
export type IPv4Bigint = Schema.Schema.Type<typeof IPv4Bigint>
```

Added in v1.0.0

## IPv4CidrMask (type alias)

**Signature**

```ts
export type IPv4CidrMask = Schema.Schema.Type<typeof IPv4CidrMask>
```

Added in v1.0.0

## IPv4Endpoint (type alias)

**Signature**

```ts
export type IPv4Endpoint = Schema.Schema.Type<typeof IPv4Endpoint>
```

Added in v1.0.0

## IPv4EndpointEncoded (type alias)

**Signature**

```ts
export type IPv4EndpointEncoded = Schema.Schema.Encoded<typeof IPv4Endpoint>
```

Added in v1.0.0

## IPv6 (type alias)

**Signature**

```ts
export type IPv6 = Schema.Schema.Type<typeof IPv6>
```

Added in v1.0.0

## IPv6Bigint (type alias)

**Signature**

```ts
export type IPv6Bigint = Schema.Schema.Type<typeof IPv6Bigint>
```

Added in v1.0.0

## IPv6CidrMask (type alias)

**Signature**

```ts
export type IPv6CidrMask = Schema.Schema.Type<typeof IPv6CidrMask>
```

Added in v1.0.0

## IPv6Endpoint (type alias)

**Signature**

```ts
export type IPv6Endpoint = Schema.Schema.Type<typeof IPv6Endpoint>
```

Added in v1.0.0

## IPv6EndpointEncoded (type alias)

**Signature**

```ts
export type IPv6EndpointEncoded = Schema.Schema.Encoded<typeof IPv6Endpoint>
```

Added in v1.0.0

## Port (type alias)

**Signature**

```ts
export type Port = Schema.Schema.Type<typeof Port>
```

Added in v1.0.0

## SetupData (type alias)

**Signature**

```ts
export type SetupData = Schema.Schema.Type<typeof SetupData>
```

Added in v1.0.0

## SetupDataEncoded (type alias)

**Signature**

```ts
export type SetupDataEncoded = Schema.Schema.Encoded<typeof SetupData>
```

Added in v1.0.0
