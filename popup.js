//Get data sent from content script
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  let urlOfWebsite=tabs[0].url;
  let hostNameOfURL= (new URL(urlOfWebsite)).hostname;

  chrome.storage.sync.get("websitesVisited", function(websiteResults) {
    let websiteData=websiteResults.websitesVisited[hostNameOfURL]
    chrome.storage.sync.get("extensionOptions", function(optionsResult) {
      let expertiseChosen= optionsResult.extensionOptions.expertiseChosen;
      let popupOption= optionsResult.extensionOptions.popupOption;      

      //Issues List
      let issues=[];
      
      //Display score
      $("#ratedScore").text(websiteData.score +"%");

      //Display iFrame for given URL
      certificateURL="https://sitereport.netcraft.com/?url="+urlOfWebsite+"#ssl_table_section";
      //$("#certiciateInfoIFrame").attr("src",certificateURL);

      //No SSL Message
      if (websiteData.websiteSSL=="false" && (expertiseChosen=="beginner")){
        issues.push("It is very easy to see the information you send to this website!");
      } else if (websiteData.websiteSSL=="false" && (expertiseChosen=="expert")){
        issues.push("This website uses no encryption! Data sent & recieved is in plaintext!");
      }
      for (item = 0; item < issues.length; item++) {
        $("#issueList").append("<li>"+issues[item]+"</li>");
      }

    });
  });
});