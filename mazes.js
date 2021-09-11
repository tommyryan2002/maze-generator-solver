//New Mazes File
class MazeCell {
  constructor(x, y, north, east, south, west, id) {
    this.x = x;
    this.y = y;
    this.north = north;
    this.east = east;
    this.south = south;
    this.west = west;
    this.id = id
  }
  grabDirection(n){
    let dirAry = [this.north, this.east, this.south, this.west];
    return dirAry[n];
  }
  grabOpposite(n){
    let dirAry = [this.north, this.east, this.south, this.west];
    if(n == 1){
      return dirAry[3];
    }
    else if (n == 0){
      return dirAry[2];
    }
    else if (n == 2){
      return dirAry[0];
    }
    else{
      return dirAry[1];
    }
  }
  grabWallIndex(wall){
    let dirAry = [this.north, this.east, this.south, this.west];
    for (i=0;i<4;i++){
      if (dirAry[i] == wall){
        return i
      }
    }
    return -1
  }
}
function randomDirection(mazeCell){
    //0 = North
    //1 = East
    //2 = South
    //3 = West
    let dirAry = [mazeCell.north, mazeCell.east, mazeCell.south, mazeCell.west]
    let num = getRndInteger(0,4)
    var edge = dirAry[num]
    return [edge, num]
  }

class Wall {
  constructor(border, ref, cell) {
    this.border = border;
    this.ref = ref
    this.cell = cell
  }
}

var rows = 50;
var mult = 600 / rows;
var cellArray = createCells(rows);
var edgeList = createEdgeList(cellArray);
var running = false;
var complete = false;
var changed = false;
var started = false;
var explored1 = [];
var path1 = [];
var explored2 = [];
var dpth = false;
var ast = false;
let brdth = false
let queue = [];
let queue2 = [];
var time = 0;
let currCell = cellArray[0][0]; 
let path2 = [currCell];
let solved = false;
let path3 = [currCell];
let explored3 = [];


function setup(){
	createCanvas(400, 400);
  frameRate(144);
}


function gameboard(x, y, scal, rot, rows, cellArray){
	push();
    strokeWeight(2);
    var mult = 600 / rows;
		translate(x, y);
		scale(scal);
		rotate(rot);
		square(-300, -300, 600);
    noStroke();
    for (i=0;i<explored2.length;i++){
      fill(255 ,255 ,0);
      square(-300 + explored2[i].x * mult, -300 + explored2[i].y * mult, mult);
    }
    for (i=0;i<explored1.length;i++){
      fill(0,255,255);
      square(-300 + explored1[i].x * mult, -300 + explored1[i].y * mult, mult);
    }
    for (i=0;i<explored3.length;i++){
      fill(255,0,255);
      square(-300 + explored3[i].x * mult, -300 + explored3[i].y * mult, mult);
    }
    for (i=0;i<path1.length;i++){
      fill(255,0,0);
      square(-300 + path1[i].x * mult, -300 + path1[i].y * mult, mult);
    }
    for (i=0;i<path2.length;i++){
      fill(0,0,255);
      square(-300 + path2[i].x * mult, -300 + path2[i].y * mult, mult);
    }
    for (i=0;i<path3.length;i++){
      fill(0,255,0);
      square(-300 + path3[i].x * mult, -300 + path3[i].y * mult, mult);
    }
    fill(0,255,0);
    square(-300, -300, mult);
    fill(255, 0, 0);
    square(299-mult, 299-mult, mult);
    
    stroke(0);
    strokeWeight(2);
    for (i=0;i<cellArray.length;i++){
      for (j=0;j<cellArray.length;j++){
        textSize(32);
        //text(cellArray[i][j].id, -300 + ((j+.5)*mult), -300 + ((i+.5)*mult))
        for (k=0;k<4;k++){
          if (cellArray[i][j].grabDirection(k) != null && cellArray[i][j].grabDirection(k).border){
            switch(k){
              case 0: {
                line(-300 + (j*mult), -300 + (i*mult), (-300 + mult) + (j*mult), -300 + (i*mult));
                break;
              }
              case 1:{
                line((-300 + mult) + (j*mult), (-300 + mult) + (i*mult), (-300 + mult) + (j*mult), -300 + (i*mult));
                break;
              }
              case 2:{
                line(-300 + (j*mult), (-300 + mult) + (i*mult), (-300 + mult) + (j*mult), (-300 + mult) + (i*mult));
                break;
              }
              case 3:{
                line((-300) + (j*mult), (-300 + mult) + (i*mult), (-300) + (j*mult), -300 + (i*mult));
                break;
              }
            }
          }
        }
      }
    }
	pop();
}

