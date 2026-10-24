import { CreateArrayOperator } from "../operators/array";
import { AnyRollable, ArrayRollable, Rollable, RollableType, isArrayRollable, typeName } from "../rollable";
import { HighestRollable, LowestRollable } from "./keep";
import { MaximumRollable } from "./max";
import { MinimumRollable } from "./min";
import { RemoveLowestRollable } from "./remove";
import { ThresholdRollable } from "./threshold";
import { TotalRollable } from "./total";

/**
 * One accepted argument list: a fixed prefix of parameter types, optionally
 * followed by any number of further arguments of the `rest` type.
 */
export interface Signature {
    params: RollableType[];
    rest?: RollableType;
}

export interface FunctionDefinition {
    name: string;
    /** Alternative signatures; a call must match exactly one of them. */
    signatures: Signature[];
    build(args: AnyRollable[]): AnyRollable;
}

const ONE_ARRAY: Signature = { params: [RollableType.Array] };
const ONE_OR_MORE_SCALARS: Signature = { params: [RollableType.Scalar], rest: RollableType.Scalar };
const ARRAY_OR_SCALARS = [ONE_ARRAY, ONE_OR_MORE_SCALARS];
const ARRAY_AND_SCALAR: Signature = { params: [RollableType.Array, RollableType.Scalar] };

export function matchesSignature(signature: Signature, types: RollableType[]): boolean {
    if (types.length < signature.params.length) {
        return false;
    }
    if (signature.rest === undefined && types.length > signature.params.length) {
        return false;
    }
    return types.every((type, i) =>
        i < signature.params.length ? type === signature.params[i] : type === signature.rest
    );
}

export function describeSignature(name: string, signature: Signature): string {
    const parts: string[] = signature.params.map(typeName);
    if (signature.rest !== undefined) {
        parts.push(`${typeName(signature.rest)}...`);
    }
    return `${name}(${parts.join(", ")})`;
}

/** Accepts the array-or-scalars argument forms and always yields a single array. */
function toArray(args: AnyRollable[]): ArrayRollable {
    const [first] = args;
    if (args.length === 1 && isArrayRollable(first)) {
        return first;
    }
    return new CreateArrayOperator(args as Rollable[]);
}

export const FUNCTIONS: Record<string, FunctionDefinition> = {
    array: {
        name: "array",
        signatures: [ONE_OR_MORE_SCALARS],
        build: (args) => new CreateArrayOperator(args as Rollable[]),
    },
    total: {
        name: "total",
        signatures: ARRAY_OR_SCALARS,
        build: (args) => new TotalRollable(toArray(args)),
    },
    min: {
        name: "min",
        signatures: ARRAY_OR_SCALARS,
        build: (args) => new MinimumRollable(toArray(args)),
    },
    max: {
        name: "max",
        signatures: ARRAY_OR_SCALARS,
        build: (args) => new MaximumRollable(toArray(args)),
    },
    threshold: {
        name: "threshold",
        signatures: [ARRAY_AND_SCALAR],
        build: ([values, threshold]) => new ThresholdRollable(values as ArrayRollable, threshold as Rollable),
    },
    remove: {
        name: "remove",
        signatures: [ARRAY_AND_SCALAR],
        build: ([values, count]) => new RemoveLowestRollable(values as ArrayRollable, count as Rollable),
    },
    lowest: {
        name: "lowest",
        signatures: [ARRAY_AND_SCALAR],
        build: ([values, count]) => new LowestRollable(values as ArrayRollable, count as Rollable),
    },
    highest: {
        name: "highest",
        signatures: [ARRAY_AND_SCALAR],
        build: ([values, count]) => new HighestRollable(values as ArrayRollable, count as Rollable),
    },
};
