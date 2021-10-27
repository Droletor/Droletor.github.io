var popupToggle = false

function aboutClick() {
    // console.log("Clicked on about text")
}

function gamesClick() {
    var dark_window = document.getElementById("popupblack")
    var popup_window = document.getElementById("popup")
    if (popupToggle) {
        dark_window.className = "hidden"
        popup_window.className = "hidden"
        popupToggle = false;
    }
    else {
        dark_window.className = "popupblack center"
        popup_window.className = "roundgrid popup"
        popupToggle = true;
    }
    // console.log("Clicked on games text")
}