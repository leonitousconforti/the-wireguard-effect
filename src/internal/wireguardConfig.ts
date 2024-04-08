import * as Platform from "@effect/platform";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Cause from "effect/Cause";
import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Option from "effect/Option";
import * as Predicate from "effect/Predicate";
import * as ReadonlyArray from "effect/ReadonlyArray";
import * as Scope from "effect/Scope";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";
import * as Tuple from "effect/Tuple";

import * as InternetSchemas from "../InternetSchemas.js";
import * as WireguardConfig from "../WireguardConfig.js";
import * as WireguardErrors from "../WireguardErrors.js";
import * as WireguardInterface from "../WireguardInterface.js";
import * as WireguardKey from "../WireguardKey.js";

/** @internal */
export const fromConfigFile = (
    file: string
): Effect.Effect<
    WireguardConfig.WireguardConfig,
    ParseResult.ParseError | Platform.Error.PlatformError,
    Platform.FileSystem.FileSystem
> =>
    Effect.gen(function* (λ) {
        const fs = yield* λ(Platform.FileSystem.FileSystem);
        const fsConfig = yield* λ(fs.readFileString(file));
        const iniConfigEncoded = yield* λ(Schema.encode(WireguardConfig.WireguardIniConfig)(fsConfig));
        const config = yield* λ(Schema.decode(WireguardConfig.WireguardConfig)(iniConfigEncoded));
        return config;
    });

/** @internal */
export const writeToFile = Function.dual<
    (
        config: WireguardConfig.WireguardConfig
    ) => (
        file: string
    ) => Effect.Effect<
        void,
        ParseResult.ParseError | Platform.Error.PlatformError,
        Platform.FileSystem.FileSystem | Platform.Path.Path
    >,
    (
        file: string,
        config: WireguardConfig.WireguardConfig
    ) => Effect.Effect<
        void,
        ParseResult.ParseError | Platform.Error.PlatformError,
        Platform.FileSystem.FileSystem | Platform.Path.Path
    >
>(2, (file: string, config: WireguardConfig.WireguardConfig) =>
    Effect.gen(function* (λ) {
        const path = yield* λ(Platform.Path.Path);
        const fs = yield* λ(Platform.FileSystem.FileSystem);
        const configEncoded = yield* λ(Schema.encode(WireguardConfig.WireguardConfig)(config));
        const iniConfigDecoded = yield* λ(Schema.decode(WireguardConfig.WireguardIniConfig)(configEncoded));
        yield* λ(fs.makeDirectory(path.dirname(file), { recursive: true }));
        yield* λ(fs.writeFileString(file, iniConfigDecoded));
    })
);

