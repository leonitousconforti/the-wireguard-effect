/**
 * Wireguard peer schema definitions
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
import * as Number from "effect/Number";
import * as Option from "effect/Option";
import * as ini from "ini";

import * as InternetSchemas from "./InternetSchemas.js";
import * as WireguardKey from "./WireguardKey.js";

/**
 * A wireguard peer configuration.
 *
 * @since 1.0.0
 * @category Datatypes
 * @example
 *     import * as Schema from "@effect/schema/Schema";
 *     import * as Duration from "effect/Duration";
 *     import * as Option from "effect/Option";
 *     import * as InternetSchemas from "the-wireguard-effect/InternetSchemas";
 *     import * as WireguardKey from "the-wireguard-effect/WireguardKey";
 *
 *     import { WireguardPeer } from "the-wireguard-effect/WireguardPeer";
 *
 *     const preshareKey = WireguardKey.generatePreshareKey();
 *     const { publicKey, privateKey: _privateKey } =
 *         WireguardKey.generateKeyPair();
 *
 *     // WireguardPeer
 *     const peerDirectInstantiation = new WireguardPeer({
 *         PublicKey: publicKey,
 *         AllowedIPs: [
 *             InternetSchemas.CidrBlock({
 *                 ipv4: InternetSchemas.IPv4("192.168.0.0"),
 *                 mask: InternetSchemas.IPv4CidrMask(24),
 *             }),
 *         ],
 *         Endpoint: InternetSchemas.Endpoint(
 *             InternetSchemas.IPv4Endpoint({
 *                 ip: InternetSchemas.IPv4("192.168.0.1"),
 *                 natPort: InternetSchemas.Port(51820),
 *                 listenPort: InternetSchemas.Port(51820),
 *             })
 *         ),
 *         PersistentKeepalive: Duration.seconds(20),
 *         PresharedKey: Option.none(),
 *     });
 *
 *     // Effect.Effect<WireguardPeer, ParseResult.ParseError, never>
 *     const peerSchemaInstantiation = Schema.decode(WireguardPeer)({
 *         PublicKey: publicKey,
 *         PresharedKey: preshareKey,
 *         Endpoint: "192.168.0.1:51820",
 *         AllowedIPs: ["192.168.0.0/24"],
 *         PersistentKeepalive: Duration.seconds(20),
 *     });
 */
export class WireguardPeer extends Schema.Class<WireguardPeer>("WireguardPeer")({
    /**
     * The persistent keepalive interval in seconds, 0 disables it. The
     * difference between Option.none and Option.some(0) is important when
     * performing something like a config update operation on an interface
     * because Option.none will not include the keep alive setting in the update
     * request, so it will remain the same as it was before the update, whereas
     * Option.some(0) will disable the keep alive setting.
     */
    PersistentKeepalive: Schema.optionalWith(InternetSchemas.DurationFromSeconds, {
        as: "Option",
        nullable: true,
    }),

    /**
     * The collection of IPs/masks that will be accepted from this peer. If an
     * identical value already exists as part of a prior peer, the allowed IP
     * entry will be removed from that peer and added to this peer.
     */
    AllowedIPs: Schema.optionalWith(Schema.ReadonlySetFromSelf(InternetSchemas.CidrBlockFromString), {
        nullable: true,
        default: () => new Set([]),
    }),

    /**
     * The value for this key is either IP:port for IPv4 or [IP]:port for IPv6
     * or some.hostname.com:port for a hostname endpoint. The endpoint is
     * optional and, if not supplied, the remote peer must connect first (so
     * they should have the endpoint set to know where to connect to) and this
     * client will just send requests back to the remote peer's source IP and
     * port.
     */
    Endpoint: Schema.optionalWith(InternetSchemas.Endpoint, { nullable: true }),

    /** Lowercase hex-encoded public key of the new peer entry. */
    PublicKey: WireguardKey.WireguardKey,

    /**
     * The preshared key is optional and is a lowercase hex-encoded key. The
     * value may be an all zero string in the case of a set operation, in which
     * case it indicates that the preshared-key should be removed.
     */
    PresharedKey: Schema.optionalWith(WireguardKey.WireguardKey, { nullable: true, as: "Option" }),
}) {}

/**
 * @since 1.0.0
 * @category Api interface
 */
export type $WireguardIniPeer = Schema.Annotable<
    $WireguardIniPeer,
    string,
    Schema.Schema.Encoded<typeof WireguardPeer>,
    never
>;

/**
 * A wireguard peer configuration encoded in INI format.
 *
 * @since 1.0.0
 * @category Transformations
 * @example
 *     import * as Effect from "effect/Effect";
 *     import * as Function from "effect/Function";
 *     import * as Schema from "@effect/schema/Schema";
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
 *
 * @see {@link WireguardPeer}
 */
