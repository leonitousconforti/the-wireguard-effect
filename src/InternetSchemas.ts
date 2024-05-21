/**
 * Internet schemas for wireguard configuration.
 *
 * @since 1.0.0
 */

import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Array from "effect/Array";
import * as Brand from "effect/Brand";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import * as String from "effect/String";
import * as net from "node:net";

/** @internal */
type Tail<T extends ReadonlyArray<unknown>> = T extends
    | [infer _First, ...infer Rest]
    | readonly [infer _First, ...infer Rest]
    ? Rest
    : Array<unknown>;

/** @internal */
type Split<Str extends string, Delimiter extends string> = string extends Str | ""
    ? Array<string>
    : Str extends `${infer T}${Delimiter}${infer U}`
      ? [T, ...Split<U, Delimiter>]
      : [Str];

/** @since 1.0.0 */
export const tail = <T extends ReadonlyArray<unknown>>(elements: T): Tail<T> => elements.slice(1) as Tail<T>;

/** @since 1.0.0 */
export const splitLiteral = <Str extends string, Delimiter extends string>(
    str: Str,
    delimiter: Delimiter
): Split<Str, Delimiter> => str.split(delimiter) as Split<Str, Delimiter>;

/**
 * Transforms a `number` of seconds into a `Duration`.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Duration from "effect/Duration";
 *     import * as Schema from "@effect/schema/Schema";
 *     import { DurationFromSeconds } from "the-wireguard-effect/InternetSchemas";
 *
 *     const decodeDuration = Schema.decodeSync(DurationFromSeconds);
 *     const duration = decodeDuration(11);
 *     assert.strictEqual(Duration.toSeconds(duration), 11);
 */
export class DurationFromSeconds extends Schema.transform(Schema.Int, Schema.DurationFromSelf, {
    decode: Duration.seconds,
    encode: Duration.toSeconds,
}).annotations({
    identifier: "DurationFromSeconds",
    description: "A duration from a number of seconds",
}) {}

/**
 * Transforms a `string` of seconds into a `Duration`.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Duration from "effect/Duration";
 *     import * as Schema from "@effect/schema/Schema";
 *     import { DurationFromSecondsString } from "the-wireguard-effect/InternetSchemas";
 *
 *     const decodeDurationString = Schema.decodeSync(
 *         DurationFromSecondsString
 *     );
 *     const duration = decodeDurationString("12");
 *     assert.strictEqual(Duration.toSeconds(duration), 12);
 */
export class DurationFromSecondsString extends Schema.transform(Schema.NumberFromString, DurationFromSeconds, {
    decode: Function.identity,
    encode: Function.identity,
}).annotations({
    identifier: "DurationFromSecondsString",
    description: "A duration from a string of seconds",
}) {}

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
 *     import { Port, PortBrand } from "the-wireguard-effect/InternetSchemas";
 *
 *     const port: PortBrand = PortBrand(8080);
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
 * @since 1.0.0
 * @category Branded types
 */
export type IPv4Brand = string & Brand.Brand<"IPv4">;

/**
 * @since 1.0.0
 * @category Branded constructors
 */
export const IPv4Brand = Brand.nominal<IPv4Brand>();

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $IPv4 extends Schema.Annotable<$IPv4, IPv4Brand, Brand.Brand.Unbranded<IPv4Brand>, never> {}

/**
 * An IPv4 address.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "@effect/schema/Schema";
 *     import { IPv4 } from "the-wireguard-effect/InternetSchemas";
 *
 *     const ipv4: IPv4 = new IPv4({ value: "1.1.1.1" });
 *     assert.strictEqual(ipv4, "1.1.1.1");
 *
 *     const decodeIPv4 = Schema.decodeSync(IPv4);
 *     assert.strictEqual(decodeIPv4({ value: "1.1.1.1" }), "1.1.1.1");
 *
 *     assert.throws(() => decodeIPv4({ value: "1.1.a.1" }));
 *     assert.doesNotThrow(() => decodeIPv4({ value: "1.1.1.1" }));
 */
export const IPv4: $IPv4 = Schema.String.pipe(Schema.filter((str) => net.isIPv4(str)))
    .pipe(Schema.fromBrand(IPv4Brand))
    .annotations({
        identifier: "IPv4",
        description: "An ipv4 address",
    });

/**
 * @since 1.0.0
 * @category Branded types
 */
export type IPv4BigintBrand = bigint & Brand.Brand<"IPv4Bigint">;

/**
 * @since 1.0.0
 * @category Branded constructors
 */
export const IPv4BigintBrand = Brand.nominal<IPv4BigintBrand>();

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $IPv4Bigint
    extends Schema.transformOrFail<
        $IPv4,
        Schema.BrandSchema<IPv4BigintBrand, Brand.Brand.Unbranded<IPv4BigintBrand>, never>,
        never
    > {}

