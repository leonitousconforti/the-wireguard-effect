// On your digital ocean test server:
// sudo nohup ./the-wireguard-effect-ci.sh &
// sudo nohup python3 -m http.server 8080 --bind 192.168.4.1 &

import { describe, expect, it } from "@effect/vitest";

import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeHttp from "@effect/platform-node/NodeHttpClient";
import * as Config from "effect/Config";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as DemoUtils from "the-wireguard-effect/WireguardDemo";

/** E2E test helper */
const helper = Effect.gen(function* (λ) {
    const port = yield* λ(Config.number("WIREGUARD_DEMO_PORT").pipe(Config.withDefault(42912)));
    const host = yield* λ(Config.string("WIREGUARD_DEMO_HOST").pipe(Config.withDefault("demo.wireguard.com")));
    const hiddenPageUrl = yield* λ(Config.string("HIDDEN_PAGE").pipe(Config.withDefault("http://192.168.4.1:80")));
    const config = yield* λ(DemoUtils.requestWireguardDemoConfig({ host, port }));
    yield* λ(config.upScoped());
    // TODO: fix this on self hosted test server
    if (host === "demo.wireguard.com") {
        yield* λ(DemoUtils.requestGoogle);
    }
    const hiddenPage = yield* λ(DemoUtils.requestHiddenPage(hiddenPageUrl));
    expect(hiddenPage).toMatchSnapshot();
})
    .pipe(Effect.provide(NodeContext.layer))
    .pipe(Effect.provide(NodeHttp.layer));

/** E2E test timeout */
const timeout = Duration.seconds(60).pipe(Duration.toMillis);

describe("wireguard e2e test using demo.wireguard.com", () => {
    it.scopedLive(
        "Should be able to connect to the demo server using system-wireguard+system-wg-quick",
        () => helper("system-wireguard+system-wg-quick"),
        timeout
    );

    // it.scopedLive(
    //     "Should be able to connect to the demo server using system-wireguard+bundled-wg-quick",
    //     () => helper("system-wireguard+bundled-wg-quick"),
    //     timeout
    // );

    // it.scopedLive(
    //     "Should be able to connect to the demo server using system-wireguard-go+system-wg-quick",
    //     () => helper("system-wireguard-go+system-wg-quick"),
    //     timeout
    // );

    // it.scopedLive(
    //     "Should be able to connect to the demo server using bundled-wireguard-go+system-wg-quick",
    //     () => helper("bundled-wireguard-go+system-wg-quick"),
    //     timeout
    // );

    // it.scopedLive(
    //     "Should be able to connect to the demo server using system-wireguard-go+bundled-wg-quick",
    //     () => helper("system-wireguard-go+bundled-wg-quick"),
    //     timeout
    // );

    // it.scopedLive(
    //     "Should be able to connect to the demo server using bundled-wireguard-go+bundled-wg-quick",
    //     () => helper("bundled-wireguard-go+bundled-wg-quick"),
    //     timeout
    // );
});
