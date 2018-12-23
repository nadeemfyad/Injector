const testConnection = async () => {
    try {
        const {
            localhostPort,
            https,
        } = getLocalStorage();
        if (localhostPort) {
            const protocol = https ? 'https' : 'http';
            const url = `${protocol}://localhost:${localhostPort}/testFSSConnection`;
            console.log(url);
            const res = await fetch(url);
            if (res.ok) {
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
            }
        } else {
            setDOMElementProperty('connectionStatus', 'innerText', 'FSS NOT CONNECTED');
            setDOMElementProperty('connectionBadge', 'backgroundColor', '#FF4600');
            localStorage.setItem('fss-connected', false);
            setDOMElementProperty('injectFile', 'checked', false);
        }
    } catch (err) {
        console.log(err);
        setDOMElementProperty('connectionStatus', 'innerText', 'FSS NOT CONNECTED');
        setDOMElementProperty('connectionBadge', 'backgroundColor', '#FF4600');
        localStorage.setItem('fss-connected', false);
        setDOMElementProperty('injectFile', 'checked', false);
        setDOMElementProperty('error', 'innerText', err);

        console.log('not connected');
        return false;
    }
};
