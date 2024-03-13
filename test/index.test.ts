import * as Platform from "@effect/platform-node";
import * as Effect from "effect/Effect";
import * as Tuple from "effect/Tuple";

import * as Wireguard from "../src/index.js";

describe("Wireguard tests", () => {
    it("should", async () =>
        Effect.gen(function* (λ) {
            const hub = Tuple.make("1.1.1.1:1" as const, "10.0.0.1" as const);
            const spoke1 = Tuple.make("2.2.2.2:2" as const, "10.0.0.2" as const);
            const spoke2 = Tuple.make("3.3.3.3:3" as const, "10.0.0.3" as const);

            const [hubConfig, spokeConfigs] = yield* λ(
                Wireguard.WireguardConfig.generateHubSpokeConfigs(hub, [spoke1, spoke2])
            );

            yield* λ(hubConfig.writeToFile("test/hub.conf"));
            for (const [index, spokeConfig] of spokeConfigs.entries()) {
                yield* λ(spokeConfig.writeToFile(`test/spoke${index}.conf`));
            }
        })
            .pipe(Effect.provide(Platform.NodeContext.layer))
            .pipe(Effect.runPromise));
});
