// Get the URLS and Linked Name for the popup
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


// Speed Settings 
const scrollSpeedSlider = document.getElementById("scroll-speed");
const scrollSpeedLabel = document.querySelector("label[for='scroll-speed']");
scrollSpeedLabel.innerText = "Défilement toutes les " + scrollSpeedSlider.value / 100 + "secondes";

// Length Settings 
const scrollLenghtSlider = document.getElementById("scroll-lenght");
const scrollLenghtLabel = document.querySelector("label[for='scroll-lenght']");
scrollLenghtLabel.innerText = scrollLenghtSlider.value + "px par défilement";

// Popup UI
scrollSpeedSlider.addEventListener(("change"), (e) => {
    scrollSpeedLabel.innerText = "Défilement toutes les " + scrollSpeedSlider.value / 100 + "secondes";
});

// Popup UI
scrollLenghtSlider.addEventListener(("change"), (e) => {
    scrollLenghtLabel.innerText = scrollLenghtSlider.value + "px par défilement";
});

// the two are the same
const startButton = document.querySelector(".start-button");
const refreshButton = document.querySelector(".refresh-button");
startButton.addEventListener("click", OpenOrRefreshTabs);
refreshButton.addEventListener("click", OpenOrRefreshTabs);


// Create Tabs from an array 
//as a function to wait for creation to be done
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

    // Get the settings from UI
    const scrollSettingsObj = {
        scrollSpeed: scrollSpeedSlider.value,
        scrollLength: scrollLenghtSlider.value,
    }

    chrome.storage.local.set({scrollSettings: scrollSettingsObj});

    // If tabs already exists then reload them
    const existingTabs = await chrome.tabs.query({
        url: [
            "https://p.datadoghq.eu/*"
        ]
    });
    /*TODO better check */
    if (existingTabs.length > 0) {

        chrome.runtime.sendMessage({
            type: "RELOAD"
        });
        return;
    }

    chrome.runtime.sendMessage({
        type: "CLEAR_BACKGROUND_CACHE",
    });

    //Open Tabs
    const urlsList = document.querySelector(".urls-list");
    const linkArray = urlsList.querySelectorAll(".url-link");
    const tabs = await CreateTabs(linkArray);

    //When Opened group tabs and send message
    const tabIds = tabs.map(({ id }) => id);

    if (tabIds.length) {
        const group = await chrome.tabs.group({ tabIds });
        await chrome.tabGroups.update(group, { title: "Data" })
    }

    chrome.runtime.sendMessage({
        type: "TABS_OPENED"
    });
}
