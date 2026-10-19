const TOTAL_NIVELES = 3;
const PUZZLES_POR_NIVEL = 5;
const CLAVE = "puzzleMaster_progreso";
 
// datos que vienen en la URL (juego.html?nivel=1&puzzle=1)
const params = new URLSearchParams(window.location.search);
let nivel = parseInt(params.get("nivel")) || 1;
let puzzle = parseInt(params.get("puzzle")) || 1;
 
if (nivel < 1) nivel = 1;
if (nivel > TOTAL_NIVELES) nivel = TOTAL_NIVELES;
if (puzzle < 1) puzzle = 1;
if (puzzle > PUZZLES_POR_NIVEL) puzzle = PUZZLES_POR_NIVEL;
 
// elementos del html
const listaNiveles = document.getElementById("lista-niveles");
const listaPuzzles = document.getElementById("lista-puzzles");
const nivelSeleccionadoDOM = document.getElementById("nivel-seleccionado");
const tableroDOM = document.getElementById("tablero-puzzle");
const movimientosDOM = document.getElementById("movimientos");
const nivelActualDOM = document.getElementById("nivel-actual");
const puzzleActualDOM = document.getElementById("puzzle-actual");
const btnReiniciar = document.getElementById("btn-reiniciar");
const btnSalir = document.getElementById("btn-salir");
 
// datos del juego
const dimension = nivel + 2; // nivel 1 = 3x3, nivel 2 = 4x4, nivel 3 = 5x5
const rutaImagen = `img/nivel-${nivel}/puzzle-${puzzle}.jpg`;
let usarImagen = false;
let movimientos = 0;
let juegoTerminado = false;
let tablero = [];
let posVacia = { fila: dimension - 1, col: dimension - 1 };

function obtenerProgreso() {
    return JSON.parse(localStorage.getItem(CLAVE)) || {};
};
 
function puzzlesCompletados(n) {
    return obtenerProgreso()[n] || [];
};
 
function estaCompletado(n, p) {
    return puzzlesCompletados(n).includes(p);
};
 
function guardarPuzzle(n, p) {
    const progreso = obtenerProgreso();
    const lista = puzzlesCompletados(n);
 
    if (!lista.includes(p)) lista.push(p);
    progreso[n] = lista;
    localStorage.setItem(CLAVE, JSON.stringify(progreso));
};
 
function nivelCompleto(n) {
    return puzzlesCompletados(n).length >= PUZZLES_POR_NIVEL;
};
 
// el nivel 1 siempre está abierto, los demás piden el anterior completo
function nivelDesbloqueado(n) {
    return n === 1 || nivelCompleto(n - 1);
};
 
function juegoCompleto() {
    for (let n = 1; n <= TOTAL_NIVELES; n++) {
        if (!nivelCompleto(n)) return false;
    }
    return true;
};
 
// sirve para pruebas: se escribe en la consola del navegador
function reiniciarProgreso() {
    localStorage.removeItem(CLAVE);
};
 
 
//niveles.html
 
function mostrarNiveles() {
    for (let n = 1; n <= TOTAL_NIVELES; n++) {
        const tarjeta = document.getElementById("nivel-" + n);
        const texto = document.createElement("p");
 
        if (nivelDesbloqueado(n)) {
            tarjeta.classList.remove("bloqueado");
 
            // cambiar el botón "Bloqueado" por un enlace "Jugar"
            const boton = tarjeta.querySelector("button");
            if (boton) {
                boton.outerHTML = `<a href="puzzles.html?nivel=${n}" class="btn-nivel">Jugar</a>`;
            }
            texto.textContent = `Completados: ${puzzlesCompletados(n).length} de ${PUZZLES_POR_NIVEL}`;
        } else {
            texto.textContent = `Completa el Nivel ${n - 1} para desbloquearlo`;
        }
 
        tarjeta.insertBefore(texto, tarjeta.lastElementChild);
    }
};
 
 
//puzzles.html
 
function mostrarPuzzles() {
    // si el nivel está bloqueado, volver a la lista de niveles
    if (!nivelDesbloqueado(nivel)) {
        window.location.href = "niveles.html";
        return;
    }
 
    nivelSeleccionadoDOM.textContent = "Nivel " + nivel;
 
    for (let p = 1; p <= PUZZLES_POR_NIVEL; p++) {
        const tarjeta = document.getElementById("puzzle-" + p);
        const enlace = tarjeta.querySelector(".btn-jugar");

        enlace.href = `juego.html?nivel=${nivel}&puzzle=${p}`;

        // la foto de la tarjeta tambien depende del nivel
        const vistaPrevia = tarjeta.querySelector(".imagen-puzzle");
        if (vistaPrevia) vistaPrevia.src = `img/nivel-${nivel}/puzzle-${p}.jpg`;
 
        if (estaCompletado(nivel, p)) {
            const marca = document.createElement("p");
            marca.textContent = "✔ Completado";
            marca.className = "marca-completado";
            tarjeta.insertBefore(marca, enlace);
        }
    }
};
 
 
//juego.html
 
function iniciarJuego() {
    // si el nivel está bloqueado, volver a la lista de niveles
    if (!nivelDesbloqueado(nivel)) {
        window.location.href = "niveles.html";
        return;
    }
 
    btnSalir.href = `puzzles.html?nivel=${nivel}`;
    btnReiniciar.addEventListener("click", iniciarTablero);
 
    // revisar si existe la imagen del puzzle, si no se usan números
    const imagen = new Image();
    imagen.onload = function () {
        usarImagen = true;
        iniciarTablero();
    };
    imagen.onerror = function () {
        usarImagen = false;
        iniciarTablero();
    };
    imagen.src = rutaImagen;
};
 
