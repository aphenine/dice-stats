import { ArrayRollable, Rollable, RollableType } from "../rollable";

/** Rolls each scalar and collects the results into one array, in order. */
export class CreateArrayOperator implements ArrayRollable {
    readonly type = RollableType.Array;

    constructor(public readonly contents: Array<Rollable>) {}

    roll() {
        return this.contents.map((rollable) => rollable.roll());
    }
}
