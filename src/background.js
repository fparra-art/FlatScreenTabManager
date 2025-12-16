// chrome.runtime.onConnect.addListener((port) => {
//     port.onMessage.addListener((message) => {
//         console.log(message);
//         port.postMessage('pong');
//     })
// })



//let tabsLoadingComplete = [];
//let tabsQueue = []; // La liste des IDs d'onglets à visiter

let tabsInfo = [];
let currentTabIndex = 0;
let scriptChanged = false;



async function getAllowedTabs() {
    tabsInfo.length = 0;
    //tabsQueue.length = 0;

    const tabs = await chrome.tabs.query({
        url: [
            "https://p.datadoghq.eu/*"
        ]
    });


   // const collator = new Intl.Collator();
    // tabs.sort((a, b) => collator.compare(a.title, b.title));



    //tabsQueue = tabs.map(t => t.id);


    tabs.forEach((el, i) => {
        tabsInfo.push({ id: el.id, title: el.url, status: el.status })
    });

    tabsInfo.forEach(async (el) => {
        const response = await fetch("../ressources/urls.json");
        const data = await response.json();
        const foundUrl = data.urls.find(urlList => urlList.url == el.title);
        el.title = foundUrl == undefined ? "?" : foundUrl.name;
    });


}





async function OnTabUpdated(tabId, changeInfo, tab) {
    await getAllowedTabs();

    // When all wanted tabs are on status completed start behavior
    if (tabsInfo.filter((el) => el.status !== "complete").length === 0) {
        StartScroll();
    }
}

async function StartScroll() {
    await getAllowedTabs();
    chrome.tabs.update(tabsInfo[currentTabIndex].id, { active: true });
    sendDetails(tabsInfo[currentTabIndex], "GOOD_TO_GO");

    chrome.tabs.onUpdated.removeListener(OnTabUpdated);
}


async function ReloadTabs() {
    tabsInfo.forEach((el) => {
        chrome.tabs.reload(el.id);
    })
}

// 1. Recevoir la liste depuis le Popup
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {

    sendResponse({
        response: `Message ${message} Received`
    })

    scriptChanged = true;

    await getAllowedTabs();


    switch (message.type) {
        case "RELOAD":
            chrome.tabs.onUpdated.addListener(OnTabUpdated);
            if (tabsInfo.length > 0) {
                ReloadTabs();
            }
            tabsInfo = [];
            currentTabIndex = 0;
            break;
        case "CLEAR_BACKGROUND_CACHE":
            chrome.tabs.onUpdated.addListener(OnTabUpdated);
            tabsInfo = [];
            currentTabIndex = 0;
            break;
        case "MANUALLY_CHANGED_TAB":
            currentTabIndex = tabsInfo.indexOf(tabsInfo.find((el) => el.id == message.lastTabId));
            sendDetails(tabsInfo[currentTabIndex], "STOP");

            currentTabIndex = tabsInfo.indexOf(tabsInfo.find((el) => el.id == message.tabId));
            chrome.tabs.update(tabsInfo[currentTabIndex].id, { active: true });

            sendDetails(tabsInfo[currentTabIndex], "GOOD_TO_GO");
            break;
        case "SCROLL_FINISHED":
            currentTabIndex = tabsInfo.indexOf(tabsInfo.find((el) => el.id == message.tabId));

            if (currentTabIndex !== -1 && currentTabIndex < tabsInfo.length - 1) {
                const nextTab = tabsInfo[currentTabIndex + 1];
                chrome.tabs.update(nextTab.id, { active: true });
                sendDetails(nextTab, "GOOD_TO_GO");

            } else {
                currentTabIndex = 0;
                chrome.tabs.update(tabsInfo[currentTabIndex].id, { active: true });
                sendDetails(tabsInfo[currentTabIndex], "GOOD_TO_GO");
            }
            break;
        default:
            break;
    }


    // if (message.type === "RELOAD") {
    //     chrome.tabs.onUpdated.addListener(OnTabUpdated);

    //     if (tabsQueue.length > 0) {
    //         ReloadTabs();
    //     }

    //     tabsInfo = [];
    //     // tabsLoadingComplete = [];
    //     // tabsQueue = []; // La liste des IDs d'onglets à visiter
    //     currentTabIndex = 0;
    // }

    // if (message.type === "CLEAR_BACKGROUND_CACHE") {
    //     chrome.tabs.onUpdated.addListener(OnTabUpdated);
    //     tabsInfo = [];
    //     // tabsLoadingComplete = [];
    //     // tabsQueue = []; // La liste des IDs d'onglets à visiter
    //     currentTabIndex = 0;
    // }

    // if (message.type === "MANUALLY_CHANGED_TAB") {

    //     currentTabIndex = tabsInfo.indexOf(tabsInfo.find((el) => el.id == message.lastTabId));
    //     sendDetails(tabsInfo[currentTabIndex], "STOP");

    //     currentTabIndex = tabsInfo.indexOf(tabsInfo.find((el) => el.id == message.tabId));
    //     chrome.tabs.update(tabsInfo[currentTabIndex].id, { active: true });

    //     sendDetails(tabsInfo[currentTabIndex], "GOOD_TO_GO");
    // }


    // if (message.type === "INIT_SCROLL_SEQUENCE") {
    //     tabsQueue = message.tabIds;


    //     // On active le premier onglet de la liste pour lancer la machine
    //     if (tabsQueue.length > 0) {
    //         chrome.tabs.update(tabsQueue[currentTabIndex], { active: true });

    //         sendDetails(tabsQueue[currentTabIndex], "GOOD_TO_GO");
    //     }

    // }


    // // // 2. Recevoir le signal de fin de scroll depuis le Content Script
    // if (message.type === "SCROLL_FINISHED") {
    //     // Trouver l'index de l'onglet actuel
    //     currentTabIndex = tabsInfo.indexOf(tabsInfo.find((el) => el.id == message.tabId));


    //     // Passer au suivant s'il en reste
    //     if (currentTabIndex !== -1 && currentTabIndex < tabsQueue.length - 1) {
    //         const nextTab = tabsInfo[currentTabIndex + 1];
    //         chrome.tabs.update(nextTab.id, { active: true });
    //         sendDetails(nextTab, "GOOD_TO_GO");

    //     } else {
    //         currentTabIndex = 0;
    //         chrome.tabs.update(tabsInfo[currentTabIndex].id, { active: true });
    //         sendDetails(tabsInfo[currentTabIndex], "GOOD_TO_GO");
    //     }
    // }
});




function sendDetails(tab, sendData) {
    chrome.tabs.sendMessage(tab.id, {
        greeting: sendData,
        tabsList: (tabsInfo),
        currentTab: tab
    }, (response) => {
        if (response)
            console.log("the response from the content script : " + response.response);
    });
}



chrome.tabs.onActivated.addListener(async function (activeInfo) {
    await getAllowedTabs();

    if (tabsInfo.find((el) => el.id === activeInfo.tabId) !== undefined) {
        for (let i = 0; i < tabsInfo.length; i++) {
            if (tabsInfo[i].id !== activeInfo.tabId) {
                sendDetails(tabsInfo[i], "STOP");
            } else {
                if (!scriptChanged) {
                    sendDetails(tabsInfo[i], "ARRIVED");
                }
            }
        }
    } else {
        for (let i = 0; i < tabsInfo.length; i++) {
            sendDetails(tabsInfo[i], "STOP");
        }
    }

    scriptChanged = false;

});