function iniciarTablero() {
    movimientos = 0;
    juegoTerminado = false;
 
    nivelActualDOM.textContent = "Nivel " + nivel;
    puzzleActualDOM.textContent = "Puzzle " + puzzle;
    movimientosDOM.textContent = movimientos;
 
    tableroDOM.classList.remove("resuelto");
    tableroDOM.style.gridTemplateColumns = `repeat(${dimension}, 1fr)`;
    tableroDOM.style.gridTemplateRows = `repeat(${dimension}, 1fr)`;
 
    generarPiezas();
    mezclarTablero();
    dibujarTablero();
};
 
// crea el tablero ordenado
function generarPiezas() {
    let numero = 1;
    tablero = [];
 
    for (let f = 0; f < dimension; f++) {
        const fila = [];
        for (let c = 0; c < dimension; c++) {
            fila.push(numero);
            numero++;
        }
        tablero.push(fila);
    }
 
    tablero[dimension - 1][dimension - 1] = 0;
    posVacia = { fila: dimension - 1, col: dimension - 1 };
};
 
// mueve la pieza (f, c) al espacio vacío
function intercambiar(f, c) {
    tablero[posVacia.fila][posVacia.col] = tablero[f][c];
    tablero[f][c] = 0;
    posVacia = { fila: f, col: c };
};
 
// mezcla haciendo movimientos válidos, así siempre tiene solución
function mezclarTablero() {
    do {
        for (let i = 0; i < dimension * dimension * 15; i++) {
            const vecinos = [];
 
            if (posVacia.fila > 0) vecinos.push({ f: posVacia.fila - 1, c: posVacia.col });
            if (posVacia.fila < dimension - 1) vecinos.push({ f: posVacia.fila + 1, c: posVacia.col });
            if (posVacia.col > 0) vecinos.push({ f: posVacia.fila, c: posVacia.col - 1 });
            if (posVacia.col < dimension - 1) vecinos.push({ f: posVacia.fila, c: posVacia.col + 1 });
 
            const elegido = vecinos[Math.floor(Math.random() * vecinos.length)];
            intercambiar(elegido.f, elegido.c);
        }
    } while (estaResuelto()); // que nunca empiece ya resuelto
};
 
function dibujarTablero() {
    tableroDOM.innerHTML = "";
 
    for (let f = 0; f < dimension; f++) {
        for (let c = 0; c < dimension; c++) {
            const valor = tablero[f][c];
            const div = document.createElement("div");
 
            if (valor === 0) {
                div.className = "espacio-vacio";
                div.id = "espacio-vacio";
            } else {
                div.className = "pieza";
                div.id = "pieza-" + valor;
 
                if (usarImagen) {
                    // la pieza muestra el trozo de imagen que le corresponde
                    const filaOriginal = Math.floor((valor - 1) / dimension);
                    const colOriginal = (valor - 1) % dimension;
 
                    div.style.backgroundImage = `url("${rutaImagen}")`;
                    div.style.backgroundSize = `${dimension * 100}% ${dimension * 100}%`;
                    div.style.backgroundPosition =
                        `${colOriginal / (dimension - 1) * 100}% ${filaOriginal / (dimension - 1) * 100}%`;
                } else {
                    div.textContent = valor;
                }
 
                div.addEventListener("click", () => moverPieza(f, c));
            }
 
            tableroDOM.appendChild(div);
        }
    }
};
 
// solo se mueve si la pieza está pegada al espacio vacío
function moverPieza(f, c) {
    if (juegoTerminado) return;
 
    const distancia = Math.abs(f - posVacia.fila) + Math.abs(c - posVacia.col);
    if (distancia !== 1) return;
 
    intercambiar(f, c);
 
    movimientos++;
    movimientosDOM.textContent = movimientos;
 
    dibujarTablero();
    verificarVictoria();
};
 
//Revisa que cada pieza debe estar en su lugar
function estaResuelto() {
    for (let f = 0; f < dimension; f++) {
        for (let c = 0; c < dimension; c++) {
            let esperado = f * dimension + c + 1;
            if (f === dimension - 1 && c === dimension - 1) esperado = 0;
 
            if (tablero[f][c] !== esperado) return false;
        }
    }
    return true;
};
 
function verificarVictoria() {
    if (!estaResuelto()) return;
 
    juegoTerminado = true;
    tableroDOM.classList.add("resuelto");
 
    // se revisa antes de guardar para saber si ESTE puzzle completó el nivel o el juego
    const nivelListoAntes = nivelCompleto(nivel);
    const juegoListoAntes = juegoCompleto();
 
    guardarPuzzle(nivel, puzzle);
 
    setTimeout(() => {
        let mensaje = `¡Victoria! Completaste el Puzzle ${puzzle} del Nivel ${nivel} en ${movimientos} movimientos.`;
        let destino = `puzzles.html?nivel=${nivel}`;
 
        if (!juegoListoAntes && juegoCompleto()) {
            mensaje += "\n¡Completaste todos los niveles!";
            destino = "felicitacion.html";
        } else if (!nivelListoAntes && nivelCompleto(nivel)) {
            mensaje += `\n¡Nivel ${nivel} completado! Se desbloqueó el Nivel ${nivel + 1}.`;
            destino = `puzzles.html?nivel=${nivel + 1}`;
        }
 
        alert(mensaje);
        window.location.href = destino;
    }, 100);
};
 
// detecta en qué página está y arranca lo que le toca
if (tableroDOM) {
    iniciarJuego();
} else if (listaPuzzles) {
    mostrarPuzzles();
} else if (listaNiveles) {
    mostrarNiveles();
}