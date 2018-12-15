

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('injectorFileSource')) {
        document.getElementById('fileSource').value = localStorage.getItem('injectorFileSource');
    }

    if (localStorage.getItem('injectionDelay')) {
        document.getElementById('injectionDelay').value = localStorage.getItem('injectionDelay');
        document.getElementById('injectionDelay').placeholder = localStorage.getItem('injectionDelay');
    }

    document.getElementById('fileSubmit').addEventListener('click', () => {
        let fileSource = document.getElementById('fileSource').value;
        let injectionDelay = document.getElementById('injectionDelay').value;
        setLocalStorage(injectionDelay, fileSource);

        sendMessageToContent({ action: 'setFileSource', fileSource, injectionDelay });
    });

    document.getElementById('removeFile').addEventListener('click', () => {
        // removeLocalStorage();
        sendMessageToContent({ action: 'removeFile'});
    });

});

const sendMessageToContent = (args) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, args, function (response) {
            console.log(response);
        });
    });
};

const setLocalStorage = (injectionDelay, fileSource) => {
    localStorage.setItem('injectionDelay', injectionDelay);
    localStorage.setItem('injectorFileSource', fileSource);
};

const removeLocalStorage = () => {
    localStorage.removeItem('injectionDelay');
    localStorage.removeItem('injectorFileSource');
};
