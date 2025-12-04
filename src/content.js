var lastScrollUpdate = Date.now();
var lastUpdate = Date.now();
var myRealTimeInterval = setInterval(tick, 16);

var timeBeforeScroll = 300;
var myInterval = setInterval(scrollTick, 16 * timeBeforeScroll);

const screenHeight = window.innerHeight;
const htmlPage = document.querySelector("html");

const cursorIncrementPerLoop = 5 * 10; //(Un incrementation de 5px par boucle);
let lastCurrentHeight = 0; //(Un curseur init à 0);
let nbSameCursorHeight = 0;
let cursorHeight = 0; //(Un curseur init à 0);


let scrollStarted = false;

let timerBeforeResume = 10;
let beforeResumeCounter = 0;

const body = document.body;
const html = document.documentElement;
let documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

let tabsQueue = null;
let tabId = null;

let buttonsDiv;
const buttonArray = [];

body.addEventListener("click", (e) => {
    if (!scrollStarted) return;

    if (scrollStarted) {
        e.preventDefault();
    }
    scrollStarted = false;
    beforeResumeCounter = timerBeforeResume;
})

body.addEventListener("wheel", (e) => {
    if (!scrollStarted) return;

    if (scrollStarted) {
        e.preventDefault();
    }
    scrollStarted = false;
    beforeResumeCounter = timerBeforeResume;
})



function init() {
    clearInterval(myInterval);
    myInterval = setInterval(scrollTick, 16 * timeBeforeScroll);
    lastCurrentHeight = 0; //(Un curseur init à 0);
    cursorHeight = 0; //(Un curseur init à 0);
    nbSameCursorHeight = 0;
    scrollStarted = true;
    showButtons();
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}


function stop() {
    clearInterval(myInterval);
    myInterval = setInterval(scrollTick, 16 * timeBeforeScroll);
    lastCurrentHeight = 0; //(Un curseur init à 0);
    cursorHeight = 0; //(Un curseur init à 0);
    scrollStarted = false;
    nbSameCursorHeight = 0;
    beforeResumeCounter = 0;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

function pause() {
    scrollStarted = false;
}

function resume() {
    scrollStarted = true;
    cursorHeight = window.scrollY;

}

function tick() {
    if (tabId === null || tabsQueue === null) {

        return;
    }

    var now = Date.now();
    var dt = now - lastUpdate;
    lastUpdate = now;
    if (beforeResumeCounter <= 0) return;


    beforeResumeCounter -= dt / 1000;

    console.log(beforeResumeCounter);

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
    if (tabId === null || tabsQueue === null) {

        return;
    }

    if (!scrollStarted) return;


    documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

    if (documentHeight - 100 < screenHeight) {
        if (scrollStarted) {
            stop();
            OnScrollEnded();
        }
        return;
    }

    const currentHeight = (window.scrollY + screenHeight);
    const limit = documentHeight - 100;



    if (currentHeight < limit) {
        cursorHeight += cursorIncrementPerLoop;
        window.scrollTo({ left: 0, top: cursorHeight, behavior: "smooth" });
    } else {
        if (scrollStarted) {
            stop();
            OnScrollEnded();
        }
    }

    console.log(currentHeight + " <- limit = " + limit);
    console.log("cursor same height = " + nbSameCursorHeight);
    console.log("current height = " + currentHeight + " last current height = " + lastCurrentHeight);

    if (currentHeight === lastCurrentHeight) {
        nbSameCursorHeight++;
        if (nbSameCursorHeight > 1) {
            if (scrollStarted) {
                stop();
                OnScrollEnded();
            }
        }
    }

    lastCurrentHeight = currentHeight;
}



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.greeting === "GOOD_TO_GO") {
        tabsQueue = request.tabsList;
        tabId = request.tabId;
        init();
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

function sendManualChangeMessage(message, nextId) {
    chrome.runtime.sendMessage({
        type: message,
        tabsList: tabsQueue,
        tabId: nextId,
        lastTabId: tabId
    }
        ,
        (response) => {
            console.log("message from background" + response.response);
        }
    );
}


function OnScrollEnded() {
    sendMessage("SCROLL_FINISHED");

    tabsQueue = null;
    tabId = null;
}

function showButtons() {
    if (tabsQueue && tabsQueue.length > 0) {
        buttonsDiv = document.createElement("div");
        // buttonsDiv.style.border = "solid 0.2rem red";
        buttonsDiv.style.width = "100%";
        buttonsDiv.style.display = "flex";
        buttonsDiv.style.flexDirection = "row";
        buttonsDiv.style.justifyContent = "space-between";
        buttonsDiv.style.position = "fixed";
        buttonsDiv.style.zIndex = 100;
        buttonsDiv.style.top = 0;
        buttonsDiv.style.left = 0;
        buttonsDiv.style.paddingInline = "20%";

        for (let i = 0; i < tabsQueue.length; i++) {
            const button = document.createElement("button");
            button.setAttribute("tabId", tabsQueue[i]);
            button.style.borderRadius = "2rem";
            button.style.width = "2.5rem";
            button.style.height = "2.5rem";


            button.style.backgroundColor = tabsQueue[i] === tabId ? "green" : "red";

            buttonsDiv.append(button);

            button.addEventListener("click", (e) => {
                if (tabsQueue[i] === tabId) {
                    scrollStarted ? pause() : resume();
                    return;
                }
                e.preventDefault();
                sendManualChangeMessage("MANUALLY_CHANGED_TAB", tabsQueue[i])
            })
            buttonArray.push(button);
        }
        html.append(buttonsDiv);
    }
}
