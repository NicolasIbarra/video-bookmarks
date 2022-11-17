/* 
A new event is made to listen to every update or current tab in Chrome browser.
We verify that the URL is from Youtube platform and get the video ID from it.
Then we want this file to send a message to contentScript, which is going to receive it and execute the code inside. 
*/
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  
  if (tab.url && tab.url.includes("youtube.com/watch")) {
    const queryParameter = tab.url.split("?")[1];
    const urlParameter = new URLSearchParams(queryParameter);
    
    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      videoId: urlParameter.get("v"),
    });
  }
});

