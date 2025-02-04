/**
 * Wireguard key schemas and helpers
 *
 * @since 1.0.0
 */

import * as Function from "effect/Function";
import * as Schema from "effect/Schema";
import * as crypto from "node:crypto";

/**
 * A wireguard key, which is a 44 character base64 string.
 *
 * @since 1.0.0
 * @category Schemas
 * @see {@link generateKeyPair}
 *
 * @see https://lists.zx2c4.com/pipermail/wireguard/2020-December/006222.html
 */
export const WireguardKey = Function.pipe(
    Schema.String,
    Schema.pattern(/^[\d+/A-Za-z]{42}[048AEIMQUYcgkosw]=$/),
    Schema.annotations({ identifier: "WireguardKey", description: "A wireguard key" }),
    Schema.brand("WireguardKey")
);

/**
 * @since 1.0.0
 * @category Unbranded Types
 */
export type WireguardKey = Schema.Schema.Type<typeof WireguardKey>;

/**
 * Generates a wireguard public private key pair.
 *
 * @since 1.0.0
 * @category Crypto
 * @example
 *     import { generateKeyPair } from "the-wireguard-effect/WireguardKey";
 *     const { privateKey, publicKey } = generateKeyPair();
 */
export const generateKeyPair = (): { readonly privateKey: WireguardKey; readonly publicKey: WireguardKey } => {
    const keys = crypto.generateKeyPairSync("x25519", {
        publicKeyEncoding: { format: "der", type: "spki" },
        privateKeyEncoding: { format: "der", type: "pkcs8" },
    });
    const publicKey = Schema.decodeSync(WireguardKey)(keys.publicKey.subarray(12).toString("base64"));
    const privateKey = Schema.decodeSync(WireguardKey)(keys.privateKey.subarray(16).toString("base64"));
    return { publicKey, privateKey };
};

/**
 * Generates a wireguard preshare key.
 *
 * @since 1.0.0
 * @category Crypto
 * @example
 *     import { generatePreshareKey } from "the-wireguard-effect/WireguardKey";
 *     const preshareKey = generatePreshareKey();
 */
export const generatePreshareKey = (): WireguardKey => {
    const key = crypto.generateKeySync("hmac", { length: 256 });
    return Schema.decodeSync(WireguardKey)(key.export().toString("base64"));
};
