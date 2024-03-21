/**
 * @since 1.0.0
 */

import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
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
 * An operating system port number.
 *
 * @example
 * import * as Schema from "@effect/schema/Schema"
 * import { Port } from "the-wireguard-effect/InternetSchemas"
 *
 * const port: Port = Port(8080)
 *
 * const decodePort = Schema.decodeSync(Port)
 * assert.throws(() => decodePort(65536))
 * assert.doesNotThrow(() => decodePort(8080))
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const Port = Function.pipe(
    Schema.Int,
    Schema.between(0, 2 ** 16 - 1),
    Schema.identifier("Port"),
    Schema.description("A port number"),
    Schema.brand("Port"),
);

/** @since 1.0.0 */
export type Port = Schema.Schema.Type<typeof Port>;

/**
 * An IPv4 address.
 *
 * @example
 * import * as Schema from "@effect/schema/Schema"
 * import { IPv4 } from "the-wireguard-effect/InternetSchemas"
 *
 * const ipv4: IPv4 = IPv4("1.1.1.1")
 *
 * const decodeIPv4 = Schema.decodeSync(IPv4)
 * assert.throws(() => decodeIPv4("1.1.a.1"))
 * assert.doesNotThrow(() => decodeIPv4("1.1.1.1"))
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const IPv4 = Function.pipe(
    Schema.string,
    Schema.filter((s, _options, ast) => (net.isIPv4(s) ? Option.none() : Option.some(new ParseResult.Type(ast, s)))),
    Schema.identifier("IPv4"),
    Schema.description("An ipv4 address"),
    Schema.brand("IPv4"),
);

/** @since 1.0.0 */
export type IPv4 = Schema.Schema.Type<typeof IPv4>;

/**
 * An IPv6 address.
 *
 * @example
 * import * as Schema from "@effect/schema/Schema"
 * import { IPv6 } from "the-wireguard-effect/InternetSchemas"
 *
 * const ipv6: IPv6 = IPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334")
 *
 * const decodeIPv6 = Schema.decodeSync(IPv6)
 * assert.throws(() => decodeIPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334:"))
 * assert.doesNotThrow(() => decodeIPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334"))
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const IPv6 = Function.pipe(
    Schema.string,
    Schema.filter((s, _options, ast) => (net.isIPv6(s) ? Option.none() : Option.some(new ParseResult.Type(ast, s)))),
    Schema.identifier("IPv6"),
    Schema.description("An ipv6 address"),
    Schema.brand("IPv6"),
);

/** @since 1.0.0 */
export type IPv6 = Schema.Schema.Type<typeof IPv6>;

/**
 * An IP address, which is either an IPv4 or IPv6 address.
 *
 * @see {@link IPv4}
 * @see {@link IPv6}
 *
 * @example
 * import * as Schema from "@effect/schema/Schema"
 * import { Address } from "the-wireguard-effect/InternetSchemas"
 *
 * const address1: Address = Address("1.1.1.1")
 * const address2: Address = Address("2001:0db8:85a3:0000:0000:8a2e:0370:7334")
 *
 * const decodeAddress = Schema.decodeSync(Address)
 * assert.throws(() => decodeAddress("1.1.b.1"))
 * assert.throws(() => decodeAddress("2001:0db8:85a3:0000:0000:8a2e:0370:7334:"))
 * assert.doesNotThrow(() => decodeAddress("1.1.1.2"))
 * assert.doesNotThrow(() => decodeAddress("2001:0db8:85a3:0000:0000:8a2e:0370:7334"))
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const Address = Function.pipe(
    Schema.union(IPv4, IPv6),
    Schema.identifier("Address"),
    Schema.description("An ipv4 or ipv6 address"),
    Schema.brand("Address"),
);

/** @since 1.0.0 */
export type Address = Schema.Schema.Type<typeof Address>;

