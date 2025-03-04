import { ISnailConfig } from "./snail";

const urlParams = new URLSearchParams(window.location.search);

const snailsConfig = urlParams.get("snailsConfig");
const snailsWithTime: {snail: any, time: number}[] = JSON.parse(snailsConfig!)["snails"];


snailsWithTime.sort((a, b) => {
    return a.time - b.time;
});

console.log(snailsWithTime);
const finishersDiv = document.getElementById("finishers") as HTMLDivElement;

// TODO: Time formatter for races that go over 1 min
let innerHTML = "<ol>";
snailsWithTime.forEach((val) => {
    innerHTML += `<li><span style="color:${decodeURIComponent(val.snail.color)};" id="name">${decodeURIComponent(val.snail.name)}</span> <span id="time">${(val.time / 1000).toFixed(2)}</li>`
})
innerHTML += "</ol>";

finishersDiv.innerHTML = innerHTML;