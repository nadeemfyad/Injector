
    
    const setLocalStorage =  async () => {

        let allTabs = getObjectFromStorage('allTabs');
        // console.log(allTabs);
        let {
            injectionDelay,
            fileSource,
            localhostPort,
            hotReload,
            https,
        } = getLocalStorage();

        injectionDelay = injectionDelay || document.getElementById('injectionDelay').value;
        localhostPort = localhostPort || document.getElementById('localhostPort').value;
        fileSource = fileSource || document.getElementById('fileSource').value;
        hotReload = hotReload || document.getElementById('hotReload').checked;
        https = https || document.getElementById('https').checked;

        const thisTab = await getTabId();
        // console.log(localhostPort);
        const tabDetails = {
            thisTab,
            injectionDelay,
            fileSource,
            localhostPort,
            hotReload,
            https,
        };
        allTabs[thisTab] = tabDetails;

        setObjectToStorage('allTabs', allTabs);
        localStorage.setItem('thisTab', thisTab);
    },

    getObjectFromStorage = (label) => {
        let object = localStorage.getItem(label);
        return object ? JSON.parse(object) : {};
    },

    setObjectToStorage = (label, object) => {
        localStorage.setItem(label, JSON.stringify(object));
    },

    // removeLocalStorage = () => {
    //     localStorage.removeItem('injectionDelay');
    //     localStorage.removeItem('fileSource');
    //     localStorage.removeItem('hotReload');
    //     localStorage.removeItem('localhostPort');
    //     localStorage.removeItem('https');
    // },

    setTabPropertyToStorage = (property,value) => {
        let allTabs = localStorage.getItem('allTabs');
        let thisTab = localStorage.getItem('thisTab');

        if(allTabs && allTabs !== '' && thisTab !== ''){
            allTabs = JSON.parse(allTabs);
            
            allTabs[thisTab][property] = value;

            localStorage.setItem('allTabs',JSON.stringify(allTabs));
        } else return;
    },

    getLocalStorage = () => {
        const allTabs = getObjectFromStorage('allTabs');
        let thisTab = localStorage.getItem('thisTab');
        if(typeof allTabs === 'object' && allTabs[thisTab]){
            const tabDetails = allTabs[thisTab];
            return { thisTab, injectionDelay, fileSource, localhostPort, hotReload, https } = tabDetails;
        } else return {};
    };
