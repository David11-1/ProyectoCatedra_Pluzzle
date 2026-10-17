// ===== progreso.js : avance del jugador en localStorage =====
// Formato guardado: {"completados": {"1": [1,2], "2": [], "3": []}}
const CLAVE_PROGRESO = 'puzzleMasterProgreso';
const PUZZLES_POR_NIVEL = 5;
const TOTAL_NIVELES = 3;

function progresoVacio() {
    return { completados: { 1: [], 2: [], 3: [] } };
}

function obtenerProgreso() {
    try {
        const guardado = JSON.parse(localStorage.getItem(CLAVE_PROGRESO));
        if (!guardado || !guardado.completados) return progresoVacio();
        // Por si falta algún nivel en lo guardado
        for (let n = 1; n <= TOTAL_NIVELES; n++) {
            if (!Array.isArray(guardado.completados[n])) guardado.completados[n] = [];
        }
        return guardado;
    } catch (e) {
        return progresoVacio();
    }
}

function guardarProgreso(progreso) {
    try {
        localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(progreso));
    } catch (e) {
        console.warn('No se pudo guardar el progreso', e);
    }
}

function marcarCompletado(nivel, puzzle) {
    const progreso = obtenerProgreso();
    if (!progreso.completados[nivel]) return;
    if (!progreso.completados[nivel].includes(puzzle)) {
        progreso.completados[nivel].push(puzzle);
        guardarProgreso(progreso);
    }
}

function puzzleCompletado(nivel, puzzle) {
    const lista = obtenerProgreso().completados[nivel];
    return !!lista && lista.includes(puzzle);
}

function cantidadCompletados(nivel) {
    const lista = obtenerProgreso().completados[nivel];
    return lista ? lista.length : 0;
}

function nivelCompletado(nivel) {
    return cantidadCompletados(nivel) >= PUZZLES_POR_NIVEL;
}

// El nivel 1 siempre está abierto; los demás requieren el anterior completo
function nivelDesbloqueado(nivel) {
    return nivel === 1 || nivelCompletado(nivel - 1);
}

function juegoCompletado() {
    for (let n = 1; n <= TOTAL_NIVELES; n++) {
        if (!nivelCompletado(n)) return false;
    }
    return true;
}

// Dice a dónde ir después de ganar. Devuelve:
//  { tipo: 'puzzle', nivel, puzzle }  -> siguiente puzzle del mismo nivel
//  { tipo: 'nivel', nivel }           -> nivel terminado, hay otro nivel
//  { tipo: 'final' }                  -> todo completado (pantalla de felicitación)
function siguientePaso(nivel, puzzle) {
    if (juegoCompletado()) return { tipo: 'final' };
    if (nivelCompletado(nivel)) {
        return nivel < TOTAL_NIVELES ? { tipo: 'nivel', nivel: nivel + 1 } : { tipo: 'final' };
    }
    // Siguiente puzzle pendiente del nivel (primero hacia adelante, luego desde el inicio)
    for (let i = 1; i <= PUZZLES_POR_NIVEL; i++) {
        const candidato = ((puzzle - 1 + i) % PUZZLES_POR_NIVEL) + 1;
        if (!puzzleCompletado(nivel, candidato)) {
            return { tipo: 'puzzle', nivel: nivel, puzzle: candidato };
        }
    }
    return { tipo: 'nivel', nivel: nivel };
}

function reiniciarProgreso() {
    localStorage.removeItem(CLAVE_PROGRESO);
}

// Guarda el avance solo cuando el tablero avisa que se ganó
window.addEventListener('puzzle-completado', function (e) {
    marcarCompletado(e.detail.nivel, e.detail.puzzle);
});
