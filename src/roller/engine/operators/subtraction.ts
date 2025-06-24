import { Rollable } from "../rollable";

export class SubtractionOperator implements Rollable {
    constructor (public left: Rollable, public right: Rollable) {}

    roll() {
        const left = this.left.roll();
        const right = this.right.roll();

        return left - right;
    }
}
