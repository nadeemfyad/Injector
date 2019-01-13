

const testWatchers = async () => {
    try {
        const {
            localhostPort,
            https,
            hotReload,
            watchJSON,
        } = getLocalStorage();
        if (localhostPort) {
            const protocol = https ? 'https' : 'http';
            const urlWatchers = `${protocol}://localhost:${localhostPort}/testWatchers`;
            const resWatchers = await fetch(urlWatchers,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    method: 'POST',
                    body: JSON.stringify({ hotReload, watchJSON }),
                });
            if (resWatchers.ok) {
                const jsonWatchers = await resWatchers.json();

                if (jsonWatchers.fssWatchersConsistent === 'true') {
                    return true;
                } else {
                    return false;
                }
            }
        } else { return false; }
    } catch (err) {
        console.log(err);
        return false;
    }
};

const testConnection = async () => {
    const {
        fileSource,
        localhostPort,
        https,
    } = getLocalStorage();

    const isUrl = checkIsUrl(fileSource);
    console.log(isUrl);
    if (localhostPort && !isUrl) {
        const protocol = https ? 'https' : 'http';
        const url = `${protocol}://localhost:${localhostPort}/testFSSConnection`;
        const res = await fetch(url).catch(((err) => { console.log(err); }));
        if (res && res.ok) {
            const json = await res.json();
            if (json.fssConnected === 'true') {
                setDOMElementProperty('connectionStatus', 'innerText', 'FSS CONNECTED');
                setDOMElementProperty('connectionBadge', 'backgroundColor', '#1beabd');
                localStorage.setItem('fss-connected', true);
                setDOMElementProperty('message', 'innerText', '');
                setDOMElementProperty('error', 'innerText', ' ');
                console.log('connected');
                return true;
            } else {
                setDOMElementProperty('connectionStatus', 'innerText', 'CLICK TO TRY AGAIN');
                setDOMElementProperty('connectionBadge', 'backgroundColor', 'orange');
                localStorage.setItem('fss-connected', false);
                console.log('uncertain');
                return false;
            }
        } else {
            setDOMElementProperty('connectionStatus', 'innerText', 'FSS NOT CONNECTED');
            setDOMElementProperty('connectionBadge', 'backgroundColor', '#FF4600');
            localStorage.setItem('fss-connected', false);
            setDOMElementProperty('injectFile', 'checked', false);
            setDOMElementProperty('message', 'innerText', '');
            setDOMElementProperty('error', 'innerText', 'No Connection. Check url, port and that fss is running.');
        }
    } else if(!localhostPort &&!isUrl){
        setDOMElementProperty('connectionStatus', 'innerText', 'FSS NOT CONNECTED');
        setDOMElementProperty('connectionBadge', 'backgroundColor', '#FF4600');
        localStorage.setItem('fss-connected', false);
        setDOMElementProperty('injectFile', 'checked', false);
    } else if(isUrl){
        const { fileHost } = deconstructUrl(fileSource);
        setDOMElementProperty('connectionStatus', 'innerText', 'FSS NOT NEEDED');
        setDOMElementProperty('connectionBadge', 'backgroundColor', '#00a2ff');
        localStorage.setItem('fss-connected', false);
        setDOMElementProperty('message', 'innerText', `Fetching from ${fileHost}`);
        setDOMElementProperty('error', 'innerText', '');
    }
};


const testFileFetch = async (fileSource) => {
    const fileSourceTest = fileSource.replace('/files/', '/exists/');

    const res = await fetch(fileSourceTest).catch(((err) => { console.log(err); }));
    console.log(res);
    if (res && res.ok) {
        const json = await res.json();

        if (json.fileExists === 'true') {
            // setDOMElementProperty('injectFile', 'checked', true);
            // setDOMElementProperty('error', 'innerText', '');
            return true;
        } else {
            setDOMElementProperty('injectFile', 'checked', false);
            setDOMElementProperty('error', 'innerText', 'file not found');
            return false;
        }
    } else {
        setDOMElementProperty('connectionStatus', 'innerText', 'FSS NOT CONNECTED');
        setDOMElementProperty('connectionBadge', 'backgroundColor', '#FF4600');
        localStorage.setItem('fss-connected', false);
        setDOMElementProperty('injectFile', 'checked', false);
        setDOMElementProperty('error', 'innerText', 'Cannot reach the file. Check url, port and that fss is running.');
        return false
    }
};
