
document.addEventListener('DOMContentLoaded', async() => {

    setLocalStorage();

    testConnection();

    testInjectorStatus();

    const {
        thisTab,
        injectionDelay,
        fileSource,
        localhostPort,
        hotReload,
        https,
    } = getLocalStorage();

    console.log(thisTab, fileSource);
    // setTabDetails(fileSource);

    if (fileSource) setDOMElementProperty('fileSource', 'value', fileSource);

    if (injectionDelay) setDOMElementProperty('injectionDelay', 'value', injectionDelay);

    if (localhostPort) setDOMElementProperty('localhostPort', 'value', localhostPort);

    if (hotReload) setDOMElementProperty('hotReload', 'checked', hotReload === 'true' ? true : false);

    if (https) setDOMElementProperty('https', 'checked', https === 'true' ? true : false);


    document.querySelectorAll('input').forEach(element => element.addEventListener('blur', () => {
        setLocalStorage();
    }));

    document.getElementById('fileSubmit').addEventListener('click', () => {

        setLocalStorage();

        const {
            injectionDelay,
            localhostPort,
            https,
        } = getLocalStorage();

        let { fileSource } = getLocalStorage();

        if (isUrl(fileSource)) {
            sendMessageToContent({ action: 'setFileSource', fileSource, injectionDelay });

        } else if (!isUrl(fileSource) && testConnection()) {
            const uriEncodedFileSource = encodeURIComponent(fileSource);
            const protocol = https ? 'https' : 'http'; 
            
            fileSource = `${protocol}://localhost:${localhostPort}/files/${uriEncodedFileSource}`;
            // fileSource = `https://localhost:4444/files/${uriEncodedFileSource}`;
            // console.log(fileSource);
            // fileSource = `http://localhost:${localhostPort}${fileSource}`;

            sendMessageToContent({ action: 'setFileSource', fileSource, injectionDelay });

        } else {
            setDOMElementProperty('message', 'innerText', '* start serverify to access filesystem');
        }

    });

    document.getElementById('connectionStatus').addEventListener('click', () => {
        testConnection();
    });

    document.getElementById('removeFile').addEventListener('click', () => {
        sendMessageToContent({ action: 'stopInjection' });
    });


    document.getElementById('hotReload').addEventListener('change', (e) => {
        const hotReload = e.target.checked;
        setTabPropertyToStorage('hotReload',hotReload);
    });

    document.getElementById('https').addEventListener('change', (e) => {
        const https = e.target.checked;
        setTabPropertyToStorage('https',https);
    });
    
});


const testConnection = async () => {
    try {
        const { localhostPort } = getLocalStorage();
        const url = `http://localhost:${localhostPort}/testFSSConnection`;
        const res = await fetch(url);
        if (res.ok) {
            const json = await res.json();
            if (json.fssConnected === 'true') {
                setDOMElementProperty('connectionStatus', 'innerText', 'FSS CONNECTED');
                setDOMElementProperty('connectionBadge', 'backgroundColor', '#00d000');
                setDOMElementProperty('message', 'innerText', '');
                console.log('connected');
                return true;
            } else {
                setDOMElementProperty('connectionStatus', 'innerText', 'CLICK TO TRY AGAIN');
                setDOMElementProperty('connectionBadge', 'backgroundColor', 'orange');
                console.log('uncertain');
                return false;
            }
        }
    } catch (err) {
        console.log(err);
        setDOMElementProperty('connectionStatus', 'innerText', 'FSS NOT CONNECTED');
        setDOMElementProperty('connectionBadge', 'backgroundColor', '#ff2f23');
        console.log('not connected');
        return false;
    }
};
// http://localhost:2222/files/%2FUsers%2Frecreate%2Fdev.js
const testInjectorStatus = async () => {
    sendMessageToContent({ action: 'requestStatus' });
};

const sendMessageToContent = (args) => {
    const fileSource = args.fileSource;

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
    return thisTab;
};
