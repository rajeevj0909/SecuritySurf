//Start score at zero for every website
let score=0;

//Get website info
let url=window.location.href //URL
let urlProtocol=url.slice(0,5); //HTTPS or HTTP

//Check if SSL certificate
if (urlProtocol=="https"){
    score+=100;
    httpsUsed=true;
} else{ //"HTTP:"
    score+=0;
    httpsUsed=false;
}


//Inform user of any vulnerabilities
let whatToTellThem="";
if (score<30){
    whatToTellThem = whatToTellThem.concat("\n This website looks unsafe! Be careful!");
}
if (!httpsUsed){
    whatToTellThem = whatToTellThem.concat("\n     -This website uses no encryption!");
}

//If there's something to tell them, SAY IT
if (whatToTellThem.length){
    alert(whatToTellThem);
}
