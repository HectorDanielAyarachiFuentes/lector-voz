// =============================================================
// app.js — Núcleo / Bootstrap de VozInteractiva Pro
// Solo contiene: referencias al DOM compartidas, registro del
//                Service Worker, paneles off-canvas y swipe móvil.
//
// Arquitectura modular:
//   voice.js      → Síntesis de voz, puntuación, visualizador
//   history.js    → Historial de mensajes
//   predefined.js → Mensajes predefinidos y modo edición
//   aac.js        → Modo AAC (Comunicación Aumentativa y Alternativa)
// =============================================================

'use strict';

/* ─── Referencias al DOM compartidas por todos los módulos ────── */
const textInput   = document.getElementById('text-input');
const voiceSelect = document.getElementById('voice-select');
const rateInput   = document.getElementById('rate');

/* ─── Registro del Service Worker (soporte Offline / PWA) ────── */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg  => console.log('ServiceWorker registrado:', reg.scope))
            .catch(err => console.log('Fallo al registrar SW:', err));
    });
}

/* ─── Paneles off-canvas (móvil) ─────────────────────────────── */
function toggleMobilePanel(side) {
    const panel   = document.getElementById(side + '-panel');
    const overlay = document.getElementById('overlay');

    if (!panel.classList.contains('open')) {
        closeAllPanels();
        panel.classList.add('open');
        overlay.classList.add('active');
    } else {
        closeAllPanels();
    }
}

function closeAllPanels() {
    document.getElementById('left-panel').classList.remove('open');
    document.getElementById('right-panel').classList.remove('open');
    document.getElementById('overlay').classList.remove('active');
}

/* ─── Soporte Swipe (deslizar en móviles) ────────────────────── */
let touchstartX = 0;
let touchendX   = 0;

function checkDirection() {
    const swipeThreshold = 50;

    // Deslizó hacia la derecha → panel izquierdo (Predefinidos)
    if (touchendX > touchstartX + swipeThreshold) {
        if (document.getElementById('right-panel').classList.contains('open')) {
            closeAllPanels();
        } else if (!document.getElementById('left-panel').classList.contains('open')) {
            toggleMobilePanel('left');
        }
    }

    // Deslizó hacia la izquierda → panel derecho (Historial)
    if (touchendX < touchstartX - swipeThreshold) {
        if (document.getElementById('left-panel').classList.contains('open')) {
            closeAllPanels();
        } else if (!document.getElementById('right-panel').classList.contains('open')) {
            toggleMobilePanel('right');
        }
    }
}

document.addEventListener('touchstart', e => {
    if (e.target.tagName.toLowerCase() === 'input' && e.target.type === 'range') return;
    touchstartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    if (e.target.tagName.toLowerCase() === 'input' && e.target.type === 'range') return;
    touchendX = e.changedTouches[0].screenX;
    if (window.innerWidth <= 950) checkDirection();
});
