
chrome.tabs.onRemoved.addListener(function (tabid, removed) {
    let allTabs = localStorage.getItem('allTabs');

    if (allTabs && allTabs !== '') {
        allTabs = JSON.parse(allTabs);

        console.log(`${tabid} closed, removing it..`);

        if (allTabs.hasOwnProperty([tabid])) {
            delete allTabs[tabid];
            // console.log(allTabs);
            localStorage.setItem('allTabs', JSON.stringify(allTabs));
        }
    } else return;

});

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    const { action } = req;
    if (action === 'reload') {
        const { localhostPort, https, thisTab, fileSource, hotReload, watchJSON } = req;
        console.log(req);
        toggleHotReload({ localhostPort, https, thisTab, fileSource, hotReload, watchJSON });
    } else if (action === 'error'){
        console.log(error);
    }
});

const toggleHotReload = async ({ localhostPort, https, thisTab, fileSource, hotReload, watchJSON }) => {
    const protocol = https ? 'https' : 'http';
    const url = `${protocol}://localhost:${localhostPort}/hotReload/`;
    const payLoad = {
        fileSource,
        hotReload,
        thisTab,
        localhostPort,
        https,
        watchJSON,
    };
    makeHotReloadRequest(url, payLoad);
},

    makeHotReloadRequest = async (url, payLoad) => {

        const res = await fetch(url,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify(payLoad),
            });

        if (res.ok) {
            const json = await res.json();
            // console.log(json);
            const {
                hotReload,
                error,
                thisTab,
            } = json;
            if (hotReload && !error) {
                reloadTab(thisTab);
                try {
                    await makeHotReloadRequest(url, payLoad);
                }catch(err){
                    console.log(err);
                }
            
            }
        }
    },

    reloadTab = (thisTab) => {
        console.log(`reload Tab: ${thisTab}`);
        // sendMessageToContent({ action: 'reloadTab' })
        chrome.tabs.sendMessage(thisTab, { action: "reloadTab" }, function (response) { });
    };
