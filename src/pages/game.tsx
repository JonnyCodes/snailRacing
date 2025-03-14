// libraries
import React from "react";
import { createRoot } from "react-dom/client";

// components
import { Positions } from "components/Positions";

const App = () => {
    return (
        <React.Fragment>
            <Positions />
        </React.Fragment>
    );
};

const domNode = document.getElementById("app");
const root = createRoot(domNode!);
root.render(<App />);
