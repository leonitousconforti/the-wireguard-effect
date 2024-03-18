/**
 * @since 1.0.0
 */

import * as Platform from "@effect/platform";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Option from "effect/Option";
import * as ReadonlyArray from "effect/ReadonlyArray";
import * as Scope from "effect/Scope";
import * as Tuple from "effect/Tuple";
import * as ini from "ini";

import * as InternetSchemas from "./InternetSchemas.js";
import * as WireguardError from "./WireguardErrors.js";
import * as WireguardInterface from "./WireguardInterface.js";
import * as WireguardKey from "./WireguardKey.js";
import * as WireguardPeer from "./WireguardPeer.js";
import * as internal from "./internal/wireguardConfig.js";

/**
 * A wireguard configuration.
 *
 * @since 1.0.0
 * @category Datatypes
 */
export class WireguardConfig extends Schema.Class<WireguardConfig>("WireguardIniConfig")({
    Address: InternetSchemas.CidrBlock,

    /**
     * The value for this is a decimal-string integer corresponding to the
     * listening port of the interface.
     */
    ListenPort: Schema.optional(InternetSchemas.Port, { default: () => InternetSchemas.Port(51820), nullable: true }),

    /**
     * The value for this is a decimal-string integer corresponding to the
     * fwmark of the interface. The value may 0 in the case of a set operation,
     * in which case it indicates that the fwmark should be removed.
     */
    FirewallMark: Schema.optional(Schema.number, { default: () => 0, nullable: true }),

    /**
     * The value for this key should be a lowercase hex-encoded private key of
     * the interface. The value may be an all zero string in the case of a set
     * operation, in which case it indicates that the private key should be
     * removed.
     */
    PrivateKey: WireguardKey.WireguardKey,

    /** List of peers to add. */
    Peers: Schema.array(WireguardPeer.WireguardPeer),
}) {
    /**
     * Generates two wireguard configurations, each with the other as a single
     * peer and shares their keys appropriately.
     *
     * @param aliceData - The data for the first peer.
     * @param bobData - The data for the second peer.
     *
     * @since 1.0.0
     * @category Constructors
     */
    public static generateP2PConfigs: {
        // Overload for when cidrBlock is not provided
        <T extends InternetSchemas.SetupDataEncoded | InternetSchemas.SetupData>(
            aliceData: T,
            bobData: T,
        ): Effect.Effect<[aliceConfig: WireguardConfig, bobConfig: WireguardConfig], ParseResult.ParseError, never>;
        // Overload for when cidrBlock is provided
        <T extends InternetSchemas.EndpointEncoded | InternetSchemas.Endpoint>(
            aliceEndpoint: T,
            bobEndpoint: T,
            cidrBlock: InternetSchemas.CidrBlockEncoded,
        ): Effect.Effect<[aliceConfig: WireguardConfig, bobConfig: WireguardConfig], ParseResult.ParseError, never>;
    } = internal.generateP2PConfigs;

    /**
     * Generates a collection of wireguard configurations for a star network
     * with a single central hub node and many peers all connected to it.
     *
     * @param hubData - The data for the hub node.
     * @param spokeData - The data for the spoke nodes.
     *
     * @since 1.0.0
     * @category Constructors
     */
    public static generateHubSpokeConfigs: {
        // Overload for when cidrBlock is not provided
        <T extends InternetSchemas.SetupDataEncoded | InternetSchemas.SetupData>(
            hubData: T,
            spokeData: ReadonlyArray.NonEmptyReadonlyArray<T>,
        ): Effect.Effect<
            [hubConfig: WireguardConfig, spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardConfig>],
            ParseResult.ParseError,
            never
        >;
        // Overload for when cidrBlock is provided
        <T extends InternetSchemas.EndpointEncoded | InternetSchemas.Endpoint>(
            hubData: T,
            spokeData: ReadonlyArray.NonEmptyReadonlyArray<T>,
            cidrBlock: InternetSchemas.CidrBlockEncoded,
        ): Effect.Effect<
            [hubConfig: WireguardConfig, spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardConfig>],
            ParseResult.ParseError,
            never
        >;
    } = internal.generateHubSpokeConfigs;

    /**
     * Loads a wireguard interface configuration from an INI file.
     *
     * @param file - The path to the INI file.
     *
     * @since 1.0.0
     * @category Constructors
     */
    public static fromConfigFile: {
        (
            file: string,
        ): Effect.Effect<
            WireguardConfig,
            ParseResult.ParseError | Platform.Error.PlatformError,
            Platform.FileSystem.FileSystem
        >;
    } = internal.fromConfigFile;

    /**
     * Writes a wireguard interface configuration to an INI file.
     *
     * @param file - The path to the INI file.
     *
     * @since 1.0.0
     * @category Constructors
     */
    public writeToFile: {
        (
            file: string,
        ): Effect.Effect<
            void,
            ParseResult.ParseError | Platform.Error.PlatformError,
            Platform.FileSystem.FileSystem | Platform.Path.Path
        >;
    } = internal.writeToFile(this);

    /**
     * Starts a wireguard tunnel that will continue to run and serve traffic
     * even after the nodejs process exits.
     *
     * @param interfaceObject - The wireguard interface to bring this config up on.
     *
     * @since 1.0.0
     * @category Wireguard
     */
    public up: {
        (
            interfaceObject: Option.Option<WireguardInterface.WireguardInterface> | undefined,
        ): Effect.Effect<
            WireguardInterface.WireguardInterface,
            WireguardError.WireguardError | Cause.TimeoutException,
            Platform.FileSystem.FileSystem | Platform.Path.Path
        >;
    } = internal.up(this);

    /**
     * Starts a wireguard tunnel that will be gracefully shutdown and stop
     * serving traffic once the scope is closed.
     *
     * @param interfaceObject - The wireguard interface to bring this config up on.
     *
     * @since 1.0.0
     * @category Wireguard
     */
    public upScoped: {
        (
            interfaceObject: Option.Option<WireguardInterface.WireguardInterface> | undefined,
        ): Effect.Effect<
            WireguardInterface.WireguardInterface,
            WireguardError.WireguardError | Cause.TimeoutException,
            Platform.FileSystem.FileSystem | Platform.Path.Path | Scope.Scope
        >;
    } = internal.upScoped(this);
}

