// var lastUpdate = Date.now();
// var myInterval = setInterval(tick, 16);

// const screenHeight = window.innerHeight;
// const htmlPage = document.querySelector("html");

// const cursorIncrementPerLoop = 5; //(Un incrementation de 5px par boucle);
// let lastCursorHeight = 0; //(Un curseur init à 0);
// let cursorHeight = 0; //(Un curseur init à 0);

// let scrollStarted = true;

// const body = document.body;
// const html = document.documentElement;
// let documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);


// function tick() {
//     var now = Date.now();
//     var dt = now - lastUpdate;
//     lastUpdate = now;


//     update(dt);
// }


// function update(dt) {
//     if (!scrollStarted) return;

//     documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

//     if ((window.scrollY + screenHeight) < documentHeight - 10) {
//         cursorHeight += (dt / 10) * 10;
//         window.scrollTo(0, cursorHeight);
//     } else {
//         if (scrollStarted) {
//             scrollStarted = false;
//             OnScrollEnded();
//         }
//     }

// }

window.onload = () => {
    this.alert('Ready');

    sendMessage();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    alert("the message from the background page :" + request.greeting);

    sendResponse({
        response: "Message reveived"
    });
});


function sendMessage(){
    chrome.runtime.sendMessage({
        method: "postList",
        post_list: "The PostList"
    }, (response) => {
        alert("The response from the background page: " + response.response);
    });
}


// function OnScrollEnded() {
//     console.log("Fin du scroll, changement d'onglet demandé...");

//     // ENVOI DU MESSAGE AU BACKGROUND
//     // C'est ici que la magie opère
//     chrome.runtime.sendMessage({ type: "SCROLL_FINISHED" });
// }