var lastScrollUpdate = Date.now();
var lastUpdate = Date.now();
var myRealTimeInterval = setInterval(tick, 16);

let timeBeforeScroll = 100;
var myInterval = setInterval(scrollTick, 16 * timeBeforeScroll);

const screenHeight = window.innerHeight;
const htmlPage = document.querySelector("html");

let cursorIncrementPerLoop = 50; //(Un incrementation de 5px par boucle);
let lastCurrentHeight = 0; //(Un curseur init à 0);
let nbSameCursorHeight = 0;
let cursorHeight = 0; //(Un curseur init à 0);


let scrollStarted = false;

let timerBeforeResume = 30;
let beforeResumeCounter = 0;

const body = document.body;
const html = document.documentElement;
let documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

let tabsList = null;
let currentTab = null;

let buttonsDiv = null;
const buttonArray = [];

body.addEventListener("click", (e) => {
    if (!scrollStarted) return;

    if (scrollStarted) {
        e.preventDefault();
    }
    scrollStarted = false;
    beforeResumeCounter = timerBeforeResume;
});

body.addEventListener("touchmove", (e) => {
    if (!scrollStarted) return;

    if (scrollStarted) {
        e.preventDefault();
    }
    scrollStarted = false;
    beforeResumeCounter = timerBeforeResume;
});



function init(autoChanged = true) {

    chrome.storage.local.get(["scrollSettings"]).then((result) => {

        timeBeforeScroll = Number(result.scrollSettings.scrollSpeed);
        cursorIncrementPerLoop = Number(result.scrollSettings.scrollLength);

        clearInterval(myInterval);
        myInterval = setInterval(scrollTick, 16 * timeBeforeScroll);
        lastCurrentHeight = 0; //(Un curseur init à 0);
        cursorHeight = 0; //(Un curseur init à 0);
        nbSameCursorHeight = 0;
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        scrollStarted = autoChanged;
        showButtons();

    });
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
    if (currentTab === null || tabsList === null) {

        return;
    }

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
    if (currentTab === null || tabsList === null) {
        return;
    }

    if (!scrollStarted) return;


    documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

    if (documentHeight - 10 < screenHeight) {
        if (scrollStarted) {
            stop();
            OnScrollEnded();
        }
        return;
    }

    const currentHeight = (window.scrollY + screenHeight);
    const limit = documentHeight - 10;



    if (currentHeight < limit) {
        cursorHeight += Number(cursorIncrementPerLoop);
        console.log(cursorHeight);
        window.scrollTo({ left: 0, top: cursorHeight, behavior: "smooth" });
    } else {
        if (scrollStarted) {
            stop();
            OnScrollEnded();
        }
    }

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
        tabsList = request.tabsList;
        currentTab = request.currentTab;
        init(true);
    }

    if (request.greeting === "ARRIVED") {
        tabsList = request.tabsList;
        currentTab = request.currentTab;
        init(false);
    }

    if (request.greeting === "STOP") {
        stop();
    }

    console.log("the message from the background page :" + request.greeting);

    sendResponse({
        response: "Message Received"
    });

});


function sendMessage(message) {
    chrome.runtime.sendMessage({
        type: message,
        tabId: currentTab.id
    },
        (response) => {
            console.log("message from background" + response.response);
        }
    );
}

function sendManualChangeMessage(message, nextId) {
    chrome.runtime.sendMessage({
        type: message,
        tabId: nextId,
        lastTabId: currentTab.id
    },
        (response) => {
            console.log("message from background" + response.response);
        }
    );
}


function OnScrollEnded() {
    sendMessage("SCROLL_FINISHED");

    tabsList = null;
    currentTab = null;
}

function showButtons() {
    if (tabsList && tabsList.length > 0 && buttonsDiv === null) {
        buttonsDiv = document.createElement("div");
        // buttonsDiv.style.border = "solid 0.2rem red";
        buttonsDiv.style.width = "100%";
        buttonsDiv.style.display = "flex";
        buttonsDiv.style.flexDirection = "row";
        buttonsDiv.style.justifyContent = "space-between";
        buttonsDiv.style.position = "fixed";
        buttonsDiv.style.zIndex = 100;
        buttonsDiv.style.top = "20px";
        buttonsDiv.style.left = 0;
        buttonsDiv.style.paddingInline = "20%";

        for (let i = 0; i < tabsList.length; i++) {

            const buttonInnerDiv = document.createElement("div");
            buttonInnerDiv.style.display = "flex";
            buttonInnerDiv.style.flexDirection = "column";
            buttonInnerDiv.style.justifyContent = "center";
            buttonInnerDiv.style.alignItems = "center";

            const button = document.createElement("button");
            button.setAttribute("tabId", tabsList[i].id);
            button.style.borderRadius = "2rem";
            button.style.width = "2.5rem";
            button.style.height = "2.5rem";

            const buttonTitle = document.createElement("h4");
            buttonTitle.innerText = tabsList[i].title;
            buttonTitle.style.textAlign = "center";

            if (tabsList[i].id === currentTab.id) {
                button.style.backgroundColor = scrollStarted ? "green" : "grey"
            }
            else {
                button.style.backgroundColor = "red";
            }

            buttonInnerDiv.append(button)
            buttonInnerDiv.append(buttonTitle)
            buttonsDiv.append(buttonInnerDiv);

            button.addEventListener("click", (e) => {
                if (tabsList[i].id === currentTab.id) {
                    if (scrollStarted) {
                        button.style.backgroundColor = "grey";
                        pause();
                    }
                    else {
                        button.style.backgroundColor = "green";
                        resume();
                    }
                    return;
                }
                e.preventDefault();
                sendManualChangeMessage("MANUALLY_CHANGED_TAB", tabsList[i].id)
            })
            buttonArray.push(button);
        }
        html.append(buttonsDiv);
        return;
    }

    if (buttonArray.length > 0) {
        buttonArray.forEach((button) => {
            if (button.getAttribute("tabId") == currentTab.id) {
                button.style.backgroundColor = scrollStarted ? "green" : "grey"
            }
        })
    }

}
