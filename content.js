//Start score at zero for every website
let score=0;

//Get website info
let url=window.location.href //URL
let urlProtocol=url.slice(0,5); //HTTPS or HTTP

//Check if SSL certificate
let httpsNotUsed=true;
if (urlProtocol=="https"){
    score+=100;
    httpsNotUsed=false;
}else if (urlProtocol=="http:"){ 
    score+=5;
}

//Set the score for the site
let websiteScore = score;
chrome.storage.sync.set({ "websiteScore": websiteScore });
console.log("This site is scored: "+ websiteScore);

//Inform user of any vulnerabilities
let whatToTellThem="\nSecurity Surf\n";
chrome.storage.sync.get("popupOption", function (result2) {
    chrome.storage.sync.get("profileSetting", function (result1) {
        if (result2.popupOption=="yes"){
            //Unsafe threshold
            if (score<30){
                whatToTellThem = whatToTellThem.concat("\n This website looks unsafe! Be careful!");
            }

            //HTTPS
            if (httpsNotUsed && (result1.profileSetting=="beginner")){
                whatToTellThem = whatToTellThem.concat("\n     -It is very easy to see the information you send to this website!");
            } else if (httpsNotUsed && (result1.profileSetting=="expert")){
                whatToTellThem = whatToTellThem.concat("\n     -This website uses no encryption! Data sent & recieved is in plaintext!");
            }
        }
        
        //If there's something to tell them, SAY IT
        if (whatToTellThem.length>15){
            alert(whatToTellThem);
        }
        
    });
});