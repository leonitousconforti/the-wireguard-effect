import * as VariantSchema from "@effect/experimental/VariantSchema";

/** @internal */
export const WireguardPeerConfigVariantSchema = VariantSchema.make({
    variants: ["json", "uapi-json-get", "uapi-json-set"],
    defaultVariant: "json",
});
