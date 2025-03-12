import { getRandomSeed } from "./utils";

const lengthInput: HTMLInputElement = document.getElementById("raceLength")! as HTMLInputElement;

const seedInput: HTMLInputElement = document.getElementById("seed")! as HTMLInputElement;
seedInput.value = getRandomSeed();
const randomSeedBtn: HTMLButtonElement = document.getElementById("randomSeedButton") as HTMLButtonElement;
randomSeedBtn.addEventListener("click", () => {
    seedInput.value = getRandomSeed();
});

const snailConfigDiv = document.getElementById("snails") as HTMLDivElement;

const snailArray = new Proxy([] as {name: string, color: string, number: number }[], {
    deleteProperty(target, prop: any) {
        delete target[prop];
        return true;
    },
    set(target, prop: any, newValue: any, receiver) {
        target[prop] = newValue;

        if (prop !== "length") {
            let innerHTML = "<ul>";
            target.forEach((snailConfig) => {
                let liElement = "<li>";
                liElement += `${snailConfig.number}: <span style="color:${decodeURIComponent(snailConfig.color)};">${decodeURIComponent(snailConfig.name)}</span>`
                liElement += "</li>";
                innerHTML += liElement;
            });

            snailConfigDiv.innerHTML = innerHTML + "</ul>";

            addSnailBtn.disabled = target.length === 8;
            playButton.disabled = !(target.length > 0);
        }

        return true
    },
})

const nameInput: HTMLInputElement = document.getElementById("snailName") as HTMLInputElement;
const colorInput: HTMLInputElement = document.getElementById("snailColor") as HTMLInputElement;
const addSnailBtn: HTMLButtonElement = document.getElementById("addSnail") as HTMLButtonElement;

addSnailBtn.addEventListener("click", () => {
    const snailNumber = snailArray.length + 1;
    const snailName = nameInput.value || `Snail ${snailNumber}`;
    const snailColor = colorInput.value;
    snailArray.push({ name: encodeURIComponent(snailName), color: encodeURIComponent(snailColor), number: snailNumber })
    nameInput.value = "";
    colorInput.value = "#000000"; 
});

const playButton: HTMLButtonElement = document.getElementById("play") as HTMLButtonElement;
playButton.addEventListener("click", () => {
    window.location.href = `./game.html?length=${lengthInput.value}&seed=${seedInput.value}&snailsConfig={"snails":${JSON.stringify(snailArray)}}`
});