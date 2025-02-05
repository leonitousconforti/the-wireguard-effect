import * as VariantSchema from "@effect/experimental/VariantSchema";

/**
 * We use a variant schema for the WireguardConfig schema to allow for different
 * representations of the same data. The `json` variant is the default
 * representation of the data, while the `uapi` variant is used for the
 * userspace API representation. The Uapi variant includes extra fields on the
 * peers like `rx_bytes` and `tx_bytes` which can only be decoded, not encoded.
 * We do not have an `ini` variant, because it is modeled as a transformation of
 * the `json` variant since it has the same fields.
 *
 * @internal
 */
export const WireguardConfigVariantSchema = VariantSchema.make({
    variants: ["json", "uapi"],
    defaultVariant: "json",
});
