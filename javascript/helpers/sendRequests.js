const testConnection = async () => {
    try {
        const {
            localhostPort,
            https,
        } = getLocalStorage();
        const protocol = https ? 'https' : 'http';
        const url = `${protocol}://localhost:${localhostPort}/testFSSConnection`;
        console.log(url);
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