/**
 * An IPv4 address as a bigint, helpful for some cidr and subnet related calculations.
 *
 * @example
 * import * as Schema from "@effect/schema/Schema"
 * import { Address, IPv4Bigint } from "the-wireguard-effect/InternetSchemas"
 *
 * const address1 = Schema.decode(IPv4Bigint)(Address("1.1.1.1"))
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const IPv4Bigint = Schema.transformOrFail(
    IPv4,
    Schema.struct({
        value: Schema.bigintFromSelf,
        family: Schema.literal("ipv4"),
    }),
    (address, _options, _ast) =>
        Function.pipe(
            address,
            String.split("."),
            ReadonlyArray.map((s) => Number.parseInt(s, 10)),
            ReadonlyArray.map((n) => n.toString(16)),
            ReadonlyArray.map(String.padStart(2, "0")),
            ReadonlyArray.join(""),
            (hex) => BigInt(`0x${hex}`),
            (bigint) => ({ value: bigint, family: "ipv4" as const }),
            Effect.succeed,
        ),
    (data, _options, _ast) => {
        const padded = data.value.toString(16).replace(/:/g, "").padStart(8, "0");
        const groups: number[] = [];
        for (let i = 0; i < 8; i += 2) {
            const h = padded.slice(i, i + 2);
            groups.push(parseInt(h, 16));
        }
        return Schema.decodeEither(IPv4)(groups.join(".")).pipe(Either.mapLeft(({ error }) => error));
    },
).annotations({ identifier: "IPv4Bigint", description: "An ipv4 address as a bigint" });

/** @since 1.0.0 */
export type IPv4Bigint = Schema.Schema.Type<typeof IPv4Bigint>;

/**
 * An IPv6 address as a bigint, helpful for some cidr and subnet related calculations.
 *
 * @example
 * import * as Schema from "@effect/schema/Schema"
 *
 * import { Address, IPv6Bigint } from "the-wireguard-effect/InternetSchemas"
 * const address1 = Schema.decode(IPv6Bigint)(Address("2001:0db8:85a3:0000:0000:8a2e:0370:7334"))
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const IPv6Bigint = Schema.transformOrFail(
    IPv6,
    Schema.struct({
        value: Schema.bigintFromSelf,
        family: Schema.literal("ipv6"),
    }),
    (address, _options, ast) => {
        function paddedHex(octet: string): string {
            return parseInt(octet, 16).toString(16).padStart(4, "0");
        }

        let groups: string[] = [];
        const halves = address.split("::");

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
                return Effect.fail(new ParseResult.Type(ast, "Error parsing groups"));
            }

            groups = groups.concat(first);
            for (let i = 0; i < remaining; i++) {
                groups.push("0");
            }
            groups = groups.concat(last);
        } else if (halves.length === 1) {
            groups = address.split(":");
        } else {
            return Effect.fail(new ParseResult.Type(ast, "Too many :: groups found"));
        }

        groups = groups.map((group: string) => parseInt(group, 16).toString(16));
        if (groups.length !== 8) {
            return Effect.fail(new ParseResult.Type(ast, "Invalid number of groups"));
        }

        const value = BigInt(`0x${groups.map(paddedHex).join("")}`);
        return Effect.succeed({ value, family: "ipv6" as const });
    },
    (data, _options, _ast) => {
        const hex = data.value.toString(16).padStart(32, "0");
        const groups = [];
        for (let i = 0; i < 8; i++) {
            groups.push(hex.slice(i * 4, (i + 1) * 4));
        }
        return Schema.decodeEither(IPv6)(groups.join(":")).pipe(Either.mapLeft(({ error }) => error));
    },
).annotations({ identifier: "IPv6Bigint", description: "An ipv6 address as a bigint" });

/** @since 1.0.0 */
export type IPv6Bigint = Schema.Schema.Type<typeof IPv6Bigint>;

/**
 * An IP address as a bigint, helpful for some cidr and subnet related calculations.
 *
 * @example
 * import * as Schema from "@effect/schema/Schema"
 *
 * import { Address, BigintFromAddress } from "the-wireguard-effect/InternetSchemas"
 * const address1 = Schema.decode(BigintFromAddress)(Address("1.1.1.1"))
 * const address2 = Schema.decode(BigintFromAddress)(Address("2001:0db8:85a3:0000:0000:8a2e:0370:7334"))
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const BigintFromAddress = Function.pipe(
    Schema.union(IPv4Bigint, IPv6Bigint),
    Schema.identifier("BigintFromAddress"),
    Schema.description("An ipv4 or ipv6 address as a bigint"),
);

/** @since 1.0.0 */
export type BigintFromAddress = Schema.Schema.Type<typeof BigintFromAddress>;

