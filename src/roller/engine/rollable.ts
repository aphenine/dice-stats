export enum RollableType {
    Scalar = 0,
    Array = 1,
}

export interface Rollable {
    type: RollableType
    roll(): number;
}

export interface ArrayRollable {
    type: RollableType;
    roll(): Array<number>;
}
