import { ArrayRollable, Rollable } from "../rollable";

export class CreateArrayOperator implements ArrayRollable {
    constructor (public contents: Array<Rollable>) {}

    roll() {
        return this.contents.map(rollable => rollable.roll())
    }
}
