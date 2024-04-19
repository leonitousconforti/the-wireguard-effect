import * as Platform from "@effect/platform";
import * as PlatformNode from "@effect/platform-node";
import * as Socket from "@effect/platform/Socket";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

import * as WireguardConfig from "the-wireguard-effect/WireguardConfig";
import * as WireguardControl from "the-wireguard-effect/WireguardControl";
import * as WireguardError from "the-wireguard-effect/WireguardErrors";

export const program: Effect.Effect<
    void,
    | Socket.SocketError
    | Cause.UnknownException
    | ParseResult.ParseError
    | Platform.Error.PlatformError
    | WireguardError.WireguardError,
    Platform.FileSystem.FileSystem | Platform.Path.Path
> = Effect.gen(function* (λ) {
    const config = yield* λ(
        Schema.decode(WireguardConfig.WireguardConfig)({
            Address: "3.3.3.3/24",
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
    yield* λ(config.upScoped());
    const peer1Endpoint = config.Peers[0].Endpoint;
    yield* λ(Console.log(peer1Endpoint));
})
    .pipe(Effect.scoped)
    .pipe(Effect.provide(WireguardControl.WgQuickLayer));

Effect.suspend(() => program).pipe(Effect.provide(PlatformNode.NodeContext.layer), PlatformNode.NodeRuntime.runMain);
