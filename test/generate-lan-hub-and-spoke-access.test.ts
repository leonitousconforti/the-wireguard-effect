import { describe, expect, it } from "@effect/vitest";

import * as Schema from "@effect/schema/Schema";
import * as Effect from "effect/Effect";
import * as WireguardConfig from "the-wireguard-effect/WireguardConfig";
import * as GenerateExample from "../examples/generate-lan-hub-and-spoke-access.js";

describe("wireguard generate lan hub and spoke access", () => {
    it.effect("Should generate configs", () =>
        Effect.gen(function* () {
            const configs = yield* GenerateExample.program();
            expect(configs).toHaveLength(6);

            const config0 = yield* Schema.encode(WireguardConfig.WireguardConfig)(configs[0]);
            const config1 = yield* Schema.encode(WireguardConfig.WireguardConfig)(configs[1]);
            const config2 = yield* Schema.encode(WireguardConfig.WireguardConfig)(configs[2]!);
            const config3 = yield* Schema.encode(WireguardConfig.WireguardConfig)(configs[3]!);
            const config4 = yield* Schema.encode(WireguardConfig.WireguardConfig)(configs[4]!);
            const config5 = yield* Schema.encode(WireguardConfig.WireguardConfig)(configs[5]!);

            const keyMatcher = expect.stringMatching(/^[\d+/A-Za-z]{42}[048AEIMQUYcgkosw]=$/);
            const peerEntryMatcher = { PublicKey: keyMatcher, PresharedKey: keyMatcher };

            expect(config0).toMatchSnapshot({
                PrivateKey: keyMatcher,
                Peers: [peerEntryMatcher, peerEntryMatcher, peerEntryMatcher, peerEntryMatcher, peerEntryMatcher],
            });

            expect(config1).toMatchSnapshot({ PrivateKey: keyMatcher, Peers: [peerEntryMatcher] });
            expect(config2).toMatchSnapshot({ PrivateKey: keyMatcher, Peers: [peerEntryMatcher] });
            expect(config3).toMatchSnapshot({ PrivateKey: keyMatcher, Peers: [peerEntryMatcher] });
            expect(config4).toMatchSnapshot({ PrivateKey: keyMatcher, Peers: [peerEntryMatcher] });
            expect(config5).toMatchSnapshot({ PrivateKey: keyMatcher, Peers: [peerEntryMatcher] });
        })
    );
});
