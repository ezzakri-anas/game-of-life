
"use strict";

var GIT_API_URL = "https://api.github.com/repos/ezzakri-anas/Conway-s-game-of-life-patterns/contents/data/";

const c = document.getElementById("canva");
const ctx = c.getContext("2d");
const controls = document.getElementById("controls");

c.width = window.innerWidth - 2 * c.offsetLeft;
c.height = window.innerHeight - c.offsetTop;

var RESTART = false;
var PLAY = false;
var DARKMODE = false;
var GEN = 0;
var DENSITY = 40;
var START = false;
var FPS = 1;
var MOUSE_DOWN = false;

var x, y, prev_x, prev_y;
var CELL_SIZE = 5;
var RESOLUTION = [Math.floor(c.height / CELL_SIZE), Math.floor(c.width / CELL_SIZE)];
// var RESOLUTION = [25, 25];
var rows = RESOLUTION[0];
var cols = RESOLUTION[1];
var SQR_SIZE = (Math.min((c.height) / rows, (c.width - c.offsetLeft) / cols)); //Math.floor()
var GRID_SIZE = [SQR_SIZE * rows, SQR_SIZE * cols];
var INIT_POS = [(c.height - GRID_SIZE[0]) / 2, (c.width - GRID_SIZE[1]) / 2];


c.style.backgroundColor = DARKMODE ? "black" : "white";


const PLAY_BUTTON = document.getElementById("play");
const RESTART_BUTTON = document.getElementById("restart");
const DENSITY_DISP = document.getElementById("density");
const FPS_DISP = document.getElementById("fps");
const CONTROLS = document.getElementById("controls");
const DARK_BTN = document.getElementById("darkmode");
const GENERATION = document.getElementById("gen");
const DROP_DOWN_BTN = document.getElementById("dropdownMenuButton");
const CELL_SIZE_DISP = document.getElementById("cell_size");

const INCREASE_DEN_BTN = document.getElementById("increase_den");
const DECREASE_DEN_BTN = document.getElementById("decrease_den");
const INCREASE_DEN_BY_10_BTN = document.getElementById("increase_den2");
const DECREASE_DEN_BY_10_BTN = document.getElementById("decrease_den2");

const INCREASE_FPS_BTN = document.getElementById("increase_fps");
const DECREASE_FPS_BTN = document.getElementById("decrease_fps");
const INCREASE_FPS_BY_10_BTN = document.getElementById("increase_fps2");
const DECREASE_FPS_BY_10_BTN = document.getElementById("decrease_fps2");

const INCREASE_SIZE_BTN = document.getElementById("increase_size");
const DECREASE_SIZE_BTN = document.getElementById("decrease_size");
const INCREASE_SIZE_BY_10_BTN = document.getElementById("increase_size2");
const DECREASE_SIZE_BY_10_BTN = document.getElementById("decrease_size2");

DENSITY_DISP.innerHTML = DENSITY + " %";
FPS_DISP.innerHTML = FPS + " fps";
GENERATION.innerHTML = GEN;
CELL_SIZE_DISP.innerHTML = CELL_SIZE + " px²";


c.addEventListener("mousemove", (e) => {
    e.preventDefault();
    x = Math.floor((e.offsetX - INIT_POS[1]) / SQR_SIZE);
    y = Math.floor((e.offsetY - INIT_POS[0]) / SQR_SIZE);
    if (!PLAY){
        if ((x>= 0 && x<RESOLUTION[1]) && (y>=0 & y <RESOLUTION[0]) && !(prev_y == y && prev_x == x) && MOUSE_DOWN) {
            fillCell(rankfromindex([y, x]));
            prev_x = x;
            prev_y = y;
        }
    }
})

c.addEventListener("mousedown", (e) => {
    e.preventDefault();
    MOUSE_DOWN = true;
    let x, y;
    x = Math.floor((e.offsetX - INIT_POS[1]) / SQR_SIZE);
    y = Math.floor((e.offsetY - INIT_POS[0]) / SQR_SIZE);
    if (!PLAY){
        if ((x>= 0 & x<RESOLUTION[1]) & (y>=0 & y <RESOLUTION[0])) {
            fillCell(rankfromindex([y, x]));
        }
    }
});

c.addEventListener("mouseup", (e) => {
    e.preventDefault();
    MOUSE_DOWN = false;
});

