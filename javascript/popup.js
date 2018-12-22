



document.addEventListener('DOMContentLoaded', async() => {

    await trimLocalStorageTabs();

    const tabID = await getTabId();
    localStorage.setItem('thisTab', tabID);

    await testConnection();

    await testInjectorStatus();

    const {
        thisTab,
        injectionDelay,
        fileSource,
        localhostPort,
        hotReload,
        https,
    } = getLocalStorage();

    console.log(  thisTab, injectionDelay, fileSource, localhostPort, hotReload, https);

    if (fileSource) setDOMElementProperty('fileSource', 'value', fileSource);

    if (injectionDelay) setDOMElementProperty('injectionDelay', 'value', injectionDelay);

    if (localhostPort) setDOMElementProperty('localhostPort', 'value', localhostPort);

    if (hotReload !== null) setDOMElementProperty('hotReload', 'checked', hotReload );

    if (https  !== null ) setDOMElementProperty('https', 'checked', https );


    document.querySelectorAll('input').forEach(element => element.addEventListener('blur', () => {
        setLocalStorage();
    }));

    document.getElementById('fileSubmit').addEventListener('click', () => {

        setLocalStorage();

        const {
            injectionDelay,
            localhostPort,
            https,
            thisTab,
            hotReload,
        } = getLocalStorage();

        let { fileSource } = getLocalStorage();

        initializeHotReload(fileSource,localhostPort, https,thisTab, hotReload);

        if (isUrl(fileSource)) {
            sendMessageToContent({ action: 'setFileSource', fileSource, injectionDelay, hotReload });

        } else if (!isUrl(fileSource) && testConnection()) {
            const uriEncodedFileSource = encodeURIComponent(fileSource);
            const protocol = https ? 'https' : 'http'; 
            
            fileSource = `${protocol}://localhost:${localhostPort}/files/${uriEncodedFileSource}`;

            sendMessageToContent({ action: 'setFileSource', fileSource, injectionDelay, hotReload });

        } else {
            setDOMElementProperty('message', 'innerText', '*npm filesystem-server to access filesystem');
        }

    });

    document.getElementById('connectionStatus').addEventListener('click', () => {
        testConnection();
    });

    document.getElementById('removeFile').addEventListener('click', () => {
        sendMessageToContent({ action: 'stopInjection' });
    });

    document.getElementById('injectionDelay').addEventListener('change', (e) => {
        const injectionDelay = e.target.value;
        setTabPropertyToStorage('injectionDelay',injectionDelay);
    });

    document.getElementById('localhostPort').addEventListener('change', (e) => {
        const localhostPort = e.target.value;
        setTabPropertyToStorage('localhostPort',localhostPort);
    });

    document.getElementById('fileSource').addEventListener('change', (e) => {
        const fileSource = e.target.value;
        setTabPropertyToStorage('fileSource',fileSource);
    });

    document.getElementById('https').addEventListener('change', (e) => {
        const https = e.target.checked;
        setTabPropertyToStorage('https',https);
    });

    document.getElementById('hotReload').addEventListener('change', (e) => {
        const hotReload = e.target.checked;
        const { thisTab,fileSource, localhostPort, https } = getLocalStorage();
        setTabPropertyToStorage('hotReload',hotReload);
        initializeHotReload(fileSource,localhostPort, https,thisTab, hotReload);
    });
    
});

const testInjectorStatus = async () => {
    sendMessageToContent({ action: 'requestStatus' });
};

const sendMessageToContent = (args) => {
    // const fileSource = args.fileSource;

    // const { thisTab } = getLocalStorage();

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

        console.log(`Current Tab Id: ${tabs[0].id}`);

        chrome.tabs.sendMessage(tabs[0].id, args, res => handleResponse(res));
    });
};

const handleResponse = (res) => {
    const isInjectorActive = res && res.isInjectorActive ? res.isInjectorActive : 'false';
    // console.log(isInjectorActive);
    switch (isInjectorActive) {
        case 'true':
            setDOMElementProperty('injectorBadge', 'backgroundColor', '#00d000');
            setDOMElementProperty('injectorText', 'innerText', 'INJECTION ACTIVE');
            chrome.browserAction.setBadgeBackgroundColor({ color: [0, 208, 0, 100] });
            chrome.browserAction.setBadgeText({ text: "ON" });
            break;
        case 'false':
        default:
            setDOMElementProperty('injectorBadge', 'backgroundColor', '#ff2f23');
            setDOMElementProperty('injectorText', 'innerText', 'INJECTION INACTIVE');
            chrome.browserAction.setBadgeBackgroundColor({ color: [255, 47, 35, 100] });
            chrome.browserAction.setBadgeText({ text: "OFF" });
            break;
    }

};


const setDOMElementProperty = (nodeId, property, value) => {
    if (property === 'backgroundColor') {
        document.getElementById(nodeId).style.backgroundColor = value;
    } else document.getElementById(nodeId)[property] = value;
    return;
};

const isUrl = (string) => {
    const urlPattern = /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i;
    // console.log(urlPattern.test(string));
    return urlPattern.test(string);
};


const getTabId = async () => {
    const getTabId = new Promise( (resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            resolve(tabs[0].id);
        });
    });
    const thisTab = await getTabId.then(tabId => tabId);
    localStorage.setItem('thisTab', thisTab);
    console.log(`this tab id: ${thisTab}`);
    return thisTab;
};

const initializeHotReload = (fileSource,localhostPort, https,thisTab, hotReload) => {
    if(fileSource && fileSource !== '' && fileSource !== undefined){
        chrome.runtime.sendMessage({action: "reload",localhostPort, https,thisTab, fileSource, hotReload}, res => console.log(res));
    }
    return;
}
