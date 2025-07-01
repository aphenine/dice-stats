import { ArrayRollable, Rollable, RollableType } from "../rollable";

export class RemoveDiceRollable implements ArrayRollable {
    public type: RollableType = RollableType.Array;

    constructor(public diceArray: ArrayRollable, public fromHighest: Rollable) {
        this.type = RollableType.Array;
    }


    roll() {
        const values = this.diceArray.roll();

        values.sort();

        return values.filter((_, i) => i !== (this.fromHighest.roll() - 1));
    }
}