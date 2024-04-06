/**
 * Internet schemas for wireguard configuration.
 *
 * @since 1.0.0
 */

import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Brand from "effect/Brand";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Option from "effect/Option";
import * as Predicate from "effect/Predicate";
import * as ReadonlyArray from "effect/ReadonlyArray";
import * as Stream from "effect/Stream";
import * as String from "effect/String";
import * as net from "node:net";

/**
 * @internal
 * @see https://stackoverflow.com/questions/70831365/can-i-slice-literal-type-in-typescript
 */
type Split<Str extends string, Delimiter extends string> = string extends Str | ""
    ? string[]
    : Str extends `${infer T}${Delimiter}${infer U}`
      ? [T, ...Split<U, Delimiter>]
      : [Str];

/**
 * @internal
 * @see {@link Split}
 */
export const splitLiteral = <Str extends string, Delimiter extends string>(
    str: Str,
    delimiter: Delimiter
): Split<Str, Delimiter> => str.split(delimiter) as Split<Str, Delimiter>;

/**
 * @since 1.0.0
 * @category Branded types
 */
export type DurationFromSecondsBrand = Duration.Duration & Brand.Brand<"DurationFromSeconds">;

/**
 * @since 1.0.0
 * @category Branded constructors
 */
export const DurationFromSecondsBrand = Brand.nominal<DurationFromSecondsBrand>();

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $DurationFromSeconds
    extends Schema.Annotable<$DurationFromSeconds, DurationFromSecondsBrand, number, never> {}

/**
 * A schema that transforms a `number` tuple into a `Duration`. Treats the value
 * as the number of seconds.
 *
 * @since 1.0.0
 * @category Schemas
 */
export const DurationFromSeconds: $DurationFromSeconds = Schema.transform(
    Schema.number,
    Schema.DurationFromSelf,
    (ms) => Duration.seconds(ms),
    (duration) => Duration.toSeconds(duration)
)
    .pipe(Schema.fromBrand(DurationFromSecondsBrand))
    .annotations({
        identifier: "DurationFromSeconds",
        description: "A duration from seconds",
    });

/**
 * @since 1.0.0
 * @category Branded types
 */
export type PortBrand = number & Brand.Brand<"Port">;

/**
 * @since 1.0.0
 * @category Branded constructors
 */
export const PortBrand = Brand.nominal<PortBrand>();

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $Port extends Schema.Annotable<$Port, PortBrand, Brand.Brand.Unbranded<PortBrand>, never> {}

/**
 * An operating system port number.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "@effect/schema/Schema";
 *     import { Port } from "the-wireguard-effect/InternetSchemas";
 *
 *     const port: Port = Port(8080);
 *     assert.strictEqual(port, 8080);
 *
 *     const decodePort = Schema.decodeSync(Port);
 *     assert.strictEqual(decodePort(8080), 8080);
 *
 *     assert.throws(() => decodePort(65536));
 *     assert.doesNotThrow(() => decodePort(8080));
 */
export const Port: $Port = Schema.Int.pipe(Schema.between(0, 2 ** 16 - 1))
    .pipe(Schema.fromBrand(PortBrand))
    .annotations({
        identifier: "Port",
        description: "A port number",
    });

/**
 * An IPv4 address.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "@effect/schema/Schema";
 *     import { IPv4 } from "the-wireguard-effect/InternetSchemas";
 *
 *     const ipv4: IPv4 = IPv4("1.1.1.1");
 *     assert.strictEqual(ipv4, "1.1.1.1");
 *
 *     const decodeIPv4 = Schema.decodeSync(IPv4);
 *     assert.strictEqual(decodeIPv4("1.1.1.1"), "1.1.1.1");
 *
 *     assert.throws(() => decodeIPv4("1.1.a.1"));
 *     assert.doesNotThrow(() => decodeIPv4("1.1.1.1"));
 */
