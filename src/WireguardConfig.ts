/**
 * Wireguard config schema definitions
 *
 * @since 1.0.0
 */

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
import * as Scope from "effect/Scope";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";
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
 * @category Datatypes
 */
export class WireguardConfig extends Schema.Class<WireguardConfig>("WireguardIniConfig")({
    Address: InternetSchemas.CidrBlockFromString,
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
    } = (file) => {
        const self = this;
        return Effect.gen(function* (λ) {
            const path = yield* λ(Path.Path);
            const fs = yield* λ(FileSystem.FileSystem);
            const configEncoded = yield* λ(Schema.encode(WireguardConfig)(self));
            const iniConfigDecoded = yield* λ(Schema.decode(WireguardIniConfig)(configEncoded));
            yield* λ(fs.makeDirectory(path.dirname(file), { recursive: true }));
            yield* λ(fs.writeFileString(file, iniConfigDecoded));
        });
    };

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
            void,
            | Socket.SocketError
            | ParseResult.ParseError
            | Cause.UnknownException
            | PlatformError.PlatformError
            | WireguardErrors.WireguardError,
            FileSystem.FileSystem | Path.Path | WireguardControl.WireguardControl
        >;
    } = (interfaceObject) => {
        const self = this;
        return Effect.gen(function* (λ) {
            const io = yield* λ(
                Function.pipe(
                    interfaceObject,
                    Option.fromNullable,
                    Option.map(Effect.succeed),
                    Option.getOrElse(() => WireguardInterface.WireguardInterface.getNextAvailableInterface)
                )
            );

            const wireguardControl = yield* λ(WireguardControl.WireguardControl);
            yield* λ(wireguardControl.up(self, io));
        });
    };

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
            void,
            | Socket.SocketError
            | ParseResult.ParseError
            | Cause.UnknownException
            | PlatformError.PlatformError
            | WireguardErrors.WireguardError,
            FileSystem.FileSystem | Path.Path | WireguardControl.WireguardControl | Scope.Scope
        >;
    } = (interfaceObject) => {
        const self = this;
        return Effect.gen(function* (λ) {
            const io = yield* λ(
                Function.pipe(
                    interfaceObject,
                    Option.fromNullable,
                    Option.map(Effect.succeed),
                    Option.getOrElse(() => WireguardInterface.WireguardInterface.getNextAvailableInterface)
                )
            );

            const wireguardControl = yield* λ(WireguardControl.WireguardControl);
            yield* λ(wireguardControl.upScoped(self, io));
        });
    };
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
 * @category Transformations
 * @see {@link WireguardConfig}
 */
