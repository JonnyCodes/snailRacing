import { Finisher, Game } from "./game";
import { getRandomSeed } from "./utils";

const onComplete = (finishers: Finisher[]) => {
    const urlFinishers = finishers.map((finisher) => {
        return {
            snail: {
                ...finisher.snail,
                name: encodeURIComponent(finisher.snail.name),
                color: encodeURIComponent(finisher.snail.color),
            },
            time: finisher.time,
        };
    });

    window.location.href = `./finished.html?snailsConfig={"snails":${JSON.stringify(urlFinishers)}}`;
};

const urlParams = new URLSearchParams(window.location.search);

const raceLength: number = urlParams.has("length") ? parseInt(urlParams.get("length")!) : 30;
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
