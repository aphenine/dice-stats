import { ArrayRollable, Rollable, RollableType } from "../rollable";

export class MaximumRollable implements Rollable {
    readonly type = RollableType.Scalar;

    constructor(public readonly values: ArrayRollable) {}

    roll() {
        return Math.max(...this.values.roll());
    }
}
