import { ArrayRollable, Rollable, RollableType } from "../rollable";

export class MinimumRollable implements Rollable {
    readonly type = RollableType.Scalar;

    constructor(public readonly values: ArrayRollable) {}

    roll() {
        return Math.min(...this.values.roll());
    }
}
