import {getCurrentTab} from "./utils.js";

// adding a new bookmark row to the popup
const addNewBookmark = (bookmarkStorage, bookmark) => {
    const bookmarkTitleElement = document.createElement("div");
    const newBookmarkElement = document.createElement("div");
    const controlsElement = document.createElement("div");

    bookmarkTitleElement.textContent = bookmark.description;
    bookmarkTitleElement.className = "bookmark-title";
    controlsElement.className = "bookmark-controls";

    newBookmarkElement.id = "bookmark-" + bookmark.time;
    newBookmarkElement.className = "bookmark";
    newBookmarkElement.setAttribute("timestamp", bookmark.time);

    setBookmarkAttributes("play", onPlay, controlsElement);
    setBookmarkAttributes("delete", onDelete, controlsElement);

    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlsElement);
    bookmarkStorage.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks = []) => {
    const bookmarkStorage = document.getElementById("bookmarks");
    bookmarkStorage.innerHTML = "";

    if(currentBookmarks.length > 0){
        for (let i = 0; i < currentBookmarks.length; i++){
            const bookmark = currentBookmarks[i];
            addNewBookmark(bookmarkStorage, bookmark);
        }
    } else {
        bookmarkStorage.innerHTML = "<i class='row'>No bookmarks to show.</i>"
    }
};

const onPlay = async e => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getCurrentTab();

    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value: bookmarkTime
    })
};

const onDelete = async e => {
    const activeTab = await getCurrentTab();
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const bookmarElementToDelete = document.getElementById("bookmark-" + bookmarkTime);

    bookmarElementToDelete.parentNode.removeChild(bookmarElementToDelete);

    chrome.tabs.sendMessage(activeTab.id, {
        type: "DELETE",
        value: bookmarkTime
    }, viewBookmarks);
};

const setBookmarkAttributes =  (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement("img");
    controlElement.src = "assets/" + src + ".png";
    controlElement.title = src;
    controlElement.addEventListener("click", eventListener);
    controlParentElement.appendChild(controlElement);
};

/*
 * This event is fired when an HTML docuement has initially been loaded. 
 */
document.addEventListener("DOMContentLoaded", async () => {
    const activeTab = await getCurrentTab();
    const queryParameters = activeTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
    const currentVideo = urlParameters.get("v");

    if(activeTab.url.includes("youtube.com/watch") && currentVideo){
        chrome.storage.sync.get([currentVideo], (data) => {
            const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];
            viewBookmarks(currentVideoBookmarks);
        })
    } else {
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML = "<div class='title'>This is not a youtube page.</div>";
    }
});
