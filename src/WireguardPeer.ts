/**
 * Wireguard peer schema definitions
 *
 * @since 1.0.0
 */

import type * as Brand from "effect/Brand";

import * as Array from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Number from "effect/Number";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import * as SchemaGetter from "effect/SchemaGetter";
import * as SchemaIssue from "effect/SchemaIssue";

import * as InternetSchemas from "effect-schemas/Internet";
import * as ini from "ini";

import * as internalWireguardPeer from "./internal/wireguardPeer.ts";
import * as WireguardInternetSchemas from "./InternetSchemas.ts";
import * as WireguardKey from "./WireguardKey.ts";

/**
 * A wireguard peer configuration.
 *
 * @since 1.0.0
 * @category Datatypes
 * @example
 *     ```ts
 *
 *     import * as Schema from "effect/Schema";
 *     import * as WireguardKey from "the-wireguard-effect/WireguardKey";
 *
 *     import { WireguardPeer } from "the-wireguard-effect/WireguardPeer";
 *
 *     const preshareKey = WireguardKey.generatePreshareKey();
 *     const { publicKey, privateKey: _privateKey } =
 *         WireguardKey.generateKeyPair();
 *
 *     const peerSchemaInstantiation = Schema.decode(WireguardPeer)({
 *         PublicKey: publicKey,
 *         PresharedKey: preshareKey,
 *         Endpoint: "192.168.0.1:51820",
 *         AllowedIPs: new Set(["192.168.0.0/24"]),
 *         PersistentKeepalive: 20,
 *     });
 *     ```;
 */
export class WireguardPeer extends internalWireguardPeer.WireguardPeerConfigVariantSchema.Class<WireguardPeer>(
    "WireguardPeer"
)({
    /**
     * The persistent keepalive interval in seconds, 0 disables it. The
     * difference between Option.none and Option.some(0) is important when
     * performing something like a config update operation on an interface
     * because Option.none will not include the keep alive setting in the update
     * request, so it will remain the same as it was before the update, whereas
     * Option.some(0) will disable the keep alive setting.
     */
    PersistentKeepalive: WireguardInternetSchemas.DurationFromSeconds.pipe(Schema.OptionFromOptionalNullOr),

    /**
     * The collection of IPs/masks that will be accepted from this peer. If an
     * identical value already exists as part of a prior peer, the allowed IP
     * entry will be removed from that peer and added to this peer.
     */
    AllowedIPs: Schema.ReadonlySet(InternetSchemas.CidrBlockFromString).pipe(
        Schema.withDecodingDefault(Effect.succeed(new Set([])))
    ),

    /**
     * The value for this key is either IP:port for IPv4 or [IP]:port for IPv6
     * or some.hostname.com:port for a hostname endpoint. The endpoint is
     * optional and, if not supplied, the remote peer must connect first (so
     * they should have the endpoint set to know where to connect to) and this
     * client will just send requests back to the remote peer's source IP and
     * port.
     */
    Endpoint: WireguardInternetSchemas.Endpoint.pipe(Schema.NullOr, Schema.optional),

    /** Lowercase hex-encoded public key of the new peer entry. */
    PublicKey: WireguardKey.WireguardKey,

    /**
     * The preshared key is optional and is a lowercase hex-encoded key. The
     * value may be an all zero string in the case of a set operation, in which
     * case it indicates that the preshared-key should be removed.
     */
    PresharedKey: WireguardKey.WireguardKey.pipe(Schema.OptionFromOptionalNullOr),

    /** The number of received bytes. */
    rxBytes: internalWireguardPeer.WireguardPeerConfigVariantSchema.FieldOnly(["uapi"])(Schema.NumberFromString),

    /** The number of transmitted bytes. */
    txBytes: internalWireguardPeer.WireguardPeerConfigVariantSchema.FieldOnly(["uapi"])(Schema.NumberFromString),

    /**
     * The number of seconds since the most recent handshake, expressed relative
     * to the Unix epoch.
     */
    lastHandshake: internalWireguardPeer.WireguardPeerConfigVariantSchema.FieldOnly(["uapi"])(
        Function.pipe(
            Schema.NumberFromString,
            Schema.decode({
                decode: SchemaGetter.passthrough(),
                encode: SchemaGetter.transform(Number.multiply(1000)),
            }),
            Schema.decodeTo(Schema.DateTimeUtcFromMillis)
        )
    ),
}) {}

