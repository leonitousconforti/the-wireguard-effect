import * as Platform from "@effect/platform";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Option from "effect/Option";
import * as ReadonlyArray from "effect/ReadonlyArray";
import * as Tuple from "effect/Tuple";
import * as ini from "ini";
import * as crypto from "node:crypto";

/**
 * An operating system port number.
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const Port = Function.pipe(
    Schema.Int,
    Schema.between(0, 2 ** 16 - 1),
    Schema.identifier("Port"),
    Schema.description("A port number"),
    Schema.message(() => "a port number")
);

/**
 * @since 1.0.0
 * @category Brands
 */
export type Port = Schema.Schema.To<typeof Port>;

const IPv4SegmentFormat = "(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])";
const IPv4AddressFormat = `(${IPv4SegmentFormat}[.]){3}${IPv4SegmentFormat}`;
const IPv4AddressRegExp = new RegExp(`^${IPv4AddressFormat}$`);

/**
 * An IPv4 address.
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const IPv4 = Function.pipe(
    Schema.string,
    Schema.pattern(IPv4AddressRegExp),
    Schema.identifier("IPv4"),
    Schema.description("An ipv4 address"),
    Schema.message(() => "an ipv4 address")
);

/**
 * @since 1.0.0
 * @category Brands
 */
export type IPv4 = Schema.Schema.To<typeof IPv4>;

const IPv6SegmentFormat = "(?:[0-9a-fA-F]{1,4})";
const IPv6AddressRegExp = new RegExp(
    "^(" +
        `(?:${IPv6SegmentFormat}:){7}(?:${IPv6SegmentFormat}|:)|` +
        `(?:${IPv6SegmentFormat}:){6}(?:${IPv4AddressFormat}|:${IPv6SegmentFormat}|:)|` +
        `(?:${IPv6SegmentFormat}:){5}(?::${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,2}|:)|` +
        `(?:${IPv6SegmentFormat}:){4}(?:(:${IPv6SegmentFormat}){0,1}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,3}|:)|` +
        `(?:${IPv6SegmentFormat}:){3}(?:(:${IPv6SegmentFormat}){0,2}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,4}|:)|` +
        `(?:${IPv6SegmentFormat}:){2}(?:(:${IPv6SegmentFormat}){0,3}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,5}|:)|` +
        `(?:${IPv6SegmentFormat}:){1}(?:(:${IPv6SegmentFormat}){0,4}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,6}|:)|` +
        `(?::((?::${IPv6SegmentFormat}){0,5}:${IPv4AddressFormat}|(?::${IPv6SegmentFormat}){1,7}|:))` +
        ")(%[0-9a-zA-Z-.:]{1,})?$"
);

/**
 * An IPv6 address.
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const IPv6 = Function.pipe(
    Schema.string,
    Schema.pattern(IPv6AddressRegExp),
    Schema.identifier("IPv6"),
    Schema.description("An ipv6 address"),
    Schema.message(() => "an ipv6 address")
);

/**
 * @since 1.0.0
 * @category Brands
 */
export type IPv6 = Schema.Schema.To<typeof IPv6>;

/**
 * A cidr block, which is an IP address followed by a slash and a number between
 * 0 and 32.
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const CidrBlock = Function.pipe(
    Schema.templateLiteral(Schema.union(IPv4, IPv6), Schema.literal("/"), Schema.number.pipe(Schema.between(0, 32))),
    Schema.identifier("CidrBlock"),
    Schema.description("A cidr block"),
    Schema.message(() => "a cidr block")
);

/**
 * @since 1.0.0
 * @category Brands
 */
export type CidrBlock = Schema.Schema.To<typeof CidrBlock>;

/**
 * An IPv4 wireguard endpoint, which consists of an IPv4 address followed by a
 * port.
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const IPv4Endpoint = Function.pipe(
    Schema.templateLiteral(IPv4, Schema.literal(":"), Port),
    Schema.identifier("IPv4Endpoint"),
    Schema.description("An ipv4 wireguard endpoint"),
    Schema.message(() => "an ipv4 wireguard endpoint")
);

/**
 * @since 1.0.0
 * @category Brands
 */
export type IPv4Endpoint = Schema.Schema.To<typeof IPv4Endpoint>;

