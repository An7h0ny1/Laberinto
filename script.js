// Función para generar un número aleatorio entre 0 (inclusive) y max (exclusivo).
function rand(max) {
  return Math.floor(Math.random() * max);
}

// Función para mezclar un array utilizando el algoritmo de Fisher-Yates.
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Función para cambiar el brillo de una imagen.
function changeBrightness(factor, sprite) {
  var virtCanvas = document.createElement("canvas");
  virtCanvas.width = 500;
  virtCanvas.height = 500;
  var context = virtCanvas.getContext("2d");
  context.drawImage(sprite, 0, 0, 500, 500);

  var imgData = context.getImageData(0, 0, 500, 500);
  // Modifica el brillo de la imagen multiplicando los valores RGB por el factor.
  for (let i = 0; i < imgData.data.length; i += 4) {
    imgData.data[i] = imgData.data[i] * factor;
    imgData.data[i + 1] = imgData.data[i + 1] * factor;
    imgData.data[i + 2] = imgData.data[i + 2] * factor;
  }
  context.putImageData(imgData, 0, 0);

  var spriteOutput = new Image();
  spriteOutput.src = virtCanvas.toDataURL();
  virtCanvas.remove();
  return spriteOutput;
}

// Función para mostrar un mensaje de victoria
function displayVictoryMess(moves) {
  document.getElementById("moves").innerHTML = "Te haz movido " + moves + " veces.";
  toggleVisablity("Message-Container");  
}

// Función para alternar la visibilidad del mensaje de felicitaciones.
function toggleVisablity(id) {
  if (document.getElementById(id).style.visibility == "visible") {
    document.getElementById(id).style.visibility = "hidden";
  } else {
    document.getElementById(id).style.visibility = "visible";
  }
}

function Maze(Width, Height) {
  var mazeMap;
  var width = Width;
  var height = Height;
  var startCoord, endCoord;
  var dirs = ["n", "s", "e", "w"];
  var modDir = {
    n: {
      y: -1,
      x: 0,
      o: "s"
    },
    s: {
      y: 1,
      x: 0,
      o: "n"
    },
    e: {
      y: 0,
      x: 1,
      o: "w"
    },
    w: {
      y: 0,
      x: -1,
      o: "e"
    }
  };

  this.map = function() {
    return mazeMap;
  };
  this.startCoord = function() {
    return startCoord;
  };
  this.endCoord = function() {
    return endCoord;
  };

  // Función interna para generar el mapa del laberinto.
  function genMap() {
    mazeMap = new Array(height);
    for (y = 0; y < height; y++) {
      mazeMap[y] = new Array(width);
      for (x = 0; x < width; ++x) {
        mazeMap[y][x] = {
          n: false,
          s: false,
          e: false,
          w: false,
          visited: false,
          priorPos: null
        };
      }
    }
  }

  // Función interna para definir el laberinto.
  function defineMaze() {
    var isComp = false;
    var move = false;
    var cellsVisited = 1;
    var numLoops = 0;
    var maxLoops = 0;
    var pos = {
      x: 0,
      y: 0
    };
    var numCells = width * height;
    while (!isComp) {
      move = false;
      mazeMap[pos.x][pos.y].visited = true;

      if (numLoops >= maxLoops) {
        shuffle(dirs);
        maxLoops = Math.round(rand(height / 8));
        numLoops = 0;
      }
      numLoops++;
      for (index = 0; index < dirs.length; index++) {
        var direction = dirs[index];
        var nx = pos.x + modDir[direction].x;
        var ny = pos.y + modDir[direction].y;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        
          if (!mazeMap[nx][ny].visited) {

            mazeMap[pos.x][pos.y][direction] = true;
            mazeMap[nx][ny][modDir[direction].o] = true;

            mazeMap[nx][ny].priorPos = pos;
            pos = {
              x: nx,
              y: ny
            };
            cellsVisited++;
            move = true;
            break;
          }
        }
      }

      if (!move) {
        pos = mazeMap[pos.x][pos.y].priorPos;
      }
      if (numCells == cellsVisited) {
        isComp = true;
      }
    }
  }

  // Función interna para definir las coordenadas de inicio y fin del laberinto.
  function defineStartEnd() {
    switch (rand(4)) {
      case 0:
        startCoord = {
          x: 0,
          y: 0
        };
        endCoord = {
          x: height - 1,
          y: width - 1
        };
        break;
      case 1:
        startCoord = {
          x: 0,
          y: width - 1
        };
        endCoord = {
          x: height - 1,
          y: 0
        };
        break;
      case 2:
        startCoord = {
          x: height - 1,
          y: 0
        };
        endCoord = {
          x: 0,
          y: width - 1
        };
        break;
      case 3:
        startCoord = {
          x: height - 1,
          y: width - 1
        };
        endCoord = {
          x: 0,
          y: 0
        };
        break;
    }
  }
  // Inicializa el laberinto.
  genMap();
  defineStartEnd();
  defineMaze();
}

