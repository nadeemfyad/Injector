
    const trimLocalStorageTabs = async() => {
        let allTabs = localStorage.getItem('allTabs');
        allTabs = allTabs && allTabs !== '' ? JSON.parse(allTabs) : [];
        const activeTabs = await getActiveTabs();
        const allTabsKeys = Object.keys(allTabs);
        if(allTabsKeys.length > 0){
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
    
    
    const getActiveTabs = async() => {
        const getActiveTabs = new Promise((resolve, reject) => {
            chrome.tabs.query({}, (tabs) => {
                resolve(tabs);
            });
        });
        const tabs = await getActiveTabs.then(tabs => tabs);
        return tabs;
    };
    