var goBtn = document.getElementById('goButton');
goBtn.addEventListener("click", goClicked);
function goClicked(){
  started = true;
  if (edgeList.length == 0){
    complete = true;
    goBtn.innerHTML = "DONE"
  }
}

var stepBtn = document.getElementById('step');
stepBtn.addEventListener("click", stepClicked);
function stepClicked(){
  if (edgeList.length != 0){
    while (!changed){
      edgeList = kruskalify(cellArray, edgeList);
    }
    changed = false;
  }
  else{
    complete = true;
  }
}

var resetBtn = document.getElementById('reset');
resetBtn.addEventListener("click", resetClicked);
function resetClicked(){
  cellArray = createCells(rows);
  edgeList = createEdgeList(cellArray);
  running = false;
  complete = false;
  changed = false;
  started = false;
  explored1 = [];
  path1 = [];
  explored2 = [];
  dpth = false;
  ast = false;
  queue = [];
  time = 0;
  currCell = cellArray[0][0]; 
  path2 = [currCell];
  goBtn.innerHTML = "RUN";
  solved = false;
  brdth = false;
  path3 = currCell;
  explored3 = [];
}

function rowsChanged(value){
  rows = value;
  resetClicked();
  document.getElementById("rowsLabel").innerHTML = "Rows/Columns: " + value;
  mult = 600 / rows;
}

var dpthBtn = document.getElementById('depthFirst');
dpthBtn.addEventListener("click", dpthClicked);
function dpthClicked(){
  if (solved){
    explored1 = [];
    path1 = [];
    explored2 = [];
    currCell = cellArray[0][0]; 
    path2 = [currCell];
    queue = [];
    queue2 = [];
    path3 = [];
    explored3 = [];
  }
  if (complete){
    dpth = true;
  }
}

var astBtn = document.getElementById('aStar');
astBtn.addEventListener("click", astClicked);
function astClicked(){
  if(solved){
    explored1 = [];
    path1 = [];
    explored2 = [];
    currCell = cellArray[0][0]; 
    path2 = [currCell];
    queue = [];
    explored3 = [];
    path3 = [];
    queue2 = [];
  }
  if (complete){
    ast = true;
  }
}

var brdthBtn = document.getElementById('breadthFirst');
brdthBtn.addEventListener("click", brdthClicked);
function brdthClicked(){
  if(solved){
    explored1 = [];
    path1 = [];
    explored2 = [];
    currCell = cellArray[0][0]; 
    path2 = [currCell];
    queue = [];
    explored3 = [];
    queue2 = [];
    path3 = [];

  }
  if (complete){
    brdth = true;
  }
}

function draw(){
  background(100);
  gameboard(200, 200, 0.5, 0, rows, cellArray);
  if (edgeList.length == 0 && !complete){
    complete = true;
    goBtn.innerHTML = "DONE";
    currCell = cellArray[0][0]; 
    path2 = [currCell];
    edgeList.push(null);
  }
  else if(started && !complete){
    edgeList = kruskalify(cellArray, edgeList);
  }
  if (time == 1){
    if (dpth){
      let ary1 = depthFirst(cellArray[0][0], explored1, path1);
      path1 = ary1[0];
      explored1 = ary1[1];
      dpth = false;
      solved = true;
      }
    if (ast){
      if (!queue.some(row => row.includes(cellArray[rows-1][rows-1]))){
        let ary2 = aStar(currCell, explored2, queue);
        path2 = ary2[0];
        queue = ary2[2];
        explored2 = ary2[1];
        currCell = queue[0][0];
        
      }
      else{
        currCell = cellArray[rows-1][rows-1]
        ast = false;
        solved = true;
        path2 = findPath(currCell, cellArray);
      }
    }
    if (brdth){
      if (!queue2.some(row => row.includes(cellArray[rows-1][rows-1]))){
        let ary3 = breadthFirst(currCell, explored2, queue);
        path3 = ary3[0];
        queue2 = ary3[2];
        explored3 = ary3[1];
        currCell = queue2[0][0];
        
      }
      else{
        currCell = cellArray[rows-1][rows-1]
        brdth = false;
        solved = true;
        path3 = findPath(currCell, cellArray);
      }
    }
    time = 0;
  }
  time++
}
  


