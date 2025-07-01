import { histogram } from "@/math/utils/histogram";

describe("Histogram function", () => {
    it("should contruct a historgram based on the data provided", () => {
        const results = histogram([1,2,2,3,3,3,4,4,4,5,5,6], 1);
    
        expect(results).toEqual({
            1: 1,
            2: 2,
            3: 3,
            4: 3,
            5: 2,
            6: 1,
        });
    })
});