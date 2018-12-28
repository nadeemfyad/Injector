let connection;

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
    switch (action) {
        case 'reload':
            const { localhostPort, https, thisTab, fileSource, hotReload, watchJSON } = req;
            toggleHotReload({ localhostPort, https, thisTab, fileSource, hotReload, watchJSON });
            break;
        case 'clearLocalStorage':
            resetLocalStorage();
            break;
        case 'error':
        default:
            console.log(error);
            break;
    }

    });

    const toggleHotReload = async ({ localhostPort, https, thisTab, fileSource, hotReload, watchJSON }) => {
        const protocol = https ? 'wss' : 'ws';
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
            if (connection) connection.close();
            var connection = new WebSocket(url);
            if (connection) {
                connection.onopen = function () {
                    connection.send(JSON.stringify(payLoad));
                };

                connection.onmessage = function (msg) {
                    const json = JSON.parse(msg.data);
                    const {
                        hotReload,
                        error,
                        thisTab,
                    } = json;
                    if (hotReload && !error) { reloadTab(thisTab); }
                };
            }
        },

        reloadTab = (thisTab) => {
            console.log(`reload Tab: ${thisTab}`);
            chrome.tabs.sendMessage(thisTab, { action: "reloadTab" }, function (response) { });
        },

        resetLocalStorage = () => {
            localStorage.removeItem('allTabs');
            localStorage.removeItem('fss-connected');
            localStorage.removeItem('thisTab');
        };
