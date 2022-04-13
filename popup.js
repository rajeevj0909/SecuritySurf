//Get data sent from content script
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {}, function(response) {
    chrome.storage.sync.get("profileSetting", function (result1) {

      //Issues List
      let issues=[];

      //Display score
      $("#ratedScore").text(response.score +"%");

      //Display iFrame for given URL
      certificateURL="https://sitereport.netcraft.com/?url="+response.url+"#ssl_table_section";
      $("#certiciateInfoIFrame").attr("src",certificateURL);

      //No SSL Message
      if (response.SSLused=="false" && (result1.profileSetting=="beginner")){
        issues.push("It is very easy to see the information you send to this website!");
      } else if (response.SSLused=="false" && (result1.profileSetting=="expert")){
        issues.push("This website uses no encryption! Data sent & recieved is in plaintext!");
      }
  
      for (item = 0; item < issues.length; item++) {
        $("#issueList").append("<li>"+issues[item]+"</li>");
      }

    });
  });
});