/**
 * An ipv4 cidr mask, which is a number between 0 and 32.
 *
 * @example
 * import { IPv4CidrMask } from "the-wireguard-effect/InternetSchemas"
 *
 * const mask: IPv4CidrMask = IPv4CidrMask(24)
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const IPv4CidrMask = Function.pipe(
    Schema.Int,
    Schema.between(0, 32),
    Schema.identifier("IPv4CidrMask"),
    Schema.description("An ipv4 cidr mask"),
    Schema.brand("IPv4CidrMask"),
);

/** @since 1.0.0 */
export type IPv4CidrMask = Schema.Schema.Type<typeof IPv4CidrMask>;

/**
 * An ipv6 cidr mask, which is a number between 0 and 128.
 *
 * @example
 * import { IPv6CidrMask } from "the-wireguard-effect/InternetSchemas"
 *
 * const mask: IPv6CidrMask = IPv6CidrMask(64)
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const IPv6CidrMask = Function.pipe(
    Schema.Int,
    Schema.between(0, 128),
    Schema.identifier("IPv6CidrMask"),
    Schema.description("An ipv6 cidr mask"),
    Schema.brand("IPv6CidrMask"),
);

/** @since 1.0.0 */
export type IPv6CidrMask = Schema.Schema.Type<typeof IPv6CidrMask>;

/**
 * Internal helper representation of a cidr range so that we can do
 * transformations to and from it as we cannot represent a stream
 * using @effect/schema.
 *
 * @internal
 * @since 1.0.0
 * @category Datatypes
 */
export class CidrBlockInternal extends Schema.Class<CidrBlockInternal>("CidrBlockInternal")({
    ip: Address,
    mask: Schema.union(IPv4CidrMask, IPv6CidrMask),
    family: Schema.union(Schema.literal("ipv4"), Schema.literal("ipv6")),

    /**
     * The first address in the range given by this address' subnet, often referred to as the Network Address.
     */
    networkAddress: Address,

    /**
     * The last address in the range given by this address' subnet, often referred to as the Broadcast Address.
     */
    broadcastAddress: Address,
}) {
    public readonly range = (): Effect.Effect<
        Stream.Stream<Address, ParseResult.ParseError, never>,
        ParseResult.ParseError,
        never
    > => {
        const self = this;
        return Effect.gen(function* (λ) {
            const { value: minValue } = yield* λ(Schema.decode(BigintFromAddress)(self.networkAddress));
            const { value: maxValue } = yield* λ(Schema.decode(BigintFromAddress)(self.broadcastAddress));

            const stream = Function.pipe(
                Stream.iterate(minValue, (n) => n + 1n),
                Stream.takeWhile((n) => n <= maxValue),
                Stream.map((n) => ({ value: n, family: self.family })),
                Stream.mapEffect(Schema.encode(BigintFromAddress)),
                Stream.mapEffect(Schema.decode(Address)),
            );

            return stream;
        });
    };

    public get total() {
        const { value: minValue } = Schema.decodeSync(BigintFromAddress)(this.networkAddress);
        const { value: maxValue } = Schema.decodeSync(BigintFromAddress)(this.broadcastAddress);
        return maxValue - minValue + 1n;
    }
}

