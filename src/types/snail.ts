import { RACE_NAME_KEY } from "components/RaceName";
import { RACE_SPONSOR_LOGO_KEY, RACE_SPONSOR_NAME_KEY } from "components/RaceSponsor";

export interface ISnail {
    name: string;
    color: string;
    number: number;
}

export interface ISnailWithTime extends ISnail {
    time: number;
    bodyAssetNum: number,
}

export type RaceDetails = {
    length: number, 
    [RACE_NAME_KEY]?: string,
    [RACE_SPONSOR_NAME_KEY]?: string,
    [RACE_SPONSOR_LOGO_KEY]?: string,
}