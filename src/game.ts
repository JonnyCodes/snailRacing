import { Application, ApplicationOptions, Container, Sprite, Assets, Ticker, Texture, Text, Point, Graphics, RenderTexture } from "pixi.js";
import { CameraContainer, ParallaxChild } from "./cameraContainer";
import { Snail } from "./snail";
import { getConfigValue, randomIntBetween } from "./utils";
import gsap, { Sine } from "gsap";
import seedrandom from "seedrandom";

// types
import { ISnail, ISnailWithTime, RaceDetails } from "types/snail";
import { BackgroundTexturesConfig } from "types/backgroundConfig";

export interface GameProps {
    snails: ISnail[];
    raceLength: number;
    raceName: string | null;
    raceSponsorName: string | null;
    raceSponsorLogo: string | null;
    randomSeed: string | null;
    onComplete?: (snails: ISnailWithTime[], raceDetails: RaceDetails) => void;
}

export class Game {
    private app: Application;
    private stage: Container;

    private snails: Snail[];
    private raceDetails: RaceDetails;
    private raceStarted: boolean;
    private raceComplete: boolean;
    private showResults: boolean;
    private finishLineX: number;
    private finishers: ISnailWithTime[];

    private cameraContainer: CameraContainer;
    private elapsedMS: number;
    private tickCount: number;
    private tickLengthMS: number;

    private onCompleteCallback?: (snails: ISnailWithTime[], raceDetails: RaceDetails) => void;

    constructor(props: GameProps) {
        this.app = new Application();
        this.stage = this.app.stage;
        this.snails = [];
        this.raceStarted = false;
        this.raceComplete = false;
        this.showResults = false;
        this.raceDetails = {
            length: props.raceLength * 600,
            raceName: props.raceName || undefined,
            raceSponsorName: props.raceSponsorName || undefined,
            raceSponsorLogo: props.raceSponsorLogo || undefined,
        };
        this.cameraContainer = new CameraContainer(this.raceDetails.length, window.innerHeight);
        this.elapsedMS = this.tickCount = 0;
        this.tickLengthMS = 1000;

        this.onCompleteCallback = props.onComplete;

        this.finishLineX = 0; // Updated after the canvas has been created
        this.finishers = [];

        if (props.randomSeed !== null) {
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

        // Load the signage font
        loadPromises.push(Assets.load({ alias: "Super Lobster", src: "./super_lobster.ttf" }));

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
                this.finishLineX = this.raceDetails.length + this.app.canvas.width * 0.75;

                this.stage.addChild(this.cameraContainer);

                const backgroundConfig: BackgroundTexturesConfig[] = [
                    { textureName: "cloudLayer", zIndex: 0.01, x: "tiled", y: 0 },
                    { textureName: "backgroundMountains", zIndex: 0.05, x: "tiled", y: 10, tint: 0xddebe2 },

                    {
                        textureName: "cloud1",
                        zIndex: 0.02,
                        x: { min: 0, max: (this.cameraContainer.fullWidth + this.app.canvas.width) * 0.02 },
                        y: { min: -50, max: 100 },
                    },
                    {
                        textureName: "cloud2",
                        zIndex: 0.06,
                        x: { min: 0, max: (this.cameraContainer.fullWidth + this.app.canvas.width) * 0.06 },
                        y: { min: -50, max: 100 },
                    },

                    { textureName: "hills", zIndex: 0.075, x: "tiled", y: 100, tint: 0xafd6be },

                    {
                        textureName: "cloud3",
                        zIndex: 0.08,
                        x: { min: 0, max: (this.cameraContainer.fullWidth + this.app.canvas.width) * 0.08 },
                        y: { min: -50, max: 100 },
                    },
                    {
                        textureName: "cloud4",
                        zIndex: 0.15,
                        x: { min: 0, max: (this.cameraContainer.fullWidth + this.app.canvas.width) * 0.15 },
                        y: { min: -50, max: 100 },
                    },

                    { textureName: "groundLayer", zIndex: 0.1, x: "tiled", y: 175, tint: 0x7dba68 },
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

                // Add race name and sponsor banners
                if (this.raceDetails.raceName || this.raceDetails.raceSponsorName) {

                    // This text object is used to measure the text and make calculations
                    const raceNameText = new Text({
                        text: `${this.raceDetails.raceName ?? ""}${!!this.raceDetails.raceName && !!this.raceDetails.raceSponsorName ? " sponsored by " : ""}${this.raceDetails.raceSponsorName ?? ""}`,
                        style: {
                            fill: 0xdddddd,
                            fontFamily: "Super Lobster",
                            fontSize: 120,
                            fontWeight: "bold",
                            stroke: { color: 0x004225, width: 10, join: "round" },
                        },
                    });
                    
                    const raceName = new ParallaxChild();
                    const numBanners = Math.floor(this.finishLineX / (raceNameText.width * 2));
                    for (let i = 1; i < numBanners + 1; i++) {
                        const text = new Text({
                            text: raceNameText.text,
                            style: raceNameText.style
                        });

                        text.position.set(((this.finishLineX / (numBanners + 1)) * i) - (text.width / 2), 235);
                        raceName.addChild(text);
                    }
                    this.cameraContainer.addChildAtZ(raceName, 1);
                }

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

                Ticker.shared.add((ticker: Ticker) => this.update(ticker));

                //Create the snails ready for showSnailsUI
                this.snails.forEach((snail) => snail.create());

                this.showSnailsUI();

                // Position snails to starting line
                // This is done after showSnailsUI, because we want to be able to position the snails for the renderTexture
                this.snails.reverse().forEach((snail, index) => {
                    this.cameraContainer.addChildAtZ(snail.container);
                    snail.updatePositionBy((startLineX - 50) + index * -10, (trackStartY - snail.container.height * 0.8) + index * ((this.app.canvas.height - trackStartY) / this.snails.length), true);
                });
            });
    }

