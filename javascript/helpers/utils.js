
const trimLocalStorageTabs = async () => {
    let allTabs = localStorage.getItem('allTabs');
    allTabs = allTabs && allTabs !== '' ? JSON.parse(allTabs) : [];
    const activeTabs = await getActiveTabs();
    const allTabsKeys = Object.keys(allTabs);
    if (allTabsKeys.length > 0) {
        allTabsKeys.forEach(localTab => {
            if (!activeTabs.some(activeTab => activeTab.id.toString() === localTab)) {
                console.log(`deleting tab -> ${localTab}`);
                delete allTabs[localTab];
            }
        });
        console.log(allTabs);
        localStorage.setItem('allTabs', JSON.stringify(allTabs));
    }
};

const setDOMElementProperty = (nodeId, property, value) => {
    if (property === 'backgroundColor') {
        document.getElementById(nodeId).style.backgroundColor = value;
    } else document.getElementById(nodeId)[property] = value;
    return;
};

const getActiveTabs = async () => {
    const getActiveTabs = new Promise((resolve, reject) => {
        chrome.tabs.query({}, (tabs) => {
            resolve(tabs);
        });
    });
    const tabs = await getActiveTabs.then(tabs => tabs);
    return tabs;
};

const getTabId = async () => {
    const getTabId = new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            resolve(tabs[0].id);
        });
    });
    const thisTab = await getTabId.then(tabId => tabId);
    localStorage.setItem('thisTab', thisTab);
    // console.log(`this tab id: ${thisTab}`);
    return thisTab;
};


const sendMessageToContent = async (args) => {
    const tabID = await getTabId();
    const sendMessage = new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabID, args, res => {
            resolve(res);
        });
    });
    return await sendMessage.then(res => res);
};

const sendMessageToBackground = (msg) => {
    chrome.runtime.sendMessage(msg, res => console.log(`Response from background: ${res}`));
};

const checkIsUrl = (string) => {
    const urlPattern = /^http|^www/i;
    console.log(urlPattern.test(string));
    return urlPattern.test(string);
};

const checkIsNotEmptyUrl = () => {
    const {
        fileSource,
    } = getLocalStorage();
    return fileSource !== null && fileSource !== undefined && fileSource !== '';
}

const actionForm = (action, isUrl) => {
    let disabled, backgroundColor;
    switch (action) {
        case 'disable':
            disabled = true;
            backgroundColor = 'rgba(0,0,0,0)';
            opacity = 0;
            textColor = '#adadad';
            break;
        case 'enable':
        default:
            disable = false;
            backgroundColor = 'white';
            opacity = 10;
            textColor = '#ffffff';
            break;
    }

    const inputs = document.querySelectorAll('input:not(#injectFile)');
    inputs.forEach(input => {
        input.disabled = disabled;
        input.style.backgroundColor = backgroundColor;
        input.style.transition = "all .5s";
        if (input.type === 'checkbox') {
            if (!input.checked && !isUrl && opacity !== 10) {
                input.parentElement.parentElement.style.opacity = opacity;
                input.parentElement.parentElement.style.transition = "all .3s";
            } else {
                input.parentElement.style.color = textColor;
            }
        }
        document.querySelectorAll('.inputLabel').forEach(label => {
            label.style.color = textColor;
        });
    });

};

const setFormValuesFromStorage = () => {
    const {
        injectionDelay,
        fileSource,
        localhostPort,
        hotReload,
        https,
        watchJSON,
    } = getLocalStorage();

    if (fileSource) setDOMElementProperty('fileSource', 'value', fileSource);

    if (injectionDelay) setDOMElementProperty('injectionDelay', 'value', injectionDelay);

    if (localhostPort) setDOMElementProperty('localhostPort', 'value', localhostPort);

    if (hotReload !== null) setDOMElementProperty('hotReload', 'checked', hotReload);

    if (https !== null) setDOMElementProperty('https', 'checked', https);

    if (watchJSON !== null) setDOMElementProperty('watchJSON', 'checked', watchJSON);
};


const initializeHotReload = (fileSource, localhostPort, https, thisTab, hotReload, watchJSON) => {
    if (fileSource && fileSource !== '' && fileSource !== undefined) {
        sendMessageToBackground({ action: "reload", localhostPort, https, thisTab, fileSource, hotReload, watchJSON });
    }
    return;
};

const copyString = (string) => {
    return '' + string;
};

const createLocalhostPath = (fileSource, https, localhostPort, ) => {
    const uriEncodedFileSource = encodeURIComponent(fileSource);
    const protocol = https ? 'https' : 'http';
    return `${protocol}://localhost:${localhostPort}/files/${uriEncodedFileSource}`;
};

const deconstructUrl = (url) => {
    const splitUrlRegex = /(.+:\/\/)?([^\/]+)(\/.*)*/i;
    const urlParts = splitUrlRegex.exec(url);
    // console.log(urlParts);
    return {
        fileUrl: urlParts[0],
        fileProtocol: urlParts[1],
        fileHost: urlParts[2],
        filePath: urlParts[3],
    }
};

const toggleLocalForm = (action) => {
    const inputs = document.querySelectorAll('input[type=checkbox]:not(#injectFile)');
    const portNumber = document.getElementById('connectionTable');
    let opacity;
    switch (action) {
        case 'hide':
        opacity = 0;
        break;
        case 'show':
        opacity = 10;
        break;
        default: break;
    }
    inputs.forEach(input => {
        input.parentElement.parentElement.style.opacity = opacity;
    });
    portNumber.style.opacity = opacity;
};
