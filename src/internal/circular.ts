import * as CommandExecutor from "@effect/platform/CommandExecutor";
import * as PlatformError from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Socket from "@effect/platform/Socket";
import * as Array from "effect/Array";
import * as Cause from "effect/Cause";
import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Function from "effect/Function";
import * as Match from "effect/Match";
import * as Number from "effect/Number";
import * as Option from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as Predicate from "effect/Predicate";
import * as Schedule from "effect/Schedule";
import * as Schema from "effect/Schema";
import * as Ast from "effect/SchemaAST";
import * as Scope from "effect/Scope";
import * as Stream from "effect/Stream";
import * as String from "effect/String";
import * as ini from "ini";
import * as assert from "node:assert";
import * as os from "node:os";

import * as InternetSchemas from "../InternetSchemas.js";
import * as WireguardControl from "../WireguardControl.js";
import * as WireguardErrors from "../WireguardErrors.js";
import * as WireguardKey from "../WireguardKey.js";
import * as WireguardPeer from "../WireguardPeer.js";
import * as internalWireguardConfig from "./wireguardConfig.js";
import * as internalInterface from "./wireguardInterface.js";

// --------------------------------------------
// WireguardConfig.ts
// --------------------------------------------

export class WireguardConfig extends internalWireguardConfig.WireguardConfigVariantSchema.Class<WireguardConfig>(
    "WireguardIniConfig"
)({
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
    Peers: internalWireguardConfig.WireguardConfigVariantSchema.Field({
        json: Schema.optionalWith(Schema.Array(WireguardPeer.WireguardPeer), {
            default: () => [],
            nullable: true,
        }),
        uapi: Schema.optionalWith(Schema.Array(WireguardPeer.WireguardPeer["uapi"]), {
            default: () => [],
            nullable: true,
        }),
    }),
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
    } = (file: string) =>
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
            wireguardInterface?: WireguardInterface | undefined
        ): Effect.Effect<
            WireguardInterface,
            | Socket.SocketError
            | ParseResult.ParseError
            | Cause.TimeoutException
            | PlatformError.PlatformError
            | WireguardErrors.WireguardError,
            FileSystem.FileSystem | Path.Path | CommandExecutor.CommandExecutor | WireguardControl.WireguardControl
        >;
    } = (wireguardInterface?: WireguardInterface | undefined) =>
        Function.pipe(
            wireguardInterface,
            Option.fromNullable,
            Option.map(Effect.succeed),
            Option.getOrElse(() => WireguardInterface.getNextAvailableInterface),
            Effect.flatMap((io) => up(io, this))
        );

    /**
     * Starts a wireguard tunnel that will be gracefully shutdown and stop
     * serving traffic once the scope is closed.
     *
     * @since 1.0.0
     * @category Wireguard
     */
    public upScoped: {
        (
            wireguardInterface?: WireguardInterface | undefined
        ): Effect.Effect<
            WireguardInterface,
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
    } = (wireguardInterface?: WireguardInterface | undefined) =>
        Function.pipe(
            wireguardInterface,
            Option.fromNullable,
            Option.map(Effect.succeed),
            Option.getOrElse(() => WireguardInterface.getNextAvailableInterface),
            Effect.flatMap((io) => upScoped(io, this))
        );
}

export class WireguardIniConfig extends Schema.transformOrFail(WireguardConfig, Schema.String, {
    // Encoding is non-trivial, as we need to handle all the peers individually.
    decode: (config: WireguardConfig, _options, _ast) =>
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
    encode: (iniConfig: string, _options, _ast) =>
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
}) {}

// --------------------------------------------
// WireguardInterface.ts
// --------------------------------------------

/**
 * A wireguard interface name.
 *
 * @since 1.0.0
 * @category Datatypes
 */
