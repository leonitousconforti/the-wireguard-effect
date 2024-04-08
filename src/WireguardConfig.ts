/**
 * Wireguard config schema definitions
 *
 * @since 1.0.0
 */

import * as Platform from "@effect/platform";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Function from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Number from "effect/Number";
import * as Option from "effect/Option";
import * as Predicate from "effect/Predicate";
import * as ReadonlyArray from "effect/ReadonlyArray";
import * as Scope from "effect/Scope";
import * as Tuple from "effect/Tuple";
import * as ini from "ini";

import * as InternetSchemas from "./InternetSchemas.js";
import * as WireguardErrors from "./WireguardErrors.js";
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
    Address: InternetSchemas.CidrBlockFromString,

    /**
     * The value for this is a decimal-string integer corresponding to the
     * listening port of the interface.
     */
    ListenPort: Schema.union(
        InternetSchemas.Port,
        Schema.transformOrFail(
            Schema.string,
            InternetSchemas.Port,
            (str, _options, ast) => Either.fromOption(Number.parse(str), () => new ParseResult.Type(ast, str)),
            Function.flow(String, Effect.succeed)
        )
    ),

    /**
     * The value for this is a decimal-string integer corresponding to the
     * fwmark of the interface. The value may 0 in the case of a set operation,
     * in which case it indicates that the fwmark should be removed.
     */
    FirewallMark: Schema.optional(Schema.number, { nullable: true }),

    /**
     * The value for this key should be a lowercase hex-encoded private key of
     * the interface. The value may be an all zero string in the case of a set
     * operation, in which case it indicates that the private key should be
     * removed.
     */
    PrivateKey: WireguardKey.WireguardKey,

    /** List of peers to add. */
    Peers: Schema.optional(Schema.array(WireguardPeer.WireguardPeer), { default: () => [], nullable: true }),
}) {
    /**
     * Generates two wireguard configurations, each with the other as a single
     * peer and shares their keys appropriately.
     *
     * @since 1.0.0
     * @category Constructors
     * @param aliceData - The data for the first peer.
     * @param bobData - The data for the second peer.
     */
    public static generateP2PConfigs: {
        // Overload for when cidrBlock is not provided
        <
            AliceData extends InternetSchemas.SetupDataEncoded,
            BobData extends InternetSchemas.SetupDataEncoded,
        >(options: {
            aliceData: AliceData;
            bobData: BobData;
        }): Effect.Effect<
            readonly [aliceConfig: WireguardConfig, bobConfig: WireguardConfig],
            ParseResult.ParseError | WireguardErrors.WireguardError,
            never
        >;
        // Overload for when cidrBlock is provided
        <AliceData extends InternetSchemas.EndpointEncoded, BobData extends InternetSchemas.EndpointEncoded>(options: {
            aliceData: AliceData;
            bobData: BobData;
            cidrBlock: InternetSchemas.CidrBlock;
            addressStartingIndex?: number | undefined;
        }): Effect.Effect<
            readonly [aliceConfig: WireguardConfig, bobConfig: WireguardConfig],
            ParseResult.ParseError | WireguardErrors.WireguardError,
            never
        >;
    } = internal.generateP2PConfigs;

    /**
     * Generates two wireguard configurations, each with the other as a single
     * peer and shares their keys appropriately.
     *
     * TODO: update docs
     *
     * @since 1.0.0
     * @category Constructors
     * @param aliceData - The data for the first peer.
     * @param bobData - The data for the second peer.
     */
    public static generateStarConfigs: {
        // Overload for when cidrBlock is not provided
        <
            HubData extends InternetSchemas.SetupDataEncoded,
            SpokeData extends ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>,
        >(options: {
            hubData: HubData;
            spokeData: SpokeData;
        }): Effect.Effect<
            readonly [hubConfig: WireguardConfig, spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardConfig>],
            ParseResult.ParseError | WireguardErrors.WireguardError,
            never
        >;
        // Overload for when cidrBlock is provided
        <
            HubData extends InternetSchemas.EndpointEncoded,
            SpokeData extends ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
        >(options: {
            hubData: HubData;
            spokeData: SpokeData;
            cidrBlock: InternetSchemas.CidrBlock;
            addressStartingIndex?: number | undefined;
        }): Effect.Effect<
            readonly [hubConfig: WireguardConfig, spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardConfig>],
            ParseResult.ParseError | WireguardErrors.WireguardError,
            never
        >;
    } = internal.generateStarConfigs;

    /**
     * Generates a collection of wireguard configurations for a star network
     * with a single central hub node and many peers all connected to it.
     *
     * @since 1.0.0
     * @category Constructors
     * @param hubData - The data for the hub node.
     * @param spokeData - The data for the spoke nodes.
     */
    public static generateHubSpokeConfigs: {
        // Overload for when cidrBlock is not provided
        <
            HubData extends InternetSchemas.SetupDataEncoded,
            SpokeData extends ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>,
        >(options: {
            hubData: HubData;
            spokeData: SpokeData;
        }): Effect.Effect<
            readonly [hubConfig: WireguardConfig, spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardConfig>],
            ParseResult.ParseError | WireguardErrors.WireguardError,
            never
        >;
        // Overload for when cidrBlock is provided
        <
            HubData extends InternetSchemas.EndpointEncoded,
            SpokeData extends ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
        >(options: {
            hubData: HubData;
            spokeData: SpokeData;
            cidrBlock: InternetSchemas.CidrBlock;
            addressStartingIndex?: number | undefined;
        }): Effect.Effect<
            readonly [hubConfig: WireguardConfig, spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardConfig>],
            ParseResult.ParseError | WireguardErrors.WireguardError,
            never
        >;
    } = internal.generateHubSpokeConfigs;

    /**
     * Generates a collection of wireguard configurations
     *
     * @since 1.0.0
     * @category Constructors
     */
    public static generate: {
        // Overload for when cidrBlock is not provided
        <
            HubData extends InternetSchemas.SetupDataEncoded,
            SpokeData extends ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>,
            TrustMap extends HashMap.HashMap<keyof SpokeData, ReadonlyArray.NonEmptyReadonlyArray<keyof SpokeData>>,
            PreshareKeysMap extends HashMap.HashMap<
                keyof SpokeData | HubData,
                { readonly privateKey: WireguardKey.WireguardKey; readonly publicKey: WireguardKey.WireguardKey }
            >,
        >(options: {
            hubData: HubData;
            spokeData: SpokeData;
            preshareKeys?: PreshareKeysMap | "generate" | undefined;
            trustMap?: TrustMap | "trustAllPeers" | "trustNoPeers" | undefined;
        }): Effect.Effect<
            readonly [hubConfig: WireguardConfig, spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardConfig>],
            ParseResult.ParseError | WireguardErrors.WireguardError,
            never
        >;
        // Overload for when cidrBlock is provided
        <
            HubData extends InternetSchemas.EndpointEncoded,
            SpokeData extends ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
            TrustMap extends HashMap.HashMap<keyof SpokeData, ReadonlyArray.NonEmptyReadonlyArray<keyof SpokeData>>,
            PreshareKeysMap extends HashMap.HashMap<
                keyof SpokeData | HubData,
                { readonly privateKey: WireguardKey.WireguardKey; readonly publicKey: WireguardKey.WireguardKey }
            >,
        >(options: {
            hubData: HubData;
            spokeData: SpokeData;
            cidrBlock: InternetSchemas.CidrBlock;
            addressStartingIndex?: number | undefined;
            preshareKeys?: PreshareKeysMap | "generate" | undefined;
            trustMap?: TrustMap | "trustAllPeers" | "trustNoPeers" | undefined;
        }): Effect.Effect<
            readonly [hubConfig: WireguardConfig, spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardConfig>],
            ParseResult.ParseError | WireguardErrors.WireguardError,
            never
        >;
    } = internal.generateHubSpokeConfigs;

    /**
     * Loads a wireguard interface configuration from an INI file.
     *
     * @since 1.0.0
     * @category Constructors
     * @param file - The path to the INI file.
     */
    public static fromConfigFile: {
        (
            file: string
        ): Effect.Effect<
            WireguardConfig,
            ParseResult.ParseError | Platform.Error.PlatformError,
            Platform.FileSystem.FileSystem
        >;
    } = internal.fromConfigFile;

    /**
     * Writes a wireguard interface configuration to an INI file.
     *
     * @since 1.0.0
     * @category Constructors
     * @param file - The path to the INI file.
     */
    public writeToFile: {
        (
            file: string
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
     * @since 1.0.0
     * @category Wireguard
     * @param options - The options for bringing the interface up.
     * @param interfaceObject - The wireguard interface to bring this config up
     *   on, it not specified it will use the next available interface on the
     *   system according to the required naming conventions.
     */
    public up: {
        (
            options: {
                how?: "bundled-wireguard-go+userspace-api" | "system-wireguard-go+userspace-api" | undefined;
                sudo?: boolean | "ask" | undefined;
            },
            interfaceObject?: WireguardInterface.WireguardInterface | undefined
        ): Effect.Effect<
            void,
            | WireguardErrors.WireguardError
            | ParseResult.ParseError
            | Platform.Error.PlatformError
            | Cause.UnknownException,
            Platform.FileSystem.FileSystem | Platform.Path.Path
        >;
        (
            options: {
                how:
                    | "system-wireguard+system-wg-quick"
                    | "system-wireguard+bundled-wg-quick"
                    | "system-wireguard-go+system-wg-quick"
                    | "bundled-wireguard-go+system-wg-quick"
                    | "system-wireguard-go+bundled-wg-quick"
                    | "bundled-wireguard-go+bundled-wg-quick";
                sudo?: boolean | "ask" | undefined;
            },
            interfaceObject?: WireguardInterface.WireguardInterface | undefined
        ): Effect.Effect<
            string,
            | WireguardErrors.WireguardError
            | ParseResult.ParseError
            | Platform.Error.PlatformError
            | Cause.UnknownException,
            Platform.FileSystem.FileSystem | Platform.Path.Path
        >;
    } = <
        How extends
            | undefined
            | "bundled-wireguard-go+userspace-api"
            | "system-wireguard-go+userspace-api"
            | "system-wireguard+system-wg-quick"
            | "system-wireguard+bundled-wg-quick"
            | "system-wireguard-go+system-wg-quick"
            | "bundled-wireguard-go+system-wg-quick"
            | "system-wireguard-go+bundled-wg-quick"
            | "bundled-wireguard-go+bundled-wg-quick",
        Ret extends How extends "bundled-wireguard-go+userspace-api" | "system-wireguard-go+userspace-api" | undefined
            ? Effect.Effect<
                  void,
                  | WireguardErrors.WireguardError
                  | ParseResult.ParseError
                  | Platform.Error.PlatformError
                  | Cause.UnknownException,
                  Platform.FileSystem.FileSystem | Platform.Path.Path
              >
            : Effect.Effect<
                  string,
                  | WireguardErrors.WireguardError
                  | ParseResult.ParseError
                  | Platform.Error.PlatformError
                  | Cause.UnknownException,
                  Platform.FileSystem.FileSystem | Platform.Path.Path
              >,
    >(
        options: {
            how?: How;
            sudo?: boolean | "ask" | undefined;
        },
        interfaceObject?: WireguardInterface.WireguardInterface | undefined
    ): Ret => {
        const how = options.how;
        if (
            Predicate.isUndefined(how) ||
            how === "bundled-wireguard-go+userspace-api" ||
            how === "system-wireguard-go+userspace-api"
        ) {
            return internal.up({ how, sudo: options.sudo }, interfaceObject)(this) as Ret;
        } else {
            return internal.up({ how, sudo: options.sudo }, interfaceObject)(this) as Ret;
        }
    };

    /**
     * Starts a wireguard tunnel that will be gracefully shutdown and stop
     * serving traffic once the scope is closed.
     *
     * @since 1.0.0
     * @category Wireguard
     * @param options - The options for bringing the interface up.
     * @param interfaceObject - The wireguard interface to bring this config up
     *   on, if not specified it will use the next available interface on the
     *   system according to the required naming conventions.
     */
    public upScoped: {
        (
            options: {
                how?: "bundled-wireguard-go+userspace-api" | "system-wireguard-go+userspace-api" | undefined;
                sudo?: boolean | "ask" | undefined;
            },
            interfaceObject?: WireguardInterface.WireguardInterface | undefined
        ): Effect.Effect<
            void,
            | WireguardErrors.WireguardError
            | ParseResult.ParseError
            | Platform.Error.PlatformError
            | Cause.UnknownException,
            Platform.FileSystem.FileSystem | Platform.Path.Path | Scope.Scope
        >;
        (
            options: {
                how:
                    | "system-wireguard+system-wg-quick"
                    | "system-wireguard+bundled-wg-quick"
                    | "system-wireguard-go+system-wg-quick"
                    | "bundled-wireguard-go+system-wg-quick"
                    | "system-wireguard-go+bundled-wg-quick"
                    | "bundled-wireguard-go+bundled-wg-quick";
                sudo?: boolean | "ask" | undefined;
            },
            interfaceObject?: WireguardInterface.WireguardInterface | undefined
        ): Effect.Effect<
            string,
            | WireguardErrors.WireguardError
            | ParseResult.ParseError
            | Platform.Error.PlatformError
            | Cause.UnknownException,
            Platform.FileSystem.FileSystem | Platform.Path.Path | Scope.Scope
        >;
    } = <
        How extends
            | undefined
            | "bundled-wireguard-go+userspace-api"
            | "system-wireguard-go+userspace-api"
            | "system-wireguard+system-wg-quick"
            | "system-wireguard+bundled-wg-quick"
            | "system-wireguard-go+system-wg-quick"
            | "bundled-wireguard-go+system-wg-quick"
            | "system-wireguard-go+bundled-wg-quick"
            | "bundled-wireguard-go+bundled-wg-quick",
        Ret extends How extends "bundled-wireguard-go+userspace-api" | "system-wireguard-go+userspace-api" | undefined
            ? Effect.Effect<
                  void,
                  | WireguardErrors.WireguardError
                  | ParseResult.ParseError
                  | Platform.Error.PlatformError
                  | Cause.UnknownException,
                  Platform.FileSystem.FileSystem | Platform.Path.Path | Scope.Scope
              >
            : Effect.Effect<
                  string,
                  | WireguardErrors.WireguardError
                  | ParseResult.ParseError
                  | Platform.Error.PlatformError
                  | Cause.UnknownException,
                  Platform.FileSystem.FileSystem | Platform.Path.Path | Scope.Scope
              >,
    >(
        options: {
            how?: How;
            sudo?: boolean | "ask" | undefined;
        },
        interfaceObject?: WireguardInterface.WireguardInterface | undefined
    ): Ret => {
        const how = options.how;
        if (
            Predicate.isUndefined(how) ||
            how === "bundled-wireguard-go+userspace-api" ||
            how === "system-wireguard-go+userspace-api"
        ) {
            return internal.upScoped({ how, sudo: options.sudo }, interfaceObject)(this) as Ret;
        } else {
            return internal.upScoped({ how, sudo: options.sudo }, interfaceObject)(this) as Ret;
        }
    };
}

/**
 * A wireguard configuration encoded in the INI format.
 *
 * TODO: Write an api interface type
 *
 * @since 1.0.0
 * @category Transformations
 * @see {@link WireguardConfig}
 */
export const WireguardIniConfig = Schema.transformOrFail(
    WireguardConfig,
    Schema.string,
    // Encoding is non-trivial, as we need to handle all the peers individually.
    (config, _options, _ast) =>
        Effect.gen(function* (λ) {
            const listenPort = `ListenPort = ${config.ListenPort}\n`;
            const privateKey = `PrivateKey = ${config.PrivateKey}\n`;
            const address = `Address = ${config.Address.ip.ip}/${config.Address.mask}\n`;
            const fwmark = Predicate.isNotUndefined(config.FirewallMark)
                ? `FirewallMark = ${config.FirewallMark}\n`
                : "";
            const peersConfig = yield* λ(
                Function.pipe(
                    config.Peers,
                    ReadonlyArray.map((peer) => Schema.encode(WireguardPeer.WireguardPeer)(peer)),
                    ReadonlyArray.map(Effect.flatMap(Schema.decode(WireguardPeer.WireguardIniPeer))),
                    Effect.allWith(),
                    Effect.map(ReadonlyArray.join("\n\n"))
                )
            );

            return `[Interface]\n${listenPort}${fwmark}${address}${privateKey}\n${peersConfig}`;
        }).pipe(Effect.mapError(({ error }) => error)),
    // Decoding is likewise non-trivial, as we need to parse all the peers from the ini config.
    (iniConfig, _options, _ast) =>
        Effect.gen(function* (λ) {
            const sections = iniConfig.split(/(?=\[Peer\])/g);
            const maybeInterfaceSection = ReadonlyArray.findFirst(sections, (text) => text.startsWith("[Interface]"));
            const interfaceSection = Option.getOrThrowWith(
                maybeInterfaceSection,
                () => new WireguardErrors.WireguardError({ message: "No [Interface] section found" })
            );

            const peerSections = Function.pipe(
                sections,
                ReadonlyArray.filter((text) => text.startsWith("[Peer]")),
                ReadonlyArray.map((text) => text.replace("[Peer]", ""))
            );

            const parsePeers = yield* λ(
                Function.pipe(
                    peerSections,
                    ReadonlyArray.map((peer) => Schema.encode(WireguardPeer.WireguardIniPeer)(peer)),
                    Effect.allWith()
                )
            );

            const parseInterface = Function.pipe(
                interfaceSection,
                ini.parse,
                (jsonConfig) => ({ ...jsonConfig["Interface"], Peers: parsePeers }),
                ({ ListenPort, FirewallMark, Address, PrivateKey, Peers }) =>
                    ({
                        Peers,
                        Address,
                        PrivateKey,
                        ListenPort,
                        FirewallMark: Number.parse(FirewallMark || "").pipe(Option.getOrUndefined),
                    }) as const,
                Schema.decode(WireguardConfig)
            );

            return yield* λ(parseInterface);
        }).pipe(Effect.mapError(({ error }) => error))
).annotations({
    identifier: "WireguardIniConfig",
    description: "A wireguard ini configuration",
});

/**
 * A wireguard configuration encoded in the userspace api format.
 *
 * TODO: Write an api interface type
 *
 * @since 1.0.0
 * @category Transformations
 * @see {@link WireguardConfig}
 */
export const WireguardUapiConfig = Schema.transformOrFail(
    WireguardConfig,
    Schema.tuple(Schema.string, InternetSchemas.CidrBlockFromString),
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
                    Effect.map(ReadonlyArray.join("\n"))
                )
            );

            const out = `${fwmark}${listenPort}${privateKey}${peers}\n` as const;
            const address = yield* λ(Schema.encode(InternetSchemas.CidrBlockFromString)(config.Address));
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
                    ReadonlyArray.map((peer) => Schema.encode(WireguardPeer.WireguardUapiPeer)(peer)),
                    Effect.allWith()
                )
            );

            return yield* λ(
                Schema.decode(WireguardConfig)({
                    Address: address,
                    FirewallMark: fwmark,
                    ListenPort: listen_port,
                    PrivateKey: Buffer.from(private_key, "hex").toString("base64"),
                    Peers: peerConfigs,
                })
            );
        }).pipe(Effect.mapError(({ error }) => error))
).annotations({
    identifier: "WireguardUapiConfig",
    description: "A wireguard userspace api configuration",
});
