import { describe, expect, it } from "@effect/vitest";

import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeHttp from "@effect/platform-node/NodeHttpClient";
import * as Config from "effect/Config";
import * as Console from "effect/Console";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Layer from "effect/Layer";

import * as WireguardControl from "the-wireguard-effect/WireguardControl";
import * as WireguardServer from "the-wireguard-effect/WireguardServer";

const portConfig = Config.number("WIREGUARD_DEMO_PORT").pipe(Config.withDefault(42912));
const hostConfig = Config.string("WIREGUARD_DEMO_HOST").pipe(Config.withDefault("demo.wireguard.com"));
const hiddenPageUrlConfig = Config.string("HIDDEN_PAGE").pipe(Config.withDefault("http://192.168.4.1:80"));

const WireguardControlLive = Layer.sync(WireguardControl.WireguardControl, () =>
    WireguardControl.makeBundledWgQuickLayer({ sudo: process.platform !== "linux" })
);

describe("wireguard e2e test using demo.wireguard.com", () => {
    it.effect(
        "Should be able to connect to the demo server",
        () =>
            Effect.gen(function* (λ) {
                const host = yield* λ(hostConfig);
                const port = yield* λ(portConfig);
                const hiddenPageUrl = yield* λ(hiddenPageUrlConfig);
                const config = yield* λ(WireguardServer.requestWireguardDemoConfig({ host, port }));
                yield* λ(config.upScoped());
                yield* Console.log("Interface is up");

                // FIXME: fix this on self hosted test server
                // if (host === "demo.wireguard.com") yield* λ(WireguardServer.requestGoogle);
                // yield* Console.log("Connected to https://google.com");

                const hiddenPage = yield* λ(WireguardServer.requestHiddenPage(hiddenPageUrl));
                yield* Console.log("Connected to hidden page");
                expect(hiddenPage).toMatchSnapshot();
            })
                .pipe(Effect.scoped)
                .pipe(Effect.provide(NodeHttp.layer))
                .pipe(Effect.provide(NodeContext.layer))
                .pipe(Effect.provide(WireguardControlLive)),
        {
            retry: 3,
            timeout: Function.pipe(Duration.seconds(120), Duration.toMillis),
        }
    );
});