export class WireguardInterface extends Schema.Class<WireguardInterface>("WireguardInterface")({
    /**
     * Ensures the interface name matches the platform's interface name regex.
     * These functions need to be fully typed as we are accessing a static
     * method on this same class and otherwise typescript really complains about
     * inference.
     */
    Name: Schema.transformOrFail(Schema.String, Schema.String, {
        decode: (
            str: string,
            _options: Ast.ParseOptions,
            ast: Ast.Transformation
        ): Effect.Effect<string, ParseResult.ParseIssue, never> =>
            Function.pipe(
                WireguardInterface.InterfaceRegExpForPlatform,
                Effect.mapError((error) => new ParseResult.Type(ast, str, error.message)),
                Effect.flatMap((x) =>
                    x.test(str)
                        ? Effect.succeed(str)
                        : Effect.fail(new ParseResult.Type(ast, str, `Expected interface name to match ${x}`))
                )
            ),
        encode: (s: string): Effect.Effect<string, never, never> => Effect.succeed(s),
    }),
}) {
    /**
     * @since 1.0.0
     * @category Constructors
     */
    public static getNextAvailableInterface: Effect.Effect<WireguardInterface, WireguardErrors.WireguardError, never> =
        Effect.gen(function* () {
            // Determine all the used interface indexes
            const regex = yield* WireguardInterface.InterfaceRegExpForPlatform;
            const usedInterfaceIndexes = Function.pipe(
                os.networkInterfaces(),
                Object.keys,
                Array.filter((name) => regex.test(name)),
                Array.map(String.replaceAll(/\D/g, "")),
                Array.map(Number.parse),
                Array.filterMap(Function.identity)
            );

            // Find the next available interface index
            const nextAvailableInterfaceIndex = yield* Function.pipe(
                Stream.iterate(0, (x) => x + 1),
                Stream.find((x) => !Array.contains(usedInterfaceIndexes, x)),
                Stream.take(1),
                Stream.runCollect,
                Effect.map(Chunk.head),
                Effect.map(Option.getOrThrow)
            );

            // We know this will be a supported platform now because otherwise
            // the WireguardInterface.InterfaceRegExpForPlatform would have failed
            const platform: (typeof internalInterface.SupportedPlatforms)[number] = Function.unsafeCoerce(
                process.platform
            );

            // Construct the next available interface name
            const fromString = Schema.decodeSync(WireguardInterface);
            switch (platform) {
                case "win32":
                    return fromString({ Name: `eth${nextAvailableInterfaceIndex}` });
                case "linux":
                    return fromString({ Name: `wg${nextAvailableInterfaceIndex}` });
                case "darwin":
                    return fromString({ Name: `utun${nextAvailableInterfaceIndex}` });
                default:
                    return Function.absurd<WireguardInterface>(platform);
            }
        });

    public static InterfaceRegExpForPlatform: Effect.Effect<RegExp, WireguardErrors.WireguardError, never> =
        Function.pipe(
            Match.value(`${process.arch}:${process.platform}`),
            Match.not(
                Predicate.some(
                    Array.map(internalInterface.SupportedArchitectures, (arch) => String.startsWith(`${arch}:`))
                ),
                (bad) => Effect.fail(new WireguardErrors.WireguardError({ message: `Unsupported architecture ${bad}` }))
            ),
            Match.when(String.endsWith(":linux"), () => Effect.succeed(internalInterface.LinuxInterfaceNameRegExp)),
            Match.when(String.endsWith(":win32"), () => Effect.succeed(internalInterface.WindowsInterfaceNameRegExp)),
            Match.when(String.endsWith(":darwin"), () => Effect.succeed(internalInterface.DarwinInterfaceNameRegExp)),
            Match.orElse((bad) =>
                Effect.fail(new WireguardErrors.WireguardError({ message: `Unsupported platform ${bad}` }))
            )
        );

    /**
     * @since 1.0.0
     * @category Userspace api
     */
    public readonly SocketLocation = Function.pipe(
        Match.type<(typeof internalInterface.SupportedPlatforms)[number]>(),
        Match.when("linux", () => `/var/run/wireguard/${this.Name}.sock`),
        Match.when("darwin", () => `/var/run/wireguard/${this.Name}.sock`),
        Match.when("win32", () => `\\\\.\\pipe\\ProtectedPrefix\\Administrators\\WireGuard\\${this.Name}`),
        Match.exhaustive
    )(Function.unsafeCoerce(process.platform));

    /**
     * Starts a wireguard tunnel that will be gracefully shutdown and stop
     * serving traffic once the scope is closed.
     *
     * @since 1.0.0
     * @category Wireguard control
     */
    public upScoped: {
        (
            config: WireguardConfig
        ): Effect.Effect<
            WireguardInterface,
            Socket.SocketError | ParseResult.ParseError | PlatformError.PlatformError | Cause.TimeoutException,
            | FileSystem.FileSystem
            | Path.Path
            | Scope.Scope
            | CommandExecutor.CommandExecutor
            | WireguardControl.WireguardControl
        >;
    } = (config: WireguardConfig) => upScoped(this, config);

    /**
     * Starts a wireguard tunnel that will continue to run and serve traffic
     * even after the nodejs process exits.
     *
     * @since 1.0.0
     * @category Wireguard control
     */
    public up: {
        (
            config: WireguardConfig
        ): Effect.Effect<
            WireguardInterface,
            Socket.SocketError | ParseResult.ParseError | PlatformError.PlatformError | Cause.TimeoutException,
            FileSystem.FileSystem | Path.Path | CommandExecutor.CommandExecutor | WireguardControl.WireguardControl
        >;
    } = (config: WireguardConfig) => up(this, config);

    /**
     * Stops a previously started wireguard tunnel.
     *
     * @since 1.0.0
     * @category Wireguard control
     */
    public down: {
        (
            config: WireguardConfig
        ): Effect.Effect<
            WireguardInterface,
            PlatformError.PlatformError | ParseResult.ParseError | Cause.TimeoutException,
            FileSystem.FileSystem | Path.Path | CommandExecutor.CommandExecutor | WireguardControl.WireguardControl
        >;
    } = (config: WireguardConfig) => down(this, config);

    /**
     * Sets the config for this wireguard interface.
     *
     * @since 1.0.0
     * @category Wireguard control
     */
    public setConfig: {
        (
            wireguardConfig: WireguardConfig
        ): Effect.Effect<WireguardInterface, Socket.SocketError | ParseResult.ParseError, never>;
    } = (wireguardConfig: WireguardConfig) => setConfig(this, wireguardConfig);

    /**
     * Retrieves the config from this wireguard interface.
     *
     * @since 1.0.0
     */
    public getConfig: {
        (
            address: InternetSchemas.CidrBlockFromStringEncoded
        ): Effect.Effect<
            Schema.Schema.Type<(typeof WireguardConfig)["uapi"]>,
            Socket.SocketError | ParseResult.ParseError,
            never
        >;
    } = (address: InternetSchemas.CidrBlockFromStringEncoded) => getConfig(this, address);

    /**
     * Adds a peer to this interface.
     *
     * @since 1.0.0
     * @category Wireguard control
     */
    public addPeer: {
        (peer: WireguardPeer.WireguardPeer): Effect.Effect<void, Socket.SocketError | ParseResult.ParseError, never>;
    } = (peer: WireguardPeer.WireguardPeer) => addPeer(this, peer);

    /**
     * Removes a peer from this interface.
     *
     * @since 1.0.0
     * @category Wireguard control
     */
    public removePeer: {
        (peer: WireguardPeer.WireguardPeer): Effect.Effect<void, Socket.SocketError | ParseResult.ParseError, never>;
    } = (peer: WireguardPeer.WireguardPeer) => removePeer(this, peer);

    /**
     * Streams the stats from all the peers on this interface.
     *
     * @since 1.0.0
     * @category Wireguard control
     */
    public streamPeerStats: {
        (): Stream.Stream<
            ReadonlyArray<Schema.Schema.Type<(typeof WireguardPeer.WireguardPeer)["uapi"]>>,
            Socket.SocketError | ParseResult.ParseError,
            never
        >;
    } = () => streamPeerStats(this);
}

