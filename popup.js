chrome.storage.sync.get(['websiteScore'], function (result) {
  document.getElementById("score").innerHTML = result.websiteScore +"%";
});

