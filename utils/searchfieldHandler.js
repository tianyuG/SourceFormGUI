// Remove default content in the searchfield textbox on click
function checkSearchFieldOnClick() {
	if (document.getElementById("searchfield")
		.value === "find an object to print...") {
		document.getElementById("searchfield")
			.value = "";
	}
}

// Restore default content in the searchfield textbox if textbox loose focus and is blank
function checkSearchFieldOnBlur() {
	if (document.getElementById("searchfield")
		.value === "") {
		document.getElementById("searchfield")
			.value = "find an object to print...";
	}
}

function checkSearchFieldOnSelect() {
	checkSearchFieldOnClick();
}

function clearSearchField() {
	document.getElementById("searchfield")
		.value = "find an object to print...";
}