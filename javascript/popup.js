



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
    await sendMessageToContent({ action: 'requestStatus' });
};

const sendMessageToContent = async (args) => {

    const tabID = await getTabId();
    await chrome.tabs.sendMessage(tabID, args, async res => await handleResponse(res));

};

const handleResponse = async (res) => {
    const isInjectorActive = res && res.isInjectorActive ? res.isInjectorActive : 'false';
    const fssConnected = await testConnection();
    const areWatchersConsistent = await testWatchers();
    
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
            await sendMessageToContent({ action: messageAction, fileSource, injectionDelay, hotReload, watchJSON });
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