/**
 * An IPv4 as a bigint.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "@effect/schema/Schema";
 *     import {
 *         IPv4Bigint,
 *         IPv4BigintBrand,
 *     } from "the-wireguard-effect/InternetSchemas";
 *
 *     const x: IPv4BigintBrand = IPv4BigintBrand(748392749382);
 *     assert.strictEqual(x, 748392749382);
 *
 *     const decodeIPv4Bigint = Schema.decodeSync(IPv4Bigint);
 *     assert.strictEqual(decodeIPv4Bigint(1), 1);
 *     assert.doesNotThrow(() => decodeIPv4Bigint(9999999));
 */
export const IPv4Bigint: $IPv4Bigint = Schema.transformOrFail(
    IPv4,
    Schema.BigIntFromSelf.pipe(Schema.fromBrand(IPv4BigintBrand)),
    {
        encode: (x) => {
            const padded = x.toString(16).replace(/:/g, "").padStart(8, "0");
            const groups: Array<number> = [];
            for (let i = 0; i < 8; i += 2) {
                const h = padded.slice(i, i + 2);
                groups.push(parseInt(h, 16));
            }
            return Schema.decode(IPv4)(groups.join(".")).pipe(Effect.mapError(({ error }) => error));
        },
        decode: (ip) =>
            Function.pipe(
                ip,
                String.split("."),
                Array.map((s) => Number.parseInt(s, 10)),
                Array.map((n) => n.toString(16)),
                Array.map(String.padStart(2, "0")),
                Array.join(""),
                (hex) => BigInt(`0x${hex}`),
                Effect.succeed
            ),
    }
).annotations({
    identifier: "IPv4Bigint",
    description: "A an ipv4 address as a bigint",
});

/**
 * @since 1.0.0
 * @category Branded types
 */
export type IPv6Brand = string & Brand.Brand<"IPv6">;

/**
 * @since 1.0.0
 * @category Branded constructors
 */
export const IPv6Brand = Brand.nominal<IPv6Brand>();

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $IPv6 extends Schema.Annotable<$IPv6, IPv6Brand, Brand.Brand.Unbranded<IPv6Brand>, never> {}

/**
 * An IPv6 address.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "@effect/schema/Schema";
 *     import { IPv6 } from "the-wireguard-effect/InternetSchemas";
 *
 *     const ipv6: IPv6 = new IPv6({
 *         ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
 *     });
 *     assert.strictEqual(ipv6, "2001:0db8:85a3:0000:0000:8a2e:0370:7334");
 *
 *     const decodeIPv6 = Schema.decodeSync(IPv6);
 *     assert.deepStrictEqual(
 *         decodeIPv6({ ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334" }),
 *         "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
 *     );
 *
 *     assert.throws(() =>
 *         decodeIPv6({ ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334:" })
 *     );
 *     assert.throws(() => decodeIPv6({ ip: "2001::85a3::0000::0370:7334" }));
 *     assert.doesNotThrow(() =>
 *         decodeIPv6({ ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334" })
 *     );
 */
export const IPv6: $IPv6 = Schema.String.pipe(Schema.filter((str) => net.isIPv6(str)))
    .pipe(Schema.fromBrand(IPv6Brand))
    .annotations({
        identifier: "IPv6",
        description: "An ipv6 address",
    });

/**
 * @since 1.0.0
 * @category Branded types
 */
export type IPv6BigintBrand = bigint & Brand.Brand<"IPv6Bigint">;

/**
 * @since 1.0.0
 * @category Branded constructors
 */
export const IPv6BigintBrand = Brand.nominal<IPv6BigintBrand>();

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $IPv6Bigint
    extends Schema.transformOrFail<
        $IPv6,
        Schema.BrandSchema<IPv6BigintBrand, Brand.Brand.Unbranded<IPv6BigintBrand>, never>,
        never
    > {}

/**
 * An IPv4 as a bigint.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "@effect/schema/Schema";
 *     import {
 *         IPv6Bigint,
 *         IPv6BigintBrand,
 *     } from "the-wireguard-effect/InternetSchemas";
 *
 *     const y: IPv6BigintBrand = IPv6BigintBrand(748392749382);
 *     assert.strictEqual(y, 748392749382);
 *
 *     const decodeIPv6Bigint = Schema.decodeSync(IPv6Bigint);
 *     assert.strictEqual(decodeIPv6Bigint(1), 1);
 *     assert.doesNotThrow(() => decodeIPv6Bigint(9999999));
 */
