import * as Effect from "effect/Effect";

import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as NodeServices from "@effect/platform-node/NodeServices";

import * as GenerateExample from "../../examples/generate-lan-hub-and-spoke-access.js";

const wireguardNetworkCidr = "192.168.10.1/24" as const;
const lanNetworkCidr = "10.0.1.0/24" as const;
const serverAddress = "10.0.0.2:51820:41820" as const;

Effect.gen(function* () {
    const [configA, configB, configC, configD] = yield* GenerateExample.program(
        wireguardNetworkCidr,
        lanNetworkCidr,
        serverAddress
    );

    yield* configB.writeToFile("B-bob-wireguard.conf");
    yield* configA.writeToFile("A-alice-wireguard.conf");
    yield* configD!.writeToFile("D-dave-wireguard.conf");
    yield* configC!.writeToFile("C-charlie-wireguard.conf");
}).pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain);
