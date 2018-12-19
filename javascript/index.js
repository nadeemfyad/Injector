

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
            case 'requestStatus':
            default:
                console.log('requestStatus');
                sendResponse({isInjectorActive: isInjectorActive});
                break;
        }
    });

});

const handleFileInjection = (args) => {

    const {
        fileSource,
        injectionDelay,
    } = args;
    console.log(args);
    setLocalStorage(fileSource, injectionDelay);
    injectTag();
};

const injectTag = () => {

    const {
        isInjectorActive,
        fileStorage,
        injectionDelay
    } = getLocalStorage();

    if (isInjectorActive && doesExists(fileStorage)) {
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
};

const setLocalStorage = (fileSource, injectionDelay) => {
    localStorage.setItem('isInjectorActive', 'true');
    localStorage.setItem('injectorFileSource', fileSource);
    localStorage.setItem('injectorDelay', injectionDelay);
};

const getLocalStorage = () => {
    const isInjectorActive = localStorage.getItem('isInjectorActive') || 'false';
    const fileStorage = localStorage.getItem('injectorFileSource');
    const injectionDelay = localStorage.getItem('injectorDelay');
    return { isInjectorActive, fileStorage, injectionDelay };
};

const doesExists = (arg) => {
    return arg && arg !== undefined && arg !== '';
};

injectTag();
