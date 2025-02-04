import * as VariantSchema from "@effect/experimental/VariantSchema";

/** @internal */
export const WireguardConfigVariantSchema = VariantSchema.make({
    variants: ["json", "uapi-json-set", "uapi-json-get"],
    defaultVariant: "json",
});
