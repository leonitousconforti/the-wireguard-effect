import * as net from "node:net";

import * as Platform from "@effect/platform";
import * as PlatformNode from "@effect/platform-node";
import * as Socket from "@effect/platform/Socket";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

import * as InternetSchemas from "the-wireguard-effect/InternetSchemas";
import * as WireguardConfig from "the-wireguard-effect/WireguardConfig";
import * as WireguardError from "the-wireguard-effect/WireguardError";
import * as WireguardKey from "the-wireguard-effect/WireguardKey";
import * as WireguardPeer from "the-wireguard-effect/WireguardPeer";

const config = new WireguardConfig.WireguardConfig({
    Address: InternetSchemas.CidrBlock({ ipv4: Wireguard.IPv4("3.3.3.3"), mask: InternetSchemas.IPv4CidrMask(32) }),
    ListenPort: InternetSchemas.Port(51_820),
    PrivateKey: WireguardKey.WireguardKey(""),
    Peers: [
        new WireguardPeer.WireguardPeer({
            PublicKey: WireguardKey.WireguardKey(""),
            AllowedIPs: [],
            Endpoint: Wireguard.Endpoint({
                ip: Wireguard.IPv4("3.3.3.3"),
                natPort: Wireguard.Port(51_820),
                listenPort: Wireguard.Port(51_820),
            }),
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
            }),
    )
        .pipe(Effect.timeout("5 seconds"))
        .pipe(Effect.retry({ times: 3 }));

export const main: Effect.Effect<
    void,
    WireguardError.WireguardError | Cause.TimeoutException | Socket.SocketError,
    Platform.FileSystem.FileSystem | Platform.Path.Path
> = Effect.gen(function* (λ) {
    yield* λ(config.upScoped(undefined));
    const peer1Endpoint = config.Peers[0].Endpoint;
    yield* λ(Console.log(peer1Endpoint));
    yield* λ(ping(`${peer1Endpoint.ip}:${peer1Endpoint.natPort}`));
}).pipe(Effect.scoped);

Effect.suspend(() => main).pipe(Effect.provide(PlatformNode.NodeContext.layer), PlatformNode.NodeRuntime.runMain);
