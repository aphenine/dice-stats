import { Rollable, RollableType } from "./rollable";

export class ConstantRollable implements Rollable {
    readonly type = RollableType.Scalar;

    constructor(public readonly value: number) {}

    roll() {
        return this.value;
    }
}
