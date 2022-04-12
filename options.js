//Open page with About section closed
$("#aboutSection").hide();

//Begin as a beginner
let profileSetting = 'beginner';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ profileSetting });
  console.log("You are rated as a "+ profileSetting);
});


//Button opens about section
$("#aboutButton").click(function(){
  $("#aboutSection").toggle(1000);
});
