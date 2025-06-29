import { histogram } from "@/math/utils/histogram";
import { Rollable } from "@/roller/engine/rollable";
import { parse } from "@/roller/parser/parse";
import { FC, useState, useEffect } from "react";

interface InputDiceRollProps {
    uniqueId: string,
    addSeries: (something: unknown) => void
  }
  
  const InputDiceRoll: FC<InputDiceRollProps> = ({uniqueId, addSeries}: InputDiceRollProps) => {
      const [inputText, setInputText] = useState("");
      const [engine, setEngine] = useState<null|Rollable>(null);
      const [series, setSeries] = useState<number[]>([]);
  
      useEffect(() => {
        if (engine) {
          setSeries(Array(100).fill(null).map(() => engine.roll()))
        }
      }, [engine]);
  
      useEffect(() => {
        if (series.length > 0) {
          addSeries({
            id: uniqueId,
            label: inputText,
            type: 'column',
            data: series,
          });
        }
      }, [series]);
  
      return (<div>
          <label >Dice: </label>
          <input id="dice" type="text" onChange={(e) => setInputText(e.target.value)} value={inputText}></input>
          <button onClick={() => {
            setEngine(parse(inputText))
          }}>Roll</button>
      </div>);
  }

export default InputDiceRoll;