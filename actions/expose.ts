import * as GithubArtifacts from "@actions/artifact";
import * as GithubCore from "@actions/core";
import * as Platform from "@effect/platform";
import * as PlatformNode from "@effect/platform-node";
import * as Schema from "@effect/schema/Schema";
import * as Cause from "effect/Cause";
import * as ConfigError from "effect/ConfigError";
import * as Console from "effect/Console";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as ReadonlyArray from "effect/ReadonlyArray";
import * as Schedule from "effect/Schedule";
import * as Tuple from "effect/Tuple";
import * as dgram from "node:dgram";
import * as stun from "stun";
import * as uuid from "uuid";
import * as Wireguard from "../src/index.js";
import * as helpers from "./helpers.js";

const processConnectionRequest = (
    connectionRequest: Readonly<GithubArtifacts.Artifact>
): Effect.Effect<
    void,
    Error | ConfigError.ConfigError | Cause.UnknownException | Platform.Error.PlatformError,
    Platform.FileSystem.FileSystem
> =>
    Effect.gen(function* (λ) {
        const service_identifier: number = yield* λ(helpers.SERVICE_IDENTIFIER);
        const client_identifier: string | undefined = connectionRequest.name.split("_")[2];

        // Check that client_identifier is a valid UUID
        if (!client_identifier || !uuid.validate(client_identifier)) {
            yield* λ(helpers.deleteArtifact(connectionRequest.name));
            return yield* λ(Effect.fail(new Error("Invalid client identifier in connection request artifact name")));
        }

        GithubCore.info(`Processing connection request from client ${client_identifier}`);
        const data = yield* λ(helpers.downloadSingleFileArtifact(connectionRequest.id, connectionRequest.name));
        yield* λ(helpers.deleteArtifact(connectionRequest.name));

        // Check that the connection request artifact contents are valid
        const [clientIp, natPort, hostPort] = data.split(":");
        if (!clientIp || !natPort || !hostPort) {
            return yield* λ(Effect.fail(new Error("Invalid connection request artifact contents")));
        }

        const stunSocket = dgram.createSocket("udp4");
        stunSocket.bind(0);
        const stunResponse = yield* λ(
            Effect.promise(() => stun.request("stun.l.google.com:19302", { socket: stunSocket }))
        );
        const mappedAddress = stunResponse.getAttribute(stun.constants.STUN_ATTR_XOR_MAPPED_ADDRESS).value;
        const myLocation = `${mappedAddress.address}:${mappedAddress.port}` as const;
        GithubCore.info(`Stun response received: ${JSON.stringify(myLocation)}`);
        yield* λ(
            Effect.loop(0, {
                step: (count) => count + 1,
                while: (count) => count < 5,
                body: () =>
                    Effect.sync(() => stunSocket.send(".", 0, 1, Number.parseInt(natPort), clientIp)).pipe(
                        Effect.andThen(Effect.sleep(1000))
                    ),
            })
        );

        const aliceData = Tuple.make(myLocation, "10.0.0.1");
        const bobData = Tuple.make(`${clientIp}:${Number.parseInt(natPort)}` as const, "10.0.0.2");
        const [aliceConfig, bobConfig] = yield* λ(Wireguard.WireguardConfig.generateP2PConfigs(aliceData, bobData));
        yield* λ(aliceConfig.up());
        const g = yield* λ(Schema.encode(Schema.parseJson(Wireguard.WireguardConfig))(bobConfig));
        yield* λ(helpers.uploadSingleFileArtifact(`${service_identifier}_connection-response_${client_identifier}`, g));
    })
        .pipe(Effect.catchAll(Console.log))
        .pipe(Effect.catchAllDefect(Console.log));

class NoStopRequest extends Data.TaggedError("NoStopRequest")<{ message: string }> {}
class HasStopRequest extends Data.TaggedError("HasStopRequest")<{ message: string }> {}

const program: Effect.Effect<
    void,
    ConfigError.ConfigError | Cause.UnknownException | HasStopRequest | NoStopRequest,
    Platform.FileSystem.FileSystem
> = Effect.gen(function* (λ) {
    const service_identifier: number = yield* λ(helpers.SERVICE_IDENTIFIER);
    const artifacts: ReadonlyArray<GithubArtifacts.Artifact> = yield* λ(helpers.listArtifacts);

    const [stopRequestName, isStopRequest] = helpers.stopArtifact(service_identifier);
    const [, isConnectionRequest] = helpers.connectionRequestArtifact(service_identifier);

    /**
     * The service should continue to listen for connection requests and host
     * the supplied service as long as there is not an artifact uploaded to the
     * workflow run with a name in the format of "service-identifier_stop" where
     * service_identifier is the UUID of the service to stop.
     */
    if (ReadonlyArray.some(artifacts, isStopRequest)) {
        yield* λ(helpers.deleteArtifact(stopRequestName));
        yield* λ(new HasStopRequest({ message: "Stop request received" }));
    }

    /**
     * Connection requests will show up as artifacts with a name in the format
     * "service-identifier_connection-request_client-identifier" where
     * service_identifier is the UUID of the service to connect to and
     * client_identifier is the UUID of the client making the request. We use a
     * client identifier on the connection requests to prevent github actions
     * from merge artifacts with duplicate names, which could happen as multiple
     * clients might try to connect to the same service. The contents of the
     * artifact will be a string in the format "client-ip:nat-port:host-port".
     */
    const connectionRequests = ReadonlyArray.filter(artifacts, isConnectionRequest);

    /**
     * Once we have a connection request, we will start blasting udp packets in
     * the direction of the client and upload a response artifact with the name
     * "service-identifier_connection-response_client-identifier" and the
     * contents of the artifact will be a connection string. The client will
     * then use the information in the response artifact to establish a
     * connection with the service.
     */
    yield* λ(
        Function.pipe(
            connectionRequests,
            ReadonlyArray.map(processConnectionRequest),
            ReadonlyArray.map(Effect.forkDaemon),
            Effect.all
        )
    );
    yield* λ(new NoStopRequest({ message: "No stop request received" }));
}).pipe(
    Effect.retry({
        schedule: Schedule.spaced("30 seconds"),
        until: (error) => error._tag === "HasStopRequest",
    })
);

/**
 * Processes connection requests every 30 seconds until there is a stop request
 * or we have a defect (unexpected error).
 */
Effect.suspend(() => program).pipe(Effect.provide(PlatformNode.NodeContext.layer), PlatformNode.NodeRuntime.runMain);
