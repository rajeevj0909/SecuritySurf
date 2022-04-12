chrome.runtime.onInstalled.addListener(function() {
    let expertiseChosen= "beginner";
    chrome.storage.sync.set({"profileSetting": expertiseChosen});
    let popupOption= "yes";
    chrome.storage.sync.set({"popupOption": popupOption});
    console.log("Default settings have been set.");
});