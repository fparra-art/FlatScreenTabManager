const tabs = await chrome.tabs.query({
    url: [
        "https://p.datadoghq.eu/*"
    ]
});


const collator = new Intl.Collator();
tabs.sort((a, b) => collator.compare(a.title, b.title));

const template = document.getElementById("li_template");
const elements = new Set();


for (const tab of tabs) {
    const element = template.content.firstElementChild.cloneNode(true);

    const title = tab.title.split("-")[0].trim();
    const pathname = new URL(tab.url).pathname.slice("/docs".length);

    element.querySelector(".title").textContent = title;
    element.querySelector(".pathname").textContent = pathname;

    element.querySelector("a").addEventListener("click", async () => {

        const currentActiveTab = tabs.filter(({active, selected}) => active == true && selected == true);

        chrome.runtime.sendMessage({
            type: "MANUALLY_CHANGED_TAB",
            tabId: tab.id,
            tabsList: tabs.map(({ id }) => id),
            lastTabId: currentActiveTab[0].id,
        });
    });

    elements.add(element);
}

document.querySelector("ul").append(...elements);

const button = document.querySelector("button");
button.addEventListener("click", async () => {
    const tabIds = tabs.map(({ id }) => id);
    if (tabIds.length) {
        const group = await chrome.tabs.group({ tabIds });
        await chrome.tabGroups.update(group, { title: "DOCS" });
    }
})


const startButton = document.querySelector(".start-button");


startButton.addEventListener("click", async () => {

    chrome.runtime.restart();

    const tabsIds = tabs.map(t => t.id);

    chrome.runtime.sendMessage({
        type: "INIT_SCROLL_SEQUENCE",
        tabIds: tabsIds
    });

    window.close();
})