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
  - [$Address (type alias)](#address-type-alias)
  - [$AddressBigint (type alias)](#addressbigint-type-alias)
  - [$CidrBlock (type alias)](#cidrblock-type-alias)
  - [$CidrBlockFromString (type alias)](#cidrblockfromstring-type-alias)
  - [$Endpoint (type alias)](#endpoint-type-alias)
  - [$Family (type alias)](#family-type-alias)
  - [$HostnameEndpoint (type alias)](#hostnameendpoint-type-alias)
  - [$HostnameIPv4SetupData (type alias)](#hostnameipv4setupdata-type-alias)
  - [$HostnameIPv6SetupData (type alias)](#hostnameipv6setupdata-type-alias)
  - [$IPv4 (type alias)](#ipv4-type-alias)
  - [$IPv4Bigint (type alias)](#ipv4bigint-type-alias)
  - [$IPv4CidrBlock (type alias)](#ipv4cidrblock-type-alias)
  - [$IPv4CidrBlockFromString (type alias)](#ipv4cidrblockfromstring-type-alias)
  - [$IPv4CidrMask (type alias)](#ipv4cidrmask-type-alias)
  - [$IPv4Endpoint (type alias)](#ipv4endpoint-type-alias)
  - [$IPv4Family (type alias)](#ipv4family-type-alias)
  - [$IPv4SetupData (type alias)](#ipv4setupdata-type-alias)
  - [$IPv6 (type alias)](#ipv6-type-alias)
  - [$IPv6Bigint (type alias)](#ipv6bigint-type-alias)
  - [$IPv6CidrBlock (type alias)](#ipv6cidrblock-type-alias)
  - [$IPv6CidrBlockFromString (type alias)](#ipv6cidrblockfromstring-type-alias)
  - [$IPv6CidrMask (type alias)](#ipv6cidrmask-type-alias)
  - [$IPv6Endpoint (type alias)](#ipv6endpoint-type-alias)
  - [$IPv6Family (type alias)](#ipv6family-type-alias)
  - [$IPv6SetupData (type alias)](#ipv6setupdata-type-alias)
  - [$Port (type alias)](#port-type-alias)
  - [$SetupData (type alias)](#setupdata-type-alias)
  - [CidrBlockBase (class)](#cidrblockbase-class)
    - [networkAddress (method)](#networkaddress-method)
    - [broadcastAddress (method)](#broadcastaddress-method)
    - [family (property)](#family-property)
- [Branded constructors](#branded-constructors)
  - [IPv4BigintBrand](#ipv4bigintbrand)
  - [IPv4Brand](#ipv4brand)
  - [IPv4CidrMaskBrand](#ipv4cidrmaskbrand)
  - [IPv6BigintBrand](#ipv6bigintbrand)
  - [IPv6Brand](#ipv6brand)
  - [IPv6CidrMaskBrand](#ipv6cidrmaskbrand)
  - [PortBrand](#portbrand)
- [Branded types](#branded-types)
  - [IPv4BigintBrand (type alias)](#ipv4bigintbrand-type-alias)
  - [IPv4Brand (type alias)](#ipv4brand-type-alias)
  - [IPv4CidrMaskBrand (type alias)](#ipv4cidrmaskbrand-type-alias)
  - [IPv6BigintBrand (type alias)](#ipv6bigintbrand-type-alias)
  - [IPv6Brand (type alias)](#ipv6brand-type-alias)
  - [IPv6CidrMaskBrand (type alias)](#ipv6cidrmaskbrand-type-alias)
  - [PortBrand (type alias)](#portbrand-type-alias)
- [Decoded types](#decoded-types)
  - [Address (type alias)](#address-type-alias)
  - [AddressBigint (type alias)](#addressbigint-type-alias)
  - [CidrBlockFromString (type alias)](#cidrblockfromstring-type-alias)
  - [Endpoint (type alias)](#endpoint-type-alias)
  - [Family (type alias)](#family-type-alias)
  - [HostnameEndpoint (type alias)](#hostnameendpoint-type-alias)
  - [HostnameIPv4SetupData (type alias)](#hostnameipv4setupdata-type-alias)
  - [HostnameIPv6SetupData (type alias)](#hostnameipv6setupdata-type-alias)
  - [IPv4 (type alias)](#ipv4-type-alias)
  - [IPv4Bigint (type alias)](#ipv4bigint-type-alias)
  - [IPv4CidrBlock (type alias)](#ipv4cidrblock-type-alias)
  - [IPv4CidrBlockFromString (type alias)](#ipv4cidrblockfromstring-type-alias)
  - [IPv4CidrMask (type alias)](#ipv4cidrmask-type-alias)
  - [IPv4Endpoint (type alias)](#ipv4endpoint-type-alias)
  - [IPv4Family (type alias)](#ipv4family-type-alias)
  - [IPv4SetupData (type alias)](#ipv4setupdata-type-alias)
  - [IPv6 (type alias)](#ipv6-type-alias)
  - [IPv6Bigint (type alias)](#ipv6bigint-type-alias)
  - [IPv6CidrBlock (type alias)](#ipv6cidrblock-type-alias)
  - [IPv6CidrBlockFromString (type alias)](#ipv6cidrblockfromstring-type-alias)
  - [IPv6CidrMask (type alias)](#ipv6cidrmask-type-alias)
  - [IPv6Endpoint (type alias)](#ipv6endpoint-type-alias)
  - [IPv6Family (type alias)](#ipv6family-type-alias)
  - [IPv6SetupData (type alias)](#ipv6setupdata-type-alias)
  - [SetupData (type alias)](#setupdata-type-alias)
- [Encoded types](#encoded-types)
  - [AddressBigintEncoded (type alias)](#addressbigintencoded-type-alias)
  - [AddressEncoded (type alias)](#addressencoded-type-alias)
  - [CidrBlockFromStringEncoded (type alias)](#cidrblockfromstringencoded-type-alias)
  - [EndpointEncoded (type alias)](#endpointencoded-type-alias)
  - [HostnameEndpointEncoded (type alias)](#hostnameendpointencoded-type-alias)
  - [HostnameIPv4SetupDataEncoded (type alias)](#hostnameipv4setupdataencoded-type-alias)
  - [HostnameIPv6SetupDataEncoded (type alias)](#hostnameipv6setupdataencoded-type-alias)
  - [IPv4BigintEncoded (type alias)](#ipv4bigintencoded-type-alias)
  - [IPv4CidrBlockEncoded (type alias)](#ipv4cidrblockencoded-type-alias)
  - [IPv4CidrBlockFromStringEncoded (type alias)](#ipv4cidrblockfromstringencoded-type-alias)
  - [IPv4CidrMaskEncoded (type alias)](#ipv4cidrmaskencoded-type-alias)
  - [IPv4Encoded (type alias)](#ipv4encoded-type-alias)
  - [IPv4EndpointEncoded (type alias)](#ipv4endpointencoded-type-alias)
  - [IPv4SetupDataEncoded (type alias)](#ipv4setupdataencoded-type-alias)
  - [IPv6BigintEncoded (type alias)](#ipv6bigintencoded-type-alias)
  - [IPv6CidrBlockEncoded (type alias)](#ipv6cidrblockencoded-type-alias)
  - [IPv6CidrBlockFromStringEncoded (type alias)](#ipv6cidrblockfromstringencoded-type-alias)
  - [IPv6CidrMaskEncoded (type alias)](#ipv6cidrmaskencoded-type-alias)
  - [IPv6Encoded (type alias)](#ipv6encoded-type-alias)
  - [IPv6EndpointEncoded (type alias)](#ipv6endpointencoded-type-alias)
  - [IPv6SetupDataEncoded (type alias)](#ipv6setupdataencoded-type-alias)
  - [SetupDataEncoded (type alias)](#setupdataencoded-type-alias)
- [Schemas](#schemas)
  - [Address](#address)
  - [AddressBigint](#addressbigint)
  - [CidrBlock](#cidrblock)
  - [CidrBlockFromString](#cidrblockfromstring)
  - [DurationFromSeconds (class)](#durationfromseconds-class)
  - [DurationFromSecondsString (class)](#durationfromsecondsstring-class)
  - [Endpoint](#endpoint)
  - [Family](#family)
  - [HostnameEndpoint](#hostnameendpoint)
  - [HostnameIPv4SetupData](#hostnameipv4setupdata)
  - [HostnameIPv6SetupData](#hostnameipv6setupdata)
  - [IPv4](#ipv4)
  - [IPv4Bigint](#ipv4bigint)
  - [IPv4CidrBlock](#ipv4cidrblock)
  - [IPv4CidrBlockFromString](#ipv4cidrblockfromstring)
  - [IPv4CidrMask](#ipv4cidrmask)
  - [IPv4Endpoint](#ipv4endpoint)
  - [IPv4Family](#ipv4family)
  - [IPv4SetupData](#ipv4setupdata)
  - [IPv6](#ipv6)
  - [IPv6Bigint](#ipv6bigint)
  - [IPv6CidrBlock](#ipv6cidrblock)
  - [IPv6CidrBlockFromString](#ipv6cidrblockfromstring)
  - [IPv6CidrMask](#ipv6cidrmask)
  - [IPv6Endpoint](#ipv6endpoint)
  - [IPv6Family](#ipv6family)
  - [IPv6SetupData](#ipv6setupdata)
  - [Port](#port)
  - [SetupData](#setupdata)

---

# Api interface

## $Address (type alias)

**Signature**

```ts
export type $Address = Schema.Union<[$IPv4, $IPv6]>
```

Added in v1.0.0

## $AddressBigint (type alias)

**Signature**

```ts
export type $AddressBigint = Schema.Union<[$IPv4Bigint, $IPv6Bigint]>
```

Added in v1.0.0

## $CidrBlock (type alias)

**Signature**

```ts
export type $CidrBlock = Schema.Union<[$IPv4CidrBlock, $IPv6CidrBlock]>
```

Added in v1.0.0

## $CidrBlockFromString (type alias)

**Signature**

```ts
export type $CidrBlockFromString = Schema.Annotable<
  $CidrBlockFromString,
  CidrBlockBase<"ipv4"> | CidrBlockBase<"ipv6">,
  `${string}/${number}`,
  never
>
```

Added in v1.0.0

## $Endpoint (type alias)

**Signature**

```ts
export type $Endpoint = Schema.Union<[$IPv4Endpoint, $IPv6Endpoint, $HostnameEndpoint]>
```

Added in v1.0.0

## $Family (type alias)

**Signature**

```ts
export type $Family = Schema.Union<[$IPv4Family, $IPv6Family]>
```

Added in v1.0.0

## $HostnameEndpoint (type alias)

**Signature**

```ts
export type $HostnameEndpoint = Schema.Annotable<
  $HostnameEndpoint,
  { readonly host: string; readonly natPort: PortBrand; readonly listenPort: PortBrand },
  | `${string}:${number}`
  | `${string}:${number}:${number}`
  | { readonly host: string; readonly port: number }
  | { readonly host: string; readonly natPort: number; readonly listenPort: number },
  never
>
```

Added in v1.0.0

## $HostnameIPv4SetupData (type alias)

**Signature**

```ts
export type $HostnameIPv4SetupData = Schema.Tuple<[$HostnameEndpoint, $IPv4]>
```

Added in v1.0.0

## $HostnameIPv6SetupData (type alias)

**Signature**

```ts
export type $HostnameIPv6SetupData = Schema.Tuple<[$HostnameEndpoint, $IPv6]>
```

Added in v1.0.0

## $IPv4 (type alias)

**Signature**

```ts
export type $IPv4 = Schema.transform<
  Schema.filter<typeof Schema.String>,
  Schema.Struct<{
    family: $IPv4Family
    ip: Schema.BrandSchema<IPv4Brand, Brand.Brand.Unbranded<IPv4Brand>, never>
  }>
>
```

Added in v1.0.0

## $IPv4Bigint (type alias)

**Signature**

```ts
export type $IPv4Bigint = Schema.transformOrFail<
  $IPv4,
  Schema.Struct<{
    family: $IPv4Family
    value: Schema.BrandSchema<IPv4BigintBrand, Brand.Brand.Unbranded<IPv4BigintBrand>, never>
  }>,
  never
>
```

Added in v1.0.0

## $IPv4CidrBlock (type alias)

**Signature**

```ts
export type $IPv4CidrBlock = Schema.Annotable<
  $IPv4CidrBlock,
  CidrBlockBase<"ipv4">,
  {
    readonly address: string
    readonly mask: number
  },
  never
>
```

Added in v1.0.0

## $IPv4CidrBlockFromString (type alias)

**Signature**

```ts
export type $IPv4CidrBlockFromString = Schema.Annotable<
  $IPv4CidrBlockFromString,
  CidrBlockBase<"ipv4">,
  `${string}/${number}`,
  never
>
```

Added in v1.0.0

## $IPv4CidrMask (type alias)

**Signature**

```ts
export type $IPv4CidrMask = Schema.Annotable<
  $IPv4CidrMask,
  IPv4CidrMaskBrand,
  Brand.Brand.Unbranded<IPv4CidrMaskBrand>,
  never
>
```

Added in v1.0.0

## $IPv4Endpoint (type alias)

**Signature**

```ts
export type $IPv4Endpoint = Schema.Annotable<
  $IPv4Endpoint,
  { readonly address: IPv4; readonly natPort: PortBrand; readonly listenPort: PortBrand },
  | `${string}:${number}`
  | `${string}:${number}:${number}`
  | { readonly ip: string; readonly port: number; readonly family: IPv4Family }
  | { readonly ip: string; readonly natPort: number; readonly listenPort: number; readonly family: IPv4Family },
  never
>
```

Added in v1.0.0

## $IPv4Family (type alias)

**Signature**

```ts
export type $IPv4Family = Schema.Literal<["ipv4"]>
```

Added in v1.0.0

## $IPv4SetupData (type alias)

**Signature**

```ts
export type $IPv4SetupData = Schema.Tuple<[$IPv4Endpoint, $IPv4]>
```

Added in v1.0.0

## $IPv6 (type alias)

**Signature**

```ts
export type $IPv6 = Schema.transform<
  Schema.filter<typeof Schema.String>,
  Schema.Struct<{
    family: $IPv6Family
    ip: Schema.BrandSchema<IPv6Brand, Brand.Brand.Unbranded<IPv6Brand>, never>
  }>
>
```

Added in v1.0.0

## $IPv6Bigint (type alias)

**Signature**

```ts
export type $IPv6Bigint = Schema.transformOrFail<
  $IPv6,
  Schema.Struct<{
    family: $IPv6Family
    value: Schema.BrandSchema<IPv6BigintBrand, Brand.Brand.Unbranded<IPv6BigintBrand>, never>
  }>,
  never
>
```

Added in v1.0.0

## $IPv6CidrBlock (type alias)

**Signature**

```ts
export type $IPv6CidrBlock = Schema.transformOrFail<
  Schema.Struct<{
    address: $IPv6
    mask: $IPv6CidrMask
  }>,
  typeof CidrBlockBase<"ipv6">,
  never
>
```

Added in v1.0.0

## $IPv6CidrBlockFromString (type alias)

**Signature**

```ts
export type $IPv6CidrBlockFromString = Schema.Annotable<
  $IPv6CidrBlockFromString,
  CidrBlockBase<"ipv6">,
  `${string}/${number}`,
  never
>
```

Added in v1.0.0

## $IPv6CidrMask (type alias)

**Signature**

```ts
export type $IPv6CidrMask = Schema.Annotable<
  $IPv6CidrMask,
  IPv6CidrMaskBrand,
  Brand.Brand.Unbranded<IPv6CidrMaskBrand>,
  never
>
```

Added in v1.0.0

## $IPv6Endpoint (type alias)

**Signature**

```ts
export type $IPv6Endpoint = Schema.Annotable<
  $IPv6Endpoint,
  { readonly address: IPv6; readonly natPort: PortBrand; readonly listenPort: PortBrand },
  | `[${string}]:${number}`
  | `[${string}]:${number}:${number}`
  | { readonly ip: string; readonly port: number; family: IPv6Family }
  | { readonly ip: string; readonly natPort: number; readonly listenPort: number; family: IPv6Family },
  never
>
```

Added in v1.0.0

## $IPv6Family (type alias)

**Signature**

```ts
export type $IPv6Family = Schema.Literal<["ipv6"]>
```

Added in v1.0.0

## $IPv6SetupData (type alias)

**Signature**

```ts
export type $IPv6SetupData = Schema.Tuple<[$IPv6Endpoint, $IPv6]>
```

Added in v1.0.0

## $Port (type alias)

**Signature**

```ts
export type $Port = Schema.Annotable<$Port, PortBrand, Brand.Brand.Unbranded<PortBrand>, never>
```

Added in v1.0.0

## $SetupData (type alias)

**Signature**

```ts
export type $SetupData = Schema.Union<[$IPv4SetupData, $IPv6SetupData, $HostnameIPv4SetupData, $HostnameIPv6SetupData]>
```

Added in v1.0.0

## CidrBlockBase (class)

**Signature**

```ts
export declare class CidrBlockBase<_Family>
```

Added in v1.0.0

### networkAddress (method)

The first address in the range given by this address' subnet, often
referred to as the Network Address.

**Signature**

```ts
public networkAddress(): _Family extends IPv4Family
        ? Effect.Effect<IPv4, ParseResult.ParseError, never>
        : _Family extends IPv6Family
          ? Effect.Effect<IPv6, ParseResult.ParseError, never>
          : never
```

Added in v1.0.0

### broadcastAddress (method)

The last address in the range given by this address' subnet, often
referred to as the Broadcast Address.

**Signature**

```ts
public broadcastAddress(): _Family extends IPv4Family
        ? Effect.Effect<IPv4, ParseResult.ParseError, never>
        : _Family extends IPv6Family
          ? Effect.Effect<IPv6, ParseResult.ParseError, never>
          : never
```

Added in v1.0.0

### family (property)

**Signature**

```ts
readonly family: "ipv4" | "ipv6"
```

Added in v1.0.0

# Branded constructors

## IPv4BigintBrand

**Signature**

```ts
export declare const IPv4BigintBrand: Brand.Brand.Constructor<IPv4BigintBrand>
```

Added in v1.0.0

## IPv4Brand

**Signature**

```ts
export declare const IPv4Brand: Brand.Brand.Constructor<IPv4Brand>
```

Added in v1.0.0

## IPv4CidrMaskBrand

**Signature**

```ts
export declare const IPv4CidrMaskBrand: Brand.Brand.Constructor<IPv4CidrMaskBrand>
```

Added in v1.0.0

## IPv6BigintBrand

**Signature**

```ts
export declare const IPv6BigintBrand: Brand.Brand.Constructor<IPv6BigintBrand>
```

Added in v1.0.0

## IPv6Brand

**Signature**

```ts
export declare const IPv6Brand: Brand.Brand.Constructor<IPv6Brand>
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

## IPv4BigintBrand (type alias)

**Signature**

```ts
export type IPv4BigintBrand = bigint & Brand.Brand<"IPv4Bigint">
```

Added in v1.0.0

## IPv4Brand (type alias)

**Signature**

```ts
export type IPv4Brand = string & Brand.Brand<"IPv4">
```

Added in v1.0.0

## IPv4CidrMaskBrand (type alias)

**Signature**

```ts
export type IPv4CidrMaskBrand = number & Brand.Brand<"IPv4CidrMask">
```

Added in v1.0.0

## IPv6BigintBrand (type alias)

**Signature**

```ts
export type IPv6BigintBrand = bigint & Brand.Brand<"IPv6Bigint">
```

Added in v1.0.0

## IPv6Brand (type alias)

**Signature**

```ts
export type IPv6Brand = string & Brand.Brand<"IPv6">
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

# Decoded types

## Address (type alias)

**Signature**

```ts
export type Address = Schema.Schema.Type<$Address>
```

Added in v1.0.0

## AddressBigint (type alias)

**Signature**

```ts
export type AddressBigint = Schema.Schema.Type<$AddressBigint>
```

Added in v1.0.0

## CidrBlockFromString (type alias)

**Signature**

```ts
export type CidrBlockFromString = Schema.Schema.Type<$CidrBlockFromString>
```

Added in v1.0.0

## Endpoint (type alias)

**Signature**

```ts
export type Endpoint = Schema.Schema.Type<$Endpoint>
```

Added in v1.0.0

## Family (type alias)

**Signature**

```ts
export type Family = Schema.Schema.Type<$Family>
```

Added in v1.0.0

## HostnameEndpoint (type alias)

**Signature**

```ts
export type HostnameEndpoint = Schema.Schema.Type<$HostnameEndpoint>
```

Added in v1.0.0

## HostnameIPv4SetupData (type alias)

**Signature**

```ts
export type HostnameIPv4SetupData = Schema.Schema.Type<$HostnameIPv4SetupData>
```

Added in v1.0.0

## HostnameIPv6SetupData (type alias)

**Signature**

```ts
export type HostnameIPv6SetupData = Schema.Schema.Type<$HostnameIPv6SetupData>
```

Added in v1.0.0

## IPv4 (type alias)

**Signature**

```ts
export type IPv4 = Schema.Schema.Type<$IPv4>
```

Added in v1.0.0

## IPv4Bigint (type alias)

**Signature**

```ts
export type IPv4Bigint = Schema.Schema.Type<$IPv4Bigint>
```

Added in v1.0.0

## IPv4CidrBlock (type alias)

**Signature**

```ts
export type IPv4CidrBlock = CidrBlockBase<"ipv4">
```

Added in v1.0.0

## IPv4CidrBlockFromString (type alias)

**Signature**

```ts
export type IPv4CidrBlockFromString = Schema.Schema.Type<$IPv4CidrBlockFromString>
```

Added in v1.0.0

## IPv4CidrMask (type alias)

**Signature**

```ts
export type IPv4CidrMask = Schema.Schema.Type<$IPv4CidrMask>
```

Added in v1.0.0

## IPv4Endpoint (type alias)

**Signature**

```ts
export type IPv4Endpoint = Schema.Schema.Type<$IPv4Endpoint>
```

Added in v1.0.0

## IPv4Family (type alias)

**Signature**

```ts
export type IPv4Family = Schema.Schema.Type<$IPv4Family>
```

Added in v1.0.0

## IPv4SetupData (type alias)

**Signature**

```ts
export type IPv4SetupData = Schema.Schema.Type<$IPv4SetupData>
```

Added in v1.0.0

## IPv6 (type alias)

**Signature**

```ts
export type IPv6 = Schema.Schema.Type<$IPv6>
```

Added in v1.0.0

## IPv6Bigint (type alias)

**Signature**

```ts
export type IPv6Bigint = Schema.Schema.Type<$IPv6Bigint>
```

Added in v1.0.0

## IPv6CidrBlock (type alias)

**Signature**

```ts
export type IPv6CidrBlock = CidrBlockBase<"ipv6">
```

Added in v1.0.0

## IPv6CidrBlockFromString (type alias)

**Signature**

```ts
export type IPv6CidrBlockFromString = Schema.Schema.Type<$IPv6CidrBlockFromString>
```

Added in v1.0.0

## IPv6CidrMask (type alias)

**Signature**

```ts
export type IPv6CidrMask = Schema.Schema.Type<$IPv6CidrMask>
```

Added in v1.0.0

## IPv6Endpoint (type alias)

**Signature**

```ts
export type IPv6Endpoint = Schema.Schema.Type<$IPv6Endpoint>
```

Added in v1.0.0

## IPv6Family (type alias)

**Signature**

```ts
export type IPv6Family = Schema.Schema.Type<$IPv6Family>
```

Added in v1.0.0

## IPv6SetupData (type alias)

**Signature**

```ts
export type IPv6SetupData = Schema.Schema.Type<$IPv6SetupData>
```

Added in v1.0.0

## SetupData (type alias)

**Signature**

```ts
export type SetupData = Schema.Schema.Type<$SetupData>
```

Added in v1.0.0

# Encoded types

## AddressBigintEncoded (type alias)

**Signature**

```ts
export type AddressBigintEncoded = Schema.Schema.Encoded<$AddressBigint>
```

Added in v1.0.0

## AddressEncoded (type alias)

**Signature**

```ts
export type AddressEncoded = Schema.Schema.Encoded<$Address>
```

Added in v1.0.0

## CidrBlockFromStringEncoded (type alias)

**Signature**

```ts
export type CidrBlockFromStringEncoded = Schema.Schema.Encoded<$CidrBlockFromString>
```

Added in v1.0.0

## EndpointEncoded (type alias)

**Signature**

```ts
export type EndpointEncoded = Schema.Schema.Encoded<$Endpoint>
```

Added in v1.0.0

## HostnameEndpointEncoded (type alias)

**Signature**

```ts
export type HostnameEndpointEncoded = Schema.Schema.Encoded<$HostnameEndpoint>
```

Added in v1.0.0

## HostnameIPv4SetupDataEncoded (type alias)

**Signature**

```ts
export type HostnameIPv4SetupDataEncoded = Schema.Schema.Encoded<$HostnameIPv4SetupData>
```

Added in v1.0.0

## HostnameIPv6SetupDataEncoded (type alias)

**Signature**

```ts
export type HostnameIPv6SetupDataEncoded = Schema.Schema.Encoded<$HostnameIPv6SetupData>
```

Added in v1.0.0

## IPv4BigintEncoded (type alias)

**Signature**

```ts
export type IPv4BigintEncoded = Schema.Schema.Encoded<$IPv4Bigint>
```

Added in v1.0.0

## IPv4CidrBlockEncoded (type alias)

**Signature**

```ts
export type IPv4CidrBlockEncoded = Schema.Schema.Encoded<$IPv4CidrBlock>
```

Added in v1.0.0

## IPv4CidrBlockFromStringEncoded (type alias)

**Signature**

```ts
export type IPv4CidrBlockFromStringEncoded = Schema.Schema.Encoded<$IPv4CidrBlockFromString>
```

Added in v1.0.0

## IPv4CidrMaskEncoded (type alias)

**Signature**

```ts
export type IPv4CidrMaskEncoded = Schema.Schema.Encoded<$IPv4CidrMask>
```

Added in v1.0.0

## IPv4Encoded (type alias)

**Signature**

```ts
export type IPv4Encoded = Schema.Schema.Encoded<$IPv4>
```

Added in v1.0.0

## IPv4EndpointEncoded (type alias)

**Signature**

```ts
export type IPv4EndpointEncoded = Schema.Schema.Encoded<$IPv4Endpoint>
```

Added in v1.0.0

## IPv4SetupDataEncoded (type alias)

**Signature**

```ts
export type IPv4SetupDataEncoded = Schema.Schema.Encoded<$IPv4SetupData>
```

Added in v1.0.0

## IPv6BigintEncoded (type alias)

**Signature**

```ts
export type IPv6BigintEncoded = Schema.Schema.Encoded<$IPv6Bigint>
```

Added in v1.0.0

## IPv6CidrBlockEncoded (type alias)

**Signature**

```ts
export type IPv6CidrBlockEncoded = Schema.Schema.Encoded<$IPv6CidrBlock>
```

Added in v1.0.0

## IPv6CidrBlockFromStringEncoded (type alias)

**Signature**

```ts
export type IPv6CidrBlockFromStringEncoded = Schema.Schema.Encoded<$IPv6CidrBlockFromString>
```

Added in v1.0.0

## IPv6CidrMaskEncoded (type alias)

**Signature**

```ts
export type IPv6CidrMaskEncoded = Schema.Schema.Encoded<$IPv6CidrMask>
```

Added in v1.0.0

## IPv6Encoded (type alias)

**Signature**

```ts
export type IPv6Encoded = Schema.Schema.Encoded<$IPv6>
```

Added in v1.0.0

## IPv6EndpointEncoded (type alias)

**Signature**

```ts
export type IPv6EndpointEncoded = Schema.Schema.Encoded<$IPv6Endpoint>
```

Added in v1.0.0

## IPv6SetupDataEncoded (type alias)

**Signature**

```ts
export type IPv6SetupDataEncoded = Schema.Schema.Encoded<$IPv6SetupData>
```

Added in v1.0.0

## SetupDataEncoded (type alias)

**Signature**

```ts
export type SetupDataEncoded = Schema.Schema.Encoded<$SetupData>
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
import * as Schema from "effect/Schema"
import { Address } from "the-wireguard-effect/InternetSchemas"

const decodeAddress = Schema.decodeSync(Address)

assert.throws(() => decodeAddress("1.1.b.1"))
assert.throws(() => decodeAddress("2001:0db8:85a3:0000:0000:8a2e:0370:7334:"))

assert.doesNotThrow(() => decodeAddress("1.1.1.2"))
assert.doesNotThrow(() => decodeAddress("2001:0db8:85a3:0000:0000:8a2e:0370:7334"))
```

Added in v1.0.0

## AddressBigint

An IP address as a bigint.

**Signature**

```ts
export declare const AddressBigint: $AddressBigint
```

Added in v1.0.0

## CidrBlock

**Signature**

```ts
export declare const CidrBlock: $CidrBlock
```

Added in v1.0.0

## CidrBlockFromString

A schema that transforms a `string` into a `CidrBlock`.

**Signature**

```ts
export declare const CidrBlockFromString: $CidrBlockFromString
```

Added in v1.0.0

## DurationFromSeconds (class)

Transforms a `number` of seconds into a `Duration`.

**Signature**

```ts
export declare class DurationFromSeconds
```

**Example**

```ts
import * as Duration from "effect/Duration"
import * as Schema from "effect/Schema"
import { DurationFromSeconds } from "the-wireguard-effect/InternetSchemas"

const decodeDuration = Schema.decodeSync(DurationFromSeconds)
const duration = decodeDuration(11)
assert.strictEqual(Duration.toSeconds(duration), 11)
```

Added in v1.0.0

## DurationFromSecondsString (class)

Transforms a `string` of seconds into a `Duration`.

**Signature**

```ts
export declare class DurationFromSecondsString
```

**Example**

```ts
import * as Duration from "effect/Duration"
import * as Schema from "effect/Schema"
import { DurationFromSecondsString } from "the-wireguard-effect/InternetSchemas"

const decodeDurationString = Schema.decodeSync(DurationFromSecondsString)
const duration = decodeDurationString("12")
assert.strictEqual(Duration.toSeconds(duration), 12)
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
import * as Schema from "effect/Schema"

import { Endpoint } from "the-wireguard-effect/InternetSchemas"

const decodeEndpoint = Schema.decodeSync(Endpoint)
const endpoint1 = decodeEndpoint("1.2.3.4:51820")
const endpoint2 = decodeEndpoint("1.2.3.4:51820:41820")

const endpoint3 = decodeEndpoint({
  ip: "1.2.3.4",
  port: 51820,
  family: "ipv4"
})

const endpoint4: Endpoint = decodeEndpoint({
  ip: "1.2.3.4",
  natPort: 51820,
  listenPort: 41820,
  family: "ipv4"
})

const endpoint5 = decodeEndpoint("[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820")
const endpoint6 = decodeEndpoint("[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820:41820")

const endpoint7 = decodeEndpoint({
  ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
  port: 51820,
  family: "ipv6"
})

const endpoint8: Endpoint = decodeEndpoint({
  ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
  natPort: 51820,
  listenPort: 41820,
  family: "ipv6"
})
```

Added in v1.0.0

## Family

**Signature**

```ts
export declare const Family: $Family
```

Added in v1.0.0

## HostnameEndpoint

A hostname wireguard endpoint, which consists of a hostname followed by a\
Nat port then an optional local port. If only one port is provided, it is
assumed that the nat port and listen port are the same.

**Signature**

```ts
export declare const HostnameEndpoint: $HostnameEndpoint
```

Added in v1.0.0

## HostnameIPv4SetupData

A wireguard setup data, which consists of an endpoint followed by an address.

**Signature**

```ts
export declare const HostnameIPv4SetupData: $HostnameIPv4SetupData
```

Added in v1.0.0

## HostnameIPv6SetupData

A wireguard setup data, which consists of an endpoint followed by an address.

**Signature**

```ts
export declare const HostnameIPv6SetupData: $HostnameIPv6SetupData
```

Added in v1.0.0

## IPv4

An IPv4 address.

**Signature**

```ts
export declare const IPv4: $IPv4
```

**Example**

```ts
import * as Schema from "effect/Schema"
import { IPv4 } from "the-wireguard-effect/InternetSchemas"

const decodeIPv4 = Schema.decodeSync(IPv4)
assert.deepEqual(decodeIPv4("1.1.1.1"), {
  family: "ipv4",
  ip: "1.1.1.1"
})

assert.throws(() => decodeIPv4("1.1.a.1"))
assert.doesNotThrow(() => decodeIPv4("1.1.1.2"))
```

Added in v1.0.0

## IPv4Bigint

An IPv4 as a bigint.

**Signature**

```ts
export declare const IPv4Bigint: $IPv4Bigint
```

**Example**

```ts
import * as Schema from "effect/Schema"
import { IPv4Bigint, IPv4BigintBrand } from "the-wireguard-effect/InternetSchemas"

const x: IPv4BigintBrand = IPv4BigintBrand(748392749382n)
assert.strictEqual(x, 748392749382n)

const decodeIPv4Bigint = Schema.decodeSync(IPv4Bigint)
const encodeIPv4Bigint = Schema.encodeSync(IPv4Bigint)

assert.deepEqual(decodeIPv4Bigint("1.1.1.1"), {
  family: "ipv4",
  value: 16843009n
})
assert.deepEqual(decodeIPv4Bigint("254.254.254.254"), {
  family: "ipv4",
  value: 4278124286n
})

assert.strictEqual(
  encodeIPv4Bigint({
    value: IPv4BigintBrand(16843009n),
    family: "ipv4"
  }),
  "1.1.1.1"
)
assert.strictEqual(
  encodeIPv4Bigint({
    value: IPv4BigintBrand(4278124286n),
    family: "ipv4"
  }),
  "254.254.254.254"
)
```

Added in v1.0.0

## IPv4CidrBlock

**Signature**

```ts
export declare const IPv4CidrBlock: $IPv4CidrBlock
```

Added in v1.0.0

## IPv4CidrBlockFromString

A schema that transforms a `string` into a `CidrBlock`.

**Signature**

```ts
export declare const IPv4CidrBlockFromString: $IPv4CidrBlockFromString
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
import * as Schema from "effect/Schema"
import { IPv4CidrMask, IPv4CidrMaskBrand } from "the-wireguard-effect/InternetSchemas"

const mask: IPv4CidrMaskBrand = IPv4CidrMaskBrand(24)
assert.strictEqual(mask, 24)

const decodeMask = Schema.decodeSync(IPv4CidrMask)
assert.strictEqual(decodeMask(24), 24)

assert.throws(() => decodeMask(33))
assert.doesNotThrow(() => decodeMask(0))
assert.doesNotThrow(() => decodeMask(32))
```

Added in v1.0.0

## IPv4Endpoint

An IPv4 wireguard endpoint, which consists of an IPv4 address followed by a
nat port then an optional local port. If only one port is provided, it is
assumed that the nat port and listen port are the same.

**Signature**

```ts
export declare const IPv4Endpoint: $IPv4Endpoint
```

**Example**

```ts
import * as Schema from "effect/Schema"
import { IPv4Endpoint } from "the-wireguard-effect/InternetSchemas"

const decodeEndpoint = Schema.decodeSync(IPv4Endpoint)
const endpoint1 = decodeEndpoint("1.2.3.4:51820")
const endpoint2 = decodeEndpoint("1.2.3.4:51820:41820")

const endpoint3 = decodeEndpoint({
  ip: "1.2.3.4",
  port: 51820,
  family: "ipv4"
})

const endpoint4 = decodeEndpoint({
  ip: "1.2.3.4",
  natPort: 51820,
  listenPort: 41820,
  family: "ipv4"
})
```

Added in v1.0.0

## IPv4Family

**Signature**

```ts
export declare const IPv4Family: $IPv4Family
```

Added in v1.0.0

## IPv4SetupData

A wireguard setup data, which consists of an endpoint followed by an address.

**Signature**

```ts
export declare const IPv4SetupData: $IPv4SetupData
```

**Example**

```ts
import * as Schema from "effect/Schema"
import { SetupData } from "the-wireguard-effect/InternetSchemas"

const decodeSetupData = Schema.decodeSync(SetupData)
const setupData = decodeSetupData(["1.1.1.1:51280", "10.0.0.1"])
```

Added in v1.0.0

## IPv6

An IPv6 address.

**Signature**

```ts
export declare const IPv6: $IPv6
```

**Example**

```ts
import * as Schema from "effect/Schema"
import { IPv6 } from "the-wireguard-effect/InternetSchemas"

const decodeIPv6 = Schema.decodeSync(IPv6)
assert.deepEqual(decodeIPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334"), {
  family: "ipv6",
  ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
})

assert.throws(() => decodeIPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334:"))
assert.throws(() => decodeIPv6("2001::85a3::0000::0370:7334"))
assert.doesNotThrow(() => decodeIPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334"))
```

Added in v1.0.0

## IPv6Bigint

An IPv6 as a bigint.

**Signature**

```ts
export declare const IPv6Bigint: $IPv6Bigint
```

**Example**

```ts
import * as Schema from "effect/Schema"
import { IPv6Bigint, IPv6BigintBrand } from "the-wireguard-effect/InternetSchemas"

const y: IPv6BigintBrand = IPv6BigintBrand(748392749382n)
assert.strictEqual(y, 748392749382n)

const decodeIPv6Bigint = Schema.decodeSync(IPv6Bigint)
const encodeIPv6Bigint = Schema.encodeSync(IPv6Bigint)

assert.deepEqual(decodeIPv6Bigint("4cbd:ff70:e62b:a048:686c:4e7e:a68a:c377"), {
  value: 102007852745154114519525620108359287671n,
  family: "ipv6"
})
assert.deepEqual(decodeIPv6Bigint("d8c6:3feb:46e6:b80c:5a07:6227:ac19:caf6"), {
  value: 288142618299897818094313964584331496182n,
  family: "ipv6"
})

assert.deepEqual(
  encodeIPv6Bigint({
    value: IPv6BigintBrand(102007852745154114519525620108359287671n),
    family: "ipv6"
  }),
  "4cbd:ff70:e62b:a048:686c:4e7e:a68a:c377"
)
assert.deepEqual(
  encodeIPv6Bigint({
    value: IPv6BigintBrand(288142618299897818094313964584331496182n),
    family: "ipv6"
  }),
  "d8c6:3feb:46e6:b80c:5a07:6227:ac19:caf6"
)
```

Added in v1.0.0

## IPv6CidrBlock

**Signature**

```ts
export declare const IPv6CidrBlock: $IPv6CidrBlock
```

Added in v1.0.0

## IPv6CidrBlockFromString

A schema that transforms a `string` into a `CidrBlock`.

**Signature**

```ts
export declare const IPv6CidrBlockFromString: $IPv6CidrBlockFromString
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
import * as Schema from "effect/Schema"
import { IPv6CidrMask, IPv6CidrMaskBrand } from "the-wireguard-effect/InternetSchemas"

const mask: IPv6CidrMaskBrand = IPv6CidrMaskBrand(64)
assert.strictEqual(mask, 64)

const decodeMask = Schema.decodeSync(IPv6CidrMask)
assert.strictEqual(decodeMask(64), 64)

assert.throws(() => decodeMask(129))
assert.doesNotThrow(() => decodeMask(0))
assert.doesNotThrow(() => decodeMask(128))
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
import * as Schema from "effect/Schema"
import { IPv6Endpoint } from "the-wireguard-effect/InternetSchemas"

const decodeEndpoint = Schema.decodeSync(IPv6Endpoint)
const endpoint1 = decodeEndpoint("[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820")
const endpoint2 = decodeEndpoint("[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820:41820")

const endpoint3 = decodeEndpoint({
  ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
  port: 51820,
  family: "ipv6"
})

const endpoint4 = decodeEndpoint({
  ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
  natPort: 51820,
  listenPort: 41820,
  family: "ipv6"
})
```

Added in v1.0.0

## IPv6Family

**Signature**

```ts
export declare const IPv6Family: $IPv6Family
```

Added in v1.0.0

## IPv6SetupData

A wireguard setup data, which consists of an endpoint followed by an address.

**Signature**

```ts
export declare const IPv6SetupData: $IPv6SetupData
```

**Example**

```ts
import * as Schema from "effect/Schema"
import { SetupData } from "the-wireguard-effect/InternetSchemas"

const decodeSetupData = Schema.decodeSync(SetupData)
const setupData = decodeSetupData(["1.1.1.1:51280", "10.0.0.1"])
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
import * as Schema from "effect/Schema"
import { Port, PortBrand } from "the-wireguard-effect/InternetSchemas"

const port: PortBrand = PortBrand(8080)
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
import * as Schema from "effect/Schema"
import { SetupData } from "the-wireguard-effect/InternetSchemas"

const decodeSetupData = Schema.decodeSync(SetupData)
const setupData = decodeSetupData(["1.1.1.1:51280", "10.0.0.1"])
```

Added in v1.0.0