// Función para dibujar un laberinto en un contexto de lienzo.
// Recibe el objeto Maze, el contexto del lienzo, el tamaño de las celdas y una imagen opcional para el final del laberinto.

function DrawMaze(Maze, ctx, cellsize, endSprite = null) {
  var map = Maze.map();
  var cellSize = cellsize;
  var drawEndMethod;
  ctx.lineWidth = cellSize / 40;

  // Método para volver a dibujar el laberinto con un nuevo tamaño de celda.
  this.redrawMaze = function(size) {
    cellSize = size;
    ctx.lineWidth = cellSize / 50;
    drawMap();
    drawEndMethod();
  };
   // Función interna para dibujar una celda del laberinto.
  function drawCell(xCord, yCord, cell) {
    var x = xCord * cellSize;
    var y = yCord * cellSize;

     // Dibujar las paredes de la celda
    if (cell.n == false) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cellSize, y);
      ctx.stroke();
    }
    if (cell.s === false) {
      ctx.beginPath();
      ctx.moveTo(x, y + cellSize);
      ctx.lineTo(x + cellSize, y + cellSize);
      ctx.stroke();
    }
    if (cell.e === false) {
      ctx.beginPath();
      ctx.moveTo(x + cellSize, y);
      ctx.lineTo(x + cellSize, y + cellSize);
      ctx.stroke();
    }
    if (cell.w === false) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + cellSize);
      ctx.stroke();
    }
  }
  // Función interna para dibujar todo el mapa del laberinto.
  function drawMap() {
    for (x = 0; x < map.length; x++) {
      for (y = 0; y < map[x].length; y++) {
        drawCell(x, y, map[x][y]);
      }
    }
  }

  // Función interna para dibujar una bandera al final del laberinto.
  function drawEndFlag() {
    var coord = Maze.endCoord();
    var gridSize = 4;
    var fraction = cellSize / gridSize - 2;
    var colorSwap = true;
    for (let y = 0; y < gridSize; y++) {
      if (gridSize % 2 == 0) {
        colorSwap = !colorSwap;
      }
      for (let x = 0; x < gridSize; x++) {
        ctx.beginPath();
        ctx.rect(
          coord.x * cellSize + x * fraction + 4.5,
          coord.y * cellSize + y * fraction + 4.5,
          fraction,
          fraction
        );
        if (colorSwap) {
          ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        }
        ctx.fill();
        colorSwap = !colorSwap;
      }
    }
  }

  // Función interna para dibujar una imagen al final del laberinto.
  function drawEndSprite() {
    var offsetLeft = cellSize / 50;
    var offsetRight = cellSize / 25;
    var coord = Maze.endCoord();
    ctx.drawImage(
      endSprite,
      2,
      2,
      endSprite.width,
      endSprite.height,
      coord.x * cellSize + offsetLeft,
      coord.y * cellSize + offsetLeft,
      cellSize - offsetRight,
      cellSize - offsetRight
    );
  }
  // Función para limpiar el lienzo.
  function clear() {
    var canvasSize = cellSize * map.length;
    ctx.clearRect(0, 0, canvasSize, canvasSize);
  }

  // Determinar el método de dibujo del final del laberinto
  if (endSprite != null) {
    drawEndMethod = drawEndSprite;
  } else {
    drawEndMethod = drawEndFlag;
  }

  // Limpiar el lienzo, dibujar el mapa y luego el final del laberinto.
  clear();
  drawMap();
  drawEndMethod();
}
// Variable global que indica si el juego está activo o no.
var gameActive = true;
// Variable global que indica si el juego ha finalizado.
let finalizo = false;