/**
 * A wireguard configuration encoded in the INI format.
 *
 * @see {@link WireguardConfig}
 * @since 1.0.0
 * @category Transformations
 */
export const WireguardIniConfig = Function.pipe(
    Schema.transformOrFail(
        WireguardConfig,
        Schema.string,
        // Encoding is non-trivial, as we need to handle all the peers individually.
        (config, _options, _ast) =>
            Effect.gen(function* (λ) {
                type Writable<T> = { -readonly [P in keyof T]: T[P] };
                const interfaceData = structuredClone(config) as Writable<Partial<WireguardConfig>>;
                delete interfaceData["Peers"];

                const peersConfig = yield* λ(
                    Function.pipe(
                        config.Peers,
                        ReadonlyArray.map((peer) => Schema.encode(WireguardPeer.WireguardPeer)(peer)),
                        ReadonlyArray.map(Effect.flatMap(Schema.decode(WireguardPeer.WireguardIniPeer))),
                        Effect.allWith(),
                        Effect.map(ReadonlyArray.join("\n\n")),
                    ),
                );

                const interfaceConfig = ini.stringify(interfaceData, { section: "Interface", whitespace: true });
                return `${interfaceConfig}\n${peersConfig}`;
            }).pipe(Effect.mapError(({ error }) => error)),
        // Decoding is likewise non-trivial, as we need to parse all the peers from the ini config.
        (iniConfig, _options, _ast) =>
            Effect.gen(function* (λ) {
                const sections = iniConfig.split("[Peer]");

                const peers = yield* λ(
                    Function.pipe(
                        sections,
                        ReadonlyArray.filter((text) => text.startsWith("[Peer]")),
                        ReadonlyArray.map(WireguardPeer.WireguardIniPeer),
                        ReadonlyArray.map((peer) => Schema.encode(WireguardPeer.WireguardIniPeer)(peer)),
                        Effect.allWith(),
                    ),
                );

                const makeConfig = Function.pipe(
                    sections,
                    ReadonlyArray.findFirst((text) => text.startsWith("[Interface]")),
                    Option.getOrThrowWith(
                        () => new WireguardError.WireguardError({ message: "No [Interface] section found" }),
                    ),
                    ini.parse,
                    (jsonConfig) => ({ ...jsonConfig["Interface"], peers }),
                    Schema.decodeUnknown(Schema.parseJson(WireguardConfig)),
                );

                return yield* λ(makeConfig);
            }).pipe(Effect.mapError(({ error }) => error)),
    ),
    Schema.identifier("WireguardIniConfig"),
    Schema.description("A wireguard ini configuration"),
    Schema.brand("WireguardIniConfig"),
);

