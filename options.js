chrome.storage.sync.get(null, function (data) { console.info(data) });
//Open page with About section closed 
$("#aboutSection").hide();

//When opening options page, restore the options they chose before
chrome.storage.sync.get("extensionOptions", function(result) {
  //Date all data from storage
  let expertiseChosen=result.extensionOptions.expertiseChosen;
  let popupOption=result.extensionOptions.popupOption;
  let TTLValue=result.extensionOptions.TTLValue;
  let whiteList=result.extensionOptions.whiteList;
  //Restore them back into HTML
  $("#expertiseChosen").val(expertiseChosen).change();
  $("#popupOption").val(popupOption).change();
  $("#TTLValue").val(TTLValue).change();
  for (item = 0; item < whiteList.length; item++) {
    $("#whiteListLinks").append('<div class="col-lg-12 d-flex flex-row p-1"><li>'+whiteList[item]+'</li><button type="button" class="btn btn-danger" name="linkDiv">X</button></div>');
  }
});

//Add Button add link to List
$("#addwhiteListButton").click(function(){
  let linkToAdd=$("#addwhiteList").val();
  if (linkToAdd){
    $("#whiteListLinks").append('<div class="col-lg-12 d-flex flex-row p-1"><li>'+linkToAdd+'</li><button type="button" class="btn btn-danger" name="linkDiv">X</button></div>');
  }
  
  $("#addwhiteList").val("");
});
//Click Enter on keyboard to add link to List
var input = document.getElementById("addwhiteList");
input.addEventListener("keyup", function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    document.getElementById("addwhiteListButton").click();
  }
});

//Remove Button removes link from List
$(document).on('click', "button[name='linkDiv']", function(e){
  var entry = $(this).parent(); 
  entry.remove(); 
});  

//Save Button saves options to Chrome memory
$("#saveOptions").click(function(){
  let expertiseChosen= $('#expertiseChosen option:selected').val();
  let popupOption= $('#popupOption option:selected').val();
  let TTLValue= $('#TTLValue option:selected').val();
  //Gets all the urls from the whitelist
  var whiteList = [];
  $('#whiteListLinks li').each(function(){
    whiteList.push($(this).text());
  });
  let extensionOptions={
    "expertiseChosen":expertiseChosen,
    "popupOption":popupOption,
    "TTLValue":TTLValue,
    "whiteList":whiteList}
  chrome.storage.sync.set({"extensionOptions": extensionOptions});
  alert("Saved!");
});

//About Button opens about section
$("#aboutButton").click(function(){
  $("#aboutSection").toggle(1000);
  //Scroll to bottom
  $("html, body").animate({ scrollTop: $(document).height() }, "slow");
});