// --------------------------------------------
// WireguardRpc.ts
// --------------------------------------------

/** @internal */
export const up: {
    (
        wireguardInterface: WireguardInterface,
        wireguardConfig: WireguardConfig
    ): Effect.Effect<
        WireguardInterface,
        Socket.SocketError | ParseResult.ParseError | PlatformError.PlatformError | Cause.TimeoutException,
        FileSystem.FileSystem | Path.Path | CommandExecutor.CommandExecutor | WireguardControl.WireguardControl
    >;
} = (wireguardInterface: WireguardInterface, wireguardConfig: WireguardConfig) =>
    Effect.flatMap(WireguardControl.WireguardControl, (control) => control.up(wireguardConfig, wireguardInterface));

/** @internal */
export const upScoped: {
    (
        wireguardInterface: WireguardInterface,
        wireguardConfig: WireguardConfig
    ): Effect.Effect<
        WireguardInterface,
        Socket.SocketError | ParseResult.ParseError | PlatformError.PlatformError | Cause.TimeoutException,
        | FileSystem.FileSystem
        | Path.Path
        | Scope.Scope
        | CommandExecutor.CommandExecutor
        | WireguardControl.WireguardControl
    >;
} = (wireguardInterface: WireguardInterface, wireguardConfig: WireguardConfig) =>
    Effect.flatMap(WireguardControl.WireguardControl, (control) =>
        control.upScoped(wireguardConfig, wireguardInterface)
    );

