import { ArrayRollable, Rollable, RollableType } from "../rollable";

/** Counts how many values in the array are greater than or equal to the threshold. */
export class ThresholdRollable implements Rollable {
    readonly type = RollableType.Scalar;

    constructor(public readonly values: ArrayRollable, public readonly threshold: Rollable) {}

    roll() {
        const threshold = this.threshold.roll();

        return this.values.roll().filter((value) => value >= threshold).length;
    }
}
