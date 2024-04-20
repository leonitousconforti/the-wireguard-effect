/**
 * Wireguard peer schema definitions
 *
 * @since 1.0.0
 */

import * as Schema from "@effect/schema/Schema";
import * as Array from "effect/Array";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Option from "effect/Option";
import * as Predicate from "effect/Predicate";
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
 *         AllowedIPs: ["192.168.0.0/24"],
 *         Endpoint: "192.168.0.1:51820",
 *         PersistentKeepalive: Duration.seconds(20),
 *     });
 */
export class WireguardPeer extends Schema.Class<WireguardPeer>("WireguardPeer")({
    /** The persistent keepalive interval in seconds, 0 disables it. */
    PersistentKeepalive: Schema.optional(InternetSchemas.DurationFromSeconds, {
        as: "Option",
        nullable: true,
    }),

    /**
     * The value for this is IP/cidr, indicating a new added allowed IP entry
     * for the previously added peer entry. If an identical value already exists
     * as part of a prior peer, the allowed IP entry will be removed from that
     * peer and added to this peer.
     */
    AllowedIPs: Schema.optional(Schema.Array(InternetSchemas.CidrBlockFromString), {
        nullable: true,
        default: () => [],
    }),

    /**
     * The value for this key is either IP:port for IPv4 or [IP]:port for IPv6,
     * indicating the endpoint of the previously added peer entry.
     */
    Endpoint: InternetSchemas.Endpoint,

    /**
     * The value for this key should be a lowercase hex-encoded public key of a
     * new peer entry.
     */
    PublicKey: WireguardKey.WireguardKey,

    PresharedKey: Schema.optional(WireguardKey.WireguardKey, { nullable: true, as: "Option" }),
}) {}

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $WireguardIniPeer
    extends Schema.Annotable<$WireguardIniPeer, string, Schema.Schema.Encoded<typeof WireguardPeer>, never> {}

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
 *     const { publicKey, privateKey: _privateKey } =
 *         WireguardKey.generateKeyPair();
 *
 *     const peer = Schema.decode(WireguardPeer.WireguardPeer)({
 *         PublicKey: publicKey,
 *         AllowedIPs: ["192.168.0.0/24"],
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
    // Encoding is trivial using the ini library.
    decode: (peer, _options, _ast) => {
        const publicKey = `PublicKey = ${peer.PublicKey}\n`;
        const host = "address" in peer.Endpoint ? peer.Endpoint.address.ip : peer.Endpoint.host;
        const endpoint = `Endpoint = ${host}:${peer.Endpoint.natPort}\n`;
        const aps = Array.map(peer.AllowedIPs, (ap) => `AllowedIPs = ${ap.ip.ip}/${ap.mask}\n`);
        const keepAlive = Function.pipe(
            peer.PersistentKeepalive,
            Option.map((keepalive) => `PersistentKeepalive = ${Duration.toSeconds(keepalive)}\n`),
            Option.getOrElse(() => "")
        );
        const presharedKey = Function.pipe(
            peer.PresharedKey,
            Option.map((key) => `PresharedKey = ${key}\n`),
            Option.getOrElse(() => "")
        );
        return Effect.succeed(`[Peer]\n${publicKey}${endpoint}${keepAlive}${presharedKey}${aps.join("\n")}` as const);
    },

    // Decoding is likewise trivial using the ini library.
    encode: (iniPeer, _options, _ast) =>
        Function.pipe(
            iniPeer,
            ini.decode,
            ({ AllowedIPs, Endpoint, PersistentKeepalive, PresharedKey, PublicKey }) => ({
                Endpoint,
                PublicKey,
                PresharedKey,
                PersistentKeepalive,
                AllowedIPs: Predicate.isNotNullable(AllowedIPs)
                    ? !Array.isArray(AllowedIPs)
                        ? [AllowedIPs]
                        : AllowedIPs
                    : [],
            }),
            Schema.decodeUnknown(WireguardPeer),
            Effect.mapError(({ error }) => error)
        ),
}).annotations({
    identifier: "WireguardIniPeer",
    description: "A wireguard ini peer configuration",
});

export default WireguardPeer;
