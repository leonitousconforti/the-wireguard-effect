import { expect, it } from "@effect/vitest";

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

const testContext = Layer.mergeAll(NodeHttp.layer, NodeContext.layer, WireguardControlLive);

it.live(
    "wireguard e2e test using demo.wireguard.com",
    () =>
        Effect.gen(function* () {
            const host = yield* hostConfig;
            const port = yield* portConfig;
            const hiddenPageUrl = yield* hiddenPageUrlConfig;

            const config = yield* WireguardServer.requestWireguardDemoConfig({ host, port });
            yield* Console.log("Got config from remote demo server");

            const networkInterface = yield* config.upScoped();
            yield* Console.log("Interface is up");

            yield* Effect.sleep("10 seconds");
            const response = yield* networkInterface.getConfig(`${config.Address.address.ip}/${config.Address.mask}`);
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
            expect(hiddenPage).toMatchInlineSnapshot(`
"<title>WireGuard Demo Configuration: Success!</title>
<body bgcolor="#444444">
<script src="snowstorm.js"></script>
<script src="trail.js"></script>
<center>
<blink>
<marquee width="100%" behavior="alternate" direction="right" scrollamount="10">
<marquee height="100%" behavior="alternate" direction="down">
<marquee width="100%" bgcolor="#33aadd" direction="right" behavior="alternate"><font face="comic sans ms" size="7" style="font-size: 3vw" color="#ddaa33">Congrats! You've successfully configured WireGuard!</font><br><marquee scrollamount="30"><img src="emblem.svg" width="20%"></marquee><br><marquee direction="left" scrollamount="40" behavior="alternate"><script>document.write('<iframe frameborder="0" height="80%" width="70%" src="/?' + (((document.location.search.substring(1)|0) + 1) % 4) + '"></iframe>');</script></marquee><br><br></marquee>
</marquee>
</marquee>
</blink>
</center>
</body>
"
`);
        })
            .pipe(Effect.scoped)
            .pipe(Effect.provide(testContext)),
    Function.pipe(3.5, Duration.minutes, Duration.toMillis)
);
