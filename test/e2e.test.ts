import { describe, expect, it } from "@effect/vitest";

import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeHttp from "@effect/platform-node/NodeHttpClient";
import * as Config from "effect/Config";
import * as Console from "effect/Console";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Layer from "effect/Layer";

import * as WireguardConfig from "the-wireguard-effect/WireguardConfig";
import * as WireguardControl from "the-wireguard-effect/WireguardControl";
import * as WireguardServer from "the-wireguard-effect/WireguardServer";

const portConfig = Config.number("WIREGUARD_DEMO_PORT").pipe(Config.withDefault(42912));
const hostConfig = Config.string("WIREGUARD_DEMO_HOST").pipe(Config.withDefault("demo.wireguard.com"));
const hiddenPageUrlConfig = Config.string("HIDDEN_PAGE").pipe(Config.withDefault("http://192.168.4.1:80"));

const WireguardControlLive = Layer.sync(WireguardControl.WireguardControl, () =>
    WireguardControl.makeBundledWgQuickLayer({ sudo: process.platform !== "linux" })
);

describe("wireguard e2e test using demo.wireguard.com", () => {
    it.live(
        "Should be able to connect to the demo server",
        () =>
            Effect.gen(function* () {
                const host = yield* hostConfig;
                const port = yield* portConfig;
                const hiddenPageUrl = yield* hiddenPageUrlConfig;
                const control = yield* WireguardControl.WireguardControl;

                const config = yield* WireguardServer.requestWireguardDemoConfig({ host, port });
                yield* Console.log("Got config from remote demo server");

                const networkInterface = yield* config.upScoped();
                yield* Console.log("Interface is up");

                yield* Effect.sleep("10 seconds");
                const request = new WireguardConfig.WireguardGetConfigRequest({
                    wireguardInterface: networkInterface,
                    address: `${config.Address.address.ip}/${config.Address.mask}`,
                });
                const response = yield* Effect.request(request, control.getConfigRequestResolver);
                yield* Console.log("Got config from local request resolver");

                const peer = response.Peers.at(0);
                expect(peer?.rxBytes).toBeGreaterThan(0);
                expect(peer?.txBytes).toBeGreaterThan(0);
                expect(peer?.lastHandshakeTimeSeconds).toBeGreaterThan(0);
                yield* Console.log("Connected to peer demo server");

                yield* WireguardServer.requestGoogle;
                yield* Console.log("Connected to https://google.com (still have internet access)");

                const hiddenPage = yield* WireguardServer.requestHiddenPage(hiddenPageUrl);
                yield* Console.log("Connected to hidden page");
                expect(hiddenPage).toMatchSnapshot();
            })
                .pipe(Effect.scoped)
                .pipe(Effect.retry({ times: 3 }))
                .pipe(Effect.provide(NodeHttp.layer))
                .pipe(Effect.provide(NodeContext.layer))
                .pipe(Effect.provide(WireguardControlLive)),
        Function.pipe(2, Duration.minutes, Duration.toMillis)
    );
});
