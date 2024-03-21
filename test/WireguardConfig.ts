import { describe, it } from "vitest";

import * as PlatformNode from "@effect/platform-node";
import * as Schema from "@effect/schema/Schema";
import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";
import * as InternetSchemas from "the-wireguard-effect/InternetSchemas";
import * as WireguardConfig from "the-wireguard-effect/WireguardConfig";

describe("WireguardConfig", () => {
    it("should generate p2p configs", () =>
        Effect.gen(function* (λ) {
            const alice = "1.1.1.1:51820" as const;
            const bob = "2.2.2.2:51820" as const;
            const network = "192.168.0.1/24" as const;

            const cidrBlock = yield* λ(Schema.decode(InternetSchemas.CidrBlock)(network));
            const ips = yield* λ(cidrBlock.range.pipe(Stream.run(Sink.collectAllN(2))).pipe(Effect.map(Chunk.toArray)));

            const [aliceConfig, bobConfig] = yield* λ(
                WireguardConfig.WireguardConfig.generateP2PConfigs([alice, ips[0]], [bob, ips[1]]),
            );

            yield* λ(aliceConfig.writeToFile("alice.conf"));
            yield* λ(bobConfig.writeToFile("bob.conf"));
        })
            .pipe(Effect.provide(PlatformNode.NodeContext.layer))
            .pipe(PlatformNode.NodeRuntime.runMain));
});
