import * as Effect from "effect/Effect";

import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as NodeServices from "@effect/platform-node/NodeServices";

import * as GenerateExample from "../../examples/generate-server-hub-and-spoke-access.js";

const serverAddress = "10.0.0.2:51820:51820" as const;
const wireguardNetworkCidr = "192.168.10.1/24" as const;

Effect.gen(function* () {
    const [configAlice, configBob, configCharlie, configDave] = yield* GenerateExample.program(
        wireguardNetworkCidr,
        serverAddress
    );
    yield* configBob.writeToFile("B-bob-wireguard.conf");
    yield* configDave!.writeToFile("D-dave-wireguard.conf");
    yield* configAlice.writeToFile("A-alice-wireguard.conf");
    yield* configCharlie!.writeToFile("C-charlie-wireguard.conf");
}).pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain);
