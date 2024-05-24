import * as NodeContext from "@effect/platform-node/NodeContext";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";

const filter = /test1234/;
const logs = Effect.map(FileSystem.FileSystem, (fs) => fs.stream("./logs.txt")).pipe(Stream.unwrap);

const x = logs.pipe(
    Stream.decodeText("utf-8"),
    Stream.splitLines,
    Stream.tap(Console.log),
    Stream.takeUntil<string>((x) => filter.test(x)),
    Stream.runDrain
);

await x.pipe(Effect.provide(NodeContext.layer)).pipe(Effect.runPromise);
