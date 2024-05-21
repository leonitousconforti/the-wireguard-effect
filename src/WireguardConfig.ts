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
import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Function from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Match from "effect/Match";
import * as Number from "effect/Number";
import * as Option from "effect/Option";
import * as Predicate from "effect/Predicate";
import * as Request from "effect/Request";
import * as Resolver from "effect/RequestResolver";
import * as Scope from "effect/Scope";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";
import * as String from "effect/String";
import * as Tuple from "effect/Tuple";
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
    /** TODO: Document */
    Address: InternetSchemas.CidrBlockFromString,

    /** TODO: Document */
    Dns: Schema.optional(InternetSchemas.AddressFromString),

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
    FirewallMark: Schema.optional(Schema.Number, { nullable: true }),

    /**
     * The value for this key should be a lowercase hex-encoded private key of
     * the interface. The value may be an all zero string in the case of a set
     * operation, in which case it indicates that the private key should be
     * removed.
     */
    PrivateKey: WireguardKey.WireguardKey,

    /** List of peers to add. */
    Peers: Schema.optional(Schema.Array(WireguardPeer.WireguardPeer), { default: () => [], nullable: true }),
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
            | Cause.UnknownException
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
            | Cause.UnknownException
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
            const address = `Address = ${config.Address.ip.value}/${config.Address.mask}\n`;
            const dns = Predicate.isNotUndefined(config.Dns) ? `Dns = ${config.Dns?.value}\n` : "";
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
        }).pipe(Effect.mapError(({ error }) => error)),

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
        }).pipe(Effect.mapError(({ error }) => error)),
}).annotations({
    identifier: "WireguardIniConfig",
    description: "A wireguard ini configuration",
});

// /**
//  * Generates two wireguard configurations, each with the other as a single peer
//  * and shares their keys appropriately.
//  *
//  * @since 1.0.0
//  * @category Constructors
//  * @param aliceData - The data for the first peer.
//  * @param bobData - The data for the second peer.
//  */
// export const generateP2PConfigs: {
//     // Overload for when cidrBlock is not provided
//     <AliceData extends InternetSchemas.SetupDataEncoded, BobData extends InternetSchemas.SetupDataEncoded>(options: {
//         aliceData: AliceData;
//         bobData: BobData;
//     }): Effect.Effect<
//         readonly [aliceConfig: WireguardConfig, bobConfig: WireguardConfig],
//         ParseResult.ParseError | WireguardErrors.WireguardError,
//         never
//     >;
//     // Overload for when cidrBlock is provided
//     <AliceData extends InternetSchemas.EndpointEncoded, BobData extends InternetSchemas.EndpointEncoded>(options: {
//         aliceData: AliceData;
//         bobData: BobData;
//         cidrBlock: InternetSchemas.CidrBlock;
//         addressStartingIndex?: number | undefined;
//     }): Effect.Effect<
//         readonly [aliceConfig: WireguardConfig, bobConfig: WireguardConfig],
//         ParseResult.ParseError | WireguardErrors.WireguardError,
//         never
//     >;
// } = <
//     AliceData extends InternetSchemas.SetupDataEncoded | InternetSchemas.EndpointEncoded,
//     BobData extends AliceData extends InternetSchemas.SetupDataEncoded
//         ? InternetSchemas.SetupDataEncoded
//         : InternetSchemas.EndpointEncoded,
// >(options: {
//     aliceData: AliceData;
//     bobData: BobData;
//     cidrBlock?: AliceData extends InternetSchemas.EndpointEncoded ? InternetSchemas.CidrBlock : never;
//     addressStartingIndex?: AliceData extends InternetSchemas.EndpointEncoded ? number | undefined : never;
// }): Effect.Effect<
//     readonly [aliceConfig: WireguardConfig, bobConfig: WireguardConfig],
//     ParseResult.ParseError | WireguardErrors.WireguardError,
//     never
// > => {
//     const hub = options.aliceData;
//     const spokes = Array.make(options.bobData);
//     const configs = Predicate.isUndefined(options.cidrBlock)
//         ? generate({
//               preshareKeys: "generate" as const,
//               trustMap: "trustAllPeers" as const,
//               hubData: hub as InternetSchemas.SetupDataEncoded,
//               spokeData: spokes as Array.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>,
//           })
//         : generate({
//               preshareKeys: "generate" as const,
//               trustMap: "trustAllPeers" as const,
//               hubData: hub as InternetSchemas.EndpointEncoded,
//               spokeData: spokes as Array.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
//               cidrBlock: options.cidrBlock,
//               addressStartingIndex: options.addressStartingIndex,
//           });
//     return Effect.map(configs, ([aliceConfig, [bobConfig]]) => Tuple.make(aliceConfig, bobConfig));
// };

