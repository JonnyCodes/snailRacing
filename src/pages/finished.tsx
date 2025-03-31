// types
import { ISnailWithTime } from "types/snail";
import { Application, Assets, Container, Graphics, Point, Sprite, Text } from "pixi.js";
import { Snail } from "../snail";

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
                resizeTo: window,
                backgroundColor: 0xb7e7fa,
                sharedTicker: true,
            })
            .then(() => {
                document.getElementById("canvas")!.appendChild(pixiApp.canvas);
                renderPodium(pixiApp.canvas, pixiApp.stage, snails);
                renderWinnersList(pixiApp.canvas, pixiApp.stage, snailsConfig);
            })
    });
}

function renderPodium(canvas: HTMLCanvasElement, stage: Container, snails: Snail[]) {
    const podium = Sprite.from("podium");
    podium.scale.set(0.15);
    podium.anchor.set(0.5);
    podium.position.set(canvas.width / 4, canvas.height / 2);
    stage.addChild(podium);

    const snail1 = snails[0].create();
    snail1.position.set(podium.x - snail1.width / 2, podium.y - 370);
    stage.addChild(snail1);

    const snail2 = snails[1].create();
    snail2.position.set(podium.x - 225 - snail2.width / 2, podium.y - 270);
    stage.addChild(snail2);

    const snail3 = snails[2].create();
    snail3.position.set(podium.x + 225 - snail3.width / 2, podium.y - 235);
    stage.addChild(snail3);
}

function renderWinnersList(canvas: HTMLCanvasElement, stage: Container, snailsConfig: ISnailWithTime[]) {
    snailsConfig.forEach((snailConfig, i) => {
        const rectWidth = canvas.width / 3;
        const rectHeight = 70;
        const rectPos = new Point((canvas.width / 3) * 2 - 100, (i * (rectHeight + 10)) + 100);
        const backRect = new Graphics();
        backRect.rect(rectPos.x, rectPos.y, rectWidth, rectHeight);
        switch(i) {
            case 0: {
                backRect.fill(0xC9B037);
                break;
            }
            case 1: {
                backRect.fill(0xB4B4B4);
                break;
            }
            case 2: {
                backRect.fill(0xAD8A56);
                break;
            }

            default: {
                backRect.fill(0x555555);
                break;
            }
        }
        stage.addChild(backRect);

        const nameAndPos = new Text({ 
            text: `${i + 1}: ${snailConfig.name}`,
            style: {
                fontSize: 35,
                fill: i >= 3 ? 0xffffff : 0x000000,
            }
        });
        nameAndPos.position.set(rectPos.x + 20, rectPos.y + (rectHeight - nameAndPos.height) / 2);
        stage.addChild(nameAndPos);

        const time = new Text({ 
            text: (snailConfig.time / 1000).toFixed(3),
            style: {
                fontSize: 35,
                fill: i >= 3 ? 0xffffff : 0x000000,
            }
        });
        time.position.set(rectPos.x + (rectWidth - (time.width + 20)), rectPos.y + (rectHeight - time.height) / 2);
        stage.addChild(time);
    })
    
}

const urlParams = new URLSearchParams(window.location.search);
const snails = urlParams.get("snails");
const snailsWithTime: ISnailWithTime[] = JSON.parse(snails!);
renderFinalScreen(snailsWithTime);