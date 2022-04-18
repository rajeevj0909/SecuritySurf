//Get data sent from content script
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  let urlOfWebsite=tabs[0].url;
  let hostNameOfURL= (new URL(urlOfWebsite)).hostname;
  let protocolOfURL= (new URL(urlOfWebsite)).protocol;

  chrome.storage.sync.get("websitesVisited", function(websiteResults) {
    let websiteData=websiteResults.websitesVisited[hostNameOfURL]
    chrome.storage.sync.get("extensionOptions", function(optionsResult) {
      let expertiseChosen=optionsResult.extensionOptions.expertiseChosen;
      let popupOption=optionsResult.extensionOptions.popupOption;
      let TTLValue=optionsResult.extensionOptions.TTLValue;
      let whiteList=optionsResult.extensionOptions.whiteList;
      
      //When popup opens, hide all the divs but the first
      $("#extraInfo").children().hide();
      $("#websiteIssues").show();

      //When selected box changes, show selected div
      $("#chooseInfoBox").on('change', function() {
        $("#extraInfo").children().hide();
        $("#"+this.value).show();
      });

      //Only run if website is recognisable
      if((protocolOfURL=="https:")||(protocolOfURL=="http:")){
        //Issues List
        let issues=[];
        
        //Display score
        $("#ratedScore").text(websiteData.score +"%");

        //Display iFrames for given URL
        certificateURL="https://sitereport.netcraft.com/?url="+urlOfWebsite+"#ssl_table_section";
        $("#certiciateInfoIFrame").attr("src",certificateURL);
        whoIsURL="https://sitereport.netcraft.com/?url="+urlOfWebsite+"#network_table";
        $("#whoIsIFrame").attr("src",whoIsURL);
        trustPilotURL="https://www.trustpilot.com/review/"+hostNameOfURL;
        $("#trustPilotIFrame").attr("src",trustPilotURL);

        //No SSL Message
        if (websiteData.websiteSSL=="false" && (expertiseChosen=="beginner")){
          issues.push("It is very easy to see the information you send to this website!");
        } else if (websiteData.websiteSSL=="false" && (expertiseChosen=="expert")){
          issues.push("This website uses no encryption! Data sent & recieved is in plaintext!");
        }
        for (item = 0; item < issues.length; item++) {
          $("#issueList").append("<li>"+issues[item]+"</li>");
        }
      } else{
        //Unsupported website
        $("body").empty();
        $("body").append('<h1 class="text-justify text-center">Unrecognised Website</h1>');
      }
      //Save button adds site to whitelist
      $("#saveToWhitelist").click(function(){
        whiteList.push(hostNameOfURL);
        let extensionOptions={
          "expertiseChosen":expertiseChosen,
          "popupOption":popupOption,
          "TTLValue":TTLValue,
          "whiteList":whiteList}
        chrome.storage.sync.set({"extensionOptions": extensionOptions});
        alert("Added!")
      });

      //Save button adds site to whitelist
      $("#openOptionsButton").click(function(){
        chrome.tabs.create({ 'url': 'chrome://extensions/?options=' + chrome.runtime.id });
      });

      //Save button adds site to whitelist
      $("#reportWebsite").click(function(){
        chrome.tabs.create({ 'url': 'https://www.ncsc.gov.uk/section/about-this-website/report-scam-website'});
      });

    });
  });
});