export const WireguardIniConfig: $WireguardIniConfig = Schema.transformOrFail(WireguardConfig, Schema.String, {
    // Encoding is non-trivial, as we need to handle all the peers individually.
    decode: (config, _options, _ast) =>
        Effect.gen(function* (λ) {
            const listenPort = `ListenPort = ${config.ListenPort}\n`;
            const privateKey = `PrivateKey = ${config.PrivateKey}\n`;
            const address = `Address = ${config.Address.ip.ip}/${config.Address.mask}\n`;
            const dns = Predicate.isNotUndefined(config.Dns) ? `Dns = ${config.Dns?.ip}\n` : "";
            const fwmark = Predicate.isNotUndefined(config.FirewallMark)
                ? `FirewallMark = ${config.FirewallMark}\n`
                : "";
            const peersConfig = yield* λ(
                Function.pipe(
                    config.Peers,
                    Array.map((peer) => Schema.encode(WireguardPeer.WireguardPeer)(peer)),
                    Array.map(Effect.flatMap(Schema.decode(WireguardPeer.WireguardIniPeer))),
                    Effect.allWith(),
                    Effect.map(Array.join("\n"))
                )
            );

            return `[Interface]\n${dns}${listenPort}${fwmark}${address}${privateKey}\n${peersConfig}`;
        }).pipe(Effect.mapError(({ error }) => error)),

    // Decoding is likewise non-trivial, as we need to parse all the peers from the ini config.
    encode: (iniConfig, _options, _ast) =>
        Effect.gen(function* (λ) {
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

            const parsePeers = yield* λ(
                Function.pipe(
                    peerSections,
                    Array.map((peer) => Schema.encode(WireguardPeer.WireguardIniPeer)(peer)),
                    Effect.allWith()
                )
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

            return yield* λ(parseInterface);
        }).pipe(Effect.mapError(({ error }) => error)),
}).annotations({
    identifier: "WireguardIniConfig",
    description: "A wireguard ini configuration",
});

/**
 * Generates two wireguard configurations, each with the other as a single peer
 * and shares their keys appropriately.
 *
 * @since 1.0.0
 * @category Constructors
 * @param aliceData - The data for the first peer.
 * @param bobData - The data for the second peer.
 */
export const generateP2PConfigs: {
    // Overload for when cidrBlock is not provided
    <AliceData extends InternetSchemas.SetupDataEncoded, BobData extends InternetSchemas.SetupDataEncoded>(options: {
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
} = <
    AliceData extends InternetSchemas.SetupDataEncoded | InternetSchemas.EndpointEncoded,
    BobData extends AliceData extends InternetSchemas.SetupDataEncoded
        ? InternetSchemas.SetupDataEncoded
        : InternetSchemas.EndpointEncoded,
>(options: {
    aliceData: AliceData;
    bobData: BobData;
    cidrBlock?: AliceData extends InternetSchemas.EndpointEncoded ? InternetSchemas.CidrBlock : never;
    addressStartingIndex?: AliceData extends InternetSchemas.EndpointEncoded ? number | undefined : never;
}): Effect.Effect<
    readonly [aliceConfig: WireguardConfig, bobConfig: WireguardConfig],
    ParseResult.ParseError | WireguardErrors.WireguardError,
    never
> => {
    const hub = options.aliceData;
    const spokes = Array.make(options.bobData);
    const configs = Predicate.isUndefined(options.cidrBlock)
        ? generate({
              preshareKeys: "generate" as const,
              trustMap: "trustAllPeers" as const,
              hubData: hub as InternetSchemas.SetupDataEncoded,
              spokeData: spokes as Array.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>,
          })
        : generate({
              preshareKeys: "generate" as const,
              trustMap: "trustAllPeers" as const,
              hubData: hub as InternetSchemas.EndpointEncoded,
              spokeData: spokes as Array.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
              cidrBlock: options.cidrBlock,
              addressStartingIndex: options.addressStartingIndex,
          });
    return Effect.map(configs, ([aliceConfig, [bobConfig]]) => Tuple.make(aliceConfig, bobConfig));
};

/**
 * Generates a collection of wireguard configurations for a star network with a
 * single central hub node and many peers all connected to it where the peers
 * all trust each other.
 *
 * @since 1.0.0
 * @category Constructors
 * @param hubData - The data for the hub node.
 * @param spokeData - The data for the spoke nodes.
 */
export const generateStarConfigs: {
    // Overload for when cidrBlock is not provided
    <
        Nodes extends readonly [
            InternetSchemas.SetupDataEncoded,
            InternetSchemas.SetupDataEncoded,
            ...Array<InternetSchemas.SetupDataEncoded>,
        ],
    >(options: {
        nodes: Nodes;
    }): Effect.Effect<
        readonly [hubConfig: WireguardConfig, spokeConfigs: Array.NonEmptyReadonlyArray<WireguardConfig>],
        ParseResult.ParseError | WireguardErrors.WireguardError,
        never
    >;
    // Overload for when cidrBlock is provided
    <
        Nodes extends readonly [
            InternetSchemas.EndpointEncoded,
            InternetSchemas.EndpointEncoded,
            ...Array<InternetSchemas.EndpointEncoded>,
        ],
    >(options: {
        nodes: Nodes;
        cidrBlock: InternetSchemas.CidrBlock;
        addressStartingIndex?: number | undefined;
    }): Effect.Effect<
        readonly [hubConfig: WireguardConfig, spokeConfigs: Array.NonEmptyReadonlyArray<WireguardConfig>],
        ParseResult.ParseError | WireguardErrors.WireguardError,
        never
    >;
} = <
    Nodes extends
        | readonly [
              InternetSchemas.SetupDataEncoded,
              InternetSchemas.SetupDataEncoded,
              ...Array<InternetSchemas.SetupDataEncoded>,
          ]
        | readonly [
              InternetSchemas.EndpointEncoded,
              InternetSchemas.EndpointEncoded,
              ...Array<InternetSchemas.EndpointEncoded>,
          ],
>(options: {
    nodes: Nodes;
    cidrBlock?: Nodes extends readonly [
        InternetSchemas.EndpointEncoded,
        InternetSchemas.EndpointEncoded,
        ...Array<InternetSchemas.EndpointEncoded>,
    ]
        ? InternetSchemas.CidrBlock
        : never;
    addressStartingIndex?: Nodes extends readonly [
        InternetSchemas.EndpointEncoded,
        InternetSchemas.EndpointEncoded,
        ...Array<InternetSchemas.EndpointEncoded>,
    ]
        ? number | undefined
        : never;
}): Effect.Effect<
    readonly [hubConfig: WireguardConfig, spokeConfigs: Array.NonEmptyReadonlyArray<WireguardConfig>],
    ParseResult.ParseError | WireguardErrors.WireguardError,
    never
> => {
    const [firstNode, secondNode, ...rest] = options.nodes;
    return Predicate.isUndefined(options.cidrBlock)
        ? generate({
              preshareKeys: "generate" as const,
              trustMap: "trustAllPeers" as const,
              hubData: firstNode as InternetSchemas.SetupDataEncoded,
              spokeData: [secondNode, ...rest] as Array.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>,
          })
        : generate({
              preshareKeys: "generate" as const,
              trustMap: "trustAllPeers" as const,
              cidrBlock: options.cidrBlock,
              addressStartingIndex: options.addressStartingIndex,
              hubData: firstNode as InternetSchemas.EndpointEncoded,
              spokeData: [secondNode, ...rest] as Array.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
          });
};

/**
 * Generates a collection of wireguard configurations for a hub and spoke
 * network with a single central hub node and many peers all connected to it
 * where none of the peers trust each other.
 *
 * @since 1.0.0
 * @category Constructors
 * @param hubData - The data for the hub node.
 * @param spokeData - The data for the spoke nodes.
 */
export const generateHubSpokeConfigs: {
    // Overload for when cidrBlock is not provided
    <
        HubData extends InternetSchemas.SetupDataEncoded,
        SpokeData extends Array.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>,
    >(options: {
        hubData: HubData;
        spokeData: SpokeData;
    }): Effect.Effect<
        readonly [hubConfig: WireguardConfig, spokeConfigs: Array.NonEmptyReadonlyArray<WireguardConfig>],
        ParseResult.ParseError | WireguardErrors.WireguardError,
        never
    >;
    // Overload for when cidrBlock is provided
    <
        HubData extends InternetSchemas.EndpointEncoded,
        SpokeData extends Array.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
    >(options: {
        hubData: HubData;
        spokeData: SpokeData;
        cidrBlock: InternetSchemas.CidrBlock;
        addressStartingIndex?: number | undefined;
    }): Effect.Effect<
        readonly [hubConfig: WireguardConfig, spokeConfigs: Array.NonEmptyReadonlyArray<WireguardConfig>],
        ParseResult.ParseError | WireguardErrors.WireguardError,
        never
    >;
} = <
    HubData extends InternetSchemas.SetupDataEncoded | InternetSchemas.EndpointEncoded,
    SpokeData extends HubData extends InternetSchemas.SetupDataEncoded
        ? Array.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>
        : Array.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
>(options: {
    hubData: HubData;
    spokeData: SpokeData;
    cidrBlock?: HubData extends InternetSchemas.EndpointEncoded ? InternetSchemas.CidrBlock : never;
    addressStartingIndex?: HubData extends InternetSchemas.EndpointEncoded ? number | undefined : never;
}): Effect.Effect<
    readonly [hubConfig: WireguardConfig, spokeConfigs: Array.NonEmptyReadonlyArray<WireguardConfig>],
    ParseResult.ParseError | WireguardErrors.WireguardError,
    never
> => {
    return Predicate.isUndefined(options.cidrBlock)
        ? generate({
              preshareKeys: "generate" as const,
              trustMap: "trustNoPeers" as const,
              hubData: options.hubData as InternetSchemas.SetupDataEncoded,
              spokeData: options.spokeData as Array.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>,
          })
        : generate({
              preshareKeys: "generate" as const,
              trustMap: "trustNoPeers" as const,
              cidrBlock: options.cidrBlock,
              addressStartingIndex: options.addressStartingIndex,
              hubData: options.hubData as InternetSchemas.EndpointEncoded,
              spokeData: options.spokeData as Array.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
          });
};

/**
 * Generates a collection of wireguard configurations.
 *
 * @since 1.0.0
 * @category Constructors
 */
export const generate: {
    // Overload for when cidrBlock is not provided
    <
        HubData extends InternetSchemas.SetupDataEncoded,
        SpokeData extends Array.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>,
    >(options: {
        hubData: HubData;
        spokeData: SpokeData;
        preshareKeys?: HashMap.HashMap<SpokeData[number] | HubData, WireguardKey.WireguardKey> | "generate" | undefined;
        trustMap?:
            | HashMap.HashMap<SpokeData[number], Array.NonEmptyReadonlyArray<SpokeData[number]>>
            | "trustAllPeers"
            | "trustNoPeers"
            | undefined;
    }): Effect.Effect<
        readonly [hubConfig: WireguardConfig, spokeConfigs: Array.NonEmptyReadonlyArray<WireguardConfig>],
        ParseResult.ParseError | WireguardErrors.WireguardError,
        never
    >;
    // Overload for when cidrBlock is provided
    <
        HubData extends InternetSchemas.EndpointEncoded,
        SpokeData extends Array.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
    >(options: {
        hubData: HubData;
        spokeData: SpokeData;
        cidrBlock: InternetSchemas.CidrBlock;
        addressStartingIndex?: number | undefined;
        preshareKeys?: HashMap.HashMap<SpokeData[number] | HubData, WireguardKey.WireguardKey> | "generate" | undefined;
        trustMap?:
            | HashMap.HashMap<SpokeData[number], Array.NonEmptyReadonlyArray<SpokeData[number]>>
            | "trustAllPeers"
            | "trustNoPeers"
            | undefined;
    }): Effect.Effect<
        readonly [hubConfig: WireguardConfig, spokeConfigs: Array.NonEmptyReadonlyArray<WireguardConfig>],
        ParseResult.ParseError | WireguardErrors.WireguardError,
        never
    >;
} = <
    HubData extends InternetSchemas.SetupDataEncoded | InternetSchemas.EndpointEncoded,
    SpokeData extends HubData extends InternetSchemas.SetupDataEncoded
        ? Array.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>
        : Array.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
>(options: {
    hubData: HubData;
    spokeData: SpokeData;
    cidrBlock?: InternetSchemas.CidrBlock | undefined;
    addressStartingIndex?: number | undefined;
    preshareKeys?: HashMap.HashMap<SpokeData[number] | HubData, WireguardKey.WireguardKey> | "generate" | undefined;
    trustMap?:
        | HashMap.HashMap<SpokeData[number], Array.NonEmptyReadonlyArray<SpokeData[number]>>
        | "trustAllPeers"
        | "trustNoPeers"
        | undefined;
}): Effect.Effect<
    readonly [hubConfig: WireguardConfig, spokeConfigs: Array.NonEmptyReadonlyArray<WireguardConfig>],
    ParseResult.ParseError | WireguardErrors.WireguardError,
    never
> =>
    Effect.gen(function* (λ) {
        const inputIsSetupData = Array.isArray(options.hubData);
        const ipsNeeded =
            Array.length(
                options.spokeData as Array.NonEmptyReadonlyArray<
                    InternetSchemas.SetupDataEncoded | InternetSchemas.EndpointEncoded
                >
            ) + 1;

        // Bounds checking on the cidr block
        if (options.cidrBlock && options.cidrBlock.total < ipsNeeded) {
            return yield* λ(
                new WireguardErrors.WireguardError({
                    message: `Not enough IPs in the CIDR block for ${ipsNeeded} nodes`,
                })
            );
        }

        // Generate some ip addresses to use if the input data was just an endpoint
        const ips = options.cidrBlock?.range
            ? yield* λ(
                  Function.pipe(
                      options.cidrBlock?.range,
                      Stream.drop(options.addressStartingIndex ?? 0),
                      Stream.mapEffect(Schema.encode(InternetSchemas.Address)),
                      Stream.run(Sink.collectAllN(ipsNeeded)),
                      Effect.map(Chunk.toArray)
                  )
              )
            : yield* λ(Effect.succeed(Array.empty()));

        // Convert the trustMap to a HashMap if it's not already
        type TrustMap = Exclude<typeof options.trustMap, "trustAllPeers" | "trustNoPeers" | undefined>;
        const trustMap: TrustMap = Function.pipe(
            Match.value(options.trustMap),
            Match.when("trustAllPeers", () =>
                Function.pipe(
                    options.spokeData,
                    Array.map((spoke) => Tuple.make(spoke, options.spokeData)),
                    HashMap.fromIterable
                )
            ),
            Match.when(HashMap.isHashMap, Function.identity<TrustMap>),
            Match.whenOr("trustNoPeers", Predicate.isUndefined, (): TrustMap => Function.unsafeCoerce(HashMap.empty())),
            Match.exhaustive
        );

        // Convert the preshareKeys to a HashMap if it's not already
        type PreshareMap = Exclude<typeof options.preshareKeys, "generate" | undefined>;
        const preshareKeys: PreshareMap = Function.pipe(
            Match.value(options.preshareKeys),
            Match.when("generate", () =>
                Function.pipe(
                    options.spokeData,
                    Array.map((spoke) => Tuple.make(spoke, WireguardKey.generatePreshareKey())),
                    HashMap.fromIterable
                )
            ),
            Match.when(HashMap.isHashMap, Function.identity<PreshareMap>),
            Match.when(Predicate.isUndefined, (): PreshareMap => Function.unsafeCoerce(HashMap.empty())),
            Match.exhaustive
        );

        // Convert all inputs to be SetupDataEncoded
        const hubSetupDataEncoded: InternetSchemas.SetupDataEncoded = inputIsSetupData
            ? (options.hubData as InternetSchemas.SetupDataEncoded)
            : Tuple.make(options.hubData as InternetSchemas.EndpointEncoded, ips.at(0)?.ip ?? "");
        const spokeSetupDataEncoded: Array.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded> = inputIsSetupData
            ? (options.spokeData as Array.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>)
            : Array.map(options.spokeData, (spoke, index) =>
                  Tuple.make(spoke as InternetSchemas.EndpointEncoded, ips.at(index + 1)?.ip ?? "")
              );

        // Decode all SetupData inputs
        const hubSetupData = yield* λ(Schema.decode(InternetSchemas.SetupData)(hubSetupDataEncoded));
        const spokeSetupData = yield* λ(
            Effect.all(Array.map(spokeSetupDataEncoded, (spoke) => Schema.decode(InternetSchemas.SetupData)(spoke)))
        );
        const spokeSetupDataBoth = Array.zip(spokeSetupDataEncoded, spokeSetupData);

        // Generate the keys for the hub
        const hubKeys = WireguardKey.generateKeyPair();
        const hubPreshareKey = HashMap.get(preshareKeys, hubSetupDataEncoded).pipe(Option.getOrUndefined);

        // This hub peer config will be added to all the spoke interface configs
        const hubPeerConfig = {
            PresharedKey: hubPreshareKey,
            PublicKey: hubKeys.publicKey,
            Endpoint: Tuple.getFirst(hubSetupDataEncoded),
            AllowedIPs: [`${Tuple.getSecond(hubSetupDataEncoded)}/32`] as const,
        };

        // All these spoke peer configs will be added to the hub interface config
        const spokePeerConfigs = Array.map(spokeSetupDataBoth, ([spokeEncoded, spokeDecoded]) => {
            const keys = WireguardKey.generateKeyPair();
            const preshareKey = HashMap.get(preshareKeys, spokeEncoded).pipe(Option.getOrUndefined);

            return {
                setupDataEncoded: spokeEncoded,
                setupDataDecoded: spokeDecoded,
                keys: {
                    preshareKey,
                    privateKey: keys.privateKey,
                },
                peerConfig: {
                    PresharedKey: preshareKey,
                    PublicKey: keys.publicKey,
                    Endpoint: Tuple.getFirst(spokeEncoded),
                    AllowedIPs: [`${Tuple.getSecond(spokeEncoded)}/32`] as const,
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
        const hubConfig = yield* λ(
            Schema.decode(WireguardConfig)({
                PrivateKey: hubKeys.privateKey,
                ListenPort: Tuple.getFirst(hubSetupData).listenPort,
                Peers: Array.map(spokePeerConfigs, ({ peerConfig }) => peerConfig),
                Address: `${Tuple.getSecond(hubSetupDataEncoded)}/${options.cidrBlock?.mask ?? 24}`,
            })
        );

        // Each spoke interface config will have the hub peer config and the other peers from the trust map
        const spokeConfigs = yield* λ(
            Function.pipe(
                spokePeerConfigs,
                Array.map(({ keys: { privateKey }, setupDataDecoded, setupDataEncoded }) => {
                    const friends = Function.pipe(
                        trustMap,
                        HashMap.get(setupDataEncoded),
                        Option.getOrElse(() => Array.empty()),
                        Array.map((friend) => HashMap.get(spokePeerConfigsBySetupData, friend)),
                        Array.map(Option.getOrThrow),
                        Array.map(({ peerConfig }) => peerConfig)
                    );

                    return Schema.decode(WireguardConfig)({
                        PrivateKey: privateKey,
                        Peers: [hubPeerConfig, ...friends],
                        ListenPort: Tuple.getFirst(setupDataDecoded).listenPort,
                        Address: `${Tuple.getSecond(setupDataEncoded)}/${options.cidrBlock?.mask ?? 24}`,
                    });
                }),
                Effect.allWith()
            )
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
    Effect.gen(function* (λ) {
        const fs = yield* λ(FileSystem.FileSystem);
        const fsConfig = yield* λ(fs.readFileString(file));
        const iniConfigEncoded = yield* λ(Schema.encode(WireguardIniConfig)(fsConfig));
        const config = yield* λ(Schema.decode(WireguardConfig)(iniConfigEncoded));
        return config;
    });