/**
 * An IPv6 wireguard endpoint, which consists of an IPv6 address in square
 * brackets followed by a port.
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const IPv6Endpoint = Function.pipe(
    Schema.templateLiteral(Schema.literal("["), IPv6, Schema.literal("]"), Schema.literal(":"), Port),
    Schema.identifier("IPv6Endpoint"),
    Schema.description("An ipv6 wireguard endpoint"),
    Schema.message(() => "an ipv6 wireguard endpoint")
);

/**
 * @since 1.0.0
 * @category Brands
 */
export type IPv6Endpoint = Schema.Schema.To<typeof IPv6Endpoint>;

/**
 * A wireguard endpoint, which is either an IPv4 or IPv6 endpoint.
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const Endpoint = Function.pipe(
    Schema.union(IPv4Endpoint, IPv6Endpoint),
    Schema.identifier("Endpoint"),
    Schema.description("A wireguard endpoint"),
    Schema.message(() => "a wireguard endpoint")
);

/**
 * @since 1.0.0
 * @category Brands
 */
export type Endpoint = Schema.Schema.To<typeof Endpoint>;

/**
 * A wireguard key, which is a 32-byte hex-encoded string.
 *
 * FIXME: This needs to be stricter
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const WireguardKey = Function.pipe(
    Schema.string,
    Schema.nonEmpty(),
    Schema.identifier("WireguardKey"),
    Schema.description("A wireguard key"),
    Schema.message(() => "a wireguard key")
);

/**
 * @since 1.0.0
 * @category Brands
 */
export type WireguardKey = Schema.Schema.To<typeof WireguardKey>;

/**
 * A wireguard interface name.
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const WireguardInterfaceName = Function.pipe(
    Schema.string,
    Schema.transformOrFail(
        Schema.string,
        (s, _options, ast) => {
            if (process.platform === "openbsd") {
                return /^tun\d*$/.test(s)
                    ? Effect.succeed(s)
                    : Effect.fail(ParseResult.forbidden(ast, s, "Expected interface name to match tun[0-9]*"));
            }

            if (process.platform === "linux") {
                return /^wg\d*$/.test(s)
                    ? Effect.succeed(s)
                    : Effect.fail(ParseResult.forbidden(ast, s, "Expected interface name to match wg[0-9]*"));
            }

            if (process.platform === "darwin") {
                return /^utun\d*$/.test(s)
                    ? Effect.succeed(s)
                    : Effect.fail(ParseResult.forbidden(ast, s, "Expected interface name to match utun[0-9]*"));
            }

            return Effect.succeed(s);
        },
        (s) => Effect.succeed(s)
    ),
    Schema.identifier("WireguardInterfaceName"),
    Schema.description("A wireguard interface name"),
    Schema.message(() => "a wireguard interface name")
);

/**
 * @since 1.0.0
 * @category Brands
 */
export type WireguardInterfaceName = Schema.Schema.To<typeof WireguardInterfaceName>;

/**
 * @since 1.0.0
 * @category Errors
 */
export class WireguardError extends Data.TaggedError("WireguardError")<{ message: string }> {}

/**
 * A wireguard peer configuration.
 *
 * @since 1.0.0
 * @category Datatypes
 */
export class WireguardPeerConfig extends Schema.Class<WireguardPeerConfig>()({
    /** @see https://github.com/WireGuard/wgctrl-go/blob/925a1e7659e675c94c1a659d39daa9141e450c7d/wgtypes/types.go#L236-L276 */

    /** The persistent keepalive interval in seconds, 0 disables it. */
    PersistentKeepaliveInterval: Schema.optional(Schema.union(Schema.number, Schema.NumberFromString)),

    /**
     * The value for this is IP/cidr, indicating a new added allowed IP entry
     * for the previously added peer entry. If an identical value already exists
     * as part of a prior peer, the allowed IP entry will be removed from that
     * peer and added to this peer.
     */
    AllowedIPs: Schema.optional(Schema.array(CidrBlock), { default: () => [] }),

    /**
     * The value for this key is either IP:port for IPv4 or [IP]:port for IPv6,
     * indicating the endpoint of the previously added peer entry.
     */
    Endpoint: Endpoint,

    /**
     * The value for this key should be a lowercase hex-encoded public key of a
     * new peer entry.
     */
    PublicKey: WireguardKey,

    PresharedKey: Schema.optional(Schema.string),
    ReplaceAllowedIPs: Schema.optional(Schema.boolean, { default: () => true }),
}) {}

