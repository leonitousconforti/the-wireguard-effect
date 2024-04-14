import * as PlatformNode from "@effect/platform-node";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as Tuple from "effect/Tuple";

import * as WireguardConfig from "the-wireguard-effect/WireguardConfig";
import * as WireguardErrors from "the-wireguard-effect/WireguardErrors";

// Alice will be the hub
const aliceSetupData = Tuple.make("10.0.1.1:51820" as const, "1.1.1.1");

// Bob, Charlie, Dave, and Eve will be spokes
const bobSetupData = Tuple.make("10.0.2.1:51820" as const, "2.2.2.2:51280");
const charlieSetupData = Tuple.make("10.0.3.1:51820" as const, "3.3.3.3:51280:41280");
const daveSetupData = Tuple.make("10.0.4.1:51820" as const, "4.4.4.4");
const eveSetupData = Tuple.make("10.0.5.1:51820" as const, "5.5.5.5");
const spokesSetupData = [bobSetupData, charlieSetupData, daveSetupData, eveSetupData] as const;

// Bob will trust charlie and dave
const bobTrustsCharlieAndDave = [bobSetupData, [charlieSetupData, daveSetupData]] as const;

// Eve will trust bob and charlie
const eveTrustsBobAndCharlie = [eveSetupData, [bobSetupData, charlieSetupData]] as const;

const program: Effect.Effect<void, ParseResult.ParseError | WireguardErrors.WireguardError, never> = Effect.gen(
    function* (λ) {
        const [hubConfig, spokeConfigs] = yield* λ(
            WireguardConfig.WireguardConfig.generate({
                hubData: aliceSetupData,
                spokeData: spokesSetupData,
                preshareKeys: "generate",
                trustMap: HashMap.make(bobTrustsCharlieAndDave, eveTrustsBobAndCharlie),
            })
        );

        // Distribute these configs somehow
        yield* λ(Console.log(hubConfig));
        yield* λ(Console.log(spokeConfigs));
    }
);

Effect.suspend(() => program).pipe(Effect.provide(PlatformNode.NodeContext.layer), PlatformNode.NodeRuntime.runMain);
