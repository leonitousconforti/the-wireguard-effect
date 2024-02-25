import * as PlatformNode from "@effect/platform-node";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

import * as Wireguard from "../src/index.js";

const aliceEndpoint = "10.0.1.1:51820";
const bobEndpoint = "10.0.2.1:51820";

const main: Effect.Effect<void, ParseResult.ParseError, never> = Effect.gen(function* (λ) {
    // Distribute these configs somehow
    const [aliceConfig, bobConfig] = yield* λ(
        Wireguard.WireguardInterfaceConfig.generateP2PConfigs(aliceEndpoint, bobEndpoint)
    );

    yield* λ(Console.log(aliceConfig));
    yield* λ(Console.log(bobConfig));
});

Effect.suspend(() => main).pipe(Effect.provide(PlatformNode.NodeContext.layer), PlatformNode.NodeRuntime.runMain);
