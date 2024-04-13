import { describe, expect, it } from "@effect/vitest";

import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeHttp from "@effect/platform-node/NodeHttpClient";
import * as Effect from "effect/Effect";
import * as DemoUtils from "./WireguardDemo.js";

describe("wireguard e2e test using demo.wireguard.com", () => {
    it.scopedLive(
        "Should be able to connect to the demo server",
        () =>
            Effect.gen(function* (λ) {
                const config = yield* λ(DemoUtils.createWireguardDemoConfig());
                yield* λ(config.writeToFile("./wg0.conf"));
                yield* λ(config.upScoped({ how: "system-wireguard+system-wg-quick", sudo: true }));

                // FIXME: how can we get rid of this?
                yield* λ(Effect.sleep("5 seconds"));

                yield* λ(DemoUtils.requestGoogle);
                const hiddenPage = yield* λ(DemoUtils.requestHiddenPage);
                expect(hiddenPage).toMatchSnapshot();
            })
                .pipe(Effect.provide(NodeContext.layer))
                .pipe(Effect.provide(NodeHttp.layer)),
        30_000
    );
});
