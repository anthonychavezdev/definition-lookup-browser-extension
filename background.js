browser.contextMenus.create(
    {
        id: "define-word",
        title: "Define word",
        contexts: ["selection"],
    },
    // See https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/#event-pages-and-backward-compatibility
    // for information on the purpose of this error capture.
    () => void browser.runtime.lastError,
);

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "define-word") {
        browser.tabs.sendMessage(tab.id, {
            action: "showDefinition",
            word: info.selectionText
        })
    }
});
