import * as Platform from "@effect/platform";
import * as PlatformNode from "@effect/platform-node";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as net from "node:net";

import * as WireguardConfig from "the-wireguard-effect/WireguardConfig";
import * as WireguardError from "the-wireguard-effect/WireguardErrors";

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

export const program: Effect.Effect<
    void,
    WireguardError.WireguardError | Cause.TimeoutException | ParseResult.ParseError | Platform.Error.PlatformError,
    Platform.FileSystem.FileSystem | Platform.Path.Path
> = Effect.gen(function* (λ) {
    const config = yield* λ(
        Schema.decode(WireguardConfig.WireguardConfig)({
            Address: { ip: "3.3.3.3", mask: 32 },
            ListenPort: 51820,
            PrivateKey: "",
            Peers: [
                {
                    PublicKey: "",
                    AllowedIPs: [],
                    Endpoint: "2.2.2.2:51820" as const,
                },
            ],
        })
    );
    yield* λ(config.upScoped({ how: "system-wireguard+system-wg-quick" }));
    const peer1Endpoint = config.Peers[0].Endpoint;
    yield* λ(Console.log(peer1Endpoint));
    yield* λ(ping(`${peer1Endpoint.address.ip}:${peer1Endpoint.natPort}`));
}).pipe(Effect.scoped);

Effect.suspend(() => program).pipe(Effect.provide(PlatformNode.NodeContext.layer), PlatformNode.NodeRuntime.runMain);
