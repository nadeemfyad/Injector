

document.addEventListener('DOMContentLoaded', function () {
    chrome.extension.onMessage.addListener((msg, sender, sendResponse) => {

        const { action } = msg;
        switch (action) {
            case 'setFileSource':
                handleFileInjection(msg);
                sendResponse('ok');
                break;
            case 'stopInjection':
                removeFile();
                sendResponse('ok');
            default:
                break;
        }
    });

});

const handleFileInjection = (args) => {
    fetch('http://localhost:5011/pages/index').then(res => {
        res.text().then((text) => console.log(text));
    });
    const {
        fileSource,
        injectionDelay,
    } = args;
    console.log(args);
    setLocalStorage(fileSource,injectionDelay);
    injectTag();
};

const setLocalStorage = (fileSource,injectionDelay) => {
    localStorage.setItem('Inject', true);
    localStorage.setItem('injectorFileSource', fileSource);
    localStorage.setItem('injectorDelay', injectionDelay);
};

const injectTag = () => {
    const shouldInject = localStorage.getItem('Inject');
    const fileStorage = localStorage.getItem('injectorFileSource');
    const injectionDelay = localStorage.getItem('injectorDelay');

    if(shouldInject && doesExists(fileStorage)){
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
    localStorage.setItem('Inject', false);
    localStorage.removeItem('injectorFileSource');
    localStorage.removeItem('injectorDelay');
};

const doesExists = (arg) => {
    return arg && arg !== undefined && arg !== '';
};

injectTag();