/**
 * A wireguard interface configuration.
 *
 * @since 1.0.0
 * @category Datatypes
 */
export class WireguardInterfaceConfig extends Schema.Class<WireguardInterfaceConfig>()({
    /** @see https://github.com/WireGuard/wgctrl-go/blob/925a1e7659e675c94c1a659d39daa9141e450c7d/wgtypes/types.go#L207-L232 */

    /**
     * The value for this is a decimal-string integer corresponding to the
     * listening port of the interface.
     */
    ListenPort: Port,

    /**
     * The value for this is a decimal-string integer corresponding to the
     * fwmark of the interface. The value may 0 in the case of a set operation,
     * in which case it indicates that the fwmark should be removed.
     */
    FirewallMark: Schema.optional(Schema.number),

    /**
     * The value for this key should be a lowercase hex-encoded private key of
     * the interface. The value may be an all zero string in the case of a set
     * operation, in which case it indicates that the private key should be
     * removed.
     */
    PrivateKey: WireguardKey,

    /**
     * Indicates that the subsequent peers (perhaps an empty list) should
     * replace any existing peers, rather than append to the existing peer
     * list.
     */
    ReplacePeers: Schema.optional(Schema.boolean, { default: () => true }),

    /** List of peers to add. */
    Peers: Schema.nonEmptyArray(WireguardPeerConfig),
}) {
    /**
     * Loads a wireguard interface configuration from a JSON file.
     *
     * @since 1.0.0
     * @category Constructors
     */
    public static fromJsonConfigFile = (
        file: string
    ): Effect.Effect<
        WireguardInterfaceConfig,
        ParseResult.ParseError | Platform.Error.PlatformError,
        Platform.FileSystem.FileSystem
    > =>
        Effect.gen(function* (λ) {
            const fs = yield* λ(Platform.FileSystem.FileSystem);
            const config = yield* λ(fs.readFileString(file));
            return yield* λ(Schema.decode(Schema.parseJson(WireguardInterfaceConfig))(config));
        });

    /**
     * Loads a wireguard interface configuration from an INI file.
     *
     * @since 1.0.0
     * @category Constructors
     */
    public static fromIniConfigFile = (
        file: string
    ): Effect.Effect<
        WireguardInterfaceConfig,
        ParseResult.ParseError | Platform.Error.PlatformError,
        Platform.FileSystem.FileSystem
    > =>
        Effect.gen(function* (λ) {
            const fs = yield* λ(Platform.FileSystem.FileSystem);
            const config = yield* λ(fs.readFileString(file));
            const sections = config.split("[Peer]");

            const peers = yield* λ(
                Function.pipe(
                    sections,
                    ReadonlyArray.filter((text) => text.startsWith("[Peer]")),
                    ReadonlyArray.map(ini.parse),
                    ReadonlyArray.map((peer) => Schema.decodeUnknown(Schema.parseJson(WireguardPeerConfig))(peer)),
                    Effect.allWith({ concurrency: "unbounded", batching: "inherit" })
                )
            );

            const makeConfig = Function.pipe(
                sections,
                ReadonlyArray.findFirst((text) => text.startsWith("[Interface]")),
                Option.getOrThrowWith(() => new WireguardError({ message: "No [Interface] section found" })),
                ini.parse,
                (jsonConfig) => ({ ...jsonConfig["Interface"], peers }),
                Schema.decodeUnknown(Schema.parseJson(WireguardInterfaceConfig))
            );

            return yield* λ(makeConfig);
        });

    /**
     * Generates a two wireguard configurations, each with the other as a single
     * peer, and shares their keys appropriately.
     *
     * @since 1.0.0
     * @category Constructors
     */
    public static generateP2PConfigs = (
        aliceEndpoint: Endpoint,
        bobEndpoint: Endpoint
    ): [aliceConfig: WireguardInterfaceConfig, bobConfig: WireguardInterfaceConfig] => {
        const hubEndpoint = aliceEndpoint;
        const spokeEndpoints = ReadonlyArray.make(bobEndpoint);
        const [aliceConfig, [bobConfig]] = WireguardInterfaceConfig.generateHubSpokeConfigs(
            hubEndpoint,
            spokeEndpoints
        );
        return Tuple.make(aliceConfig, bobConfig);
    };

    /**
     * Generates a collection of wireguard configurations for a star network
     * with a single central node and many peers all connected it.
     *
     * @since 1.0.0
     * @category Constructors
     */
    public static generateHubSpokeConfigs = (
        hubEndpoint: Endpoint,
        spokeEndpoints: ReadonlyArray.NonEmptyReadonlyArray<Endpoint>
    ): [
        hubConfig: WireguardInterfaceConfig,
        spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardInterfaceConfig>,
    ] => {
        const hubIp = `${hubEndpoint}/32` as const;
        const spokeIPs = ReadonlyArray.map(spokeEndpoints, (endpoint) => `${endpoint}/32` as const);
        const hubKeys = WireguardInterfaceConfig.generateKeyPair();

        const a = hubEndpoint.split(":");

        // This hub peer config will be added to all the spoke interface configs
        const hubPeerConfig = new WireguardPeerConfig({
            Endpoint: hubEndpoint,
            AllowedIPs: spokeIPs,
            PublicKey: hubKeys.publicKey,
            ReplaceAllowedIPs: true,
        });

        // All these spoke peer configs will be added to the hub interface config
        const spokePeerConfigs = ReadonlyArray.map(spokeEndpoints, (endpoint) => {
            const keys = WireguardInterfaceConfig.generateKeyPair();
            const peerConfig = new WireguardPeerConfig({
                Endpoint: endpoint,
                AllowedIPs: [hubIp],
                PublicKey: keys.publicKey,
                ReplaceAllowedIPs: true,
            });
            return Tuple.make(keys.privateKey, peerConfig);
        });

        // The hub interface config will have all the spoke peer configs
        const hubConfig = new WireguardInterfaceConfig({
            ListenPort: 51_820,
            ReplacePeers: true,
            PrivateKey: hubKeys.privateKey,
            Peers: ReadonlyArray.map(spokePeerConfigs, Tuple.getSecond),
        });

        // Each spoke interface config will have the hub peer config
        const spokeConfigs = ReadonlyArray.map(spokePeerConfigs, ([privateKey]) => {
            return new WireguardInterfaceConfig({
                ListenPort: 51_820,
                ReplacePeers: true,
                PrivateKey: privateKey,
                Peers: [hubPeerConfig],
            });
        });

        return Tuple.make(hubConfig, spokeConfigs);
    };

    /**
     * Generates a wireguard public private key pair.
     *
     * @since 1.0.0
     * @category Constructors
     */
    public static generateKeyPair = (): { privateKey: WireguardKey; publicKey: WireguardKey } => {
        const keys = crypto.generateKeyPairSync("x25519", {
            publicKeyEncoding: { format: "der", type: "spki" },
            privateKeyEncoding: { format: "der", type: "pkcs8" },
        });
        return {
            publicKey: keys.publicKey.subarray(12).toString("base64"),
            privateKey: keys.privateKey.subarray(16).toString("base64"),
        };
    };

    /**
     * Writes a wireguard interface configuration to an INI file.
     *
     * @since 1.0.0
     * @category Constructors
     */
    public writeToFile = (
        file: string
    ): Effect.Effect<void, ParseResult.ParseError | Platform.Error.PlatformError, Platform.FileSystem.FileSystem> => {
        const self = this;
        return Effect.gen(function* (λ) {
            const fs = yield* λ(Platform.FileSystem.FileSystem);
            const config = yield* λ(Schema.encode(Schema.parseJson(WireguardInterfaceConfig))(self));
            return yield* λ(fs.writeFileString(file, config));
        });
    };

    /**
     * Generates a QR code for the wireguard interface configuration.
     *
     * TODO: Implement this
     *
     * @since 1.0.0
     * @category Constructors
     */
    public generateQRCode = (): string => {
        return "";
    };
}
