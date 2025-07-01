import { Rollable, RollableType } from "./rollable";

export class ConstantRollable implements Rollable {
    public type = RollableType.Scalar


    constructor (public value: number = 6) {}

    roll() {
        return this.value;
    }
}
