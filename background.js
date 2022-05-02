//Initialise storage on first install
chrome.runtime.onInstalled.addListener(function(details) {
    let expertiseChosen= "beginner";
    let popupOption= "yes";
    let TTLValue= "86400000";//1 Day in Milliseconds
            //TTLValue= "120000";//120 Seconds for TESTING <-----------------------------------
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
chrome.tabs.onActivated.addListener(function() { //For TESTING <-----------------------------------
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
                if (timeRange>chosenTTL){
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

//Change Icon depending on website score
chrome.runtime.onMessage.addListener(
    function(request, sender) {
        let iconText="⬜";
        //Green Light
        if (request.score>75){
            chrome.action.setBadgeText( { text: iconText, tabId:sender.tab.id } );
            chrome.action.setBadgeBackgroundColor({color: '#0FFF50', tabId:sender.tab.id});
            //chrome.action.setIcon({path:"/assets/trafficLights/SecuritySurfLogo128Green.png",tabId:sender.tab.id});
        }//Amber Light
        else if (request.score>35){
            chrome.action.setBadgeText( { text: iconText, tabId:sender.tab.id } );
            chrome.action.setBadgeBackgroundColor({color: '#F9AF12', tabId:sender.tab.id});
            //chrome.action.setIcon({path:"/assets/trafficLights/SecuritySurfLogo128Amber.png",tabId:sender.tab.id});
        }//Red Light
        else if (request.score<=35){
            chrome.action.setBadgeText( { text: iconText, tabId:sender.tab.id } );
            chrome.action.setBadgeBackgroundColor({color: '#FF3131', tabId:sender.tab.id});
            //chrome.action.setIcon({path:"/assets/trafficLights/SecuritySurfLogo128Red.png",tabId:sender.tab.id});
        }//New website has no score, default image
        else{
            chrome.action.setBadgeText( { text: "", tabId:sender.tab.id } );
            chrome.action.setBadgeBackgroundColor({color: '#2f2f2f', tabId:sender.tab.id});
            //chrome.action.setIcon({path:"/assets/SecuritySurfLogo128.png",tabId:sender.tab.id});
        }
        return(true);
    }
);

//Print all storage & clear storage
//chrome.storage.sync.get(null, function (data) { console.info(data) });
//chrome.storage.sync.clear()

/*
Extension Colours:
    Dark Blue: #2F4E9D OR rgb(47,78,157)
    Medium Blue: #2680C3 OR rgb(38,128,195)
    Light Blue: #29B5CA OR rgb(41,181,202)
*/
