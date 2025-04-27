import { ISnailWithTime } from "types/snail";
import { Game } from "./game";
import { getRandomSeed } from "./utils";
import { RACE_SPONSOR_LOGO_KEY, RACE_SPONSOR_NAME_KEY } from "components/RaceSponsor";
import { RACE_NAME_KEY } from "components/RaceName";
import { RACE_LENGTH_KEY } from "components/RaceLength";
import { SEED_KEY } from "components/Seed";
import { SNAILS_KEY } from "components/Snails";

const onComplete = (snails: ISnailWithTime[], sponsorLogo?: string) => {
    const urlSnails = snails.map((snail) => {
        return {
            ...snail,
            name: encodeURIComponent(snail.name),
            color: encodeURIComponent(snail.color),
            time: snail.time,
        };
    });

    let url = `./finished.html?snails=${JSON.stringify(urlSnails)}`;

    if (sponsorLogo) {
        url += `?${RACE_SPONSOR_LOGO_KEY}=${sponsorLogo}`
    }

    window.location.href = url;
};

const urlParams = new URLSearchParams(window.location.search);

const raceName: string | null = urlParams.get(RACE_NAME_KEY);
const raceSponsorName: string | null = urlParams.get(RACE_SPONSOR_NAME_KEY);
const raceSponsorLogo: string | null = urlParams.get(RACE_SPONSOR_LOGO_KEY);
const randomSeed: string | null = urlParams.get(SEED_KEY);
const raceLength: number = urlParams.has(RACE_LENGTH_KEY) ? parseInt(urlParams.get(RACE_LENGTH_KEY)!) : 30;
const snails = urlParams.has(SNAILS_KEY)
    ? urlParams.get(SNAILS_KEY)!
    : '[{ "name": "Foo", "color": "#ff0000", "number": 1 }]';

const game = new Game({
    raceName,
    raceSponsorName,
    raceSponsorLogo,
    raceLength,
    randomSeed,
    snails: JSON.parse(snails),
    onComplete,
});
game.load().then(() => {
    game.init();
});