/** @internal */
export const down: {
    (
        wireguardInterface: WireguardInterface,
        wireguardConfig: WireguardConfig
    ): Effect.Effect<
        WireguardInterface,
        PlatformError.PlatformError | ParseResult.ParseError | Cause.TimeoutException,
        FileSystem.FileSystem | Path.Path | CommandExecutor.CommandExecutor | WireguardControl.WireguardControl
    >;
} = (wireguardInterface: WireguardInterface, wireguardConfig: WireguardConfig) =>
    Effect.flatMap(WireguardControl.WireguardControl, (control) => control.down(wireguardConfig, wireguardInterface));

/** @internal */
export const setConfig: {
    (
        wireguardInterface: WireguardInterface,
        wireguardConfig: WireguardConfig
    ): Effect.Effect<WireguardInterface, Socket.SocketError | ParseResult.ParseError, never>;
} = (wireguardInterface: WireguardInterface, wireguardConfig: WireguardConfig) =>
    Effect.gen(function* () {
        const listenPort = `listen_port=${wireguardConfig.ListenPort}\n` as const;
        const privateKeyHex = Buffer.from(wireguardConfig.PrivateKey, "base64").toString("hex");
        const privateKey = `private_key=${privateKeyHex}\n` as const;

        const fwmark = Predicate.isNotUndefined(wireguardConfig.FirewallMark)
            ? (`fwmark=${wireguardConfig.FirewallMark}\n` as const)
            : String.empty;

        const peers = yield* Function.pipe(
            wireguardConfig.Peers,
            Array.map((peer) => Schema.encode(WireguardPeer.WireguardPeer)(peer)),
            Array.map(Effect.flatMap((peer) => Schema.decode(WireguardPeer.WireguardUapiSetPeer)(peer))),
            Effect.allWith(),
            Effect.map(Array.join("\n"))
        );

        const uapiConfig = `${privateKey}${listenPort}${fwmark}${peers}\n` as const;
        yield* internalInterface.userspaceContact(wireguardInterface, `set=1\n${uapiConfig}\n`);
        return wireguardInterface;
    });

