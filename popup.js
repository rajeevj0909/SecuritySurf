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
        $("#ratedScore").text(websiteData.score +"%")  
        $("#domainMatch").text(websiteData.hyperlinkInfo.hostNameMatch+"/"+websiteData.hyperlinkInfo.noOfLinks);
        $("#secureSites").text(websiteData.hyperlinkInfo.secureSSLMatch+"/"+websiteData.hyperlinkInfo.noOfLinks);
        $("#invalidSites").text(websiteData.hyperlinkInfo.falseWebsites);

        //Display iFrames for given URL
        certificateURL="https://sitereport.netcraft.com/?url="+urlOfWebsite+"#ssl_table_section";
        $("#certiciateInfoIFrame").attr("src",certificateURL);
        whoIsURL="https://www.whois.com/whois/"+hostNameOfURL;
        $("#whoIsIFrame").attr("src",whoIsURL);
        trustPilotURL="https://www.trustpilot.com/review/"+hostNameOfURL;
        $("#trustPilotIFrame").attr("src",trustPilotURL);

        //No SSL Message
        if (websiteData.websiteSSL=="false" && (expertiseChosen=="beginner")){
          issues.push("It is very easy to see the information you send to this website!");
        } else if (websiteData.websiteSSL=="false" && (expertiseChosen=="expert")){
          issues.push("This website uses no encryption! Data sent & recieved is in plaintext!");
        }
        //If most of the other links are within the same domain
        if ((websiteData.hyperlinkInfo.hostNameMatch/websiteData.hyperlinkInfo.noOfLinks)<0.6){
          if(expertiseChosen=="beginner"){issues.push("Most of the links on this page go to other random websites");}
          if(expertiseChosen=="expert"){issues.push("Less than 80% of hyperlinks go to other domains");}
        }//If all the other links are secure links
        if (((websiteData.hyperlinkInfo.secureSSLMatch/websiteData.hyperlinkInfo.noOfLinks)!=1)&&(websiteData.hyperlinkInfo.noOfLinks!=0)){
          if(expertiseChosen=="beginner"){issues.push("There are links on this page that aren't secure");}
          if(expertiseChosen=="expert"){issues.push("There exists 1 or more hyperlinks on this page which are not HTTPS!");}
        } //If there are invalid links
        if (websiteData.hyperlinkInfo.falseWebsites>0){
          if(expertiseChosen=="beginner"){issues.push("Some of the links aren't actual websites");}
          if(expertiseChosen=="expert"){issues.push("Hyperlinks on this page do not identify as valid URLs");}
        } 

        for (item = 0; item < issues.length; item++) {
          $("#issueList").append("<li>"+issues[item]+"</li>");
        }
        if(issues.length==0){
          $("#issueList").append("<h2>No Issues Found!</h2>");
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
        chrome.tabs.create({ 'url':'chrome-extension://'+chrome.runtime.id+"/options.html"});
      });

      //Save button adds site to whitelist
      $("#reportWebsite").click(function(){
        chrome.tabs.create({ 'url': 'https://www.ncsc.gov.uk/section/about-this-website/report-scam-website'});
      });

      //Save button adds site to whitelist
      $("#incognitoMode").click(function(){
        chrome.windows.create({ "incognito": true, 'url': urlOfWebsite});
      });

    });
  });
});

