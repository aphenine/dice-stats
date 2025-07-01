import { ArrayRollable, RollableType } from "./rollable";
import { rollerService } from "../services/roller";


export class DiceArrayRollable implements ArrayRollable {
    public type = RollableType.Array;

    constructor (public dice: number, public faces: number = 6) {}

    roll() {
        return Array(this.dice).fill(null).map(() => rollerService.rollDice(this.faces))
    }
}
