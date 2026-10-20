// ===== api.js : acceso a datos (JSON + API de imágenes) =====
// Si luego suben el JSON a un servicio tipo mockapi.io, solo cambian estas URLs.
const URL_JUEGO = 'data/juego.json';
const URL_CREADORES = 'data/creadores.json';

async function pedirJSON(url) {
    const respuesta = await fetch(url);
    if (!respuesta.ok) {
        throw new Error('Error ' + respuesta.status + ' al cargar ' + url);
    }
    return await respuesta.json();
}

// Devuelve el arreglo de niveles: [{id, tamano, puzzles:[...]}, ...]
async function cargarNiveles() {
    const datos = await pedirJSON(URL_JUEGO);
    return datos.niveles;
}

// Devuelve un nivel concreto (o undefined si no existe)
async function cargarNivel(idNivel) {
    const niveles = await cargarNiveles();
    return niveles.find(n => n.id === Number(idNivel));
}

// Devuelve { nivel, puzzle, imagen } listo para el tablero (o null si no existe)
async function cargarPuzzle(idNivel, idPuzzle) {
    const nivel = await cargarNivel(idNivel);
    if (!nivel) return null;
    const puzzle = nivel.puzzles.find(p => p.id === Number(idPuzzle));
    if (!puzzle) return null;
    return { nivel: nivel, puzzle: puzzle, imagen: urlImagen(puzzle.semilla) };
}

// Devuelve el arreglo de creadores
async function cargarCreadores() {
    const datos = await pedirJSON(URL_CREADORES);
    return datos.creadores;
}

// Imagen cuadrada 600x600 desde la API de Picsum (la semilla fija la imagen)
function urlImagen(semilla) {
    return 'https://picsum.photos/seed/' + semilla + '/600/600';
}

// Lee ?nivel=1&puzzle=3 de la URL -> { nivel: 1, puzzle: 3 } (null si falta)
function leerParametros() {
    const params = new URLSearchParams(window.location.search);
    const nivel = parseInt(params.get('nivel'), 10);
    const puzzle = parseInt(params.get('puzzle'), 10);
    return {
        nivel: Number.isNaN(nivel) ? null : nivel,
        puzzle: Number.isNaN(puzzle) ? null : puzzle
    };
}
