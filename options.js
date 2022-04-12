//Open page with About section closed 
$("#aboutSection").hide();

//When opening options page, restore the options they chose before
chrome.storage.sync.get("profileSetting", function (result1) {
  $("#profile-setting").val(result1.profileSetting).change();
});
chrome.storage.sync.get("popupOption", function (result2) {
  $("#security-popups").val(result2.popupOption).change();
});

//Button saves options to Chrome memory
$("#saveOptions").click(function(){
  let expertiseChosen= $('#profile-setting option:selected').val();
  chrome.storage.sync.set({"profileSetting": expertiseChosen});
  let popupOption= $('#security-popups option:selected').val();
  chrome.storage.sync.set({"popupOption": popupOption});
  alert("Saved!");
});

//Button opens about section
$("#aboutButton").click(function(){
  $("#aboutSection").toggle(1000);
});
