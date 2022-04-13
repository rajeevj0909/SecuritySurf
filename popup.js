//Get data sent from content script
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {}, function(response) {

    //Display score
    $("#score").text(response.score +"%");

    //Display iFrame for given URL
    certificateURL="https://sitereport.netcraft.com/?url="+response.url+"#ssl_table_section";
    $("#certiciateInfoIFrame").attr("src",certificateURL);

  });
});