/**
 * A wireguard peer configuration encoded in INI format.
 *
 * @since 1.0.0
 * @category Transformations
 * @example
 *     ```ts
 *
 *     import * as Effect from "effect/Effect";
 *     import * as Function from "effect/Function";
 *     import * as Schema from "effect/Schema";
 *     import * as WireguardKey from "the-wireguard-effect/WireguardKey";
 *     import * as WireguardPeer from "the-wireguard-effect/WireguardPeer";
 *
 *     const preshareKey = WireguardKey.generatePreshareKey();
 *     const { publicKey, privateKey: _privateKey } =
 *         WireguardKey.generateKeyPair();
 *
 *     const peer = Schema.decode(WireguardPeer.WireguardPeer)({
 *         PublicKey: publicKey,
 *         PresharedKey: preshareKey,
 *         AllowedIPs: new Set(["192.168.0.0/24"]),
 *         Endpoint: "192.168.0.1:51820",
 *         PersistentKeepalive: 20,
 *     });
 *
 *     const iniPeer = Function.pipe(
 *         peer,
 *         Effect.flatMap(Schema.encode(WireguardPeer.WireguardPeer)),
 *         Effect.flatMap(Schema.decode(WireguardPeer.WireguardIniPeer))
 *     );
 *     ```;
 *
 * @see {@link WireguardPeer}
 */
export const WireguardIniPeer = WireguardPeer.pipe(
    Schema.decodeTo(Schema.String, {
        // The types really help make sure that everything in the output will be in the right format
        decode: SchemaGetter.transform((peer: WireguardPeer) => {
            const publicKey: `PublicKey = ${string & Brand.Brand<"WireguardKey">}\n` =
                `PublicKey = ${peer.PublicKey}\n` as const;

            const presharedKey: "" | `PresharedKey = ${string & Brand.Brand<"WireguardKey">}\n` = Function.pipe(
                peer.PresharedKey,
                Option.map((key) => `PresharedKey = ${key}\n` as const),
                Option.getOrElse(() => "" as const)
            );

            const endpoint: "" | `Endpoint = ${string}:${Schema.Schema.Type<typeof InternetSchemas.Port>}\n` =
                Function.pipe(
                    peer.Endpoint,
                    Option.fromNullishOr,
                    Option.map((endpoint) => {
                        const host = "address" in endpoint ? endpoint.address.ip : endpoint.host;
                        return `Endpoint = ${host}:${endpoint.natPort}\n` as const;
                    }),
                    Option.getOrElse(() => "" as const)
                );

            const keepAlive: "" | `PersistentKeepalive = ${number}\n` = Function.pipe(
                peer.PersistentKeepalive,
                Option.map((keepalive) => `PersistentKeepalive = ${Duration.toSeconds(keepalive)}\n` as const),
                Option.getOrElse(() => "" as const)
            );

            const aps: `AllowedIPs = ${string}` = Function.pipe(
                peer.AllowedIPs,
                Array.fromIterable,
                Array.map((ap) => `${ap.address.ip}/${ap.mask}` as const),
                Array.map((ap) => `${ap}` as const),
                Array.join(", "),
                (x) => `AllowedIPs = ${x}` as const
            );

            return `[Peer]\n${publicKey}${presharedKey}${endpoint}${keepAlive}${aps}\n` as const;
        }),

        // Encoding is trivial using the ini library
        encode: SchemaGetter.transformOrFail((iniPeer: string) =>
            Function.pipe(
                iniPeer,
                ini.decode,
                (data) =>
                    data as {
                        PublicKey: string;
                        PresharedKey?: string | undefined | null;
                        PersistentKeepalive?: string | undefined | null;
                        Endpoint?: (typeof WireguardInternetSchemas.Endpoint)["Encoded"] | undefined | null;
                        AllowedIPs?:
                            | Array<(typeof InternetSchemas.CidrBlockFromString)["Encoded"]>
                            | (typeof InternetSchemas.CidrBlockFromString)["Encoded"]
                            | undefined
                            | null;
                    },
                ({ AllowedIPs, Endpoint, PersistentKeepalive, PresharedKey, PublicKey }) => ({
                    PublicKey,
                    PresharedKey,
                    Endpoint,
                    PersistentKeepalive: Function.pipe(
                        PersistentKeepalive,
                        Option.fromNullishOr,
                        Option.flatMap(Number.parse),
                        Option.getOrUndefined
                    ),
                    AllowedIPs: Function.pipe(
                        AllowedIPs,
                        Option.fromNullishOr,
                        Option.map((aps) => new Set(Array.isArray(aps) ? aps : [aps])),
                        Option.getOrUndefined
                    ),
                }),
                Schema.decodeEffect(WireguardPeer, { onExcessProperty: "error" }),
                Effect.mapError(({ issue }) => issue)
            )
        ),
    }),
    Schema.annotate({
        identifier: "WireguardIniPeer",
        description: "A wireguard ini peer configuration",
    })
);

/**
 * @since 1.0.0
 * @category Schemas
 * @see https://www.wireguard.com/xplatform/
 */
