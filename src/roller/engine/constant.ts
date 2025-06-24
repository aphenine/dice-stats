import { Rollable } from "./rollable";

export class ConstantRollable implements Rollable {
    constructor (public value: number = 6) {}

    roll() {
        return this.value;
    }
}
