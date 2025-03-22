import { Assets, Buffer, MeshPlane, Sprite, Text } from "pixi.js";
import { ParallaxChild } from "./cameraContainer";
import gsap, { Sine } from "gsap";
import { randomIntBetween, clamp } from "./utils";

// types
import { ISnail } from "types/snail";

export class Snail {
    private static MIN_SPEED = 6;
    private static MAX_SPEED = 20;

    public finished: boolean;

    private _snail: ISnail;
    private _bodyAssetAlias: string;
    private _container: ParallaxChild;
    private _speedTween?: gsap.core.Tween;
    private _speed: number;
    private _currentMaxSpeed: number;
    private _meshBuffer!: Buffer;
    private _animationTimer: number;

    get container(): ParallaxChild {
        return this._container;
    }

    get config(): ISnail {
        return this._snail;
    }

    constructor(snail: ISnail) {
        this._snail = snail;
        this._bodyAssetAlias = "snailBody1"
        this._speed = randomIntBetween(Snail.MIN_SPEED, Snail.MAX_SPEED);
        this._currentMaxSpeed =
            Snail.MAX_SPEED -
            (this._speed >= (Snail.MAX_SPEED + Snail.MIN_SPEED) / 2
                ? this._speed - (Snail.MAX_SPEED + Snail.MIN_SPEED) / 2
                : 0);
        this._container = new ParallaxChild();
        this._animationTimer = 0;

        this.finished = false;
    }

    // Random number to say which asset to load
    public async load(randAsset: number): Promise<void> {
        this._bodyAssetAlias = `snailBody${randAsset}`;
        await Assets.load({ alias: this._bodyAssetAlias, src: `./snail_body${randAsset}.png` });
        await Assets.load({ alias: "snailShell", src: "./snail_shell1.png" });
    }

    public create(): ParallaxChild {
        const shell = Sprite.from("snailShell");
        shell.tint = this._snail.color;
        shell.position.set(0, 30);
        this._container.addChild(shell);

        const body = new MeshPlane({ texture: Assets.get(this._bodyAssetAlias), verticesX: 10, verticesY: 10 });
        this._container.addChild(body);
        this._meshBuffer = body.geometry.getAttribute('aPosition').buffer;

        const number = new Text({
            text: this._snail.number,
            style: {
                fill: 0xffffff,
                fontSize: 75,
                fontWeight: "bold",
                stroke: { color: 0x000000, width: 10, join: "round" },
            },
        });
        number.position.set(30, 35);
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

        this._speedTween = gsap.to(this, {
            duration: 0.75,
            _speed: newSpeed,
            ease: Sine.easeIn,
        });
    }

    public update(deltaTime: number) {
        this.updatePositionBy(this._speed * deltaTime, 0);

        // Buffer is an array of x, y positions
        for (let i = 0; i < this._meshBuffer.data.length; i+=2)
        {
            // Move the bottom 2 rows of points in circles to make it look like the snail is moving
            if (i > 160) {
                this._meshBuffer.data[i] -= Math.sin((this._animationTimer * 0.1) + i) * 0.1;
                this._meshBuffer.data[i+1] += Math.cos((this._animationTimer * 0.1) + i) * 0.1;
            }
        }
        this._meshBuffer.update();

        this._animationTimer += deltaTime;
    }
}
