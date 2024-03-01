import * as net from "node:net";

import * as Platform from "@effect/platform";
import * as PlatformNode from "@effect/platform-node";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

import * as Wireguard from "../src/index.js";

const config = new Wireguard.WireguardConfig({
    Address: "3.3.3.3",
    ListenPort: 51_820,
    ReplacePeers: false,
    PrivateKey: "",
    Peers: [
        new Wireguard.WireguardPeer({
            PublicKey: "public-key",
            AllowedIPs: [],
            Endpoint: { ip: "3.3.3.3", port: 51_820 },
            ReplaceAllowedIPs: true,
        }),
    ],
});

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
    Wireguard.WireguardError | Cause.TimeoutException,
    Platform.FileSystem.FileSystem
> = Effect.gen(function* (λ) {
    yield* λ(config.upScoped());
    const peer1Endpoint = config.Peers[0].Endpoint;
    yield* λ(Console.log(peer1Endpoint));
    yield* λ(ping(`${peer1Endpoint.ip}:${peer1Endpoint.port}`));
}).pipe(Effect.scoped);

Effect.suspend(() => main).pipe(Effect.provide(PlatformNode.NodeContext.layer), PlatformNode.NodeRuntime.runMain);