/** @internal */
export const getConfig: {
    (
        wireguardInterface: WireguardInterface,
        address: InternetSchemas.CidrBlockFromStringEncoded
    ): Effect.Effect<
        Schema.Schema.Type<(typeof WireguardConfig)["uapi"]>,
        Socket.SocketError | ParseResult.ParseError,
        never
    >;
} = (wireguardInterface: WireguardInterface, address: InternetSchemas.CidrBlockFromStringEncoded) =>
    Effect.gen(function* () {
        const uapiConfig = yield* internalInterface.userspaceContact(wireguardInterface, "get=1\n\n");
        const [interfaceConfig, ...peers] = uapiConfig.split("public_key=");
        const { fwmark, listen_port, private_key } = ini.decode(interfaceConfig!);

        const peerConfigs = yield* Function.pipe(
            peers,
            Array.map((peer) => `public_key=${peer}`),
            Array.map((x) => Schema.decode(WireguardPeer.WireguardUapiGetPeer, { onExcessProperty: "error" })(x)),
            Array.map(Effect.flatMap((x) => Schema.encode(WireguardPeer.WireguardPeer["uapi"])(x))),
            Effect.allWith()
        );

        return yield* Schema.decode(WireguardConfig["uapi"], { onExcessProperty: "error" })({
            Address: address,
            ListenPort: listen_port,
            PrivateKey: Buffer.from(private_key, "hex").toString("base64"),
            FirewallMark: Number.parse(fwmark || "").pipe(Option.getOrUndefined),
            Peers: peerConfigs,
        });
    });

/** @internal */
export const addPeer: {
    (
        wireguardInterface: WireguardInterface,
        peer: WireguardPeer.WireguardPeer
    ): Effect.Effect<void, Socket.SocketError | ParseResult.ParseError, never>;
} = (wireguardInterface: WireguardInterface, peer: WireguardPeer.WireguardPeer) =>
    Effect.gen(function* () {
        // Get the config before adding this peer and ensure this peer is not present
        const configBefore = yield* getConfig(wireguardInterface, "0.0.0.0/0" as const);
        assert.ok(configBefore.Peers.find((p) => p.PublicKey === peer.PublicKey) === undefined);

        // Add the peer to the interface
        const a = yield* Schema.encode(WireguardPeer.WireguardPeer)(peer);
        const b = yield* Schema.decode(WireguardPeer.WireguardUapiSetPeer)(a);
        yield* internalInterface.userspaceContact(wireguardInterface, `set=1\n${b}`);

        // Get the config after adding this peer and ensure this peer is present
        const configAfter = yield* getConfig(wireguardInterface, "0.0.0.0/0" as const);
        assert.ok(configAfter.Peers.find((p) => p.PublicKey === peer.PublicKey) !== undefined);
    });

/** @internal */
export const removePeer: {
    (
        wireguardInterface: WireguardInterface,
        peer: WireguardPeer.WireguardPeer
    ): Effect.Effect<void, Socket.SocketError | ParseResult.ParseError, never>;
} = (wireguardInterface: WireguardInterface, peer: WireguardPeer.WireguardPeer) =>
    Effect.gen(function* () {
        // Get the config before removing this peer and ensure this peer is present
        const configBefore = yield* getConfig(wireguardInterface, "0.0.0.0/0" as const);
        assert.ok(configBefore.Peers.find((p) => p.PublicKey === peer.PublicKey) !== undefined);

        // Remove the peer from the interface
        const a = yield* Schema.encode(WireguardPeer.WireguardPeer)(peer);
        const b = yield* Schema.decode(WireguardPeer.WireguardUapiSetPeer)(a);
        yield* internalInterface.userspaceContact(wireguardInterface, `set=1\n${b}remove=true\n`);

        // Get the config after removing this peer and ensure this peer is not present
        const configAfter = yield* getConfig(wireguardInterface, "0.0.0.0/0" as const);
        assert.ok(configAfter.Peers.find((p) => p.PublicKey === peer.PublicKey) === undefined);
    });

/** @internal */
export const streamPeerStats = (
    wireguardInterface: WireguardInterface
): Stream.Stream<
    ReadonlyArray<Schema.Schema.Type<(typeof WireguardPeer.WireguardPeer)["uapi"]>>,
    Socket.SocketError | ParseResult.ParseError,
    never
> => {
    const pull = getConfig(wireguardInterface, "0.0.0.0/0" as const);
    const schedule = Schedule.spaced("1 second");
    const stream = Stream.repeatEffectWithSchedule(pull, schedule);
    return Stream.map(stream, ({ Peers: peers }) => peers);
};