/**
 * A cidr block, which is an IP address followed by a slash and then a subnet mask.
 *
 * @example
 * import * as Schema from "@effect/schema/Schema"
 *
 * import {
 *      CidrBlock,
 *      IPv4,
 *      IPv4CidrMask,
 *      IPv6,
 *      IPv6CidrMask
 * } from "the-wireguard-effect/InternetSchemas"
 *
 * const block1 = Schema.decode(CidrBlock)("192.168.1.1/24")
 * const block2 = Schema.decode(CidrBlock)("2001:0db8:85a3:0000:0000:8a2e:0370:7334/64")
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const CidrBlock = Function.pipe(
    Schema.transformOrFail(
        Schema.union(
            Schema.struct({ ipv4: IPv4, mask: IPv4CidrMask }),
            Schema.struct({ ipv6: IPv6, mask: IPv6CidrMask }),
            Schema.templateLiteral(Schema.string, Schema.literal("/"), Schema.number),
        ),
        CidrBlockInternal,
        (data, _options, _ast) =>
            Effect.gen(function* (λ) {
                const [ip, mask] = Predicate.isString(data)
                    ? (data.split("/") as Split<typeof data, "/">)
                    : "ipv4" in data
                      ? ([data.ipv4, `${data.mask}`] as const)
                      : ([data.ipv6, `${data.mask}`] as const);

                const ipParsed = yield* λ(Schema.decode(Schema.union(IPv4, IPv6))(ip));
                const family = String.includes(".")(ipParsed) ? "ipv4" : "ipv6";
                const maskParsed =
                    family === "ipv4"
                        ? yield* λ(Schema.decode(Schema.compose(Schema.NumberFromString, IPv4CidrMask))(mask))
                        : yield* λ(Schema.decode(Schema.compose(Schema.NumberFromString, IPv6CidrMask))(mask));

                const bits = family === "ipv4" ? 32 : 128;
                const bigIntegerAddress = yield* λ(Schema.decode(BigintFromAddress)(ip));

                const networkAddressString =
                    bigIntegerAddress.value.toString(2).padStart(bits, "0").slice(0, maskParsed) +
                    "0".repeat(bits - maskParsed);

                const networkAddressBigInt = BigInt(`0b${networkAddressString}`);
                const networkAddress = yield* λ(
                    Schema.encode(BigintFromAddress)({ value: networkAddressBigInt, family }),
                );

                const broadcastAddressString =
                    bigIntegerAddress.value.toString(2).padStart(bits, "0").slice(0, maskParsed) +
                    "1".repeat(bits - maskParsed);

                const broadcastAddressBigInt = BigInt(`0b${broadcastAddressString}`);
                const broadcastAddress = yield* λ(
                    Schema.encode(BigintFromAddress)({ value: broadcastAddressBigInt, family }),
                );

                return yield* λ(
                    Schema.decode(CidrBlockInternal)({
                        family,
                        ip: ipParsed,
                        mask: maskParsed,
                        networkAddress,
                        broadcastAddress,
                    }),
                );
            }).pipe(Effect.mapError(({ error }) => error)),
        ({ ip, mask }) => Effect.succeed(`${ip}/${mask}` as const),
    ),
    Schema.identifier("CidrBlock"),
    Schema.description("A cidr block"),
    Schema.brand("CidrBlock"),
);

/** @since 1.0.0 */
export type CidrBlock = Schema.Schema.Type<typeof CidrBlock>;

/** @since 1.0.0 */
export type CidrBlockEncoded = Schema.Schema.Encoded<typeof CidrBlock>;

