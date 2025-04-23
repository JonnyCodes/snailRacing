import { Point } from "pixi.js";

// types
import { Range } from "types/backgroundConfig";

export const randomIntBetween = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min) + min);
};

export const randomFloatBetween = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
};

export const randomBool = () => {
    return Math.random() >= 0.5;
};

export const distanceBetween = (pointA: Point, pointB: Point) => {
    return Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2));
};

export const clamp = (val: number, min: number, max: number) => {
    return Math.max(Math.min(val, Math.max(min, max)), Math.min(min, max));
};

export const getConfigValue = (val?: number | Range): number => {
    if (typeof val === "number") {
        return val;
    }
    
    if (typeof val?.min === "number" && typeof val?.max === "number") {
        return randomFloatBetween(val.min, val.max);
    }
    
    // Final option
    return 0;
};

export const randomHexColor = () => {
    return "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
};

export const getRandomSeed = () => {
    return Math.random().toString(36).slice(2);
};
