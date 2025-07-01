import { ArrayRollable, Rollable, RollableType } from "../rollable";

export class CreateArrayOperator implements ArrayRollable {
    public type = RollableType.Array;


    constructor (public contents: Array<Rollable>) {}

    roll() {
        return this.contents.map(rollable => rollable.roll())
    }
}
