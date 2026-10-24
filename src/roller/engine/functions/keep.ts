import { ArrayRollable, Rollable, RollableType } from "../rollable";

/** Keeps the N lowest values from the array, sorted ascending. */
export class LowestRollable implements ArrayRollable {
    readonly type = RollableType.Array;

    constructor(public readonly values: ArrayRollable, public readonly count: Rollable) {}

    roll() {
        const count = Math.max(0, this.count.roll());
        const sorted = [...this.values.roll()].sort((a, b) => a - b);

        return sorted.slice(0, count);
    }
}

/** Keeps the N highest values from the array, sorted ascending. */
export class HighestRollable implements ArrayRollable {
    readonly type = RollableType.Array;

    constructor(public readonly values: ArrayRollable, public readonly count: Rollable) {}

    roll() {
        const count = Math.max(0, this.count.roll());
        const sorted = [...this.values.roll()].sort((a, b) => a - b);

        return count === 0 ? [] : sorted.slice(-count);
    }
}
