import { AnyRollable, typeName } from "../engine/rollable";
import { parse } from "../parser/parse";

export const MAX_SAMPLES = 100_000;

export interface SampleResult {
    expression: string;
    /** Whether each sample is a single number or a list of numbers. */
    type: "scalar" | "array";
    times: number;
    samples: Array<number | number[]>;
}

/** Rolls an engine `times` times and collects the samples. */
export function sample(engine: AnyRollable, times: number): Array<number | number[]> {
    return Array.from({ length: times }, () => engine.roll());
}

/** Parses an expression and rolls it `times` times. Throws ParseError on bad input. */
export function sampleExpression(expression: string, times: number): SampleResult {
    const engine = parse(expression);

    return {
        expression,
        type: typeName(engine.type),
        times,
        samples: sample(engine, times),
    };
}
