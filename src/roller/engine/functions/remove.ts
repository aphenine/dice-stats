import { ArrayRollable, Rollable, RollableType } from "../rollable";

/** Drops the N lowest values from the array and returns the rest, sorted ascending. */
export class RemoveLowestRollable implements ArrayRollable {
    readonly type = RollableType.Array;

    constructor(public readonly values: ArrayRollable, public readonly count: Rollable) {}

    roll() {
        const count = Math.max(0, this.count.roll());
        const sorted = [...this.values.roll()].sort((a, b) => a - b);

        return sorted.slice(count);
    }
}
