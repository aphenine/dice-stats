import { histogram } from "@/math/utils/histogram";

describe("Histogram function", () => {
    it("should construct a histogram based on the data provided", () => {
        const results = histogram([1,2,2,3,3,3,4,4,4,5,5,6], 1);

        expect(results).toEqual({
            1: 1,
            2: 2,
            3: 3,
            4: 3,
            5: 2,
            6: 1,
        });
    });

    it("keys wider bins by their lower bound", () => {
        expect(histogram([1, 2, 5, 9, 10], 5)).toEqual({ 0: 2, 5: 2, 10: 1 });
    });

    it("returns an empty histogram for no data", () => {
        expect(histogram([], 1)).toEqual({});
    });
});
