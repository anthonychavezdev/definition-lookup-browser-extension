# Firefox instructions
Clone the repo `git clone https://github.com/anthonychavezdev/definition-lookup-browser-extension`

In the search bar (you can press ctrl+l to access it too):
- visit `about:debugging`
- click on "This Firefox"
- click on Load Temporary Add-on
- open the `manifest.json` file

# Chrome instructions
In the search bar:
- visit `chrome://extensions/`
- click Developer mode
- click Load Unpacked
- Open the repo
Just make the following changes to `manifest.json`
```diff
- "scripts": ["background.js"]
+ "service_worker": "background.js"
