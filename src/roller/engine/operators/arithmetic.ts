import { Rollable, RollableType } from "../rollable";

export type ArithmeticOperatorSymbol = "+" | "-";

abstract class ArithmeticOperator implements Rollable {
    readonly type = RollableType.Scalar;

    constructor(public readonly left: Rollable, public readonly right: Rollable) {}

    roll() {
        return this.apply(this.left.roll(), this.right.roll());
    }

    protected abstract apply(left: number, right: number): number;
}

export class AdditionOperator extends ArithmeticOperator {
    protected apply(left: number, right: number) {
        return left + right;
    }
}

export class SubtractionOperator extends ArithmeticOperator {
    protected apply(left: number, right: number) {
        return left - right;
    }
}

export function createArithmeticOperator(symbol: ArithmeticOperatorSymbol, left: Rollable, right: Rollable): Rollable {
    switch (symbol) {
        case "+":
            return new AdditionOperator(left, right);
        case "-":
            return new SubtractionOperator(left, right);
    }
}
