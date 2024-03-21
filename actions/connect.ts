import * as GithubArtifacts from "@actions/artifact";
import * as GithubCore from "@actions/core";
import * as Platform from "@effect/platform";
import * as PlatformNode from "@effect/platform-node";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Cause from "effect/Cause";
import * as ConfigError from "effect/ConfigError";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ReadonlyArray from "effect/ReadonlyArray";
import * as dgram from "node:dgram";
import * as stun from "stun";
import * as uuid from "uuid";

import * as Wireguard from "../src/index.js";
import * as helpers from "./helpers.js";

const client_identifier = uuid.v4();

/**
 * Continuously fetches the connection response artifact for the client until
 * the server has uploaded one.
 */
const getConnectionResponse: Effect.Effect<
    GithubArtifacts.Artifact,
    Cause.UnknownException | ConfigError.ConfigError,
    never
> = Effect.gen(function* (λ) {
    const artifacts = yield* λ(helpers.listArtifacts);
    const service_identifier: number = yield* λ(helpers.SERVICE_IDENTIFIER);
    const [, isConnectionResponse] = helpers.connectionResponseArtifact(service_identifier, client_identifier);
    const connectionResponses = ReadonlyArray.filter(artifacts, isConnectionResponse);

    if (connectionResponses.length >= 2) {
        yield* λ(
            Effect.die(
                new Error(
                    `Received more than one connection response artifact for client: ${client_identifier} from service: ${service_identifier}`,
                ),
            ),
        );
    }
    if (!connectionResponses[0]) yield* λ(Effect.sleep("20 seconds"));
    return connectionResponses[0];
}).pipe(Effect.repeat({ until: (artifact): artifact is GithubArtifacts.Artifact => artifact !== undefined }));

const program: Effect.Effect<
    void,
    ConfigError.ConfigError | Platform.Error.PlatformError | Cause.UnknownException | Error | ParseResult.ParseError,
    Platform.FileSystem.FileSystem | Platform.Path.Path
> = Effect.gen(function* (λ) {
    const service_identifier: number = yield* λ(helpers.SERVICE_IDENTIFIER);

    // We need to know our public ip and port that wireguard will be listening on,
    // we use stun to get this information.
    const stunSocket: dgram.Socket = dgram.createSocket("udp4");
    stunSocket.bind(0);
    const stunResponse: stun.StunMessage = yield* λ(
        Effect.promise(() => stun.request("stun.l.google.com:19302", { socket: stunSocket })),
    );
    const mappedAddress = stunResponse.getAttribute(stun.constants.STUN_ATTR_XOR_MAPPED_ADDRESS).value;
    const myLocation = `${mappedAddress.address}:${mappedAddress.port}:${stunSocket.address().port}` as const;

    // Github actions runners are behind stateful NATs, sending a packet into
    // the void at least every 30 seconds should ensure that the NAT device keeps
    // the port assignment.
    const timer = setInterval(() => stunSocket.send(" ", 0, 1, 80, "3.3.3.3"), 10_000);

    // Upload the connection request artifact
    yield* λ(
        helpers.uploadSingleFileArtifact(`${service_identifier}_connection-request_${client_identifier}`, myLocation),
    );

    // Wait for the service to send a connection response artifact
    const connectionResponse = yield* λ(getConnectionResponse);

    // Process the connection response artifact
    const data = yield* λ(helpers.downloadSingleFileArtifact(connectionResponse.id, connectionResponse.name));
    yield* λ(helpers.deleteArtifact(connectionResponse.name));
    GithubCore.info(data);
    const config = yield* λ(Schema.decode(Schema.parseJson(Wireguard.WireguardConfig.WireguardConfig))(data));
    GithubCore.setOutput("service-address", config.Address.networkAddress);

    // Stop the stun keepalive and close the socket so that wireguard can bind
    // to that port now. It needs to be the exact same port as the one we used
    // for stun otherwise the NAT device might assign a different port.
    clearInterval(timer);
    stunSocket.close();

    yield* λ(config.up(undefined));
    yield* λ(Console.log("Connection established"));
})
    .pipe(Effect.tapError(Console.log))
    .pipe(Effect.tapDefect(Console.log));

Effect.suspend(() => program).pipe(Effect.provide(PlatformNode.NodeContext.layer), PlatformNode.NodeRuntime.runMain);
