function encrypt(a, b, c) {
    return CryptoJS[a].encrypt(b, c).toString();
}

function decrypt(a, b, c) {
    return CryptoJS[a].decrypt(b, c).toString(CryptoJS.enc.Utf8);
}

function launchPopup(callback) {
    chrome.windows.getCurrent(function() {
        chrome.windows.create({
            url: chrome.extension.getURL('./popup.html'),
            type: 'popup',
            width: 550,
            focused: true
        }, callback);
    });
}

function menuItemClicked(info) {
    launchPopup(function(newWindow) {
        // called once newWindow is created
        setTimeout(function() {
            chrome.tabs.sendMessage(newWindow.tabs[0].id, {
                type: "selectionText",
                text: info.selectionText || info.linkUrl
            });
        }, 200);
    });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type == "encrypt") {
        sendResponse(encrypt(message.cipher, message.text, message.passphrase));
    } else if (message.type == "decrypt") {
        sendResponse(decrypt(message.cipher, message.text, message.passphrase));
    } else if (message.type == "launchPopup") {
        launchPopup();
    }
});

// Create the context menu item
chrome.contextMenus.create({
    title: "Encrypt/Decrypt with Sukromia",
    contexts: ["selection", "link", "editable"],
    onclick: menuItemClicked
});

// Launch popup when browser action is clicked
chrome.browserAction.onClicked.addListener(function() {
    launchPopup();
});
