import { Container, Point } from "pixi.js";

export interface IParallaxLayer { [zIndex: number]: Container[] };

export class ParallaxChild extends Container {
    public originalPosition: Point;

    constructor(childrenToAdd?: Container[]) {
        super();

        this.originalPosition = new Point();

        childrenToAdd?.forEach((child) => {
            this.addChild(child);
        });
    }

    public updateOriginalPosition(x: number, y: number) {
        const pos = this.originalPosition;
        this.originalPosition.set(pos.x + x, pos.y + y);
    }
}

export class CameraContainer extends Container {

    public fullWidth: number;
    public fullHeight: number;

    private _parallaxLayers: IParallaxLayer;
    private _cameraPosition: Point;

    constructor(width: number = 100, height: number = 100) {
        super();

        this.fullWidth = width;
        this.fullHeight = height;

        this._parallaxLayers = {};
        this._cameraPosition = new Point(0, 0);

        this.sortableChildren = true;
    }

    public addChildAtZ(child: ParallaxChild, zIndex: number = 1) {
        if (this._parallaxLayers[zIndex] === undefined) {
            this._parallaxLayers[zIndex] = [];
        }

        this._parallaxLayers[zIndex].push(child);
        child.zIndex = zIndex;
        
        super.addChild(child);
    }

    public moveCameraTo(x: number, y: number) {

        if (x <= this.fullWidth && x > 0) {
            this._cameraPosition.x = x;
        }

        if (y <= this.fullHeight && y > 0) {
            this._cameraPosition.y = y;
        }

        this.updateChildrenPositions();
    }

    public moveCameraBy(x: number, y: number) {
        if (this._cameraPosition.x + x <= this.fullWidth) {
            this._cameraPosition.x = this._cameraPosition.x + x;
        }

        if (this._cameraPosition.y + y <= this.fullHeight) {
            this._cameraPosition.y = this._cameraPosition.y + y;
        }

        this.updateChildrenPositions();
    }

    private updateChildrenPositions() {
        Object.keys(this._parallaxLayers).forEach((index) => {
            const zIndex: number = Number(index);
            const children = this._parallaxLayers[zIndex];

            (children as ParallaxChild[]).forEach((child: ParallaxChild) => {
                child.position.set(child.originalPosition.x - (this._cameraPosition.x * zIndex), child.originalPosition.y - (this._cameraPosition.y * zIndex));
            });
        });
    }
}
