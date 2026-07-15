import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import * as Command from "effect/unstable/cli/Command";
import * as Flag from "effect/unstable/cli/Flag";

import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as NodeServices from "@effect/platform-node/NodeServices";
import * as SocketServerNode from "@effect/platform-node/NodeSocketServer";
import * as InternetSchemas from "effect-schemas/Internet";

import * as WireguardControl from "../src/WireguardControl.js";
import * as WireguardServer from "../src/WireguardServer.js";

const maxPeers = Flag.integer("maxPeers").pipe(
    Flag.withDefault(256),
    Flag.withDescription("The maximum number of peers allowed to be connected at one time")
);

const wireguardPort = Flag.integer("wireguardPort").pipe(
    Flag.withDefault(51820),
    Flag.withSchema(InternetSchemas.Port),
    Flag.withDescription("The port to listen on for wireguard connections")
);

const serverPort = Flag.integer("serverPort").pipe(
    Flag.withDefault(42912),
    Flag.withSchema(InternetSchemas.Port),
    Flag.withDescription("The port to listen on for connections")
);

const hiddenServerPort = Flag.integer("hiddenServerPort").pipe(
    Flag.withDefault(8080),
    Flag.withSchema(InternetSchemas.Port),
    Flag.withDescription("The port to listen on for hidden server connections")
);

const wireguardNetwork = Flag.string("wireguardNetwork").pipe(
    Flag.withDefault("192.168.4.1/24" as const),
    Flag.withSchema(Schema.String.pipe(Schema.decodeTo(InternetSchemas.CidrBlockFromString))),
    Flag.withDescription("The wireguard network cidr to use"),
    Flag.map(Schema.encodeSync(InternetSchemas.CidrBlockFromString))
);

const command = Command.make(
    "demoServer",
    { hiddenServerPort, maxPeers, serverPort, wireguardNetwork, wireguardPort },
    ({ maxPeers, serverPort, wireguardNetwork, wireguardPort }) =>
        WireguardServer.WireguardDemoServer({
            maxPeers,
            wireguardNetwork,
            serverEndpoint: { host: "localhost", natPort: wireguardPort, listenPort: wireguardPort },
        }).pipe(Effect.provide(SocketServerNode.layer({ port: serverPort })))
).pipe(Command.withDescription("Wireguard demo server implementing the same protocol as demo.wireguard.com"));

const WireguardControlLive = Layer.effect(
    WireguardControl.WireguardControl,
    WireguardControl.makeBundledWgQuickLayer({ sudo: true })
);

const AppLive = Layer.provideMerge(WireguardControlLive, NodeServices.layer);
Command.run(command, { version: "v0.0.1" }).pipe(Effect.scoped, Effect.provide(AppLive), NodeRuntime.runMain);
