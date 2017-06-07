// demo https://jsfiddle.net/eliranmal/su3vjt0o/

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.sendMessage(tab.id, 'octosort:votes');
});
