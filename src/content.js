var lastUpdate = Date.now();
var myInterval = setInterval(tick, 16);

const screenHeight = window.innerHeight;
const htmlPage = document.querySelector("html");

const cursorIncrementPerLoop = 5; //(Un incrementation de 5px par boucle);
let lastCursorHeight = 0; //(Un curseur init à 0);
let cursorHeight = 0; //(Un curseur init à 0);

let scrollStarted = false;

const body = document.body;
const html = document.documentElement;
let documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);


function tick() {
    var now = Date.now();
    var dt = now - lastUpdate;
    lastUpdate = now;


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
    if (request.greeting === "GOOD_TO_GO"){
            scrollStarted = true;
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