CONTROLS.addEventListener("click", (event) =>{
    event.preventDefault();
    if (event.target.id == "restart") {
        restart_game();
    } else if(event.target.id == "play") {
        switch_play_btn();
    } else if(event.target.id == "darkmode"){
        switch_mode();
    } else if (event.target.className == "dropdown-item"){
        FetchPattern(event.target.innerHTML);
        GEN = 0;
    }
});

[INCREASE_DEN_BTN, DECREASE_DEN_BTN,INCREASE_DEN_BY_10_BTN, DECREASE_DEN_BY_10_BTN,
    INCREASE_FPS_BTN, DECREASE_FPS_BTN, INCREASE_FPS_BY_10_BTN, DECREASE_FPS_BY_10_BTN,
    INCREASE_SIZE_BTN, DECREASE_SIZE_BTN, INCREASE_SIZE_BY_10_BTN, DECREASE_SIZE_BY_10_BTN].forEach(item => {
    item.addEventListener('click', (event) => {
        var btn_id, amount;

        var controls = {
            "increase_den2": ["density", 10],
            "increase_den": ["density", 1],
            "decrease_den": ["density", -1],
            "decrease_den2": ["density", -10],
            "increase_fps2": ["fps", 10],
            "increase_fps": ["fps", 1],
            "decrease_fps": ["fps", -1],
            "decrease_fps2": ["fps", -10],
            "increase_size2": ["cell_size", 10],
            "increase_size": ["cell_size", 1],
            "decrease_size": ["cell_size", -1],
            "decrease_size2": ["cell_size", -10],
        }
        if(event.target.tagName == "IMG"){
            btn_id = event.path[1].id;
        } else {
            btn_id = event.target.id;
        }
        amount = controls[btn_id];
        change_parameter(controls[btn_id][0], controls[btn_id][1]);
    })
})

function change_parameter(param, amount){
    if(param == "density"){
        change_density(amount);
    } else if (param == "fps") {
        change_fps(amount);
    } else if (param == "cell_size"){
        change_cell_size(amount);
    }
}

function change_density(amount){
    if ((DENSITY + amount <= 100 && DENSITY + amount >= 0)){
        DENSITY += amount;
    } else if (DENSITY + amount > 100){
        DENSITY = 100;
    } else if (DENSITY + amount < 0){
        DENSITY = 0;
    }
    DENSITY_DISP.innerHTML = DENSITY + " %";
    PLAY_BUTTON.disabled = true;
}

function change_fps(amount){
    if ((FPS + amount <= 120 && FPS + amount >= 1)){
        FPS += amount;
    } else if (FPS + amount > 120){
        FPS = Infinity;
    } else if (FPS + amount <= 0){
        FPS = 1;
    }
    if (FPS > 120 && amount < 0){
        FPS = 120;
    }
    FPS_DISP.innerHTML = FPS + " fps";
}

function change_cell_size(amount){
    var cell_value;
    if ((CELL_SIZE + amount <= 100 && CELL_SIZE + amount >= 1)){
        CELL_SIZE = parseInt(CELL_SIZE + amount);
    } else if (CELL_SIZE + amount > 100){
        CELL_SIZE = 100;
    } else if (CELL_SIZE + amount < 1){
        cell_value = CELL_SIZE;
        CELL_SIZE = cell_value > 1 ? 0.5 : (CELL_SIZE - (CELL_SIZE / 2)).toFixed(2);
    }
    CELL_SIZE_DISP.innerHTML = CELL_SIZE + " px²";
    CELL_SIZE = parseFloat(CELL_SIZE);
    
    PLAY_BUTTON.disabled = true;

    RESOLUTION = [Math.floor(c.height / CELL_SIZE), Math.floor(c.width / CELL_SIZE)];
    rows = RESOLUTION[0];
    cols = RESOLUTION[1];
    SQR_SIZE = (Math.min((c.height) / rows, (c.width - c.offsetLeft) / cols)); //Math.floor()
    GRID_SIZE = [SQR_SIZE * rows, SQR_SIZE * cols];
    INIT_POS = [(c.height - GRID_SIZE[0]) / 2, (c.width - GRID_SIZE[1]) / 2];
}

function restart_game () {
    RESTART = true;
    RESTART_BUTTON.innerHTML = "Restart";
    PLAY_BUTTON.disabled = false;
}