function createCells(rows) {
  let id = 0
  let cellArray = [];
  for (i = 0; i < rows; i++) {
    let rowArray = [];
    for (j = 0; j < rows; j++) {
      let newCell = new MazeCell(j, i, new Wall(true, null, null), new Wall(true, null, null), new Wall(true, null, null), new Wall(true, null, null), id);
      id++
      for(k = 0; k < 4; k++){
        newCell.grabDirection(k).cell = newCell
      }
      rowArray.push(newCell);
      
    }
    cellArray.push(rowArray);
  }
  return updateCells(cellArray);
}

//updates the cellArray s.t edges that go off the "map" are null
function updateCells(cellArray){
  for (i = 0; i < cellArray.length; i++){
    for (j = 0; j < cellArray.length; j++){
      if (i == 0){
        cellArray[i][j].north = null;
      }
      else if (i == cellArray.length - 1){
        cellArray[i][j].south = null;
      }
      if(j == 0){
        cellArray[i][j].west = null;
      }
      else if(j == cellArray.length - 1){
        cellArray[i][j].east = null;
      }
    }
  }
  return cellArray
}

function createEdgeList(cellArray){
  let edgeList = []
  for(i = 0; i < (cellArray.length); i++){
    for (j=0; j < (cellArray.length); j++){
      for (k=0; k < 4; k++){
        if (cellArray[i][j].grabDirection(k) != null){
          edgeList.push(cellArray[i][j].grabDirection(k))
        }
      }
    }
  }
  return edgeList
}

function kruskalify(cellArray, edgeList){
  //while (!checkCompletion(cellArray)){
    ind = getRndInteger(0, edgeList.length)
    let curr_edge = edgeList[ind];
    let index = curr_edge.cell.grabWallIndex(curr_edge);
    switch(index){
      case 0: {
        borderCell = cellArray[curr_edge.cell.y-1][curr_edge.cell.x];
        break;
      }
      case 1:{
        borderCell = cellArray[curr_edge.cell.y][curr_edge.cell.x+1];
        break;
      }
      case 2:{
        borderCell = cellArray[curr_edge.cell.y+1][curr_edge.cell.x];
        break;
      }
      case 3:{
        borderCell = cellArray[curr_edge.cell.y][curr_edge.cell.x-1];
        break;
      }
    }
    if (curr_edge.cell.id == borderCell.id){
      edgeList = edgeList.filter(function(el) { return el != curr_edge;});
      edgeList = edgeList.filter(function(el) { return el != borderCell.grabOpposite(index);});
    }
    else if(curr_edge.border != false){
      edgeList = edgeList.filter(function(el) { return el != curr_edge;});
      edgeList = edgeList.filter(function(el) { return el != borderCell.grabOpposite(index);}); 
      curr_edge.ref = borderCell;
      curr_edge.border = false;
      borderCell.grabOpposite(index).border = false;
      borderCell.grabOpposite(index).ref = curr_edge.cell;
      unifyIds(curr_edge.cell, null, curr_edge.cell.id);
      changed = true;
    }
    else{
      console.log("HUIHHHH");
    }
  //}
  return edgeList
}
//depth first, change all ids to that of the root id, should probably have used trees for this but decided to use graphs instead
function unifyIds(mazeCell, lastCell, id){
  for (let i=0;i<4;i++){
    if(mazeCell.grabDirection(i) != null && mazeCell.grabDirection(i).ref != null){
      borderCell = mazeCell.grabDirection(i).ref;
      if(borderCell === lastCell || borderCell.id == id){
      }
      else{
        borderCell.id = id;
        unifyIds(borderCell, mazeCell, id);
      }
    }
    else{
      console.log(i, mazeCell.grabDirection(i))
    }
  }
}

//not very efficient and time-expensive, O(n^2) at the most, could probably use trees or a hashmap or smth to speed this up.

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}



