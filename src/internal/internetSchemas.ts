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
// `Array.prototype.slice` is typed as `Array<T>`; computing the tail tuple is the point of this helper.
// oxlint-disable-next-line typescript/no-unsafe-type-assertion
export const tail = <T extends ReadonlyArray<unknown>>(elements: T): Tail<T> => elements.slice(1) as Tail<T>;

/** @internal */
export const splitLiteral = <Str extends string, Delimiter extends string>(
    str: Str,
    delimiter: Delimiter
    // `String.prototype.split` is typed as `Array<string>`; computing the literal tuple is the point of this helper.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
): Split<Str, Delimiter> => str.split(delimiter) as Split<Str, Delimiter>;
