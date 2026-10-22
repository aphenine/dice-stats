import { rollerService } from "../services/roller";
import { ArrayRollable, RollableType } from "./rollable";

export class DiceArrayRollable implements ArrayRollable {
    readonly type = RollableType.Array;

    constructor(public readonly dice: number, public readonly faces: number) {}

    roll() {
        return rollerService.rollDiceNTimes(this.faces, this.dice);
    }
}
