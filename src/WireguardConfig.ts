/**
 * Wireguard config schema definitions
 *
 * @since 1.0.0
 */

import * as CommandExecutor from "@effect/platform/CommandExecutor";
import * as PlatformError from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Socket from "@effect/platform/Socket";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Array from "effect/Array";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Function from "effect/Function";
import * as Number from "effect/Number";
import * as Option from "effect/Option";
import * as Predicate from "effect/Predicate";
import * as Request from "effect/Request";
import * as Resolver from "effect/RequestResolver";
import * as Scope from "effect/Scope";
import * as String from "effect/String";
import * as ini from "ini";

import * as InternetSchemas from "./InternetSchemas.js";
import * as WireguardControl from "./WireguardControl.js";
import * as WireguardErrors from "./WireguardErrors.js";
import * as WireguardInterface from "./WireguardInterface.js";
import * as WireguardKey from "./WireguardKey.js";
import * as WireguardPeer from "./WireguardPeer.js";

/**
 * A wireguard configuration.
 *
 * @since 1.0.0
 * @category Schemas
 */
export class WireguardConfig extends Schema.Class<WireguardConfig>("WireguardIniConfig")({
    /** The Address of this peer. */
    Address: InternetSchemas.CidrBlockFromString,

    /** DNS for this peer. */
    Dns: Schema.optional(InternetSchemas.Address),

    /**
     * The value for this is a decimal-string integer corresponding to the
     * listening port of the interface.
     */
    ListenPort: Schema.Union(
        InternetSchemas.Port,
        Schema.transformOrFail(Schema.String, InternetSchemas.Port, {
            decode: (str, _options, ast) => Either.fromOption(Number.parse(str), () => new ParseResult.Type(ast, str)),
            encode: (port) => Effect.succeed(`${port}`),
        })
    ),

    /**
     * The value for this is a decimal-string integer corresponding to the
     * fwmark of the interface. The value may 0 in the case of a set operation,
     * in which case it indicates that the fwmark should be removed.
     */
    FirewallMark: Schema.optionalWith(Schema.Number, { nullable: true }),

    /**
     * The value for this key should be a lowercase hex-encoded private key of
     * the interface. The value may be an all zero string in the case of a set
     * operation, in which case it indicates that the private key should be
     * removed.
     */
    PrivateKey: WireguardKey.WireguardKey,

    /** List of peers to add. */
    Peers: Schema.optionalWith(Schema.Array(WireguardPeer.WireguardPeer), { default: () => [], nullable: true }),
}) {
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
        ): Effect.Effect<void, ParseResult.ParseError | PlatformError.PlatformError, FileSystem.FileSystem | Path.Path>;
    } = (file) =>
        Effect.gen(this, function* () {
            const path = yield* Path.Path;
            const fs = yield* FileSystem.FileSystem;
            const configEncoded = yield* Schema.encode(WireguardConfig)(this);
            const iniConfigDecoded = yield* Schema.decode(WireguardIniConfig)(configEncoded);
            yield* fs.makeDirectory(path.dirname(file), { recursive: true });
            yield* fs.writeFileString(file, iniConfigDecoded);
        });

    /**
     * Starts a wireguard tunnel that will continue to run and serve traffic
     * even after the nodejs process exits.
     *
     * @since 1.0.0
     * @category Wireguard
     */
    public up: {
        (
            interfaceObject?: WireguardInterface.WireguardInterface | undefined
        ): Effect.Effect<
            WireguardInterface.WireguardInterface,
            | Socket.SocketError
            | ParseResult.ParseError
            | Cause.TimeoutException
            | PlatformError.PlatformError
            | WireguardErrors.WireguardError,
            FileSystem.FileSystem | Path.Path | CommandExecutor.CommandExecutor | WireguardControl.WireguardControl
        >;
    } = (interfaceObject) =>
        Effect.gen(this, function* () {
            const io = yield* Function.pipe(
                interfaceObject,
                Option.fromNullable,
                Option.map(Effect.succeed),
                Option.getOrElse(() => WireguardInterface.WireguardInterface.getNextAvailableInterface)
            );

            const wireguardControl = yield* WireguardControl.WireguardControl;
            return yield* wireguardControl.up(this, io);
        });

    /**
     * Starts a wireguard tunnel that will be gracefully shutdown and stop
     * serving traffic once the scope is closed.
     *
     * @since 1.0.0
     * @category Wireguard
     */
    public upScoped: {
        (
            interfaceObject?: WireguardInterface.WireguardInterface | undefined
        ): Effect.Effect<
            WireguardInterface.WireguardInterface,
            | Socket.SocketError
            | ParseResult.ParseError
            | Cause.TimeoutException
            | PlatformError.PlatformError
            | WireguardErrors.WireguardError,
            | FileSystem.FileSystem
            | Path.Path
            | CommandExecutor.CommandExecutor
            | WireguardControl.WireguardControl
            | Scope.Scope
        >;
    } = (interfaceObject) =>
        Effect.gen(this, function* () {
            const io = yield* Function.pipe(
                interfaceObject,
                Option.fromNullable,
                Option.map(Effect.succeed),
                Option.getOrElse(() => WireguardInterface.WireguardInterface.getNextAvailableInterface)
            );

            const wireguardControl = yield* WireguardControl.WireguardControl;
            return yield* wireguardControl.upScoped(this, io);
        });
}

