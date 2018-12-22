

document.addEventListener('DOMContentLoaded', function () {

    chrome.extension.onMessage.addListener((msg, sender, sendResponse) => {
        const { action } = msg;
        const {
            isInjectorActive,
        } = getLocalStorage();
        console.log(action);
        console.log(isInjectorActive);
        switch (action) {
            case 'setFileSource':
                handleFileInjection(msg);
                sendResponse({isInjectorActive : 'true'});
                break;
            case 'stopInjection':
                removeFile();
                sendResponse({isInjectorActive : 'false'});
                break;
            case 'reloadTab':
                reloadTab();
                break;
            case 'requestStatus':
            default:
                console.log('requestStatus');
                sendResponse({isInjectorActive: isInjectorActive});
                break;
        }
    });

});

const reloadTab = () => {
    window.location = window.location;
};

const handleFileInjection = (args) => {

    const {
        fileSource,
        injectionDelay,
        hotReload,
    } = args;
    console.log(args);
    setLocalStorage(fileSource, injectionDelay, hotReload);
    injectTag();
};

const injectTag = () => {

    const {
        isInjectorActive,
        fileStorage,
        injectionDelay,
        hotReload,
    } = getLocalStorage();

    if (isInjectorActive && doesExists(fileStorage)) {

        

        // initializeHotReload(fileSource,localhostPort, https,thisTab, hotReload);

            console.log(fileStorage);
        setTimeout(() => {

            const script = document.createElement('script');
            script.id = 'injectorFile';
            script.type = 'text/javascript';
            script.src = fileStorage;
            script.async = true;
            document.getElementsByTagName('head')[0].appendChild(script);

        }, injectionDelay);
    }
};

const removeFile = () => {
    localStorage.setItem('isInjectorActive', 'false');
    localStorage.removeItem('injectorFileSource');
    localStorage.removeItem('injectorDelay');
    localStorage.removeItem('injectorhotReload');
};

const setLocalStorage = (fileSource, injectionDelay, hotReload) => {
    localStorage.setItem('isInjectorActive', 'true');
    localStorage.setItem('injectorFileSource', fileSource);
    localStorage.setItem('injectorhotReload', hotReload);
    localStorage.setItem('injectorDelay', injectionDelay);
};

const getLocalStorage = () => {
    const isInjectorActive = localStorage.getItem('isInjectorActive') || 'false';
    const fileStorage = localStorage.getItem('injectorFileSource');
    const injectionDelay = localStorage.getItem('injectorDelay');
    const hotReload = localStorage.getItem('injectorhotReload');
    return { isInjectorActive, fileStorage, injectionDelay, hotReload };
};

const doesExists = (arg) => {
    return arg && arg !== undefined && arg !== '';
};

const initializeHotReload = (fileSource,localhostPort, https,thisTab, hotReload) => {
    if(fileSource && fileSource !== '' && fileSource !== undefined){
        chrome.runtime.sendMessage({action: "reload",localhostPort, https,thisTab, fileSource, hotReload}, res => console.log(res));
    }
    return;
};

injectTag();