/**
 * A wireguard configuration encoded in the userspace api format.
 *
 * @see {@link WireguardConfig}
 * @since 1.0.0
 * @category Transformations
 */
export const WireguardUapiConfig = Function.pipe(
    Schema.transformOrFail(
        WireguardConfig,
        Schema.tuple(Schema.string, InternetSchemas.CidrBlock),
        // Encoding is non trivial, as we need to handle all the peers in individually and
        // we need to save the ini config address somewhere.
        (config, _options, _ast) =>
            Effect.gen(function* (λ) {
                const fwmark = `fwmark=${config.FirewallMark}\n` as const;
                const listenPort = `listen_port=${config.ListenPort}\n` as const;
                const privateKeyHex = Buffer.from(config.PrivateKey, "base64").toString("hex");
                const privateKey = `private_key=${privateKeyHex}\n` as const;

                const peers = yield* λ(
                    Function.pipe(
                        config.Peers,
                        ReadonlyArray.map((peer) => Schema.encode(WireguardPeer.WireguardPeer)(peer)),
                        ReadonlyArray.map(Effect.flatMap(Schema.decode(WireguardPeer.WireguardUapiPeer))),
                        Effect.allWith(),
                        Effect.map(ReadonlyArray.join("\n")),
                    ),
                );

                const out = `${fwmark}${listenPort}${privateKey}${peers}\n` as const;
                const address = yield* λ(Schema.encode(InternetSchemas.CidrBlock)(config.Address));
                return Tuple.make(out, address);
            }).pipe(Effect.mapError(({ error }) => error)),
        // Decoding is non-trivial, as we need to parse all the peers from the uapi config.
        ([uapiConfig, address], _options, _ast) =>
            Effect.gen(function* (λ) {
                const [interfaceConfig, ...peers] = uapiConfig.split("public_key=");
                const { fwmark, listen_port, private_key } = ini.decode(interfaceConfig);

                const peerConfigs = yield* λ(
                    Function.pipe(
                        peers,
                        ReadonlyArray.map((peer) => WireguardPeer.WireguardUapiPeer(peer)),
                        ReadonlyArray.map((peer) => Schema.encode(WireguardPeer.WireguardUapiPeer)(peer)),
                        Effect.allWith(),
                    ),
                );

                return yield* λ(
                    Schema.decode(WireguardConfig)({
                        Address: address,
                        FirewallMark: fwmark,
                        ListenPort: listen_port,
                        PrivateKey: Buffer.from(private_key, "hex").toString("base64"),
                        Peers: peerConfigs,
                    }),
                );
            }).pipe(Effect.mapError(({ error }) => error)),
    ),
    Schema.identifier("WireguardUapiConfig"),
    Schema.description("A wireguard userspace api configuration"),
    Schema.brand("WireguardUapiConfig"),
);
