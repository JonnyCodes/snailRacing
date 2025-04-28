import { ISnailWithTime } from "types/snail";

// styles
import "./styles.css";

export const FinishTable = (props: { snails: ISnailWithTime[]}) => {
    return (
        <div id="finishTable">
            <ul>
                {props.snails.map((snail, index) => {
                    return <li key={snail.number}><span className="placeAndName">{index + 1}: {snail.name}</span><span className="time">{(snail.time / 1000).toFixed(3)}</span></li>
                })}
            </ul>
        </div>
    );
};
