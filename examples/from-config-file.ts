import * as Platform from "@effect/platform";
import * as PlatformNode from "@effect/platform-node";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

import * as WireguardConfig from "the-wireguard-effect/WireguardConfig";
import * as WireguardError from "the-wireguard-effect/WireguardErrors";

export const program: Effect.Effect<
    void,
    ParseResult.ParseError | Platform.Error.PlatformError | WireguardError.WireguardError | Cause.UnknownException,
    Platform.FileSystem.FileSystem | Platform.Path.Path
> = Effect.gen(function* (λ) {
    const config = yield* λ(WireguardConfig.fromConfigFile("examples/wireguard-config.conf"));
    yield* λ(Console.log(config));
});

Effect.suspend(() => program).pipe(Effect.provide(PlatformNode.NodeContext.layer), PlatformNode.NodeRuntime.runMain);
