const remote = require("electron")
	.remote;

document.addEventListener("keydown", event => {

	switch (event.key) {
		case "F11":
			console.log("F11 pressed.");
			remote.getCurrentWindow()
				.maximize()
			break;
	}
});