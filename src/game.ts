import { Application, ApplicationOptions, Container, Sprite, Assets, Ticker, Texture, Text, Point, Graphics } from "pixi.js";
import { CameraContainer, ParallaxChild } from "./cameraContainer";
import { Snail } from "./snail";
import { getConfigValue, randomIntBetween } from "./utils";
import gsap, { Sine } from "gsap";
import seedrandom from "seedrandom";

// types
import { ISnail, ISnailWithTime } from "types/snail";
import { BackgroundTexturesConfig } from "types/backgroundConfig";

export interface GameProps {
    snails: ISnail[];
    raceLength: number;
    randomSeed?: string;
    onComplete?: (snails: ISnailWithTime[]) => void;
}

export class Game {
    private app: Application;
    private stage: Container;

    private snails: Snail[];
    private raceLength: number;
    private raceStarted: boolean;
    private raceComplete: boolean;
    private showResults: boolean;
    private finishLineX: number;
    private finishers: ISnailWithTime[];

    private cameraContainer: CameraContainer;
    private elapsedMS: number;
    private tickCount: number;
    private tickLengthMS: number;

    private onCompleteCallback?: (snails: ISnailWithTime[]) => void;

    constructor(props: GameProps) {
        this.app = new Application();
        this.stage = this.app.stage;
        this.snails = [];
        this.raceStarted = false;
        this.raceComplete = false;
        this.showResults = false;
        this.raceLength = props.raceLength * 600;
        this.cameraContainer = new CameraContainer(this.raceLength, window.innerHeight);
        this.elapsedMS = this.tickCount = 0;
        this.tickLengthMS = 1000;

        this.onCompleteCallback = props.onComplete;

        this.finishLineX = 0; // Updated after the canvas has been created
        this.finishers = [];

        if (props.randomSeed !== undefined) {
            // WARNING: This overrides Math.random!!
            seedrandom(props.randomSeed, { global: true });
        }

        props.snails.forEach((config) => {
            this.snails.push(new Snail(config));
        });
    }

    public async load() {
        const loadPromises: Promise<void>[] = [];
        this.snails.forEach((snail) => {
            const rand = randomIntBetween(1, 6);
            loadPromises.push(snail.load(rand));
        });

        loadPromises.push(Assets.load({ alias: "cloudLayer", src: "./cloudLayer1.png" }));
        loadPromises.push(Assets.load({ alias: "backgroundMountains", src: "./mountains.png" }));
        loadPromises.push(Assets.load({ alias: "hills", src: "./hills.png" }));
        loadPromises.push(Assets.load({ alias: "groundLayer", src: "./groundLayer1.png" }));
        loadPromises.push(Assets.load({ alias: "cloud1", src: "./cloud1.png" }));
        loadPromises.push(Assets.load({ alias: "cloud2", src: "./cloud2.png" }));
        loadPromises.push(Assets.load({ alias: "cloud3", src: "./cloud3.png" }));
        loadPromises.push(Assets.load({ alias: "cloud4", src: "./cloud4.png" }));
        loadPromises.push(Assets.load({ alias: "signage", src: "./signage.png" }));
        loadPromises.push(Assets.load({ alias: "track", src: "./track.png" }));

        await Promise.all(loadPromises);
    }

