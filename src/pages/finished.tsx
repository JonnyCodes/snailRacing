// libraries
import React from "react";
import { createRoot } from "react-dom/client";

// components
import { Podium } from "components/Podium";

// types
import { ISnailWithTime } from "types/snail";

const App = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const snails = urlParams.get("snails");
    const snailsWithTime: ISnailWithTime[] = JSON.parse(snails!);

    return (
        <React.Fragment>
            <Podium snails={snailsWithTime} />
        </React.Fragment>
    );
};

const domNode = document.getElementById("app");
const root = createRoot(domNode!);
root.render(<App />);
