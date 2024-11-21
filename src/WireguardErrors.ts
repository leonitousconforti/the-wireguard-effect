/**
 * Wireguard errors
 *
 * @since 1.0.0
 */

import * as Data from "effect/Data";
import * as Function from "effect/Function";
import * as Schema from "effect/Schema";

/**
 * A wireguard userspace api Errno return message.
 *
 * @since 1.0.0
 * @category Errors
 */
export const SuccessErrno = Function.pipe(
    Schema.TemplateLiteral("errno=", Schema.Literal(0)),
    Schema.annotations({ identifier: "SuccessErrno", description: "A successful errno" }),
    Schema.brand("SuccessErrno")
);

/**
 * @since 1.0.0
 * @category Errors
 */
export type SuccessErrno = Schema.Schema.Type<typeof SuccessErrno>;

/**
 * @since 1.0.0
 * @category Errors
 */
export class WireguardError extends Data.TaggedError("WireguardError")<{ message: string }> {}
