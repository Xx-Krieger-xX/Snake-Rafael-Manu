// js/script.js

// === 1. CONFIGURACIÓN INICIAL Y ELEMENTOS DEL DOM ===
// Obtenemos los elementos del HTML con los que vamos a interactuar
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d"); // El contexto 2d nos permite dibujar en el canvas
const scoreElement = document.getElementById("score");
const startBtn = document.getElementById("startBtn"); 

// === 2. VARIABLES DE ESTADO DEL JUEGO ===
const gridSize = 20; // Tamaño de cada "cuadro" o bloque del juego (serpiente y comida)
let score = 0; // Puntuación inicial
let gameStarted = false; // Controla si el juego está en curso

// La serpiente es un array de coordenadas. Empieza con 3 bloques.
// El índice 0 es la cabeza de la serpiente.
let snake = [
    { x: 200, y: 200 },
    { x: 180, y: 200 },
    { x: 160, y: 200 }
];

// Velocidad inicial: se mueve hacia la derecha (avanza en el eje X, no se mueve en el eje Y)
let dx = gridSize;
let dy = 0;

// Coordenadas de la comida
let foodX;
let foodY;

// Evita que el jugador cambie de dirección múltiples veces en un solo "tick" (movimiento)
let changingDirection = false;

// === 3. ESTILOS Y COLORES ===
// Colores sincronizados con el nuevo CSS amigable a la vista
const canvasBg = "#0f0f11";    // Mismo fondo oscuro suave del CSS
const gridLines = "#27272a";   // Líneas de cuadrícula muy sutiles
const snakeColor = "#10b981";  // Esmeralda relajante para el cuerpo
const snakeBorder = "#059669"; // Borde de la serpiente
const foodColor = "#f43f5e";   // Rojo frambuesa (menos agresivo que el rojo puro)
const foodBorder = "#e11d48";  // Borde de la comida

// Dibujamos el estado inicial en pantalla antes de jugar
clearCanvas();
drawSnake();

// === 4. EVENTOS DEL MENÚ ===
// Iniciar el juego al hacer clic en el botón
startBtn.addEventListener("click", () => {
    if (!gameStarted) {
        gameStarted = true;
        startBtn.classList.add("hidden"); // Oculta el botón
        generateFood(); // Crea la primera comida
        main(); // Inicia el bucle principal del juego
    }
});

// === 5. BUCLE PRINCIPAL DEL JUEGO ===
function main() {
    // Primero comprobamos si hemos chocado (fin del juego)
    if (hasGameEnded()) {
        // Un pequeño retraso para que el usuario procese visualmente que chocó
        setTimeout(() => {
            alert("¡Juego Terminado! Tu puntuación final es: " + score);
            document.location.reload(); // Recarga la página para reiniciar
        }, 100);
        return; // Detiene la ejecución del juego
    }

    // Permitimos cambiar de dirección en este nuevo turno
    changingDirection = false;
    
    // Configuramos el temporizador para el siguiente "tick" (cuadro)
    setTimeout(function onTick() {
        clearCanvas(); // 1. Limpiar el fotograma anterior
        drawFood();    // 2. Dibujar la comida
        moveSnake();   // 3. Actualizar posiciones de la serpiente
        drawSnake();   // 4. Dibujar la serpiente en su nueva posición
        main();        // 5. Llamarse a sí misma de nuevo (Loop)
    }, 140); // 140 milisegundos de retraso (velocidad del juego)
}

// === 6. FUNCIONES DE DIBUJO ===
function clearCanvas() {
    // Rellena el fondo
    ctx.fillStyle = canvasBg;
    ctx.strokeStyle = gridLines;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    // Dibuja cada parte de la serpiente iterando sobre el array
    snake.forEach(drawSnakePart);
}

function drawSnakePart(snakePart) {
    // Configura el color y dibuja un cuadrado en las coordenadas x,y de esa parte
    ctx.fillStyle = snakeColor; 
    ctx.strokeStyle = snakeBorder; 
    ctx.fillRect(snakePart.x, snakePart.y, gridSize, gridSize);
    ctx.strokeRect(snakePart.x, snakePart.y, gridSize, gridSize);
}

