import { ArrayRollable } from "./rollable";
import { rollerService } from "../services/roller";


export class DiceArrayRollable implements ArrayRollable {
    constructor (public dice: number, public faces: number = 6) {}

    roll() {
        return Array(this.dice).fill(null).map(() => rollerService.rollDice(this.faces))
    }
}
