export type Range = {
    min: number,
    max: number
}

export type BackgroundTexturesConfig = {
    textureName: string,
    zIndex: number,
    x: "tiled" | number | Range,
    y: "tiled" | number | Range,
    offsetX?: number,
    offsetY?: number,
    tint?: number,
}