/**
 * @since 1.0.0
 * @category Api interface
 */
export interface $WireguardIniConfig
    extends Schema.Annotable<$WireguardIniConfig, string, Schema.Schema.Encoded<typeof WireguardConfig>, never> {}

/**
 * A wireguard configuration encoded in the INI format.
 *
 * @since 1.0.0
 * @category Schema Transformations
 * @see {@link WireguardConfig}
 */
export const WireguardIniConfig: $WireguardIniConfig = Schema.transformOrFail(WireguardConfig, Schema.String, {
    // Encoding is non-trivial, as we need to handle all the peers individually.
    decode: (config, _options, _ast) =>
        Effect.gen(function* () {
            const listenPort = `ListenPort = ${config.ListenPort}\n`;
            const privateKey = `PrivateKey = ${config.PrivateKey}\n`;
            const address = `Address = ${config.Address.address.ip}/${config.Address.mask}\n`;
            const dns = Predicate.isNotUndefined(config.Dns) ? `Dns = ${config.Dns?.ip}\n` : "";
            const fwmark = Predicate.isNotUndefined(config.FirewallMark)
                ? `FirewallMark = ${config.FirewallMark}\n`
                : "";
            const peersConfig = yield* Function.pipe(
                config.Peers,
                Array.map((peer) => Schema.encode(WireguardPeer.WireguardPeer)(peer)),
                Array.map(Effect.flatMap(Schema.decode(WireguardPeer.WireguardIniPeer))),
                Effect.allWith(),
                Effect.map(Array.join("\n"))
            );

            return `[Interface]\n${dns}${listenPort}${fwmark}${address}${privateKey}\n${peersConfig}`;
        }).pipe(Effect.mapError(({ issue }) => issue)),

    // Decoding is likewise non-trivial, as we need to parse all the peers from the ini config.
    encode: (iniConfig, _options, _ast) =>
        Effect.gen(function* () {
            const sections = iniConfig.split(/(?=\[Peer\])/g);
            const maybeInterfaceSection = Array.findFirst(sections, (text) => text.startsWith("[Interface]"));
            const interfaceSection = Option.getOrThrowWith(
                maybeInterfaceSection,
                () => new WireguardErrors.WireguardError({ message: "No [Interface] section found" })
            );

            const peerSections = Function.pipe(
                sections,
                Array.filter((text) => text.startsWith("[Peer]")),
                Array.map((text) => text.replace("[Peer]", ""))
            );

            const parsePeers = yield* Function.pipe(
                peerSections,
                Array.map((peer) => Schema.encode(WireguardPeer.WireguardIniPeer)(peer)),
                Effect.allWith()
            );

            const parseInterface = Function.pipe(
                interfaceSection,
                ini.parse,
                (jsonConfig) => ({ ...jsonConfig["Interface"], Peers: parsePeers }),
                ({ Address, Dns, FirewallMark, ListenPort, Peers, PrivateKey }) =>
                    ({
                        Dns,
                        Peers,
                        Address,
                        PrivateKey,
                        ListenPort,
                        FirewallMark: Number.parse(FirewallMark || "").pipe(Option.getOrUndefined),
                    }) as const,
                Schema.decode(WireguardConfig)
            );

            return yield* parseInterface;
        }).pipe(Effect.mapError(({ issue }) => issue)),
}).annotations({
    identifier: "WireguardIniConfig",
    description: "A wireguard ini configuration",
});

/**
 * Loads a wireguard interface configuration from an INI file.
 *
 * @since 1.0.0
 * @category Constructors
 * @param file - The path to the INI file.
 */
export const fromConfigFile: {
    (
        file: string
    ): Effect.Effect<WireguardConfig, ParseResult.ParseError | PlatformError.PlatformError, FileSystem.FileSystem>;
} = (file) =>
    Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const fsConfig = yield* fs.readFileString(file);
        const iniConfigEncoded = yield* Schema.encode(WireguardIniConfig)(fsConfig);
        const config = yield* Schema.decode(WireguardConfig)(iniConfigEncoded);
        return config;
    });

