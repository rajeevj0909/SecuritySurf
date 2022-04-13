chrome.runtime.onInstalled.addListener(function() {
    let expertiseChosen= "beginner";
    let popupOption= "yes";
    let extensionOptions={"expertiseChosen":expertiseChosen, "popupOption":popupOption}
    chrome.storage.sync.set({"extensionOptions": extensionOptions});
    console.log("Default settings have been set.");
});

//Print all storage & clear storage
//chrome.storage.sync.get(null, function (data) { console.info(data) });
//chrome.storage.sync.clear()