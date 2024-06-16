import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as Effect from "effect/Effect";

import * as GenerateExample from "../../examples/generate-remote-access-to-lan.js";

const lanNetworkCidr = "10.0.2.0/24" as const;
const serverAddress = "10.0.0.2:51820:41820" as const;
const wireguardNetworkCidr = "192.168.10.1/24" as const;

Effect.gen(function* () {
    const [configAlice, configBob] = yield* GenerateExample.program(
        wireguardNetworkCidr,
        lanNetworkCidr,
        serverAddress
    );
    yield* configBob.writeToFile("B-bob-wireguard.conf");
    yield* configAlice.writeToFile("A-alice-wireguard.conf");
})
    .pipe(Effect.provide(NodeContext.layer))
    .pipe(NodeRuntime.runMain);
