
fetch("../ressources/urls.json").then(async response => {
    const data = await response.json();
    const urlsList = document.querySelector(".urls-list");

    data.urls.forEach(element => {
        const listElement = document.createElement("li");

        const name = document.createElement("h2");
        name.setAttribute("class", "url-name");
        listElement.appendChild(name);

        const url = document.createElement("h4");
        url.setAttribute("class", "url-link");
        listElement.appendChild(url);
        url.style.color = "green";

        name.innerText = element.name;
        url.innerText = element.url;


        urlsList.appendChild(listElement);
    });

})


const scrollSpeedSlider = document.getElementById("scroll-speed");
const scrollSpeedLabel = document.querySelector("label[for='scroll-speed']");
scrollSpeedLabel.innerText = "Défilement toutes les " + scrollSpeedSlider.value / 100 + "secondes";

const scrollLenghtSlider = document.getElementById("scroll-lenght");
const scrollLenghtLabel = document.querySelector("label[for='scroll-lenght']");
scrollLenghtLabel.innerText = scrollLenghtSlider.value + "px par défilement";


scrollSpeedSlider.addEventListener(("change"), (e) => {
    scrollSpeedLabel.innerText = "Défilement toutes les " + scrollSpeedSlider.value / 100 + "secondes";
});

scrollLenghtSlider.addEventListener(("change"), (e) => {
    scrollLenghtLabel.innerText = scrollLenghtSlider.value + "px par défilement";
});

const startButton = document.querySelector(".start-button");
const refreshButton = document.querySelector(".refresh-button");
startButton.addEventListener("click", OpenOrRefreshTabs);
refreshButton.addEventListener("click", OpenOrRefreshTabs);

async function CreateTabs(_array) {
    const tabs = []
    for (let i = 0; i < _array.length; i++) {

        const newTab = await chrome.tabs.create({
            active: false,
            url: _array[i].innerText
        });

        tabs.push(newTab);
    }

    return await tabs;

}


async function OpenOrRefreshTabs() {
    const existingTabs = await chrome.tabs.query({
        url: [
            "https://p.datadoghq.eu/*"
        ]
    });

    if (existingTabs.length > 0) {

        chrome.runtime.sendMessage({
            type: "RELOAD",
            scrollSpeed: scrollSpeedSlider.value,
            scrollLenght: scrollLenghtSlider.value,
        });
        return;
    }

    chrome.runtime.sendMessage({
        type: "CLEAR_BACKGROUND_CACHE",
    });

    const urlsList = document.querySelector(".urls-list");
    const linkArray = urlsList.querySelectorAll(".url-link");
    const tabs = await CreateTabs(linkArray);

    const tabIds = tabs.map(({ id }) => id);

    if (tabIds.length) {
        const group = await chrome.tabs.group({ tabIds });
        await chrome.tabGroups.update(group, { title: "Data" })
    }

    chrome.runtime.sendMessage({
        type: "TABS_OPENED",
        scrollSpeed: scrollSpeedSlider.value,
        scrollLenght: scrollLenghtSlider.value,
    });
}




// const statusButton = document.querySelector(".status-button");

// statusButton.addEventListener("click", async (e) => {



//     const tabs = await chrome.tabs.query({
//         url: [
//             "https://p.datadoghq.eu/*"
//         ]
//     });


//     const collator = new Intl.Collator();
//     tabs.sort((a, b) => collator.compare(a.title, b.title));


//     const tabStatus = tabs.map(({ status }) => status);

//     console.log(tabStatus);
// })




// const tabs = await chrome.tabs.query({
//     url: [
//         "https://p.datadoghq.eu/*"
//     ]
// });


// const collator = new Intl.Collator();
// tabs.sort((a, b) => collator.compare(a.title, b.title));

// const template = document.getElementById("li_template");
// const elements = new Set();


// for (const tab of tabs) {
//     const element = template.content.firstElementChild.cloneNode(true);

//     const title = tab.title.split("-")[0].trim();
//     const pathname = new URL(tab.url).pathname.slice("/docs".length);

//     element.querySelector(".title").textContent = title;
//     element.querySelector(".pathname").textContent = pathname;

//     element.querySelector("a").addEventListener("click", async () => {

//         const currentActiveTab = tabs.filter(({active, selected}) => active == true && selected == true);

//         chrome.runtime.sendMessage({
//             type: "MANUALLY_CHANGED_TAB",
//             tabId: tab.id,
//             tabsList: tabs.map(({ id }) => id),
//             lastTabId: currentActiveTab[0].id,
//         });
//     });

//     elements.add(element);
// }

// document.querySelector("ul").append(...elements);

// const button = document.querySelector("button");
// button.addEventListener("click", async () => {
//     const tabIds = tabs.map(({ id }) => id);
//     if (tabIds.length) {
//         const group = await chrome.tabs.group({ tabIds });
//         await chrome.tabGroups.update(group, { title: "DOCS" });
//     }
// })


// const startButton = document.querySelector(".start-button");


// startButton.addEventListener("click", async () => {

//     chrome.runtime.restart();

//     const tabsIds = tabs.map(t => t.id);

//     chrome.runtime.sendMessage({
//         type: "INIT_SCROLL_SEQUENCE",
//         tabIds: tabsIds
//     });

//     window.close();
// })