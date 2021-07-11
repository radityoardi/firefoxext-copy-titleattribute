browser.contextMenus.create({
	id: "copy-titleattribute-to-clipboard",
	title: "Copy title attribute of this element",
	contexts: ["all"],
	onclick(info, tab) {
		if (info.menuItemId === "copy-titleattribute-to-clipboard") {
			console.log(info);
			browser.tabs.executeScript(tab.id, {
				code: `if (browser.menus.getTargetElement(${info.targetElementId}).title !== undefined) { browser.menus.getTargetElement(${info.targetElementId}).title; } else { null; }`
			}).then((elResults) => {
				if (elResults && elResults[0]) {
					const text = elResults[0];
	
					const code = "copyToClipboard(" +
						JSON.stringify(text) +
						");";
			
					browser.tabs.executeScript({
						code: "typeof copyToClipboard === 'function';",
					}).then((results) => {
						if (!results || results[0] !== true) {
							return browser.tabs.executeScript(tab.id, {
								file: "clipboard-helper.js",
							});
						}
					}).then(() => {
						return browser.tabs.executeScript(tab.id, {
							code,
						});
					}).then(() => {
						browser.notifications.create({
							"type": "basic",
							"title": "Success",
							"message": `The title attribute ${JSON.stringify(text)} is copied into the clipboard.`
						});	
					}).catch((error) => {
						// This could happen if the extension is not allowed to run code in
						// the page, for example if the tab is a privileged page.
						console.error("Failed to copy text: " + error);
					});
	
				} else {
					console.error("No title to be copied.");
					browser.notifications.create({
						"type": "basic",
						"title": "Warning",
						"message": "No title attribute was copied."
					});
				}
			});
		}
	}
});

// https://gist.github.com/Rob--W/ec23b9d6db9e56b7e4563f1544e0d546
function escapeHTML(str) {
	// Note: string cast using String; may throw if `str` is non-serializable, e.g. a Symbol.
	// Most often this is not the case though.
	return String(str)
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;").replace(/'/g, "&#39;")
		.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}