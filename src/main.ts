import { ISnailWithTime } from "types/snail";
import { Game } from "./game";
import { getRandomSeed } from "./utils";

const onComplete = (snails: ISnailWithTime[]) => {
    const urlSnails = snails.map((snail) => {
        return {
            ...snail,
            name: encodeURIComponent(snail.name),
            color: encodeURIComponent(snail.color),
            time: snail.time,
        };
    });

    window.location.href = `./finished.html?snails=${JSON.stringify(urlSnails)}`;
};

const urlParams = new URLSearchParams(window.location.search);

const raceLength: number = urlParams.has("raceLength") ? parseInt(urlParams.get("raceLength")!) : 30;
const randomSeed: string = urlParams.has("seed") ? urlParams.get("seed")! : getRandomSeed();
const snails = urlParams.has("snails")
    ? urlParams.get("snails")!
    : '[{ "name": "Foo", "color": "#ff0000", "number": 1 }]';

const game = new Game({
    raceLength: raceLength,
    randomSeed: randomSeed,
    snails: JSON.parse(snails),
    onComplete,
});
game.load().then(() => {
    game.init();
});
