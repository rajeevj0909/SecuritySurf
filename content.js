function checkScore(){
    //Start score at zero for every website
    let score=0;

    //Get website info
    let url=window.location.href //URL
    let urlHost=window.location.hostname //URL Host
    let urlProtocol=window.location.protocol; //HTTPS or HTTP

    function urlChecker(url){
        console.log(url);
    }
    urlChecker(url)

    if((urlProtocol="https:")||(urlProtocol="http:")){
        //Check for SSL certificate
        function checkSSL(score, urlProtocol){
            let SSLused="N/A";
            if (urlProtocol=="https:"){
                score+=60;
                SSLused="true";
            }else if (urlProtocol=="http:"){ 
                score+=0;
                SSLused="false";
            }
            return [score, SSLused];
        }
        [score, SSLused] = checkSSL(score, urlProtocol);

        //Get all the links the website points to
        function hyperlinkChecks(urlHost){
            let allLinks=[]
            let hostNameMatch=0;
            let secureSSLMatch=document.links.length;
            for(var linkIndex=0; linkIndex<document.links.length; linkIndex++) {
                let link=document.links[linkIndex].href;
                allLinks.push(link);
                linkURL=new URL(link);
                if (linkURL.hostname==urlHost){
                    hostNameMatch+=1;
                }if (linkURL.protocol=="http:"){
                    secureSSLMatch-=1;
                }
            }return {
                "hostNameMatch":hostNameMatch, "secureSSLMatch":secureSSLMatch,"noOfLinks":document.links.length};
        }
        hyperlinkInfo = hyperlinkChecks(urlHost);
        
        //If most of the other links are within the same domain
        if ((hyperlinkInfo.hostNameMatch/hyperlinkInfo.noOfLinks)>0.6){
            score+=10;
        }//If all the other links are secure links
        if ((hyperlinkInfo.secureSSLMatch/hyperlinkInfo.noOfLinks)==1){
            score+=10;
        }

        //Inform user of any vulnerabilities
        let whatToTellThem="\nSecurity Surf\n";
        chrome.storage.sync.get("extensionOptions", function(result) {
            let expertiseChosen= result.extensionOptions.expertiseChosen;
            let popupOption= result.extensionOptions.popupOption;

            if (popupOption=="yes"){
                //Unsafe threshold
                if (score<50){
                    whatToTellThem = whatToTellThem.concat("\n This website looks unsafe! Be careful!");
                }

                //No SSL Message
                if (SSLused=="false" && (expertiseChosen=="beginner")){
                    whatToTellThem = whatToTellThem.concat("\n     -It is very easy to see the information you send to this website!");
                } else if (SSLused=="false" && (expertiseChosen=="expert")){
                    whatToTellThem = whatToTellThem.concat("\n     -This website uses no encryption! Data sent & recieved is in plaintext!");
                }
                //Bad Hyperlinks
                //If most of the other links are within the same domain
                if ((hyperlinkInfo.hostNameMatch/hyperlinkInfo.noOfLinks)<0.6){
                    if(expertiseChosen=="beginner"){
                        whatToTellThem = whatToTellThem.concat("\n     -Most of the links on this page go to other random websites");}
                    if(expertiseChosen=="expert"){
                        whatToTellThem = whatToTellThem.concat("\n     -Less than 80% of hyperlinks go to other domains");}
                }//If all the other links are secure links
                if ((hyperlinkInfo.secureSSLMatch/hyperlinkInfo.noOfLinks)!=1){
                    if(expertiseChosen=="beginner"){
                        whatToTellThem = whatToTellThem.concat("\n     -There are links on this page that aren't secure");}
                    if(expertiseChosen=="expert"){
                        whatToTellThem = whatToTellThem.concat("\n     -There exists 1 or more hyperlinks on this page which are not HTTPS!");}
                }
            }
            
            //If there's something to tell them, SAY IT
            if (whatToTellThem.length>15){
                alert(whatToTellThem);
            }
        });

        //Listens for popup request of data
        function storeWebsiteInfo(websiteScore,urlHost,websiteSSL,hyperlinkInfo){
            chrome.storage.sync.get("websitesVisited", function(websiteResults){ 
                let oldResults = websiteResults.websitesVisited;
                oldResults[urlHost]={"score":websiteScore, "TTL":Date.now() , "websiteSSL":websiteSSL, "hyperlinkInfo":hyperlinkInfo};
                chrome.storage.sync.set({"websitesVisited": oldResults});
            });
        }
        storeWebsiteInfo(score,urlHost,SSLused,hyperlinkInfo);
    }
}

//Checks whitelist and storage before checking score
chrome.storage.sync.get(null, function (data) {
                        console.log(data);//For Testin ============================================================
    let allWebsites =  data.websitesVisited;
    let whiteList= data.extensionOptions.whiteList;
    //If the website visited is not on the whitelist
    //And if the website visited has not already been score before
    if ((!whiteList.includes(window.location.hostname)) && (!allWebsites.hasOwnProperty(window.location.hostname))){
        checkScore();
    }//If a file is being uploaded to this website, run another security check for good measure
    //document.getElementByType('input').on('change', function(){checkScore();})
});


