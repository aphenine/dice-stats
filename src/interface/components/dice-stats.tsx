'use client'

import { Rollable } from "@/roller/engine/rollable";
import { parse } from "@/roller/parser/parse";
import HighchartsReact from "highcharts-react-official";
import * as Highcharts from 'highcharts';
import { FC, useEffect, useRef, useState } from "react";
import { histogram } from "@/math/utils/histogram";

type Props = object

const DiceStats: FC<Props> = ({}: Props) => {
    const [inputText, setInputText] = useState("");
    const [engine, setEngine] = useState<null|Rollable>(null);


    const [series, setSeries] = useState<number[]>([]);
    const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

    const options: Highcharts.Options = {
      title: {
          text: 'My chart'
      },
      series: [
      //   {
      //     type: 'histogram',
      //     baseSeries: 1
      // }, {
      //   type: "line",
      //   data: series,
      // }
        {
          type: 'column',
          data: series.length > 0 ? histogram(series, 1) : []
        }
      ]
  };

    useEffect(() => {
      if (engine) {
        setSeries(Array(100).fill(null).map(() => engine.roll()))
      }
    }, [engine]);

    return (
        <div>
          <label >Dice: </label>
          <input id="dice" type="text" onChange={(e) => setInputText(e.target.value)} value={inputText}></input>
          <button onClick={() => {
            setEngine(parse(inputText))
          }}>Roll</button>

          <div>
            {engine && engine.roll()}
            {!engine && "No engine"}
          </div>

          {series.length > 0 && (
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