/**
 * An IPv4 wireguard endpoint, which consists of an IPv4 address followed by a
 * nat port then an optional local port. If only one port is provided, it is
 * assumed that the nat port and listen port are the same.
 *
 * @example
 * import * as Schema from "@effect/schema/Schema"
 *
 * import {
 *      Port,
 *      IPv4,
 *      IPv4Endpoint
 * } from "the-wireguard-effect/InternetSchemas"
 *
 * const endpoint1 = Schema.decode(IPv4Endpoint)("1.2.3.4:51820")
 * const endpoint2 = Schema.decode(IPv4Endpoint)("1.2.3.4:51820:41820")
 *
 * const endpoint3 = Schema.decode(IPv4Endpoint)({
 *      ip: "1.2.3.4",
 *      port: 51820,
 * })
 *
 * const endpoint4: IPv4Endpoint = IPv4Endpoint({
 *      ip: IPv4("1.2.3.4"),
 *      natPort: Port(51820),
 *      listenPort: Port(41820)
 * })
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const IPv4Endpoint = Function.pipe(
    Schema.transformOrFail(
        Schema.union(
            Schema.struct({ ip: IPv4, port: Port }),
            Schema.struct({ ip: IPv4, natPort: Port, listenPort: Port }),
            Schema.templateLiteral(Schema.string, Schema.literal(":"), Schema.number),
            Schema.templateLiteral(
                Schema.string,
                Schema.literal(":"),
                Schema.number,
                Schema.literal(":"),
                Schema.number,
            ),
        ),
        Schema.struct({ ip: IPv4, natPort: Port, listenPort: Port }),
        (data, _options, _ast) =>
            Effect.gen(function* (λ) {
                const isObjectInput = !Predicate.isString(data);

                if (isObjectInput)
                    return "port" in data
                        ? { ip: data.ip, natPort: data.port, listenPort: data.port }
                        : { ip: data.ip, natPort: data.natPort, listenPort: data.listenPort };

                const portDecoder = Schema.decode(Schema.compose(Schema.NumberFromString, Port));
                const [ip, natPort, listenPort] = data.split(":") as Split<typeof data, ":">;
                const ipParsed = yield* λ(Schema.decode(IPv4)(ip));
                const natPortParsed = yield* λ(portDecoder(natPort));
                const listenPortParsed = Predicate.isNotUndefined(listenPort)
                    ? yield* λ(portDecoder(listenPort))
                    : natPortParsed;

                return { ip: ipParsed, natPort: natPortParsed, listenPort: listenPortParsed };
            }).pipe(Effect.mapError(({ error }) => error)),
        ({ ip, natPort, listenPort }) => Effect.succeed(`${ip}:${natPort}:${listenPort}` as const),
    ),
    Schema.identifier("IPv4Endpoint"),
    Schema.description("An ipv4 wireguard endpoint"),
    Schema.brand("IPv4Endpoint"),
);

/** @since 1.0.0 */
export type IPv4Endpoint = Schema.Schema.Type<typeof IPv4Endpoint>;

/** @since 1.0.0 */
export type IPv4EndpointEncoded = Schema.Schema.Encoded<typeof IPv4Endpoint>;

/**
 * An IPv6 wireguard endpoint, which consists of an IPv6 address in square
 * brackets followed by a nat port then an optional local port. If only one
 * port is provided, it is assumed that the nat port and listen port are the
 * same.
 *
 * @example
 * import * as Schema from "@effect/schema/Schema"
 *
 * import {
 *      Port,
 *      IPv6,
 *      IPv6Endpoint
 * } from "the-wireguard-effect/InternetSchemas"
 *
 * const endpoint1 = Schema.decode(IPv6Endpoint)("[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820")
 * const endpoint2 = Schema.decode(IPv6Endpoint)("[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820:41820")
 *
 * const endpoint3 = Schema.decode(IPv6Endpoint)({
 *      ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
 *      port: 51820,
 * })
 *
 * const endpoint4: IPv6Endpoint = IPv6Endpoint({
 *      ip: IPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334"),
 *      natPort: Port(51820),
 *      listenPort: Port(41820)
 * })
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const IPv6Endpoint = Function.pipe(
    Schema.transformOrFail(
        Schema.union(
            Schema.struct({ ip: IPv6, port: Port }),
            Schema.struct({ ip: IPv6, natPort: Port, listenPort: Port }),
            Schema.templateLiteral(
                Schema.literal("["),
                Schema.string,
                Schema.literal("]"),
                Schema.literal(":"),
                Schema.number,
            ),
            Schema.templateLiteral(
                Schema.literal("["),
                Schema.string,
                Schema.literal("]"),
                Schema.literal(":"),
                Schema.number,
                Schema.literal(":"),
                Schema.number,
            ),
        ),
        Schema.struct({ ip: IPv6, natPort: Port, listenPort: Port }),
        (data, _options, _ast) =>
            Effect.gen(function* (λ) {
                const isObjectInput = !Predicate.isString(data);

                if (isObjectInput)
                    return "port" in data
                        ? { ip: data.ip, natPort: data.port, listenPort: data.port }
                        : { ip: data.ip, natPort: data.natPort, listenPort: data.listenPort };

                const portDecoder = Schema.decode(Schema.compose(Schema.NumberFromString, Port));
                const [ip, ports] = data.split("]") as Split<typeof data, "]">;
                const [_, natPort, listenPort] = ports.split(":") as Split<typeof ports, ":">;
                const ipParsed = yield* λ(Schema.decode(IPv6)(ip.slice(1)));
                const natPortParsed = yield* λ(portDecoder(natPort));
                const listenPortParsed = Predicate.isNotUndefined(listenPort)
                    ? yield* λ(portDecoder(listenPort))
                    : natPortParsed;

                return { ip: ipParsed, natPort: natPortParsed, listenPort: listenPortParsed };
            }).pipe(Effect.mapError(({ error }) => error)),
        ({ ip, natPort, listenPort }) => Effect.succeed(`[${ip}]:${natPort}:${listenPort}` as const),
    ),
    Schema.identifier("IPv6Endpoint"),
    Schema.description("An ipv6 wireguard endpoint"),
    Schema.brand("IPv6Endpoint"),
);

/** @since 1.0.0 */
export type IPv6Endpoint = Schema.Schema.Type<typeof IPv6Endpoint>;

