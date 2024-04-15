/**
 * Wireguard key schemas and helpers
 *
 * @since 1.0.0
 */

import * as Schema from "@effect/schema/Schema";
import * as Function from "effect/Function";

import * as internal from "./internal/wireguardKey.js";

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
    Schema.identifier("WireguardKey"),
    Schema.description("A wireguard key"),
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
export const generateKeyPair: {
    (): { readonly privateKey: WireguardKey; readonly publicKey: WireguardKey };
} = internal.generateKeyPair;

/**
 * Generates a wireguard preshare key.
 *
 * @since 1.0.0
 * @category Crypto
 * @example
 *     import { generatePreshareKey } from "the-wireguard-effect/WireguardKey";
 *     const { preshareKey } = generatePreshareKey();
 */
export const generatePreshareKey: {
    (): WireguardKey;
} = internal.generatePreshareKey;

export default WireguardKey;
