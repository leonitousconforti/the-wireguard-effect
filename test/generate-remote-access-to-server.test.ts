import { describe, expect, it } from "@effect/vitest";

import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as WireguardConfig from "the-wireguard-effect/WireguardConfig";
import * as GenerateExample from "../examples/generate-remote-access-to-server.js";

describe("wireguard generate remote access to server", () => {
    it.effect("Should generate configs", () =>
        Effect.gen(function* () {
            const configs = yield* GenerateExample.program();
            expect(configs).toHaveLength(2);

            const config0 = yield* Schema.encode(WireguardConfig.WireguardConfig)(configs[0]);
            const config1 = yield* Schema.encode(WireguardConfig.WireguardConfig)(configs[1]);

            const keyMatcher = expect.stringMatching(/^[\d+/A-Za-z]{42}[048AEIMQUYcgkosw]=$/);
            const peerEntryMatcher = { PublicKey: keyMatcher, PresharedKey: keyMatcher };

            expect(config0).toMatchSnapshot({ PrivateKey: keyMatcher, Peers: [peerEntryMatcher] });
            expect(config1).toMatchSnapshot({ PrivateKey: keyMatcher, Peers: [peerEntryMatcher] });
        })
    );
});