// Constructor para el jugador del laberinto.
function Player(maze, c, _cellsize, onComplete, sprite = null) {
  var ctx = c.getContext("2d");
  var drawSprite;
  var moves = 0;
  drawSprite = drawSpriteCircle;
  if (sprite != null) {
    drawSprite = drawSpriteImg;
  }
  var player = this;
  var map = maze.map();
  var cellCoords = {
    x: maze.startCoord().x,
    y: maze.startCoord().y
  };
  var cellSize = _cellsize;
  var halfCellSize = cellSize / 2;

  // Método para volver a dibujar al jugador con un nuevo tamaño de celda.
  this.redrawPlayer = function(_cellsize) {
    if (ctx && c) {
      cellSize = _cellsize;
      drawSpriteImg(cellCoords);
    } else {
      console.error("El contexto del lienzo o el lienzo mismo no están disponibles.");
    }
  };


  // Función para dibujar el sprite del jugador como un círculo.
  function drawSpriteCircle(coord) {
    ctx.beginPath();
    ctx.fillStyle = "yellow";
    ctx.arc(
      (coord.x + 1) * cellSize - halfCellSize,
      (coord.y + 1) * cellSize - halfCellSize,
      halfCellSize - 2,
      0,
      2 * Math.PI
    );
    ctx.fill();
    // Si el jugador llega al final del laberinto, llama a la función onComplete y desactiva los controles del jugador.
    if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) {
      onComplete(moves);
      player.unbindKeyDown();
      finalizo = true;
      
    }
  }
  // Función para dibujar el sprite del jugador como una imagen.
  function drawSpriteImg(coord) {
    var offsetLeft = cellSize / 50;
    var offsetRight = cellSize / 25;
    ctx.drawImage(
      sprite,
      0,
      0,
      sprite.width,
      sprite.height,
      coord.x * cellSize + offsetLeft,
      coord.y * cellSize + offsetLeft,
      cellSize - offsetRight,
      cellSize - offsetRight
    );
    // Si el jugador llega al final del laberinto, llama a la función onComplete y desactiva los controles del jugador.
    if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) {
      onComplete(moves);
      player.unbindKeyDown();
      finalizo = true;
    }
  }

  // Función para eliminar el sprite del jugador de una posición dada.
  function removeSprite(coord) {
    var offsetLeft = cellSize / 50;
    var offsetRight = cellSize / 25;
    ctx.clearRect(
      coord.x * cellSize + offsetLeft,
      coord.y * cellSize + offsetLeft,
      cellSize - offsetRight,
      cellSize - offsetRight
    );
  }

  var moveSucceeded = false; // Variable para controlar si el movimiento fue exitoso
  var warningGif = new Image();
  warningGif.src = './imagenes/alert.png';

  // Función para dibujar un emoticón de advertencia en la posición actual del jugador.
  function drawWarningEmoticon(coord) {
    var emoticonSize = cellSize / 2;
    var x = coord.x * cellSize + cellSize / 2 - emoticonSize / 2;
    var y = coord.y * cellSize + cellSize / 2 - emoticonSize / 2;

    // Dibujar el emoticón de advertencia 
    ctx.drawImage(warningGif, x, y, emoticonSize, emoticonSize);
  }

  // Función para verificar el movimiento del jugador según la tecla presionada.
  function check(e) {
    if (!gameActive) return;
    var cell = map[cellCoords.x][cellCoords.y];
    moves++;
    moveSucceeded = false; // Variable para controlar si se intentó mover o no
    switch (e.keyCode) {
      case 65:
      case 37: // west
        if (cell.w == true) {
          removeSprite(cellCoords);
          cellCoords = {
            x: cellCoords.x - 1,
            y: cellCoords.y
          };
          moveSucceeded = true;
          drawSprite(cellCoords);
  
        }
        break;
      case 87:
      case 38: // north
        if (cell.n == true) {
          removeSprite(cellCoords);
          cellCoords = {
            x: cellCoords.x,
            y: cellCoords.y - 1
          };
          moveSucceeded = true;
          drawSprite(cellCoords);
        }
        break;
      case 68:
      case 39: // east
        if (cell.e == true) {
          removeSprite(cellCoords);
          cellCoords = {
            x: cellCoords.x + 1,
            y: cellCoords.y
          };
          moveSucceeded = true;
          drawSprite(cellCoords);
        }
        break;
      case 83:
      case 40: // south
        if (cell.s == true) {
          removeSprite(cellCoords);
          cellCoords = {
            x: cellCoords.x,
            y: cellCoords.y + 1
          };
          moveSucceeded = true;
          drawSprite(cellCoords);
        }
        break;
    }

     // Si el movimiento no fue exitoso, mostrar el emoticón de advertencia
    if (!moveSucceeded) {
      drawWarningEmoticon(cellCoords);
    }
  }
  // Método para vincular la función de verificación de movimiento a los eventos de teclado y deslizamiento.
  this.bindKeyDown = function() {
    window.addEventListener("keydown", check, false);

    $("#view").swipe({
      swipe: function(
        event,
        direction,
        distance,
        duration,
        fingerCount,
        fingerData
      ) {
        console.log(direction);
        switch (direction) {
          case "up":
            check({
              keyCode: 38
            });
            break;
          case "down":
            check({
              keyCode: 40
            });
            break;
          case "left":
            check({
              keyCode: 37
            });
            break;
          case "right":
            check({
              keyCode: 39
            });
            break;
        }
      },
      threshold: 0
    });
  };

  // Método para desvincular la función de verificación de movimiento de los eventos de teclado y deslizamiento.
  this.unbindKeyDown = function() {
    window.removeEventListener("keydown", check, false);
    $("#view").swipe("destroy");
  };

   // Dibujar el sprite del jugador en la posición de inicio y vincular los eventos de teclado.
  drawSprite(maze.startCoord());

  this.bindKeyDown();
}
// Obtener el elemento del lienzo del laberinto y su contexto
var mazeCanvas = document.getElementById("mazeCanvas");
var ctx = mazeCanvas.getContext("2d");
// Sprite del jugador
var sprite;
var finishSprite;
var maze, draw, player;
var cellSize;
var difficulty;

