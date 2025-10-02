/**
 * This example demonstrates how to decode a single wireguard configuration. You
 * can run this example with:
 *
 * ```
 *  tsx examples/generate-single-node.ts
 * ```
 */

import * as Schema from "effect/Schema";

import * as WireguardConfig from "the-wireguard-effect/WireguardConfig";
import * as WireguardKey from "the-wireguard-effect/WireguardKey";

const { privateKey, publicKey: _publicKey } = WireguardKey.generateKeyPair();

Schema.decodeSync(WireguardConfig.WireguardConfig)({
    Address: "10.0.0.1/24" as const,
    ListenPort: 0,
    PrivateKey: privateKey,
    Peers: [
        /* ... */
    ],
});
