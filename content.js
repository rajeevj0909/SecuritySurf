function checkScore(){
    //Start score at zero for every website
    let score=0;

    //Get website info
    let url=window.location.href //URL
    let urlHost=window.location.hostname //URL Host
    let urlProtocol=window.location.protocol; //HTTPS or HTTP

    if((urlProtocol="https:")||(urlProtocol="http:")){
        //Check for SSL certificate
        function checkSSL(score, urlProtocol){
            let SSLused="N/A";
            if (urlProtocol=="https:"){
                score+=100;
                SSLused="true";
            }else if (urlProtocol=="http:"){ 
                score+=5;
                SSLused="false";
            }
            return [score, SSLused];
        }
        [score, SSLused] = checkSSL(score, urlProtocol);

        //Inform user of any vulnerabilities
        let whatToTellThem="\nSecurity Surf\n";
        chrome.storage.sync.get("extensionOptions", function(result) {
            let expertiseChosen= result.extensionOptions.expertiseChosen;
            let popupOption= result.extensionOptions.popupOption;

            if (popupOption=="yes"){
                //Unsafe threshold
                if (score<30){
                    whatToTellThem = whatToTellThem.concat("\n This website looks unsafe! Be careful!");
                }

                //No SSL Message
                if (SSLused=="false" && (expertiseChosen=="beginner")){
                    whatToTellThem = whatToTellThem.concat("\n     -It is very easy to see the information you send to this website!");
                } else if (SSLused=="false" && (expertiseChosen=="expert")){
                    whatToTellThem = whatToTellThem.concat("\n     -This website uses no encryption! Data sent & recieved is in plaintext!");
                }
            }
            
            //If there's something to tell them, SAY IT
            if (whatToTellThem.length>15){
                alert(whatToTellThem);
            }
        });

        //Listens for popup request of data
        function storeWebsiteInfo(websiteScore,urlHost,websiteSSL){
            chrome.storage.sync.get("websitesVisited", function(websiteResults){ 
                let oldResults = websiteResults.websitesVisited;
                oldResults[urlHost]={"score":websiteScore, "TTL":Date.now() , "websiteSSL":websiteSSL};
                chrome.storage.sync.set({"websitesVisited": oldResults});
            });
        }
        storeWebsiteInfo(score,urlHost,SSLused);
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
    }
});
