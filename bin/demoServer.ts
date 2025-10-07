import * as Command from "@effect/cli/Command";
import * as Options from "@effect/cli/Options";
import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as SocketServerNode from "@effect/platform-node/NodeSocketServer";
import * as InternetSchemas from "effect-schemas/Internet";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";

import * as WireguardControl from "../src/WireguardControl.js";
import * as WireguardServer from "../src/WireguardServer.js";

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
    .pipe(Options.map(Schema.encodeSync(InternetSchemas.CidrBlockFromString)));

const command = Command.make(
    "demoServer",
    { hiddenServerPort, maxPeers, serverPort, wireguardNetwork, wireguardPort },
    ({ maxPeers, serverPort, wireguardNetwork, wireguardPort }) =>
        WireguardServer.WireguardDemoServer({
            maxPeers,
            wireguardNetwork,
            serverEndpoint: { host: "localhost", natPort: wireguardPort, listenPort: wireguardPort },
        }).pipe(Effect.provide(SocketServerNode.layer({ port: serverPort })))
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
