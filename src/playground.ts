//     public static readonly FromBigint = (n: IPv4BigintBrand): Effect.Effect<IPv4, ParseResult.ParseError, never> => {
//         const padded = n.toString(16).replace(/:/g, "").padStart(8, "0");
//         const groups: Array<number> = [];
//         for (let i = 0; i < 8; i += 2) {
//             const h = padded.slice(i, i + 2);
//             groups.push(parseInt(h, 16));
//         }
//         return Schema.decode(IPv4)(groups.join("."));
//     };

//     /** @since 1.0.0 */
//     public get asBigint(): IPv4BigintBrand {
//         console.log("here");
//         const self = this;
//         console.log(self);
//         console.log(Schema.encodeSync(IPv4)(self));
//         return Function.pipe(
//             Schema.encodeSync(IPv4)(self),
//             String.split("."),
//             Array.map((s) => Number.parseInt(s, 10)),
//             Array.map((n) => n.toString(16)),
//             Array.map(String.padStart(2, "0")),
//             Array.join(""),
//             (hex) => BigInt(`0x${hex}`),
//             (bigint) => IPv4BigintBrand(bigint)
//         );
//     }
// }

// {
//     /** @since 1.0.0 */
//     public readonly family: "ipv6" = "ipv6" as const;

//     /** @since 1.0.0 */
//     public static readonly FromBigint = (n: IPv6BigintBrand): Effect.Effect<IPv6, ParseResult.ParseError, never> => {
//         const hex = n.toString(16).padStart(32, "0");
//         const groups = [];
//         for (let i = 0; i < 8; i++) {
//             groups.push(hex.slice(i * 4, (i + 1) * 4));
//         }
//         return Schema.decode(IPv6)(groups.join(":"));
//     };

//     /** @since 1.0.0 */
//     public get asBigint(): IPv6BigintBrand {
//         const self = Schema.encodeSync(IPv6)(this);

//         function paddedHex(octet: string): string {
//             return parseInt(octet, 16).toString(16).padStart(4, "0");
//         }

//         let groups: Array<string> = [];
//         const halves = self.split("::");

//         if (halves.length === 2) {
//             let first = halves[0].split(":");
//             let last = halves[1].split(":");

//             if (first.length === 1 && first[0] === "") {
//                 first = [];
//             }
//             if (last.length === 1 && last[0] === "") {
//                 last = [];
//             }

//             const remaining = 8 - (first.length + last.length);
//             if (!remaining) {
//                 throw new Error("Error parsing groups");
//             }

//             groups = groups.concat(first);
//             for (let i = 0; i < remaining; i++) {
//                 groups.push("0");
//             }
//             groups = groups.concat(last);
//         } else if (halves.length === 1) {
//             groups = self.split(":");
//         } else {
//             throw new Error("Too many :: groups found");
//         }

//         groups = groups.map((group: string) => parseInt(group, 16).toString(16));
//         if (groups.length !== 8) {
//             throw new Error("Invalid number of groups");
//         }

//         return IPv6BigintBrand(BigInt(`0x${groups.map(paddedHex).join("")}`));
//     }
// }

import { Schema } from "@effect/schema";
import * as assert from "node:assert";

const Circle = Schema.Struct({ radius: Schema.Number });
const Square = Schema.Struct({ sideLength: Schema.Number });
// const DiscriminatedShape = Schema.Union(
//     Circle.pipe(Schema.attachPropertySignature("kind", "circle")),
//     Square.pipe(Schema.attachPropertySignature("kind", "square"))
// );
const DiscriminatedShape = Schema.Union(
    Schema.Struct({ radius: Schema.Number, kind: Schema.Literal("circle") }),
    Schema.Struct({ sideLength: Schema.Number, kind: Schema.Literal("square") })
);

// decoding
assert.deepStrictEqual(Schema.decodeSync(DiscriminatedShape)({ radius: 10 }), {
    kind: "circle",
    radius: 10,
});

// encoding
assert.deepStrictEqual(
    Schema.encodeSync(DiscriminatedShape)({
        kind: "circle",
        radius: 10,
    }),
    { radius: 10 }
);
