import { describe, expect, it } from "@effect/vitest";

import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeHttp from "@effect/platform-node/NodeHttpClient";
import * as Config from "effect/Config";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as WireguardControl from "the-wireguard-effect/WireguardControl";
import * as DemoUtils from "the-wireguard-effect/WireguardDemo";

const portConfig = Config.number("WIREGUARD_DEMO_PORT").pipe(Config.withDefault(42912));
const hostConfig = Config.string("WIREGUARD_DEMO_HOST").pipe(Config.withDefault("demo.wireguard.com"));
const hiddenPageUrlConfig = Config.string("HIDDEN_PAGE").pipe(Config.withDefault("http://192.168.4.1:80"));

describe("wireguard e2e test using demo.wireguard.com", () => {
    it.scopedLive(
        "Should be able to connect to the demo server",
        () =>
            Effect.gen(function* (λ) {
                const host = yield* λ(hostConfig);
                const port = yield* λ(portConfig);
                const hiddenPageUrl = yield* λ(hiddenPageUrlConfig);
                const config = yield* λ(DemoUtils.requestWireguardDemoConfig({ host, port }));
                yield* λ(config.upScoped());

                // TODO: fix this on self hosted test server
                if (host === "demo.wireguard.com") yield* λ(DemoUtils.requestGoogle);

                const hiddenPage = yield* λ(DemoUtils.requestHiddenPage(hiddenPageUrl));
                expect(hiddenPage).toMatchSnapshot();
            })
                .pipe(Effect.provide(NodeContext.layer))
                .pipe(Effect.provide(NodeHttp.layer))
                .pipe(Effect.provide(WireguardControl.BundledWgQuickLayer)),
        Duration.seconds(300).pipe(Duration.toMillis)
    );
});
