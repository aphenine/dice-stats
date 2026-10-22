import { ConstantRollable } from "@/roller/engine/constant";
import { DiceRollable } from "@/roller/engine/dice";
import { DiceArrayRollable } from "@/roller/engine/dice-array";
import { MaximumRollable } from "@/roller/engine/functions/max";
import { MinimumRollable } from "@/roller/engine/functions/min";
import { RemoveLowestRollable } from "@/roller/engine/functions/remove";
import { ThresholdRollable } from "@/roller/engine/functions/threshold";
import { TotalRollable } from "@/roller/engine/functions/total";
import { AdditionOperator, SubtractionOperator } from "@/roller/engine/operators/arithmetic";
import { CreateArrayOperator } from "@/roller/engine/operators/array";
import { RollableType } from "@/roller/engine/rollable";
import { ParseError, parse } from "@/roller/parser/parse";

describe("Building engines from expressions", () => {
    it("builds the basic tokens", () => {
        expect(parse("d6")).toEqual(new DiceRollable(6));
        expect(parse("3d6")).toEqual(new DiceArrayRollable(3, 6));
        expect(parse("7")).toEqual(new ConstantRollable(7));
    });

    it("builds total, min and max from either one array or a list of scalars", () => {
        expect(parse("total(3d6)")).toEqual(new TotalRollable(new DiceArrayRollable(3, 6)));
        expect(parse("total(d6, 2)")).toEqual(
            new TotalRollable(new CreateArrayOperator([new DiceRollable(6), new ConstantRollable(2)])),
        );
        expect(parse("min(2d8)")).toEqual(new MinimumRollable(new DiceArrayRollable(2, 8)));
        expect(parse("max(d4, d6)")).toEqual(
            new MaximumRollable(new CreateArrayOperator([new DiceRollable(4), new DiceRollable(6)])),
        );
    });

    it("builds threshold and remove from an array and a scalar", () => {
        expect(parse("threshold(3d6, 4)")).toEqual(
            new ThresholdRollable(new DiceArrayRollable(3, 6), new ConstantRollable(4)),
        );
        expect(parse("remove(4d6, 1)")).toEqual(
            new RemoveLowestRollable(new DiceArrayRollable(4, 6), new ConstantRollable(1)),
        );
    });

    it("builds arithmetic operators on scalars", () => {
        expect(parse("d20 + 3")).toEqual(new AdditionOperator(new DiceRollable(20), new ConstantRollable(3)));
        expect(parse("total(2d6) - 1")).toEqual(
            new SubtractionOperator(new TotalRollable(new DiceArrayRollable(2, 6)), new ConstantRollable(1)),
        );
    });

    it("reports the static type of the expression", () => {
        expect(parse("remove(4d6, 1)").type).toBe(RollableType.Array);
        expect(parse("total(remove(4d6, 1))").type).toBe(RollableType.Scalar);
    });

    it("rejects unknown functions", () => {
        expect(() => parse("foo(d6)")).toThrow(ParseError);
        expect(() => parse("foo(d6)")).toThrow("Unknown function 'foo'");
    });

    it("rejects mixing an array with other arguments", () => {
        expect(() => parse("total(3d6, d4)")).toThrow(
            "total(array, scalar) does not match total(array) or total(scalar, scalar...)",
        );
    });

    it("rejects wrong argument types and counts", () => {
        expect(() => parse("threshold(d6, 3)")).toThrow("threshold(scalar, scalar) does not match threshold(array, scalar)");
        expect(() => parse("remove(3d6)")).toThrow("remove(array) does not match remove(array, scalar)");
        expect(() => parse("array(3d6)")).toThrow("array(array) does not match array(scalar, scalar...)");
        expect(() => parse("total()")).toThrow("total() does not match");
    });

    it("rejects arrays as operands of + and -", () => {
        expect(() => parse("3d6 + 2")).toThrow("'+' requires scalar operands but '3d6' is an array");
        expect(() => parse("1 - remove(4d6, 1)")).toThrow("'-' requires scalar operands but 'remove(4d6, 1)' is an array");
    });
});
