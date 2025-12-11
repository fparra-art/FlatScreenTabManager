// chrome.runtime.onConnect.addListener((port) => {
//     port.onMessage.addListener((message) => {
//         console.log(message);
//         port.postMessage('pong');
//     })
// })



let tabsLoadingComplete = [];
let tabsQueue = []; // La liste des IDs d'onglets à visiter
let currentTabIndex = 0;
let scriptChanged = false;



async function getAllowedTabs() {
    if (tabsQueue.length > 0) return;

    //    console.log("searching tabs");

    const tabs = await chrome.tabs.query({
        url: [
            "https://p.datadoghq.eu/*"
        ]
    });


    const collator = new Intl.Collator();
    tabs.sort((a, b) => collator.compare(a.title, b.title));


    tabsQueue = tabs.map(t => t.id);
}





async function OnTabUpdated(tabId, changeInfo, tab) {
    await getAllowedTabs();


    // console.log("--------------------")

    tabsQueue.forEach((id, index) => {

        if (id == tabId && changeInfo.status === "complete" && tabsLoadingComplete.find(cid => cid == id) == undefined) {
            tabsLoadingComplete.push(id);
            //console.log(index);
            //console.log(tabId);
            //console.log(changeInfo.status);

        }
    })



    if (tabsLoadingComplete.length == tabsQueue.length) {
        StartScroll();
    }
}

async function StartScroll() {
    await getAllowedTabs();
    chrome.tabs.update(tabsQueue[currentTabIndex], { active: true });
    sendDetails(tabsQueue[currentTabIndex], "GOOD_TO_GO");

    chrome.tabs.onUpdated.removeListener(OnTabUpdated);
}


async function ReloadTabs() {

    tabsQueue.forEach((id) => {
        chrome.tabs.reload(id);
    })
}

// 1. Recevoir la liste depuis le Popup
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {

    sendResponse({
        response: "Message Received"
    })

    scriptChanged = true;

    await getAllowedTabs();


    switch (message.type) {

        default:
            break;
    }


    if (message.type === "SCROLL_SETTINGS") {
        await chrome.storage.local.set(`scrollSettings:${message.scrollSettingObj}`);

    }

    if (message.type === "RELOAD") {
        chrome.tabs.onUpdated.addListener(OnTabUpdated);

        if (tabsQueue.length > 0) {
            ReloadTabs();
        }

        tabsLoadingComplete = [];
        tabsQueue = []; // La liste des IDs d'onglets à visiter
        currentTabIndex = 0;
    }

    if (message.type === "CLEAR_BACKGROUND_CACHE") {
        chrome.tabs.onUpdated.addListener(OnTabUpdated);
        tabsLoadingComplete = [];
        tabsQueue = []; // La liste des IDs d'onglets à visiter
        currentTabIndex = 0;
    }

    if (message.type === "MANUALLY_CHANGED_TAB") {

        currentTabIndex = tabsQueue.indexOf(message.lastTabId);
        sendDetails(tabsQueue[currentTabIndex], "STOP");

        currentTabIndex = tabsQueue.indexOf(message.tabId);
        chrome.tabs.update(tabsQueue[currentTabIndex], { active: true });
        sendDetails(tabsQueue[currentTabIndex], "GOOD_TO_GO");
    }


    // if (message.type === "INIT_SCROLL_SEQUENCE") {
    //     tabsQueue = message.tabIds;


    //     // On active le premier onglet de la liste pour lancer la machine
    //     if (tabsQueue.length > 0) {
    //         chrome.tabs.update(tabsQueue[currentTabIndex], { active: true });

    //         sendDetails(tabsQueue[currentTabIndex], "GOOD_TO_GO");
    //     }

    // }


    // // 2. Recevoir le signal de fin de scroll depuis le Content Script
    if (message.type === "SCROLL_FINISHED") {
        if (tabsQueue.length === 0) tabsQueue = message.tabsList;

        // Trouver l'index de l'onglet actuel
        currentTabIndex = tabsQueue.indexOf(sender.tab.id);

        // Passer au suivant s'il en reste
        if (currentTabIndex !== -1 && currentTabIndex < tabsQueue.length - 1) {
            const nextTabId = tabsQueue[currentTabIndex + 1];
            chrome.tabs.update(nextTabId, { active: true });
            sendDetails(nextTabId, "GOOD_TO_GO");

        } else {
            currentTabIndex = 0;
            chrome.tabs.update(tabsQueue[currentTabIndex], { active: true });
            sendDetails(tabsQueue[currentTabIndex], "GOOD_TO_GO");
        }
    }
});




function sendDetails(id, sendData) {
    chrome.tabs.sendMessage(id, {
        greeting: sendData,
        tabsList: tabsQueue,
        tabId: id
    }, (response) => {
        if (response)
            console.log("the response from the content script : " + response.response);
    });
}



chrome.tabs.onActivated.addListener(async function (activeInfo) {
    await getAllowedTabs();


    if (tabsQueue.find((id) => id === activeInfo.tabId) !== undefined) {
        for (let i = 0; i < tabsQueue.length; i++) {
            if (tabsQueue[i] !== activeInfo.tabId) {
                sendDetails(tabsQueue[i], "STOP");
            } else {
                if (!scriptChanged) {
                    sendDetails(activeInfo.tabId, "ARRIVED");
                }
            }

        }

    } else {
        for (let i = 0; i < tabsQueue.length; i++) {
            sendDetails(tabsQueue[i], "STOP");
        }
    }

    scriptChanged = false;

});


