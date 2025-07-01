import { splitTakingIntoAccountBrackets } from "@/roller/utils/split"

describe("Splitting functions", () => {
    describe("Brackets aware split", () => {
        it ("should split a simple comma separated list of arguments", () => {
            const testString = "a, b, c, d";

            const result = splitTakingIntoAccountBrackets(testString);

            expect(result).toEqual([
                "a",
                " b",
                " c",
                " d",
            ]);
        });
    })

    it ("should split comma separated list of arguments with arguments inside another function", () => {
        const testString = "a, b(x, y), c, d";

        const result = splitTakingIntoAccountBrackets(testString);

        expect(result).toEqual([
            "a",
            " b(x, y)",
            " c",
            " d",
        ]);
    });
})