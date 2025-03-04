import { Application, ApplicationOptions, Container, Sprite, Assets, Ticker, Texture, Text } from "pixi.js";
import { CameraContainer, ParallaxChild } from "./cameraContainer";
import { ISnailConfig, Snail } from "./snail";
import { Loadable } from "./loadable";
import { getConfigValue } from "./utils";
import gsap, { Sine } from "gsap";
import seedrandom from "seedrandom";

export interface GameProps {
    snailConfigs: ISnailConfig[],
    raceLength: number,
    randomSeed?: string,
    onComplete?: (finishers: Finisher[]) => void,
};

export type Finisher = {
    snail: ISnailConfig,
    time: number;
}

export class Game {
    private app: Application;
    private stage: Container;

    private snails: Snail[];
    private raceLength: number;
    private raceStarted: boolean;
    private raceComplete: boolean;
    private showResults: boolean;
    private finishLineXPos: number;
    private finishers: Finisher[];

    private cameraContainer: CameraContainer;
    private elapsedMS: number;
    private tickCount: number;
    private tickLengthMS: number;

    private onCompleteCallback?: (finishers: Finisher[]) => void;

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

        this.finishLineXPos = 0; // Updated after the canvas has been created
        this.finishers = [];

        if (props.randomSeed !== undefined) {
            // WARNING: This overrides Math.random!!
            seedrandom(props.randomSeed, { global: true });
        }

