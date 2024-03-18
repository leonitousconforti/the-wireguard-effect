import * as Platform from "@effect/platform";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Option from "effect/Option";
import * as Predicate from "effect/Predicate";
import * as ReadonlyArray from "effect/ReadonlyArray";
import * as Scope from "effect/Scope";
import * as Tuple from "effect/Tuple";

import * as InternetSchemas from "../InternetSchemas.js";
import * as WireguardConfig from "../WireguardConfig.js";
import * as WireguardError from "../WireguardErrors.js";
import * as WireguardInterface from "../WireguardInterface.js";
import * as WireguardKey from "../WireguardKey.js";

/** @internal */
export const fromConfigFile = (
    file: string,
): Effect.Effect<
    WireguardConfig.WireguardConfig,
    ParseResult.ParseError | Platform.Error.PlatformError,
    Platform.FileSystem.FileSystem
> =>
    Effect.gen(function* (λ) {
        const fs = yield* λ(Platform.FileSystem.FileSystem);
        const fsConfig = yield* λ(fs.readFileString(file));
        const iniConfigDecoded = WireguardConfig.WireguardIniConfig(fsConfig);
        const iniConfigEncoded = yield* λ(Schema.encode(WireguardConfig.WireguardIniConfig)(iniConfigDecoded));
        const config = yield* λ(Schema.decode(WireguardConfig.WireguardConfig)(iniConfigEncoded));
        return config;
    });

/** @internal */
export const writeToFile = Function.dual<
    (
        config: WireguardConfig.WireguardConfig,
    ) => (
        file: string,
    ) => Effect.Effect<
        void,
        ParseResult.ParseError | Platform.Error.PlatformError,
        Platform.FileSystem.FileSystem | Platform.Path.Path
    >,
    (
        file: string,
        config: WireguardConfig.WireguardConfig,
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
    }),
);

/** @internal */
export const generateP2PConfigs: {
    // Overload for when cidrBlock is not provided
    <T extends InternetSchemas.SetupDataEncoded | InternetSchemas.SetupData>(
        aliceData: T,
        bobData: T,
    ): Effect.Effect<
        [aliceConfig: WireguardConfig.WireguardConfig, bobConfig: WireguardConfig.WireguardConfig],
        ParseResult.ParseError,
        never
    >;
    // Overload for when cidrBlock is provided
    <T extends InternetSchemas.EndpointEncoded | InternetSchemas.Endpoint>(
        aliceEndpoint: T,
        bobEndpoint: T,
        cidrBlock: InternetSchemas.CidrBlockEncoded,
    ): Effect.Effect<
        [aliceConfig: WireguardConfig.WireguardConfig, bobConfig: WireguardConfig.WireguardConfig],
        ParseResult.ParseError,
        never
    >;
} = <
    T extends
        | InternetSchemas.SetupDataEncoded
        | InternetSchemas.EndpointEncoded
        | InternetSchemas.SetupData
        | InternetSchemas.Endpoint,
>(
    aliceData: T,
    bobData: T,
    cidrBlock?: InternetSchemas.CidrBlockEncoded | undefined,
): Effect.Effect<
    [aliceConfig: WireguardConfig.WireguardConfig, bobConfig: WireguardConfig.WireguardConfig],
    ParseResult.ParseError,
    never
> =>
    Effect.gen(function* (λ) {
        const hubEndpoint = aliceData;
        const spokeEndpoints = ReadonlyArray.make(bobData);
        const [aliceConfig, [bobConfig]] = Predicate.isUndefined(cidrBlock)
            ? yield* λ(
                  generateHubSpokeConfigs(
                      hubEndpoint as InternetSchemas.SetupDataEncoded,
                      spokeEndpoints as ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>,
                  ),
              )
            : yield* λ(
                  generateHubSpokeConfigs(
                      hubEndpoint as InternetSchemas.EndpointEncoded,
                      spokeEndpoints as ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
                      cidrBlock,
                  ),
              );
        return Tuple.make(aliceConfig, bobConfig);
    });

/** @internal */
export const generateHubSpokeConfigs: {
    // Overload for when cidrBlock is not provided
    <T extends InternetSchemas.SetupDataEncoded | InternetSchemas.SetupData>(
        hubData: T,
        spokeData: ReadonlyArray.NonEmptyReadonlyArray<T>,
    ): Effect.Effect<
        [
            hubConfig: WireguardConfig.WireguardConfig,
            spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardConfig.WireguardConfig>,
        ],
        ParseResult.ParseError,
        never
    >;
    // Overload for when cidrBlock is provided
    <T extends InternetSchemas.EndpointEncoded | InternetSchemas.Endpoint>(
        hubData: T,
        spokeData: ReadonlyArray.NonEmptyReadonlyArray<T>,
        cidrBlock: InternetSchemas.CidrBlockEncoded,
    ): Effect.Effect<
        [
            hubConfig: WireguardConfig.WireguardConfig,
            spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardConfig.WireguardConfig>,
        ],
        ParseResult.ParseError,
        never
    >;
} = <
    T extends
        | InternetSchemas.SetupDataEncoded
        | InternetSchemas.EndpointEncoded
        | InternetSchemas.SetupData
        | InternetSchemas.Endpoint,
>(
    hubData: T,
    spokeData: ReadonlyArray.NonEmptyReadonlyArray<T>,
    cidrBlock?: InternetSchemas.CidrBlockEncoded | undefined,
): Effect.Effect<
    [
        hubConfig: WireguardConfig.WireguardConfig,
        spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardConfig.WireguardConfig>,
    ],
    ParseResult.ParseError,
    never
