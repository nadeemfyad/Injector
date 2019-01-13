



document.addEventListener('DOMContentLoaded', async () => {

    await trimLocalStorageTabs();

    const tabID = await getTabId();
    localStorage.setItem('thisTab', tabID);

    await testConnection();


    setFormValuesFromStorage();

    setLocalStorage();

    let params = await initializeContentMessageAction({ action: 'requestStatus' });

    handleParamsForGraphic(params);

    setupFormAction(params);

    document.querySelectorAll('input').forEach(element => element.addEventListener('blur', async () => {
        console.log('chnage');
        let params = await initializeContentMessageAction({ action: 'requestStatus' });
        setLocalStorage();
        setupFormAction(params);
    }));


    document.getElementById('binIcon').addEventListener('click', async () => {
        const {
            localhostPort,
            https,
        } = getLocalStorage();

        sendMessageToBackground({ action: 'clearData', localhostPort, https });

        clearLocalStorage();

        const params = await initializeContentMessageAction({ action: 'clearLocalStorage' });

        handleParamsForGraphic(params);

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
                toggleInjectFile({ injectFile, formState: 'disable', messageAction: 'setFileSource' });
                break;
            case false:
            default:
                toggleInjectFile({ injectFile, formState: 'enable', messageAction: 'stopInjection' });
                break;
        }

    });

});


const toggleInjectFile = async (args) => {
    const {
        injectFile,
        formState,
        messageAction
    } = args;

    let {
        fileSource,
        hotReload,
    } = getLocalStorage();

    const isUrl = checkIsUrl(fileSource);

    if(!injectFile && !isUrl) toggleLocalForm('show');

    const isConnectionActive = await testConnection();

    if (isConnectionActive || isUrl) {
        setLocalStorage();

        const {
            injectionDelay,
            localhostPort,
            https,
            thisTab,
            watchJSON,
        } = getLocalStorage();

        const filePath = copyString(fileSource);

        if (!isUrl) { fileSource = createLocalhostPath(fileSource, https, localhostPort) };

        if (checkIsNotEmptyUrl() && (isUrl || (!isUrl && await testFileFetch(fileSource)))) {

            hotReload = messageAction === 'stopInjection' ? false : hotReload;

            if (!isUrl) initializeHotReload(filePath, localhostPort, https, thisTab, hotReload, watchJSON);

            actionForm(formState, isUrl);

            const params = await initializeContentMessageAction({ action: messageAction, fileSource, injectionDelay, hotReload, watchJSON });

            handleParamsForGraphic(params);

        } else if (!checkIsNotEmptyUrl()) {
            setDOMElementProperty('error', 'innerText', 'file path can\'t be empty');
            setDOMElementProperty('injectFile', 'checked', false);
            actionForm('enable', isUrl);
        }
    } else {
        setDOMElementProperty('injectFile', 'checked', false);
        setDOMElementProperty('error', 'innerText', 'filesystem-server not connected');
        // chrome.browserAction.setBadgeBackgroundColor({ color: [255, 70, 0, 100] });
        // chrome.browserAction.setBadgeText({ text: "OFF" });
    }

};

const initializeContentMessageAction = async (args) => {

    const response = await sendMessageToContent(args);

    const { isInjectorActive, fileSource } = handleResponseFromContent(response);

    const fssConnected = await testConnection();

    const areWatchersConsistent = await testWatchers();

    return { fssConnected, isInjectorActive, areWatchersConsistent, };

};

const handleResponseFromContent = (res) => {
    const isInjectorActive = res && res.isInjectorActive ? res.isInjectorActive : 'false';
    const fileSource = res && res.fileSource ? res.fileSource : null;
    return { isInjectorActive, fileSource };
};


const handleParamsForGraphic = (params) => {
    const {
        isInjectorActive,
    } = params;

    if (isInjectorActive === 'true') {
        setDOMElementProperty('injectorBadge', 'backgroundColor', '#1beabd');
        setDOMElementProperty('injectorText', 'innerText', 'INJECTION ACTIVE');
    } else {
        setDOMElementProperty('injectorBadge', 'backgroundColor', '#FF4600');
        setDOMElementProperty('injectorText', 'innerText', 'INACTIVE');
    }


};


const setupFormAction = (params) => {

    const {
        fssConnected,
        isInjectorActive,
    } = params;

    const { fileSource } = getLocalStorage();

    const isUrl = checkIsUrl(fileSource);

    if (fssConnected && isInjectorActive === 'true' && checkIsNotEmptyUrl()) {
        actionForm('disable', isUrl);
        setDOMElementProperty('injectFile', 'checked', true);
    }
    else if(isUrl){
        toggleLocalForm('hide');
    } else if(!isUrl){
        toggleLocalForm('show');
    }

}