// Manejar el evento onload para inicializar el juego
window.onload = function() {
  let viewWidth = $("#view").width();
  let viewHeight = $("#view").height();
  if (viewHeight < viewWidth) {
    ctx.canvas.width = viewHeight - viewHeight / 100;
    ctx.canvas.height = viewHeight - viewHeight / 100;
  } else {
    ctx.canvas.width = viewWidth - viewWidth / 100;
    ctx.canvas.height = viewWidth - viewWidth / 100;
  }

  var completeOne = false;
  var completeTwo = false;
  var isComplete = () => {
    if(completeOne === true && completeTwo === true)
       {
         console.log("Runs");
         setTimeout(function(){
           makeMaze();
         }, 500);         
       }
  };
  // Cargar la imagen del sprite de Pac-Man
  var sprite = new Image();
  sprite.src = "" + "?" + new Date().getTime();
  sprite.setAttribute("crossOrigin", " ");
  sprite.onload = function() {
      // Cambiar el brillo de la imagen
      sprite = changeBrightness(1.2, sprite);
      completeOne = true;
      console.log(completeOne);
      isComplete();
  };

  // Cargar la imagen del sprite de finalización
  var finishSprite = new Image();
  finishSprite.src = "" + "?" + new Date().getTime();
  finishSprite.setAttribute("crossOrigin", " ");
  finishSprite.onload = function() {
      // Cambiar el brillo de la imagen
      finishSprite = changeBrightness(1.1, finishSprite);
      completeTwo = true;
      console.log(completeTwo);
      isComplete();
  };

  
  
};

// Manejar el evento onresize para ajustar el tamaño del lienzo del laberint
window.onresize = function() {
  let viewWidth = $("#view").width();
  let viewHeight = $("#view").height();
  if (viewHeight < viewWidth) {
    ctx.canvas.width = viewHeight - viewHeight / 100;
    ctx.canvas.height = viewHeight - viewHeight / 100;
  } else {
    ctx.canvas.width = viewWidth - viewWidth / 100;
    ctx.canvas.height = viewWidth - viewWidth / 100;
  }
  cellSize = mazeCanvas.width / difficulty;
  if (player != null) {
    draw.redrawMaze(cellSize);
    player.redrawPlayer(cellSize);
  }
};