    private showSnailsUI() {
        const fadeOut = new Graphics()
            .rect(0, 0, this.app.canvas.width, this.app.canvas.height)
            .fill({color: 0x000000, alpha: 0.66})
        this.stage.addChild(fadeOut);

        const uiBackground = new Graphics()
            .roundRect(0, 0, (this.app.canvas.width / 4) * 2, 700, 15)
            .stroke({ color: 0x000000, width: 6 })
            .fill(0xabc1d4);
        uiBackground.position.set(this.app.canvas.width / 4, 100);
        this.stage.addChild(uiBackground);

        const renderTexture = RenderTexture.create({ width: (this.snails[0].container.width + 50) * this.snails.length, height: this.snails[0].container.height + 50, scaleMode: "linear" })
        for (let i = 0 ; i < this.snails.length; i++) {
            const snail = this.snails[i];
            snail.container.position.set((snail.container.width + 50) * i, 0);

            const snailName = new Text({
                text: snail.config.name,
                style: {
                    fill: 0xffffff,
                    fontFamily: "Super Lobster",
                    fontSize: 30,
                    stroke: { color: 0x000000, width: 4, join: "round" },
                }
            });
            snailName.position.set(snail.container.x + ((snail.container.width - snailName.width) / 2), snail.container.y + snail.container.height + 5);
            
            this.app.renderer.render({
                container: snail.container,
                target: renderTexture,
                clear: false
            });
            this.app.renderer.render({
                container: snailName,
                target: renderTexture,
                clear: false
            });
        }

        let slideShowIndex = 0;
        const snailSlideShow = Sprite.from(renderTexture);
        snailSlideShow.scale.set(1.5);
        snailSlideShow.position.set(uiBackground.x + ((uiBackground.width - (this.snails[0].container.width * 1.5)) / 2), uiBackground.y + 100)
        this.stage.addChild(snailSlideShow);

        const snailSlideShowMask = new Graphics()
            .roundRect(uiBackground.x + ((uiBackground.width - (this.snails[0].container.width * 1.5)) / 2), uiBackground.y + 100, (this.snails[0].container.width * 1.5) + 10, snailSlideShow.height)
            .fill(0xffffff);
        snailSlideShow.mask = snailSlideShowMask;

        const rightButton = new Graphics()
            .roundPoly(0, 0, 100, 3, 10, Math.PI / 2)
            .stroke({color: 0x000000, width: 6})
            .fill(0x1fdea8);
        rightButton.scale.x = 0.6;
        rightButton.position.set(snailSlideShow.x + 450, uiBackground.y + 250);
        rightButton.interactive = true;
        rightButton.cursor = "hand";
        this.stage.addChild(rightButton);

        rightButton.onclick = () => {
            slideShowIndex++;
            snailSlideShow.position.x = uiBackground.x + ((uiBackground.width - (this.snails[0].container.width * 1.5)) / 2) - (slideShowIndex * ((this.snails[0].container.width + 50) * 1.5))

            if (slideShowIndex < this.snails.length - 1) {
                rightButton.interactive = true;
                rightButton.alpha = 1;
            } else {
                rightButton.interactive = false;
                rightButton.alpha = 0.1;
            }

            if (slideShowIndex > 0) {
                leftButton.interactive = true;
                leftButton.alpha = 1;
            } else {
                leftButton.interactive = false;
                leftButton.alpha = 0.1;
            }
        }

        const leftButton = new Graphics()
            .roundPoly(0, 0, 100, 3, 10, Math.PI / 2)
            .stroke({color: 0x000000, width: 6})
            .fill(0x1fdea8);
            leftButton.scale.x = -0.6;
            leftButton.position.set(snailSlideShow.x - 175, uiBackground.y + 250);
            leftButton.interactive = false;
            leftButton.alpha = 0.1;
            leftButton.cursor = "hand";
        this.stage.addChild(leftButton);

        leftButton.onclick = () => {
            slideShowIndex--;
            snailSlideShow.position.x = uiBackground.x + ((uiBackground.width - (this.snails[0].container.width * 1.5)) / 2) - (slideShowIndex * ((this.snails[0].container.width + 50) * 1.5))

            if (slideShowIndex > 0) {
                leftButton.interactive = true;
                leftButton.alpha = 1;
            } else {
                leftButton.interactive = false;
                leftButton.alpha = 0.1;
            }

            if (slideShowIndex <= this.snails.length - 1) {
                rightButton.interactive = true;
                rightButton.alpha = 1;
            } else {
                rightButton.interactive = false;
                rightButton.alpha = 0.1;
            }
        }

        const startRaceButton = new Container();
        const buttonBackground = new Graphics()
            .roundRect(0, 0, 300, 50, 10)
            .stroke({color: 0x000000, width: 6})
            .fill(0x1fdea8)
        startRaceButton.position.set(uiBackground.x + ((uiBackground.width - buttonBackground.width) / 2), uiBackground.height)
        startRaceButton.addChild(buttonBackground);
        const startText = new Text({
            text: "Start Race",
            style: {
                fill: 0x000000,
                fontFamily: "Super Lobster",
                fontSize: 30,
            },
        });
        startText.position.set((buttonBackground.width - startText.width) / 2, 7);
        startRaceButton.addChild(startText)
        startRaceButton.interactive = true;
        startRaceButton.cursor = "hand";
        this.stage.addChild(startRaceButton);

        startRaceButton.onclick = () => {
            const itemsToDestroy = [fadeOut, uiBackground, startRaceButton, snailSlideShowMask, snailSlideShow, leftButton, rightButton];
            this.stage.removeChild(...itemsToDestroy);

            itemsToDestroy.forEach((item) => item.destroy());

            this.startCountdownText(5, () => (this.raceStarted = true));
        }
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

        setTimeout(() => {
            if (this.onCompleteCallback) {
                this.onCompleteCallback(this.finishers, this.raceDetails);
            }
        }, 250);
    }

    private update(ticker: Ticker) {
        if (!this.showResults) {

            if (this.raceStarted) {
                this.elapsedMS += ticker.elapsedMS;
                this.tickCount += ticker.elapsedMS;

                // Every tick (tickLengthMS) change the snails speed
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
                            setTimeout(() => this.finishRace(), 1250);
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
