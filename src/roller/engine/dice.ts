import { rollerService } from "../services/roller";
import { Rollable, RollableType } from "./rollable";

export class DiceRollable implements Rollable {
    public type = RollableType.Scalar

    constructor (public faces: number = 6) {}

    roll() {
        return rollerService.rollDice(this.faces);
    }
}
