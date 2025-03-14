export interface ISnail {
    name: string;
    color: string;
    number: number;
}

export interface ISnailWithTime extends ISnail {
    time: number;
}