function switch_play_btn(state=false){
    var value = "";
    state ? PLAY = state : PLAY = !PLAY;
    PLAY ? value = "Pause" : value = "Continue";
    document.getElementById("play").innerHTML = value;

    DARK_BTN.disabled = !PLAY;

    DROP_DOWN_BTN.disabled = PLAY;

    INCREASE_DEN_BTN.disabled = PLAY;
    DECREASE_DEN_BTN.disabled = PLAY;
    INCREASE_DEN_BY_10_BTN.disabled = PLAY;
    DECREASE_DEN_BY_10_BTN.disabled = PLAY;

    INCREASE_SIZE_BTN.disabled = PLAY;
    DECREASE_SIZE_BTN.disabled = PLAY;
    INCREASE_SIZE_BY_10_BTN.disabled = PLAY;
    DECREASE_SIZE_BY_10_BTN.disabled = PLAY;
}

function switch_mode(){
    DARKMODE = !DARKMODE;
    c.style.backgroundColor = DARKMODE ? "black" : "white";
    DARK_BTN.innerHTML = DARKMODE ? "Darkmode: ON" : "Darkmode: OFF";
    DARK_BTN.className = DARKMODE ? "nav-link btn btn-secondary" : "nav-link btn btn-outline-secondary";
}

function isNumeric(str){
    return !isNaN(parseFloat(str)) && isFinite(str);
}

function isAlpha(str){
    return /^[A-Z]$/i.test(str);
}


function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function indexfromrank(rank, dim=RESOLUTION) {
    var y = Math.floor(rank / dim[1]);
    var x = rank % dim[1];
    return [y, x];
}

function rankfromindex(index, dim=RESOLUTION) {
    return index[0] * dim[1] + index[1];
}

function drawGrid() {
    clearGrid();
    ctx.strokeRect(INIT_POS[1], INIT_POS[0], GRID_SIZE[1], GRID_SIZE[0]);
}

function clearGrid() {
    ctx.clearRect(INIT_POS[1], INIT_POS[0], GRID_SIZE[1], GRID_SIZE[0]);
}

function updateCell(rank, erase=false) {
    ctx.fillStyle = DARKMODE ^ erase ? "black" : "white";
    let x, y, col, row;
    [row, col] = indexfromrank(rank);

    x = INIT_POS[1] + SQR_SIZE * col;
    y = INIT_POS[0] + SQR_SIZE * row;
    ctx.rect(x, y, SQR_SIZE, SQR_SIZE);
}


