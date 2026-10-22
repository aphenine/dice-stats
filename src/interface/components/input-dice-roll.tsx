import { FC, FormEvent, useState } from "react";
import { ParseError, parse } from "@/roller/parser/parse";
import { sample } from "@/roller/services/sample";
import { typeName } from "@/roller/engine/rollable";
import Series from "../types/series";

interface InputDiceRollProps {
    uniqueId: string;
    addSeries: (series: Series) => void;
}

const DEFAULT_TIMES = 100;

const InputDiceRoll: FC<InputDiceRollProps> = ({ uniqueId, addSeries }) => {
    const [expression, setExpression] = useState("");
    const [timesText, setTimesText] = useState(String(DEFAULT_TIMES));
    const [error, setError] = useState<string | null>(null);

    const roll = (event: FormEvent) => {
        event.preventDefault();

        const times = parseInt(timesText);
        if (!Number.isInteger(times) || times < 1) {
            setError("Times must be a whole number of at least 1");
            return;
        }

        try {
            const engine = parse(expression);
            const data = sample(engine, times).flat();
            setError(null);
            addSeries({
                id: uniqueId,
                label: typeName(engine.type) === "array" ? `${expression} (each die)` : expression,
                data,
            });
        } catch (e) {
            setError(e instanceof ParseError ? e.message : String(e));
        }
    };

    return (
        <form className="m-2" onSubmit={roll}>
            <div className="flex items-center gap-2">
                <label htmlFor={`dice-${uniqueId}`}>Dice:</label>
                <input
                    id={`dice-${uniqueId}`}
                    className="flex-grow border rounded px-2 py-1"
                    type="text"
                    placeholder="e.g. total(remove(4d6, 1))"
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                />
                <input
                    aria-label="Number of rolls"
                    className="w-24 border rounded px-2 py-1"
                    type="number"
                    min={1}
                    value={timesText}
                    onChange={(e) => setTimesText(e.target.value)}
                />
                <span>times</span>
                <button className="border rounded px-3 py-1" type="submit">Roll</button>
            </div>
            {error && <p role="alert" className="text-red-600 mt-1">{error}</p>}
        </form>
    );
};

export default InputDiceRoll;
