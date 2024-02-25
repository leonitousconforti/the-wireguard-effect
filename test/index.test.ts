import * as Platform from "@effect/platform-node";
import * as Effect from "effect/Effect";

import * as Wireguard from "../src/index.js";

describe("Wireguard tests", () => {
    it("should", async () =>
        Effect.gen(function* (λ) {
            const [hubConfig, spokeConfigs] = Wireguard.WireguardInterfaceConfig.generateHubSpokeConfigs(
                "10.0.0.1:12345",
                ["10.0.0.2:23456", "10.0.0.3:4598"]
            );

            yield* λ(hubConfig.writeToFile("test/hub.conf"));
            for (const [index, spokeConfig] of spokeConfigs.entries()) {
                yield* λ(spokeConfig.writeToFile(`test/spoke${index}.conf`));
            }
        })
            .pipe(Effect.provide(Platform.NodeContext.layer))
            .pipe(Effect.runPromise));
});
