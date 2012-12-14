/*global studio, File, Folder*/

var actions = {};

/*
 * This method clear the CSS Selector IDs from a text content and returns the cleared css
 */
function clearCSSIDsInContent(content) {
	var contentLength = content.length;

	var clearedText = content.replace(/(?:#.*?(\{\s))/g, function (match, offset, string) {
		return match.substring(match.lastIndexOf("#"));
	});

	return clearedText;
}

/*
 * This method clear the file if it's a css file, and save the old content in a file with
 * a _old suffix. This way the user can have a view on the diffs made.
 */
function clearCSSFile(file) {
	if (file !== null &&
		file.extension == "css") {
		content = file.toString();
		file.copyTo(file.path+"_old", "Overwrite");
		content = clearCSSIDsInContent(content);

		var textStream = new TextStream(file, "Overwrite");
		textStream.rewind();
		textStream.write(content);
		textStream.flush();
		textStream.close();
	}
}

/*
 * This method browse a folder and clear any css file in the folder and its subfolders recursively
 */
function clearFolder(folder) {
	if (folder !== null) {
		folder.parse(function (file) {
			if (file instanceof File) {
				clearCSSFile(file);
			}
		});
	}
}

/*
 * This action will handle the action of manually clearing CSS multiples IDs use in a selector within the edited file
 */
actions.ClearCSSIDs = function ClearCSSIDs() {
	"use strict";

	//String representing the content of the opened file being edited by the user.
	var documentContent = studio.currentEditor.getContent();
	var contentLength = documentContent.length;

	var clearedText = clearCSSIDsInContent(documentContent);

	studio.currentEditor.selectFromStartOfText(0, contentLength);
	studio.currentEditor.insertText(clearedText);
};

/*
 * This action will clear the css selected files from the solution explorer.
 * If a selected item is a folder, the action will recursively browse the selected folder
 * and clear all the css files within.
 */
actions.ClearCSS = function ClearCSS() {
	"use strict";

	//String representing the content of the opened file being edited by the user.
	var files = studio.currentSolution.getSelectedItems();
	files.every(function browseFilesAndClear(file) {
		if (file instanceof File) {
			clearCSSFile(file);
		} else if (file instanceof Folder) {
			clearFolder(file);
		}
	});
};

exports.handleMessage = function handleMessage(message) {
	"use strict";
	var
		actionName;

	actionName = message.action;

	if (!actions.hasOwnProperty(actionName)) {
		studio.alert("I don't know about this message: " + actionName);
		return false;
	}
	actions[actionName](message);
};

