// libraries
import React from "react";
import { createRoot } from "react-dom/client";
import { FinishTable } from "components/FinishTable";
import { RACE_NAME_KEY } from "components/RaceName";
import { Podium } from "components/Podium";

// types
import { ISnailWithTime } from "types/snail";
import { RACE_SPONSOR_LOGO_KEY, RACE_SPONSOR_NAME_KEY } from "components/RaceSponsor";


// vvvvvvvv Render the results and sponsor images vvvvvvvvvv
const App = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const snails = urlParams.get("snails");
    const snailsWithTime: ISnailWithTime[] = JSON.parse(snails!);
    const raceName = urlParams.get(RACE_NAME_KEY);
    const raceSponsorName = urlParams.get(RACE_SPONSOR_NAME_KEY);
    const raceSponsorLogo = urlParams.get(RACE_SPONSOR_LOGO_KEY);

    return (
        <React.Fragment>
            {(raceName || raceSponsorName || raceSponsorLogo) &&
                <div id="raceDetails">
                    <div id="nameAndSponsor">
                        {raceName && <h1>{raceName}</h1>}
                        {raceSponsorName && <h2>{raceSponsorName}</h2>}
                    </div>
                    {raceSponsorLogo && <img src={raceSponsorLogo} />}
                    <br />
                    <hr />
                    <br />
                </div>
            }
            <div id="podiumAndTable">
                <Podium snails={snailsWithTime}/>
                <FinishTable snails={snailsWithTime}/>
            </div>
        </React.Fragment>
    );
};

const domNode = document.getElementById("results");
const root = createRoot(domNode!);
root.render(<App />);