function GoL (board, resolution, formatted=false){

    // this.neighboursindices = function (index) {
    //     let x, y;
    //     [y, x] = indexfromrank(index);
    //     let neigh = new Array(9);

    //     let Xfirstbound = Math.min(Math.abs(x - 1), Math.abs(x));
    //     let Xlastbound = Math.min(x + 1, this.res[1] - 1);
    //     let Yfirstbound = Math.min(Math.abs(y - 1), Math.abs(y));
    //     let Ylastbound = Math.min(y + 1, this.res[0] - 1);

    //     let n = 0;
    //     for (let row=Yfirstbound; row<=Ylastbound; row++) {
    //         for (let col=Xfirstbound; col<=Xlastbound; col++) {
    //             if (row == y & col == x) {continue;}
    //             neigh[n] = rankfromindex([row, col]);
    //             n++;
    //         }
    //     }
    //     return neigh;
    // }


    // get neighbours in corroid board
    this.neighboursindices = function(index) {
        let x, y;
        [y, x] = indexfromrank(index);
        let neigh = new Array(9);
        let n = 0;
        for (let i=-1; i<=1; i++) {
            for (let j=-1; j<=1; j++) {
                if (i == 0 & j == 0) {continue;}
                neigh[n] = rankfromindex([(y + i + this.res[0]) % this.res[0], (x + j + this.res[1]) % this.res[1]]); //ajouter l'index de la cellule
                n++;
            }
        }
        return neigh;
    }

    this.updateNeighbours = function (index) {
        let neigh_cells, central_cell;
        central_cell = this.board[index];
    
        neigh_cells = this.neigh_indices.get(index);
        for (let i=0; i<8; i++) {
            this.board[neigh_cells[i]] += Math.floor(central_cell / 10) ? 1 : -1;
        }
    }
    
    this.getGeneration = function () {
        let neigh_count, cell, prev_neigh_count;
        let brd = Array.from(this.board);
    
        for (let i=0; i<this.size; i++) {
            cell = brd[i];
            if (!cell) {
                continue;
            }
            prev_neigh_count = brd[i] % 10;
            neigh_count = this.board[i] % 10;
    
            if (Math.floor(cell / 10)) {
                if (!(prev_neigh_count == 2 || prev_neigh_count == 3)) {
                    this.board[i] = 0 * 10 + neigh_count;
                    this.updateNeighbours(i);
                } else {
                    updateCell(i, true);
                }
            } else {
                if (prev_neigh_count == 3) {
                    this.board[i] = 1 * 10 + neigh_count;
                    this.updateNeighbours(i);
                    updateCell(i, true);
                }
            }
        }
    }

    this.init_board = function() {
        let brd = new Array(this.size);
        let r;
        for (let i=0; i<sthis.ize; i++) {
            r = randomInt(0, 1);
            brd[i] = r * 10;
            neigh_indices.set(i, this.neighboursindices(i));
            if (r == 1) {
                updateCell(i, true);
            }
        }
        return brd;
    }

    this.format_board = function (brd, formatted) {
        for (let i=0; i<this.res[0] * this.res[1]; i++){
            this.neigh_indices.set(i, this.neighboursindices(i));
            if (brd[i]) {
                updateCell(i, true);
            }
            formatted ? 0 : brd[i] *= 10;
        }
        return brd;
    }

    this.init_neighbours = function () {
        for (let i=0; i<this.res[0] * this.res[1]; i++) {
            if (Math.floor(this.board[i] / 10)) {
                this.updateNeighbours(i);
            }   
        }
    }

    this.get_board = function (){
        return Array.from(this.board);
    }

    this.nth_board = function(iter_num){
        for (var i=0; i<iter_num; i++){
            this.getGeneration();
        }
        return this.get_board();
    }

    this.new_board = function (brd, formatted) { // bool
        clearGrid();
        ctx.beginPath();
        let brd_2 = Array.from(brd);
        this.board = this.format_board(brd_2, formatted);
        formatted ? 0: this.init_neighbours();
        ctx.fill();
    }

    this.get_pattern = function(pattern, dim){
        if(RESOLUTION[0] < dim[0] || RESOLUTION[1] < dim[1]){
            alert("pattern bigger than board");
            throw "pattern bigger than board";
        }
        x = Math.floor((RESOLUTION[1] - dim[1]) / 2);
        y = Math.floor((RESOLUTION[0] - dim[0]) / 2);

        var brd = Array(this.size).fill(0);

        clearGrid();
        ctx.beginPath();
        for (var j=0; j<dim[0]; j++){
            for(var i=0; i<dim[1]; i++){
                brd[rankfromindex([j + y, i + x])] = pattern[rankfromindex([j, i], dim)];
                if(brd[rankfromindex([j + y, i + x])]){
                    updateCell(rankfromindex([j + y, i + x]), true);
                }
            }
        }
        this.board = this.format_board(brd, false);
        this.init_neighbours();
        ctx.fill();

    }
    
    this.iterate = function () {
        clearGrid();
        ctx.beginPath();
        this.getGeneration();
        ctx.fill();
    }

    this.res = resolution;
    this.size = this.res[0] * this.res[1];
    
    ctx.beginPath();

    this.neigh_indices = new Map();
    if(board) {
        this.board = this.format_board(Array.from(board), formatted);
    } else {
        this.board = this.init_board();
    }
    this.init_neighbours();

    ctx.fill();
    
    return this;
}

function populate_array(arr, population, density){
    let cells = Math.floor(arr.length * density / 100);
    let indexes = Array.from(Array(arr.length).keys());
    let index;
    let in_in;
    for (let i=0; i<cells; i++){
        index = undefined;
        while (index == undefined){
            in_in = randomInt(0, arr.length);
            index = indexes[in_in];
            indexes[in_in] = undefined;

        }
        arr[index] = population;
    }
}

function fillCell(rank, arr=null){
    var cell_value;
    ctx.beginPath();
    if (arr){
        arr[rank] = +!arr[rank];
        updateCell(rank, arr[rank]);
    } else {
        cell_value = game.board[rank];
        if (Math.floor(cell_value / 10)){
            game.board[rank] = cell_value % 10;
            updateCell(rank, false);
        } else {
            game.board[rank] = cell_value + 10;
            updateCell(rank, true);
        }
        game.updateNeighbours(rank);
    }
    ctx.fill();
}

