import { Rollable } from "../rollable";

export class TotalRollable implements Rollable {
    constructor (public args: Rollable[]) {}

    roll() {
        const rolls = this.args.map((r) => r.roll());
        console.log(rolls, this.args);
        return rolls.reduce((count, value) => count + value, 0);
    }
}