export class IPv4 extends Schema.Class<IPv4>("IPv4")({
    ip: Schema.string.pipe(
        Schema.filter((s, _, ast) => (net.isIPv4(s) ? Option.none() : Option.some(new ParseResult.Type(ast, s))))
    ),
}) {
    /** @since 1.0.0 */
    public readonly family: "ipv4" = "ipv4" as const;

    public static readonly FromBigint = (n: bigint): Effect.Effect<IPv4, ParseResult.ParseError, never> => {
        const padded = n.toString(16).replace(/:/g, "").padStart(8, "0");
        const groups: number[] = [];
        for (let i = 0; i < 8; i += 2) {
            const h = padded.slice(i, i + 2);
            groups.push(parseInt(h, 16));
        }
        return Schema.decode(IPv4)({ ip: groups.join(".") });
    };

    public get asBigint(): bigint {
        return Function.pipe(
            this.ip,
            String.split("."),
            ReadonlyArray.map((s) => Number.parseInt(s, 10)),
            ReadonlyArray.map((n) => n.toString(16)),
            ReadonlyArray.map(String.padStart(2, "0")),
            ReadonlyArray.join(""),
            (hex) => BigInt(`0x${hex}`)
        );
    }
}

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $IPv4FromString extends Schema.Annotable<$IPv4FromString, IPv4, string, never> {}

/**
 * @since 1.0.0
 * @category Unbranded types
 */
export type IPv4FromString = Schema.Schema.Type<typeof IPv4FromString>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type IPv4FromStringEncoded = Schema.Schema.Encoded<typeof IPv4FromString>;

/**
 * A schema that transforms a `string` into an `IPv4`.
 *
 * @since 1.0.0
 * @category Schemas
 */
export const IPv4FromString: $IPv4FromString = Schema.transform(
    Schema.string,
    IPv4,
    (str) => ({ ip: str }),
    ({ ip }) => ip
).annotations({
    identifier: "IPv4FromString",
    description: "An ipv4 address",
});

/**
 * An IPv6 address.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "@effect/schema/Schema";
 *     import { IPv6 } from "the-wireguard-effect/InternetSchemas";
 *
 *     const ipv6: IPv6 = IPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334");
 *     assert.strictEqual(ipv6, "2001:0db8:85a3:0000:0000:8a2e:0370:7334");
 *
 *     const decodeIPv6 = Schema.decodeSync(IPv6);
 *     assert.deepStrictEqual(
 *         decodeIPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334"),
 *         "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
 *     );
 *
 *     assert.throws(() =>
 *         decodeIPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334:")
 *     );
 *     assert.throws(() => decodeIPv6("2001::85a3::0000::0370:7334"));
 *     assert.doesNotThrow(() =>
 *         decodeIPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334")
 *     );
 */
export class IPv6 extends Schema.Class<IPv6>("IPv6")({
    ip: Schema.string.pipe(
        Schema.filter((s, _, ast) => (net.isIPv6(s) ? Option.none() : Option.some(new ParseResult.Type(ast, s))))
    ),
}) {
    /** @since 1.0.0 */
    public readonly family: "ipv6" = "ipv6" as const;

    public static readonly FromBigint = (n: bigint): Effect.Effect<IPv6, ParseResult.ParseError, never> => {
        const hex = n.toString(16).padStart(32, "0");
        const groups = [];
        for (let i = 0; i < 8; i++) {
            groups.push(hex.slice(i * 4, (i + 1) * 4));
        }
        return Schema.decode(IPv6)({ ip: groups.join(":") });
    };

    public get asBigint(): bigint {
        function paddedHex(octet: string): string {
            return parseInt(octet, 16).toString(16).padStart(4, "0");
        }

        let groups: string[] = [];
        const halves = this.ip.split("::");

        if (halves.length === 2) {
            let first = halves[0].split(":");
            let last = halves[1].split(":");

            if (first.length === 1 && first[0] === "") {
                first = [];
            }
            if (last.length === 1 && last[0] === "") {
                last = [];
            }

            const remaining = 8 - (first.length + last.length);
            if (!remaining) {
                // return Effect.fail(new ParseResult.Type(ast, "Error parsing groups"));
            }

            groups = groups.concat(first);
            for (let i = 0; i < remaining; i++) {
                groups.push("0");
            }
            groups = groups.concat(last);
        } else if (halves.length === 1) {
            groups = this.ip.split(":");
        } else {
            // return Effect.fail(new ParseResult.Type(ast, "Too many :: groups found"));
        }

        groups = groups.map((group: string) => parseInt(group, 16).toString(16));
        if (groups.length !== 8) {
            // return Effect.fail(new ParseResult.Type(ast, "Invalid number of groups"));
        }

        return BigInt(`0x${groups.map(paddedHex).join("")}`);
    }
}

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $IPv6FromString extends Schema.Annotable<$IPv6FromString, IPv6, string, never> {}

