/**
 * @since 1.0.0
 */

import * as Schema from "@effect/schema/Schema";
import * as Function from "effect/Function";

import * as internal from "./internal/wireguardKey.js";

/**
 * A wireguard key, which is a 44 character base64 string.
 *
 * @see {@link generateKeyPair}
 *
 * @since 1.0.0
 * @category Datatypes
 * @see https://lists.zx2c4.com/pipermail/wireguard/2020-December/006222.html
 */
export const WireguardKey = Function.pipe(
    Schema.string,
    Schema.pattern(/^[\d+/A-Za-z]{42}[048AEIMQUYcgkosw]=$/),
    Schema.identifier("WireguardKey"),
    Schema.description("A wireguard key"),
    Schema.brand("WireguardKey"),
);

/** @since 1.0.0 */
export type WireguardKey = Schema.Schema.Type<typeof WireguardKey>;

/**
 * Generates a wireguard public private key pair.
 *
 * @example
 * import { generateKeyPair } from "the-wireguard-effect/WireguardKey";
 * const { privateKey, publicKey } = generateKeyPair();
 *
 * @since 1.0.0
 * @category Crypto
 */
export const generateKeyPair: {
    (): { privateKey: WireguardKey; publicKey: WireguardKey };
} = internal.generateKeyPair;
