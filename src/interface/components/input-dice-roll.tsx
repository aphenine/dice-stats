import { Rollable } from "@/roller/engine/rollable";
import { parse } from "@/roller/parser/parse";
import { FC, useState, useEffect, useMemo } from "react";
import Series from "../types/series";

interface InputDiceRollProps {
    uniqueId: string,
    addSeries: (series: Series) => void
  }
  
  const InputDiceRoll: FC<InputDiceRollProps> = ({uniqueId, addSeries}: InputDiceRollProps) => {
      const [inputText, setInputText] = useState("");
      const [timesText, setTimesText] = useState("100");
      const [engine, setEngine] = useState<null|Rollable>(null);
      const [series, setSeries] = useState<number[]>([]);

      const times = useMemo(() => parseInt(timesText), [timesText]);
  
      useEffect(() => {
        if (engine) {
          setSeries(Array(times).fill(null).map(() => engine.roll()))
        }
      }, [engine, times]);
  
      useEffect(() => {
        if (series.length > 0) {
          addSeries({
            id: uniqueId,
            label: inputText,
            data: series,
          });
        }
      }, [series]);
  
      return (<div className="flex m-2">
          <label className="mx-2">Dice: </label>
          <input className="flex-grow mx-2" id="dice" type="text" onChange={(e) => setInputText(e.target.value)} value={inputText}></input>
          <button className="mx-2" onClick={() => {
            setEngine(parse(inputText))
          }}>Roll</button>
          <input value={timesText} onChange={(e) => setTimesText(e.target.value)}></input>
          times
      </div>);
  }

export default InputDiceRoll;