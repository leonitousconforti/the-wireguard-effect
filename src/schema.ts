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

/** @see https://stackoverflow.com/questions/70831365/can-i-slice-literal-type-in-typescript */
type Split<S extends string, D extends string> = string extends S
    ? string[]
    : S extends ""
      ? string[]
      : S extends `${infer T}${D}${infer U}`
        ? [T, ...Split<U, D>]
        : [S];

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
 * A cidr mask, which is a number between 0 and 32.
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const CidrMask = Function.pipe(
    Schema.number,
    Schema.between(0, 32),
    Schema.identifier("CidrMask"),
    Schema.description("A cidr mask"),
    Schema.message(() => "a cidr mask")
);

/**
 * @since 1.0.0
 * @category Brands
 */
export type CidrMask = Schema.Schema.To<typeof CidrMask>;

/**
 * A cidr block, which is an IP address followed by a slash and a number between
 * 0 and 32.
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const CidrBlock = Function.pipe(
    Schema.transformOrFail(
        Schema.templateLiteral(Schema.string, Schema.literal("/"), Schema.number),
        Schema.struct({ ip: IPv4, mask: CidrMask }),
        (string, _options, ast) =>
            Effect.gen(function* (λ) {
                const [ip, mask] = string.split("/") as Split<typeof string, "/">;
                const ipParsed = yield* λ(Schema.decode(Schema.union(IPv4, IPv6))(ip));
                const maskParsed = yield* λ(Schema.decode(CidrMask)(Number.parseInt(mask)));
                return { ip: ipParsed, mask: maskParsed };
            }).pipe(Effect.mapError((error) => ParseResult.forbidden(ast, string, error.message))),
        ({ ip, mask }) => Effect.succeed(`${ip}/${mask}` as const)
    ),
    Schema.identifier("CidrBlock"),
    Schema.description("A cidr block"),
    Schema.message(() => "a cidr block")
);

/**
 * @since 1.0.0
 * @category Brands
 */
export type CidrBlockTo = Schema.Schema.To<typeof CidrBlock>;

/**
 * @since 1.0.0
 * @category Brands
 */
export type CidrBlockFrom = Schema.Schema.From<typeof CidrBlock>;

/**
 * An IPv4 wireguard endpoint, which consists of an IPv4 address followed by a
 * port.
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const IPv4Endpoint = Function.pipe(
    Schema.transformOrFail(
        Schema.templateLiteral(Schema.string, Schema.literal(":"), Schema.number),
        Schema.struct({ ip: IPv4, port: Port }),
        (string, _options, ast) =>
            Effect.gen(function* (λ) {
                const [ip, port] = string.split(":") as Split<typeof string, ":">;
                const ipParsed = yield* λ(Schema.decode(IPv4)(ip));
                const portParsed = yield* λ(Schema.decode(Port)(Number.parseInt(port)));
                return { ip: ipParsed, port: portParsed };
            }).pipe(Effect.mapError((error) => ParseResult.forbidden(ast, string, error.message))),
        ({ ip, port }) => Effect.succeed(`${ip}:${port}` as const)
    ),
    Schema.identifier("IPv4Endpoint"),
    Schema.description("An ipv4 wireguard endpoint"),
    Schema.message(() => "an ipv4 wireguard endpoint")
);

/**
 * @since 1.0.0
 * @category Brands
 */
export type IPv4EndpointTo = Schema.Schema.To<typeof IPv4Endpoint>;

/**
 * @since 1.0.0
 * @category Brands
 */
export type IPv4EndpointFrom = Schema.Schema.From<typeof IPv4Endpoint>;

/**
 * An IPv6 wireguard endpoint, which consists of an IPv6 address in square
 * brackets followed by a port.
 *
 * @since 1.0.0
 * @category Datatypes
 */
export const IPv6Endpoint = Function.pipe(
    Schema.transformOrFail(
        Schema.templateLiteral(
            Schema.literal("["),
            Schema.string,
            Schema.literal("]"),
            Schema.literal(":"),
            Schema.number
        ),
        Schema.struct({ ip: IPv6, port: Port }),
        (string, _options, ast) =>
            Effect.gen(function* (λ) {
                const [ip, port] = string.split("]") as Split<typeof string, "]:">;
                const ipParsed = yield* λ(Schema.decode(IPv6)(ip.slice(1)));
                const portParsed = yield* λ(Schema.decode(Port)(Number.parseInt(port)));
                return { ip: ipParsed, port: portParsed };
            }).pipe(Effect.mapError((error) => ParseResult.forbidden(ast, string, error.message))),
        ({ ip, port }) => Effect.succeed(`[${ip}]:${port}` as const)
    ),
    Schema.identifier("IPv6Endpoint"),
    Schema.description("An ipv6 wireguard endpoint"),
    Schema.message(() => "an ipv6 wireguard endpoint")
);

/**
 * @since 1.0.0
 * @category Brands
 */
export type IPv6EndpointTo = Schema.Schema.To<typeof IPv6Endpoint>;

/**
 * @since 1.0.0
 * @category Brands
 */
export type IPv6EndpointFrom = Schema.Schema.From<typeof IPv6Endpoint>;

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
export type EndpointTo = Schema.Schema.To<typeof Endpoint>;

/**
 * @since 1.0.0
 * @category Brands
 */
export type EndpointFrom = Schema.Schema.From<typeof Endpoint>;

/**
 * A wireguard key, which is a 44 character base64 string.
 *
 * @since 1.0.0
 * @category Datatypes
 * @see https://lists.zx2c4.com/pipermail/wireguard/2020-December/006222.html
 */
