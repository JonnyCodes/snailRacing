export abstract class Loadable {
    private loaded: boolean;

    constructor() {
        this.loaded = false;
    }

    public async load(): Promise<void> {
        this.loaded = true;
    }

    public create(): void {
        if (!this.loaded) {
            throw new Error("loadable hasn't been loaded");
        }
    }
}