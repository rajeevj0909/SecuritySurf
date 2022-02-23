let profileSetting = 'beginner';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ profileSetting });
  console.log("You are rated as a "+ profileSetting);
});

chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
  score=0;

  url=tabs[0].url
  urlProtocol=url.slice(0,5);

  //Check if SSL certificate
  if (urlProtocol=="https"){
      score+=100;
  } else{
      score+=0;
  }

  document.getElementById("score").innerHTML =score;
  if (score<30){
      alert("This website looks unsafe! Be careful!");
  }
});