export const WireguardKey = Function.pipe(
    Schema.string,
    Schema.pattern(/^[\d+/A-Za-z]{42}[048AEIMQUYcgkosw]=$/),
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
    public static generateP2PConfigs: {
        (
            aliceEndpoint: EndpointFrom,
            bobEndpoint: EndpointFrom
        ): Effect.Effect<
            [aliceConfig: WireguardInterfaceConfig, bobConfig: WireguardInterfaceConfig],
            ParseResult.ParseError,
            never
        >;
        (
            aliceEndpoint: EndpointFrom
        ): (
            bobEndpoint: EndpointFrom
        ) => Effect.Effect<
            [aliceConfig: WireguardInterfaceConfig, bobConfig: WireguardInterfaceConfig],
            ParseResult.ParseError,
            never
        >;
    } = Function.dual(2, (aliceEndpoint: EndpointFrom, bobEndpoint: EndpointFrom) =>
        Effect.gen(function* (λ) {
            const hubEndpoint = aliceEndpoint;
            const spokeEndpoints = ReadonlyArray.make(bobEndpoint);
            const [aliceConfig, [bobConfig]] = yield* λ(
                WireguardInterfaceConfig.generateHubSpokeConfigs(hubEndpoint, spokeEndpoints)
            );
            return Tuple.make(aliceConfig, bobConfig);
        })
    );

    /**
     * Generates a collection of wireguard configurations for a star network
     * with a single central node and many peers all connected it.
     *
     * @since 1.0.0
     * @category Constructors
     */
    public static generateHubSpokeConfigs = (
        hubEndpoint: EndpointFrom,
        spokeEndpoints: ReadonlyArray.NonEmptyReadonlyArray<EndpointFrom>
    ): Effect.Effect<
        [
            hubConfig: WireguardInterfaceConfig,
            spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardInterfaceConfig>,
        ],
        ParseResult.ParseError,
        never
    > =>
        Effect.gen(function* (λ) {
            const hubKeys = WireguardInterfaceConfig.generateKeyPair();
            const hubEndpointData = yield* λ(Schema.decode(Endpoint)(hubEndpoint));
            const spokeEndpointsData = yield* λ(
                Effect.all(ReadonlyArray.map(spokeEndpoints, (endpoint) => Schema.decode(Endpoint)(endpoint)))
            );

            // This hub peer config will be added to all the spoke interface configs
            const hubPeerConfig = new WireguardPeerConfig({
                ReplaceAllowedIPs: true,
                Endpoint: hubEndpointData,
                PublicKey: hubKeys.publicKey,
                AllowedIPs: spokeEndpointsData.map((endpoint) => ({ ip: endpoint.ip, mask: 32 })),
            });

            // All these spoke peer configs will be added to the hub interface config
            const spokePeerConfigs = ReadonlyArray.map(spokeEndpointsData, (endpoint) => {
                const keys = WireguardInterfaceConfig.generateKeyPair();
                const peerConfig = new WireguardPeerConfig({
                    Endpoint: endpoint,
                    ReplaceAllowedIPs: true,
                    PublicKey: keys.publicKey,
                    AllowedIPs: [{ ip: hubEndpointData.ip, mask: 32 }],
                });
                return Tuple.make(Tuple.make(keys.privateKey, endpoint.port), peerConfig);
            });

            // The hub interface config will have all the spoke peer configs
            const hubConfig = new WireguardInterfaceConfig({
                ReplacePeers: true,
                PrivateKey: hubKeys.privateKey,
                ListenPort: hubEndpointData.port,
                Peers: ReadonlyArray.map(spokePeerConfigs, Tuple.getSecond),
            });

            // Each spoke interface config will have the hub peer config
            const spokeConfigs = ReadonlyArray.map(spokePeerConfigs, ([[privateKey, port]]) => {
                return new WireguardInterfaceConfig({
                    ListenPort: port,
                    ReplacePeers: true,
                    PrivateKey: privateKey,
                    Peers: [hubPeerConfig],
                });
            });

            return Tuple.make(hubConfig, spokeConfigs);
        });

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
            const data = yield* λ(Schema.encode(WireguardInterfaceConfig)(self));

            type Writable<T> = { -readonly [P in keyof T]: T[P] };
            const interfaceData = { ...data } as Writable<Partial<Schema.Schema.From<WireguardInterfaceConfig>>>;
            delete interfaceData["Peers"];

            const interfaceConfig = ini.encode(interfaceData, { section: "Interface" });
            const peersConfig = yield* λ(
                Effect.all(
                    ReadonlyArray.map(self.Peers, (peer) =>
                        Effect.gen(function* (λ) {
                            const data2 = yield* λ(Schema.encode(WireguardPeerConfig)(peer));
                            const peerData = { ...data2 } as Writable<
                                Partial<Schema.Schema.From<WireguardInterfaceConfig>>
                            >;
                            delete peerData["AllowedIPs"];
                            const allowedIps = yield* λ(
                                Effect.all(ReadonlyArray.map(peer.AllowedIPs, (x) => Schema.encode(CidrBlock)(x)))
                            );
                            return (
                                ini.encode(peerData, { bracketedArray: false, section: "Peer" }) +
                                `AllowedIPs = ${allowedIps.join(", ")}`
                            );
                        })
                    )
                ).pipe(Effect.map(ReadonlyArray.join("\n\n")))
            );
            return yield* λ(fs.writeFileString(file, interfaceConfig + "\n" + peersConfig));
        });
    };
}