/**
 * @since 1.0.0
 * @category Responses
 * @see https://www.wireguard.com/xplatform/
 */
export const WireguardGetConfigResponse = Function.pipe(
    WireguardConfig,
    Schema.omit("Peers"),
    Schema.extend(
        Schema.Struct({
            Peers: Schema.optionalWith(Schema.Array(WireguardPeer.WireguardUApiGetPeerResponse), {
                default: () => [],
                nullable: true,
            }),
        })
    )
).annotations({
    identifier: "WireguardGetConfigResponse",
    description: "The response of a WireguardGetConfigRequest",
});

/**
 * @since 1.0.0
 * @category Responses
 */
export type WireguardGetConfigResponse = Schema.Schema.Type<typeof WireguardGetConfigResponse>;

/**
 * @since 1.0.0
 * @category Requests
 */
export class WireguardGetConfigRequest extends Request.TaggedClass("WireguardGetConfigRequest")<
    Schema.Schema.Type<typeof WireguardGetConfigResponse>,
    ParseResult.ParseError | Socket.SocketError,
    {
        readonly address: InternetSchemas.CidrBlockFromStringEncoded;
        readonly wireguardInterface: WireguardInterface.WireguardInterface;
    }
> {}

/**
 * @since 1.0.0
 * @category Requests
 */
export class WireguardSetConfigRequest extends Request.TaggedClass("WireguardSetConfigRequest")<
    WireguardInterface.WireguardInterface,
    ParseResult.ParseError | Socket.SocketError,
    {
        readonly config: WireguardConfig;
        readonly wireguardInterface: WireguardInterface.WireguardInterface;
        readonly peerRequestMapper?: (peer: WireguardPeer.WireguardPeer) =>
            | {
                  readonly remove?: boolean | undefined;
                  readonly updateOnly?: boolean | undefined;
                  readonly replaceAllowedIps?: boolean | undefined;
              }
            | undefined;
    }
> {}

/**
 * @since 1.0.0
 * @category Resolvers
 */
export const WireguardGetConfigResolver: Resolver.RequestResolver<WireguardGetConfigRequest, never> =
    Resolver.fromEffect<never, WireguardGetConfigRequest>(({ address, wireguardInterface }) =>
        Effect.gen(function* () {
            const uapiConfig = yield* WireguardControl.userspaceContact(wireguardInterface, "get=1\n\n");
            const [interfaceConfig, ...peers] = uapiConfig.split("public_key=");
            const { fwmark, listen_port, private_key } = ini.decode(interfaceConfig!);

            const peerConfigs = yield* Function.pipe(
                peers,
                Array.map((peer) => `public_key=${peer}`),
                Array.map(WireguardPeer.parseWireguardUApiGetPeerResponse),
                Array.map(Effect.flatMap(Schema.encode(WireguardPeer.WireguardUApiGetPeerResponse))),
                Effect.allWith()
            );

            return yield* Schema.decode(WireguardGetConfigResponse)({
                Address: address,
                ListenPort: listen_port,
                PrivateKey: Buffer.from(private_key, "hex").toString("base64"),
                FirewallMark: Number.parse(fwmark || "").pipe(Option.getOrUndefined),
                Peers: peerConfigs,
            });
        })
    );

/**
 * @since 1.0.0
 * @category Resolvers
 */
export const WireguardSetConfigResolver: Resolver.RequestResolver<WireguardSetConfigRequest, never> =
    Resolver.fromEffect<never, WireguardSetConfigRequest>(({ config, wireguardInterface }) =>
        Effect.gen(function* () {
            const listenPort = `listen_port=${config.ListenPort}\n` as const;
            const privateKeyHex = Buffer.from(config.PrivateKey, "base64").toString("hex");
            const privateKey = `private_key=${privateKeyHex}\n` as const;

            const fwmark = Predicate.isNotUndefined(config.FirewallMark)
                ? (`fwmark=${config.FirewallMark}\n` as const)
                : String.empty;

            const peers = Function.pipe(
                config.Peers,
                Array.map(WireguardPeer.makeWireguardUApiSetPeerRequest),
                Array.join("\n")
            );

            const uapiConfig = `${privateKey}${listenPort}${fwmark}${peers}\n` as const;
            yield* WireguardControl.userspaceContact(wireguardInterface, `set=1\n${uapiConfig}\n`);
            return wireguardInterface;
        })
    );