function drawFood() {
    ctx.fillStyle = foodColor; 
    ctx.strokeStyle = foodBorder;
    // Hacemos que la comida sea un poco más pequeña que la cuadrícula para darle estilo (+2 y -4)
    ctx.fillRect(foodX + 2, foodY + 2, gridSize - 4, gridSize - 4);
    ctx.strokeRect(foodX + 2, foodY + 2, gridSize - 4, gridSize - 4);
}

// === 7. LÓGICA DE MOVIMIENTO Y COMIDA ===
function moveSnake() {
    // Creamos una nueva cabeza sumando la dirección actual (dx, dy) a la cabeza antigua
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    // Añadimos la nueva cabeza al principio del array de la serpiente
    snake.unshift(head); 

    // Comprobamos si la nueva cabeza coincide con la posición de la comida
    const hasEatenFood = snake[0].x === foodX && snake[0].y === foodY;
    
    if (hasEatenFood) {
        // Si comió: aumenta puntuación, actualiza texto y genera nueva comida
        score += 10;
        scoreElement.innerHTML = score;
        generateFood();
        // NOTA: No hacemos pop() aquí, por lo que la serpiente crece un bloque
    } else {
        // Si no comió: eliminamos la cola para que parezca que avanza sin crecer
        snake.pop();
    }
}

function randomFood(min, max) {
    // Genera un múltiplo de gridSize (20) de forma aleatoria para encajar en la cuadrícula
    return Math.round((Math.random() * (max - min) + min) / gridSize) * gridSize;
}

function generateFood() {
    // Calcula coordenadas aleatorias dentro de los límites del canvas
    foodX = randomFood(0, canvas.width - gridSize);
    foodY = randomFood(0, canvas.height - gridSize);
    
    // Verifica que la comida no haya aparecido encima de la serpiente
    snake.forEach(function hasSnakeEatenFood(part) {
        const hasEaten = part.x === foodX && part.y === foodY;
        // Si la comida apareció dentro del cuerpo, generamos otra inmediatamente
        if (hasEaten) generateFood();
    });
}

// === 8. LÓGICA DE COLISIONES ===
function hasGameEnded() {
    // 1. Chocar consigo misma: comprobamos si la cabeza (índice 0) toca alguna otra parte
    // Empezamos en 4 porque es imposible chocar con los primeros 3 segmentos
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    
    // 2. Chocar con las paredes: comprobamos si la cabeza sale del canvas
    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x >= canvas.width;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y >= canvas.height;

    // Retorna true si cualquiera de estas condiciones se cumple
    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
}

// === 9. CONTROLES DE TECLADO ===
// Escucha las pulsaciones de teclas en toda la página
document.addEventListener("keydown", changeDirection);

function changeDirection(event) {
    // Evita que la página haga scroll con las flechas si se presionan esas teclas
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(event.code) > -1) {
        event.preventDefault();
    }

    // No procesar controles si el juego no ha comenzado
    if (!gameStarted) return; 

    // Códigos numéricos de las teclas de flechas
    const LEFT_KEY = 37 || LEFT_KEY == 65; // <- o A
    const RIGHT_KEY = 39 || RIGHT_KEY == 68;// -> o D
    const UP_KEY = 38 || UP_KEY == 87; // ↑ o W
    const DOWN_KEY = 40 || DOWN_KEY == 83; //↓ o S

    // Evita que se pulse más de una tecla en un mismo tick (evita que la serpiente "dé la vuelta" sobre sí misma muy rápido)
    if (changingDirection) return;
    changingDirection = true;

    const keyPressed = event.keyCode;
    // Averiguamos hacia dónde nos estamos moviendo actualmente
    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;

    // Cambiamos la dirección (dx, dy) solo si la tecla presionada no es la dirección opuesta
    // (Ej: Si vas a la derecha, no puedes ir a la izquierda directamente)
    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -gridSize;
        dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -gridSize;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = gridSize;
        dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = gridSize;
    }
}