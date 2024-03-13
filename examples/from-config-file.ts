import * as net from "node:net";

import * as Socket from "@effect/experimental/Socket";
import * as Platform from "@effect/platform";
import * as PlatformNode from "@effect/platform-node";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

import * as Wireguard from "../src/index.js";

const ping = (endpoint: string): Effect.Effect<void, Cause.TimeoutException, never> =>
    Effect.promise(
        () =>
            new Promise<net.Socket>((resolve, reject) => {
                const socket: net.Socket = net.createConnection(endpoint);
                socket.on("connect", () => resolve(socket));
                socket.on("error", (error) => reject(error));
            })
    )
        .pipe(Effect.timeout("5 seconds"))
        .pipe(Effect.retry({ times: 3 }));

export const main: Effect.Effect<
    void,
    | ParseResult.ParseError
    | Platform.Error.PlatformError
    | Wireguard.WireguardError
    | Cause.TimeoutException
    | Socket.SocketError,
    Platform.FileSystem.FileSystem | Platform.Path.Path
> = Effect.gen(function* (λ) {
    const config = yield* λ(Wireguard.WireguardConfig.fromConfigFile("examples/wireguard-config.conf"));
    yield* λ(config.upScoped());
    const peer1Endpoint = config.Peers[0].Endpoint;
    yield* λ(Console.log(peer1Endpoint));
    yield* λ(ping(`${peer1Endpoint.ip}:${peer1Endpoint.natPort}`));
}).pipe(Effect.scoped);

Effect.suspend(() => main).pipe(Effect.provide(PlatformNode.NodeContext.layer), PlatformNode.NodeRuntime.runMain);
