import * as PlatformNode from "@effect/platform-node";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Tuple from "effect/Tuple";

import * as WireguardConfig from "the-wireguard-effect/WireguardConfig";
import * as WireguardErrors from "the-wireguard-effect/WireguardErrors";

const aliceSetupData = Tuple.make("10.0.1.1:51820" as const, "1.1.1.1:51280");
const bobSetupData = Tuple.make("10.0.2.1:51820" as const, "2.2.2.2:51280:41280");

const program: Effect.Effect<void, ParseResult.ParseError | WireguardErrors.WireguardError, never> = Effect.gen(
    function* (λ) {
        const [aliceConfig, bobConfig] = yield* λ(
            WireguardConfig.WireguardConfig.generateP2PConfigs({
                aliceData: aliceSetupData,
                bobData: bobSetupData,
            })
        );

        // Distribute these configs somehow
        yield* λ(Console.log(aliceConfig));
        yield* λ(Console.log(bobConfig));
    }
);

Effect.suspend(() => program).pipe(Effect.provide(PlatformNode.NodeContext.layer), PlatformNode.NodeRuntime.runMain);
