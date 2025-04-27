// hooks
import useLocalStorage from "hooks/useLocalStorage";

// styles
import "./styles.css";

export const RACE_NAME_KEY = "raceName";

export const RaceName = () => {
    const [raceName, setRaceName] = useLocalStorage(RACE_NAME_KEY, "");

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        setRaceName(encodeURIComponent(event.target.value));
    };

    return (
        <div className="raceName">
            <h2>Race Name</h2>

            <input type="string" onChange={onChange} value={decodeURIComponent(raceName)} />
        </div>
    );
};