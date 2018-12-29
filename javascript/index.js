
document.addEventListener('DOMContentLoaded', function () {

    chrome.extension.onMessage.addListener((msg, sender, sendResponse) => {
        const { action } = msg;
        const {
            isInjectorActive,
            injectorFileSource,
        } = getLocalStorage();
        // console.log(action);
        // console.log(isInjectorActive);
        switch (action) {
            case 'setFileSource':
                handleFileInjection(msg);
                sendResponse({ isInjectorActive: 'true' });
                break;
            case 'stopInjection':
                removeFile();
                sendResponse({ isInjectorActive: 'false' });
                break;
            case 'reloadTab':
                reloadTab();
                break;
            case 'clearLocalStorage':
                clearLocalStorage();
                break;
            case 'requestStatus':
            default:
                console.log('requestStatus');
                sendResponse({ isInjectorActive: isInjectorActive, fileSource: injectorFileSource });
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
        // hotReload,
    } = args;
    // console.log(args);
    setLocalStorage(fileSource, injectionDelay);
    injectTag();
};

const injectTag = () => {

    const {
        isInjectorActive,
        fileStorage,
        injectionDelay,
    } = getLocalStorage();

    if (isInjectorActive && doesExists(fileStorage)) {

        console.log(`Injector :: injecting ${fileStorage} ...`);
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
    // localStorage.removeItem('injectorhotReload');
};

const setLocalStorage = (fileSource, injectionDelay) => {
    localStorage.setItem('isInjectorActive', 'true');
    localStorage.setItem('injectorFileSource', fileSource);
    // localStorage.setItem('injectorhotReload', hotReload);
    localStorage.setItem('injectorDelay', injectionDelay);

};

const getLocalStorage = () => {
    const isInjectorActive = localStorage.getItem('isInjectorActive') || 'false';
    const fileStorage = localStorage.getItem('injectorFileSource');
    const injectionDelay = localStorage.getItem('injectorDelay');
    // const hotReload = localStorage.getItem('injectorhotReload');
    return { isInjectorActive, fileStorage, injectionDelay };
};

const doesExists = (arg) => {
    return arg && arg !== undefined && arg !== '';
};

const clearLocalStorage = () => {
    localStorage.removeItem('injectorDelay');
    localStorage.removeItem('injectorFileSource');
    localStorage.removeItem('isInjectorActive');
};

injectTag();
