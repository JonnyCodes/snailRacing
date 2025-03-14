// types
import { ISnailWithTime } from "types/snail";

// components
import { Snail } from "./Snail";

// styles
import "./styles.css";

interface IComponentProps {
    snails: ISnailWithTime[];
}

export const Podium = (props: IComponentProps) => {
    return (
        <div className="podium">
            <div className="podium__place podium__place--first">
                <div className="podium__name">{props.snails[0].name}</div>
                <Snail tint={props.snails[0].color} />
            </div>

            <div className="podium__place podium__place--second">
                <div className="podium__name">{props.snails[1].name}</div>
                <Snail tint={props.snails[1].color} />
            </div>

            <div className="podium__place podium__place--third">
                <div className="podium__name">{props.snails[2].name}</div>
                <Snail tint={props.snails[2].color} />
            </div>
        </div>
    );
};
