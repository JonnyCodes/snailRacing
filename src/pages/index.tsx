// libraries
import React from "react";
import { createRoot } from "react-dom/client";

// components
import { Seed } from "components/Seed";
import { Snails } from "components/Snails";
import { RaceLength } from "components/RaceLength";
import { PlayButton } from "components/PlayButton";

const App = () => {
    return (
        <React.Fragment>
            <RaceLength />
            <Seed />
            <Snails />
            <PlayButton />
        </React.Fragment>
    );
};

const domNode = document.getElementById("app");
const root = createRoot(domNode!);
root.render(<App />);
