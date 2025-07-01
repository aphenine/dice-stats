import { ArrayRollable, Rollable, RollableType } from "../rollable";

export class TotalRollable implements Rollable {
    public type = RollableType.Scalar

    constructor (public args: (Rollable | ArrayRollable)[]) {}

    roll() {
        let rolls;
        console.log(this.args);
        if (this.args[0].type === RollableType.Array) {
            console.log("Array");
            rolls = (this.args[0] as ArrayRollable).roll();
        } else {
            console.log("Scalar")
            rolls = (this.args as Rollable[]).map((r) => r.roll());
        }
        console.log(rolls, this.args);
        return rolls.reduce((count, value) => count + value, 0);
    }
}