/**
 * @since 1.0.0
 * @category Unbranded types
 */
export type IPv6FromString = Schema.Schema.Type<typeof IPv6FromString>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type IPv6FromStringEncoded = Schema.Schema.Encoded<typeof IPv6FromString>;

/**
 * A schema that transforms a `string` into an `IPv6`.
 *
 * @since 1.0.0
 * @category Schemas
 */
export const IPv6FromString: $IPv6FromString = Schema.transform(
    Schema.string,
    IPv6,
    (str) => ({ ip: str }),
    ({ ip }) => ip
).annotations({
    identifier: "IPv6FromString",
    description: "An ipv6 address",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $Address extends Schema.union<[typeof IPv4, typeof IPv6]> {}

/**
 * @since 1.0.0
 * @category Unbranded types
 */
export type Address = Schema.Schema.Type<typeof Address>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type AddressEncoded = Schema.Schema.Encoded<typeof Address>;

/**
 * An IP address, which is either an IPv4 or IPv6 address.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "@effect/schema/Schema";
 *     import { Address } from "the-wireguard-effect/InternetSchemas";
 *
 *     const address1: Address = Address("1.1.1.1");
 *     const address2: Address = Address(
 *         "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
 *     );
 *
 *     const decodeAddress = Schema.decodeSync(Address);
 *     assert.throws(() => decodeAddress("1.1.b.1"));
 *     assert.throws(() =>
 *         decodeAddress("2001:0db8:85a3:0000:0000:8a2e:0370:7334:")
 *     );
 *     assert.doesNotThrow(() => decodeAddress("1.1.1.2"));
 *     assert.doesNotThrow(() =>
 *         decodeAddress("2001:0db8:85a3:0000:0000:8a2e:0370:7334")
 *     );
 *
 * @see {@link IPv4}
 * @see {@link IPv6}
 */
export const Address: $Address = Schema.union(IPv4, IPv6).annotations({
    identifier: "Address",
    description: "An ip address",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $AddressFromString extends Schema.union<[typeof IPv4FromString, typeof IPv6FromString]> {}

/**
 * @since 1.0.0
 * @category Unbranded types
 */
export type AddressFromString = Schema.Schema.Type<typeof AddressFromString>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type AddressFromStringEncoded = Schema.Schema.Encoded<typeof AddressFromString>;

/**
 * An IP address, which is either an IPv4 or IPv6 address. This schema
 * transforms a `string` into an `Address`.
 *
 * @since 1.0.0
 * @category Schemas
 */
export const AddressFromString: $AddressFromString = Schema.union(IPv4FromString, IPv6FromString).annotations({
    identifier: "AddressFromString",
    description: "An ip address",
});

/**
 * @since 1.0.0
 * @category Branded types
 */
export type IPv4CidrMaskBrand = number & Brand.Brand<"IPv4CidrMask">;

/**
 * @since 1.0.0
 * @category Branded constructors
 */
export const IPv4CidrMaskBrand = Brand.nominal<IPv4CidrMaskBrand>();

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $IPv4CidrMask
    extends Schema.Annotable<$IPv4CidrMask, IPv4CidrMaskBrand, Brand.Brand.Unbranded<IPv4CidrMaskBrand>, never> {}

/**
 * An ipv4 cidr mask, which is a number between 0 and 32.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "@effect/schema/Schema";
 *     import { IPv4CidrMask } from "the-wireguard-effect/InternetSchemas";
 *
 *     const mask: IPv4CidrMask = IPv4CidrMask(24);
 *     assert.strictEqual(mask, 24);
 *
 *     const decodeMask = Schema.decodeSync(IPv4CidrMask);
 *     assert.strictEqual(decodeMask(24), 24);
 *
 *     assert.throws(() => IPv4CidrMask(33));
 *     assert.doesNotThrow(() => IPv4CidrMask(0));
 *     assert.doesNotThrow(() => IPv4CidrMask(32));
 */
export const IPv4CidrMask: $IPv4CidrMask = Schema.Int.pipe(Schema.between(0, 32))
    .pipe(Schema.fromBrand(IPv4CidrMaskBrand))
    .annotations({
        identifier: "IPv4CidrMask",
        description: "An ipv4 cidr mask",
    });

/**
 * @since 1.0.0
 * @category Branded types
 */
export type IPv6CidrMaskBrand = number & Brand.Brand<"IPv6CidrMask">;

/**
 * @since 1.0.0
 * @category Branded constructors
 */
export const IPv6CidrMaskBrand = Brand.nominal<IPv6CidrMaskBrand>();

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $IPv6CidrMask
    extends Schema.Annotable<$IPv6CidrMask, IPv6CidrMaskBrand, Brand.Brand.Unbranded<IPv6CidrMaskBrand>, never> {}

/**
 * An ipv6 cidr mask, which is a number between 0 and 128.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "@effect/schema/Schema";
 *     import { IPv6CidrMask } from "the-wireguard-effect/InternetSchemas";
 *
 *     const mask: IPv6CidrMask = IPv6CidrMask(64);
 *     assert.strictEqual(mask, 64);
 *
 *     const decodeMask = Schema.decodeSync(IPv6CidrMask);
 *     assert.strictEqual(decodeMask(64), 64);
 *
 *     assert.throws(() => IPv6CidrMask(129));
 *     assert.doesNotThrow(() => IPv6CidrMask(0));
 *     assert.doesNotThrow(() => IPv6CidrMask(128));
 */
export const IPv6CidrMask: $IPv6CidrMask = Schema.Int.pipe(Schema.between(0, 128))
    .pipe(Schema.fromBrand(IPv6CidrMaskBrand))
    .annotations({
        identifier: "IPv6CidrMask",
        description: "An ipv6 cidr mask",
    });

/**
 * Internal helper representation of a cidr range so that we can do
 * transformations to and from it as we cannot represent a stream using
 *
 * @since 1.0.0
 * @category Schemas
 */
export class CidrBlock extends Schema.Class<CidrBlock>("CidrBlock")({
    /** The IP address of this cidr block. */
    ip: AddressFromString,

    /** The subnet mask of this cidr block. */
    mask: Schema.union(IPv4CidrMask, IPv6CidrMask),
}) {
    /**
     * The address family of this cidr block.
     *
     * @since 1.0.0
     */
    public readonly family: "ipv4" | "ipv6" = this.ip.family;

    /**
     * The first address in the range given by this address' subnet, often
     * referred to as the Network Address.
     */
    public get networkAddressAsBigint(): bigint {
        const bits = this.family === "ipv4" ? 32 : 128;
        const bigIntegerAddress = this.ip.asBigint;
        const intermediate = bigIntegerAddress.toString(2).padStart(bits, "0").slice(0, this.mask);
        const networkAddressString = intermediate + "0".repeat(bits - this.mask);
        const networkAddressBigInt = BigInt(`0b${networkAddressString}`);
        return networkAddressBigInt;
    }

    /**
     * The last address in the range given by this address' subnet, often
     * referred to as the Broadcast Address.
     */
    public get broadcastAddressAsBigint(): bigint {
        const bits = this.family === "ipv4" ? 32 : 128;
        const bigIntegerAddress = this.ip.asBigint;
        const intermediate = bigIntegerAddress.toString(2).padStart(bits, "0").slice(0, this.mask);
        const broadcastAddressString = intermediate + "1".repeat(bits - this.mask);
        const broadcastAddressBigInt = BigInt(`0b${broadcastAddressString}`);
        return broadcastAddressBigInt;
    }

    /**
     * A stream of all addresses in the range given by this address' subnet.
     *
     * @since 1.0.0
     */
    public get range(): Stream.Stream<Address, ParseResult.ParseError, never> {
        const minValue = this.networkAddressAsBigint;
        const maxValue = this.broadcastAddressAsBigint;

        const addressFromBigint: (n: bigint) => Effect.Effect<IPv4 | IPv6, ParseResult.ParseError, never> =
            this.family === "ipv4" ? IPv4.FromBigint : IPv6.FromBigint;

        const stream = Function.pipe(
            Stream.iterate(minValue, (x) => x + 1n),
            Stream.takeWhile((n) => n <= maxValue),
            Stream.mapEffect(addressFromBigint)
        );

        return stream;
    }

    public get total(): bigint {
        const minValue = this.networkAddressAsBigint;
        const maxValue = this.broadcastAddressAsBigint;
        return maxValue - minValue + 1n;
    }
}

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $CidrBlockFromString
    extends Schema.Annotable<$CidrBlockFromString, CidrBlock, `${string}/${number}`, never> {}

/**
 * @since 1.0.0
 * @category Unbranded types
 */
export type CidrBlockFromString = Schema.Schema.Type<typeof CidrBlockFromString>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type CidrBlockFromStringEncoded = Schema.Schema.Encoded<typeof CidrBlockFromString>;

/**
 * A schema that transforms a `string` into a `CidrBlock`.
 *
 * @since 1.0.0
 * @category Schemas
 */
export const CidrBlockFromString: $CidrBlockFromString = Schema.transform(
    Schema.templateLiteral(Schema.string, Schema.literal("/"), Schema.number),
    CidrBlock,
    (str) => {
        const [ip, mask] = splitLiteral(str, "/");
        return { ip, mask: Number.parseInt(mask, 10) };
    },
    ({ ip, mask }) => `${ip}/${mask}` as const
).annotations({
    identifier: "CidrBlockFromString",
    description: "A cidr block",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
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

/**
 * An IPv4 wireguard endpoint, which consists of an IPv4 address followed by a
 * nat port then an optional local port. If only one port is provided, it is
 * assumed that the nat port and listen port are the same.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "@effect/schema/Schema";
 *
 *     import {
 *         Port,
 *         IPv4,
 *         IPv4Endpoint,
 *     } from "the-wireguard-effect/InternetSchemas";
 *
 *     const endpoint1 = Schema.decodeSync(IPv4Endpoint)("1.2.3.4:51820");
 *     const endpoint2 = Schema.decodeSync(IPv4Endpoint)("1.2.3.4:51820:41820");
 *
 *     const endpoint3 = Schema.decodeSync(IPv4Endpoint)({
 *         ip: "1.2.3.4",
 *         port: 51820,
 *     });
 *
 *     const endpoint4: IPv4Endpoint = IPv4Endpoint({
 *         ip: IPv4("1.2.3.4"),
 *         natPort: Port(51820),
 *         listenPort: Port(41820),
 *     });
 */
export const IPv4Endpoint = Schema.transform(
    Schema.union(
        Schema.struct({ ip: Schema.string, port: Schema.number }),
        Schema.struct({ ip: Schema.string, natPort: Schema.number, listenPort: Schema.number }),
        Schema.templateLiteral(Schema.string, Schema.literal(":"), Schema.number),
        Schema.templateLiteral(Schema.string, Schema.literal(":"), Schema.number, Schema.literal(":"), Schema.number)
    ),
    Schema.struct({ address: IPv4FromString, natPort: Port, listenPort: Port }),
    (data) => {
        const isObjectInput = !Predicate.isString(data);
        const [ip, natPort, listenPort] = isObjectInput
            ? ([
                  data.ip,
                  "natPort" in data ? (`${data.natPort}` as const) : (`${data.port}` as const),
                  "listenPort" in data ? (`${data.listenPort}` as const) : undefined,
              ] as const)
            : splitLiteral(data, ":");

        const natPortParsed = Number.parseInt(natPort, 10);
        const listenPortParsed = Predicate.isNotUndefined(listenPort) ? Number.parseInt(listenPort, 10) : natPortParsed;
        return { address: ip, natPort: natPortParsed, listenPort: listenPortParsed };
    },
    ({ address, natPort, listenPort }) => `${address}:${natPort}:${listenPort}` as any
).annotations({
    identifier: "IPv4Endpoint",
    description: "An ipv4 wireguard endpoint",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
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

/**
 * An IPv6 wireguard endpoint, which consists of an IPv6 address in square
 * brackets followed by a nat port then an optional local port. If only one port
 * is provided, it is assumed that the nat port and listen port are the same.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "@effect/schema/Schema";
 *
 *     import {
 *         Port,
 *         IPv6,
 *         IPv6Endpoint,
 *     } from "the-wireguard-effect/InternetSchemas";
 *
 *     const endpoint1 = Schema.decodeSync(IPv6Endpoint)(
 *         "[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820"
 *     );
 *     const endpoint2 = Schema.decodeSync(IPv6Endpoint)(
 *         "[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820:41820"
 *     );
 *
 *     const endpoint3 = Schema.decodeSync(IPv6Endpoint)({
 *         ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
 *         port: 51820,
 *     });
 *
 *     const endpoint4: IPv6Endpoint = IPv6Endpoint({
 *         ip: IPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334"),
 *         natPort: Port(51820),
 *         listenPort: Port(41820),
 *     });
 */
export const IPv6Endpoint: $IPv6Endpoint = Schema.transform(
    Schema.union(
        Schema.struct({ ip: Schema.string, port: Schema.number }),
        Schema.struct({ ip: Schema.string, natPort: Schema.number, listenPort: Schema.number }),
        Schema.templateLiteral(
            Schema.literal("["),
            Schema.string,
            Schema.literal("]"),
            Schema.literal(":"),
            Schema.number
        ),
        Schema.templateLiteral(
            Schema.literal("["),
            Schema.string,
            Schema.literal("]"),
            Schema.literal(":"),
            Schema.number,
            Schema.literal(":"),
            Schema.number
        )
    ),
    Schema.struct({ address: IPv6FromString, natPort: Port, listenPort: Port }),
    (data) => {
        const isObjectInput = !Predicate.isString(data);
        type Tail<T extends ReadonlyArray<any>> = T extends [infer A, ...infer R] ? R : never;
        const tail = <T extends ReadonlyArray<any>>(elements: T): Tail<T> => elements.slice(1) as Tail<T>;
        const [ip, natPort, listenPort] = isObjectInput
            ? ([
                  data.ip,
                  "natPort" in data ? (`${data.natPort}` as const) : (`${data.port}` as const),
                  "listenPort" in data ? (`${data.listenPort}` as const) : undefined,
              ] as const)
            : ([splitLiteral(data, "]")[0].slice(1), ...tail(splitLiteral(splitLiteral(data, "]")[1], ":"))] as const);

        const natPortParsed = Number.parseInt(natPort, 10);
        const listenPortParsed = Predicate.isNotUndefined(listenPort) ? Number.parseInt(listenPort, 10) : natPortParsed;
        return { address: ip.slice(1), natPort: natPortParsed, listenPort: listenPortParsed } as const;
    },
    ({ address, natPort, listenPort }) => `[${address}]:${natPort}:${listenPort}` as const
).annotations({
    identifier: "IPv6Endpoint",
    description: "An ipv6 wireguard endpoint",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $Endpoint extends Schema.union<[$IPv4Endpoint, $IPv6Endpoint]> {}

/**
 * @since 1.0.0
 * @category Unbranded types
 */
export type Endpoint = Schema.Schema.Type<typeof Endpoint>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type EndpointEncoded = Schema.Schema.Encoded<typeof Endpoint>;

/**
 * A wireguard endpoint, which is either an IPv4 or IPv6 endpoint.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "@effect/schema/Schema";
 *
 *     import {
 *         Endpoint,
 *         IPv4,
 *         IPv6,
 *         Port,
 *     } from "the-wireguard-effect/InternetSchemas";
 *
 *     const endpoint1 = Schema.decodeSync(Endpoint)("1.2.3.4:51820");
 *     const endpoint2 = Schema.decodeSync(Endpoint)("1.2.3.4:51820:41820");
 *
 *     const endpoint3 = Schema.decodeSync(Endpoint)({
 *         ip: "1.2.3.4",
 *         port: 51820,
 *     });
 *
 *     const endpoint4: Endpoint = Endpoint({
 *         ip: IPv4("1.2.3.4"),
 *         natPort: Port(51820),
 *         listenPort: Port(41820),
 *     });
 *
 *     const endpoint5 = Schema.decodeSync(Endpoint)(
 *         "[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820"
 *     );
 *     const endpoint6 = Schema.decodeSync(Endpoint)(
 *         "[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820:41820"
 *     );
 *
 *     const endpoint7 = Schema.decodeSync(Endpoint)({
 *         ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
 *         port: 51820,
 *     });
 *
 *     const endpoint8: Endpoint = Endpoint({
 *         ip: IPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334"),
 *         natPort: Port(51820),
 *         listenPort: Port(41820),
 *     });
 *
 * @see {@link IPv4Endpoint}
 * @see {@link IPv6Endpoint}
 */
export const Endpoint: $Endpoint = Schema.union(IPv4Endpoint, IPv6Endpoint).annotations({
    identifier: "Endpoint",
    description: "An ipv4 or ipv6 wireguard endpoint",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $SetupData extends Schema.tuple<[$Endpoint, $AddressFromString]> {}

/**
 * @since 1.0.0
 * @category Unbranded types
 */
export type SetupData = Schema.Schema.Type<typeof SetupData>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type SetupDataEncoded = Schema.Schema.Encoded<typeof SetupData>;

/**
 * A wireguard setup data, which consists of an endpoint followed by an address.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "@effect/schema/Schema";
 *
 *     import {
 *         Address,
 *         Endpoint,
 *         SetupData,
 *     } from "the-wireguard-effect/InternetSchemas";
 *
 *     const setupData1 = Schema.decodeSync(SetupData)([
 *         "1.1.1.1:51280",
 *         "10.0.0.1",
 *     ]);
 *
 *     const address = Schema.decodeSync(Address)("10.0.0.1");
 *     const endpoint = Schema.decodeSync(Endpoint)("1.1.1.1:51820");
 *     const setupData2: SetupData = SetupData([endpoint, address]);
 *
 * @see {@link EndpointSchema}
 * @see {@link Address}
 */
export const SetupData: $SetupData = Schema.tuple(Endpoint, AddressFromString).annotations({
    identifier: "SetupData",
    description: "A wireguard setup data",
});
