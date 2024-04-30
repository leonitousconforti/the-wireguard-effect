import * as Command from "@effect/cli/Command";
import * as HelpDoc from "@effect/cli/HelpDoc";
import * as Options from "@effect/cli/Options";
import * as ValidationError from "@effect/cli/ValidationError";
import * as SocketServer from "@effect/experimental/SocketServer/Node";
import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeHttpServer from "@effect/platform-node/NodeHttpServer";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as HttpServer from "@effect/platform/HttpServer";
import * as Schema from "@effect/schema/Schema";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as http from "node:http";

import * as InternetSchemas from "../src/InternetSchemas.js";
import * as WireguardControl from "../src/WireguardControl.js";
import * as WireguardDemo from "../src/WireguardDemo.js";

const maxPeers = Options.integer("maxPeers")
    .pipe(Options.withDefault(256))
    .pipe(Options.withDescription("The maximum number of peers allowed to be connected at one time"));

const wireguardPort = Options.integer("wireguardPort")
    .pipe(Options.withDefault(51820))
    .pipe(Options.withSchema(InternetSchemas.Port))
    .pipe(Options.withDescription("The port to listen on for wireguard connections"));

const serverPort = Options.integer("serverPort")
    .pipe(Options.withDefault(42912))
    .pipe(Options.withSchema(InternetSchemas.Port))
    .pipe(Options.withDescription("The port to listen on for connections"));

const hiddenServerPort = Options.integer("hiddenServerPort")
    .pipe(Options.withDefault(8080))
    .pipe(Options.withSchema(InternetSchemas.Port))
    .pipe(Options.withDescription("The port to listen on for hidden server connections"));

const wireguardNetwork = Options.text("wireguardNetwork")
    .pipe(Options.withDefault("192.168.4.1/24"))
    .pipe(Options.withSchema(InternetSchemas.CidrBlockFromString))
    .pipe(Options.withDescription("The wireguard network cidr to use"))
    .pipe(
        Options.mapEffect((wireguardNetwork) =>
            Effect.gen(function* () {
                const networkAddress = yield* wireguardNetwork.networkAddress;
                const hiddenServerBigintAddress = networkAddress.asBigint + 1n;
                const hiddenServerAddress = yield* InternetSchemas.IPv4.FromBigint(hiddenServerBigintAddress);
                const hiddenServerString = yield* Schema.encode(InternetSchemas.AddressFromString)(hiddenServerAddress);
                const wireguardNetworkEncoded = yield* Schema.encode(InternetSchemas.CidrBlockFromString)(
                    wireguardNetwork
                );

                return {
                    wireguardNetwork: wireguardNetworkEncoded,
                    hiddenServerAddress: hiddenServerString,
                };
            }).pipe(Effect.mapError((parseError) => ValidationError.invalidValue(HelpDoc.p(parseError.message))))
        )
    );

const hiddenPageContent = `
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
`;

const command = Command.make(
    "demoServer",
    { hiddenServerPort, maxPeers, serverPort, wireguardNetwork, wireguardPort },
    ({ hiddenServerPort, maxPeers, serverPort, wireguardNetwork, wireguardPort }) =>
        WireguardDemo.WireguardDemoServer({
            maxPeers,
            wireguardPort,
            wireguardNetwork: wireguardNetwork.wireguardNetwork,
        })
            .pipe(Effect.provide(SocketServer.layer({ port: serverPort })))
            .pipe(Effect.andThen(HttpServer.server.serve(Effect.succeed(HttpServer.response.html(hiddenPageContent)))))
            .pipe(
                Effect.provide(
                    NodeHttpServer.server.layer(() => http.createServer(), {
                        port: hiddenServerPort,
                        host: wireguardNetwork.hiddenServerAddress,
                    })
                )
            )
);

const cli = Command.run(command, {
    version: "v0.0.1",
    name: "Wireguard demo server implementing the same protocol as demo.wireguard.com",
});

const wireguardControlLive = Layer.sync(WireguardControl.WireguardControl, () =>
    WireguardControl.makeBundledWgQuickLayer({ sudo: true })
);

const appLive = Layer.mergeAll(NodeContext.layer, wireguardControlLive);

Effect.suspend(() => cli(process.argv))
    .pipe(Effect.scoped)
    .pipe(Effect.provide(appLive))
    .pipe(NodeRuntime.runMain);
