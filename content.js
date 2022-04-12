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


//Inform user of any vulnerabilities
let whatToTellThem="";
if (score<30){
    whatToTellThem = whatToTellThem.concat("\n This website looks unsafe! Be careful!");
}
if (httpsNotUsed){
    whatToTellThem = whatToTellThem.concat("\n     -This website uses no encryption! Data sent & recieved is in plaintext!");
}

//Set the score for the site
let websiteScore = score;
chrome.storage.sync.set({ websiteScore });
console.log("This site is scored: "+ websiteScore);
  

//If there's something to tell them, SAY IT
if (whatToTellThem.length){
    alert(whatToTellThem);
}