export const IPv6Bigint: $IPv6Bigint = Schema.transformOrFail(
    IPv6,
    Schema.BigIntFromSelf.pipe(Schema.fromBrand(IPv6BigintBrand)),
    {
        encode: (x) => {
            const hex = x.toString(16).padStart(32, "0");
            const groups = [];
            for (let i = 0; i < 8; i++) {
                groups.push(hex.slice(i * 4, (i + 1) * 4));
            }
            return Schema.decode(IPv6)(groups.join(":")).pipe(Effect.mapError(({ error }) => error));
        },
        decode: (ip) => {
            function paddedHex(octet: string): string {
                return parseInt(octet, 16).toString(16).padStart(4, "0");
            }

            let groups: Array<string> = [];
            const halves = ip.split("::");

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
                    throw new Error("Error parsing groups");
                }

                groups = groups.concat(first);
                for (let i = 0; i < remaining; i++) {
                    groups.push("0");
                }
                groups = groups.concat(last);
            } else if (halves.length === 1) {
                groups = ip.split(":");
            } else {
                throw new Error("Too many :: groups found");
            }

            groups = groups.map((group: string) => parseInt(group, 16).toString(16));
            if (groups.length !== 8) {
                throw new Error("Invalid number of groups");
            }

            return Effect.succeed(BigInt(`0x${groups.map(paddedHex).join("")}`));
        },
    }
).annotations({
    identifier: "IPv6Bigint",
    description: "A an ipv6 address as a bigint",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $Address
    extends Schema.Union<
        [
            Schema.Schema<
                {
                    readonly IPv4: IPv4Brand;
                    readonly family: "ipv4";
                },
                {
                    readonly IPv4: string;
                },
                never
            >,
            Schema.Schema<
                {
                    readonly IPv6: IPv6Brand;
                    readonly family: "ipv6";
                },
                {
                    readonly IPv6: string;
                },
                never
            >,
        ]
    > {}

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
 *     const decodeAddress = Schema.decodeSync(Address);
 *
 *     assert.throws(() => decodeAddress({ ip: "1.1.b.1" }));
 *     assert.throws(() =>
 *         decodeAddress({ ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334:" })
 *     );
 *
 *     assert.doesNotThrow(() => decodeAddress({ ip: "1.1.1.2" }));
 *     assert.doesNotThrow(() =>
 *         decodeAddress({ ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334" })
 *     );
 *
 * @see {@link IPv4}
 * @see {@link IPv6}
 */
export const Address: $Address = Schema.Union(
    Schema.Struct({ IPv4 }).pipe(Schema.attachPropertySignature("family", "ipv4")),
    Schema.Struct({ IPv6 }).pipe(Schema.attachPropertySignature("family", "ipv6"))
).annotations({
    identifier: "Address",
    description: "An ip address",
});

/**
 * @since 1.0.0
 * @category Branded types
 */
export type AddressBigintBrand = bigint & Brand.Brand<"AddressBigint">;

/**
 * @since 1.0.0
 * @category Branded constructors
 */
export const AddressBigintBrand = Brand.nominal<AddressBigintBrand>();

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $AddressBigint
    extends Schema.transformOrFail<
        $Address,
        Schema.BrandSchema<AddressBigintBrand, Brand.Brand.Unbranded<AddressBigintBrand>, never>,
        never
    > {}

/**
 * An IPv4 as a bigint.
 *
 * @since 1.0.0
 * @category Schemas
 */
export const AddressBigint = Schema.transformOrFail(
    Address,
    Schema.Union(
        Schema.Struct({ IPv4: IPv4Bigint }).pipe(Schema.attachPropertySignature("family", "ipv4")),
        Schema.Struct({ IPv6: IPv6Bigint }).pipe(Schema.attachPropertySignature("family", "ipv6"))
    ),
    {
        encode: (x) =>
            Effect.gen(function* () {
                if ("IPv4" in x) {
                    const b = yield* Schema.decode(IPv4Bigint)({} as any);
                } else {
                    const a = yield* Schema.decode(IPv6Bigint)({} as any);
                }

                return {} as any;
            }).pipe(Effect.mapError(({ error }) => error)),
        decode: (ip) => {
            return {} as any;
        },
    }
).annotations({
    identifier: "IPv6Bigint",
    description: "A an ipv6 address as a bigint",
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
 *     import {
 *         IPv4CidrMask,
 *         IPv4CidrMaskBrand,
 *     } from "the-wireguard-effect/InternetSchemas";
 *
 *     const mask: IPv4CidrMaskBrand = IPv4CidrMaskBrand(24);
 *     assert.strictEqual(mask, 24);
 *
 *     const decodeMask = Schema.decodeSync(IPv4CidrMask);
 *     assert.strictEqual(decodeMask(24), 24);
 *
 *     assert.throws(() => decodeMask(33));
 *     assert.doesNotThrow(() => decodeMask(0));
 *     assert.doesNotThrow(() => decodeMask(32));
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
 *     import {
 *         IPv6CidrMask,
 *         IPv6CidrMaskBrand,
 *     } from "the-wireguard-effect/InternetSchemas";
 *
 *     const mask: IPv6CidrMaskBrand = IPv6CidrMaskBrand(64);
 *     assert.strictEqual(mask, 64);
 *
 *     const decodeMask = Schema.decodeSync(IPv6CidrMask);
 *     assert.strictEqual(decodeMask(64), 64);
 *
 *     assert.throws(() => decodeMask(129));
 *     assert.doesNotThrow(() => decodeMask(0));
 *     assert.doesNotThrow(() => decodeMask(128));
 */
export const IPv6CidrMask: $IPv6CidrMask = Schema.Int.pipe(Schema.between(0, 128))
    .pipe(Schema.fromBrand(IPv6CidrMaskBrand))
    .annotations({
        identifier: "IPv6CidrMask",
        description: "An ipv6 cidr mask",
    });

/**
 * @since 1.0.0
 * @category Api interface
 * @internal
 */
export class CidrBlockBase<Family extends typeof IPv4 | typeof IPv6> extends Schema.Class<
    CidrBlockBase<typeof IPv4 | typeof IPv6>
>("CidrBlockMixin")({
    ip: Address,
    mask: Schema.Union(IPv4CidrMask, IPv6CidrMask),
}) {
    public readonly family: "ipv4" | "ipv6" = this.ip.family;

    /** @internal */
    private onFamily<OnIPv4, OnIPv6>({
        onIPv4,
        onIPv6,
    }: {
        onIPv4: (self: CidrBlockBase<typeof IPv4>) => OnIPv4;
        onIPv6: (self: CidrBlockBase<typeof IPv6>) => OnIPv6;
    }): Family extends typeof IPv4 ? OnIPv4 : typeof this.ip extends typeof IPv6 ? OnIPv6 : never {
        type Ret = typeof this.ip extends typeof IPv4 ? OnIPv4 : typeof this.ip extends typeof IPv6 ? OnIPv6 : never;

        const isIPv4 = (): this is CidrBlockBase<typeof IPv4> => this.family === "ipv4";
        const isIPv6 = (): this is CidrBlockBase<typeof IPv6> => this.family === "ipv6";

        if (isIPv4()) {
            return onIPv4(this as CidrBlockBase<typeof IPv4>) as Ret;
        } else if (isIPv6()) {
            return onIPv6(this as CidrBlockBase<typeof IPv6>) as Ret;
        } else {
            return Function.absurd<Ret>(this.family as never);
        }
    }

    /**
     * The first address in the range given by this address' subnet, often
     * referred to as the Network Address.
     *
     * @since 1.0.0
     */
    protected get networkAddressAsBigint(): Family extends typeof IPv4
        ? Effect.Effect<IPv4BigintBrand, ParseResult.ParseError, never>
        : Effect.Effect<IPv6BigintBrand, ParseResult.ParseError, never> {
        const bits = this.family === "ipv4" ? 32 : 128;
        //const bigIntegerAddress = this.ip.asBigint;
        this.onFamily({
            onIPv4: (self) => Schema.decode(IPv4Bigint)(self.ip),
            onIPv6: (self) => Schema.decode(IPv6Bigint)(self.ip),
        });
        const intermediate = bigIntegerAddress.toString(2).padStart(bits, "0").slice(0, this.mask);
        const networkAddressString = intermediate + "0".repeat(bits - this.mask);
        const networkAddressBigInt = BigInt(`0b${networkAddressString}`);
        return this.onFamily({
            onIPv4: (_self) => IPv4BigintBrand(networkAddressBigInt),
            onIPv6: (_self) => IPv6BigintBrand(networkAddressBigInt),
        });
    }

    /**
     * The first address in the range given by this address' subnet, often
     * referred to as the Network Address.
     *
     * @since 1.0.0
     */
    public networkAddress(): Family extends typeof IPv4
        ? Effect.Effect<typeof IPv4, ParseResult.ParseError, never>
        : Effect.Effect<typeof IPv6, ParseResult.ParseError, never> {
        return this.onFamily({
            onIPv4: (self) => IPv4.FromBigint(self.networkAddressAsBigint),
            onIPv6: (self) => IPv6.FromBigint(self.networkAddressAsBigint),
        });
    }

    /**
     * The last address in the range given by this address' subnet, often
     * referred to as the Broadcast Address.
     *
     * @since 1.0.0
     */
    protected get broadcastAddressAsBigint(): Family extends typeof IPv4 ? IPv4BigintBrand : IPv6BigintBrand {
        const bits = this.family === "ipv4" ? 32 : 128;
        const bigIntegerAddress = this.ip.asBigint;
        const intermediate = bigIntegerAddress.toString(2).padStart(bits, "0").slice(0, this.mask);
        const broadcastAddressString = intermediate + "1".repeat(bits - this.mask);
        const broadcastAddressBigInt = BigInt(`0b${broadcastAddressString}`);
        return this.onFamily({
            onIPv4: (_self) => IPv4BigintBrand(broadcastAddressBigInt),
            onIPv6: (_self) => IPv6BigintBrand(broadcastAddressBigInt),
        });
    }

    /**
     * The last address in the range given by this address' subnet, often
     * referred to as the Broadcast Address.
     *
     * @since 1.0.0
     */
    public broadcastAddress(): Family extends typeof IPv4
        ? Effect.Effect<typeof IPv4, ParseResult.ParseError, never>
        : Effect.Effect<typeof IPv6, ParseResult.ParseError, never> {
        return this.onFamily({
            onIPv4: (self) => IPv4.FromBigint(self.broadcastAddressAsBigint),
            onIPv6: (self) => IPv6.FromBigint(self.broadcastAddressAsBigint),
        });
    }

    /**
     * A stream of all addresses in the range given by this address' subnet.
     *
     * @since 1.0.0
     */
    public get range(): Family extends typeof IPv4
        ? Stream.Stream<typeof IPv4, ParseResult.ParseError, never>
        : Stream.Stream<typeof IPv6, ParseResult.ParseError, never> {
        return this.onFamily({
            onIPv4: (self) => {
                const minValue = self.networkAddressAsBigint;
                const maxValue = self.broadcastAddressAsBigint;
                return Function.pipe(
                    Stream.iterate(minValue, (x) => IPv4BigintBrand(x + 1n)),
                    Stream.takeWhile((n) => n <= maxValue),
                    Stream.mapEffect(IPv4.FromBigint)
                );
            },
            onIPv6: (self) => {
                const minValue = self.networkAddressAsBigint;
                const maxValue = self.broadcastAddressAsBigint;
                return Function.pipe(
                    Stream.iterate(minValue, (x) => IPv6BigintBrand(x + 1n)),
                    Stream.takeWhile((n) => n <= maxValue),
                    Stream.mapEffect(IPv6.FromBigint)
                );
            },
        });
    }

    /**
     * The total number of addresses in the range given by this address' subnet.
     *
     * @since 1.0.0
     */
    public get total(): bigint {
        const minValue: bigint = this.networkAddressAsBigint;
        const maxValue: bigint = this.broadcastAddressAsBigint;
        return maxValue - minValue + 1n;
    }

    /**
     * Finds the smallest CIDR block that contains all the given IP addresses.
     *
     * @since 1.0.0
     */
    public static readonly cidrBlockForRange = <Family extends typeof IPv4 | typeof IPv6>(
        inputs: Family extends typeof IPv4
            ? Array.NonEmptyReadonlyArray<typeof IPv4>
            : Array.NonEmptyReadonlyArray<typeof IPv6>
    ): Family extends typeof IPv4
        ? Effect.Effect<CidrBlockBase<typeof IPv4>, ParseResult.ParseError, never>
        : Effect.Effect<CidrBlockBase<typeof IPv6>, ParseResult.ParseError, never> =>
        Effect.gen(function* () {
            const bigIntMinAndMax = (args: Array.NonEmptyReadonlyArray<bigint>) => {
                return args.reduce(
                    ([min, max], e) => {
                        return [e < min ? e : min, e > max ? e : max] as const;
                    },
                    [args[0], args[0]] as const
                );
            };

            const bits = inputs[0].family === "ipv4" ? 32 : 128;
            const bigints = Array.map(inputs, (ip) => ip.asBigint);
            const [min, max] = bigIntMinAndMax(bigints);

            const leadingZerosInMin = bits - min.toString(2).length;
            const leadingZerosInMax = bits - max.toString(2).length;

            const cidrMask = Math.min(leadingZerosInMin, leadingZerosInMax);
            const cidrAddress =
                inputs[0].family === "ipv4"
                    ? yield* IPv4.FromBigint(IPv4BigintBrand(min))
                    : yield* IPv6.FromBigint(IPv6BigintBrand(min));

            return yield* Schema.decode(CidrBlockFromString)(`${cidrAddress}/${cidrMask}`);
        }) as Family extends typeof IPv4
            ? Effect.Effect<CidrBlockBase<typeof IPv4>, ParseResult.ParseError, never>
            : Effect.Effect<CidrBlockBase<typeof IPv6>, ParseResult.ParseError, never>;
}

/**
 * @since 1.0.0
 * @category Schemas
 */
export class IPv4CidBlock extends CidrBlockBase.transformOrFail<CidrBlockBase<IPv4>>("IPv4CidBlock")(
    { ip_: IPv4, mask_: IPv4CidrMask },
    {
        encode: Effect.succeed,
        decode: ({ ip, mask }, _options, ast) => {
            if (Schema.is(IPv4)(ip) && Schema.is(IPv4CidrMask)(mask)) {
                return Effect.succeed({ ip, mask, ip_: ip, mask_: mask } as const);
            } else {
                return Effect.fail(
                    new ParseResult.Type(
                        ast,
                        { ip, mask },
                        "Did not have ipv4 and ipv4CidrMask when decoding ipv4 cidr block"
                    )
                );
            }
        },
    }
) {}

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $IPv4CidBlockFromString
    extends Schema.Annotable<$IPv4CidBlockFromString, CidrBlockBase<IPv4>, `${string}/${number}`, never> {}

/**
 * @since 1.0.0
 * @category Unbranded types
 */
export type IPv4CidBlockFromString = Schema.Schema.Type<typeof IPv4CidBlockFromString>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type IPv4CidBlockFromStringEncoded = Schema.Schema.Encoded<typeof IPv4CidBlockFromString>;

/**
 * A schema that transforms a `string` into a `CidrBlock`.
 *
 * @since 1.0.0
 * @category Schemas
 */
export const IPv4CidBlockFromString: $IPv4CidBlockFromString = Schema.transform(
    Schema.TemplateLiteral(Schema.String, Schema.Literal("/"), Schema.Number),
    IPv4CidBlock,
    {
        decode: (str) => {
            const [ip, mask] = splitLiteral(str, "/");
            return { ip, mask: Number.parseInt(mask, 10) } as const;
        },
        encode: ({ ip, mask }) => `${ip}/${mask}` as const,
    }
).annotations({
    identifier: "IPv4CidBlockFromString",
    description: "An ipv4 cidr block from string",
});

/**
 * @since 1.0.0
 * @category Schemas
 */
export class IPv6CidBlock extends CidrBlockBase.transformOrFail<CidrBlockBase<IPv6>>("IPv6CidBlock")(
    { ip_: IPv6, mask_: IPv6CidrMask },
    {
        encode: Effect.succeed,
        decode: ({ ip, mask }, _options, ast) => {
            if (Schema.is(IPv6)(ip) && Schema.is(IPv6CidrMask)(mask)) {
                return Effect.succeed({ ip, mask, ip_: ip, mask_: mask } as const);
            } else {
                return Effect.fail(
                    new ParseResult.Type(
                        ast,
                        { ip, mask },
                        "Did not have ipv6 and ipv6CidrMask when decoding ipv6 cidr block"
                    )
                );
            }
        },
    }
) {}

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $IPv6CidBlockFromString
    extends Schema.Annotable<$IPv6CidBlockFromString, CidrBlockBase<IPv6>, `${string}/${number}`, never> {}

/**
 * @since 1.0.0
 * @category Unbranded types
 */
export type IPv6CidBlockFromString = Schema.Schema.Type<typeof IPv6CidBlockFromString>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type IPv6CidBlockFromStringEncoded = Schema.Schema.Encoded<typeof IPv6CidBlockFromString>;

/**
 * A schema that transforms a `string` into a `CidrBlock`.
 *
 * @since 1.0.0
 * @category Schemas
 */
export const IPv6CidBlockFromString: $IPv6CidBlockFromString = Schema.transform(
    Schema.TemplateLiteral(Schema.String, Schema.Literal("/"), Schema.Number),
    IPv6CidBlock,
    {
        decode: (str) => {
            const [ip, mask] = splitLiteral(str, "/");
            return { ip, mask: Number.parseInt(mask, 10) } as const;
        },
        encode: ({ ip, mask }) => `${ip}/${mask}` as const,
    }
).annotations({
    identifier: "IPv6CidBlockFromString",
    description: "An ipv6 cidr block from string",
});

/**
 * @since 1.0.0
 * @category Schemas
 */
export class CidrBlock extends Schema.Union(IPv4CidBlock, IPv6CidBlock) {}

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $CidrBlockFromString
    extends Schema.Annotable<
        $CidrBlockFromString,
        CidrBlockBase<IPv4> | CidrBlockBase<IPv6>,
        `${string}/${number}`,
        never
    > {}

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
    Schema.TemplateLiteral(Schema.String, Schema.Literal("/"), Schema.Number),
    CidrBlock,
    {
        decode: (str) => {
            const [ip, mask] = splitLiteral(str, "/");
            return { ip, mask: Number.parseInt(mask, 10) } as const;
        },
        encode: ({ ip, mask }) => `${ip}/${mask}` as const,
    }
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
 *     import { IPv4Endpoint } from "the-wireguard-effect/InternetSchemas";
 *
 *     const decodeEndpoint = Schema.decodeSync(IPv4Endpoint);
 *     const endpoint1 = decodeEndpoint("1.2.3.4:51820");
 *     const endpoint2 = decodeEndpoint("1.2.3.4:51820:41820");
 *
 *     const endpoint3 = decodeEndpoint({
 *         ip: "1.2.3.4",
 *         port: 51820,
 *     });
 *
 *     const endpoint4 = decodeEndpoint({
 *         ip: "1.2.3.4",
 *         natPort: 51820,
 *         listenPort: 41820,
 *     });
 */
export const IPv4Endpoint: $IPv4Endpoint = Schema.transform(
    Schema.Union(
        Schema.Struct({ ip: Schema.String, port: Schema.Number }),
        Schema.Struct({ ip: Schema.String, natPort: Schema.Number, listenPort: Schema.Number }),
        Schema.TemplateLiteral(Schema.String, Schema.Literal(":"), Schema.Number),
        Schema.TemplateLiteral(Schema.String, Schema.Literal(":"), Schema.Number, Schema.Literal(":"), Schema.Number)
    ),
    Schema.Struct({ address: IPv4, natPort: Port, listenPort: Port }),
    {
        decode: (data) => {
            const isObjectInput = !Predicate.isString(data);
            const [ip, natPort, listenPort] = isObjectInput
                ? ([
                      data.ip,
                      "natPort" in data ? (`${data.natPort}` as const) : (`${data.port}` as const),
                      "listenPort" in data ? (`${data.listenPort}` as const) : undefined,
                  ] as const)
                : splitLiteral(data, ":");

            const natPortParsed = Number.parseInt(natPort, 10);
            const listenPortParsed = Predicate.isNotUndefined(listenPort)
                ? Number.parseInt(listenPort, 10)
                : natPortParsed;
            return { address: ip, natPort: natPortParsed, listenPort: listenPortParsed };
        },
        encode: ({ address, listenPort, natPort }) => `${address}:${natPort}:${listenPort}` as const,
    }
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
 *     import { IPv6Endpoint } from "the-wireguard-effect/InternetSchemas";
 *
 *     const decodeEndpoint = Schema.decodeSync(IPv6Endpoint);
 *     const endpoint1 = decodeEndpoint(
 *         "[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820"
 *     );
 *     const endpoint2 = decodeEndpoint(
 *         "[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820:41820"
 *     );
 *
 *     const endpoint3 = decodeEndpoint({
 *         ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
 *         port: 51820,
 *     });
 *
 *     const endpoint4 = decodeEndpoint({
 *         ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
 *         natPort: 51820,
 *         listenPort: 41820,
 *     });
 */
export const IPv6Endpoint: $IPv6Endpoint = Schema.transform(
    Schema.Union(
        Schema.Struct({ ip: Schema.String, port: Schema.Number }),
        Schema.Struct({ ip: Schema.String, natPort: Schema.Number, listenPort: Schema.Number }),
        Schema.TemplateLiteral(
            Schema.Literal("["),
            Schema.String,
            Schema.Literal("]"),
            Schema.Literal(":"),
            Schema.Number
        ),
        Schema.TemplateLiteral(
            Schema.Literal("["),
            Schema.String,
            Schema.Literal("]"),
            Schema.Literal(":"),
            Schema.Number,
            Schema.Literal(":"),
            Schema.Number
        )
    ),
    Schema.Struct({ address: IPv6, natPort: Port, listenPort: Port }),
    {
        decode: (data) => {
            const isObjectInput = !Predicate.isString(data);
            const [ip, natPort, listenPort] = isObjectInput
                ? ([
                      data.ip,
                      "natPort" in data ? (`${data.natPort}` as const) : (`${data.port}` as const),
                      "listenPort" in data ? (`${data.listenPort}` as const) : undefined,
                  ] as const)
                : ([
                      splitLiteral(data, "]")[0].slice(1),
                      ...tail(splitLiteral(splitLiteral(data, "]")[1], ":")),
                  ] as const);

            const natPortParsed = Number.parseInt(natPort, 10);
            const listenPortParsed = Predicate.isNotUndefined(listenPort)
                ? Number.parseInt(listenPort, 10)
                : natPortParsed;
            return { address: ip.slice(1), natPort: natPortParsed, listenPort: listenPortParsed } as const;
        },
        encode: ({ address, listenPort, natPort }) => `[${address}]:${natPort}:${listenPort}` as const,
    }
).annotations({
    identifier: "IPv6Endpoint",
    description: "An ipv6 wireguard endpoint",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $HostnameEndpoint
    extends Schema.Annotable<
        $HostnameEndpoint,
        { readonly host: string; readonly natPort: PortBrand; readonly listenPort: PortBrand },
        | `${string}:${number}`
        | `${string}:${number}:${number}`
        | { readonly host: string; readonly port: number }
        | { readonly host: string; readonly natPort: number; readonly listenPort: number },
        never
    > {}

/**
 * A hostname wireguard endpoint, which consists of a hostname followed by a\
 * Nat port then an optional local port. If only one port is provided, it is
 * assumed that the nat port and listen port are the same.
 *
 * @since 1.0.0
 * @category Schemas
 */
export const HostnameEndpoint: $HostnameEndpoint = Schema.transform(
    Schema.Union(
        Schema.Struct({ host: Schema.String, port: Schema.Number }),
        Schema.Struct({ host: Schema.String, natPort: Schema.Number, listenPort: Schema.Number }),
        Schema.TemplateLiteral(Schema.String, Schema.Literal(":"), Schema.Number),
        Schema.TemplateLiteral(Schema.String, Schema.Literal(":"), Schema.Number, Schema.Literal(":"), Schema.Number)
    ),
    Schema.Struct({ host: Schema.String, natPort: Port, listenPort: Port }),
    {
        decode: (data) => {
            const isObjectInput = !Predicate.isString(data);
            const [host, natPort, listenPort] = isObjectInput
                ? ([
                      data.host,
                      "natPort" in data ? (`${data.natPort}` as const) : (`${data.port}` as const),
                      "listenPort" in data ? (`${data.listenPort}` as const) : undefined,
                  ] as const)
                : splitLiteral(data, ":");

            const natPortParsed = Number.parseInt(natPort, 10);
            const listenPortParsed = Predicate.isNotUndefined(listenPort)
                ? Number.parseInt(listenPort, 10)
                : natPortParsed;
            return { host, natPort: natPortParsed, listenPort: listenPortParsed };
        },
        encode: ({ host, listenPort, natPort }) => `${host}:${natPort}:${listenPort}` as const,
    }
).annotations({
    identifier: "HostnameEndpoint",
    description: "A hostname endpoint",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $Endpoint extends Schema.Union<[$IPv4Endpoint, $IPv6Endpoint, $HostnameEndpoint]> {}

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
 *     import { Endpoint } from "the-wireguard-effect/InternetSchemas";
 *
 *     const decodeEndpoint = Schema.decodeSync(Endpoint);
 *     const endpoint1 = decodeEndpoint("1.2.3.4:51820");
 *     const endpoint2 = decodeEndpoint("1.2.3.4:51820:41820");
 *
 *     const endpoint3 = decodeEndpoint({
 *         ip: "1.2.3.4",
 *         port: 51820,
 *     });
 *
 *     const endpoint4: Endpoint = decodeEndpoint({
 *         ip: "1.2.3.4",
 *         natPort: 51820,
 *         listenPort: 41820,
 *     });
 *
 *     const endpoint5 = decodeEndpoint(
 *         "[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820"
 *     );
 *     const endpoint6 = decodeEndpoint(
 *         "[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820:41820"
 *     );
 *
 *     const endpoint7 = decodeEndpoint({
 *         ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
 *         port: 51820,
 *     });
 *
 *     const endpoint8: Endpoint = decodeEndpoint({
 *         ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
 *         natPort: 51820,
 *         listenPort: 41820,
 *     });
 *
 * @see {@link IPv4Endpoint}
 * @see {@link IPv6Endpoint}
 */
export const Endpoint: $Endpoint = Schema.Union(IPv4Endpoint, IPv6Endpoint, HostnameEndpoint).annotations({
    identifier: "Endpoint",
    description: "An ipv4 or ipv6 wireguard endpoint",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $IPv4SetupData extends Schema.Tuple<[$IPv4Endpoint, typeof IPv4]> {}

/**
 * @since 1.0.0
 * @category Unbranded types
 */
export type IPv4SetupData = Schema.Schema.Type<typeof IPv4SetupData>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type IPv4SetupDataEncoded = Schema.Schema.Encoded<typeof IPv4SetupData>;

/**
 * A wireguard setup data, which consists of an endpoint followed by an address.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "@effect/schema/Schema";
 *     import { SetupData } from "the-wireguard-effect/InternetSchemas";
 *
 *     const decodeSetupData = Schema.decodeSync(SetupData);
 *     const setupData = decodeSetupData(["1.1.1.1:51280", "10.0.0.1"]);
 *
 * @see {@link IPv4EndpointSchema}
 * @see {@link IPv4}
 */
export const IPv4SetupData: $IPv4SetupData = Schema.Tuple(IPv4Endpoint, IPv4).annotations({
    identifier: "SetupData",
    description: "A wireguard setup data",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $IPv6SetupData extends Schema.Tuple<[$IPv6Endpoint, typeof IPv6]> {}

/**
 * @since 1.0.0
 * @category Unbranded types
 */
export type IPv6SetupData = Schema.Schema.Type<typeof IPv6SetupData>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type IPv6SetupDataEncoded = Schema.Schema.Encoded<typeof IPv6SetupData>;

/**
 * A wireguard setup data, which consists of an endpoint followed by an address.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "@effect/schema/Schema";
 *     import { SetupData } from "the-wireguard-effect/InternetSchemas";
 *
 *     const decodeSetupData = Schema.decodeSync(SetupData);
 *     const setupData = decodeSetupData(["1.1.1.1:51280", "10.0.0.1"]);
 *
 * @see {@link IPv6EndpointSchema}
 * @see {@link IPv6}
 */
export const IPv6SetupData: $IPv6SetupData = Schema.Tuple(IPv6Endpoint, IPv6).annotations({
    identifier: "SetupData",
    description: "A wireguard setup data",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $SetupData extends Schema.Union<[typeof IPv4SetupData, typeof IPv6SetupData]> {}

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
 *     import { SetupData } from "the-wireguard-effect/InternetSchemas";
 *
 *     const decodeSetupData = Schema.decodeSync(SetupData);
 *     const setupData = decodeSetupData(["1.1.1.1:51280", "10.0.0.1"]);
 *
 * @see {@link EndpointSchema}
 * @see {@link Address}
 */
export const SetupData: $SetupData = Schema.Union(IPv4SetupData, IPv6SetupData).annotations({
    identifier: "SetupData",
    description: "A wireguard setup data",
});
