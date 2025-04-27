// styles
import "./styles.css";

import { RACE_NAME_KEY } from "components/RaceName";
import { RACE_LENGTH_KEY } from "components/RaceLength";
import { SEED_KEY } from "components/Seed";
import { SNAILS_KEY } from "components/Snails";
import { RACE_SPONSOR_NAME_KEY, RACE_SPONSOR_LOGO_KEY } from "components/RaceSponsor";

export const PlayButton = () => {
    const onClick = () => {
        const urlParams: any = {
            [RACE_LENGTH_KEY]: parseInt(JSON.parse(localStorage.getItem(RACE_LENGTH_KEY)!))!,
            [RACE_NAME_KEY]: JSON.parse(localStorage.getItem(RACE_NAME_KEY)!),
            [RACE_SPONSOR_NAME_KEY]: JSON.parse(localStorage.getItem(RACE_SPONSOR_NAME_KEY)!),
            [RACE_SPONSOR_LOGO_KEY]: JSON.parse(localStorage.getItem(RACE_SPONSOR_LOGO_KEY)!),
            [SEED_KEY]: JSON.parse(localStorage.getItem(SEED_KEY)!),
            [SNAILS_KEY]: localStorage.getItem(SNAILS_KEY)!,
        }

        let url = "./game.html?" + Object.entries(urlParams).filter(([_, val]) => !!val).map(([key, val]) => { return `${key}=${val}` }).join("&");

        window.location.href = url;
    };

    return (
        <div className="playButton">
            <button onClick={onClick}>Play</button>
        </div>
    );
};
