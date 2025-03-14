// types
import { ISnail, ISnailWithTime } from "types/snail";

// styles
import "./styles.css";

interface IComponentProps {
    snails: ISnailWithTime[];
}

export const Positions = (props: IComponentProps) => {
    return (
        <div className="positions">
            <ul className="positions__list">
                {props.snails.map((snail: ISnail, index: number) => (
                    <li key={index}>
                        {index}: <span style={{ color: decodeURIComponent(snail.color) }}>{snail.name}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};
