import * as PlatformNode from "@effect/platform-node";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Tuple from "effect/Tuple";

import * as WireguardConfig from "the-wireguard-effect/WireguardConfig";

// Alice will be the hub
const aliceSetupData = Tuple.make("10.0.1.1:51820" as const, "");

// Bob, Charlie, Dave, and Eve will be spokes
const bobSetupData = Tuple.make("10.0.2.1:51820" as const, "");
const charlieSetupData = Tuple.make("10.0.3.1:51820" as const, "");
const daveSetupData = Tuple.make("10.0.4.1:51820" as const, "");
const eveSetupData = Tuple.make("10.0.5.1:51820" as const, "");

const program: Effect.Effect<void, ParseResult.ParseError, never> = Effect.gen(function* (λ) {
    // Distribute these configs somehow
    const [hubConfig, spokeConfigs] = yield* λ(
        WireguardConfig.WireguardConfig.generateHubSpokeConfigs(aliceSetupData, [
            bobSetupData,
            charlieSetupData,
            daveSetupData,
            eveSetupData,
        ]),
    );

    yield* λ(Console.log(hubConfig));
    yield* λ(Console.log(spokeConfigs));
});

Effect.suspend(() => program).pipe(Effect.provide(PlatformNode.NodeContext.layer), PlatformNode.NodeRuntime.runMain);
