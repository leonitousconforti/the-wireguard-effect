import { describe, expect, it } from "@effect/vitest";

import * as NodeContext from "@effect/platform-node/NodeContext";
import * as Effect from "effect/Effect";
import * as DemoUtils from "./WireguardDemo.js";

describe("wireguard e2e test using demo.wireguard.com", () => {
    it.effect(
        "Should be able to connect to the demo server",
        () =>
            Effect.gen(function* (λ) {
                const config = yield* λ(DemoUtils.createWireguardDemoConfig());
                yield* λ(config.upScoped({ how: "system-wireguard+system-wg-quick", sudo: true }));
                yield* λ(Effect.sleep("5 seconds"));
                const hiddenPage = yield* λ(DemoUtils.requestHiddenPage);
                expect(hiddenPage).toMatchSnapshot();
            })
                .pipe(Effect.scoped)
                .pipe(Effect.provide(NodeContext.layer)),
        { timeout: 30_000 }
    );
});
