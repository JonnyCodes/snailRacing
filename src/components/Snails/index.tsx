// libraries
import { useState } from "react";

// hooks
import useLocalStorage from "hooks/useLocalStorage";

// utils
import { randomHexColor } from "../../utils";

// types
import { ISnail } from "types/snail";

// styles
import "./styles.css";

export const SNAILS_KEY = "snails";

export const Snails = () => {
    const [snails, setSnails] = useLocalStorage(SNAILS_KEY, []);

    const [name, setName] = useState("");
    const [colour, setColour] = useState(randomHexColor());

    const addSnail = (name: string, colour: string) => {
        const newSnail: ISnail = {
            name: name.length ? encodeURIComponent(name) : encodeURIComponent(`Snail ${snails.length + 1}`),
            color: encodeURIComponent(colour),
            number: snails.length + 1,
        };

        setSnails([...snails, newSnail]);

        // Reset field values
        setName("");
        setColour(randomHexColor());
    };

    const removeSnail = (number: number) => {
        const newSnails = snails.filter((snail: ISnail) => snail.number !== number);

        // redo the snail numbers, in case one was removed from the middle
        newSnails.forEach((snail: ISnail, index: number) => {
            snail.number = index + 1;
        });

        setSnails(newSnails);
    };

    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const onColourChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setColour(event.target.value);
    };

    const isDisabled = snails.length >= 8;

    return (
        <div className="snails">
            <h2>Snails</h2>

            <div className="snails__add">
                <input type="text" placeholder="Name" onChange={onNameChange} value={name} />
                <input type="color" onChange={onColourChange} value={colour} />

                <button disabled={isDisabled} onClick={() => addSnail(name, colour)}>
                    Add snail
                </button>
            </div>

            <ul className="snails__list">
                {snails.map((snail: ISnail) => (
                    <li key={snail.number}>
                        {snail.number}: <span style={{ color: decodeURIComponent(snail.color) }}>{decodeURIComponent(snail.name)}</span>{" "}
                        <span className="snails__list__delete" onClick={() => removeSnail(snail.number)}>
                            X
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};
