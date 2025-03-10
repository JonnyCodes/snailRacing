import { Container, Point } from "pixi.js";

export interface IParallaxLayer { [zIndex: number]: Container[] };

export class ParallaxChild extends Container {
    public originalPosition: Point;
    public originalScale: Point;

    constructor(childrenToAdd?: Container[]) {
        super();

        this.originalPosition = new Point();
        this.originalScale = new Point(1);

        childrenToAdd?.forEach((child) => {
            this.addChild(child);
        });
    }

    public updateOriginalPosition(x: number, y: number) {
        const pos = this.originalPosition;
        this.originalPosition.set(pos.x + x, pos.y + y);
    }

    public updateOriginalScale(x: number, y: number) {
        const pos = this.originalScale;
        this.originalScale.set(pos.x + x, pos.y + y);
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

        this.sortableChildren = true; // TODO: How to sort children

        // TODO: Need to set the cullable area to screen size
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

    // TODO: This doesn't look good, need to respsect spacing on different zIndexs
    // public setCameraZoom(zoom: number) {
    //     this._container.children.forEach((child: ParallaxChild) => {
    //         if (child.originalScale !== undefined) {
    //             child.scale.set(child.originalScale.x + zoom, child.originalScale.y + zoom);
    //         }
    //     });
    // }

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
