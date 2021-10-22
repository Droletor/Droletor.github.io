
window.onload = init;

//window.onresize = resize
var matrix = []

function visualizeMatrix(ctx, m, scale) {
    for (var x = 0; x < m.length; x++) {
        for (var y = 0; y < m[x].length; y++) {
            if (m[x][y] == 1) {
                ctx.beginPath();
                ctx.rect(x * scale, y * scale, scale, scale);
                ctx.fillStyle = "black";
                ctx.fill();
            }
        }
    }
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

function init() {
    var scale = 30
    var maxScale = scale;
    var pixel_canvas = document.getElementById("pixcan")
    var ctx = pixel_canvas.getContext("2d")
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    clearGrid(ctx, pixel_canvas, scale)
    pixel_canvas.addEventListener('mousedown', e => {
        x = e.offsetX;
        y = e.offsetY;
        matrix[Math.floor(x / scale)][Math.floor(y / scale)] = 1;
        clearGrid(ctx, pixel_canvas, scale, false)
    });
    document.addEventListener('keydown', (e) => {
        console.log(e)
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
    });
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