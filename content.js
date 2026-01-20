browser.runtime.onMessage.addListener((message) => {
    if (message.action === "showDefinition") {
        showDefinitionPopup(message.word, message.x, message.y);
    };
});

// Source - https://stackoverflow.com/a/26495188
// Posted by Jakobovski
// Retrieved 2026-01-19, License - CC BY-SA 3.0
function getSelectionCoords() {
    var sel = document.selection, range, rect;
    var x = 0, y = 0;
    if (sel) {
        if (sel.type != "Control") {
            range = sel.createRange();
            range.collapse(true);
            x = range.boundingLeft;
            y = range.boundingTop;
        }
    } else if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0).cloneRange();
            if (range.getClientRects) {
                range.collapse(true);
                if (range.getClientRects().length>0){
                    rect = range.getClientRects()[0];
                    x = rect.left;
                    y = rect.top;
                }
            }
            // Fall back to inserting a temporary element
            if (x == 0 && y == 0) {
                var span = document.createElement("span");
                if (span.getClientRects) {
                    // Ensure span has dimensions and position by
                    // adding a zero-width space character
                    span.appendChild( document.createTextNode("\u200b") );
                    range.insertNode(span);
                    rect = span.getClientRects()[0];
                    x = rect.left;
                    y = rect.top;
                    var spanParent = span.parentNode;
                    spanParent.removeChild(span);

                    // Glue any broken text nodes back together
                    spanParent.normalize();
                }
            }
        }
    }
    return { x: x, y: y };
}

async function tryToGetDefinition(word) {
    const lang = 'en';
    const url = `https://api.dictionaryapi.dev/api/v2/entries/${lang}/${word}`;
    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error.message);
    }
}

function populatePopupWith(definitions, popupContent) {
    let html = ``;
    if (definitions) {
        definitions.forEach((def) => {
            def.meanings.forEach((meaning) => {
                html += `<div class="part-of-speech">${meaning.partOfSpeech}</div>`;
                meaning.definitions.forEach((definition) => {
                    html += `<div class="definition-item">${definition.definition}</div>`;
                    if (definitions.example) {
                        html += `<div class="example">${definition.example}</div>`;
                    }
                });
            })
        })
        popupContent.innerHTML = html;
    } else {
        popupContent.innerHTML = "Definition not found";
    }
}

async function showDefinitionPopup(word, x, y) {
    // Remove existing popup if present
    const existingElement = document.getElementById("definition-popup");
    if (existingElement) {
        existingElement.remove();
    }

    let pos = getSelectionCoords();
    const popup = document.createElement("div");
    popup.id = "definition-popup";
    popup.innerHTML = `
    <div class="definition-header">
    <span>${word}</span>
    <button class="close-btn">&times;</button>
    </div>
    <div class="definition-content">Loading...</div>
`;

    popup.querySelector(".close-btn").addEventListener("click", () => {
        popup.remove();
    });
    let definition = await tryToGetDefinition(word);
    const popupContent = popup.querySelector(".definition-content");
    populatePopupWith(definition, popupContent);
    document.body.appendChild(popup);
    // Position near click
    // and match the scroll offset
    pos.x += window.scrollX;
    pos.y += window.scrollY;
    pos.x = Math.trunc(pos.x);
    pos.y = Math.trunc(pos.y);
    popup.style.left = `${pos.x}px`;
    yPos = pos.y - popup.clientHeight;

    // We want the window to be above the selected word, unless it would be above
    // the HTML document, then put it underneath.
    if (yPos <= 0) {
        let padding = 40;
        pos.y = `${pos.y + padding}`;
    } else {
        let padding = 20;
        pos.y = pos.y - popup.clientHeight - padding
    }
    popup.style.top = `${pos.y}px`;   
}

// close popup if clicked outside of it
document.addEventListener("click", (e) => {
    let popup = document.getElementById("definition-popup");
    if (popup && !popup.contains(e.target)) {
        popup.remove();
    }
})
