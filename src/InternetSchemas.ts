/**
 * Internet schemas for wireguard configuration.
 *
 * @since 1.0.0
 */

import * as Array from "effect/Array";
import * as Brand from "effect/Brand";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as ParseResult from "effect/ParseResult";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";
import * as Stream from "effect/Stream";
import * as String from "effect/String";
import * as Tuple from "effect/Tuple";
import * as net from "node:net";

import * as internal from "./internal/internetSchemas.js";

/**
 * Transforms a `number` of seconds into a `Duration`.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Duration from "effect/Duration";
 *     import * as Schema from "effect/Schema";
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
 *     import * as Schema from "effect/Schema";
 *     import { DurationFromSecondsString } from "the-wireguard-effect/InternetSchemas";
 *
 *     const decodeDurationString = Schema.decodeSync(
 *         DurationFromSecondsString
 *     );
 *     const duration = decodeDurationString("12");
 *     assert.strictEqual(Duration.toSeconds(duration), 12);
 */
export class DurationFromSecondsString extends Schema.compose(Schema.NumberFromString, DurationFromSeconds).annotations(
    {
        identifier: "DurationFromSecondsString",
        description: "A duration from a string of seconds",
    }
) {}

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
export type $Port = Schema.Annotable<$Port, PortBrand, Brand.Brand.Unbranded<PortBrand>, never>;

/**
 * An operating system port number.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "effect/Schema";
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
        title: "An OS port number",
        description: "An operating system's port number between 0 and 65535 (inclusive)",
    });

/**
 * @since 1.0.0
 * @category Api interface
 */
export type $IPv4Family = Schema.Literal<["ipv4"]>;

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type IPv4Family = Schema.Schema.Type<$IPv4Family>;

/**
 * @since 1.0.0
 * @category Schemas
 */
