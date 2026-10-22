import { buildChartOptions } from "@/interface/components/dice-stats";

describe("buildChartOptions", () => {
    it("aligns every series to one numerically sorted category axis", () => {
        const options = buildChartOptions([
            { id: "0", label: "d10", data: [10, 2, 10] },
            { id: "1", label: "d4", data: [1, 2] },
        ]);

        expect(options.xAxis).toMatchObject({ categories: ["1", "2", "10"] });
        expect(options.series).toEqual([
            { type: "column", name: "d10", data: [0, 1, 2] },
            { type: "column", name: "d4", data: [1, 1, 0] },
        ]);
    });
});
