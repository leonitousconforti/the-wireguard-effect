import * as GithubArtifacts from "@actions/artifact";
import * as GithubCore from "@actions/core";
import * as Platform from "@effect/platform";
import * as PlatformNode from "@effect/platform-node";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Cause from "effect/Cause";
import * as Chunk from "effect/Chunk";
import * as ConfigError from "effect/ConfigError";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as ReadonlyArray from "effect/ReadonlyArray";
import * as Schedule from "effect/Schedule";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";
import * as Tuple from "effect/Tuple";
import * as dgram from "node:dgram";
import * as stun from "stun";
import * as uuid from "uuid";
import * as Wireguard from "../src/index.js";
import * as helpers from "./helpers.js";

const processConnectionRequest = (
    connectionRequest: Readonly<GithubArtifacts.Artifact>,
): Effect.Effect<
    void,
    Error | ConfigError.ConfigError | Cause.UnknownException | Platform.Error.PlatformError | ParseResult.ParseError,
    Platform.FileSystem.FileSystem | Platform.Path.Path
> =>
    Effect.gen(function* (λ) {
        const service_identifier: number = yield* λ(helpers.SERVICE_IDENTIFIER);
        const service_cidr: Wireguard.InternetSchemas.CidrBlock = yield* λ(helpers.SERVICE_CIDR);
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
            Effect.promise(() => stun.request("stun.l.google.com:19302", { socket: stunSocket })),
        );
        const mappedAddress = stunResponse.getAttribute(stun.constants.STUN_ATTR_XOR_MAPPED_ADDRESS).value;
        const myLocation = `${mappedAddress.address}:${mappedAddress.port}:${stunSocket.address().port}` as const;
        GithubCore.info(`Stun response received: ${JSON.stringify(myLocation)}`);
        yield* λ(
            Effect.loop(0, {
                step: (count) => count + 1,
                while: (count) => count < 5,
                body: () =>
                    Effect.sync(() => stunSocket.send(".", 0, 1, Number.parseInt(natPort), clientIp)).pipe(
                        Effect.andThen(Effect.sleep(1000)),
                    ),
            }),
        );

        const a = yield* λ(service_cidr.range.pipe(Stream.run(Sink.collectAllN(3)), Effect.map(Chunk.toArray)));
        const aliceData = Tuple.make(myLocation, a[1] as string);
        const bobData = Tuple.make(
            `${clientIp}:${Number.parseInt(natPort)}:${Number.parseInt(hostPort)}` as const,
            a[2] as string,
        );
        const [aliceConfig, bobConfig] = yield* λ(
            Wireguard.WireguardConfig.WireguardConfig.generateP2PConfigs(aliceData, bobData),
        );

        stunSocket.close();
        yield* λ(aliceConfig.up(undefined));
        const g = yield* λ(Schema.encode(Schema.parseJson(Wireguard.WireguardConfig.WireguardConfig))(bobConfig));
        yield* λ(helpers.uploadSingleFileArtifact(`${service_identifier}_connection-response_${client_identifier}`, g));
    })
        .pipe(Effect.catchAll(Console.log))
        .pipe(Effect.catchAllDefect(Console.log));

const program: Effect.Effect<
    void,
    ConfigError.ConfigError | Cause.UnknownException,
    Platform.FileSystem.FileSystem | Platform.Path.Path
> = Effect.gen(function* (λ) {
    const service_identifier: number = yield* λ(helpers.SERVICE_IDENTIFIER);
    const artifacts: ReadonlyArray<GithubArtifacts.Artifact> = yield* λ(helpers.listArtifacts);

    const [stopRequestName, isStopRequest] = helpers.stopArtifact(service_identifier);
    const [, isConnectionRequest] = helpers.connectionRequestArtifact(service_identifier);

    if (ReadonlyArray.some(artifacts, isStopRequest)) {
        yield* λ(helpers.deleteArtifact(stopRequestName));
        return true;
    }

    const connectionRequests = ReadonlyArray.filter(artifacts, isConnectionRequest);
    yield* λ(
        Function.pipe(
            connectionRequests,
            ReadonlyArray.map(processConnectionRequest),
            ReadonlyArray.map(Effect.forkDaemon),
            Effect.all,
        ),
    );

    return false;
}).pipe(
    Effect.repeat({
        until: Boolean,
        schedule: Schedule.spaced("30 seconds"),
    }),
);

/**
 * Processes connection requests every 30 seconds until there is a stop request
 * or we have a defect (unexpected error).
 */
Effect.suspend(() => program).pipe(Effect.provide(PlatformNode.NodeContext.layer), PlatformNode.NodeRuntime.runMain);
