import * as VariantSchema from "@effect/experimental/VariantSchema";

/** @internal */
export const WireguardConfigVariantSchema = VariantSchema.make({
    variants: ["json", "uapi"],
    defaultVariant: "json",
});
