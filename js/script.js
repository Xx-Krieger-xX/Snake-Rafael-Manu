// js/script.js

// === 1. CONFIGURACIÓN INICIAL Y ELEMENTOS DEL DOM ===
// Obtenemos las referencias a los elementos del HTML para poder manipularlos
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d"); // Contexto de renderizado 2D para dibujar gráficos
const scoreElement = document.getElementById("score");
const startBtn = document.getElementById("startBtn");
const randomColorBtn = document.getElementById("randomColorBtn");

// === 2. VARIABLES DE ESTADO DEL JUEGO ===
const gridSize = 20; // Tamaño en píxeles de cada segmento de la serpiente y de la comida
let score = 0;       // Puntuación actual del jugador
let gameStarted = false; // Bandera para saber si el bucle del juego está activo

// Posición inicial de la serpiente. Es un array de objetos con coordenadas (x, y).
// El índice 0 siempre representa la cabeza de la serpiente. Inicia con 3 segmentos.
let snake = [
    { x: 200, y: 200 },
    { x: 180, y: 200 },
    { x: 160, y: 200 }
];

// Velocidad y dirección inicial: se mueve hacia la derecha (suma 20px en X, 0px en Y)
let dx = gridSize;
let dy = 0;

// Variables para almacenar las coordenadas actuales de la comida
let foodX;
let foodY;

// Bloqueo de dirección: previene que el jugador presione dos teclas muy rápido 
// y haga que la serpiente colapse sobre sí misma en un solo fotograma.
let changingDirection = false;

// === 3. ESTILOS Y COLORES ===
// Obtenemos los colores definidos en las variables CSS globales para mantener consistencia visual
const styles = getComputedStyle(document.documentElement);
let snakeColor = styles.getPropertyValue("--snake-color").trim();
let snakeBorder = styles.getPropertyValue("--snake-border").trim();
const foodColor = styles.getPropertyValue("--food-color").trim();
const foodBorder = styles.getPropertyValue("--food-border").trim();

// Dibujamos el estado inicial en pantalla para que no se vea un lienzo en blanco antes de jugar
clearCanvas();
drawSnake();

// === 4. EVENTOS DEL MENÚ ===
startBtn.addEventListener("click", () => {
    if (!gameStarted) {
        gameStarted = true;
        startBtn.classList.add("hidden"); // Ocultamos el botón al jugar
        generateFood(); // Posicionamos la primera manzana/comida
        main(); // Arrancamos el motor del juego
    }
});

function randomSnakePalette() {
    const hue = Math.floor(Math.random() * 360);
    const color = `hsl(${hue}, 75%, 55%)`;
    const border = `hsl(${hue}, 80%, 40%)`;

    document.documentElement.style.setProperty("--snake-color", color);
    document.documentElement.style.setProperty("--snake-border", border);

    snakeColor = color;
    snakeBorder = border;
}

randomColorBtn.addEventListener("click", () => {
    randomSnakePalette();
    clearCanvas();
    drawFood();
    drawSnake();
});

// === 5. BUCLE PRINCIPAL DEL JUEGO ===
function main() {
    // Condición de derrota: si choca, terminamos la ejecución
    if (hasGameEnded()) {
        setTimeout(() => {
            alert("¡Juego Terminado! Tu puntuación final es: " + score);
            document.location.reload(); // Recargamos la página para resetear todo el estado
        }, 100);
        return; 
    }

    // Liberamos el bloqueo de dirección para permitir un nuevo giro en este fotograma
    changingDirection = false;
    
    // El bucle se llama a sí mismo recursivamente usando setTimeout.
    // El tiempo de espera (gameSpeed) es dinámico, por lo que el juego se acelera con el tiempo.
    setTimeout(function onTick() {
        clearCanvas(); // Borramos la pantalla anterior
        drawFood();    // Dibujamos la comida
        moveSnake();   // Calculamos la nueva posición de la serpiente
        drawSnake();   // Dibujamos la serpiente en su nueva posición
        main();        // Siguiente ciclo
    }, gameSpeed);//<---======================================Actualizacion manual=========================================== 
}

// === 6. FUNCIONES DE DIBUJO ===

function clearCanvas() {
    // Borra todo el contenido del canvas (necesario en cada fotograma para que no quede el rastro)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    // Recorre cada segmento del cuerpo de la serpiente y lo dibuja
    snake.forEach(drawSnakePart);
}

function drawSnakePart(snakePart) {
    ctx.fillStyle = snakeColor; 
    ctx.strokeStyle = snakeBorder; 
    // Dibuja el relleno y luego el borde de cada cuadrado (gridSize x gridSize)
    ctx.fillRect(snakePart.x, snakePart.y, gridSize, gridSize);
    ctx.strokeRect(snakePart.x, snakePart.y, gridSize, gridSize);
}

