import { rollerService } from "../services/roller";
import { Rollable, RollableType } from "./rollable";

export class DiceRollable implements Rollable {
    readonly type = RollableType.Scalar;

    constructor(public readonly faces: number) {}

    roll() {
        return rollerService.rollDice(this.faces);
    }
}
