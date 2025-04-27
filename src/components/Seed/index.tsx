// utils
import { getRandomSeed } from "../../utils";

// hooks
import useLocalStorage from "hooks/useLocalStorage";

// styles
import "./styles.css";

export const SEED_KEY = "seed";

export const Seed = () => {
    const [seed, setSeed] = useLocalStorage(SEED_KEY, getRandomSeed());

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        setSeed(event.target.value);
    };

    const onRandomise = () => {
        setSeed(getRandomSeed());
    };

    return (
        <div className="seed">
            <h2>Seed</h2>

            <input type="string" onChange={onChange} value={seed} />
            <button onClick={onRandomise}>Randomize</button>
        </div>
    );
};
