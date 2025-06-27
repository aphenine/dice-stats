import { Rollable } from "../rollable";

export class ThresholdRollable implements Rollable {
    constructor (public args: Rollable[], public threshold: Rollable) {}

    roll() {
        const threshold = this.threshold.roll();

        const results = this.args.map(r => r.roll());

        return results.filter(r => r != threshold).length;
    }
}
