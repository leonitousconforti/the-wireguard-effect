/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, expect, it } from "@effect/vitest";

import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as WireguardConfig from "the-wireguard-effect/WireguardConfig";
import * as GenerateExample from "../examples/generate-lan-hub-and-spoke-access.js";

describe("wireguard generate lan hub and spoke access", () => {
    it.effect("Should generate configs", () =>
        Effect.gen(function* () {
            const configs = yield* GenerateExample.program();
            expect(configs).toHaveLength(4);

            const config0 = yield* Schema.encode(WireguardConfig.WireguardConfig)(configs[0]);
            const config1 = yield* Schema.encode(WireguardConfig.WireguardConfig)(configs[1]);
            const config2 = yield* Schema.encode(WireguardConfig.WireguardConfig)(configs[2]!);
            const config3 = yield* Schema.encode(WireguardConfig.WireguardConfig)(configs[3]!);

            const keyMatcher = expect.stringMatching(/^[\d+/A-Za-z]{42}[048AEIMQUYcgkosw]=$/);
            const peerEntryMatcher = { PublicKey: keyMatcher, PresharedKey: keyMatcher };

            expect(config0).toMatchSnapshot({
                PrivateKey: keyMatcher,
                Peers: [peerEntryMatcher, peerEntryMatcher, peerEntryMatcher],
            });

            expect(config1).toMatchSnapshot({ PrivateKey: keyMatcher, Peers: [peerEntryMatcher] });
            expect(config2).toMatchSnapshot({ PrivateKey: keyMatcher, Peers: [peerEntryMatcher] });
            expect(config3).toMatchSnapshot({ PrivateKey: keyMatcher, Peers: [peerEntryMatcher] });
        })
    );
});
