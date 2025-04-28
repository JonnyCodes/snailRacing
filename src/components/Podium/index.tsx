import { ISnailWithTime } from "types/snail";

import { Application, Assets, Container, Sprite } from "pixi.js";
import { Snail } from "../../snail";
import { useEffect } from "react";

export const Podium = (props: { snails: ISnailWithTime[]}) => {

    const renderFinalScreen = async (snailsConfig: ISnailWithTime[]) => {
        const pixiApp = new Application();
        const snails: Snail[] = [];
    
        const loadPromises = [
            Assets.load({ alias: "podium", src: "./podium.png" })
        ];
    
        [snailsConfig[0], snailsConfig[1], snailsConfig[2]].forEach((snailConfig) => {
            const snail = new Snail(snailConfig);
            snails.push(snail);
            loadPromises.push(snail.load(snailConfig.bodyAssetNum));
        });
    
        Promise.all(loadPromises).then(() => {
            pixiApp
                .init({
                    width: 550,
                    height: 350,
                    backgroundColor: 0xb7e7fa,
                    backgroundAlpha: 0,
                    sharedTicker: true,
                })
                .then(() => {
                    document.getElementById("podium")!.appendChild(pixiApp.canvas);
                    renderPodium(pixiApp.stage, snails);
                    pixiApp.resize();
                })
        });
    }
    
    function renderPodium(stage: Container, snails: Snail[]) {
    
        const podium = Sprite.from("podium");
        podium.scale.set(0.075);
        podium.anchor.set(0.5, 1);
        podium.position.set(550 / 2, 350);
        stage.addChild(podium);
    
        const snail1 = snails[0].create();
        snail1.scale.set(0.5);
        snail1.position.set((550 - snail1.width) / 2, 65);
        stage.addChild(snail1);
    
        const snail2 = snails[1].create();
        snail2.scale.set(0.5);
        snail2.position.set((550 - snail1.width) / 4, 115);
        stage.addChild(snail2);
    
        const snail3 = snails[2].create();
        snail3.scale.set(0.5);
        snail3.position.set((550 - snail1.width) / 4 * 3, 130);
        stage.addChild(snail3);
    }

    useEffect(() => {
        renderFinalScreen(props.snails);
    }, []);

    return (
        <div id="podium"></div>
    );
};
