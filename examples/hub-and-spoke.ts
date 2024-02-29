import * as PlatformNode from "@effect/platform-node";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

import * as Wireguard from "../src/index.js";

// Alice will be the hub
const aliceEndpoint = "10.0.1.1:51820";

// Bob, Charlie, Dave, and Eve will be spokes
const bobEndpoint = "10.0.2.1:51820";
const charlieEndpoint = "10.0.3.1:51820";
const daveEndpoint = "10.0.4.1:51820";
const eveEndpoint = "10.0.5.1:51820";

const main: Effect.Effect<void, ParseResult.ParseError, never> = Effect.gen(function* (λ) {
    // Distribute these configs somehow
    const [hubConfig, spokeConfigs] = yield* λ(
        Wireguard.WireguardConfig.generateHubSpokeConfigs(aliceEndpoint, [
            bobEndpoint,
            charlieEndpoint,
            daveEndpoint,
            eveEndpoint,
        ])
    );

    yield* λ(Console.log(hubConfig));
    yield* λ(Console.log(spokeConfigs));
});

Effect.suspend(() => main).pipe(Effect.provide(PlatformNode.NodeContext.layer), PlatformNode.NodeRuntime.runMain);
