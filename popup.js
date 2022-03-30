//Begin as a beginner
let profileSetting = 'beginner';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ profileSetting });
  console.log("You are rated as a "+ profileSetting);
});


