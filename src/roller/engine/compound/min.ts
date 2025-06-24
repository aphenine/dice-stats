import { Rollable } from "../rollable";

export class MinimumRollable implements Rollable {
    constructor(public rollables: Array<Rollable>) {
        if (!Array.isArray(this.rollables)) {
            throw Error("Must be array");
        }
    }

    roll() {
        const value = this.rollables.roll();
    }
}