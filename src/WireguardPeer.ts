/**
 * @since 1.0.0
 */

import * as Schema from "@effect/schema/Schema";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Option from "effect/Option";
import * as ReadonlyArray from "effect/ReadonlyArray";
import * as ini from "ini";

import * as InternetSchemas from "./InternetSchemas.js";
import * as WireguardKey from "./WireguardKey.js";

/**
 * A wireguard peer configuration.
 *
 * @example
 * import * as Schema from "@effect/schema/Schema"
 * import * as Duration from "effect/Duration"
 * import * as Option from "effect/Option"
 * import * as InternetSchemas from "the-wireguard-effect/InternetSchemas"
 * import * as WireguardKey from "the-wireguard-effect/WireguardKey"
 *
 * import { WireguardPeer } from "the-wireguard-effect/WireguardPeer"
 *
 * const { publicKey, privateKey: _privateKey } = WireguardKey.generateKeyPair()
 *
 * // WireguardPeer
 * const peerDirectInstantiation = new WireguardPeer({
 *      PublicKey: publicKey,
 *      AllowedIPs: [
 *          InternetSchemas.CidrBlock({
 *              ipv4: InternetSchemas.IPv4("192.168.0.0"),
 *              mask: InternetSchemas.IPv4CidrMask(24),
 *          }),
 *      ],
 *      Endpoint: InternetSchemas.Endpoint(
 *          InternetSchemas.IPv4Endpoint({
 *              ip: InternetSchemas.IPv4("192.168.0.1"),
 *              natPort: InternetSchemas.Port(51820),
 *              listenPort: InternetSchemas.Port(51820),
 *          }),
 *      ),
 *      PersistentKeepalive: Duration.seconds(20),
 *      PresharedKey: Option.none(),
 * })
 *
 * // Effect.Effect<WireguardPeer, ParseResult.ParseError, never>
 * const peerSchemaInstantiation = Schema.decode(WireguardPeer)({
 *      PublicKey: publicKey,
 *      AllowedIPs: ["192.168.0.0/24"],
 *      Endpoint: "192.168.0.1:51820",
 *      PersistentKeepalive: Duration.seconds(20),
 * })
 *
 * @since 1.0.0
 * @category Datatypes
 */
