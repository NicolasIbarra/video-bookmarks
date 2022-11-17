/*
 We create an onMessage event to receive the message from the service worker.
 If it's a new video, we storage the id in a global variable and call a function to reload the extension.
*/
(() => {
  let youtubeLeftButtons;
  let youtubeStream;
  let currentVideo = "";
  let currentVideoBookmarks = [];

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, videoId, value } = obj;
    
    if (type === "NEW") {
      currentVideo = videoId;
      newVideoLoaded();
    } else if (type === "PLAY"){
      youtubeStream.currentTime = value;
    } else if (type === "DELETE"){
      currentVideoBookmarks = currentVideoBookmarks.filter(b => b.time != value);
      chrome.storage.sync.set({[currentVideo]: JSON.stringify(currentVideoBookmarks)});
      response(currentVideoBookmarks);
    }
  });

  const getBookmarks = () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get([currentVideo], (obj) => {
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
      });
    })
  }

  const newVideoLoaded = async () => {
    const bookmarkBtn = document.getElementsByClassName("bookmark-btn")[0];
    currentVideoBookmarks = await getBookmarks();
    
    if(!bookmarkBtn){
      const bookmarkBtnImg = document.createElement("img");
      bookmarkBtnImg.src = chrome.runtime.getURL("assets/bookmark.png");
      bookmarkBtnImg.className = "ytp-button " + "bookmark-btn";
      bookmarkBtnImg.title = "Click to save the video timestamp";

      youtubeStream = document.getElementsByClassName("video-stream")[0];
      youtubeLeftButtons = document.getElementsByClassName("ytp-left-controls")[0];
      youtubeLeftButtons.appendChild(bookmarkBtnImg);

      bookmarkBtnImg.addEventListener("click", addNewBookmarkEventHandler);
    }
  }

  const addNewBookmarkEventHandler = async () => {
    const videoCurrentTime = youtubeStream.currentTime;
    const newBookmark = {
      time: videoCurrentTime,
      description: "Bookmarked at " + getTime(videoCurrentTime),
    }
    currentVideoBookmarks = await getBookmarks();
    
    chrome.storage.sync.set({
      [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
    });
  }

  const getTime = time => {
    const DATE = new Date(0);
    DATE.setSeconds(time);
    return DATE.toISOString().substr(11, 8);
  }

  newVideoLoaded();

})();


