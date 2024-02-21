import * as PlatformNode from "@effect/platform-node";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Wireguard from "../src/index.js";

const config = new Wireguard.WireguardInterface({
    ReplacePeers: false,
});

export const main: Effect.Effect<void, Wireguard.WireguardError | Cause.TimeoutException, never> = Effect.gen(
    function* (λ) {
        yield* λ(Wireguard.upScoped(config));
        const peer1Endpoint: string = config.Peers[0].Endpoint;
        yield* λ(Console.log(peer1Endpoint));
        yield* λ(Effect.sleep("10 seconds"));
    }
).pipe(Effect.scoped);

Effect.suspend(() => main).pipe(Effect.provide(PlatformNode.NodeContext.layer), PlatformNode.NodeRuntime.runMain);