    public init(config?: Partial<ApplicationOptions>) {
        this.app
            .init({
                resizeTo: window,
                backgroundColor: 0xb7e7fa,
                sharedTicker: true,
                ...config,
            })
            .then(() => {
                document.body.appendChild(this.app.canvas);

                const startLineX = 200;
                const trackStartY = 400;
                this.finishLineX = this.raceLength + this.app.canvas.width * 0.75;

                this.stage.addChild(this.cameraContainer);

                const backgroundConfig: BackgroundTexturesConfig[] = [
                    { textureName: "cloudLayer", zIndex: 0.01, x: "tiled", y: 0 },
                    { textureName: "backgroundMountains", zIndex: 0.05, x: "tiled", y: 10, tint: 0xddebe2 },
                    { textureName: "hills", zIndex: 0.075, x: "tiled", y: 100, tint: 0xafd6be },
                    { textureName: "groundLayer", zIndex: 0.1, x: "tiled", y: 175, tint: 0x7dba68 },
                    {
                        textureName: "cloud1",
                        zIndex: 0.11,
                        x: { min: 0, max: (this.cameraContainer.fullWidth + this.app.canvas.width) * 0.11 },
                        y: { min: -25, max: 200 },
                    },
                    {
                        textureName: "cloud2",
                        zIndex: 0.22,
                        x: { min: 0, max: (this.cameraContainer.fullWidth + this.app.canvas.width) * 0.22 },
                        y: { min: -25, max: 200 },
                    },
                    {
                        textureName: "cloud3",
                        zIndex: 0.33,
                        x: { min: 0, max: (this.cameraContainer.fullWidth + this.app.canvas.width) * 0.33 },
                        y: { min: -25, max: 200 },
                    },
                    {
                        textureName: "cloud4",
                        zIndex: 0.44,
                        x: { min: 0, max: (this.cameraContainer.fullWidth + this.app.canvas.width) * 0.44 },
                        y: { min: -25, max: 200 },
                    },
                    { textureName: "signage", zIndex: 1, x: "tiled", y: trackStartY - 160 },
                    { textureName: "track", zIndex: 1, x: "tiled", y: "tiled", offsetY: trackStartY },
                ];

                backgroundConfig.forEach((config) => {
                    const texture = Texture.from(config.textureName);
                    let numSprites = new Point(1);
                    if (config.x === "tiled") {
                        numSprites.x = Math.ceil(
                            this.app.canvas.width / texture.width +
                                (this.cameraContainer.fullWidth / texture.width) * getConfigValue(config.zIndex)
                        ) + 1; // Add 1 to make sure there is always enough sprites off the end of the screen
                    }

                    if (config.y === "tiled") {
                        numSprites.y = Math.ceil(
                            this.app.canvas.height / texture.height +
                                (this.cameraContainer.fullHeight / texture.height) * getConfigValue(config.zIndex)
                        ) + 1; // Add 1 to make sure there are aleays enough sprites off the bottom of the screen
                    }

                    const child = new ParallaxChild();
                    for (let x = 0; x < numSprites.x; x++) {
                        const sprite = Sprite.from(texture);

                        const xPos =
                            config.x === "tiled"
                                ? sprite.width * x
                                : getConfigValue(config.x);
                        
                        if (config.y === "tiled") {
                            sprite.position.set(xPos + getConfigValue(config.offsetX), getConfigValue(config.offsetY));
                            sprite.tint = config.tint ?? 0xffffff;
                            child.addChild(sprite);

                            /// Start at 1, done the top one above
                            for (let y = 1; y < numSprites.y; y++) {
                                const ySprite = Sprite.from(texture);

                                const yPos = sprite.height * y;

                                ySprite.position.set(xPos + getConfigValue(config.offsetX), yPos + getConfigValue(config.offsetY));
                                ySprite.tint = config.tint ?? 0xffffff;
                                child.addChild(ySprite);
                            }
                        } else {
                            const yPos = getConfigValue(config.y);

                            sprite.position.set(xPos + getConfigValue(config.offsetX), yPos + getConfigValue(config.offsetY));
                            sprite.tint = config.tint ?? 0xffffff;
                            child.addChild(sprite);
                        }
                    }

                    this.cameraContainer.addChildAtZ(child, getConfigValue(config.zIndex));
                });

                // Add start line
                const startLine = new ParallaxChild();
                const startGraphics = new Graphics()
                .moveTo(startLineX + 150, trackStartY)
                .lineTo(startLineX + 100, this.app.canvas.height)
                .stroke({ color: 0xffffff, width: 10 });
                startLine.addChild(startGraphics);
                this.cameraContainer.addChildAtZ(startLine, 1);

                // Add finish line
                const finishLine = new ParallaxChild();
                const finishGraphics = new Graphics()
                .moveTo(this.finishLineX, trackStartY)
                .lineTo(this.finishLineX + 100, this.app.canvas.height)
                .stroke({ color: 0xffffff, width: 10 });
                finishLine.addChild(finishGraphics);
                this.cameraContainer.addChildAtZ(finishLine, 1);

                // Add snails to starting line
                this.snails.reverse().forEach((snail, index) => {
                    this.cameraContainer.addChildAtZ(snail.create());
                    snail.updatePositionBy((startLineX - 50) + index * -10, (trackStartY - snail.container.height * 0.8) + index * ((this.app.canvas.height - trackStartY) / this.snails.length), true);
                });

                Ticker.shared.add((ticker: Ticker) => this.update(ticker));

                this.startCountdownText(5, () => (this.raceStarted = true));
            });
    }