FetchPatternsNames().then((lst) => {
    var ul = document.getElementById("patterns");
    for (var i=0; i<lst.length; i++){
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.className = "dropdown-item";
        a.href = "#";
        a.appendChild(document.createTextNode(lst[i]));
        li.appendChild(a);
        li.className = "pattern";
        ul.appendChild(li);
    }
});


var BRD = Array(RESOLUTION[0] * RESOLUTION[1]).fill(0);
var n_board;
var prev_FPS = FPS;


var game = new GoL(BRD, RESOLUTION);


// MAIN LOOP
function gameloop() {
    if (RESTART){
        drawGrid();
        GEN = 0;
        RESTART = false;
        switch_play_btn(true);
        BRD = Array(RESOLUTION[0] * RESOLUTION[1]).fill(0);
        n_board = Array.from(BRD);
        populate_array(n_board, 1, DENSITY);
        game = new GoL(n_board, RESOLUTION);
    }

    if (PLAY){
        game.iterate();
        GEN++;
        GENERATION.innerHTML = "Generation: " + GEN;
    }

    if(prev_FPS != FPS){
        prev_FPS = FPS;
        clearTimeout(animation);
        animation = setInterval(gameloop, 1000 / FPS);
    }
}

var animation = setInterval(gameloop, 1000 / FPS);


async function fetch_data(link){
    var response = await fetch(link);
    return response.json();
}

async function FetchPattern(name){
    var Pattern, data, dim, brd;
    data = await fetch_data(GIT_API_URL + name + ".lif");
    Pattern = atob(data.content);
    dim = get_size(get_nth_line(Pattern, pass_comments(Pattern)));
    brd = convert_RLE(Pattern, dim);
    game.get_pattern(brd, dim);
}

async function FetchPatternsNames(){
    var data = await fetch_data(GIT_API_URL);
    var patterns_lst = [];
    for (var i=0; i<data.length; i++){
        patterns_lst.push(data[i].name.replace(".lif", ""));
    }
    return patterns_lst;
}

function get_size(str){
    var x = false;
    var y = false;
    var x_value = "";
    var y_value = "";
    for (let i=0; i<str.length; i++){
        if (str[i] == "x" || x){
            x = true;
            if (isNumeric(str[i])){
                x_value += str[i];
            } else if (str[i] == ","){
                x = false;
            }
        } else if (str[i] == "y" || y){
            y = true;
            if (isNumeric(str[i])){
                y_value += str[i];
            } else if (str[i] == ","){
                y = false;
            }
        }
    }
    return [parseInt(y_value), parseInt(x_value)];
}


function get_nth_line(str, nth){
    var n = 1;
    var i = 0;
    var line = "";
    while (n < nth + 1){
        if (str[i] == "\n"){
            n++;
        } else if (n == nth){
            line += str[i];
        }
        i++;
    }
    return line;
}

function count_lines(str){
    var n = 1;
    for (let i=0; i<str.length; i++){
        str[i] == "$" ? n++ : 0;
    }
    return n;
}

function pass_comments(str){
    var n = 1;
    var i = 0;
    var done = false;
    if (str[0] != "#"){
        return n;
    }
    while(!done){
        if (str[i] == "\n"){
            n++;
            if (str[i + 1] != "#"){
                return n;
            }
        }
        i++;
    }
}

function convert_RLE(data, size){
    var n = pass_comments(data) + 1;
    var arr = new Array(size[0] * size[1]).fill(0);
    var done = false;
    var line = 1;
    var i = 0;
    var num = "";
    var item;
    var index = 0;
    while(!done){
        item = data[i];
        if (item == "\n"){
            line++;
        }
        if (line >= n){
            if (item == "!"){
                done = true;
                continue;
            } else if (isNumeric(item)){
                num += item;
            } else {
                num = parseInt(num) ? parseInt(num) : 1;
                if (isAlpha(item)){
                    if(item == "b"){
                        index += num;
                    } else if (item == "o"){
                        for (var j=0; j<num; j++){
                            arr[index] = 1;
                            index++;
                        }
                    }
                } else if(item == "$"){
                    index += (size[1] - index % size[1]) % size[1];
                    for (var k=0; k < num - 1; k++){
                        index += size[1];
                    }
                }
                num = "";
            }
        }
        i++;
    }
    return arr;
}
