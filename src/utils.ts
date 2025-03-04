import { Point } from "pixi.js";

export const randomIntBetween = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min) + min);
}

export const randomFloatBetween = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
}

export const randomBool = () => {
    return Math.random() >= 0.5;
}

export const distanceBetween = (pointA: Point, pointB: Point) => {
    return Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2))
}

export const clamp = (val: number, min: number, max: number) => {
    return Math.max(Math.min(val, Math.max(min, max)), Math.min(min, max));
}

export const getConfigValue = (val: number | { min: number, max: number }): number => {
    if (typeof val === "number") {
        return val;
    } else if (typeof val.min === "number" && typeof val.max === "number") {
        return randomFloatBetween(val.min, val.max);
    } else {
        return 1;
    }
}

export const getRandomSeed = () => {
    return Math.random().toString(36).slice(2);
}
