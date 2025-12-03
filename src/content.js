var lastScrollUpdate = Date.now();
var lastUpdate = Date.now();
var myRealTimeInterval = setInterval(tick, 16);

var timeBeforeScroll = 300;
var myInterval = setInterval(scrollTick, 16 * timeBeforeScroll);

const screenHeight = window.innerHeight;
const htmlPage = document.querySelector("html");

const cursorIncrementPerLoop = 5 * 10; //(Un incrementation de 5px par boucle);
let lastCursorHeight = 0; //(Un curseur init à 0);
let cursorHeight = 0; //(Un curseur init à 0);

let scrollStarted = false;

let timerBeforeResume = 10;
let beforeResumeCounter = 0;

const body = document.body;
const html = document.documentElement;
let documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

let tabsQueue;

body.addEventListener("click", (e) => {
    if (scrollStarted) {
        e.preventDefault();
    }
    scrollStarted = false;
    beforeResumeCounter = timerBeforeResume;
})

function init() {
    myInterval = setInterval(scrollTick, 16 * timeBeforeScroll);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    lastCursorHeight = 0; //(Un curseur init à 0);
    cursorHeight = 0; //(Un curseur init à 0);
    scrollStarted = true;
}


function stop() {
    scrollStarted = false;
}

function tick() {
    var now = Date.now();
    var dt = now - lastUpdate;
    lastUpdate = now;
    if (beforeResumeCounter <= 0) return;


    beforeResumeCounter -= dt / 1000;

    if (beforeResumeCounter <= 0) {
        scrollStarted = true;
        cursorHeight = window.scrollY;
    }
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

    if (documentHeight - 100 < screenHeight ) {
        console.log(documentHeight + " limit is " + screenHeight)

        if (scrollStarted) {
            scrollStarted = false;
            OnScrollEnded();
        }
        return;
    }

    const currentHeight = (window.scrollY + screenHeight + cursorIncrementPerLoop);
    const limit = documentHeight - 100;

    console.log(currentHeight + " limit is " + limit)

    if (currentHeight < limit) {
        cursorHeight += cursorIncrementPerLoop;
        window.scrollTo({ left: 0, top: cursorHeight, behavior: "smooth" });
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
        tabsQueue = request.tabsList;
        // console.log(tabsQueue);
    }

    if (request.greeting === "STOP") {
        stop();
    }


    console.log("the message from the background page :" + request.greeting);

    sendResponse({
        response: "Message Received"
    })

});


function sendMessage(message) {
    chrome.runtime.sendMessage({
        type: message,
        tabsList: tabsQueue
    },
        (response) => {
            console.log("message from background" + response.response);
        }
    );
}


function OnScrollEnded() {
    // console.log("Fin du scroll, changement d'onglet demandé...");

    sendMessage("SCROLL_FINISHED");
}