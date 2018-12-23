



document.addEventListener('DOMContentLoaded', async () => {

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
        watchJSON,
    } = getLocalStorage();

    console.log(watchJSON);

    console.log(thisTab, injectionDelay, fileSource, localhostPort, hotReload, https, watchJSON);

    if (fileSource) setDOMElementProperty('fileSource', 'value', fileSource);

    if (injectionDelay) setDOMElementProperty('injectionDelay', 'value', injectionDelay);

    if (localhostPort) setDOMElementProperty('localhostPort', 'value', localhostPort);

    if (hotReload !== null) setDOMElementProperty('hotReload', 'checked', hotReload);

    if (https !== null) setDOMElementProperty('https', 'checked', https);

    if (watchJSON !== null) setDOMElementProperty('watchJSON', 'checked', watchJSON);


    document.querySelectorAll('input').forEach(element => element.addEventListener('blur', () => {
        setLocalStorage();
    }));

    document.getElementById('connectionStatus').addEventListener('click', () => {
        testConnection();
    });

    document.getElementById('injectionDelay').addEventListener('change', (e) => {
        const injectionDelay = e.target.value;
        setTabPropertyToStorage('injectionDelay', injectionDelay);
    });

    document.getElementById('localhostPort').addEventListener('change', (e) => {
        const localhostPort = e.target.value;
        setTabPropertyToStorage('localhostPort', localhostPort);
    });

    document.getElementById('fileSource').addEventListener('change', (e) => {
        const fileSource = e.target.value;
        setTabPropertyToStorage('fileSource', fileSource);
    });

    document.getElementById('https').addEventListener('change', (e) => {
        const https = e.target.checked;
        setTabPropertyToStorage('https', https);
    });

    document.getElementById('hotReload').addEventListener('change', (e) => {
        const hotReload = e.target.checked;
        const { thisTab, fileSource, localhostPort, https, watchJSON } = getLocalStorage();
        setTabPropertyToStorage('hotReload', hotReload);
        initializeHotReload(fileSource, localhostPort, https, thisTab, hotReload, watchJSON);
    });

    document.getElementById('watchJSON').addEventListener('change', (e) => {
        const watchJSON = e.target.checked;
        const fssConnected = localStorage.getItem('fss-connected');
        const { thisTab, fileSource, localhostPort, https } = getLocalStorage();
        setTabPropertyToStorage('watchJSON', watchJSON);
        console.log(fssConnected);
        if (fssConnected === 'false') setDOMElementProperty('injectFile', 'checked', false);
        initializeHotReload(fileSource, localhostPort, https, thisTab, hotReload, watchJSON);
    });

    document.getElementById('injectFile').addEventListener('change', (e) => {
        const injectFile = e.target.checked;
        console.log(injectFile);
        switch (injectFile) {
            case true:
                injectFileON();
                break;
            case false:
            default:
                sendMessageToContent({ action: 'stopInjection' });
                break;
        }
    });

});

const testInjectorStatus = async () => {
    sendMessageToContent({ action: 'requestStatus' });
};

const sendMessageToContent = (args) => {

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

        console.log(`Current Tab Id: ${tabs[0].id}`);

        chrome.tabs.sendMessage(tabs[0].id, args, res => handleResponse(res));
    });
};

const handleResponse = (res) => {
    const isInjectorActive = res && res.isInjectorActive ? res.isInjectorActive : 'false';
    const fssConnected = localStorage.getItem('fss-connected');
    switch (isInjectorActive) {
        case 'true':
            setDOMElementProperty('injectorBadge', 'backgroundColor', '#4F9FA7');
            setDOMElementProperty('injectorText', 'innerText', 'INJECTION ACTIVE');
            if (fssConnected) setDOMElementProperty('injectFile', 'checked', true);
            else setDOMElementProperty('injectFile', 'checked', false);
            chrome.browserAction.setBadgeBackgroundColor({ color: [0, 208, 0, 100] });
            chrome.browserAction.setBadgeText({ text: "ON" });
            break;
        case 'false':
        default:
            setDOMElementProperty('injectorBadge', 'backgroundColor', '#ff2f23');
            setDOMElementProperty('injectorText', 'innerText', 'INJECTION INACTIVE');
            setDOMElementProperty('injectFile', 'checked', false);
            setDOMElementProperty('error', 'innerText', 'injection inactive');
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
    const getTabId = new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            resolve(tabs[0].id);
        });
    });
    const thisTab = await getTabId.then(tabId => tabId);
    localStorage.setItem('thisTab', thisTab);
    console.log(`this tab id: ${thisTab}`);
    return thisTab;
};

const initializeHotReload = (fileSource, localhostPort, https, thisTab, hotReload, watchJSON) => {
    if (fileSource && fileSource !== '' && fileSource !== undefined) {
        chrome.runtime.sendMessage({ action: "reload", localhostPort, https, thisTab, fileSource, hotReload, watchJSON }, res => console.log(res));
    }
    return;
};


const injectFileON = () => {
    const isConnectionActive = testConnection();
    if(isConnectionActive){
        setLocalStorage();

        const {
            injectionDelay,
            localhostPort,
            https,
            thisTab,
            hotReload,
            watchJSON,
        } = getLocalStorage();
    
        let { fileSource } = getLocalStorage();
    
        initializeHotReload(fileSource, localhostPort, https, thisTab, hotReload, watchJSON);
    
        if (isUrl(fileSource)) {
            sendMessageToContent({ action: 'setFileSource', fileSource, injectionDelay, hotReload, watchJSON });
    
        } else if (!isUrl(fileSource) && testConnection()) {
            const uriEncodedFileSource = encodeURIComponent(fileSource);
            const protocol = https ? 'https' : 'http';
    
            fileSource = `${protocol}://localhost:${localhostPort}/files/${uriEncodedFileSource}`;
    
            sendMessageToContent({ action: 'setFileSource', fileSource, injectionDelay, hotReload, watchJSON });
    
        } else {
            setDOMElementProperty('message', 'innerText', '*npm filesystem-server to access filesystem');
        }
    } else {

        setDOMElementProperty('injectFile', 'checked', false);
        setDOMElementProperty('error', 'innerText', 'filesystem-server not connected');
    }
   
};
