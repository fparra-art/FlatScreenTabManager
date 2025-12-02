var lastScrollUpdate = Date.now();
var lastUpdate = Date.now();
var myRealTimeInterval = setInterval(tick, 16);
var myInterval = setInterval(scrollTick, 16 * 20);

const screenHeight = window.innerHeight;
const htmlPage = document.querySelector("html");

const cursorIncrementPerLoop = 5 * 30; //(Un incrementation de 5px par boucle);
let lastCursorHeight = 0; //(Un curseur init à 0);
let cursorHeight = 0; //(Un curseur init à 0);

let scrollStarted = false;

let timerBeforeResume = 10;
let beforeResumeCounter = 0;

const body = document.body;
const html = document.documentElement;
let documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);



body.addEventListener("click", (e) => {
    e.preventDefault();
    scrollStarted = false;
    beforeResumeCounter = timerBeforeResume;
})

function init() {
    console.log("init");

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    lastCursorHeight = 0; //(Un curseur init à 0);
    cursorHeight = 0; //(Un curseur init à 0);
    scrollStarted = true;
}


function tick() {
    var now = Date.now();
    var dt = now - lastUpdate;
    lastUpdate = now;
    if (beforeResumeCounter <= 0) return;


    beforeResumeCounter -= dt/1000;

    if (beforeResumeCounter <= 0 ){
        scrollStarted = true;
        cursorHeight = window.scrollY;
    }
    console.log(window.scrollY);
}

function scrollTick() {
    var now = Date.now();
    var dt = now - lastScrollUpdate;
    lastScrollUpdate = now;

    update(dt);
}


function update(dt) {
    if (!scrollStarted) return;

    documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

    if ((window.scrollY + screenHeight) < documentHeight - 10) {
        cursorHeight += (dt / 10) * 2;
        window.scrollTo(0, cursorHeight);
    } else {
        if (scrollStarted) {
            scrollStarted = false;
            OnScrollEnded();
        }
    }

}



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.greeting === "GOOD_TO_GO") {
        init();
    }
    console.log("the message from the background page :" + request.greeting);

    sendResponse({
        response: "Message Received"
    })

});


function sendMessage(message) {
    chrome.runtime.sendMessage({
        message: message,
    },
        (response) => {
            console.log("message from background" + response.response);
        }
    );
}


function OnScrollEnded() {
    console.log("Fin du scroll, changement d'onglet demandé...");

    sendMessage("SCROLL_FINISHED");
}