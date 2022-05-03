function checkScore(){
    //Start score at zero for every website
    let score=0;

    //Get website info
    let url=window.location.href //URL
    let urlHost=window.location.hostname //URL Host
    let urlProtocol=window.location.protocol; //HTTPS or HTTP

    function urlChecker(url){
        let safeWebsite=false;
        var regex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi);
        if (url.match(regex)) {
            safeWebsite=true;
        }return (safeWebsite)
    }
    
    if((urlProtocol=="https:")||(urlProtocol=="http:")){
        //Check for SSL certificate
        function checkSSL(score, urlProtocol){
            let SSLused="N/A";
            if (urlProtocol=="https:"){
                score+=60;
                SSLused="true";
            }else if (urlProtocol=="http:"){ 
                score+=20;
                SSLused="false";
            }
            return [score, SSLused];
        }
        [score, SSLused] = checkSSL(score, urlProtocol);

        //Gets the information about the hyperlinks on the site
        function hyperlinkChecks(urlHost){
            let allLinks=[]
            let hostNameMatch=0;
            let secureSSLMatch=document.links.length;
            let falseWebsites=0;
            //Loops through each hyperlink on webpage
            for(var linkIndex=0; linkIndex<document.links.length; linkIndex++) {
                let link=document.links[linkIndex].href;
                allLinks.push(link);
                linkURL=new URL(link);
                if (linkURL.hostname==urlHost){
                    hostNameMatch+=1;
                }if (linkURL.protocol=="http:"){
                    secureSSLMatch-=1;
                }if (!urlChecker(link)){
                    falseWebsites+=1;
                }
            }return {
                "hostNameMatch":hostNameMatch, "secureSSLMatch":secureSSLMatch, "falseWebsites":falseWebsites,"noOfLinks":document.links.length};
        }
        hyperlinkInfo = hyperlinkChecks(urlHost);
        
        //If most of the other links are within the same domain
        if ((hyperlinkInfo.hostNameMatch/hyperlinkInfo.noOfLinks)>0.6){
            score+=10;
        }//If all the other links are secure links
        if ((hyperlinkInfo.secureSSLMatch/hyperlinkInfo.noOfLinks)>0.6){
            score+=10;
        }//If there are any invalid websites
        if (hyperlinkInfo.falseWebsites>5){
            score-=10;
        }

        //Counts suspicious iFrames
        let suspiciousIframes=0
        setInterval(function(){
            //Gets all iframes on page
            let iFrames = document.getElementsByTagName("iFrame");
            let countIframes=0;
            for (let i = 0; i < iFrames.length; i++) {
                let styleAttribute=iFrames[i].getAttribute("style");
                if(styleAttribute){
                    let countImportant=(styleAttribute.match(/!important;/g) || []).length;
                    //Counts how many "!important;" values are in the css of the iframe
                    if (countImportant>3){
                        countIframes+=1;//If there are more than 3, sign that it's a dangerous popup
                    }
                }
            } //Set max value globally
            if (suspiciousIframes<countIframes){
                suspiciousIframes=countIframes;
            }//If there is atleast 1 suspicious Iframe, set the score to 0
            if (suspiciousIframes){
                score=0;
                storeWebsiteInfo(score,urlHost,SSLused,hyperlinkInfo,isWebsiteSafe,suspiciousIframes);
            }
        }, 60000);//Checks every 60 seconds if IFrames appear

        //SafeBrowsingLookupAPI Call
        function SafeBrowsingLookupAPI (url){
            const googleSafeBrowsingApiKey="";
            let websiteWithKey="https://safebrowsing.googleapis.com/v4/threatMatches:find?key="+googleSafeBrowsingApiKey;
            requestBody=
                {
                    "client": {
                    "clientId":      "securitysurf",
                    "clientVersion": "1.2"
                    },
                    "threatInfo": {
                    "threatTypes":      ["THREAT_TYPE_UNSPECIFIED", "MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                    "platformTypes":    ["ALL_PLATFORMS"],
                    "threatEntryTypes": ["URL"],
                    "threatEntries": [
                        {"url": url} //http://testsafebrowsing.appspot.com/s/phishing.html
                    ]
                    }
                };
            const options = {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(requestBody)
            };
            fetch(websiteWithKey,options)
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    let badResults = data;
                    //If there are no bad results
                    if (Object.keys(badResults).length === 0){
                        storeWebsiteInfo(score,urlHost,SSLused,hyperlinkInfo,true,suspiciousIframes);
                        return(true);
                    }else{
                        storeWebsiteInfo(0,urlHost,SSLused,hyperlinkInfo,false,suspiciousIframes);
                        return(false);
                    }
                    
                })
                .catch(function(error) {
                    return(error);
                });
        }
        let isWebsiteSafe=true; //Default value
        isWebsiteSafe=SafeBrowsingLookupAPI(url);
        
        //Inform user of any vulnerabilities
        chrome.storage.sync.get("extensionOptions", function(result) {
            let expertiseChosen= result.extensionOptions.expertiseChosen;
            let popupOption= result.extensionOptions.popupOption;
            //If user has turned on popups
            if (popupOption=="yes"){
                let whatToTellThem="\nSecurity Surf\n";
                //Unsafe threshold
                if (score<50){
                    whatToTellThem = whatToTellThem.concat("\n This website looks unsafe! Be careful!");
                }
                //No SSL Message
                if (SSLused=="false" && (expertiseChosen=="beginner")){
                    whatToTellThem = whatToTellThem.concat("\n     -It is very easy to see the information you send to this website!");
                } else if (SSLused=="false" && (expertiseChosen=="expert")){
                    whatToTellThem = whatToTellThem.concat("\n     -This website uses no encryption! Data sent & recieved is in plaintext!");
                }//If most of the other hyperlinks are within the same domain
                if ((hyperlinkInfo.hostNameMatch/hyperlinkInfo.noOfLinks)<0.6){
                    if(expertiseChosen=="beginner"){
                        whatToTellThem = whatToTellThem.concat("\n     -Most of the links on this page go to other random websites");}
                    if(expertiseChosen=="expert"){
                        whatToTellThem = whatToTellThem.concat("\n     -Less than 60% of hyperlinks go to other domains");}
                }//If some of the other hyperlinks are secure links
                if (((hyperlinkInfo.secureSSLMatch/hyperlinkInfo.noOfLinks)<0.8)&&(hyperlinkInfo.noOfLinks!=0)){
                    if(expertiseChosen=="beginner"){
                        whatToTellThem = whatToTellThem.concat("\n     -There are links on this page that aren't secure");}
                    if(expertiseChosen=="expert"){
                        whatToTellThem = whatToTellThem.concat("\n     -There exists 1 or more hyperlinks on this page which are not HTTPS!");}
                }//If there are any invalid hyperlinks
                if (hyperlinkInfo.falseWebsites>5){
                    if(expertiseChosen=="beginner"){
                        whatToTellThem = whatToTellThem.concat("\n     -Some of the links aren't actual websites");}
                    if(expertiseChosen=="expert"){
                        whatToTellThem = whatToTellThem.concat("\n     -Hyperlinks on this page do not identify as valid URLs");}
                }
                //If there's something to tell them, SAY IT
                if (whatToTellThem.length>15){
                    alert(whatToTellThem);
                }
            }
        });

        //Listens for popup request of data
        function storeWebsiteInfo(websiteScore,urlHost,websiteSSL,hyperlinkInfo,isWebsiteSafe,suspiciousIframes){
            //Set Icon Colour traffic light
            chrome.runtime.sendMessage({"urlHost": urlHost, "score":score});
            chrome.storage.sync.get("websitesVisited", function(websiteResults){ 
                let oldResults = websiteResults.websitesVisited;
                oldResults[urlHost]={
                    "score":websiteScore, 
                    "TTL":Date.now() , 
                    "websiteSSL":websiteSSL, 
                    "hyperlinkInfo":hyperlinkInfo, 
                    "isWebsiteSafe":isWebsiteSafe, 
                    "suspiciousIframes":suspiciousIframes
                };
                chrome.storage.sync.set({"websitesVisited": oldResults});
            });
        }
        storeWebsiteInfo(score,urlHost,SSLused,hyperlinkInfo,isWebsiteSafe,suspiciousIframes);
    }
}

//Checks whitelist and storage before checking score
chrome.storage.sync.get(null, function (data) {
    let allWebsites =  data.websitesVisited;
    let whiteList= data.extensionOptions.whiteList;
    //If the website visited is not on the whitelist
    //And if the website visited has not already been score before
    if ((!whiteList.includes(window.location.hostname)) && (!allWebsites.hasOwnProperty(window.location.hostname))){
        checkScore();
    }//If website already visited before, give icon traffic light colour
    else if(allWebsites.hasOwnProperty(window.location.hostname)){
        chrome.runtime.sendMessage({"urlHost": window.location.hostname, "score":allWebsites[window.location.hostname].score});
    }    
    //If a file is being uploaded to this website, run another security check for good measure
    //document.getElementByType('input').on('change', function(){checkScore();})
});