function drawFood() {
    ctx.fillStyle = foodColor; 
    ctx.strokeStyle = foodBorder;
    // Efecto visual: Se dibuja un poco más pequeña que la celda de la cuadrícula
    // desplazando 2px hacia adentro y restando 4px al tamaño total.
    ctx.fillRect(foodX + 2, foodY + 2, gridSize - 4, gridSize - 4);
    ctx.strokeRect(foodX + 2, foodY + 2, gridSize - 4, gridSize - 4);
}

// === 7. LÓGICA DE MOVIMIENTO, COMIDA Y VELOCIDAD ===
function moveSnake() {
    // Crea un nuevo objeto para la cabeza, proyectando su posición según la dirección actual (dx, dy)
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head); // Añade la nueva cabeza al inicio del array

    // Comprueba si las coordenadas de la nueva cabeza coinciden con las de la comida
    const hasEatenFood = snake[0].x === foodX && snake[0].y === foodY;
    
    if (hasEatenFood) {
        score += 10; // Aumenta la puntuación
        scoreElement.innerHTML = score;
        updateSpeed(); // Verifica si debe aumentar la velocidad del juego
        generateFood(); // Crea una nueva comida en otra posición
        // Al comer, NO eliminamos la cola, logrando así que la serpiente crezca 1 bloque
    } else {
        // Si no come, eliminamos el último segmento (cola) para mantener el mismo tamaño
        snake.pop();
    }
}

function randomFood(min, max) {
    // Genera un número aleatorio que se ajusta perfectamente a la cuadrícula de 20x20
    return Math.round((Math.random() * (max - min) + min) / gridSize) * gridSize;
}

function generateFood() {
    foodX = randomFood(0, canvas.width - gridSize);
    foodY = randomFood(0, canvas.height - gridSize);
    
    // Validación: Evita que la comida aparezca justo debajo del cuerpo de la serpiente
    snake.forEach(function hasSnakeEatenFood(part) {
        const hasEaten = part.x === foodX && part.y === foodY;
        if (hasEaten) generateFood(); // Si hay colisión, intenta generar coordenadas nuevas
    });
}

//=============================================================Actualizacion manual================================================================
// Velocidad inicial en milisegundos (mayor número = más lento)
let gameSpeed = 140;

function updateSpeed() {
    // Sistema de progresión: Cada 50 puntos (5 comidas), sube de nivel
    const level = Math.floor(score / 50);
    // Reduce el tiempo entre fotogramas en 10ms por nivel. 
    // Math.max evita que baje de 60ms, estableciendo un límite máximo de velocidad.
    gameSpeed = Math.max(60, 140 - level * 10);
}

//===================================================================================================================================================

// === 8. LÓGICA DE COLISIONES ===
function hasGameEnded() {
    // 1. Autocolisión: Comprueba si la cabeza (índice 0) intersecta con cualquier parte del cuerpo.
    // Inicia en el índice 4 porque físicamente una serpiente no puede chocar con sus primeros 3 segmentos.
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    
    // 2. Colisión con los bordes: Comprueba si la cabeza sobrepasa los límites del canvas
    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x >= canvas.width;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y >= canvas.height;

    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
}

// === 9. CONTROLES DE TECLADO ===
document.addEventListener("keydown", changeDirection);

function changeDirection(event) {
    // Previene el comportamiento por defecto (como hacer scroll en la página) para las teclas de control
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"].includes(event.code)) {
        event.preventDefault();
    }

    if (!gameStarted) return; // Ignora los controles si el juego no está activo

    if (changingDirection) return; // Ignora la pulsación si ya se cambió de dirección en este fotograma
    changingDirection = true;

    const keyPressed = event.code;
    
    // Determinamos la dirección actual evaluando los vectores de movimiento
    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;

    // Actualiza la dirección dependiendo de la tecla presionada (soporta Flechas y WASD).
    // Las condiciones aseguran que la serpiente no pueda girar 180 grados instantáneamente.
    if ((keyPressed === "ArrowLeft" || keyPressed === "KeyA") && !goingRight) {
        dx = -gridSize;
        dy = 0;
    }
    if ((keyPressed === "ArrowUp" || keyPressed === "KeyW") && !goingDown) {
        dx = 0;
        dy = -gridSize;
    }
    if ((keyPressed === "ArrowRight" || keyPressed === "KeyD") && !goingLeft) {
        dx = gridSize;
        dy = 0;
    }
    if ((keyPressed === "ArrowDown" || keyPressed === "KeyS") && !goingUp) {
        dx = 0;
        dy = gridSize;
    }
}