    private startCountdownText(val: number, callback: () => void) {
        const text = new Text({
            text: val.toString(),
            style: {
                fill: val === 3 ? 0xff0000 : val === 2 ? 0xff8800 : val === 1 ? 0x00ff00 : 0xffffff,
                fontSize: 500,
                fontWeight: "bold",
                stroke: { color: 0x000000, width: 5, join: "round" },
            },
        });

        text.anchor.set(0.5);
        text.position.set(this.app.canvas.width / 2, this.app.canvas.height / 2);
        this.stage.addChild(text);
        gsap.to(text, {
            duration: 1,
            alpha: 0,
            ease: Sine.easeIn,
        });

        return gsap.fromTo(
            text.scale,
            {
                x: 0,
                y: 0,
            },
            {
                duration: 1,
                x: 1,
                y: 1,
                ease: Sine.easeOut,
                onComplete: () => {
                    this.stage.removeChild(text);

                    if (val === 1) {
                        callback();
                    } else {
                        this.startCountdownText(val - 1, callback);
                    }
                },
            }
        );
    }

    private finishRace() {
        this.showResults = true;

        const text = new Text({
            text: "FIN",
            style: {
                fill: 0xffffff,
                fontSize: 500,
                fontWeight: "bold",
                stroke: { color: 0x000000, width: 5, join: "round" },
            },
        });

        text.anchor.set(0.5);
        text.position.set(this.app.canvas.width / 2, this.app.canvas.height / 2);
        this.stage.addChild(text);

        setTimeout(() => {
            if (this.onCompleteCallback) {
                this.onCompleteCallback(this.finishers);
            }
        }, 2000);
    }

    private update(ticker: Ticker) {
        if (!this.showResults) {
            this.tickCount += ticker.elapsedMS;

            if (this.raceStarted) {
                this.elapsedMS += ticker.elapsedMS;
                if (this.tickCount > this.tickLengthMS) {
                    this.tickCount = 0;

                    this.snails.forEach((snail) => {
                        snail.changeSpeed();
                    });
                }

                // TODO: Need a catch-up mechanic for snails at the back and a slow down mechanic for snails far ahead
                // These should be rare events

                this.snails.forEach((snail: Snail) => {
                    snail.update(ticker.deltaTime);

                    if (
                        snail.container.originalPosition.x + snail.container.width / 3 > this.finishLineX &&
                        !snail.finished
                    ) {
                        snail.finished = true;

                        this.finishers.push({
                            ...snail.config,
                            time: this.elapsedMS,
                            bodyAssetNum: snail.bodyAssetNum,
                        });

                        if (!this.raceComplete && this.finishers.length === this.snails.length) {
                            this.raceComplete = true;
                            setTimeout(() => this.finishRace(), 2000);
                        }
                    }
                });
            }

            // Follow the snail in front
            const frontSnail = this.snails.reduce((prev: Snail, curr: Snail) => {
                if (prev.container.originalPosition.x >= curr.container.originalPosition.x) {
                    return prev;
                }

                return curr;
            }, this.snails[0]);
            this.cameraContainer.moveCameraTo(frontSnail.container.originalPosition.x - this.app.canvas.width / 2, 0);
        }
    }
}
