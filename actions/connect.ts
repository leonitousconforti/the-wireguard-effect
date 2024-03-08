import * as GithubCore from "@actions/core";
import * as Platform from "@effect/platform";
import * as PlatformNode from "@effect/platform-node";
import * as Schema from "@effect/schema/Schema";
import * as Cause from "effect/Cause";
import * as ConfigError from "effect/ConfigError";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ReadonlyArray from "effect/ReadonlyArray";
import * as Schedule from "effect/Schedule";
import * as dgram from "node:dgram";
import * as stun from "stun";
import * as uuid from "uuid";
import * as Wireguard from "../src/index.js";
import * as helpers from "./helpers.js";

const client_identifier = uuid.v4();
let timer: NodeJS.Timeout | undefined;
const unbind =
    (stunSocket: dgram.Socket): (() => void) =>
    () =>
        stunSocket.close();
let b: () => void = () => {};

/**
 * Connection requests to a service will be made by uploading an artifact with a
 * name following the format
 * "service-identifier_connection-request_client-identifier" where
 * service-identifier is the uuid of the service to connect to and client
 * identifier is the uuid generated for this client.
 */
const uploadConnectionRequestArtifact: Effect.Effect<
    void,
    ConfigError.ConfigError | Platform.Error.PlatformError | Cause.UnknownException,
    Platform.FileSystem.FileSystem
> = Effect.gen(function* (λ) {
    const service_identifier: number = yield* λ(helpers.SERVICE_IDENTIFIER);
    const stunSocket: dgram.Socket = dgram.createSocket("udp4");
    stunSocket.bind(0);
    b = unbind(stunSocket);
    timer = setInterval(() => stunSocket.send(".", 0, 1, 80, "3.3.3.3"), 10_000);
    const stunResponse: stun.StunMessage = yield* λ(
        Effect.promise(() => stun.request("stun.l.google.com:19302", { socket: stunSocket }))
    );
    const mappedAddress = stunResponse.getAttribute(stun.constants.STUN_ATTR_XOR_MAPPED_ADDRESS).value;
    const myLocation: string = `${mappedAddress.address}:${mappedAddress.port}:${stunSocket.address().port}`;
    yield* λ(
        helpers.uploadSingleFileArtifact(`${service_identifier}_connection-request_${client_identifier}`, myLocation)
    );
});

/**
 * Once our connection request has been uploaded, we will wait for a response
 * artifact to be uploaded from the service. This should take no more than 30
 * seconds, as that is the interval at which the service node will process
 * connection requests. Once we have a connection response, we can execute the
 * connection string inside and that should be everything needed to connect to
 * the service.
 */
const waitForResponse = Effect.gen(function* (λ) {
    const artifacts = yield* λ(helpers.listArtifacts);
    const service_identifier: number = yield* λ(helpers.SERVICE_IDENTIFIER);

    const [, isConnectionResponse] = helpers.connectionResponseArtifact(service_identifier, client_identifier);

    const connectionResponses = ReadonlyArray.filter(artifacts, isConnectionResponse);
    if (connectionResponses.length >= 2) {
        yield* λ(
            Effect.die(
                new Error(
                    `Received more than one connection response artifact for client: ${client_identifier} from service: ${service_identifier}`
                )
            )
        );
    }

    // Even if there are more than two connection response artifacts, we will only take the first
    const connectionResponse = connectionResponses[0];
    if (connectionResponse) {
        clearInterval(timer);
        const data = yield* λ(helpers.downloadSingleFileArtifact(connectionResponse.id, connectionResponse.name));
        yield* λ(helpers.deleteArtifact(connectionResponse.name));
        GithubCore.info(data);
        const config = yield* λ(Schema.decode(Schema.parseJson(Wireguard.WireguardConfig))(data));
        GithubCore.setOutput("service-address", `10.0.0.2`);
        b();
        yield* λ(config.up());
        yield* λ(Console.log("Connection established"));
        return yield* λ(Effect.unit);
    }

    // Still waiting for a connection response
    yield* λ(Effect.fail(new Error("Still waiting for a connection response")));
})
    .pipe(Effect.tapError(Console.log))
    .pipe(Effect.tapDefect(Console.log));

Effect.suspend(() => uploadConnectionRequestArtifact).pipe(
    Effect.andThen(
        Effect.retry(waitForResponse, { times: 100, schedule: Schedule.forever.pipe(Schedule.addDelay(() => 30_000)) })
    ),
    Effect.provide(PlatformNode.NodeContext.layer),
    PlatformNode.NodeRuntime.runMain
);
