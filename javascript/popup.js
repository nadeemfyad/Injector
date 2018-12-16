

document.addEventListener('DOMContentLoaded', () => {

    testConnection();

    testInjectorStatus();

    const {
        injectionDelay,
        fileSource,
        localhostPort
    } = getLocalStorage();

    if (fileSource) setDOMElementProperty('fileSource', 'value', fileSource);

    if (injectionDelay) setDOMElementProperty('injectionDelay', 'value', injectionDelay);

    if (localhostPort) setDOMElementProperty('localhostPort', 'value', localhostPort);


    document.getElementById('fileSubmit').addEventListener('click', () => {

        setLocalStorage();

        const {
            injectionDelay,
            localhostPort,
        } = getLocalStorage();

        let {fileSource} = getLocalStorage();

        if (isUrl(fileSource)) {
            sendMessageToContent({ action: 'setFileSource', fileSource, injectionDelay });

        } else if (!isUrl(fileSource) && testConnection()) {
            const uriEncodedFileSource = encodeURIComponent(fileSource); 
            fileSource = `http://localhost:${localhostPort}/files/${uriEncodedFileSource}`;
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
});

const testConnection = async () => {
    try {
        const localhostPort = localStorage.getItem('localhostPort');
        const url = `http://localhost:${localhostPort}/testConnection`;
        const res = await fetch(url);
        if (res.ok) {
            const json = await res.json();
            if(json.fssConnected === 'true'){
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

const testInjectorStatus = async () => {
    sendMessageToContent({ action: 'requestStatus' });
};

const sendMessageToContent = (args) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, args, res => handleResponse(res));
    });
};

const handleResponse = (res) => {
    const isInjectorActive = res && res.isInjectorActive ? res.isInjectorActive : 'false';
        console.log(isInjectorActive);
        switch (isInjectorActive) {
            case 'true':
                setDOMElementProperty('injectorBadge', 'backgroundColor', '#00d000');
                setDOMElementProperty('injectorText', 'innerText', 'INJECTION ACTIVE');
                chrome.browserAction.setBadgeBackgroundColor({color:[0, 208, 0,100]});
                chrome.browserAction.setBadgeText({text:"ON"});
                break;
            case 'false':
            default:
                setDOMElementProperty('injectorBadge', 'backgroundColor', '#ff2f23');
                setDOMElementProperty('injectorText', 'innerText', 'INJECTION INACTIVE');
                chrome.browserAction.setBadgeBackgroundColor({color:[255, 47, 35,100]});
                chrome.browserAction.setBadgeText({text:"OFF"});
                break;
        }

};

const setLocalStorage = () => {
    const injectionDelay = document.getElementById('injectionDelay').value;
    const localhostPort = document.getElementById('localhostPort').value;
    const fileSource = document.getElementById('fileSource').value;

    localStorage.setItem('injectionDelay', injectionDelay);
    localStorage.setItem('localhostPort', localhostPort);
    localStorage.setItem('fileSource', fileSource);

    return;
};

const getLocalStorage = () => {
    const injectionDelay = localStorage.getItem('injectionDelay');
    const fileSource = localStorage.getItem('fileSource');
    const localhostPort = localStorage.getItem('localhostPort');

    return { injectionDelay, fileSource, localhostPort };
};

const removeLocalStorage = () => {
    localStorage.removeItem('injectionDelay');
    localStorage.removeItem('fileSource');
    localStorage.removeItem('localhostPort', localhostPort);
};

const setDOMElementProperty = (nodeId, property, value) => {
    if (property === 'backgroundColor') {
        document.getElementById(nodeId).style.backgroundColor = value;
    } else document.getElementById(nodeId)[property] = value;
    return;
};

const isUrl = (string) => {
    const urlPattern = /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i;
    console.log(urlPattern.test(string));
    return urlPattern.test(string);
};
