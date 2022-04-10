chrome.storage.sync.get(['websiteScore'], function (result) {
  console.log("Checkpoint1 ");
  document.getElementById("score").innerHTML = result.websiteScore +"%";
  console.log("Checkpoint2 ");
  console.log(result.websiteScore);
  console.log("Checkpoint3 ");
});