// Función para manejar el evento de presionar teclas
function bloquearEnter(event) {
  // Verificar si la tecla presionada es Enter (código 13)
  if (event.keyCode === 13) {
    // Cancelar el comportamiento predeterminado del evento
    event.preventDefault();
    // También puedes detener la propagación del evento si es necesario
    event.stopPropagation();
  }
}



let timerInterval; 
let remainingTime;
let paused = false;
var timerElement = document.getElementById("timer");

function makeMaze() {
 if (player != undefined) {
  player.unbindKeyDown();
  player = null;
 }
 var e = document.getElementById("diffSelect");
 difficulty = e.options[e.selectedIndex].value;
 cellSize = mazeCanvas.width / difficulty;
 maze = new Maze(difficulty, difficulty);
 draw = new DrawMaze(maze, ctx, cellSize, finishSprite);
 player = new Player(maze, mazeCanvas, cellSize, displayVictoryMess, sprite);
 if (document.getElementById("mazeContainer").style.opacity < "100") {
  document.getElementById("mazeContainer").style.opacity = "100";
 }

 let mensaje = document.getElementById('timeUpMessage');

 function updateTimer() {
   activateGame();
   timerElement.innerHTML = remainingTime;
   // Aplicar estilos
    timerElement.style.color = "black"; // Cambia el color del texto a rojo
    timerElement.style.fontSize = "100px"; // Cambia el tamaño del texto a 24px
    timerElement.style.fontWeight = "bold"; // Aplica negrita al texto
   document.getElementById("timer").innerHTML = remainingTime;
   if (remainingTime <= 0 || finalizo == true) { 
    deactivateGame(); // Detener el temporizador cuando llegue a cero
    showTimeUpMessage(mensaje);
    finalizo = false;
   }
   remainingTime--; // Decrementar el temporizador
 }



 function showTimeUpMessage(mensaje) {
  if (remainingTime === 0) {
    mensaje.classList.add("show"); 
  }
 }
   
 function deactivateGame() {
  clearInterval(timerInterval); 
  gameActive = false;
  document.getElementById("startMazeBtn").disabled = false;
  document.getElementById("diffSelect").disabled = false;
 }

 function activateGame() {
  gameActive = true;
  document.getElementById("startMazeBtn").disabled = true;
  document.getElementById("diffSelect").disabled = true;
 }
  
 function startTimer() {
  document.getElementById('timeUpMessage').classList.remove("show");
  updateTimer(); 
  timerInterval = setInterval(updateTimer, 1000); 
 }

 function stopTimer() {
  clearInterval(timerInterval); 
 }

 document.getElementById("pauseBtn").addEventListener("click", function() {
  if (!paused) {
   stopTimer();
   console.log('Finaliza en ' + remainingTime);
   paused = false; 
   gameActive = false; // Asegúrate de que el juego se detenga cuando se pausa
  } else {
   paused = true; 
   gameActive = true; // Asegúrate de que el juego se reanude cuando se reanuda
   startTimer(); // Reanuda el temporizador
  }
});
  
 document.getElementById("restartBtn").addEventListener("click", function() {
  if (!gameActive) {
   console.log('Empieza en ' + remainingTime);
   paused = false; 
   startTimer();
  }
 });

 document.getElementById("startMazeBtn").addEventListener("click", function() {
  document.getElementById("startMazeBtn").disabled = true;
  stopTimer(); // Detener el temporizador actual antes de iniciar uno nuevo
  var e = document.getElementById("diffSelect");
  difficulty = e.options[e.selectedIndex].value;
  let duration = 0;
  switch(difficulty) {
    case "10":
      duration = 10;
      break;
    case "15":
      duration = 30;
      break;
    case "25":
      duration = 90;
      break;
    case "38":
      duration = 200;
      break;
  } 
  remainingTime = duration;
  startTimer(); // Iniciar el temporizador
 });
} 

document.getElementById("diffSelect").addEventListener("change", function() {
 makeMaze(); // Llamar a la función makeMaze nuevamente cuando se cambie la dificultad
});

document.addEventListener("keydown", bloquearEnter);

gameActive = false;