> =>
    Effect.gen(function* (λ) {
        // Convert the setup data to the correct format if needed
        const isSetupData = Predicate.isUndefined(cidrBlock);
        const hubSetupData = isSetupData
            ? (hubData as InternetSchemas.SetupDataEncoded)
            : Tuple.make(hubData as InternetSchemas.EndpointEncoded, "");
        const spokeSetupData = isSetupData
            ? (spokeData as ReadonlyArray.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded>)
            : ReadonlyArray.map(spokeData, (spoke) => Tuple.make(spoke as InternetSchemas.EndpointEncoded, ""));

        // Generate the keys and parse the setup data
        const hubKeys = WireguardKey.generateKeyPair();
        const hubsData = yield* λ(Schema.decode(InternetSchemas.SetupData)(hubSetupData));
        const spokesData = yield* λ(
            Effect.all(ReadonlyArray.map(spokeSetupData, (spoke) => Schema.decode(InternetSchemas.SetupData)(spoke))),
        );

        // This hub peer config will be added to all the spoke interface configs
        const hubPeerConfig = {
            PublicKey: hubKeys.publicKey,
            Endpoint: Tuple.getFirst(hubsData),
            AllowedIPs: [
                InternetSchemas.CidrBlock({
                    ipv4: InternetSchemas.IPv4(Tuple.getSecond(hubsData)),
                    mask: InternetSchemas.IPv4CidrMask(32),
                }),
            ],
        };

        // All these spoke peer configs will be added to the hub interface config
        const spokePeerConfigs = ReadonlyArray.map(spokesData, (spoke) => {
            const keys = WireguardKey.generateKeyPair();
            const peerConfig = {
                Endpoint: Tuple.getFirst(spoke),
                PublicKey: keys.publicKey,
                AllowedIPs: [
                    InternetSchemas.CidrBlock({
                        ipv4: InternetSchemas.IPv4(Tuple.getSecond(spoke)),
                        mask: InternetSchemas.IPv4CidrMask(32),
                    }),
                ],
            };
            return Tuple.make(Tuple.make(keys.privateKey, spoke), peerConfig);
        });

        // The hub interface config will have all the spoke peer configs
        const hubConfig = yield* λ(
            Schema.decode(WireguardConfig.WireguardConfig)({
                PrivateKey: hubKeys.privateKey,
                Address: InternetSchemas.CidrBlock({
                    ipv4: InternetSchemas.IPv4(Tuple.getSecond(hubsData)),
                    mask: InternetSchemas.IPv4CidrMask(24),
                }),
                ListenPort: Tuple.getFirst(hubsData).listenPort,
                Peers: ReadonlyArray.map(spokePeerConfigs, Tuple.getSecond),
            }),
        );

        // Each spoke interface config will have the hub peer config
        const spokeConfigs = yield* λ(
            Function.pipe(
                spokePeerConfigs,
                ReadonlyArray.map(([[privateKey, spoke]]) =>
                    Schema.decode(WireguardConfig.WireguardConfig)({
                        PrivateKey: privateKey,
                        Peers: [hubPeerConfig],
                        Address: InternetSchemas.CidrBlock({
                            ipv4: InternetSchemas.IPv4(Tuple.getSecond(spoke)),
                            mask: InternetSchemas.IPv4CidrMask(24),
                        }),
                        ListenPort: Tuple.getFirst(spoke).listenPort,
                    }),
                ),
                Effect.allWith(),
            ),
        );

        return Tuple.make(hubConfig, spokeConfigs);
    });

/** @internal */
export const up = Function.dual<
    (
        config: WireguardConfig.WireguardConfig,
    ) => (
        interfaceObject: Option.Option<WireguardInterface.WireguardInterface> | undefined,
    ) => Effect.Effect<
        WireguardInterface.WireguardInterface,
        WireguardError.WireguardError | Cause.TimeoutException,
        Platform.FileSystem.FileSystem | Platform.Path.Path
    >,
    (
        interfaceObject: Option.Option<WireguardInterface.WireguardInterface> | undefined,
        config: WireguardConfig.WireguardConfig,
    ) => Effect.Effect<
        WireguardInterface.WireguardInterface,
        WireguardError.WireguardError | Cause.TimeoutException,
        Platform.FileSystem.FileSystem | Platform.Path.Path
    >
>(
    2,
    (
        interfaceObject: Option.Option<WireguardInterface.WireguardInterface> | undefined = Option.none(),
        config: WireguardConfig.WireguardConfig,
    ) =>
        Function.pipe(
            interfaceObject,
            Option.map(Effect.succeed),
            Option.getOrElse(WireguardInterface.WireguardInterface.getNextAvailableInterface),
            Effect.flatMap((io) => io.up(config)),
        ),
);

/** @internal */
export const upScoped = Function.dual<
    (
        config: WireguardConfig.WireguardConfig,
    ) => (
        interfaceObject: Option.Option<WireguardInterface.WireguardInterface> | undefined,
    ) => Effect.Effect<
        WireguardInterface.WireguardInterface,
        WireguardError.WireguardError | Cause.TimeoutException,
        Platform.FileSystem.FileSystem | Platform.Path.Path | Scope.Scope
    >,
    (
        interfaceObject: Option.Option<WireguardInterface.WireguardInterface> | undefined,
        config: WireguardConfig.WireguardConfig,
    ) => Effect.Effect<
        WireguardInterface.WireguardInterface,
        WireguardError.WireguardError | Cause.TimeoutException,
        Platform.FileSystem.FileSystem | Platform.Path.Path | Scope.Scope
    >
>(
    2,
    (
        interfaceObject: Option.Option<WireguardInterface.WireguardInterface> | undefined = Option.none(),
        config: WireguardConfig.WireguardConfig,
    ) => Effect.acquireRelease(up(interfaceObject, config), (io) => Function.flow(io.down, Effect.orDie)()),
);