// /**
//  * Generates a collection of wireguard configurations for a star network with a
//  * single central hub node and many peers all connected to it where the peers
//  * all trust each other.
//  *
//  * @since 1.0.0
//  * @category Constructors
//  * @param hubData - The data for the hub node.
//  * @param spokeData - The data for the spoke nodes.
//  */
// export const generateStarConfigs: {
//     // Overload for when cidrBlock is not provided
//     <
//         Nodes extends readonly [
//             InternetSchemas.SetupDataEncoded,
//             InternetSchemas.SetupDataEncoded,
//             ...Array<InternetSchemas.SetupDataEncoded>,
//         ],
//     >(options: {
//         nodes: Nodes;
//     }): Effect.Effect<
//         readonly [hubConfig: WireguardConfig, spokeConfigs: Array.NonEmptyReadonlyArray<WireguardConfig>],
//         ParseResult.ParseError | WireguardErrors.WireguardError,
//         never
//     >;
//     // Overload for when cidrBlock is provided
//     <
//         Nodes extends readonly [
//             InternetSchemas.EndpointEncoded,
//             InternetSchemas.EndpointEncoded,
//             ...Array<InternetSchemas.EndpointEncoded>,
//         ],
//     >(options: {
//         nodes: Nodes;
//         cidrBlock: InternetSchemas.CidrBlock;
//         addressStartingIndex?: number | undefined;
//     }): Effect.Effect<
//         readonly [hubConfig: WireguardConfig, spokeConfigs: Array.NonEmptyReadonlyArray<WireguardConfig>],
//         ParseResult.ParseError | WireguardErrors.WireguardError,
//         never
//     >;
// } = <
//     Nodes extends
//         | readonly [
//               InternetSchemas.SetupDataEncoded,
//               InternetSchemas.SetupDataEncoded,
//               ...Array<InternetSchemas.SetupDataEncoded>,
//           ]
//         | readonly [
//               InternetSchemas.EndpointEncoded,
//               InternetSchemas.EndpointEncoded,
//               ...Array<InternetSchemas.EndpointEncoded>,
//           ],
// >(options: {
//     nodes: Nodes;
//     cidrBlock?: Nodes extends readonly [
//         InternetSchemas.EndpointEncoded,
//         InternetSchemas.EndpointEncoded,
//         ...Array<InternetSchemas.EndpointEncoded>,
//     ]
//         ? InternetSchemas.CidrBlock
//         : never;
//     addressStartingIndex?: Nodes extends readonly [
//         InternetSchemas.EndpointEncoded,
//         InternetSchemas.EndpointEncoded,
//         ...Array<InternetSchemas.EndpointEncoded>,
//     ]
//         ? number | undefined
//         : never;
// }): Effect.Effect<
//     readonly [hubConfig: WireguardConfig, spokeConfigs: Array.NonEmptyReadonlyArray<WireguardConfig>],
//     ParseResult.ParseError | WireguardErrors.WireguardError,
//     never
// > => {
//     const [firstNode, secondNode, ...rest] = options.nodes;
//     return Predicate.isUndefined(options.cidrBlock)
//         ? generate({
//               preshareKeys: "generate" as const,
//               trustMap: "trustAllPeers" as const,
//               hubData: firstNode as InternetSchemas.SetupDataEncoded,
//               spokeData: [secondNode, ...rest] as Array.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>,
//           })
//         : generate({
//               preshareKeys: "generate" as const,
//               trustMap: "trustAllPeers" as const,
//               cidrBlock: options.cidrBlock,
//               addressStartingIndex: options.addressStartingIndex,
//               hubData: firstNode as InternetSchemas.EndpointEncoded,
//               spokeData: [secondNode, ...rest] as Array.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
//           });
// };

// /**
//  * Generates a collection of wireguard configurations for a hub and spoke
//  * network with a single central hub node and many peers all connected to it
//  * where none of the peers trust each other.
//  *
//  * @since 1.0.0
//  * @category Constructors
//  * @param hubData - The data for the hub node.
//  * @param spokeData - The data for the spoke nodes.
//  */
// export const generateHubSpokeConfigs: {
//     // Overload for when cidrBlock is not provided
//     <
//         HubData extends InternetSchemas.SetupDataEncoded,
//         SpokeData extends Array.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>,
//     >(options: {
//         hubData: HubData;
//         spokeData: SpokeData;
//     }): Effect.Effect<
//         readonly [hubConfig: WireguardConfig, spokeConfigs: Array.NonEmptyReadonlyArray<WireguardConfig>],
//         ParseResult.ParseError | WireguardErrors.WireguardError,
//         never
//     >;
//     // Overload for when cidrBlock is provided
//     <
//         HubData extends InternetSchemas.EndpointEncoded,
//         SpokeData extends Array.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
//     >(options: {
//         hubData: HubData;
//         spokeData: SpokeData;
//         cidrBlock: InternetSchemas.CidrBlock;
//         addressStartingIndex?: number | undefined;
//     }): Effect.Effect<
//         readonly [hubConfig: WireguardConfig, spokeConfigs: Array.NonEmptyReadonlyArray<WireguardConfig>],
//         ParseResult.ParseError | WireguardErrors.WireguardError,
//         never
//     >;
// } = <
//     HubData extends InternetSchemas.SetupDataEncoded | InternetSchemas.EndpointEncoded,
//     SpokeData extends HubData extends InternetSchemas.SetupDataEncoded
//         ? Array.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>
//         : Array.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
// >(options: {
//     hubData: HubData;
//     spokeData: SpokeData;
//     cidrBlock?: HubData extends InternetSchemas.EndpointEncoded ? InternetSchemas.CidrBlock : never;
//     addressStartingIndex?: HubData extends InternetSchemas.EndpointEncoded ? number | undefined : never;
// }): Effect.Effect<
//     readonly [hubConfig: WireguardConfig, spokeConfigs: Array.NonEmptyReadonlyArray<WireguardConfig>],
//     ParseResult.ParseError | WireguardErrors.WireguardError,
//     never
// > => {
//     return Predicate.isUndefined(options.cidrBlock)
//         ? generate({
//               trustMap: "trustNoPeers" as const,
//               preshareKeys: "generate" as const,
//               hubData: options.hubData as InternetSchemas.SetupDataEncoded,
//               spokeData: options.spokeData as Array.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>,
//           })
//         : generate({
//               cidrBlock: options.cidrBlock,
//               trustMap: "trustNoPeers" as const,
//               preshareKeys: "generate" as const,
//               addressStartingIndex: options.addressStartingIndex,
//               hubData: options.hubData as InternetSchemas.EndpointEncoded,
//               spokeData: options.spokeData as Array.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
//           });
// };

