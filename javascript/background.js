


chrome.tabs.onRemoved.addListener(function(tabid, removed) {
    let allTabs = localStorage.getItem('allTabs');

    if(allTabs && allTabs !== ''){
        allTabs = JSON.parse(allTabs);

        console.log(`${tabid} closed, removing it..`);

        if(allTabs.hasOwnProperty([tabid])){
            delete allTabs[tabid];
            console.log(allTabs);
            localStorage.setItem('allTabs',JSON.stringify(allTabs));
        }
    } else return;
});



// let allTabs = localStorage.getItem('allTabs');
/*
On startup, connect to the "ping_pong" app.
*/

// var port = chrome.runtime.connectNative("com.recreate.filesystem_server");
// if (port)
//     {
//        console.log("connectNative() returned a non-null port ->",port.name);
//     }
// chrome.runtime.sendNativeMessage('com.recreate.filesystem_server', {msg:'recreate message!'}, (res)=>{
//     var lastError = chrome.runtime.lastError;
//     if (lastError) {
//         console.log(lastError.message);
//         // 'Could not establish connection. Receiving end does not exist.'
//         return;
//     }
//     console.log('sent');
//     console.log(res);
//     return true;
// });

// port.onDisconnect.addListener( (port)=>{
//     console.log('disconnected');
//     console.log(port);
//     if (port)
//     {
//        console.log("disconnected() returned a non-null port ->",port.name);
//     }
// });

/*
Listen for messages from the app.
*/
// if (port)
// console.log(port);

// port.onMessage.addListener((response) => {
//   console.log("Received: " + response);
//   return true;
// });

// port.postMessage({'value':'ciao'});

/*
On a click on the browser action, send the app a message.
// */
// chrome.browserAction.onClicked.addListener(() => {
//   console.log("Sending:  ping");
//   port.postMessage("ping");
// });
