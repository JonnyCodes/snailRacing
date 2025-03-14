// hooks
import useLocalStorage from "hooks/useLocalStorage";

// styles
import "./styles.css";

export const RaceLength = () => {
    const [raceLength, setRaceLength] = useLocalStorage("raceLength", 30);

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        setRaceLength(event.target.value);
    };

    return (
        <div className="raceLength">
            <h2>Race length</h2>

            <input id="raceLength" type="range" min="10" max="60" value={raceLength} onChange={onChange} />
        </div>
    );
};
