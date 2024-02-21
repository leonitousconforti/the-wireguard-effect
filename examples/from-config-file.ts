import * as Platform from "@effect/platform";
import * as PlatformNode from "@effect/platform-node";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Wireguard from "../src/index.js";

export const main: Effect.Effect<
    void,
    ParseResult.ParseError | Platform.Error.PlatformError | Wireguard.WireguardError | Cause.TimeoutException,
    Platform.FileSystem.FileSystem
> = Effect.gen(function* (λ) {
    const config = yield* λ(Wireguard.WireguardInterface.fromConfigFile("examples/wireguard-config.conf"));
    yield* λ(Wireguard.upScoped(config));
    const peer1Endpoint: string = config.Peers[0].Endpoint;
    yield* λ(Console.log(peer1Endpoint));
    yield* λ(Effect.sleep("10 seconds"));
}).pipe(Effect.scoped);

Effect.suspend(() => main).pipe(Effect.provide(PlatformNode.NodeContext.layer), PlatformNode.NodeRuntime.runMain);
