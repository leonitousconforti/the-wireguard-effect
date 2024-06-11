/**
 * Basic Wireguard NAT traversal utilities such as UDP hole punching
 * implementations and side channel implementations.
 *
 * @since 1.0.0
 */

import * as PlatformError from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Array from "effect/Array";
import * as Cause from "effect/Cause";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as datagram from "node:dgram";

import * as InternetSchemas from "./InternetSchemas.js";
import * as WireguardConfig from "./WireguardConfig.js";

/**
 * @since 1.0.0
 * @category Models
 */
export interface UdpHolePunchingImpl {
    punch: (
        from: InternetSchemas.PortBrand,
        to: InternetSchemas.Endpoint
    ) => Effect.Effect<void, Cause.UnknownException, never>;
}

/**
 * @since 1.0.0
 * @category Tags
 */
export interface UdpHolePunching {
    readonly _: unique symbol;
}

/**
 * @since 1.0.0
 * @category Tags
 */
export const UdpHolePunching = Context.GenericTag<UdpHolePunching, UdpHolePunchingImpl>(
    "@leonitousconforti/the-wireguard-effect/UdpHolePunching"
);

/**
 * @since 1.0.0
 * @category Constructors
 */
export const makePingUdpHolePunching: Effect.Effect<UdpHolePunchingImpl, never, never> = Effect.gen(function* () {
    return UdpHolePunching.of({});
});

/**
 * @since 1.0.0
 * @category Constructors
 */
export const makeNodejsUdpHolePunching = (): UdpHolePunchingImpl => {
    const punch: UdpHolePunchingImpl["punch"] = (from, to) =>
        Effect.async<void, Cause.UnknownException>((resume) => {
            let timer: NodeJS.Timeout | undefined = undefined;
            const socket = datagram.createSocket("udp4");
            socket.bind(from);

            function onError(error: Error) {
                socket.close();
                timer && clearInterval(timer);
                resume(Effect.fail(new Cause.UnknownException(error)));
            }

            function onFinish() {
                socket.off("error", onError);
                socket.off("listening", onListening);
                timer && clearInterval(timer);
                resume(Effect.void);
            }

            function onListening() {
                timer = setInterval(() => socket.send(".", to.natPort, "host" in to ? to.host : to.address.ip), 1000);
            }

            socket.once("error", onError);
            socket.once("message", onFinish);
            socket.once("listening", onListening);

            return Effect.sync(() => {
                socket.off("error", onError);
                socket.off("message", onFinish);
                socket.off("listening", onListening);
            });
        });

    return UdpHolePunching.of({ punch });
};

/**
 * @since 1.0.0
 * @category Layers
 */
export const PingUdpHolePunching: Layer.Layer<UdpHolePunching, never, never> = Layer.effect(
    UdpHolePunching,
    makePingUdpHolePunching
);

/**
 * @since 1.0.0
 * @category Layers
 */
export const NodejsUdpHolePunching: Layer.Layer<UdpHolePunching, never, never> = Layer.sync(
    UdpHolePunching,
    makeNodejsUdpHolePunching
);

/**
 * @since 1.0.0
 * @category Models
 */
export interface SideChannelImpl {
    readonly attemptConnection: (
        clientIdentifier: Schema.Schema.Encoded<Schema.UUID>,
        serverIdentifier: Schema.Schema.Encoded<Schema.UUID>
    ) => Effect.Effect<
        WireguardConfig.WireguardConfig,
        Cause.UnknownException | Cause.TimeoutException | ParseResult.ParseError | PlatformError.PlatformError,
        never
    >;
    readonly processConnectionRequest: (
        clientIdentifier: Schema.Schema.Encoded<Schema.UUID>,
        serverIdentifier: Schema.Schema.Encoded<Schema.UUID>
    ) => Effect.Effect<void, Cause.UnknownException | ParseResult.ParseError | PlatformError.PlatformError, never>;
}

/**
 * @since 1.0.0
 * @category Tags
 */
export interface SideChannel {
    readonly _: unique symbol;
}

/**
 * @since 1.0.0
 * @category Tags
 */
export const SideChannel = Context.GenericTag<SideChannel, SideChannelImpl>(
    "@leonitousconforti/the-wireguard-effect/SideChannel"
);

/**
 * @since 1.0.0
 * @category Constructors
 */
export const makeGithubActionsArtifactSideChannel: Effect.Effect<
    SideChannelImpl,
    never,
    Path.Path | FileSystem.FileSystem
> = Effect.gen(function* () {
    const path = yield* Path.Path;
    const filesystem = yield* FileSystem.FileSystem;

    const artifactClient = yield* Effect.promise(() => import("@actions/artifact"));
    const defaultClient = artifactClient.default;

    const attemptConnection: SideChannelImpl["attemptConnection"] = (clientIdentifier, serverIdentifier) =>
        Effect.gen(function* () {
            const tempDirectory = yield* filesystem.makeTempDirectoryScoped();

            // Parse the client and server identifiers
            const clientUUID = yield* Schema.decode(Schema.UUID)(clientIdentifier);
            const serverUUID = yield* Schema.decode(Schema.UUID)(serverIdentifier);

            // Upload a connection request artifact with our location (ip address)
            const connectionRequestResourceIdentifier = `${serverUUID}_connection_request_${clientUUID}`;
            const connectionRequestFilePath = path.join(tempDirectory, connectionRequestResourceIdentifier);
            yield* filesystem.writeFileString(connectionRequestFilePath, "connection request from 1.1.1.1");
            yield* Effect.tryPromise(() =>
                defaultClient.uploadArtifact(
                    connectionRequestResourceIdentifier,
                    Array.of(connectionRequestResourceIdentifier),
                    tempDirectory,
                    { retentionDays: 1 }
                )
            );

            // Wait for a connection response artifact

            return {} as any;
        }).pipe(Effect.scoped);

    const processConnectionRequest: SideChannelImpl["processConnectionRequest"] = (
        clientIdentifier,
        serverIdentifier
    ) =>
        Effect.gen(function* () {
            const clientUUID = yield* Schema.decode(Schema.UUID)(clientIdentifier);
            const serverUUID = yield* Schema.decode(Schema.UUID)(serverIdentifier);
        });

    return SideChannel.of({
        attemptConnection,
        processConnectionRequest,
    });
});

/**
 * @since 1.0.0
 * @category Constructors
 */
export const makeManualSideChannel: Effect.Effect<SideChannelImpl, never, Path.Path | FileSystem.FileSystem> =
    Effect.gen(function* () {
        const path = yield* Path.Path;
        const filesystem = yield* FileSystem.FileSystem;

        return SideChannel.of({});
    });

/**
 * @since 1.0.0
 * @category Layers
 */
export const GithubActionsArtifactSideChannel: Layer.Layer<SideChannel, never, Path.Path | FileSystem.FileSystem> =
    Layer.effect(SideChannel, makeGithubActionsArtifactSideChannel);

/**
 * @since 1.0.0
 * @category Layers
 */
export const ManualSideChannel: Layer.Layer<SideChannel, never, Path.Path | FileSystem.FileSystem> = Layer.effect(
    SideChannel,
    makeManualSideChannel
);
