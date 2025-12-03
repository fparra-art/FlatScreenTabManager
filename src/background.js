let tabsQueue = []; // La liste des IDs d'onglets à visiter
let currentTabIndex = 0;
// 1. Recevoir la liste depuis le Popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.type === "MANUALLY_CHANGED_TAB") {
        sendDetails(tabsQueue[currentTabIndex], "STOP");
        currentTabIndex = tabsQueue.indexOf(message.tabId);
        sendDetails(tabsQueue[currentTabIndex], "GOOD_TO_GO");
    }


    if (message.type === "INIT_SCROLL_SEQUENCE") {
        tabsQueue = message.tabIds;
        console.log("Liste reçue :", tabsQueue);


        // On active le premier onglet de la liste pour lancer la machine
        if (tabsQueue.length > 0) {
            chrome.tabs.update(tabsQueue[currentTabIndex], { active: true });

            sendDetails(tabsQueue[currentTabIndex], "GOOD_TO_GO");
        }

    }


    // // 2. Recevoir le signal de fin de scroll depuis le Content Script
    if (message.type === "SCROLL_FINISHED") {
        console.log("Scroll terminé sur l'onglet", sender.tab.id);

        // Trouver l'index de l'onglet actuel
        currentTabIndex = tabsQueue.indexOf(sender.tab.id);

        // Passer au suivant s'il en reste
        if (currentTabIndex !== -1 && currentTabIndex < tabsQueue.length - 1) {
            const nextTabId = tabsQueue[currentTabIndex + 1];
            chrome.tabs.update(nextTabId, { active: true });
            sendDetails(nextTabId, "GOOD_TO_GO");

        } else {
            currentTabIndex = 0;
            console.log(tabsQueue);
            chrome.tabs.update(tabsQueue[currentTabIndex], { active: true });
            sendDetails(tabsQueue[currentTabIndex], "GOOD_TO_GO");
        }
    }


    sendResponse({
        response: "Message Received"
    })

});



function sendDetails(id, sendData) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(id, {
            greeting: sendData
        }, (response) => {
            if (response)
                console.log("the response from the content script : " + response.response);
        });
    });
}