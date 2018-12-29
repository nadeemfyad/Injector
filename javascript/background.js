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
        case 'clearData':
            resetLocalStorage();
            clearWatchers(req);
            break;
        case 'error':
        default:
            console.log(action);
            break;
    }

});

const toggleHotReload = async ({ localhostPort, https, thisTab, fileSource, hotReload, watchJSON }) => {
    const protocol = https ? 'wss' : 'ws';
    const url = `${protocol}://localhost:${localhostPort}/hotReload/`;
    const payLoad = {
        action: 'hotReload',
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

        connection = new WebSocket(url);
        connection.onerror = function (error) { console.log(error); };
        if (connection) {

            connection.onopen = function () {
                connection.send(JSON.stringify(payLoad));
            };

            connection.onclose = (e) =>{
                switch (e.code){
                case 1000:	// Normal close
                    console.log("WebSocket: closed");
                    connection.close();
                    break;
                default:	// Abnormal close
                    console.log("WebSocket closed unexpectedly. Trying to reconnect...");
                    this.open(url);
                    makeHotReloadRequest(url, payLoad);
                    break;
                }
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

    clearWatchers = async (args) => {
        const {
            localhostPort,
            https,
        } = args;
        const protocol = https ? 'wss' : 'ws';
        const url = `${protocol}://localhost:${localhostPort}/hotReload/`;
        if (!connection) {
            connection = new WebSocket(url);
            connection.onopen = function () {
                connection.send(JSON.stringify({ action: 'clearWatchers' }));
                connection.close();
            }
        } else {
            connection.send(JSON.stringify({ action: 'clearWatchers' }));
        };
    };

reloadTab = (thisTab) => {
    console.log(`reload Tab: ${thisTab}`);
    chrome.tabs.sendMessage(thisTab, { action: "reloadTab" }, (response) => { });
},

    resetLocalStorage = () => {
        localStorage.removeItem('allTabs');
        localStorage.removeItem('fss-connected');
        localStorage.removeItem('thisTab');
    };
