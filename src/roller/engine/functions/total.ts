import { ArrayRollable, Rollable, RollableType } from "../rollable";

export class TotalRollable implements Rollable {
    readonly type = RollableType.Scalar;

    constructor(public readonly values: ArrayRollable) {}

    roll() {
        return this.values.roll().reduce((sum, value) => sum + value, 0);
    }
}
