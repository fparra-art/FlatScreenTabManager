let tabsQueue = []; // La liste des IDs d'onglets à visiter

// 1. Recevoir la liste depuis le Popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    console.log('the message from the content scropt: ' + message.message);
    if (message.message === "INIT_SCROLL") {
        sendResponse({
            response: "Message received"
        });
       sendDetails("totot")
    }


    // if (message.type === "INIT_SCROLL_SEQUENCE") {
    //     tabsQueue = message.tabIds;
    //     console.log("Liste reçue :", tabsQueue);



    //     // On active le premier onglet de la liste pour lancer la machine
    //     if(tabsQueue.length > 0) {
    //         chrome.tabs.update(tabsQueue[0], { active: true });
    //     }


    // }

    // // 2. Recevoir le signal de fin de scroll depuis le Content Script
    // if (message.type === "SCROLL_FINISHED") {
    //     console.log("Scroll terminé sur l'onglet", sender.tab.id);

    //     // Trouver l'index de l'onglet actuel
    //     const currentTabIndex = tabsQueue.indexOf(sender.tab.id);

    //     // Passer au suivant s'il en reste
    //     if (currentTabIndex !== -1 && currentTabIndex < tabsQueue.length - 1) {
    //         const nextTabId = tabsQueue[currentTabIndex + 1];
    //         chrome.tabs.update(nextTabId, { active: true });
    //     } else {
    //         console.log("Séquence terminée !");
    //     }
    // }
});



function sendDetails(sendData) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            greeting: sendData
        }, (response) => {
            console.log("the response from the content scropt : " + response.response);
        })
    })
}