/**
 * Generates a collection of wireguard configurations. This function has a
 * couple of different overloads and many options, you probably want to use one
 * of the more specified generator helpers unless you really know what you are
 * doing.
 *
 * @since 1.0.0
 * @category Constructors
 */
export const generate: {
    /**
     * Overload for when cidrBlock is not provided. The hub data must be setup
     * data - which is a tuple with ipv4, ipv6, or hostname endpoint followed by
     * an ipv4 or ipv6 address. Every peer can either be a setup data tuple if
     * the endpoint is static/known or just an address if its endpoint will be
     * dynamic/unknown. The preshareKeysMap enables defining a preshared key for
     * the hub node or any of the peer nodes by using their setup data or
     * endpoint as the key. The allowedIpsMap enables defining which peers are
     * allowed to communicate with each other and the LAN. The
     * directlyConnectedPeersMap enables defining which peers are directly
     * connected to each other with additional peer entries in their configs.
     * One should not attempt to directly connect two dynamic peers (peers
     * without endpoints), though, as that doesn't make sense since there is no
     * channel for them to communicate the necessary information about where
     * they are (this is not Tailscale).
     */
    <
        HubData extends InternetSchemas.SetupDataEncoded,
        PeerData extends Array.NonEmptyReadonlyArray<
            InternetSchemas.SetupDataEncoded | InternetSchemas.AddressFromStringEncoded
        >,
    >(options: {
        hubData: HubData;
        peerData: PeerData;
        preshareKeysMap?:
            | HashMap.HashMap<PeerData[number] | HubData, WireguardKey.WireguardKey | "generate">
            | "generateAll"
            | undefined;
        allowedIpsMap?:
            | HashMap.HashMap<
                  PeerData[number],
                  | "allowEverything"
                  | Array.NonEmptyReadonlyArray<
                        | PeerData[number]
                        | InternetSchemas.CidrBlockFromStringEncoded
                        | "allowAllDefinedPeers"
                        | "allowWholeWireguardNetwork"
                    >
              >
            | "AllPeersAllowEverything"
            | "AllPeersAllowAllDefinedPeers"
            | "AllPeersAllowWholeWireguardNetwork"
            | readonly [
                  "AllPeersAllowLan",
                  (
                      | InternetSchemas.CidrBlockFromStringEncoded
                      | Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>
                  ),
              ]
            | readonly [
                  "AllPeersAllowAllDefinedPeersAndLan",
                  (
                      | InternetSchemas.CidrBlockFromStringEncoded
                      | Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>
                  ),
              ]
            | readonly [
                  "AllPeersAllowWholeWireguardNetworkAndLan",
                  (
                      | InternetSchemas.CidrBlockFromStringEncoded
                      | Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>
                  ),
              ]
            | undefined;
        directlyConnectedPeersMap?:
            | (HashMap.HashMap<
                  Extract<PeerData[number], InternetSchemas.SetupDataEncoded>,
                  Array.NonEmptyReadonlyArray<PeerData[number]>
              > &
                  HashMap.HashMap<
                      Extract<PeerData[number], InternetSchemas.AddressFromStringEncoded>,
                      Array.NonEmptyReadonlyArray<Extract<PeerData[number], InternetSchemas.SetupDataEncoded>>
                  >)
            | "stronglyConnected"
            | "weaklyConnected"
            | "connectNoPeers"
            | undefined;
    }): Effect.Effect<
        readonly [hubConfig: WireguardConfig, spokeConfigs: Array.NonEmptyReadonlyArray<WireguardConfig>],
        ParseResult.ParseError | WireguardErrors.WireguardError,
        never
    >;
    /**
     * Overload for when cidrBlock and spoke data are provided. The hub data
     * must be an endpoint, it will be assigned an address from the cidrBlock
     * address pool. In this configuration, peers that are static and have know
     * endpoints supply just their endpoints in the peerData field. There is no
     * information to provide for peers with dynamic/unknown endpoints as they
     * will be assigned an address from the cidrBlock address pool so these
     * peers can be requested by number in the additionPeers field.
     */
    <
        HubData extends InternetSchemas.EndpointEncoded,
        PeerData extends Array.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
    >(options: {
        hubData: HubData;
        peerData: PeerData;
        cidrBlock: InternetSchemas.CidrBlockFromStringEncoded;
        additionalPeers?: number | undefined;
        addressStartingIndex?: number | undefined;
        preshareKeysMap?:
            | HashMap.HashMap<PeerData[number] | HubData, WireguardKey.WireguardKey | "generate">
            | "generateAll"
            | undefined;
        allowedIpsMap?:
            | HashMap.HashMap<
                  PeerData[number],
                  | "allowEverything"
                  | Array.NonEmptyReadonlyArray<
                        | PeerData[number]
                        | InternetSchemas.CidrBlockFromStringEncoded
                        | "allowAllDefinedPeers"
                        | "allowWholeWireguardNetwork"
                    >
              >
            | "AllPeersAllowEverything"
            | "AllPeersAllowAllDefinedPeers"
            | "AllPeersAllowWholeWireguardNetwork"
            | readonly [
                  "AllPeersAllowLan",
                  (
                      | InternetSchemas.CidrBlockFromStringEncoded
                      | Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>
                  ),
              ]
            | readonly [
                  "AllPeersAllowAllDefinedPeersAndLan",
                  (
                      | InternetSchemas.CidrBlockFromStringEncoded
                      | Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>
                  ),
              ]
            | readonly [
                  "AllPeersAllowWholeWireguardNetworkAndLan",
                  (
                      | InternetSchemas.CidrBlockFromStringEncoded
                      | Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>
                  ),
              ]
            | undefined;
        directlyConnectedPeersMap?:
            | (HashMap.HashMap<
                  Extract<PeerData[number], InternetSchemas.SetupDataEncoded>,
                  Array.NonEmptyReadonlyArray<PeerData[number]>
              > &
                  HashMap.HashMap<
                      Extract<PeerData[number], InternetSchemas.AddressFromStringEncoded>,
                      Array.NonEmptyReadonlyArray<Extract<PeerData[number], InternetSchemas.SetupDataEncoded>>
                  >)
            | "stronglyConnected"
            | "weaklyConnected"
            | "connectNoPeers"
            | undefined;
    }): Effect.Effect<
        readonly [hubConfig: WireguardConfig, spokeConfigs: Array.NonEmptyReadonlyArray<WireguardConfig>],
        ParseResult.ParseError | WireguardErrors.WireguardError,
        never
    >;
    /**
     * Overload for when cidrBlock is provided and no spoke data is provided.
     * The hub data must be an endpoint, it will be assigned an address from the
     * cidrBlock address pool. In the configuration, no peer data is provided
     * and the number of peers to generate is defined by the numberOfPeers
     * field. Since there is no peer data to provide, the preshareKeys and
     * trustMap fields can not be hash maps like above.
     */
    <HubData extends InternetSchemas.EndpointEncoded, PeerData extends never>(options: {
        hubData: HubData;
        peerData: PeerData;
        numberOfPeers: number;
        cidrBlock: InternetSchemas.CidrBlockFromStringEncoded;
        addressStartingIndex?: number | undefined;
        preshareKeysMap?:
            | HashMap.HashMap<PeerData[number] | HubData, WireguardKey.WireguardKey | "generate">
            | "generateAll"
            | undefined;
        allowedIpsMap?:
            | HashMap.HashMap<
                  PeerData[number],
                  | "allowEverything"
                  | Array.NonEmptyReadonlyArray<
                        | PeerData[number]
                        | InternetSchemas.CidrBlockFromStringEncoded
                        | "allowAllDefinedPeers"
                        | "allowWholeWireguardNetwork"
                    >
              >
            | "AllPeersAllowEverything"
            | "AllPeersAllowAllDefinedPeers"
            | "AllPeersAllowWholeWireguardNetwork"
            | readonly [
                  "AllPeersAllowLan",
                  (
                      | InternetSchemas.CidrBlockFromStringEncoded
                      | Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>
                  ),
              ]
            | readonly [
                  "AllPeersAllowAllDefinedPeersAndLan",
                  (
                      | InternetSchemas.CidrBlockFromStringEncoded
                      | Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>
                  ),
              ]
            | readonly [
                  "AllPeersAllowWholeWireguardNetworkAndLan",
                  (
                      | InternetSchemas.CidrBlockFromStringEncoded
                      | Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>
                  ),
              ]
            | undefined;
        directlyConnectedPeersMap?:
            | (HashMap.HashMap<
                  Extract<PeerData[number], InternetSchemas.SetupDataEncoded>,
                  Array.NonEmptyReadonlyArray<PeerData[number]>
              > &
                  HashMap.HashMap<
                      Extract<PeerData[number], InternetSchemas.AddressFromStringEncoded>,
                      Array.NonEmptyReadonlyArray<Extract<PeerData[number], InternetSchemas.SetupDataEncoded>>
                  >)
            | "stronglyConnected"
            | "weaklyConnected"
            | "connectNoPeers"
            | undefined;
    }): Effect.Effect<
        readonly [hubConfig: WireguardConfig, spokeConfigs: Array.NonEmptyReadonlyArray<WireguardConfig>],
        ParseResult.ParseError | WireguardErrors.WireguardError,
        never
    >;
} = <
    HubData1 extends InternetSchemas.SetupDataEncoded,
    HubData2 extends InternetSchemas.EndpointEncoded,
    HubData3 extends InternetSchemas.EndpointEncoded,
    PeerData1 extends Array.NonEmptyReadonlyArray<
        InternetSchemas.SetupDataEncoded | InternetSchemas.AddressFromStringEncoded
    >,
    PeerData2 extends Array.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
    PeerData3 extends never,