export const IPv4Family: $IPv4Family = Schema.Literal("ipv4").annotations({
    identifier: "IPv4Family",
    description: "An ipv4 family",
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
export type $IPv4 = Schema.transform<
    Schema.filter<typeof Schema.String>,
    Schema.Struct<{
        family: $IPv4Family;
        ip: Schema.BrandSchema<IPv4Brand, Brand.Brand.Unbranded<IPv4Brand>, never>;
    }>
>;

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type IPv4 = Schema.Schema.Type<$IPv4>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type IPv4Encoded = Schema.Schema.Encoded<$IPv4>;

/**
 * An IPv4 address.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "effect/Schema";
 *     import { IPv4 } from "the-wireguard-effect/InternetSchemas";
 *
 *     const decodeIPv4 = Schema.decodeSync(IPv4);
 *     assert.deepEqual(decodeIPv4("1.1.1.1"), {
 *         family: "ipv4",
 *         ip: "1.1.1.1",
 *     });
 *
 *     assert.throws(() => decodeIPv4("1.1.a.1"));
 *     assert.doesNotThrow(() => decodeIPv4("1.1.1.2"));
 */
export const IPv4: $IPv4 = Schema.transform(
    Function.pipe(
        Schema.String,
        Schema.filter((str) => net.isIPv4(str))
    ),
    Schema.Struct({
        family: IPv4Family,
        ip: Schema.String.pipe(Schema.fromBrand(IPv4Brand)),
    }),
    {
        encode: ({ ip }) => ip,
        decode: (ip) => ({ ip, family: "ipv4" }) as const,
    }
).annotations({
    identifier: "IPv4",
    title: "An ipv4 address",
    description: "An ipv4 address in dot-decimal notation with no leading zeros",
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
export type $IPv4Bigint = Schema.transformOrFail<
    $IPv4,
    Schema.Struct<{
        family: $IPv4Family;
        value: Schema.BrandSchema<IPv4BigintBrand, Brand.Brand.Unbranded<IPv4BigintBrand>, never>;
    }>,
    never
>;

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type IPv4Bigint = Schema.Schema.Type<$IPv4Bigint>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type IPv4BigintEncoded = Schema.Schema.Encoded<$IPv4Bigint>;

/**
 * An IPv4 as a bigint.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "effect/Schema";
 *     import {
 *         IPv4Bigint,
 *         IPv4BigintBrand,
 *     } from "the-wireguard-effect/InternetSchemas";
 *
 *     const x: IPv4BigintBrand = IPv4BigintBrand(748392749382n);
 *     assert.strictEqual(x, 748392749382n);
 *
 *     const decodeIPv4Bigint = Schema.decodeSync(IPv4Bigint);
 *     const encodeIPv4Bigint = Schema.encodeSync(IPv4Bigint);
 *
 *     assert.deepEqual(decodeIPv4Bigint("1.1.1.1"), {
 *         family: "ipv4",
 *         value: 16843009n,
 *     });
 *     assert.deepEqual(decodeIPv4Bigint("254.254.254.254"), {
 *         family: "ipv4",
 *         value: 4278124286n,
 *     });
 *
 *     assert.strictEqual(
 *         encodeIPv4Bigint({
 *             value: IPv4BigintBrand(16843009n),
 *             family: "ipv4",
 *         }),
 *         "1.1.1.1"
 *     );
 *     assert.strictEqual(
 *         encodeIPv4Bigint({
 *             value: IPv4BigintBrand(4278124286n),
 *             family: "ipv4",
 *         }),
 *         "254.254.254.254"
 *     );
 */
export const IPv4Bigint: $IPv4Bigint = Schema.transformOrFail(
    IPv4,
    Schema.Struct({
        family: IPv4Family,
        value: Schema.BigIntFromSelf.pipe(Schema.fromBrand(IPv4BigintBrand)),
    }),
    {
        encode: ({ value }) => {
            const padded = value.toString(16).replace(/:/g, "").padStart(8, "0");
            const groups: Array<number> = [];
            for (let i = 0; i < 8; i += 2) {
                const h = padded.slice(i, i + 2);
                groups.push(parseInt(h, 16));
            }
            return Schema.decode(IPv4)(groups.join(".")).pipe(Effect.mapError(({ issue }) => issue));
        },
        decode: ({ ip }) =>
            Function.pipe(
                ip,
                String.split("."),
                Array.map((s) => Number.parseInt(s, 10)),
                Array.map((n) => n.toString(16)),
                Array.map(String.padStart(2, "0")),
                Array.join(""),
                (hex) => BigInt(`0x${hex}`),
                (value) => ({ value, family: "ipv4" }) as const,
                Effect.succeed
            ),
    }
).annotations({
    identifier: "IPv4Bigint",
    description: "An ipv4 address as a bigint",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
export type $IPv6Family = Schema.Literal<["ipv6"]>;

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type IPv6Family = Schema.Schema.Type<$IPv6Family>;

/**
 * @since 1.0.0
 * @category Schemas
 */
export const IPv6Family: $IPv6Family = Schema.Literal("ipv6").annotations({
    identifier: "IPv6Family",
    description: "An ipv6 family",
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
export type $IPv6 = Schema.transform<
    Schema.filter<typeof Schema.String>,
    Schema.Struct<{
        family: $IPv6Family;
        ip: Schema.BrandSchema<IPv6Brand, Brand.Brand.Unbranded<IPv6Brand>, never>;
    }>
>;

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type IPv6 = Schema.Schema.Type<$IPv6>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type IPv6Encoded = Schema.Schema.Encoded<$IPv6>;

/**
 * An IPv6 address.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "effect/Schema";
 *     import { IPv6 } from "the-wireguard-effect/InternetSchemas";
 *
 *     const decodeIPv6 = Schema.decodeSync(IPv6);
 *     assert.deepEqual(decodeIPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334"), {
 *         family: "ipv6",
 *         ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
 *     });
 *
 *     assert.throws(() =>
 *         decodeIPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334:")
 *     );
 *     assert.throws(() => decodeIPv6("2001::85a3::0000::0370:7334"));
 *     assert.doesNotThrow(() =>
 *         decodeIPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334")
 *     );
 */
export const IPv6: $IPv6 = Schema.transform(
    Function.pipe(
        Schema.String,
        Schema.filter((str) => net.isIPv6(str))
    ),
    Schema.Struct({
        family: IPv6Family,
        ip: Schema.String.pipe(Schema.fromBrand(IPv6Brand)),
    }),
    {
        encode: ({ ip }) => ip,
        decode: (ip) => ({ ip, family: "ipv6" }) as const,
    }
).annotations({
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
export type $IPv6Bigint = Schema.transformOrFail<
    $IPv6,
    Schema.Struct<{
        family: $IPv6Family;
        value: Schema.BrandSchema<IPv6BigintBrand, Brand.Brand.Unbranded<IPv6BigintBrand>, never>;
    }>,
    never
>;

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type IPv6Bigint = Schema.Schema.Type<$IPv6Bigint>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type IPv6BigintEncoded = Schema.Schema.Encoded<$IPv6Bigint>;

/**
 * An IPv6 as a bigint.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "effect/Schema";
 *     import {
 *         IPv6Bigint,
 *         IPv6BigintBrand,
 *     } from "the-wireguard-effect/InternetSchemas";
 *
 *     const y: IPv6BigintBrand = IPv6BigintBrand(748392749382n);
 *     assert.strictEqual(y, 748392749382n);
 *
 *     const decodeIPv6Bigint = Schema.decodeSync(IPv6Bigint);
 *     const encodeIPv6Bigint = Schema.encodeSync(IPv6Bigint);
 *
 *     assert.deepEqual(
 *         decodeIPv6Bigint("4cbd:ff70:e62b:a048:686c:4e7e:a68a:c377"),
 *         { value: 102007852745154114519525620108359287671n, family: "ipv6" }
 *     );
 *     assert.deepEqual(
 *         decodeIPv6Bigint("d8c6:3feb:46e6:b80c:5a07:6227:ac19:caf6"),
 *         { value: 288142618299897818094313964584331496182n, family: "ipv6" }
 *     );
 *
 *     assert.deepEqual(
 *         encodeIPv6Bigint({
 *             value: IPv6BigintBrand(102007852745154114519525620108359287671n),
 *             family: "ipv6",
 *         }),
 *         "4cbd:ff70:e62b:a048:686c:4e7e:a68a:c377"
 *     );
 *     assert.deepEqual(
 *         encodeIPv6Bigint({
 *             value: IPv6BigintBrand(288142618299897818094313964584331496182n),
 *             family: "ipv6",
 *         }),
 *         "d8c6:3feb:46e6:b80c:5a07:6227:ac19:caf6"
 *     );
 */
export const IPv6Bigint: $IPv6Bigint = Schema.transformOrFail(
    IPv6,
    Schema.Struct({
        family: IPv6Family,
        value: Schema.BigIntFromSelf.pipe(Schema.fromBrand(IPv6BigintBrand)),
    }),
    {
        encode: ({ value }) => {
            const hex = value.toString(16).padStart(32, "0");
            const groups = [];
            for (let i = 0; i < 8; i++) {
                groups.push(hex.slice(i * 4, (i + 1) * 4));
            }
            return Schema.decode(IPv6)(groups.join(":")).pipe(Effect.mapError(({ issue }) => issue));
        },
        decode: ({ ip }) => {
            function paddedHex(octet: string): string {
                return parseInt(octet, 16).toString(16).padStart(4, "0");
            }

            let groups: Array<string> = [];
            const halves = ip.split("::");

            // if (halves.length === 2) {
            if (Tuple.isTupleOf(2)(halves)) {
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

            return Effect.succeed({ value: BigInt(`0x${groups.map(paddedHex).join("")}`), family: "ipv6" } as const);
        },
    }
).annotations({
    identifier: "IPv6Bigint",
    description: "An ipv6 address as a bigint",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
export type $Family = Schema.Union<[$IPv4Family, $IPv6Family]>;

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type Family = Schema.Schema.Type<$Family>;

/**
 * @since 1.0.0
 * @category Schemas
 * @see {@link IPv4Family}
 * @see {@link IPv6Family}
 */
export const Family: $Family = Schema.Union(IPv4Family, IPv6Family).annotations({
    identifier: "Family",
    description: "An ipv4 or ipv6 family",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
export type $Address = Schema.Union<[$IPv4, $IPv6]>;

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type Address = Schema.Schema.Type<$Address>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type AddressEncoded = Schema.Schema.Encoded<$Address>;

/**
 * An IP address, which is either an IPv4 or IPv6 address.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "effect/Schema";
 *     import { Address } from "the-wireguard-effect/InternetSchemas";
 *
 *     const decodeAddress = Schema.decodeSync(Address);
 *
 *     assert.throws(() => decodeAddress("1.1.b.1"));
 *     assert.throws(() =>
 *         decodeAddress("2001:0db8:85a3:0000:0000:8a2e:0370:7334:")
 *     );
 *
 *     assert.doesNotThrow(() => decodeAddress("1.1.1.2"));
 *     assert.doesNotThrow(() =>
 *         decodeAddress("2001:0db8:85a3:0000:0000:8a2e:0370:7334")
 *     );
 *
 * @see {@link IPv4}
 * @see {@link IPv6}
 */
export const Address: $Address = Schema.Union(IPv4, IPv6).annotations({
    identifier: "Address",
    description: "An ipv4 or ipv6 address",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
export type $AddressBigint = Schema.Union<[$IPv4Bigint, $IPv6Bigint]>;

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type AddressBigint = Schema.Schema.Type<$AddressBigint>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type AddressBigintEncoded = Schema.Schema.Encoded<$AddressBigint>;

/**
 * An IP address as a bigint.
 *
 * @since 1.0.0
 * @category Schemas
 */
export const AddressBigint: $AddressBigint = Schema.Union(IPv4Bigint, IPv6Bigint).annotations({
    identifier: "AddressBigint",
    description: "An ipv4 or ipv6 address as a bigint",
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
export type $IPv4CidrMask = Schema.Annotable<
    $IPv4CidrMask,
    IPv4CidrMaskBrand,
    Brand.Brand.Unbranded<IPv4CidrMaskBrand>,
    never
>;

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type IPv4CidrMask = Schema.Schema.Type<$IPv4CidrMask>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type IPv4CidrMaskEncoded = Schema.Schema.Encoded<$IPv4CidrMask>;

/**
 * An ipv4 cidr mask, which is a number between 0 and 32.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "effect/Schema";
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
export type $IPv6CidrMask = Schema.Annotable<
    $IPv6CidrMask,
    IPv6CidrMaskBrand,
    Brand.Brand.Unbranded<IPv6CidrMaskBrand>,
    never
>;

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type IPv6CidrMask = Schema.Schema.Type<$IPv6CidrMask>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type IPv6CidrMaskEncoded = Schema.Schema.Encoded<$IPv6CidrMask>;

/**
 * An ipv6 cidr mask, which is a number between 0 and 128.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "effect/Schema";
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
 */
export class CidrBlockBase<_Family extends Family> extends Schema.Class<CidrBlockBase<Family>>("CidrBlockMixin")({
    address: Address,
    mask: Schema.Union(IPv4CidrMask, IPv6CidrMask),
}) {
    /** @since 1.0.0 */
    public readonly family: Family = this.address.family;

    /** @internal */
    private onFamily<OnIPv4, OnIPv6>({
        onIPv4,
        onIPv6,
    }: {
        onIPv4: (self: CidrBlockBase<"ipv4">) => OnIPv4;
        onIPv6: (self: CidrBlockBase<"ipv6">) => OnIPv6;
    }): _Family extends IPv4Family ? OnIPv4 : _Family extends IPv6Family ? OnIPv6 : never {
        type Ret = typeof this.address.family extends IPv4Family
            ? OnIPv4
            : typeof this.address.family extends IPv6Family
              ? OnIPv6
              : never;

        const isIPv4 = (): this is CidrBlockBase<"ipv4"> => this.family === "ipv4";
        const isIPv6 = (): this is CidrBlockBase<"ipv6"> => this.family === "ipv6";

        if (isIPv4()) {
            return onIPv4(this as CidrBlockBase<"ipv4">) as Ret;
        } else if (isIPv6()) {
            return onIPv6(this as CidrBlockBase<"ipv6">) as Ret;
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
    protected get networkAddressAsBigint(): Effect.Effect<
        _Family extends IPv4Family ? IPv4BigintBrand : _Family extends IPv6Family ? IPv6BigintBrand : never,
        ParseResult.ParseError,
        never
    > {
        return Effect.gen(this, function* () {
            const bits = this.family === "ipv4" ? 32 : 128;
            const bigIntegerAddress = yield* this.onFamily({
                onIPv4: (self) => Schema.decode(IPv4Bigint)(self.address.ip),
                onIPv6: (self) => Schema.decode(IPv6Bigint)(self.address.ip),
            });
            const intermediate = bigIntegerAddress.value.toString(2).padStart(bits, "0").slice(0, this.mask);
            const networkAddressString = intermediate + "0".repeat(bits - this.mask);
            const networkAddressBigInt = BigInt(`0b${networkAddressString}`);
            return this.onFamily({
                onIPv4: (_self) => IPv4BigintBrand(networkAddressBigInt),
                onIPv6: (_self) => IPv6BigintBrand(networkAddressBigInt),
            });
        });
    }

    /**
     * The first address in the range given by this address' subnet, often
     * referred to as the Network Address.
     *
     * @since 1.0.0
     */
    public networkAddress(): _Family extends IPv4Family
        ? Effect.Effect<IPv4, ParseResult.ParseError, never>
        : _Family extends IPv6Family
          ? Effect.Effect<IPv6, ParseResult.ParseError, never>
          : never {
        return this.onFamily({
            onIPv4: (self) =>
                Function.pipe(
                    self.networkAddressAsBigint,
                    Effect.flatMap((value) => Schema.encode(IPv4Bigint)({ value, family: "ipv4" })),
                    Effect.flatMap(Schema.decode(IPv4))
                ),
            onIPv6: (self) =>
                Function.pipe(
                    self.networkAddressAsBigint,
                    Effect.flatMap((value) => Schema.encode(IPv6Bigint)({ value, family: "ipv6" })),
                    Effect.flatMap(Schema.decode(IPv6))
                ),
        });
    }

    /**
     * The last address in the range given by this address' subnet, often
     * referred to as the Broadcast Address.
     *
     * @since 1.0.0
     */
    protected get broadcastAddressAsBigint(): Effect.Effect<
        _Family extends IPv4Family ? IPv4BigintBrand : _Family extends IPv6Family ? IPv6BigintBrand : never,
        ParseResult.ParseError,
        never
    > {
        return Effect.gen(this, function* () {
            const bits = this.family === "ipv4" ? 32 : 128;
            const bigIntegerAddress = yield* this.onFamily({
                onIPv4: (self) => Schema.decode(IPv4Bigint)(self.address.ip),
                onIPv6: (self) => Schema.decode(IPv6Bigint)(self.address.ip),
            });
            const intermediate = bigIntegerAddress.value.toString(2).padStart(bits, "0").slice(0, this.mask);
            const broadcastAddressString = intermediate + "1".repeat(bits - this.mask);
            const broadcastAddressBigInt = BigInt(`0b${broadcastAddressString}`);
            return this.onFamily({
                onIPv4: (_self) => IPv4BigintBrand(broadcastAddressBigInt),
                onIPv6: (_self) => IPv6BigintBrand(broadcastAddressBigInt),
            });
        });
    }

    /**
     * The last address in the range given by this address' subnet, often
     * referred to as the Broadcast Address.
     *
     * @since 1.0.0
     */
    public broadcastAddress(): _Family extends IPv4Family
        ? Effect.Effect<IPv4, ParseResult.ParseError, never>
        : _Family extends IPv6Family
          ? Effect.Effect<IPv6, ParseResult.ParseError, never>
          : never {
        return this.onFamily({
            onIPv4: (self) =>
                Function.pipe(
                    self.broadcastAddressAsBigint,
                    Effect.flatMap((value) => Schema.encode(IPv4Bigint)({ value, family: "ipv4" })),
                    Effect.flatMap(Schema.decode(IPv4))
                ),
            onIPv6: (self) =>
                Function.pipe(
                    self.broadcastAddressAsBigint,
                    Effect.flatMap((value) => Schema.encode(IPv6Bigint)({ value, family: "ipv6" })),
                    Effect.flatMap(Schema.decode(IPv6))
                ),
        });
    }

    /**
     * A stream of all addresses in the range given by this address' subnet.
     *
     * @since 1.0.0
     */
    public get range(): _Family extends IPv4Family
        ? Stream.Stream<IPv4, ParseResult.ParseError, never>
        : _Family extends IPv6Family
          ? Stream.Stream<IPv6, ParseResult.ParseError, never>
          : never {
        return this.onFamily({
            onIPv4: (self) =>
                Effect.gen(function* () {
                    const minValue = yield* self.networkAddressAsBigint;
                    const maxValue = yield* self.broadcastAddressAsBigint;
                    return Function.pipe(
                        Stream.iterate(minValue, (x) => IPv4BigintBrand(x + 1n)),
                        Stream.takeWhile((n) => n <= maxValue),
                        Stream.flatMap((value) => Schema.encode(IPv4Bigint)({ value, family: "ipv4" })),
                        Stream.mapEffect(Schema.decode(IPv4))
                    );
                }).pipe(Stream.unwrap),
            onIPv6: (self) =>
                Effect.gen(function* () {
                    const minValue = yield* self.networkAddressAsBigint;
                    const maxValue = yield* self.broadcastAddressAsBigint;
                    return Function.pipe(
                        Stream.iterate(minValue, (x) => IPv6BigintBrand(x + 1n)),
                        Stream.takeWhile((n) => n <= maxValue),
                        Stream.flatMap((value) => Schema.encode(IPv6Bigint)({ value, family: "ipv6" })),
                        Stream.mapEffect(Schema.decode(IPv6))
                    );
                }).pipe(Stream.unwrap),
        });
    }

    /**
     * The total number of addresses in the range given by this address' subnet.
     *
     * @since 1.0.0
     */
    public get total(): Effect.Effect<bigint, ParseResult.ParseError, never> {
        return Effect.gen(this, function* () {
            const minValue: bigint = yield* this.networkAddressAsBigint;
            const maxValue: bigint = yield* this.broadcastAddressAsBigint;
            return maxValue - minValue + 1n;
        });
    }

    /**
     * Finds the smallest CIDR block that contains all the given IP addresses.
     *
     * @since 1.0.0
     */
    public static readonly cidrBlockForRange = <_Family extends Family>(
        inputs: _Family extends IPv4Family ? Array.NonEmptyReadonlyArray<IPv4> : Array.NonEmptyReadonlyArray<IPv6>
    ): _Family extends IPv4Family
        ? Effect.Effect<CidrBlockBase<"ipv4">, ParseResult.ParseError, never>
        : Effect.Effect<CidrBlockBase<"ipv6">, ParseResult.ParseError, never> =>
        Effect.gen(function* () {
            const bigIntMinAndMax = (args: Array.NonEmptyReadonlyArray<bigint>) => {
                return args.reduce(
                    ([min, max], e) => {
                        return [e < min ? e : min, e > max ? e : max] as const;
                    },
                    [args[0], args[0]] as const
                );
            };

            const bigints = yield* Function.pipe(
                inputs as Array.NonEmptyReadonlyArray<IPv4 | IPv6>,
                Array.map((address) =>
                    address.family === "ipv4"
                        ? Schema.decode(IPv4Bigint)(address.ip)
                        : Schema.decode(IPv6Bigint)(address.ip)
                ),
                Array.map((x) => x as Effect.Effect<IPv4Bigint | IPv6Bigint, ParseResult.ParseError, never>),
                Array.map(Effect.map(({ value }) => value)),
                Effect.all
            );

            const bits = inputs[0].family === "ipv4" ? 32 : 128;
            const [min, max] = bigIntMinAndMax(bigints);
            const leadingZerosInMin = bits - min.toString(2).length;
            const leadingZerosInMax = bits - max.toString(2).length;

            const cidrMask = Math.min(leadingZerosInMin, leadingZerosInMax);
            const cidrAddress =
                inputs[0].family === "ipv4"
                    ? yield* Schema.encode(IPv4Bigint)({ value: IPv4BigintBrand(min), family: "ipv4" })
                    : yield* Schema.encode(IPv6Bigint)({ value: IPv6BigintBrand(min), family: "ipv6" });

            return yield* Schema.decode(CidrBlockFromString)(`${cidrAddress}/${cidrMask}`);
        }) as _Family extends IPv4Family
            ? Effect.Effect<CidrBlockBase<"ipv4">, ParseResult.ParseError, never>
            : Effect.Effect<CidrBlockBase<"ipv6">, ParseResult.ParseError, never>;
}

/**
 * @since 1.0.0
 * @category Api interface
 */
export type $IPv4CidrBlock = Schema.Annotable<
    $IPv4CidrBlock,
    CidrBlockBase<"ipv4">,
    {
        readonly address: string;
        readonly mask: number;
    },
    never
>;

// export interface $IPv4CidrBlock
//     extends Schema.transformOrFail<
//         Schema.Struct<{
//             address: $IPv4;
//             mask: $IPv4CidrMask;
//         }>,
//         typeof CidrBlockBase<"ipv4">,
//         never
//     > {}

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type IPv4CidrBlock = CidrBlockBase<"ipv4">;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type IPv4CidrBlockEncoded = Schema.Schema.Encoded<$IPv4CidrBlock>;

/**
 * @since 1.0.0
 * @category Schemas
 */
export const IPv4CidrBlock: $IPv4CidrBlock = Schema.transformOrFail(
    Schema.Struct({ address: IPv4, mask: IPv4CidrMask }),
    CidrBlockBase,
    {
        encode: (data) =>
            Effect.gen(function* () {
                const address = yield* Schema.decode(IPv4)(data.address);
                const mask = yield* Schema.decode(IPv4CidrMask)(data.mask);
                return { address, mask } as const;
            }).pipe(Effect.mapError(({ issue }) => issue)),
        decode: (data) => ParseResult.succeed({ address: data.address.ip, mask: data.mask }),
    }
).annotations({
    identifier: "IPv4CidrBlock",
    description: "An ipv4 cidr block",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
export type $IPv4CidrBlockFromString = Schema.Annotable<
    $IPv4CidrBlockFromString,
    CidrBlockBase<"ipv4">,
    `${string}/${number}`,
    never
>;

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type IPv4CidrBlockFromString = Schema.Schema.Type<$IPv4CidrBlockFromString>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type IPv4CidrBlockFromStringEncoded = Schema.Schema.Encoded<$IPv4CidrBlockFromString>;

/**
 * A schema that transforms a `string` into a `CidrBlock`.
 *
 * @since 1.0.0
 * @category Schemas
 */
export const IPv4CidrBlockFromString: $IPv4CidrBlockFromString = Schema.transform(
    Schema.TemplateLiteral(Schema.String, Schema.Literal("/"), Schema.Number),
    IPv4CidrBlock,
    {
        decode: (str) => {
            const [address, mask] = internal.splitLiteral(str, "/");
            return { address, mask: Number.parseInt(mask, 10) } as const;
        },
        encode: ({ address, mask }) => `${address}/${mask}` as const,
    }
).annotations({
    identifier: "IPv4CidrBlockFromString",
    description: "An ipv4 cidr block from string",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
export type $IPv6CidrBlock = Schema.transformOrFail<
    Schema.Struct<{
        address: $IPv6;
        mask: $IPv6CidrMask;
    }>,
    typeof CidrBlockBase<"ipv6">,
    never
>;

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type IPv6CidrBlock = CidrBlockBase<"ipv6">;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type IPv6CidrBlockEncoded = Schema.Schema.Encoded<$IPv6CidrBlock>;

/**
 * @since 1.0.0
 * @category Schemas
 */
export const IPv6CidrBlock: $IPv6CidrBlock = Schema.transformOrFail(
    Schema.Struct({ address: IPv6, mask: IPv6CidrMask }),
    CidrBlockBase,
    {
        encode: (data) =>
            Effect.gen(function* () {
                const address = yield* Schema.decode(IPv6)(data.address);
                const mask = yield* Schema.decode(IPv6CidrMask)(data.mask);
                return { address, mask } as const;
            }).pipe(Effect.mapError(({ issue }) => issue)),
        decode: (data) => ParseResult.succeed({ address: data.address.ip, mask: data.mask }),
    }
).annotations({
    identifier: "IPv6CidrBlock",
    description: "An ipv6 cidr block",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
export type $IPv6CidrBlockFromString = Schema.Annotable<
    $IPv6CidrBlockFromString,
    CidrBlockBase<"ipv6">,
    `${string}/${number}`,
    never
>;

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type IPv6CidrBlockFromString = Schema.Schema.Type<$IPv6CidrBlockFromString>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type IPv6CidrBlockFromStringEncoded = Schema.Schema.Encoded<$IPv6CidrBlockFromString>;

/**
 * A schema that transforms a `string` into a `CidrBlock`.
 *
 * @since 1.0.0
 * @category Schemas
 */
export const IPv6CidrBlockFromString: $IPv6CidrBlockFromString = Schema.transform(
    Schema.TemplateLiteral(Schema.String, Schema.Literal("/"), Schema.Number),
    IPv6CidrBlock,
    {
        decode: (str) => {
            const [address, mask] = internal.splitLiteral(str, "/");
            return { address, mask: Number.parseInt(mask, 10) } as const;
        },
        encode: ({ address, mask }) => `${address}/${mask}` as const,
    }
).annotations({
    identifier: "IPv6CidrBlockFromString",
    description: "An ipv6 cidr block from string",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
export type $CidrBlock = Schema.Union<[$IPv4CidrBlock, $IPv6CidrBlock]>;

/**
 * @since 1.0.0
 * @category Schemas
 */
export const CidrBlock: $CidrBlock = Schema.Union(IPv4CidrBlock, IPv6CidrBlock);

/**
 * @since 1.0.0
 * @category Api interface
 */
export type $CidrBlockFromString = Schema.Annotable<
    $CidrBlockFromString,
    CidrBlockBase<"ipv4"> | CidrBlockBase<"ipv6">,
    `${string}/${number}`,
    never
>;

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type CidrBlockFromString = Schema.Schema.Type<$CidrBlockFromString>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type CidrBlockFromStringEncoded = Schema.Schema.Encoded<$CidrBlockFromString>;

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
            const [address, mask] = internal.splitLiteral(str, "/");
            return { address, mask: Number.parseInt(mask, 10) } as const;
        },
        encode: ({ address, mask }) => `${address}/${mask}` as const,
    }
).annotations({
    identifier: "CidrBlockFromString",
    description: "A cidr block",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
export type $IPv4Endpoint = Schema.Annotable<
    $IPv4Endpoint,
    { readonly address: IPv4; readonly natPort: PortBrand; readonly listenPort: PortBrand },
    | `${string}:${number}`
    | `${string}:${number}:${number}`
    | { readonly ip: string; readonly port: number; readonly family: IPv4Family }
    | { readonly ip: string; readonly natPort: number; readonly listenPort: number; readonly family: IPv4Family },
    never
>;

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type IPv4Endpoint = Schema.Schema.Type<$IPv4Endpoint>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type IPv4EndpointEncoded = Schema.Schema.Encoded<$IPv4Endpoint>;

/**
 * An IPv4 wireguard endpoint, which consists of an IPv4 address followed by a
 * nat port then an optional local port. If only one port is provided, it is
 * assumed that the nat port and listen port are the same.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "effect/Schema";
 *     import { IPv4Endpoint } from "the-wireguard-effect/InternetSchemas";
 *
 *     const decodeEndpoint = Schema.decodeSync(IPv4Endpoint);
 *     const endpoint1 = decodeEndpoint("1.2.3.4:51820");
 *     const endpoint2 = decodeEndpoint("1.2.3.4:51820:41820");
 *
 *     const endpoint3 = decodeEndpoint({
 *         ip: "1.2.3.4",
 *         port: 51820,
 *         family: "ipv4",
 *     });
 *
 *     const endpoint4 = decodeEndpoint({
 *         ip: "1.2.3.4",
 *         natPort: 51820,
 *         listenPort: 41820,
 *         family: "ipv4",
 *     });
 */
export const IPv4Endpoint: $IPv4Endpoint = Schema.transform(
    Schema.Union(
        Schema.Struct({ ip: Schema.String, port: Schema.Number, family: IPv4Family }),
        Schema.Struct({ ip: Schema.String, natPort: Schema.Number, listenPort: Schema.Number, family: IPv4Family }),
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
                : internal.splitLiteral(data, ":");

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
export type $IPv6Endpoint = Schema.Annotable<
    $IPv6Endpoint,
    { readonly address: IPv6; readonly natPort: PortBrand; readonly listenPort: PortBrand },
    | `[${string}]:${number}`
    | `[${string}]:${number}:${number}`
    | { readonly ip: string; readonly port: number; family: IPv6Family }
    | { readonly ip: string; readonly natPort: number; readonly listenPort: number; family: IPv6Family },
    never
>;

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type IPv6Endpoint = Schema.Schema.Type<$IPv6Endpoint>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type IPv6EndpointEncoded = Schema.Schema.Encoded<$IPv6Endpoint>;

/**
 * An IPv6 wireguard endpoint, which consists of an IPv6 address in square
 * brackets followed by a nat port then an optional local port. If only one port
 * is provided, it is assumed that the nat port and listen port are the same.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "effect/Schema";
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
 *         family: "ipv6",
 *     });
 *
 *     const endpoint4 = decodeEndpoint({
 *         ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
 *         natPort: 51820,
 *         listenPort: 41820,
 *         family: "ipv6",
 *     });
 */
export const IPv6Endpoint: $IPv6Endpoint = Schema.transform(
    Schema.Union(
        Schema.Struct({ ip: Schema.String, port: Schema.Number, family: IPv6Family }),
        Schema.Struct({ ip: Schema.String, natPort: Schema.Number, listenPort: Schema.Number, family: IPv6Family }),
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
                      internal.splitLiteral(data, "]")[0].slice(1),
                      ...internal.tail(internal.splitLiteral(internal.splitLiteral(data, "]")[1], ":")),
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
export type $HostnameEndpoint = Schema.Annotable<
    $HostnameEndpoint,
    { readonly host: string; readonly natPort: PortBrand; readonly listenPort: PortBrand },
    | `${string}:${number}`
    | `${string}:${number}:${number}`
    | { readonly host: string; readonly port: number }
    | { readonly host: string; readonly natPort: number; readonly listenPort: number },
    never
>;

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type HostnameEndpoint = Schema.Schema.Type<$HostnameEndpoint>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type HostnameEndpointEncoded = Schema.Schema.Encoded<$HostnameEndpoint>;

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
                : internal.splitLiteral(data, ":");

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
export type $Endpoint = Schema.Union<[$IPv4Endpoint, $IPv6Endpoint, $HostnameEndpoint]>;

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type Endpoint = Schema.Schema.Type<$Endpoint>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type EndpointEncoded = Schema.Schema.Encoded<$Endpoint>;

/**
 * A wireguard endpoint, which is either an IPv4 or IPv6 endpoint.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "effect/Schema";
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
 *         family: "ipv4",
 *     });
 *
 *     const endpoint4: Endpoint = decodeEndpoint({
 *         ip: "1.2.3.4",
 *         natPort: 51820,
 *         listenPort: 41820,
 *         family: "ipv4",
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
 *         family: "ipv6",
 *     });
 *
 *     const endpoint8: Endpoint = decodeEndpoint({
 *         ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
 *         natPort: 51820,
 *         listenPort: 41820,
 *         family: "ipv6",
 *     });
 *
 * @see {@link IPv4Endpoint}
 * @see {@link IPv6Endpoint}
 * @see {@link HostnameEndpoint}
 */
export const Endpoint: $Endpoint = Schema.Union(IPv4Endpoint, IPv6Endpoint, HostnameEndpoint).annotations({
    identifier: "Endpoint",
    description: "An ipv4, ipv6, or hostname wireguard endpoint",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
export type $IPv4SetupData = Schema.Tuple<[$IPv4Endpoint, $IPv4]>;

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type IPv4SetupData = Schema.Schema.Type<$IPv4SetupData>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type IPv4SetupDataEncoded = Schema.Schema.Encoded<$IPv4SetupData>;

/**
 * A wireguard setup data, which consists of an endpoint followed by an address.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "effect/Schema";
 *     import { SetupData } from "the-wireguard-effect/InternetSchemas";
 *
 *     const decodeSetupData = Schema.decodeSync(SetupData);
 *     const setupData = decodeSetupData(["1.1.1.1:51280", "10.0.0.1"]);
 *
 * @see {@link IPv4}
 * @see {@link IPv4EndpointSchema}
 */
export const IPv4SetupData: $IPv4SetupData = Schema.Tuple(IPv4Endpoint, IPv4).annotations({
    identifier: "SetupData",
    description: "A wireguard setup data",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
export type $IPv6SetupData = Schema.Tuple<[$IPv6Endpoint, $IPv6]>;

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type IPv6SetupData = Schema.Schema.Type<$IPv6SetupData>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type IPv6SetupDataEncoded = Schema.Schema.Encoded<$IPv6SetupData>;

/**
 * A wireguard setup data, which consists of an endpoint followed by an address.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "effect/Schema";
 *     import { SetupData } from "the-wireguard-effect/InternetSchemas";
 *
 *     const decodeSetupData = Schema.decodeSync(SetupData);
 *     const setupData = decodeSetupData(["1.1.1.1:51280", "10.0.0.1"]);
 *
 * @see {@link IPv6}
 * @see {@link IPv6EndpointSchema}
 */
export const IPv6SetupData: $IPv6SetupData = Schema.Tuple(IPv6Endpoint, IPv6).annotations({
    identifier: "SetupData",
    description: "A wireguard setup data",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
export type $HostnameIPv4SetupData = Schema.Tuple<[$HostnameEndpoint, $IPv4]>;

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type HostnameIPv4SetupData = Schema.Schema.Type<$HostnameIPv4SetupData>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type HostnameIPv4SetupDataEncoded = Schema.Schema.Encoded<$HostnameIPv4SetupData>;

/**
 * A wireguard setup data, which consists of an endpoint followed by an address.
 *
 * @since 1.0.0
 * @category Schemas
 * @see {@link IPv4}
 * @see {@link HostnameEndpoint}
 */
export const HostnameIPv4SetupData: $HostnameIPv4SetupData = Schema.Tuple(HostnameEndpoint, IPv4).annotations({
    identifier: "HostnameIPv4SetupData",
    description: "A wireguard hostname+ipv4 setup data",
});

/**
 * @since 1.0.0
 * @category Api interface
 */
export type $HostnameIPv6SetupData = Schema.Tuple<[$HostnameEndpoint, $IPv6]>;

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type HostnameIPv6SetupData = Schema.Schema.Type<$HostnameIPv6SetupData>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type HostnameIPv6SetupDataEncoded = Schema.Schema.Encoded<$HostnameIPv6SetupData>;

/**
 * A wireguard setup data, which consists of an endpoint followed by an address.
 *
 * @since 1.0.0
 * @category Schemas
 * @see {@link IPv6}
 * @see {@link HostnameEndpoint}
 */
export const HostnameIPv6SetupData: $HostnameIPv6SetupData = Schema.Tuple(HostnameEndpoint, IPv6).annotations({
    identifier: "HostnameIPv6SetupData",
    description: "A wireguard hostname+ipv6 setup data",
});
/**
 * @since 1.0.0
 * @category Api interface
 */
export type $SetupData = Schema.Union<[$IPv4SetupData, $IPv6SetupData, $HostnameIPv4SetupData, $HostnameIPv6SetupData]>;

/**
 * @since 1.0.0
 * @category Decoded types
 */
export type SetupData = Schema.Schema.Type<$SetupData>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type SetupDataEncoded = Schema.Schema.Encoded<$SetupData>;

/**
 * A wireguard setup data, which consists of an endpoint followed by an address.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "effect/Schema";
 *     import { SetupData } from "the-wireguard-effect/InternetSchemas";
 *
 *     const decodeSetupData = Schema.decodeSync(SetupData);
 *     const setupData = decodeSetupData(["1.1.1.1:51280", "10.0.0.1"]);
 *
 * @see {@link Address}
 * @see {@link Endpoint}
 */
export const SetupData: $SetupData = Schema.Union(
    IPv4SetupData,
    IPv6SetupData,
    HostnameIPv4SetupData,
    HostnameIPv6SetupData
).annotations({
    identifier: "SetupData",
    description: "A wireguard setup data",
});
