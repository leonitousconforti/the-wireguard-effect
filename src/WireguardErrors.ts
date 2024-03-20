/**
 * @since 1.0.0
 */

import * as Schema from "@effect/schema/Schema";
import * as Data from "effect/Data";
import * as Function from "effect/Function";

/**
 * A wireguard userspace api Errno return message.
 *
 * @since 1.0.0
 * @category Errors
 */
export const SuccessErrno = Function.pipe(
    Schema.templateLiteral(Schema.literal("errno="), Schema.literal(0)),
    Schema.identifier("SuccessErrno"),
    Schema.description("A successful errno"),
    Schema.brand("SuccessErrno"),
);

/** @since 1.0.0 */
export type SuccessErrno = Schema.Schema.Type<typeof SuccessErrno>;

/**
 * @since 1.0.0
 * @category Errors
 */
export class WireguardError extends Data.TaggedError("WireguardError")<{ message: string }> {}