export const WireguardIniPeer: $WireguardIniPeer = Schema.transformOrFail(WireguardPeer, Schema.String, {
    // The types really help make sure that everything in the output will be in the right format
    decode: (peer, _options, _ast) => {
        const publicKey: `PublicKey = ${string & Brand.Brand<"WireguardKey">}\n` =
            `PublicKey = ${peer.PublicKey}\n` as const;

        const presharedKey: "" | `PresharedKey = ${string & Brand.Brand<"WireguardKey">}\n` = Function.pipe(
            peer.PresharedKey,
            Option.map((key) => `PresharedKey = ${key}\n` as const),
            Option.getOrElse(() => "" as const)
        );

        const endpoint: "" | `Endpoint = ${string}:${InternetSchemas.PortBrand}\n` = Function.pipe(
            peer.Endpoint,
            Option.fromNullable,
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

        return Effect.succeed(`[Peer]\n${publicKey}${presharedKey}${endpoint}${keepAlive}${aps}\n` as const);
    },
    // Encoding is trivial using the ini library
    encode: (iniPeer, _options, _ast) =>
        Function.pipe(
            iniPeer,
            ini.decode,
            (data) =>
                data as {
                    PublicKey: string;
                    PresharedKey?: string | undefined | null;
                    PersistentKeepalive?: string | undefined | null;
                    Endpoint?: InternetSchemas.EndpointEncoded | undefined | null;
                    AllowedIPs?:
                        | Array<InternetSchemas.CidrBlockFromStringEncoded>
                        | InternetSchemas.CidrBlockFromStringEncoded
                        | undefined
                        | null;
                },
            ({ AllowedIPs, Endpoint, PersistentKeepalive, PresharedKey, PublicKey }) => ({
                PublicKey,
                PresharedKey,
                Endpoint,
                PersistentKeepalive: Function.pipe(
                    PersistentKeepalive,
                    Option.fromNullable,
                    Option.flatMap(Number.parse),
                    Option.getOrUndefined
                ),
                AllowedIPs: Function.pipe(
                    AllowedIPs,
                    Option.fromNullable,
                    Option.map((aps) => new Set(Array.isArray(aps) ? aps : [aps])),
                    Option.getOrUndefined
                ),
            }),
            Schema.decode(WireguardPeer, { onExcessProperty: "error" }),
            Effect.mapError(({ issue }) => issue)
        ),
}).annotations({
    identifier: "WireguardIniPeer",
    description: "A wireguard ini peer configuration",
});

/**
 * Creates a wireguard userspace api set peer request from a wireguard peer.
 * This is a one way transformation (hence why schema is not involved), and you
 * are not expected to need to decode this back into a wireguard peer. Instead,
 * you should use the request resolver on the wireguard control interface to
 * "transform" this into a response.
 *
 * @since 1.0.0
 * @category Requests
 * @see https://www.wireguard.com/xplatform/
 */
export const makeWireguardUApiSetPeerRequest = (peer: WireguardPeer): string => {
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

    const endpoint: "" | `endpoint=${string}:${InternetSchemas.PortBrand}\n` = Function.pipe(
        peer.Endpoint,
        Option.fromNullable,
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
};

/**
 * A wireguard peer from an interface inspection request contains three
 * additional fields.
 *
 * @since 1.0.0
 * @category Responses
 * @see https://www.wireguard.com/xplatform/
 */
export class WireguardUApiGetPeerResponse extends WireguardPeer.extend<WireguardUApiGetPeerResponse>(
    "WireguardUApiGetPeerResponse"
)({
    /** The number of received bytes. */
    rxBytes: Schema.NumberFromString,

    /** The number of transmitted bytes. */
    txBytes: Schema.NumberFromString,

    /**
     * The number of seconds since the most recent handshake, expressed relative
     * to the Unix epoch.
     */
    lastHandshakeTimeSeconds: Schema.NumberFromString,
}) {}

/**
 * Parses a wireguard userspace api get peer response from a wireguard control
 * request resolver into a wireguard peer.
 *
 * @since 1.0.0
 * @category Responses
 * @see https://www.wireguard.com/xplatform/
 */
export const parseWireguardUApiGetPeerResponse = (
    input: string
): Effect.Effect<WireguardUApiGetPeerResponse, ParseResult.ParseError, never> => {
    const data = ini.decode(input);

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
            | InternetSchemas.CidrBlockFromStringEncoded
            | Array<InternetSchemas.CidrBlockFromStringEncoded>
            | undefined
            | null;
        endpoint: InternetSchemas.EndpointEncoded | undefined | null;
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
        Option.fromNullable,
        Option.map((hex) => Buffer.from(hex, "hex").toString("base64")),
        Option.getOrUndefined
    );

    const allowedIps = Function.pipe(
        allowed_ip,
        Option.fromNullable,
        Option.map((aps) => new Set(Array.isArray(aps) ? aps : [aps])),
        Option.getOrUndefined
    );
    const keepAlive = Function.pipe(
        persistent_keepalive_interval,
        Option.fromNullable,
        Option.flatMap(Number.parse),
        Option.getOrUndefined
    );

    return Schema.decode(WireguardUApiGetPeerResponse)({
        rxBytes: rx_bytes,
        txBytes: tx_bytes,
        Endpoint: endpoint,
        PublicKey: publicKey,
        PresharedKey: presharedKey,
        lastHandshakeTimeSeconds: last_handshake_time_sec,
        AllowedIPs: allowedIps,
        PersistentKeepalive: keepAlive,
    });
};

export default WireguardPeer;
