import { AnyRollable } from "../engine/rollable";
import { build } from "./build";
import { parseToAst } from "./parser";

export { ParseError } from "./errors";

/** Parses a dice expression and returns an engine whose `roll()` produces one sample. */
export function parse(input: string): AnyRollable {
    return build(parseToAst(input));
}
