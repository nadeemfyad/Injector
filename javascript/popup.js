



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

    // console.log(watchJSON);

    // console.log(thisTab, injectionDelay, fileSource, localhostPort, hotReload, https, watchJSON);

    if (fileSource) setDOMElementProperty('fileSource', 'value', fileSource);

    if (injectionDelay) setDOMElementProperty('injectionDelay', 'value', injectionDelay);

    if (localhostPort) setDOMElementProperty('localhostPort', 'value', localhostPort);

    if (hotReload !== null) setDOMElementProperty('hotReload', 'checked', hotReload);

    if (https !== null) setDOMElementProperty('https', 'checked', https);

    if (watchJSON !== null) setDOMElementProperty('watchJSON', 'checked', watchJSON);

    setLocalStorage();

    document.querySelectorAll('input').forEach(element => element.addEventListener('blur', () => {
        setLocalStorage();
    }));


    document.getElementById('binIcon').addEventListener('click', () => {
        const {
            localhostPort,
            https,
        } = getLocalStorage();

        chrome.runtime.sendMessage({ action: 'clearData', localhostPort, https });
        clearLocalStorage();
        sendMessageToContent({ action: 'clearLocalStorage' });
        setDOMElementProperty('fileSource', 'value', '');
    });

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
        const { watchJSON } = getLocalStorage();
        // const { thisTab, fileSource, localhostPort, https, watchJSON } = getLocalStorage();
        if (watchJSON && !hotReload) setDOMElementProperty('watchJSON', 'checked', false);
        setTabPropertyToStorage('hotReload', hotReload);

    });

    document.getElementById('watchJSON').addEventListener('change', (e) => {
        const watchJSON = e.target.checked;
        const fssConnected = localStorage.getItem('fss-connected');
        const { hotReload } = getLocalStorage();
        setTabPropertyToStorage('watchJSON', watchJSON);
        if (watchJSON && !hotReload) setDOMElementProperty('hotReload', 'checked', true);
        if (fssConnected === 'false') setDOMElementProperty('injectFile', 'checked', false);

    });

    document.getElementById('injectFile').addEventListener('change', (e) => {
        const injectFile = e.target.checked;
        console.log('injectFile: ', injectFile);

        switch (injectFile) {
            case true:
                toggleInjectFile({formState: 'disable', messageAction: 'setFileSource'});
                break;
            case false:
            default:
                toggleInjectFile({formState: 'enable', messageAction: 'stopInjection'});
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

const handleResponse = async (res) => {
    const isInjectorActive = res && res.isInjectorActive ? res.isInjectorActive : 'false';
    // const fssConnected = localStorage.getItem('fss-connected');
    const fssConnected = await testConnection();
    const areWatchersConsistent = await testWatchers();
    // console.log(areWatchersConsistent);
    switch (isInjectorActive) {
        case 'true':
            setDOMElementProperty('injectorBadge', 'backgroundColor', '#1beabd');
            setDOMElementProperty('injectorText', 'innerText', 'INJECTION ACTIVE');

            if (fssConnected && areWatchersConsistent) {
                setDOMElementProperty('injectFile', 'checked', true)
                chrome.browserAction.setBadgeBackgroundColor({ color: [68, 189, 169, 100] });
                chrome.browserAction.setBadgeText({ text: "ON" });
                actionForm('disable');
            }
            // else setDOMElementProperty('injectFile', 'checked', false);
         
            break;
        case 'false':
        default:
            setDOMElementProperty('injectorBadge', 'backgroundColor', '#FF4600');
            setDOMElementProperty('injectorText', 'innerText', 'INACTIVE');

            setDOMElementProperty('injectFile', 'checked', false);
            setDOMElementProperty('error', 'innerText', '');
            chrome.browserAction.setBadgeBackgroundColor({ color: [255, 70, 0, 100] });
            chrome.browserAction.setBadgeText({ text: "OFF" });
            actionForm('enable');
            break;
    }

};

const setDOMElementProperty = (nodeId, property, value) => {
    if (property === 'backgroundColor') {
        document.getElementById(nodeId).style.backgroundColor = value;
    } else document.getElementById(nodeId)[property] = value;
    return;
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

const initializeHotReload = (fileSource, localhostPort, https, thisTab, hotReload, watchJSON) => {
    if (fileSource && fileSource !== '' && fileSource !== undefined) {
        chrome.runtime.sendMessage({ action: "reload", localhostPort, https, thisTab, fileSource, hotReload, watchJSON }, res => console.log(res));
    }
    return;
};

const toggleInjectFile = async (args) => {
    const {
        formState,
        messageAction
    } = args;
    const isConnectionActive = testConnection();
    if (isConnectionActive) {
        setLocalStorage();

        const {
            injectionDelay,
            localhostPort,
            https,
            thisTab,
            watchJSON,
        } = getLocalStorage();

        let { fileSource, hotReload, } = getLocalStorage();

        const filePath = '' + fileSource;
        const isUrl = checkIsUrl(fileSource);

        if (!isUrl) {
            const uriEncodedFileSource = encodeURIComponent(fileSource);
            const protocol = https ? 'https' : 'http';
            fileSource = `${protocol}://localhost:${localhostPort}/files/${uriEncodedFileSource}`;
        }

        if (isUrl || (!isUrl /*&& testConnection()*/ && await testFileFetch(fileSource))) {

            hotReload = messageAction === 'stopInjection' ? false : hotReload;

            if(!isUrl) initializeHotReload(filePath, localhostPort, https, thisTab, hotReload, watchJSON);

            actionForm(formState);
            sendMessageToContent({ action: messageAction, fileSource, injectionDelay, hotReload, watchJSON });
        }
        chrome.browserAction.setBadgeBackgroundColor({ color: [68, 189, 169, 100] });
        chrome.browserAction.setBadgeText({ text: "ON" });

    } else {
        setDOMElementProperty('injectFile', 'checked', false);
        setDOMElementProperty('error', 'innerText', 'filesystem-server not connected');
        chrome.browserAction.setBadgeBackgroundColor({ color: [255, 70, 0, 100] });
        chrome.browserAction.setBadgeText({ text: "OFF" });
    }

};


const checkIsUrl = (string) => {
    const urlPattern = /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i;
    return urlPattern.test(string);
};


const actionForm = (action) => {
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
            if(!input.checked){
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
