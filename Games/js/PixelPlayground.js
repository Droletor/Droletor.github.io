var scale = 20
var mousex = 0
var mousey = 0
var selectedTool = 1
window.onload = init;

//window.onresize = resize
var matrix = []
var undo_list = []
const max_undos = 10

var isDiagonal = false
var hasWallcheck = true
var g_ctx
var g_canvas

var vis_time = 5
var is_pathfinding = false

var prev_start = [-1, -1]
var prev_end = [-1, -1]

function visualizeMatrix(ctx, m, scale) {
    for (var x = 0; x < m.length; x++) {
        for (var y = 0; y < m[x].length; y++) {
            ctx.beginPath();
            switch (m[x][y]) {
                case 1:
                    ctx.rect(x * scale, y * scale, scale, scale);
                    ctx.fillStyle = "black";
                    break
                case 2:
                    ctx.rect(x * scale, y * scale, scale, scale);
                    ctx.fillStyle = "green";
                    break
                case 3:
                    ctx.rect(x * scale, y * scale, scale, scale);
                    ctx.fillStyle = "red";
                    break
                case -2:
                    ctx.rect(x * scale, y * scale, scale, scale);
                    ctx.fillStyle = "yellow";
                    break
            }
            ctx.fill();
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
        for (var i = 0; i <= innerWidth / scale; i++) {
            matrix.push(new Array(Math.floor(innerHeight / scale + 1)).fill(0))
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
    g_canvas = pixel_canvas
    g_ctx = ctx
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
        if (selectedTool > 1) {
            switch (selectedTool) {
                case 2:
                    if (prev_start[0] > -1 && prev_start[1] > -1) {
                        draw(scale, prev_start[0], prev_start[1], 0)
                    }
                    prev_start = [e.offsetX, e.offsetY]
                    break
                case 3:
                    if (prev_end[0] > -1 && prev_end[1] > -1) {
                        draw(scale, prev_end[0], prev_end[1], 0)
                    }
                    prev_end = [e.offsetX, e.offsetY]
                    break
            }
            selectedTool = 1
            mouseState = false
        }
        clearGrid(ctx, pixel_canvas, scale, false)
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

function button_changediag() {
    isDiagonal = document.getElementById("diagcheckbox").checked
}

function button_changewallcheck() {
    hasWallcheck = document.getElementById("wallcheckbox").checked
}

function button_pathfind() {
    if (is_pathfinding) {
        vis_time = 0
        is_pathfinding = false
        return
    }
    is_pathfinding = true
    vis_time = 5
    var path_matrix = []
    var start_node = [-1, -1]
    var end_node = [-1, -1]
    for (var i in matrix) {
        var temp_list = []
        for (var j in matrix[i]) {
            // console.log(i, j)
            if (matrix[i][j] == 1) {
                temp_list.push(-1)
            }
            else {
                temp_list.push(matrix[i][j])
                if (matrix[i][j] == 2) {
                    start_node = [i, j]
                }
                if (matrix[i][j] == 3) {
                    end_node = [i, j]
                }
            }
        }
        path_matrix.push(JSON.parse(JSON.stringify(temp_list)))
    }

    if (start_node[0] == -1 || end_node[0] == -1) {
        console.log("[ERROR]: no start or end point found.")
        return
    }

    path_matrix[start_node[0]][start_node[1]] = 1
    path_matrix[end_node[0]][end_node[1]] = 0

    // console.log(path_matrix)
    var max_iter = path_matrix.length * path_matrix[0].length
    var iter = 1
    while (path_matrix[end_node[0]][end_node[1]] == 0 && iter < max_iter) {
        for (var x = 0; x < path_matrix.length; x++) {
            for (var y = 0; y < path_matrix[x].length; y++) {
                if (path_matrix[x][y] == iter) {
                    for (var i = x - 1; i <= x + 1; i++) {
                        for (var j = y - 1; j <= y + 1; j++) {
                            if (i >= 0 && j >= 0 && i < path_matrix.length && j < path_matrix[x].length) {
                                if (isDiagonal) {
                                    if (path_matrix[i][j] == 0) {
                                        path_matrix[i][j] = iter+1
                                    }
                                }
                                else {
                                    if (path_matrix[i][j] == 0) {
                                        if (i - x != j - y && i - x != (j - y) * -1) {
                                            path_matrix[i][j] = iter + 1
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        iter++
    }
    console.log("Found in ", iter, "iterations")
    // console.log("TEST: ", path_matrix[end_node[0]][end_node[1]])
    // console.log(path_matrix)
    // console.log(matrix)
    path = reconstruct_path(path_matrix, end_node, start_node, iter+1)
    visualize_path(path, 5)
}

function reconstruct_path(mat, start, end, max_iter) {
    var path = [start]
    var current = []
    current[0] = parseInt(start[0])
    current[1] = parseInt(start[1])
    while (mat[end[0]][end[1]] != -2) {
        var mini = [-1, -1]
        var min = max_iter
        var search_area = [2, 2]
        var offset = [0, 0]
        //console.log(current)
        if (hasWallcheck) {
            if (mat[current[0] + 1][current[1]] == -1) {
                search_area[0]--;
            }
            if (mat[current[0] - 1][current[1]] == -1) {
                search_area[0]--;
                offset[0]++;
            }
            if (mat[current[0]][current[1] + 1] == -1) {
                search_area[1]--;
            }
            if (mat[current[0]][current[1] - 1] == -1) {
                search_area[1]--;
                offset[1]++;
            }
        }
        //console.log(search_area, offset)
        for (var x = offset[0] - 1; x < search_area[0] + offset[0]; x++) {
            for (var y = offset[1] - 1; y < search_area[1] + offset[1]; y++) {
                // console.log("x: ", x, " y: ", y)
                if (current[0] + x >= 0 && current[1] + y >= 0 && current[0] + x < mat.length && current[1] + y < mat[0].length) {
                    // console.log(mat[current[0] + x][current[1] + y], mat[current[0] + x][current[1] + y])
                    if (mat[current[0] + x][current[1] + y] < min && mat[current[0] + x][current[1] + y] > 0) {
                        min = mat[current[0] + x][current[1] + y]
                        mini = [current[0] + x, current[1] + y]
                        // console.log(min, mini)
                    }
                }
            }
        }
        if (mini[0] >= 0 && mini[1] >= 0 && mini[0] < mat.length && mini[1] < mat[0].length) mat[mini[0]][mini[1]] = -2
        current = JSON.parse(JSON.stringify(mini))
        path.push(current)
        // console.log("path: ", current[0], current[1])
    }
    return path
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function visualize_path(path) {
    for (var xy = 1; xy < path.length-1; xy++) {
        draw(scale, path[xy][0] * scale, path[xy][1] * scale, -2)
        redrawGrid(g_ctx, g_canvas, scale)
        if (vis_time > 0 && document.getElementById("vischeckbox").checked) {
            await sleep(vis_time * 1000 / path.length)
        }
    }
    is_pathfinding = false
    vis_time = 5
    remove_path()
}

function remove_path() {
    for (var i in matrix) {
        for (var j in matrix[i]) {
            if (matrix[i][j] == -2) {
                matrix[i][j] = 0
            }
        }
    }
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