/** @since 1.0.0 */
export type IPv6EndpointEncoded = Schema.Schema.Encoded<typeof IPv6Endpoint>;

/**
 * A wireguard endpoint, which is either an IPv4 or IPv6 endpoint.
 *
 * @see {@link IPv4Endpoint}
 * @see {@link IPv6Endpoint}
 *
 * @example
 * import * as Schema from "@effect/schema/Schema"
 * import {
 *      Endpoint,
 *      IPv4,
 *      IPv6,
 *      Port
 * } from "the-wireguard-effect/InternetSchemas"
 *
 * const endpoint1 = Schema.decode(Endpoint)("1.2.3.4:51820")
 * const endpoint2 = Schema.decode(Endpoint)("1.2.3.4:51820:41820")
 *
 * const endpoint3 = Schema.decode(Endpoint)({
 *      ip: "1.2.3.4",
 *      port: 51820,
 * })
 *
 * const endpoint4: Endpoint = Endpoint({
 *      ip: IPv4("1.2.3.4"),
 *      natPort: Port(51820),
 *      listenPort: Port(41820),
 * })
 *
 * const endpoint5 = Schema.decode(Endpoint)("[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820")
 * const endpoint6 = Schema.decode(Endpoint)("[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820:41820")
 *
 * const endpoint7 = Schema.decode(Endpoint)({
 *      ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
 *      port: 51820,
 * })
 *
 * const endpoint8: Endpoint = Endpoint({
 *      ip: IPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334"),
 *      natPort: Port(51820),
 *      listenPort: Port(41820),
 * })
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const Endpoint = Function.pipe(
    Schema.union(IPv4Endpoint, IPv6Endpoint),
    Schema.identifier("Endpoint"),
    Schema.description("A wireguard endpoint"),
    Schema.brand("Endpoint"),
);

/** @since 1.0.0 */
export type Endpoint = Schema.Schema.Type<typeof Endpoint>;

/** @since 1.0.0 */
export type EndpointEncoded = Schema.Schema.Encoded<typeof Endpoint>;

/**
 * A wireguard setup data, which consists of an endpoint followed by an address.
 *
 * @see {@link Endpoint}
 * @see {@link Address}
 *
 * @example
 * import * as Schema from "@effect/schema/Schema"
 *
 * import {
 *      Address,
 *      Endpoint,
 *      SetupData
 * } from "the-wireguard-effect/InternetSchemas"
 *
 * const setupData1 = Schema.decode(SetupData)(["1.1.1.1:51280", "10.0.0.1"])
 *
 * const address = Schema.decodeSync(Address)("10.0.0.1")
 * const endpoint = Schema.decodeSync(Endpoint)("1.1.1.1:51820")
 * const setupData2: SetupData = SetupData([endpoint, address])
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const SetupData = Function.pipe(
    Schema.tuple(Endpoint, Address),
    Schema.identifier("SetupData"),
    Schema.description("A wireguard setup data"),
    Schema.brand("SetupData"),
);

/** @since 1.0.0 */
export type SetupData = Schema.Schema.Type<typeof SetupData>;

/** @since 1.0.0 */
export type SetupDataEncoded = Schema.Schema.Encoded<typeof SetupData>;
