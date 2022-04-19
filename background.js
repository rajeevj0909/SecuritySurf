//Initialise storage on first install
chrome.runtime.onInstalled.addListener(function(details) {
    let expertiseChosen= "beginner";
    let popupOption= "yes";
    let TTLValue= "86400000";//1 Day in Milliseconds
            TTLValue= "15000";//15 Seconds for testing <-----------------------------------
    let whiteList = ["www.google.com"];
    let extensionOptions={
        "expertiseChosen":expertiseChosen,
        "popupOption":popupOption,
        "TTLValue":TTLValue,
        "whiteList":whiteList}
    chrome.storage.sync.set({"extensionOptions": extensionOptions});
    chrome.storage.sync.set({"websitesVisited": {}});
    console.log("Default settings have been set.");
    //Refresh all the tabs to collect scores immediately
    chrome.tabs.query({windowType:'normal'}, function(tabs) {
        for(var i = 0; i < tabs.length; i++) {
            chrome.tabs.update(tabs[i].id, {url: tabs[i].url});
        }
    }); 
    //If it's a first install, go to the options page
    if(details.reason == "install"){
        chrome.tabs.create({ 'url':'chrome-extension://'+chrome.runtime.id+"/options.html"});
    }
});

//Cleans up links that have a set TTL 
chrome.tabs.onActivated.addListener(function() { //For testing
//chrome.windows.onCreated.addListener(function() { //For production
    chrome.storage.sync.get(null, function (data) {
        let chosenTTL= data.extensionOptions.TTLValue;
        let allWebsites =  data.websitesVisited;
        //If TTL is turned on
        if (chosenTTL>0){
            //Checks each website to see which are out of date
            for (const [websiteURL, website] of Object.entries(allWebsites)) {
                //Calculate Time Range
                let timeRange= Date.now()-website.TTL;
                //If it's been longer than the user sets, remove from storage
                if (timeRange>chosenTTL){//false
                    delete allWebsites[websiteURL];
                }
            }
            chrome.storage.sync.set({"websitesVisited": allWebsites});
        }//If the user always wants to check new websites, empty the list
        else{
            chrome.storage.sync.set({"websitesVisited": {}});
        }
    });
});

//Print all storage & clear storage
//chrome.storage.sync.get(null, function (data) { console.info(data) });
//chrome.storage.sync.clear()