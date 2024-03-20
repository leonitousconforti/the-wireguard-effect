import { assert, describe, it } from "vitest";

import * as Schema from "@effect/schema/Schema";
import * as Effect from "effect/Effect";
import * as InternetSchemas from "the-wireguard-effect/InternetSchemas";

describe("InternetSchemas", () => {
    it("should parse ports", () => {
        InternetSchemas.Port(80);
        assert.throws(() => InternetSchemas.Port(65536));
    });

    it("should parse ipv4", () => {
        InternetSchemas.IPv4("1.1.1.1");
        assert.throws(() => InternetSchemas.IPv4("0.0.a.0"));
    });

    it("should parse ipv6", () => {
        InternetSchemas.IPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334");
        assert.throws(() => InternetSchemas.IPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334:"));
    });

    it("should parse addresses", () => {
        InternetSchemas.Address("1.1.1.1");
        InternetSchemas.Address("2001:0db8:85a3:0000:0000:8a2e:0370:7334");
        assert.throws(() => InternetSchemas.Address("0.0.a.0"));
        assert.throws(() => InternetSchemas.Address("2001:0db8:85a3:0000:0000:8a2e:0370:7334:"));
    });

    it("should convert address to bigint and back", () =>
        Effect.gen(function* (λ) {
            // ipv4
            const address = yield* λ(Schema.decode(InternetSchemas.Address)("1.1.1.1"));
            const bigint = yield* λ(Schema.decode(InternetSchemas.BigintAddress)(address));
            assert.strictEqual(bigint.family, "ipv4");
            assert.strictEqual(bigint.value, 16843009n);
            const address2 = yield* λ(Schema.encode(InternetSchemas.BigintAddress)(bigint));
            assert.strictEqual(address2, "1.1.1.1");

            // ipv6
            const address3 = yield* λ(Schema.decode(InternetSchemas.Address)("2001:db8:85a3::8a2e:370:7334"));
            const bigint2 = yield* λ(Schema.decode(InternetSchemas.BigintAddress)(address3));
            assert.strictEqual(bigint2.family, "ipv6");
            assert.strictEqual(bigint2.value, 42540766452641154071740215577757643572n);
            const address4 = yield* λ(Schema.encode(InternetSchemas.BigintAddress)(bigint2));
            assert.strictEqual(address4, "2001:0db8:85a3:0000:0000:8a2e:0370:7334");
        }).pipe(Effect.runSync));

    it("should parse ipv4 cidr masks", () => {
        InternetSchemas.IPv4CidrMask(0);
        InternetSchemas.IPv4CidrMask(1);
        InternetSchemas.IPv4CidrMask(32);
        assert.throws(() => InternetSchemas.IPv4CidrMask(33));
    });

    it("should parse ipv6 cidr masks", () => {
        InternetSchemas.IPv6CidrMask(0);
        InternetSchemas.IPv6CidrMask(1);
        InternetSchemas.IPv6CidrMask(128);
        assert.throws(() => InternetSchemas.IPv6CidrMask(129));
    });

    it("should parse cidr blocks", () =>
        Effect.gen(function* (λ) {
            // ipv4
            const block = yield* λ(Schema.decode(InternetSchemas.CidrBlock)({ ipv4: "1.1.1.1", mask: 24 }));
            assert.strictEqual(block.mask, 24);
            assert.strictEqual(block.total, 256n);
            assert.strictEqual(block.ip, "1.1.1.1");
            assert.strictEqual(block.family, "ipv4");
            assert.strictEqual(block.networkAddress, "1.1.1.0");
            assert.strictEqual(block.broadcastAddress, "1.1.1.255");

            // ipv6
            const block2 = yield* λ(
                Schema.decode(InternetSchemas.CidrBlock)({ ipv6: "2001:db8:85a3::8a2e:370:7334", mask: 64 }),
            );
            assert.strictEqual(block2.mask, 64);
            assert.strictEqual(block2.family, "ipv6");
            assert.strictEqual(block2.total, 18446744073709551616n);
            assert.strictEqual(block2.ip, "2001:db8:85a3::8a2e:370:7334");
            assert.strictEqual(block2.networkAddress, "2001:0db8:85a3:0000:0000:0000:0000:0000");
            assert.strictEqual(block2.broadcastAddress, "2001:0db8:85a3:0000:ffff:ffff:ffff:ffff");
        }).pipe(Effect.runSync));

    it("should parse endpoints", () =>
        Effect.gen(function* (λ) {
            // ipv4
            yield* λ(Schema.decode(InternetSchemas.IPv4Endpoint)("1.1.1.1:51280"));
            yield* λ(Schema.decode(InternetSchemas.IPv4Endpoint)("1.1.1.1:51280:51280"));

            // ipv6
            // Waiting on https://github.com/Effect-TS/effect/pull/2370
            // yield * λ(Schema.decode(InternetSchemas.IPv6Endpoint)("[2001:db8:85a3::8a2e:370:7334]:51280"));
            // yield * λ(Schema.decode(InternetSchemas.IPv6Endpoint)("[2001:db8:85a3::8a2e:370:7334]:51280:51280"));
        }).pipe(Effect.runSync));
});
