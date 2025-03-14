// styles
import "./styles.css";

export const PlayButton = () => {
    const onClick = () => {
        const snails = localStorage.getItem("snails");
        const seed = localStorage.getItem("seed");
        const raceLength = localStorage.getItem("raceLength");

        window.location.href = `/game.html?raceLength=${raceLength}&seed=${seed}&snails=${snails}`;
    };

    return (
        <div className="playButton">
            <button onClick={onClick}>Play</button>
        </div>
    );
};
