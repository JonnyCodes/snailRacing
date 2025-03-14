import { Assets, Sprite, Text } from "pixi.js";
import { Loadable } from "./loadable";
import { ParallaxChild } from "./cameraContainer";
import gsap, { Sine } from "gsap";
import { randomIntBetween, clamp } from "./utils";

// types
import { ISnail } from "types/snail";

export class Snail extends Loadable {
    private static MIN_SPEED = 6;
    private static MAX_SPEED = 20;

    public finished: boolean;

    private _snail: ISnail;
    private _container: ParallaxChild;
    private _speedTween?: gsap.core.Tween;
    private _speed: number;
    private _currentMaxSpeed: number;

    get container(): ParallaxChild {
        return this._container;
    }

    get config(): ISnail {
        return this._snail;
    }

    constructor(snail: ISnail) {
        super();

        this._snail = snail;
        this._speed = randomIntBetween(Snail.MIN_SPEED, Snail.MAX_SPEED);
        this._currentMaxSpeed =
            Snail.MAX_SPEED -
            (this._speed >= (Snail.MAX_SPEED + Snail.MIN_SPEED) / 2
                ? this._speed - (Snail.MAX_SPEED + Snail.MIN_SPEED) / 2
                : 0);
        this._container = new ParallaxChild();

        this.finished = false;
    }

    public async load(): Promise<void> {
        super.load();

        await Assets.load({ alias: "snail", src: "./snail.png" });
    }

    public create(): ParallaxChild {
        super.create();

        const sprite = Sprite.from("snail");
        this._container.addChild(sprite);

        const number = new Text({
            text: this._snail.number,
            style: {
                fill: this._snail.color,
                fontSize: 75,
                fontWeight: "bold",
                stroke: { color: 0x000000, width: 5, join: "round" },
            },
        });
        number.position.set(20, 20);
        this._container.addChild(number);

        return this._container;
    }

    public updatePositionBy(x: number, y: number, updateAllPositions = false) {
        this._container.updateOriginalPosition(x, y);

        if (updateAllPositions) {
            this._container.position.copyFrom(this._container.originalPosition);
        }
    }

    public changeSpeed() {
        if (this._speedTween !== undefined) {
            this._speedTween.kill();
            this._speedTween = undefined;
        }

        const newSpeed = randomIntBetween(Snail.MIN_SPEED, this._currentMaxSpeed);

        if (newSpeed >= (Snail.MAX_SPEED + Snail.MIN_SPEED) / 2) {
            // Decrease the max speed by 3 * the difference between the midpoint and thier current speed
            // The faster a snail is going the more their speed will decrease
            this._currentMaxSpeed -= 3 * (this._speed - (Snail.MAX_SPEED + Snail.MIN_SPEED) / 2);
        } else {
            // Increase the max speed again slowly, while they recover stamina
            this._currentMaxSpeed += 1;
        }

        this._currentMaxSpeed = clamp(this._currentMaxSpeed, Snail.MIN_SPEED, Snail.MAX_SPEED);

        gsap.to(this, {
            duration: 0.75,
            _speed: newSpeed,
            ease: Sine.easeIn,
        });
    }

    public update(deltaTime: number) {
        this.updatePositionBy(this._speed * deltaTime, 0);
    }
}