        props.snailConfigs.forEach((config) => {
            this.snails.push(new Snail(config));
        });
    }

    public async load() {
        const loadables: Loadable[] = [...this.snails];

        const loadPromises: Promise<void>[] = [];
        loadables.forEach((loadable) => {
            loadPromises.push(loadable.load());
        });

        await Promise.all(loadPromises);

        await Assets.load({ alias: "cloudLayer", src: "./cloudLayer1.png"});
        await Assets.load({ alias: "backgroundMountains", src: "./mountains.png"});
        await Assets.load({ alias: "hills", src: "./hills.png"});
        await Assets.load({ alias: "groundLayer", src: "./groundLayer1.png"});
        await Assets.load({ alias: "cloud1", src: "./cloud1.png"});
        await Assets.load({ alias: "cloud2", src: "./cloud2.png"});
        await Assets.load({ alias: "cloud3", src: "./cloud3.png"});
        await Assets.load({ alias: "cloud4", src: "./cloud4.png"});
        await Assets.load({ alias: "signage", src: "./signage.png"});
        await Assets.load({ alias: "ground", src: "./ground.png"});
        await Assets.load({ alias: "line", src: "./line.png"});
    }

    public init(config?: Partial<ApplicationOptions>) {
        this.app.init({
            resizeTo: window,
            backgroundColor: 0xb7e7fa,
            sharedTicker: true,
            ...config,
        }).then(() => {
            document.body.appendChild(this.app.canvas);

            this.finishLineXPos = this.raceLength + this.app.canvas.width * 0.75;

            this.stage.addChild(this.cameraContainer);

            const backgroundConfig = [
                { textureName: "cloudLayer", zIndex: 0.05, x: "tiled", y: 10 },
                { textureName: "backgroundMountains", zIndex: 0.1, x: "tiled", y: 20, tint: 0xddebe2 },
                { textureName: "hills", zIndex: 0.2, x: "tiled", y: 175, tint: 0xafd6be },
                { textureName: "groundLayer", zIndex: 0.5, x: "tiled", y: 275, tint: 0x7dba68 },
                { textureName: "cloud1", zIndex: 0.11, x: {min: 0, max: (this.cameraContainer.fullWidth + this.app.canvas.width) * 0.11}, y: {min: -25, max: 200}},
                { textureName: "cloud2", zIndex: 0.22, x: {min: 0, max: (this.cameraContainer.fullWidth + this.app.canvas.width) * 0.22}, y: {min: -25, max: 200}},
                { textureName: "cloud3", zIndex: 0.33, x: {min: 0, max: (this.cameraContainer.fullWidth + this.app.canvas.width) * 0.33}, y: {min: -25, max: 200}},
                { textureName: "cloud4", zIndex: 0.44, x: {min: 0, max: (this.cameraContainer.fullWidth + this.app.canvas.width) * 0.44}, y: {min: -25, max: 200}},
                { textureName: "signage", zIndex: 1, x: "tiled", y: 350},
                { textureName: "ground", zIndex: 1, x: "tiled", y: 510},
                { textureName: "line", zIndex: 1, x: 200, y: 510},
                { textureName: "line", zIndex: 1, x: this.finishLineXPos, y: 510},
            ];

            backgroundConfig.forEach((config) => {
                const texture = Texture.from(config.textureName);
                let numSprites = 1;
                if (config.x === "tiled") {
                    numSprites = Math.ceil((this.app.canvas.width / texture.width) + (this.cameraContainer.fullWidth / texture.width) * getConfigValue(config.zIndex));
                }
                
                const child = new ParallaxChild();
                for (let i = 0; i < numSprites; i++) {
                    const sprite = Sprite.from(texture);

                    const xPos = config.x === "tiled" ? sprite.width * i : getConfigValue(config.x as number | {min: number, max: number});
                    sprite.position.set(xPos, getConfigValue(config.y));
                    sprite.tint = config.tint ?? 0xffffff;
                    child.addChild(sprite);
                }

                this.cameraContainer.addChildAtZ(child, getConfigValue(config.zIndex));
            });

            // Add snails to starting line
            this.snails.reverse().forEach((snail, index) => {
                this.cameraContainer.addChildAtZ(snail.create());
                snail.updatePositionBy(130 + index * -10, 400 + index * (300 / this.snails.length), true);
            });

            Ticker.shared.add((ticker: Ticker) => this.update(ticker));

            this.startCountdownText(5, () => this.raceStarted = true);
        });
    }

    private startCountdownText(val: number, callback: () => void) {
        const text = new Text({
            text: val.toString(),
            style: {
                fill: val === 3 ? 0xff0000 : val === 2 ? 0xff8800 : val === 1 ? 0x00ff00 : 0xffffff,
                fontSize: 500,
                fontWeight: "bold",
                stroke: { color: 0x000000, width: 5, join: 'round' },
            }
        });

        text.anchor.set(0.5);
        text.position.set(this.app.canvas.width / 2, this.app.canvas.height / 2);
        this.stage.addChild(text);
        gsap.to(text, {
            duration: 1,
            alpha: 0,
            ease: Sine.easeIn,
        });

        return gsap.fromTo(text.scale, {
            x: 0,
            y: 0,
        }, {
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
            }
        });
    }

    private finishRace() {
        this.showResults = true;

        const text = new Text({
            text: "FIN",
            style: {
                fill: 0xffffff,
                fontSize: 500,
                fontWeight: "bold",
                stroke: { color: 0x000000, width: 5, join: 'round' },
            }
        });

        text.anchor.set(0.5);
        text.position.set(this.app.canvas.width / 2, this.app.canvas.height / 2);
        this.stage.addChild(text);

        console.log("FIN");

        setTimeout(() => {
            console.log("IM FINISHED!!");
            if (this.onCompleteCallback) {
                this.onCompleteCallback(this.finishers);
            }
        }, 3000);
    }

    private update(ticker: Ticker) {
        if (!this.showResults) {
            this.elapsedMS += ticker.elapsedMS;
            this.tickCount += ticker.elapsedMS;
    
            if (this.raceStarted) {
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

                    if (snail.container.originalPosition.x + (snail.container.width / 3) > this.finishLineXPos && !snail.finished) {
                        snail.finished = true;
    
                        this.finishers.push({
                            snail: snail.config,
                            time: this.elapsedMS,
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
                    return prev
                }
                
                return curr;
            }, this.snails[0]);
            this.cameraContainer.moveCameraTo(frontSnail.container.originalPosition.x - (this.app.canvas.width / 2), 0);
        }
    }
}