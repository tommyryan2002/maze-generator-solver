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
var path2 = [];
var solving = false;

function setup(){
	createCanvas(400, 400);
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
    for (i=0;i<path1.length;i++){
      fill(255,255,0, 75);
      square(-300 + path1[i].x * mult, -300 + path1[i].y * mult, mult);
    }
    for (i=0;i<path2.length;i++){
      fill(255,255,0, 75);
      square(-300 + path2[i].x * mult, -300 + path2[i].y * mult, mult);
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
    console.log("done!")
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
  goBtn.innerHTML = "RUN";
  started = false;
  solving = false;
  explored1 = [];
  path1 = [];
  explored2 = [];
  path2 = [];
}

function rowsChanged(value){
  rows = value;
  resetClicked();
  document.getElementById("rowsLabel").innerHTML = "Rows/Columns: " + value;
  mult = 600 / rows;
}

var solveBtn = document.getElementById('depthFirst');
solveBtn.addEventListener("click", solveClicked);
function solveClicked(){
  if (complete){
    solving = true;
  }
}
function draw(){
  background(100);
  gameboard(200, 200, 0.5, 0, rows, cellArray);
  if (edgeList.length == 0){
    complete = true;
    goBtn.innerHTML = "DONE";
  }
  else if(started){
    edgeList = kruskalify(cellArray, edgeList);
  }
  if (solving){
    console.log('solving');
    path1 = depthFirst(cellArray[0][0], explored1, path1);
    //path2 = aStar(cellArray[0][0], explored2, path2);
    solving = false;
  } 
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
      console.log("heeehh", curr_edge.cell.id, borderCell.id )
      edgeList = edgeList.filter(function(el) { return el != curr_edge;});
      edgeList = edgeList.filter(function(el) { return el != borderCell.grabOpposite(index);});
    }
    else if(curr_edge.border != false){
      //console.log(curr_edge.cell.id, borderCell.id);
      edgeList = edgeList.filter(function(el) { return el != curr_edge;});
      edgeList = edgeList.filter(function(el) { return el != borderCell.grabOpposite(index);}); 
      curr_edge.ref = borderCell;
      curr_edge.border = false;
      borderCell.grabOpposite(index).border = false;
      borderCell.grabOpposite(index).ref = curr_edge.cell;
      unifyIds(curr_edge.cell, null, curr_edge.cell.id);

      console.log(edgeList);
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
    console.log(mazeCell.x, mazeCell.y, i)
    if(mazeCell.grabDirection(i) != null && mazeCell.grabDirection(i).ref != null){
      borderCell = mazeCell.grabDirection(i).ref;
      console.log("entered");
      if(borderCell === lastCell || borderCell.id == id){
        console.log("already visited");
      }
      else{
        borderCell.id = id;
        console.log('reset');
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
    return path;
  }
  let queue = [];
  for(var i = 0; i < 4; i++){
    if (currCell.grabDirection(i) != null && currCell.grabDirection(i).border == false && 
    !explored.includes(currCell.grabDirection(i).ref)){
      queue.push(currCell.grabDirection(i).ref);
    }
  }
  queue.push(path[path.length-1])
  console.log("queue", queue)
  if(queue.length <= 1){
    path.pop();
    return path;
  }
  for(let j = 0; j < queue.length; j += 1){
    path = depthFirst(queue[j], explored, path);
    if (path.includes(cellArray[rows-1][rows-1])){
      break
    }
    else if(queue[j]==path[path.length-1]){
      path.pop();
      return path;
    }
  }
  return path;
}

function aStar(currCell, explored, path){
  console.log(currCell.x, currCell.y);
  explored.push(currCell);
  path.push(currCell);
  if(path.includes(cellArray[rows-1][rows-1])){
    return path;
  }
  let queue = [];
  for(var i = 0; i < 4; i++){
    if (currCell.grabDirection(i) != null && currCell.grabDirection(i).border == false && 
    !explored.includes(currCell.grabDirection(i).ref)){
      queue.push([currCell.grabDirection(i).ref, ((Math.abs(currCell.x - (rows-1))) + (Math.abs(currCell.y - (rows-1))))]);
    }
  }
  queue.sort(function(a, b) { 
    return a[1] > b[1] ? 1 : -1;
  });
  queue.push(path[path.length-1])
  if(queue.length <= 1){
    console.log("backtrack", currCell)
    path.pop();
    return path;
  }
  for(let j = 0; j < queue.length; j += 1){
    path = aStar(queue[j], explored, path);
    console.log("explored", explored, j);
    if (path.includes(cellArray[rows-1][rows-1])){
      break
    }
    else if(queue[j]==path[path.length-1]){
      console.log("backtrack", currCell)
      path.pop();
      return path;
    }
  }
  return path;
}

/*priority queue
   h = ((Math.abs(currCell.x - (rows-1))) + (Math.abs(currCell.y - (rows-1))))]
  queue.sort(function(a, b) { 
    return a[1] > b[1] ? 1 : -1;
  });
*/