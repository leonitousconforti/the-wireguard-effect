import * as Array from "effect/Array";
import * as Function from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as Record from "effect/Record";
import * as Tuple from "effect/Tuple";

/** @internal */
export type Tail<T extends ReadonlyArray<unknown>> = T extends
    | [infer _First, ...infer Rest]
    | readonly [infer _First, ...infer Rest]
    ? Rest
    : Array<unknown>;

/** @internal */
export type Split<Str extends string, Delimiter extends string> = string extends Str | ""
    ? Array<string>
    : Str extends `${infer Head}${Delimiter}${infer Rest}`
      ? [Head, ...Split<Rest, Delimiter>]
      : [Str];

/** @internal */
export const tail = <T extends ReadonlyArray<unknown>>(elements: T): Tail<T> => elements.slice(1) as Tail<T>;

/** @internal */
export const splitLiteral = <Str extends string, Delimiter extends string>(
    str: Str,
    delimiter: Delimiter
): Split<Str, Delimiter> => str.split(delimiter) as Split<Str, Delimiter>;

/** @internal */
export const transposeSet: {
    <Key extends string, Value extends string>(
        record: Record.ReadonlyRecord<Key, HashSet.HashSet<Value>>
    ): Record<Record.ReadonlyRecord.NonLiteralKey<Value>, HashSet.HashSet<Key>>;
} = Function.flow(
    Record.map(HashSet.values),
    Record.map(Array.fromIterable),
    Record.collect((key, values) => Array.map(values, (value) => Tuple.make(value, key))),
    Array.flatten,
    Array.groupBy(Tuple.getFirst),
    Record.map(Array.map(Tuple.getSecond)),
    Record.map(HashSet.fromIterable)
);