export class WireguardPeer extends Schema.Class<WireguardPeer>("WireguardPeer")({
    /** The persistent keepalive interval in seconds, 0 disables it. */
    PersistentKeepalive: Schema.optional(Schema.DurationFromSelf, {
        nullable: true,
        default: () => Duration.seconds(0),
    }),

    /**
     * The value for this is IP/cidr, indicating a new added allowed IP entry
     * for the previously added peer entry. If an identical value already exists
     * as part of a prior peer, the allowed IP entry will be removed from that
     * peer and added to this peer.
     */
    AllowedIPs: Schema.optional(Schema.array(InternetSchemas.CidrBlock), {
        nullable: true,
        exact: true,
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
 * A wireguard peer configuration encoded in INI format.
 *
 * @see {@link WireguardPeer}
 *
 * @example
 * import * as Effect from "effect/Effect"
 * import * as Duration from "effect/Duration"
 * import * as Function from "effect/Function"
 * import * as Schema from "@effect/schema/Schema"
 * import * as WireguardKey from "the-wireguard-effect/WireguardKey"
 * import * as WireguardPeer from "the-wireguard-effect/WireguardPeer"
 *
 * const { publicKey, privateKey: _privateKey } = WireguardKey.generateKeyPair()
 *
 * const peer = Schema.decode(WireguardPeer.WireguardPeer)({
 *      PublicKey: publicKey,
 *      AllowedIPs: ["192.168.0.0/24"],
 *      Endpoint: "192.168.0.1:51820",
 *      PersistentKeepalive: Duration.seconds(20),
 * })
 *
 * const iniPeer = Function.pipe(
 *      peer,
 *      Effect.flatMap(Schema.encode(WireguardPeer.WireguardPeer)),
 *      Effect.flatMap(Schema.decode(WireguardPeer.WireguardIniPeer)),
 * )
 *
 * @since 1.0.0
 * @category Transformations
 */
export const WireguardIniPeer = Function.pipe(
    Schema.transformOrFail(
        WireguardPeer,
        Schema.string,
        // Encoding is trivial using the ini library.
        (peer, _options, _ast) => {
            const publicKey = `PublicKey = ${peer.PublicKey}\n`;
            const endpoint = `Endpoint = ${peer.Endpoint.ip}:${peer.Endpoint.natPort}\n`;
            const aps = ReadonlyArray.map(peer.AllowedIPs, (ap) => `AllowedIPs = ${ap.ip}/${ap.mask}\n`);
            const keepAlive = `PersistentKeepalive = ${Duration.toSeconds(peer.PersistentKeepalive)}\n`;
            const presharedKey = Function.pipe(
                peer.PresharedKey,
                Option.map((key) => `PresharedKey = ${key}\n`),
                Option.getOrElse(() => ""),
            );
            return Effect.succeed(
                `[Peer]\n${publicKey}${endpoint}${keepAlive}${presharedKey}${aps.join("\n")}\n` as const,
            );
        },
        // Decoding is likewise trivial using the ini library.
        (iniPeer, _options, _ast) =>
            Function.pipe(
                iniPeer,
                ini.decode,
                Schema.decodeUnknown(Schema.parseJson(WireguardPeer)),
                Effect.mapError(({ error }) => error),
            ),
    ),
    Schema.identifier("WireguardIniPeer"),
    Schema.description("A wireguard ini peer configuration"),
    Schema.brand("WireguardIniPeer"),
);

/**
 * A wireguard peer configuration encoded in the userspace api format.
 *
 * @see {@link WireguardPeer}

 * @example
 * import * as Effect from "effect/Effect"
 * import * as Duration from "effect/Duration"
 * import * as Function from "effect/Function"
 * import * as Schema from "@effect/schema/Schema"
 * import * as WireguardKey from "the-wireguard-effect/WireguardKey"
 * import * as WireguardPeer from "the-wireguard-effect/WireguardPeer"
 *
 * const { publicKey, privateKey: _privateKey } = WireguardKey.generateKeyPair()
 *
 * const peer = Schema.decode(WireguardPeer.WireguardPeer)({
 *      PublicKey: publicKey,
 *      AllowedIPs: ["192.168.0.0/24"],
 *      Endpoint: "192.168.0.1:51820",
 *      PersistentKeepalive: Duration.seconds(20),
 * })
 *
 * const uapiPeer = Function.pipe(
 *      peer,
 *      Effect.flatMap(Schema.encode(WireguardPeer.WireguardPeer)),
 *      Effect.flatMap(Schema.decode(WireguardPeer.WireguardUapiPeer)),
 * )
 *
 * @since 1.0.0
 * @category Transformations
 */
export const WireguardUapiPeer = Function.pipe(
    Schema.transformOrFail(
        WireguardPeer,
        Schema.string,
        // Decoding is trivial, just rename some fields.
        (peer, _options, _ast) => {
            const publicKeyHex = Buffer.from(peer.PublicKey, "base64").toString("hex");
            const endpointString = `${peer.Endpoint.ip}:${peer.Endpoint.natPort}`;
            const durationSeconds = Duration.toSeconds(peer.PersistentKeepalive);

            const presharedKeyHex = Function.pipe(
                peer.PresharedKey,
                Option.map((key) => Buffer.from(key, "base64").toString("hex")),
                Option.map((hex) => `preshared_key=${hex}\n`),
                Option.getOrElse(() => ""),
            );

            const allowedIps = Function.pipe(
                peer.AllowedIPs,
                ReadonlyArray.map((ap) => `${ap.ip}/${ap.mask}`),
                ReadonlyArray.map((ap) => `allowed_ip=${ap}`),
                ReadonlyArray.join("\n"),
            );

            const endpoint = `endpoint=${endpointString}\n` as const;
            const publicKey = `public_key=${publicKeyHex}\n` as const;
            const keepAlive = `persistent_keepalive_interval=${durationSeconds}\n` as const;

            return Effect.succeed(`${publicKey}${endpoint}${keepAlive}${presharedKeyHex}${allowedIps}\n` as const);
        },
        // Encoding is non-trivial, we need to parse the string and find all
        // the fields we need then decode them, which can fail.
        (uapiPeer, _options, _ast) => {
            const { public_key, endpoint, persistent_keepalive_interval, allowed_ip, preshared_key } =
                ini.decode(uapiPeer);

            const presharedKey = Function.pipe(
                preshared_key,
                Option.fromNullable,
                Option.map((hex) => Buffer.from(hex, "hex").toString("base64")),
            );

            const data = {
                Endpoint: endpoint,
                PublicKey: public_key,
                AllowedIPs: allowed_ip,
                PresharedKey: presharedKey,
                PersistentKeepalive: Duration.seconds(persistent_keepalive_interval),
            };

            return Schema.decodeUnknown(Schema.parseJson(WireguardPeer))(data).pipe(
                Effect.mapError(({ error }) => error),
            );
        },
    ),
    Schema.identifier("WireguardUapiPeer"),
    Schema.description("A wireguard userspace api peer configuration"),
    Schema.brand("WireguardUapiPeer"),
);

export default WireguardPeer;
