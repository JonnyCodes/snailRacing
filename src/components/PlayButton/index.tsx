// styles
import "./styles.css";

export const PlayButton = () => {
    const onClick = () => {
        const snails = localStorage.getItem("snails")!;
        const seed = JSON.parse(localStorage.getItem("seed")!);
        const raceLength = parseInt(JSON.parse(localStorage.getItem("raceLength")!));

        window.location.href = `./game.html?raceLength=${raceLength}&seed=${seed}&snails=${snails}`;
    };

    return (
        <div className="playButton">
            <button onClick={onClick}>Play</button>
        </div>
    );
};
