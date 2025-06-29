import { ArrayRollable, Rollable } from "../rollable";

export class ThresholdRollable implements Rollable {
    constructor (public args: ArrayRollable, public threshold: Rollable) {
        console.log(args);
    }

    roll() {
        const threshold = this.threshold.roll();

        const results = this.args.roll();

        console.log(results, threshold);

        const occurances= results.filter(r => r >= threshold).length;
        console.log(occurances);
        return occurances;
    }
}
