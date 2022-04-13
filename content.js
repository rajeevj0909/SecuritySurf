//Start score at zero for every website
let score=0;

//Get website info
let url=window.location.href //URL
let urlProtocol=window.location.protocol; //HTTPS or HTTP

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
chrome.storage.sync.get("popupOption", function (result2) {
    chrome.storage.sync.get("profileSetting", function (result1) {
        if (result2.popupOption=="yes"){
            //Unsafe threshold
            if (score<30){
                whatToTellThem = whatToTellThem.concat("\n This website looks unsafe! Be careful!");
            }

            //No SSL Message
            if (SSLused=="false" && (result1.profileSetting=="beginner")){
                whatToTellThem = whatToTellThem.concat("\n     -It is very easy to see the information you send to this website!");
            } else if (SSLused=="false" && (result1.profileSetting=="expert")){
                whatToTellThem = whatToTellThem.concat("\n     -This website uses no encryption! Data sent & recieved is in plaintext!");
            }
        }
        
        //If there's something to tell them, SAY IT
        if (whatToTellThem.length>15){
            alert(whatToTellThem);
        }
        
    });
});

//Listens for popup request of data
function sendToPopup(websiteScore,websiteUrl,websiteSSL){
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            sendResponse({score: websiteScore, url: websiteUrl, SSLused: websiteSSL});
        }
      );
}
sendToPopup(score,url,SSLused);