/** @internal */
export const generateP2PConfigs: {
    // Overload for when cidrBlock is not provided
    <AliceData extends InternetSchemas.SetupDataEncoded, BobData extends InternetSchemas.SetupDataEncoded>(options: {
        aliceData: AliceData;
        bobData: BobData;
    }): Effect.Effect<
        readonly [aliceConfig: WireguardConfig.WireguardConfig, bobConfig: WireguardConfig.WireguardConfig],
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
        readonly [aliceConfig: WireguardConfig.WireguardConfig, bobConfig: WireguardConfig.WireguardConfig],
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
    readonly [aliceConfig: WireguardConfig.WireguardConfig, bobConfig: WireguardConfig.WireguardConfig],
    ParseResult.ParseError | WireguardErrors.WireguardError,
    never
> => {
    const hub = options.aliceData;
    const spokes = ReadonlyArray.make(options.bobData);
    const configs = Predicate.isUndefined(options.cidrBlock)
        ? generate({
              preshareKeys: "generate" as const,
              trustMap: "trustAllPeers" as const,
              hubData: hub as InternetSchemas.SetupDataEncoded,
              spokeData: spokes as ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>,
          })
        : generate({
              preshareKeys: "generate" as const,
              trustMap: "trustAllPeers" as const,
              hubData: hub as InternetSchemas.EndpointEncoded,
              spokeData: spokes as ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
              cidrBlock: options.cidrBlock,
              addressStartingIndex: options.addressStartingIndex,
          });
    return Effect.map(configs, ([aliceConfig, [bobConfig]]) => Tuple.make(aliceConfig, bobConfig));
};

/** @internal */
export const generateStarConfigs: {
    // Overload for when cidrBlock is not provided
    <
        HubData extends InternetSchemas.SetupDataEncoded,
        SpokeData extends ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>,
    >(options: {
        hubData: HubData;
        spokeData: SpokeData;
    }): Effect.Effect<
        readonly [
            hubConfig: WireguardConfig.WireguardConfig,
            spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardConfig.WireguardConfig>,
        ],
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
        readonly [
            hubConfig: WireguardConfig.WireguardConfig,
            spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardConfig.WireguardConfig>,
        ],
        ParseResult.ParseError | WireguardErrors.WireguardError,
        never
    >;
} = <
    HubData extends InternetSchemas.SetupDataEncoded | InternetSchemas.EndpointEncoded,
    SpokeData extends HubData extends InternetSchemas.SetupDataEncoded
        ? ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>
        : ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
>(options: {
    hubData: HubData;
    spokeData: SpokeData;
    cidrBlock?: HubData extends InternetSchemas.EndpointEncoded ? InternetSchemas.CidrBlock : never;
    addressStartingIndex?: HubData extends InternetSchemas.EndpointEncoded ? number | undefined : never;
}): Effect.Effect<
    readonly [
        hubConfig: WireguardConfig.WireguardConfig,
        spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardConfig.WireguardConfig>,
    ],
    ParseResult.ParseError | WireguardErrors.WireguardError,
    never
> => {
    return Predicate.isUndefined(options.cidrBlock)
        ? generate({
              preshareKeys: "generate" as const,
              trustMap: "trustAllPeers" as const,
              hubData: options.hubData as InternetSchemas.SetupDataEncoded,
              spokeData: options.spokeData as ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>,
          })
        : generate({
              preshareKeys: "generate" as const,
              trustMap: "trustAllPeers" as const,
              cidrBlock: options.cidrBlock,
              addressStartingIndex: options.addressStartingIndex,
              hubData: options.hubData as InternetSchemas.EndpointEncoded,
              spokeData: options.spokeData as ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
          });
};

/** @internal */
export const generateHubSpokeConfigs: {
    // Overload for when cidrBlock is not provided
    <
        HubData extends InternetSchemas.SetupDataEncoded,
        SpokeData extends ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>,
    >(options: {
        hubData: HubData;
        spokeData: SpokeData;
    }): Effect.Effect<
        readonly [
            hubConfig: WireguardConfig.WireguardConfig,
            spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardConfig.WireguardConfig>,
        ],
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
        readonly [
            hubConfig: WireguardConfig.WireguardConfig,
            spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardConfig.WireguardConfig>,
        ],
        ParseResult.ParseError | WireguardErrors.WireguardError,
        never
    >;
} = <
    HubData extends InternetSchemas.SetupDataEncoded | InternetSchemas.EndpointEncoded,
    SpokeData extends HubData extends InternetSchemas.SetupDataEncoded
        ? ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>
        : ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
>(options: {
    hubData: HubData;
    spokeData: SpokeData;
    cidrBlock?: HubData extends InternetSchemas.EndpointEncoded ? InternetSchemas.CidrBlock : never;
    addressStartingIndex?: HubData extends InternetSchemas.EndpointEncoded ? number | undefined : never;
}): Effect.Effect<
    readonly [
        hubConfig: WireguardConfig.WireguardConfig,
        spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardConfig.WireguardConfig>,
    ],
    ParseResult.ParseError | WireguardErrors.WireguardError,
    never
> => {
    return Predicate.isUndefined(options.cidrBlock)
        ? generate({
              preshareKeys: "generate" as const,
              trustMap: "trustNoPeers" as const,
              hubData: options.hubData as InternetSchemas.SetupDataEncoded,
              spokeData: options.spokeData as ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>,
          })
        : generate({
              preshareKeys: "generate" as const,
              trustMap: "trustNoPeers" as const,
              cidrBlock: options.cidrBlock,
              addressStartingIndex: options.addressStartingIndex,
              hubData: options.hubData as InternetSchemas.EndpointEncoded,
              spokeData: options.spokeData as ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
          });
};

/** @internal */
export const generate: {
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
        readonly [
            hubConfig: WireguardConfig.WireguardConfig,
            spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardConfig.WireguardConfig>,
        ],
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
        readonly [
            hubConfig: WireguardConfig.WireguardConfig,
            spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardConfig.WireguardConfig>,
        ],
        ParseResult.ParseError | WireguardErrors.WireguardError,
        never
    >;
} = <
    HubData extends InternetSchemas.SetupDataEncoded | InternetSchemas.EndpointEncoded,
    SpokeData extends HubData extends InternetSchemas.SetupDataEncoded
        ? ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>
        : ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
    TrustMap extends HashMap.HashMap<keyof SpokeData, ReadonlyArray.NonEmptyReadonlyArray<keyof SpokeData>>,
    PreshareKeysMap extends HashMap.HashMap<
        keyof SpokeData | HubData,
        { readonly privateKey: WireguardKey.WireguardKey; readonly publicKey: WireguardKey.WireguardKey }
    >,
>(options: {
    hubData: HubData;
    spokeData: SpokeData;
    cidrBlock?: HubData extends InternetSchemas.EndpointEncoded ? InternetSchemas.CidrBlock : never;
    addressStartingIndex?: HubData extends InternetSchemas.EndpointEncoded ? number | undefined : never;
    preshareKeys?: HubData extends InternetSchemas.EndpointEncoded ? PreshareKeysMap | "generate" | undefined : never;
    trustMap?: HubData extends InternetSchemas.EndpointEncoded
        ? TrustMap | "trustAllPeers" | "trustNoPeers" | undefined
        : never;
}): Effect.Effect<
    readonly [
        hubConfig: WireguardConfig.WireguardConfig,
        spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardConfig.WireguardConfig>,
    ],
    ParseResult.ParseError | WireguardErrors.WireguardError,
    never
> =>
    Effect.gen(function* (λ) {
        const inputIsSetupData = Array.isArray(options.hubData);

        const ipsNeeded =
            ReadonlyArray.length(
                options.spokeData as ReadonlyArray.NonEmptyReadonlyArray<
                    InternetSchemas.SetupDataEncoded | InternetSchemas.EndpointEncoded
                >
            ) + 1;

        // Bounds checking on the cidr block
        if (options.cidrBlock && options.cidrBlock.total < ipsNeeded) {
            return yield* λ(new WireguardErrors.WireguardError({ message: "Not enough IPs in the CIDR block" }));
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
            : yield* λ(Effect.succeed([]));

        // Convert all inputs to be SetupDataEncoded
        const hubSetupDataEncoded: InternetSchemas.SetupDataEncoded = inputIsSetupData
            ? (options.hubData as InternetSchemas.SetupDataEncoded)
            : Tuple.make(options.hubData as InternetSchemas.EndpointEncoded, ips.at(0)?.ip ?? "");
        const spokeSetupDataEncoded: ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded> =
            inputIsSetupData
                ? (options.spokeData as ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>)
                : ReadonlyArray.map(options.spokeData, (spoke, index) =>
                      Tuple.make(spoke as InternetSchemas.EndpointEncoded, ips.at(index + 1)?.ip ?? "")
                  );

        // Decode all SetupData inputs
        const hubSetupData = yield* λ(Schema.decode(InternetSchemas.SetupData)(hubSetupDataEncoded));
        const spokeSetupData = yield* λ(
            Effect.all(
                ReadonlyArray.map(spokeSetupDataEncoded, (spoke) => Schema.decode(InternetSchemas.SetupData)(spoke))
            )
        );
        const spokeSetupDataBoth = ReadonlyArray.zip(spokeSetupDataEncoded, spokeSetupData);

        // Generate the keys for the hub
        const hubKeys = WireguardKey.generateKeyPair();
        // const hubPreshareKeys =
        //     options.preshareKeys === "generate"
        //         ? WireguardKey.generateKeyPair()
        //         : Predicate.isNotUndefined(options.preshareKeys)
        //           ? HashMap.get(options.preshareKeys, options.hubData).pipe(Option.getOrUndefined)
        //           : undefined;

        // This hub peer config will be added to all the spoke interface configs
        const hubPeerConfig = {
            PublicKey: hubKeys.publicKey,
            Endpoint: Tuple.getFirst(hubSetupDataEncoded),
            AllowedIPs: [`${Tuple.getSecond(hubSetupDataEncoded)}/32`] as const,
        };

        // All these spoke peer configs will be added to the hub interface config
        const spokePeerConfigs = ReadonlyArray.map(spokeSetupDataBoth, ([spokeEncoded, spokeDecoded]) => {
            const keys = WireguardKey.generateKeyPair();
            const preshareKeys =
                options.preshareKeys === "generate"
                    ? WireguardKey.generateKeyPair()
                    : Predicate.isNotUndefined(options.preshareKeys)
                      ? HashMap.get(options.preshareKeys, spokeDecoded).pipe(Option.getOrUndefined)
                      : undefined;

            return {
                setupDataEncoded: spokeEncoded,
                setupDataDecoded: spokeDecoded,
                keys: {
                    privateKey: keys.privateKey,
                    privatePreshareKey: preshareKeys?.privateKey,
                },
                peerConfig: {
                    PublicKey: keys.publicKey,
                    Endpoint: Tuple.getFirst(spokeEncoded),
                    AllowedIPs: [`${Tuple.getSecond(spokeEncoded)}/32`] as const,
                },
            };
        });

        // The hub interface config will have all the spoke peer configs
        const hubConfig = yield* λ(
            Schema.decode(WireguardConfig.WireguardConfig)({
                PrivateKey: hubKeys.privateKey,
                ListenPort: Tuple.getFirst(hubSetupData).listenPort,
                Peers: ReadonlyArray.map(spokePeerConfigs, ({ peerConfig }) => peerConfig),
                Address: `${Tuple.getSecond(hubSetupDataEncoded)}/${options.cidrBlock?.mask ?? 24}`,
            })
        );

        // Each spoke interface config will have the hub peer config
        const spokeConfigs = yield* λ(
            Function.pipe(
                spokePeerConfigs,
                ReadonlyArray.map(({ setupDataDecoded, setupDataEncoded, keys: { privateKey } }) =>
                    Schema.decode(WireguardConfig.WireguardConfig)({
                        PrivateKey: privateKey,
                        Peers: [hubPeerConfig],
                        ListenPort: Tuple.getFirst(setupDataDecoded).listenPort,
                        Address: `${Tuple.getSecond(setupDataEncoded)}/${options.cidrBlock?.mask ?? 24}`,
                    })
                ),
                Effect.allWith()
            )
        );

        return Tuple.make(hubConfig, spokeConfigs);
    });

/** @internal */
export const up: {
    (
        options: {
            how?: "bundled-wireguard-go+userspace-api" | "system-wireguard-go+userspace-api" | undefined;
            sudo?: boolean | "ask" | undefined;
        },
        interfaceObject?: WireguardInterface.WireguardInterface | undefined
    ): (
        config: WireguardConfig.WireguardConfig
    ) => Effect.Effect<
        void,
        WireguardErrors.WireguardError | ParseResult.ParseError | Platform.Error.PlatformError | Cause.UnknownException,
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
    ): (
        config: WireguardConfig.WireguardConfig
    ) => Effect.Effect<
        string,
        WireguardErrors.WireguardError | ParseResult.ParseError | Platform.Error.PlatformError | Cause.UnknownException,
        Platform.FileSystem.FileSystem | Platform.Path.Path
    >;
    (
        config: WireguardConfig.WireguardConfig,
        options: {
            how?: "bundled-wireguard-go+userspace-api" | "system-wireguard-go+userspace-api" | undefined;
            sudo?: boolean | "ask" | undefined;
        },
        interfaceObject?: WireguardInterface.WireguardInterface | undefined
    ): Effect.Effect<
        void,
        WireguardErrors.WireguardError | ParseResult.ParseError | Platform.Error.PlatformError | Cause.UnknownException,
        Platform.FileSystem.FileSystem | Platform.Path.Path
    >;
    (
        config: WireguardConfig.WireguardConfig,
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
        WireguardErrors.WireguardError | ParseResult.ParseError | Platform.Error.PlatformError | Cause.UnknownException,
        Platform.FileSystem.FileSystem | Platform.Path.Path
    >;
} = Function.dual(
    3,
    <
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
        config: WireguardConfig.WireguardConfig,
        options: {
            how?: How;
            sudo?: boolean | "ask" | undefined;
        },
        interfaceObject?: WireguardInterface.WireguardInterface | undefined
    ): Ret => {
        const io: Effect.Effect<WireguardInterface.WireguardInterface, WireguardErrors.WireguardError, never> =
            Function.pipe(
                interfaceObject,
                Option.fromNullable,
                Option.map(Effect.succeed),
                Option.getOrElse(() => WireguardInterface.WireguardInterface.getNextAvailableInterface)
            );

        const how = options.how;
        if (
            how === undefined ||
            how === "bundled-wireguard-go+userspace-api" ||
            how === "system-wireguard-go+userspace-api"
        ) {
            return Effect.flatMap(io, (io) => io.up(config, { how, sudo: options.sudo })) as Ret;
        } else {
            return Effect.flatMap(io, (io) => io.up(config, { how, sudo: options.sudo })) as Ret;
        }
    }
);

/** @internal */
export const upScoped: {
    (
        options: {
            how?: "bundled-wireguard-go+userspace-api" | "system-wireguard-go+userspace-api" | undefined;
            sudo?: boolean | "ask" | undefined;
        },
        interfaceObject?: WireguardInterface.WireguardInterface | undefined
    ): (
        config: WireguardConfig.WireguardConfig
    ) => Effect.Effect<
        void,
        WireguardErrors.WireguardError | ParseResult.ParseError | Platform.Error.PlatformError | Cause.UnknownException,
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
    ): (
        config: WireguardConfig.WireguardConfig
    ) => Effect.Effect<
        string,
        WireguardErrors.WireguardError | ParseResult.ParseError | Platform.Error.PlatformError | Cause.UnknownException,
        Platform.FileSystem.FileSystem | Platform.Path.Path | Scope.Scope
    >;
    (
        config: WireguardConfig.WireguardConfig,
        options: {
            how?: "bundled-wireguard-go+userspace-api" | "system-wireguard-go+userspace-api" | undefined;
            sudo?: boolean | "ask" | undefined;
        },
        interfaceObject?: WireguardInterface.WireguardInterface | undefined
    ): Effect.Effect<
        void,
        WireguardErrors.WireguardError | ParseResult.ParseError | Platform.Error.PlatformError | Cause.UnknownException,
        Platform.FileSystem.FileSystem | Platform.Path.Path | Scope.Scope
    >;
    (
        config: WireguardConfig.WireguardConfig,
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
        WireguardErrors.WireguardError | ParseResult.ParseError | Platform.Error.PlatformError | Cause.UnknownException,
        Platform.FileSystem.FileSystem | Platform.Path.Path | Scope.Scope
    >;
} = Function.dual(
    3,
    <
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
        config: WireguardConfig.WireguardConfig,
        options: {
            how?: How;
            sudo?: boolean | "ask" | undefined;
        },
        interfaceObject?: WireguardInterface.WireguardInterface | undefined
    ): Ret => {
        const io: Effect.Effect<WireguardInterface.WireguardInterface, WireguardErrors.WireguardError, never> =
            Function.pipe(
                interfaceObject,
                Option.fromNullable,
                Option.map(Effect.succeed),
                Option.getOrElse(() => WireguardInterface.WireguardInterface.getNextAvailableInterface)
            );

        const how = options.how;
        if (
            how === undefined ||
            how === "bundled-wireguard-go+userspace-api" ||
            how === "system-wireguard-go+userspace-api"
        ) {
            return Effect.flatMap(io, (io) => io.upScoped(config, { how, sudo: options.sudo })) as Ret;
        } else {
            return Effect.flatMap(io, (io) => io.upScoped(config, { how, sudo: options.sudo })) as Ret;
        }
    }
);
