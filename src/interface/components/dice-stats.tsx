'use client'

import HighchartsReact from "highcharts-react-official";
import * as Highcharts from 'highcharts';
import { FC, useCallback, useMemo, useRef, useState } from "react";
import { histogram } from "@/math/utils/histogram";
import InputDiceRoll from "./input-dice-roll";
import Series from "../types/series";

type Props = object

const DiceStats: FC<Props> = ({}: Props) => {
    const [allSeries, setAllSeries] = useState<Record<string, Series>>({});
    const [inputs, setInputs] = useState(1);

    const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

    console.log(allSeries);

    const options: Highcharts.Options = useMemo(() => ({
      title: {
          text: 'My chart'
      },
      series: Object.values(allSeries).map(series => ({
        type: 'column',
        data: Object.values(histogram(series.data, 1)),
      })),
    }), [allSeries]);

    const addSeries = useCallback((series: Series) => {
      setAllSeries((as) => ({...as, [series.id]: series}));
      allSeries[series.label] = series;
    }, [allSeries]);

    return (
        <div>
          {
            Array(inputs).fill(null).map((_, i) => (
              <InputDiceRoll key={i} uniqueId={`${i}`} addSeries={addSeries} />
            ))
          }
          <div><button onClick={() => setInputs(inputs+1)}>Add new dice roll</button></div>

          {options.series!.length > 0 && (
            <HighchartsReact
            highcharts={Highcharts}
            options={options}
            ref={chartComponentRef}
          />
          )}
      </div>
    );
}

export default DiceStats;