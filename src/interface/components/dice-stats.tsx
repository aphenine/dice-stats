'use client'

import HighchartsReact from "highcharts-react-official";
import * as Highcharts from 'highcharts';
import { FC, useCallback, useMemo, useRef, useState } from "react";
import { histogram } from "@/math/utils/histogram";
import InputDiceRoll from "./input-dice-roll";

type Props = object

const DiceStats: FC<Props> = ({}: Props) => {
    const [allSeries, setAllSeries] = useState<Record<string, any>>({});

    const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

    console.log(allSeries);

    const options: Highcharts.Options = useMemo(() => ({
      title: {
          text: 'My chart'
      },
      series: Object.values(allSeries).map(series => ({
        type: 'column',
        label: series.label,
        data: histogram(series.data, 1),
      })),
    }), [allSeries]);

    const addSeries = useCallback((series) => {
      setAllSeries((as) => ({...as, [series.id]: series}));
      allSeries[series.label] = series;
    }, [allSeries]);

    return (
        <div>
          <InputDiceRoll uniqueId={"id"} addSeries={addSeries} />

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