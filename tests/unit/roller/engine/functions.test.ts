import { rollerService } from "@/roller/services/roller";
import { parse } from "@/roller/parser/parse";

/** Makes every die return the given values in order, so engine results are deterministic. */
function rollsInOrder(...values: number[]) {
    const queue = [...values];
    jest.spyOn(rollerService, "rollDice").mockImplementation(() => {
        const next = queue.shift();
        if (next === undefined) throw new Error("More dice rolled than values queued");
        return next;
    });
}

describe("Engine functions", () => {
    afterEach(() => jest.restoreAllMocks());

    it("total sums an array or a list of scalars", () => {
        rollsInOrder(1, 5, 3);
        expect(parse("total(3d6)").roll()).toBe(9);

        rollsInOrder(4, 2);
        expect(parse("total(d6, d6, 10)").roll()).toBe(16);
    });

    it("min and max pick the smallest and largest value", () => {
        rollsInOrder(4, 1, 6);
        expect(parse("min(3d6)").roll()).toBe(1);

        rollsInOrder(4, 1, 6);
        expect(parse("max(3d6)").roll()).toBe(6);

        rollsInOrder(2, 9);
        expect(parse("max(d4, d12, 5)").roll()).toBe(9);
    });

    it("threshold counts values greater than or equal to the limit", () => {
        rollsInOrder(3, 5, 1, 6);
        expect(parse("threshold(4d6, 3)").roll()).toBe(3);
    });

    it("threshold rolls a dice threshold freshly each sample", () => {
        rollsInOrder(3, 2, 2, 2, 1, 2, 2, 2);
        const engine = parse("threshold(3d6, d4)");

        expect(engine.roll()).toBe(0);
        expect(engine.roll()).toBe(3);
    });

    it("remove drops the n lowest values and sorts numerically", () => {
        rollsInOrder(10, 2, 6, 1);
        expect(parse("remove(4d20, 1)").roll()).toEqual([2, 6, 10]);

        rollsInOrder(10, 2, 6, 1);
        expect(parse("remove(4d20, 2)").roll()).toEqual([6, 10]);
    });

    it("remove returns an empty array when n covers the whole array", () => {
        rollsInOrder(3, 4);
        expect(parse("remove(2d6, 5)").roll()).toEqual([]);
    });

    it("array rolls each scalar in order", () => {
        rollsInOrder(7, 3);
        expect(parse("array(d12, d8, 2)").roll()).toEqual([7, 3, 2]);
    });

    it("+ and - evaluate left to right", () => {
        rollsInOrder(4, 1);
        expect(parse("d6 + 10 - d4").roll()).toBe(13);
    });

    it("composes: 4d6 drop lowest", () => {
        rollsInOrder(6, 1, 5, 3);
        expect(parse("total(remove(4d6, 1))").roll()).toBe(14);
    });
});
