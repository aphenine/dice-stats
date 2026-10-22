export enum RollableType {
    Scalar = 0,
    Array = 1,
}

/** An expression that produces a single number per roll. */
export interface Rollable {
    readonly type: RollableType.Scalar;
    roll(): number;
}

/** An expression that produces a list of numbers per roll. */
export interface ArrayRollable {
    readonly type: RollableType.Array;
    roll(): Array<number>;
}

export type AnyRollable = Rollable | ArrayRollable;

export function isArrayRollable(rollable: AnyRollable): rollable is ArrayRollable {
    return rollable.type === RollableType.Array;
}

export function typeName(type: RollableType): "scalar" | "array" {
    return type === RollableType.Array ? "array" : "scalar";
}