>(
    options:
        | {
              hubData: HubData1;
              peerData: PeerData1;
              preshareKeysMap?:
                  | HashMap.HashMap<PeerData1[number] | HubData1, WireguardKey.WireguardKey | "generate">
                  | "generateAll"
                  | undefined;
              allowedIpsMap?:
                  | HashMap.HashMap<
                        PeerData1[number],
                        | "allowEverything"
                        | Array.NonEmptyReadonlyArray<
                              | PeerData1[number]
                              | InternetSchemas.CidrBlockFromStringEncoded
                              | "allowAllDefinedPeers"
                              | "allowWholeWireguardNetwork"
                          >
                    >
                  | "AllPeersAllowEverything"
                  | "AllPeersAllowAllDefinedPeers"
                  | "AllPeersAllowWholeWireguardNetwork"
                  | readonly [
                        "AllPeersAllowLan",
                        (
                            | InternetSchemas.CidrBlockFromStringEncoded
                            | Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>
                        ),
                    ]
                  | readonly [
                        "AllPeersAllowAllDefinedPeersAndLan",
                        (
                            | InternetSchemas.CidrBlockFromStringEncoded
                            | Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>
                        ),
                    ]
                  | readonly [
                        "AllPeersAllowWholeWireguardNetworkAndLan",
                        (
                            | InternetSchemas.CidrBlockFromStringEncoded
                            | Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>
                        ),
                    ]
                  | undefined;
              directlyConnectedPeersMap?:
                  | (HashMap.HashMap<
                        Extract<PeerData1[number], InternetSchemas.SetupDataEncoded>,
                        Array.NonEmptyReadonlyArray<PeerData1[number]>
                    > &
                        HashMap.HashMap<
                            Extract<PeerData1[number], InternetSchemas.AddressFromStringEncoded>,
                            Array.NonEmptyReadonlyArray<Extract<PeerData1[number], InternetSchemas.SetupDataEncoded>>
                        >)
                  | "stronglyConnected"
                  | "weaklyConnected"
                  | "connectNoPeers"
                  | undefined;
          }
        | {
              hubData: HubData2;
              peerData: PeerData2;
              cidrBlock: InternetSchemas.CidrBlockFromStringEncoded;
              additionalPeers?: number | undefined;
              addressStartingIndex?: number | undefined;
              preshareKeysMap?:
                  | HashMap.HashMap<PeerData2[number] | HubData2, WireguardKey.WireguardKey | "generate">
                  | "generateAll"
                  | undefined;
              allowedIpsMap?:
                  | HashMap.HashMap<
                        PeerData2[number],
                        | "allowEverything"
                        | Array.NonEmptyReadonlyArray<
                              | PeerData2[number]
                              | InternetSchemas.CidrBlockFromStringEncoded
                              | "allowAllDefinedPeers"
                              | "allowWholeWireguardNetwork"
                          >
                    >
                  | "AllPeersAllowEverything"
                  | "AllPeersAllowAllDefinedPeers"
                  | "AllPeersAllowWholeWireguardNetwork"
                  | readonly [
                        "AllPeersAllowLan",
                        (
                            | InternetSchemas.CidrBlockFromStringEncoded
                            | Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>
                        ),
                    ]
                  | readonly [
                        "AllPeersAllowAllDefinedPeersAndLan",
                        (
                            | InternetSchemas.CidrBlockFromStringEncoded
                            | Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>
                        ),
                    ]
                  | readonly [
                        "AllPeersAllowWholeWireguardNetworkAndLan",
                        (
                            | InternetSchemas.CidrBlockFromStringEncoded
                            | Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>
                        ),
                    ]
                  | undefined;
              directlyConnectedPeersMap?:
                  | (HashMap.HashMap<
                        Extract<PeerData2[number], InternetSchemas.SetupDataEncoded>,
                        Array.NonEmptyReadonlyArray<PeerData2[number]>
                    > &
                        HashMap.HashMap<
                            Extract<PeerData2[number], InternetSchemas.AddressFromStringEncoded>,
                            Array.NonEmptyReadonlyArray<Extract<PeerData2[number], InternetSchemas.SetupDataEncoded>>
                        >)
                  | "stronglyConnected"
                  | "weaklyConnected"
                  | "connectNoPeers"
                  | undefined;
          }
        | {
              hubData: HubData3;
              peerData: PeerData3;
              numberOfPeers: number;
              cidrBlock: InternetSchemas.CidrBlockFromStringEncoded;
              addressStartingIndex?: number | undefined;
              preshareKeysMap?:
                  | HashMap.HashMap<PeerData3[number] | HubData3, WireguardKey.WireguardKey | "generate">
                  | "generateAll"
                  | undefined;
              allowedIpsMap?:
                  | HashMap.HashMap<
                        PeerData3[number],
                        | "allowEverything"
                        | Array.NonEmptyReadonlyArray<
                              | PeerData3[number]
                              | InternetSchemas.CidrBlockFromStringEncoded
                              | "allowAllDefinedPeers"
                              | "allowWholeWireguardNetwork"
                          >
                    >
                  | "AllPeersAllowEverything"
                  | "AllPeersAllowAllDefinedPeers"
                  | "AllPeersAllowWholeWireguardNetwork"
                  | readonly [
                        "AllPeersAllowLan",
                        (
                            | InternetSchemas.CidrBlockFromStringEncoded
                            | Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>
                        ),
                    ]
                  | readonly [
                        "AllPeersAllowAllDefinedPeersAndLan",
                        (
                            | InternetSchemas.CidrBlockFromStringEncoded
                            | Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>
                        ),
                    ]
                  | readonly [
                        "AllPeersAllowWholeWireguardNetworkAndLan",
                        (
                            | InternetSchemas.CidrBlockFromStringEncoded
                            | Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>
                        ),
                    ]
                  | undefined;
              directlyConnectedPeersMap?:
                  | (HashMap.HashMap<
                        Extract<PeerData3[number], InternetSchemas.SetupDataEncoded>,
                        Array.NonEmptyReadonlyArray<PeerData3[number]>
                    > &
                        HashMap.HashMap<
                            Extract<PeerData3[number], InternetSchemas.AddressFromStringEncoded>,
                            Array.NonEmptyReadonlyArray<Extract<PeerData3[number], InternetSchemas.SetupDataEncoded>>
                        >)
                  | "stronglyConnected"
                  | "weaklyConnected"
                  | "connectNoPeers"
                  | undefined;
          }
): Effect.Effect<
    readonly [hubConfig: WireguardConfig, spokeConfigs: Array.NonEmptyReadonlyArray<WireguardConfig>],
    ParseResult.ParseError | WireguardErrors.WireguardError,
    never