export const WireguardUapiSetPeer = WireguardPeer.pipe(
    Schema.decodeTo(Schema.String, {
        encode: SchemaGetter.fail(
            (input) => new SchemaIssue.Forbidden(input, { message: "Can not encode a UAPI set peer" })
        ),
        decode: SchemaGetter.transform((peer: WireguardPeer) => {
            const publicKey: `public_key=${string}\n` = Function.pipe(
                peer.PublicKey,
                (key) => Buffer.from(key, "base64").toString("hex"),
                (hex) => `public_key=${hex}\n` as const
            );

            const presharedKeyHex: "" | `preshared_key=${string}\n` = Function.pipe(
                peer.PresharedKey,
                Option.map((key) => Buffer.from(key, "base64").toString("hex")),
                Option.map((hex) => `preshared_key=${hex}\n` as const),
                Option.getOrElse(() => "" as const)
            );

            const endpoint: "" | `endpoint=${string}:${Schema.Schema.Type<typeof InternetSchemas.Port>}\n` =
                Function.pipe(
                    peer.Endpoint,
                    Option.fromNullishOr,
                    Option.map((endpoint) => {
                        const host = "address" in endpoint ? endpoint.address.ip : endpoint.host;
                        return `endpoint=${host}:${endpoint.natPort}\n` as const;
                    }),
                    Option.getOrElse(() => "" as const)
                );

            const keepAlive: "" | `persistent_keepalive_interval=${number}\n` = Function.pipe(
                peer.PersistentKeepalive,
                Option.map(Duration.toSeconds),
                Option.map((seconds) => `persistent_keepalive_interval=${seconds}\n` as const),
                Option.getOrElse(() => "" as const)
            );

            const aps: Array<`allowed_ip=${string}/${number}`> = Function.pipe(
                peer.AllowedIPs,
                Array.fromIterable,
                Array.map((ap) => `${ap.address.ip}/${ap.mask}` as const),
                Array.map((ap) => `allowed_ip=${ap}` as const)
            );

            return `${publicKey}${presharedKeyHex}${endpoint}${keepAlive}${aps.join("\n")}\n`;
        }),
    }),
    Schema.annotate({
        identifier: "WireguardUapiSetPeer",
        description: "A wireguard uapi peer configuration",
    })
);

/**
 * @since 1.0.0
 * @category Schemas
 * @see https://www.wireguard.com/xplatform/
 */
export const WireguardUapiGetPeer = Schema.String.pipe(
    Schema.decodeTo(WireguardPeer["uapi"], {
        encode: SchemaGetter.fail(
            (input) => new SchemaIssue.Forbidden(input, { message: "Can not encode a UAPI get peer" })
        ),

        decode: SchemaGetter.transform((uapiPeer: string) => {
            const data = ini.decode(uapiPeer);

            const {
                allowed_ip,
                endpoint,
                last_handshake_time_sec,
                persistent_keepalive_interval,
                preshared_key,
                public_key,
                rx_bytes,
                tx_bytes,
            } = data as {
                allowed_ip:
                    | (typeof InternetSchemas.CidrBlockFromString)["Encoded"]
                    | Array<(typeof InternetSchemas.CidrBlockFromString)["Encoded"]>
                    | undefined
                    | null;
                endpoint: (typeof WireguardInternetSchemas.Endpoint)["Encoded"] | undefined | null;
                last_handshake_time_sec: string;
                persistent_keepalive_interval: string | undefined | null;
                preshared_key: string | undefined | null;
                public_key: string;
                rx_bytes: string;
                tx_bytes: string;
            };

            const publicKey = Buffer.from(public_key, "hex").toString("base64");
            const presharedKey = Function.pipe(
                preshared_key,
                Option.fromNullishOr,
                Option.map((hex) => Buffer.from(hex, "hex").toString("base64")),
                Option.getOrUndefined
            );

            const allowedIps = Function.pipe(
                allowed_ip,
                Option.fromNullishOr,
                Option.map((aps) => new Set(Array.isArray(aps) ? aps : [aps])),
                Option.getOrUndefined
            );
            const keepAlive = Function.pipe(
                persistent_keepalive_interval,
                Option.fromNullishOr,
                Option.flatMap(Number.parse),
                Option.getOrUndefined
            );

            return {
                rxBytes: rx_bytes,
                txBytes: tx_bytes,
                Endpoint: endpoint,
                PublicKey: publicKey,
                PresharedKey: presharedKey,
                lastHandshake: last_handshake_time_sec,
                AllowedIPs: allowedIps,
                PersistentKeepalive: keepAlive,
            };
        }),
    }),
    Schema.annotate({
        identifier: "WireguardUapiGetPeer",
        description: "A wireguard uapi peer configuration",
    })
);

/**
 * @since 1.0.0
 * @category Refinements
 */
export const hasBidirectionalTraffic = (
    wireguardPeer: Schema.Schema.Type<(typeof WireguardPeer)["uapi"]>
): Effect.Effect<boolean, never, never> => Effect.succeed(wireguardPeer.rxBytes > 0 && wireguardPeer.txBytes > 0);

/**
 * @since 1.0.0
 * @category Refinements
 */
export const hasHandshakedRecently = (
    wireguardPeer: Schema.Schema.Type<(typeof WireguardPeer)["uapi"]>
): Effect.Effect<boolean, never, never> =>
    Effect.Do.pipe(
        Effect.bind("now", () => DateTime.now),
        Effect.let("threshold", () => Duration.isLessThanOrEqualTo(Duration.seconds(30))),
        Effect.map(({ now, threshold }) => threshold(DateTime.distance(wireguardPeer.lastHandshake, now)))
    );
