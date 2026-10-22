'use client'

import HighchartsReact from "highcharts-react-official";
import * as Highcharts from "highcharts";
import { FC, useCallback, useMemo, useState } from "react";
import { histogram } from "@/math/utils/histogram";
import InputDiceRoll from "./input-dice-roll";
import Series from "../types/series";

/** Builds chart options with every series aligned to one shared, numerically sorted axis. */
export function buildChartOptions(allSeries: Series[]): Highcharts.Options {
    const histograms = allSeries.map((series) => histogram(series.data, 1));
    const categories = [...new Set(histograms.flatMap(Object.keys))]
        .map(Number)
        .sort((a, b) => a - b);

    return {
        title: { text: "Statistics" },
        xAxis: { categories: categories.map(String), title: { text: "Result" } },
        yAxis: { title: { text: "Occurrences" } },
        series: allSeries.map((series, i) => ({
            type: "column",
            name: series.label,
            data: categories.map((category) => histograms[i][category] ?? 0),
        })),
    };
}

const DiceStats: FC = () => {
    const [allSeries, setAllSeries] = useState<Record<string, Series>>({});
    const [inputs, setInputs] = useState(1);

    const addSeries = useCallback((series: Series) => {
        setAllSeries((existing) => ({ ...existing, [series.id]: series }));
    }, []);

    const options = useMemo(() => buildChartOptions(Object.values(allSeries)), [allSeries]);

    return (
        <div>
            {Array.from({ length: inputs }, (_, i) => (
                <InputDiceRoll key={i} uniqueId={`${i}`} addSeries={addSeries} />
            ))}
            <div className="m-2">
                <button className="border rounded px-3 py-1" onClick={() => setInputs(inputs + 1)}>
                    Add new dice roll
                </button>
            </div>

            {Object.keys(allSeries).length > 0 && (
                <HighchartsReact highcharts={Highcharts} options={options} />
            )}
        </div>
    );
};

export default DiceStats;
