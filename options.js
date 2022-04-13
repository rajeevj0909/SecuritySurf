//Open page with About section closed 
$("#aboutSection").hide();

//When opening options page, restore the options they chose before
chrome.storage.sync.get("extensionOptions", function(result) {
  let expertiseChosen=result.extensionOptions.expertiseChosen;
  let popupOption=result.extensionOptions.popupOption;
  $("#expertiseChosen").val(expertiseChosen).change();
  $("#securityPopups").val(popupOption).change();
});

//Button saves options to Chrome memory
$("#saveOptions").click(function(){
  let expertiseChosen= $('#expertiseChosen option:selected').val();
  let popupOption= $('#securityPopups option:selected').val();
  let extensionOptions={"expertiseChosen":expertiseChosen, "popupOption":popupOption}
  chrome.storage.sync.set({"extensionOptions": extensionOptions});
  alert("Saved!");
});

//Button opens about section
$("#aboutButton").click(function(){
  $("#aboutSection").toggle(1000);
});
