var scale = 20
var mousex = 0
var mousey = 0
var selectedTool = 1
window.onload = init;

//window.onresize = resize
var matrix = []
var undo_list = []
const max_undos = 10

function visualizeMatrix(ctx, m, scale) {
    for (var x = 0; x < m.length; x++) {
        for (var y = 0; y < m[x].length; y++) {
            switch (m[x][y]) {
                case 1:
                    ctx.beginPath();
                    ctx.rect(x * scale, y * scale, scale, scale);
                    ctx.fillStyle = "black";
                    ctx.fill();
                    break
                case 2:
                    ctx.beginPath();
                    ctx.rect(x * scale, y * scale, scale, scale);
                    ctx.fillStyle = "green";
                    ctx.fill();
                    break
                case 3:
                    ctx.beginPath();
                    ctx.rect(x * scale, y * scale, scale, scale);
                    ctx.fillStyle = "red";
                    ctx.fill();
                    break
            }
        }
    }
}

function interpolate(x, y, x1, y1, t) {
    return [x + t * (x1 - x), y + t * (y1 - y)]
}

function distance(x, y, x1, y1) {
    return Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1))
}

function drawGrid(ctx, scale, clear = true) {
    // X
    for (var i = 0; i < innerWidth / scale; i++) {
        ctx.beginPath();
        ctx.moveTo(i * scale, 0);
        ctx.lineTo(i * scale, window.innerHeight);
        ctx.stroke();
    }
    // Y
    for (var i = 0; i < innerHeight / scale; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * scale);
        ctx.lineTo(window.innerWidth, i * scale);
        ctx.stroke();
    }
    // Matrix
    if (clear) {
        matrix = []
        for (var i = 0; i < innerWidth / scale; i++) {
            matrix.push(new Array(Math.floor(innerHeight / scale)).fill(0))
        }
        undo_list = []
    //console.table(matrix)
    }
    
}

//TODO: recode this spaghetti.

function clearGrid(ctx, canvas, scale, clear = true) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    drawGrid(ctx, scale, clear)
    visualizeMatrix(ctx, matrix, scale)
}

function redrawGrid(ctx, canvas, scale) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    drawGrid(ctx, scale, false)
    visualizeMatrix(ctx, matrix, scale)
}

function draw(scale, x, y, override_tool = null) {
    tool = selectedTool
    if (override_tool != null) {
        tool = override_tool
    }
    matrix[Math.floor(x / scale)][Math.floor(y / scale)] = tool
}

function init() {
    var mouseState = false
    var maxScale = scale
    var pixel_canvas = document.getElementById("pixcan")
    var ctx = pixel_canvas.getContext("2d")
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    clearGrid(ctx, pixel_canvas, scale)
    pixel_canvas.addEventListener('mousedown', e => {
        mouseState = true
        mousex = e.offsetX
        mousey = e.offsetY
        undo_list.push(JSON.parse(JSON.stringify(matrix)))
        if (undo_list.length > max_undos) {
            undo_list.shift()
            // console.log("Max undos reached")
            // console.log(undo_list)
        }
        draw(scale, e.offsetX, e.offsetY)
        clearGrid(ctx, pixel_canvas, scale, false)
        if (selectedTool > 1) {
            selectedTool = 1
            mouseState = false
        }
    });
    pixel_canvas.addEventListener('mouseup', e => {
        mouseState = false
        mousex = e.offsetX
        mousey = e.offsetY
    });
    pixel_canvas.addEventListener('mouseout', e => {
        mouseState = false
    });
    pixel_canvas.addEventListener('mousemove', e => {
        if (mouseState) {
            if (document.getElementById("interpcheckbox").checked == true && selectedTool < 2) {
                let dist = distance(mousex, mousey, e.offsetX, e.offsetY)
                for (var time = 0; time < dist; time++) {
                    let [drawx, drawy] = interpolate(mousex, mousey, e.offsetX, e.offsetY, time / dist)
                    draw(scale, drawx, drawy)
                }
            }
            else {
                draw(scale, e.offsetX, e.offsetY)
            }
            clearGrid(ctx, pixel_canvas, scale, false)
        }
        mousex = e.offsetX
        mousey = e.offsetY
    });
    document.addEventListener('keydown', (e) => {
        // console.log(e)
        if (e.code == "KeyR") {
            clearGrid(ctx, pixel_canvas, scale)
        }
        else if (e.code == "Minus") {
            if (scale > maxScale) {
                scale--
                redrawGrid(ctx, pixel_canvas, scale)
            }
        }
        else if (e.code == "Equal") {
            scale++
            redrawGrid(ctx, pixel_canvas, scale)
        }
        else if (e.code == "KeyZ") {
            if (undo_list.length > 0 && !mouseState) {
                // console.log(undo_list)
                matrix = JSON.parse(JSON.stringify(undo_list[undo_list.length - 1]))
                // console.log("matrix", matrix)
                undo_list.pop(undo_list.length-1)
                redrawGrid(ctx, pixel_canvas, scale)
            }
        }
    });
}

function button_reset() {
    var pixel_canvas = document.getElementById("pixcan")
    var ctx = pixel_canvas.getContext("2d")
    clearGrid(ctx, pixel_canvas, scale)
}

function button_undo() {
    var pixel_canvas = document.getElementById("pixcan")
    var ctx = pixel_canvas.getContext("2d")
    if (undo_list.length > 0) {
        // console.log(undo_list)
        matrix = JSON.parse(JSON.stringify(undo_list[undo_list.length - 1]))
        // console.log("matrix", matrix)
        undo_list.pop(undo_list.length - 1)
        redrawGrid(ctx, pixel_canvas, scale)
    }
}

function select_tool(tool) {
    selectedTool = tool;
    // console.log("Changed tool to " + tool)
}

/*
function resize() {
    var pixel_canvas = document.getElementById("pixcan")
    var ctx = pixel_canvas.getContext("2d")
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    drawGrid(ctx, 20)
}
*/