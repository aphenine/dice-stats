import { ArrayRollable, Rollable, RollableType } from "../rollable";

export class ThresholdRollable implements Rollable {
    public type = RollableType.Scalar

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
