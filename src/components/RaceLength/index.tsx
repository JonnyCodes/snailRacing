// hooks
import useLocalStorage from "hooks/useLocalStorage";

// styles
import "./styles.css";

export const RACE_LENGTH_KEY = "raceLength";

export const RaceLength = () => {
    const [raceLength, setRaceLength] = useLocalStorage(RACE_LENGTH_KEY, 30);

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        setRaceLength(event.target.value);
    };

    return (
        <div className="raceLength">
            <h2>Race length</h2>

            <input id="raceLength" name="raceLength" type="range" min="10" max="60" value={raceLength} onChange={onChange} />
            <output>~{raceLength} seconds</output>
        </div>
    );
};
