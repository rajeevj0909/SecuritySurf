//Get data sent from content script
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  let urlOfWebsite=tabs[0].url;
  let hostNameOfURL= (new URL(urlOfWebsite)).hostname;
  let protocolOfURL= (new URL(urlOfWebsite)).protocol;
  let domainOfURL=psl.parse(hostNameOfURL).domain;

  chrome.storage.sync.get(null, function(data) {
    let websiteData=data.websitesVisited[hostNameOfURL]
    //User Options
    let expertiseChosen=data.extensionOptions.expertiseChosen;
    let popupOption=data.extensionOptions.popupOption;
    let TTLValue=data.extensionOptions.TTLValue;
    let whiteList=data.extensionOptions.whiteList;
    
    //When popup opens, hide all the divs but the first
    $("#extraInfo").children().hide();
    $("#mainPageBox").show();

    //When selected box changes, show selected div
    $("#chooseInfoBox").on('change', function() {
      $("#extraInfo").children().hide();
      $("#"+this.value).show(1000);
      if (this.value=="websiteIssues"){
        $("#mainPageBox").show(500);
        $("#explainPopup").hide();
      }else{
        $("html, body").animate({ scrollTop: $(document).height() }, "slow");
      }
    });

    //IPGeolocationAPI Call
    async function IPGeolocationAPI(url){
      let locationData = new Promise ((resolve, reject) => {
        let websiteWithKey='http://ip-api.com/json/'+url;
        fetch(websiteWithKey)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                let locationData = data;
                resolve(locationData)
                
            })
            .catch(function(error) {
                reject(error);
            });
      })
      let location = await locationData;
      let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      let currentCountry = timezones[timezone].c[0];
      if(currentCountry!=location.countryCode){
        $("#issueList").append("<li>This website is being delivered from another country:  <b>" +countries[location.countryCode]+"</b></li>");
      }
      //If no issues
      if($('#issueList li').length == 0){
        $("#issueList").append("<h2>No Issues Found!</h2>");
      }
    }
    IPGeolocationAPI(hostNameOfURL);

    //URLScanIOAPI Call
    async function URLScanIOAPI(url){
      let WHOISdata = new Promise ((resolve, reject) => {
      let websiteWithKey='https://urlscan.io/api/v1/search/?q='+url;
      fetch(websiteWithKey)
          .then((response) => {
              return response.json();
          })
          .then((data) => {
              resolve(data.results[0].page);
              
          })
          .catch(function(error) {
              reject(error);
          });
      })
      let pageData = await WHOISdata;
      $("#asName").text(pageData.asnname);
    }
    URLScanIOAPI(domainOfURL);

    //Only run if website is recognisable
    if((protocolOfURL=="https:")||(protocolOfURL=="http:")){
      //Issues List
      let issues=[];
      
      //Display score
      try{
        $("#ratedScore").text(websiteData.score +"%")
      }//If data hasn't been loaded
      catch(err) {
        $("body").empty();
        $("body").append("<h1 class='text-justify text-center'>Refresh the page</h1><p class='text-center'>If you keep seeing this message, this website may be on your whitelist.</p><p class='text-center'>Visit the extension options if you think this is a mistake.</p>");
        //chrome.tabs.reload(tabs[0].id);
      }
      //Present Data
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
      if (websiteData.websiteSSL=="false"){
        if(expertiseChosen=="beginner"){issues.push("It is very easy to see the information you send to this website!");}
        if(expertiseChosen=="expert"){issues.push("This website uses no encryption! Data sent & recieved is in plaintext!");}
      }//If most of the other links are within the same domain
      if ((websiteData.hyperlinkInfo.hostNameMatch/websiteData.hyperlinkInfo.noOfLinks)<0.6){
        if(expertiseChosen=="beginner"){issues.push("Most of the links on this page go to other random websites");}
        if(expertiseChosen=="expert"){issues.push("Less than 60% of hyperlinks go to other domains");}
      }//If some of the other links are secure links
      if (((websiteData.hyperlinkInfo.secureSSLMatch/websiteData.hyperlinkInfo.noOfLinks)<0.8)&&(websiteData.hyperlinkInfo.noOfLinks!=0)){
        if(expertiseChosen=="beginner"){issues.push("There are links on this page that aren't secure");}
        if(expertiseChosen=="expert"){issues.push("There exists 1 or more hyperlinks on this page which are not HTTPS!");}
      } //If there are invalid links
      if (websiteData.hyperlinkInfo.falseWebsites>0){
        if(expertiseChosen=="beginner"){issues.push("Some of the links aren't actual websites");}
        if(expertiseChosen=="expert"){issues.push("Hyperlinks on this page do not identify as valid URLs");}
      }//Google Safe Browsing Lookup API
      if (!websiteData.isWebsiteSafe){
        if(expertiseChosen=="beginner"){issues.push("Google Safe Browsing says this website is dangerous to use!!");}
        if(expertiseChosen=="expert"){issues.push("Google Safe Browsing Lookup API flagged this website!!");}
      }//If there are suspicious Iframes
      if (websiteData.suspiciousIframes){
        if(expertiseChosen=="beginner"){issues.push("This website has suspicous content on it!");}
        if(expertiseChosen=="expert"){issues.push("This website has iFrames which has lots of '!important;' values found in it");}
      }

      //Show all issues
      for (item = 0; item < issues.length; item++) {
        $("#issueList").append("<li>"+issues[item]+"</li>");
      }
    } else{
      //Unsupported website
      $("body").empty();
      $("body").append('<h1 class="text-justify text-center">Unrecognised Website</h1>');
    }

    //Save button adds site to whitelist
    $("#openOptionsButton").click(function(){
      chrome.tabs.create({ 'url':'chrome-extension://'+chrome.runtime.id+"/options.html"});
    });

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
    $("#incognitoMode").click(function(){
      chrome.windows.create({ "incognito": true, 'url': urlOfWebsite});
    });
    
    //Save button adds site to whitelist
    $("#reportWebsite").click(function(){
      chrome.tabs.create({ 'url': 'https://www.ncsc.gov.uk/section/about-this-website/report-scam-website'});
    });

    //Help button explains extension functions
    $("#helpButton").click(function(){
      if ($("#chooseInfoBox").find(":selected").val()=="websiteIssues"){
        $("#websiteIssues").toggle(500);
        $("#explainPopup").toggle(500);
      }else{
        $("#chooseInfoBox").val("websiteIssues").change();
        $("#websiteIssues").hide();
        $("#explainPopup").show(1000);
      }//Scroll to bottom
      $("html, body").animate({ scrollTop: $(document).height() }, "slow");
    });

    //Learn more button hides the iFrame and gives them a lesson in cyber security
    $("#learnAboutCertificatesButton").click(function(){
      $("#certInfo iframe").toggle(500);
      $("#learnAboutCertificates").toggle(500);
    });
    $("#learnAboutWHOISButton").click(function(){
      $("#WhoIsInfo iframe").toggle(500);
      $("#learnAboutWHOIS").toggle(500);
    });
    $("#learnAboutTrustPilotButton").click(function(){
      $("#trustPilot iframe").toggle(500);
      $("#learnAboutTrustPilot").toggle(500);
    });

  });
});