console.log("in script");
var lastUpdate = Date.now();
var myInterval = setInterval(tick, 0);

const htmlPage = document.querySelector("html, body");
const screenHeight = window.innerHeight;
const bodyHeight = document.querySelector("devsite-content").offsetHeight;
const cursorIncrementPerLoop = 5; //(Un incrementation de 5px par boucle);
let lastCursorHeight = 0; //(Un curseur init à 0);
let cursorHeight = 0; //(Un curseur init à 0);
let scrollStarted = true;
let index = 0;


function tick() {
    var now = Date.now();
    var dt = now - lastUpdate;
    lastUpdate = now;


    console.log(bodyHeight);
    update(dt);
}


function update(dt) {

    if (scrollStarted) {
        if ((cursorHeight + screenHeight) - cursorIncrementPerLoop < bodyHeight) {
            cursorHeight += dt / 10;
        }
        else {
            scrollStarted = false;
        }

        if (cursorHeight - lastCursorHeight > cursorIncrementPerLoop) {
            htmlPage.scroll({
                top: cursorHeight,
                behavior: "smooth",
            });

            lastCursorHeight = cursorHeight;
        }
        console.log("oui")
    }

}