function depthFirst(currCell, explored, path){
  explored.push(currCell);
  path.push(currCell);
  if(path.includes(cellArray[rows-1][rows-1])){
    return [path, explored];
  }
  let queue = [];
  for(var i = 0; i < 4; i++){
    if (currCell.grabDirection(i) != null && currCell.grabDirection(i).border == false && 
    !explored.includes(currCell.grabDirection(i).ref)){
      queue.push(currCell.grabDirection(i).ref);
    }
  }
  queue.push(path[path.length-1])
  if(queue.length <= 1){
    path.pop();
    return [path, explored];
  }
  for(let j = 0; j < queue.length; j += 1){
    path = depthFirst(queue[j], explored, path)[0];
    if (path.includes(cellArray[rows-1][rows-1])){
      break
    }
    else if(queue[j]==path[path.length-1]){
      path.pop();
      return [path, explored];
    }
  }
  return [path, explored];
}

function findPath(currCell, cellArray){
  let path = [currCell];
  if (currCell.parent == undefined){
    return path;
  }
  while (currCell != cellArray[0][0]){
    path.push(currCell);
    currCell = currCell.parent;
  }
  return path;
}

function aStar(currCell, explored, queue){
    explored.push(currCell);
    queue.shift();
    let frontier = [];
    for(var i = 0; i < 4; i++){
      if (currCell.grabDirection(i) != null && currCell.grabDirection(i).border == false && 
      !explored.includes(currCell.grabDirection(i).ref)){
        frontier.push([currCell.grabDirection(i).ref, findPath(currCell, cellArray).length + (Math.abs(currCell.x - (rows-1)) + Math.abs(currCell.y - (rows-1)))]);
        currCell.grabDirection(i).ref.parent = currCell;
      }
    }
    //sorts the queue by the lowest f value, probably should use heap sort for fastest time, but speed isnt super important.
    for (i=0;i<frontier.length;i++){
      queue.push(frontier[i]);
      queue.sort((a,b) => a[1] - b[1]);
    }

    //currCell = queue[0];
  return [findPath(currCell, cellArray), explored, queue];
}

function breadthFirst(currCell, explored, queue){
  explored.push(currCell);
  queue.shift();
  let frontier = [];
  for(var i = 0; i < 4; i++){
    if (currCell.grabDirection(i) != null && currCell.grabDirection(i).border == false && 
    !explored.includes(currCell.grabDirection(i).ref)){
      frontier.push([currCell.grabDirection(i).ref, findPath(currCell, cellArray).length]);
      currCell.grabDirection(i).ref.parent = currCell;
    }
  }
  //sorts the queue by the lowest distance from start value
  for (i=0;i<frontier.length;i++){
    queue.push(frontier[i]);
    queue.sort((a,b) => a[1] - b[1]);
  }

  //currCell = queue[0];
return [findPath(currCell, cellArray), explored, queue];
}

/*
function aStar(currCell, explored){
  explored = [];
  while (currCell != cellArray[rows-1][rows-1]){
    console.log(currCell.x, currCell.y);
    explored.push(currCell);
    queue.shift();
    let frontier = [];
    for(var i = 0; i < 4; i++){
      if (currCell.grabDirection(i) != null && currCell.grabDirection(i).border == false && 
      !explored.includes(currCell.grabDirection(i).ref)){
        frontier.push([currCell.grabDirection(i).ref, findPath(currCell, cellArray).length + (Math.abs(currCell.x - (rows-1)) + Math.abs(currCell.y - (rows-1)))]);
        currCell.grabDirection(i).ref.parent = currCell;
      }
    }
    //sorts the queue by the lowest f value, probably should use heap sort for fastest time, but speed isnt super important.
    for (i=0;i<frontier.length;i++){
      queue.push(frontier[i][0]);
      queue.sort((a,b) => a[1] - b[1]);
    }
    currCell = queue[0];
  }
  return [findPath(currCell, cellArray), explored];
}
*/


/*priority queue
   h = ((Math.abs(currCell.x - (rows-1))) + (Math.abs(currCell.y - (rows-1))))]
  queue.sort(function(a, b) { 
    return a[1] > b[1] ? 1 : -1;
  });
*/