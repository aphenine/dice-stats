import { rollerService } from "../services/roller";
import { Rollable } from "./rollable";

export class DiceRollable implements Rollable {
    constructor (public faces: number = 6) {}

    roll() {
        return rollerService.rollDice(this.faces);
    }
}
