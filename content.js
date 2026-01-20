browser.runtime.onMessage.addListener((message) => {
    if (message.action === "showDefinition") {
        console.log("Clicked on context menu item");
    };
});
