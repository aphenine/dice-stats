import { DiceRollable } from "../engine/dice";
import { Rollable } from "../engine/rollable";

class ParseDice {
    public static pattern: RegExp = /^d\d+/

    static tryParse(text: string) {
        console.log(text)
        const match = text.match(this.pattern);

        console.log(match);

        if (match === null) {
            return null;
        }

        return { match: match[0], remaining: text.slice(match[0].length)};
    }

    static rollable(match: string): DiceRollable {
        return new DiceRollable(parseInt(match.slice(1)))
    }
}

export function parse(text: string) : Rollable {
    const match = ParseDice.tryParse(text);
    if (match !== null) {
        return ParseDice.rollable(match.match);
    }
    throw Error("Could not parse text");
}