import * as crypto from "node:crypto";

import * as WireguardKey from "../WireguardKey.js";

/** @internal */
// export const generatePreshareKey = (): WireguardKey.WireguardKey => {
//     const key = crypto.generateKeySync("hmac", { length: 32 });
//     return WireguardKey.WireguardKey(key.export().subarray(12).toString("base64"));
// };

/** @internal */
export const generateKeyPair = (): { privateKey: WireguardKey.WireguardKey; publicKey: WireguardKey.WireguardKey } => {
    const keys = crypto.generateKeyPairSync("x25519", {
        publicKeyEncoding: { format: "der", type: "spki" },
        privateKeyEncoding: { format: "der", type: "pkcs8" },
    });
    return {
        publicKey: WireguardKey.WireguardKey(keys.publicKey.subarray(12).toString("base64")),
        privateKey: WireguardKey.WireguardKey(keys.privateKey.subarray(16).toString("base64")),
    };
};
