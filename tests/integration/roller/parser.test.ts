import { parse } from "@/roller/parser/parse";

describe("Acceptance test cases for the parser and roller", () => {
    it("should be able to parse a single die", () => {
        const engine = parse("d6");

        const value = engine.roll();

        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThan(7)
    })

    it("should be able to parse a dice array", () => {
        const engine = parse("3d6");

        const value = engine.roll() as number[];

        expect(Array.isArray(value)).toBeTruthy();
        expect(value.length).toEqual(3);

        (value).forEach((val) => {
            expect(val).toBeGreaterThanOrEqual(1);
            expect(val).toBeLessThan(7)
        });
    });

    it("should be able to take the total of a set of dice", () => {
        const engine = parse("total(d6,d6)");

        const result = engine.roll();

        expect(result).toEqual(expect.any(Number));
        expect(result).toBeGreaterThanOrEqual(2);
        expect(result).toBeLessThan(13)
    })

    it("should be able to calculate the threshold of some dice", () => {
        const engine = parse("threshold(array(d12, d8, d6, d4), 3)");

        const result = engine.roll()

        expect(Array.isArray(result)).toBeFalsy();

        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(5)
    })
})