> =>
    Effect.gen(function* () {
        // Combination types
        type HubData = HubData1 | HubData2 | HubData3;
        type PeerData = PeerData1[number] | PeerData2[number] | PeerData3[number];

        // Incoming option types
        type IncomingPresharedKeysMap = HashMap.HashMap<HubData | PeerData, WireguardKey.WireguardKey | "generate">;
        type IncomingAllowedIpsMap = HashMap.HashMap<
            PeerData,
            | "allowEverything"
            | Array.NonEmptyReadonlyArray<
                  | PeerData
                  | InternetSchemas.CidrBlockFromStringEncoded
                  | "allowAllDefinedPeers"
                  | "allowWholeWireguardNetwork"
              >
        >;

        // Desired types
        type PresharedKeysMap = HashMap.HashMap<HubData | PeerData, WireguardKey.WireguardKey>;
        type AllowedIPsMap = HashMap.HashMap<
            PeerData,
            Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>
        >;
        type DirectlyConnectedPeersMap = HashMap.HashMap<
            Extract<PeerData, InternetSchemas.SetupDataEncoded>,
            Array.NonEmptyReadonlyArray<PeerData>
        > &
            HashMap.HashMap<
                Extract<PeerData, InternetSchemas.AddressFromStringEncoded>,
                Array.NonEmptyReadonlyArray<Extract<PeerData, InternetSchemas.SetupDataEncoded>>
            >;

        // Parse the number of spokes and additional peers
        const additionalPeersEncoded = "additionalPeers" in options ? options.additionalPeers ?? 0 : 0;
        const numSpokesEncoded = "numberOfPeers" in options ? options.numberOfPeers : options.peerData.length;

        // Decode the number of spokes and additional peers
        const nonNegativeInt = Schema.compose(Schema.Int, Schema.NonNegative);
        const numSpokes = yield* Schema.decode(nonNegativeInt)(numSpokesEncoded);
        const numAdditionalPeers = yield* Schema.decode(nonNegativeInt)(additionalPeersEncoded);
        const ipsNeeded = numSpokes + numAdditionalPeers + 1;

        // Generate some ip addresses to use if the input data was just an endpoint
        const ips:
            | Array.NonEmptyReadonlyArray<InternetSchemas.IPv4>
            | Array.NonEmptyReadonlyArray<InternetSchemas.IPv6> =
            "cidrBlock" in options
                ? yield* Function.pipe(
                      Schema.decode(InternetSchemas.CidrBlockFromString)(options.cidrBlock),
                      Effect.map(
                          (cidrBlock) =>
                              cidrBlock.range as Stream.Stream<
                                  InternetSchemas.IPv4 | InternetSchemas.IPv6,
                                  ParseResult.ParseError,
                                  never
                              >
                      ),
                      Stream.unwrap,
                      Stream.drop(options.addressStartingIndex ?? 0),
                      Stream.run(Sink.collectAllN(ipsNeeded)),
                      Effect.map(Chunk.toArray),
                      Effect.map(
                          (_) =>
                              _ as unknown as
                                  | Array.NonEmptyReadonlyArray<InternetSchemas.IPv4>
                                  | Array.NonEmptyReadonlyArray<InternetSchemas.IPv6>
                      )
                  )
                : yield* Function.pipe(
                      options.peerData.map((e) => (Predicate.isString(e) ? e : Tuple.getSecond(e))),
                      Array.map((_) => Schema.decode(InternetSchemas.AddressFromString)(_)),
                      Effect.allWith(),
                      Effect.map(
                          (_) =>
                              _ as unknown as
                                  | Array.NonEmptyReadonlyArray<InternetSchemas.IPv4>
                                  | Array.NonEmptyReadonlyArray<InternetSchemas.IPv6>
                      )
                  );

        // If the user provided a cidrBlock, then the address that is used for all the hub
        // and peer address is easy to compute. Otherwise, we must derive a cidrBlock that
        // would include all the addresses we plan to use.
        const cidrBlock =
            "cidrBlock" in options
                ? yield* Schema.decode(InternetSchemas.CidrBlockFromString)(options.cidrBlock)
                : yield* InternetSchemas.CidrBlockBase.cidrBlockForRange(ips);

        // Bounds checking on the cidr block
        if ("cidrBlock" in options && cidrBlock.total < ipsNeeded) {
            return yield* new WireguardErrors.WireguardError({
                message: `Not enough IPs in the CIDR block for ${ipsNeeded} peers`,
            });
        }

        // Convert the preshareKeys to a HashMap if it's not already
        const preshareKeysMap: PresharedKeysMap = Function.pipe(
            Match.value(options.preshareKeysMap),
            Match.when(Predicate.isUndefined, (): PresharedKeysMap => HashMap.empty()),
            Match.when(HashMap.isHashMap, (map) =>
                HashMap.map(map as IncomingPresharedKeysMap, (value) => {
                    if (value === "generate") {
                        return WireguardKey.generatePreshareKey();
                    }
                    return value;
                })
            ),
            Match.when("generateAll", () => {
                const prefill = Function.flow(
                    Array.map((spoke) => Tuple.make(spoke, WireguardKey.generatePreshareKey())),
                    HashMap.fromIterable
                );
                return "cidrBlock" in options ? prefill(options.peerData) : prefill(options.peerData);
            }),
            Match.exhaustive
        );

        // Convert the allowedIps to a HashMap if it's not already
        const allowedIpsMap: AllowedIPsMap = Function.pipe(
            Match.value(options.allowedIpsMap),
            Match.when(Predicate.isUndefined, (): AllowedIPsMap => HashMap.empty()),
            Match.when(HashMap.isHashMap, (map) =>
                HashMap.map(map as IncomingAllowedIpsMap, (value) => {
                    if (value === "allowEverything") {
                        return "0.0.0.0/0" as const;
                    } else {
                        return Array.flatMap(value, (v) => {
                            if (v === "allowAllDefinedPeers") {
                                return ips.map((_) => `${_}/32` as const);
                            } else if (v === "allowWholeWireguardNetwork") {
                                return [`${cidrBlock.ip.value}/${cidrBlock.mask}` as const];
                            } else if (Predicate.isString(v)) {
                                return [v];
                            } else {
                                return [];
                            }
                        });
                    }
                })
            ),
            Match.when("AllPeersAllowEverything", () =>
                HashMap.fromIterable(Array.map(options.peerData, (spoke) => Tuple.make(spoke, ["0.0.0.0/0"] as const)))
            ),
            Match.when("AllPeersAllowAllDefinedPeers", () => {
                const allowedIps = Array.map(options.peerData, (spoke) =>
                    Tuple.make(
                        spoke,
                        ips.map((_) => `${_}/32` as const)
                    )
                );
                return HashMap.fromIterable(allowedIps);
            }),
            Match.when("AllPeersAllowWholeWireguardNetwork", () => {
                const allowedIps = Array.map(options.peerData, (spoke) =>
                    Tuple.make(spoke, [`${cidrBlock.ip.value}/${cidrBlock.mask}`] as const)
                );
                return HashMap.fromIterable(allowedIps);
            }),
            Match.when(Array.isNonEmptyReadonlyArray, ([how, moreOptions]) => {
                const lans: Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded> =
                    Predicate.isString(moreOptions) ? [moreOptions] : moreOptions;
                if (how === "AllPeersAllowLan") {
                    return HashMap.fromIterable(Array.map(options.peerData, (spoke) => Tuple.make(spoke, lans)));
                } else if (how === "AllPeersAllowAllDefinedPeersAndLan") {
                    return HashMap.fromIterable(
                        Array.map(options.peerData, (spoke) =>
                            Tuple.make(spoke, [...ips.map((_) => `${_}/32` as const), ...lans])
                        )
                    );
                } else if (how === "AllPeersAllowWholeWireguardNetworkAndLan") {
                    return HashMap.fromIterable(
                        Array.map(options.peerData, (spoke) =>
                            Tuple.make(spoke, [...([`${cidrBlock.ip.value}/${cidrBlock.mask}`] as const), ...lans])
                        )
                    );
                }
                return Function.absurd(how);
            }),
            Match.exhaustive
        );

        // Convert the directlyConnectedPeers to a HashMap if it's not already
        const directlyConnectedPeersMap: DirectlyConnectedPeersMap = Function.pipe(
            Match.value(options.directlyConnectedPeersMap),
            Match.when(Predicate.isUndefined, () => HashMap.empty()),
            Match.when(HashMap.isHashMap, (_) => Function.unsafeCoerce(_)),
            Match.when("stronglyConnected" as const, () => {
                return HashMap.fromIterable([]);
            }),
            Match.when("weaklyConnected" as const, () => {
                return HashMap.fromIterable([]);
            }),
            Match.when("connectNoPeers" as const, () => {
                return HashMap.fromIterable([]);
            }),
            Match.exhaustive
        );

        // Convert hub data to SetupDataEncoded
        const hubSetupDataEncoded =
            "cidrBlock" in options ? Tuple.make(options.hubData, ips.at(0)?.value ?? "") : options.hubData;

        // Convert spoke data to SetupDataEncoded or just an Address
        const spokeSetupDataEncoded: Array.NonEmptyReadonlyArray<
            InternetSchemas.SetupDataEncoded | InternetSchemas.AddressFromStringEncoded
        > =
            "cidrBlock" in options && "numberOfPeers" in options
                ? Array.makeBy(options.numberOfPeers, (index) => ips.at(index)?.value ?? "")
                : "cidrBlock" in options
                  ? Array.map(options.peerData, (spoke, index) => Tuple.make(spoke, ips.at(index + 1)?.value ?? ""))
                  : options.peerData;

        // Decode all SetupData inputs
        const hubSetupData = yield* Schema.decode(InternetSchemas.SetupData)(hubSetupDataEncoded);
        const spokeSetupData = yield* Effect.all(
            Array.map(spokeSetupDataEncoded, (spoke) =>
                Schema.decode(Schema.Union(InternetSchemas.SetupData, InternetSchemas.AddressFromString))(spoke)
            )
        );
        const spokeSetupDataBoth = Array.zip(spokeSetupDataEncoded, spokeSetupData);

        // Generate the keys for the hub
        const hubKeys = WireguardKey.generateKeyPair();
        const hubPreshareKey = Array.isArray(hubSetupDataEncoded)
            ? HashMap.get(preshareKeysMap, Tuple.getFirst(hubSetupDataEncoded)).pipe(Option.getOrUndefined)
            : HashMap.get(preshareKeysMap, hubSetupDataEncoded).pipe(Option.getOrUndefined);

        // This hub peer config will be added to all the spoke interface configs
        const hubPeerConfig = {
            PresharedKey: hubPreshareKey,
            PublicKey: hubKeys.publicKey,
            Endpoint: Tuple.getFirst(hubSetupDataEncoded),
            AllowedIPs: new Set([`${Tuple.getSecond(hubSetupDataEncoded)}/32`] as const),
        };

        // All these spoke peer configs will be added to the hub interface config
        const spokePeerConfigs = Array.map(spokeSetupDataBoth, ([spokeEncoded, spokeDecoded]) => {
            const keys = WireguardKey.generateKeyPair();
            const preshareKey = HashMap.get(preshareKeysMap, spokeEncoded).pipe(Option.getOrUndefined);
            const endpoint = Predicate.isString(spokeEncoded) ? undefined : Tuple.getFirst(spokeEncoded);
            const allowedIps = Predicate.isString(spokeEncoded)
                ? HashMap.get(allowedIpsMap, spokeEncoded).pipe(
                      Option.getOrElse(() => Array.empty<InternetSchemas.CidrBlockFromStringEncoded>())
                  )
                : HashMap.get(allowedIpsMap, Tuple.getFirst(spokeEncoded)).pipe(
                      Option.getOrElse(() => Array.empty<InternetSchemas.CidrBlockFromStringEncoded>())
                  );

            return {
                setupDataEncoded: spokeEncoded,
                setupDataDecoded: spokeDecoded,
                keys: {
                    preshareKey,
                    privateKey: keys.privateKey,
                },
                peerConfig: {
                    Endpoint: endpoint,
                    PresharedKey: preshareKey,
                    PublicKey: keys.publicKey,
                    AllowedIPs: new Set(allowedIps),
                },
            };
        });

        // The hub will get all the peers added to it
        const spokePeerConfigsBySetupData = Function.pipe(
            spokePeerConfigs,
            Array.map((peer) => Tuple.make(peer.setupDataEncoded, peer)),
            HashMap.fromIterable
        );

        // The hub interface config will have all the spoke peer configs
        const hubConfig = yield* Schema.decode(WireguardConfig)({
            PrivateKey: hubKeys.privateKey,
            ListenPort: Tuple.getFirst(hubSetupData).listenPort,
            Peers: Array.map(spokePeerConfigs, ({ peerConfig }) => peerConfig),
            Address: `${Tuple.getSecond(hubSetupDataEncoded)}/${cidrBlock.mask}` as const,
        });

        // Each spoke interface config will have the hub peer config and the other peers from the trust map
        const spokeConfigs = yield* Function.pipe(
            spokePeerConfigs,
            Array.map(({ keys: { privateKey }, setupDataDecoded, setupDataEncoded }) => {
                const listenPort = Schema.is(InternetSchemas.SetupData)(setupDataDecoded)
                    ? Tuple.getFirst(setupDataDecoded).listenPort
                    : 0;
                const address =
                    `${Predicate.isString(setupDataEncoded) ? setupDataEncoded : Tuple.getSecond(setupDataEncoded)}/${cidrBlock.mask}` as const;

                const directConnections = Function.pipe(
                    directlyConnectedPeersMap,
                    HashMap.get(setupDataEncoded),
                    Option.getOrElse(() => Array.empty()),
                    Array.map((friend) => HashMap.get(spokePeerConfigsBySetupData, friend)),
                    Array.map(Option.getOrThrow),
                    Array.map(({ peerConfig }) => peerConfig)
                );

                return Schema.decode(WireguardConfig)({
                    Address: address,
                    ListenPort: listenPort,
                    PrivateKey: privateKey,
                    Peers: [hubPeerConfig, ...directConnections],
                });
            }),
            Effect.allWith()
        );

        return Tuple.make(hubConfig, spokeConfigs);
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
            Peers: Schema.optional(Schema.Array(WireguardPeer.WireguardUApiGetPeerResponse), {
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
            const { fwmark, listen_port, private_key } = ini.decode(interfaceConfig);

            const peerConfigs = yield* Function.pipe(
                peers,
                Array.map((peer) => `public_key=${peer}`),
                Array.map((peer) => WireguardPeer.parseWireguardUApiGetPeerResponse(peer)),
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
                Array.map((peer) => WireguardPeer.makeWireguardUApiSetPeerRequest(peer)),
                Array.join("\n")
            );

            const uapiConfig = `${privateKey}${listenPort}${fwmark}${peers}\n` as const;
            yield* WireguardControl.userspaceContact(wireguardInterface, `set=1\n${uapiConfig}\n`);
            return wireguardInterface;
        })
    );
