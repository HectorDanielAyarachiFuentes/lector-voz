// =============================================================
// history.js — Módulo de Historial de Mensajes
// Gestiona: registro de mensajes hablados con fecha/hora,
//           renderizado de la lista y reproducción desde historial.
// Depende de: textInput, speak() (voice.js)
// =============================================================

'use strict';

/* ─── Estado del módulo ──────────────────────────────────────── */
const historyList  = document.getElementById('history-list');
let messageHistory = [];

/* ─── Añadir mensaje al historial ────────────────────────────── */
function addToHistory(text) {
    // Evitar duplicados consecutivos
    if (messageHistory.length > 0 && messageHistory[0].text === text) return;

    const now     = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageHistory.unshift({ text, date: dateStr, time: timeStr });
    if (messageHistory.length > 30) messageHistory.pop(); // Límite de 30 entradas

    renderHistory();
}

/* ─── Renderizar la lista de historial ───────────────────────── */
function renderHistory() {
    if (messageHistory.length === 0) {
        historyList.innerHTML = '<div class="empty-history">Aún no hay mensajes.</div>';
        return;
    }

    historyList.innerHTML = '';

    messageHistory.forEach(item => {
        const div       = document.createElement('div');
        div.className   = 'history-item';
        div.title       = 'Haz clic para reproducir';

        // Línea de metadatos: fecha y hora
        const infoP           = document.createElement('div');
        infoP.style.fontSize  = '0.75rem';
        infoP.style.color     = '#7f8c8d';
        infoP.style.marginBottom = '6px';
        infoP.style.lineHeight   = '1.3';
        const clockIcon = document.createElement('i');
        clockIcon.className = 'far fa-clock';
        infoP.appendChild(clockIcon);
        infoP.appendChild(document.createTextNode(` Este mensaje fue dicho el ${item.date} a las ${item.time} y esto se dijo:`));

        // Contenedor: texto + ícono de reproducción
        const textContainer               = document.createElement('div');
        textContainer.style.display       = 'flex';
        textContainer.style.alignItems    = 'center';
        textContainer.style.justifyContent = 'space-between';
        textContainer.style.gap           = '10px';

        const textSpan           = document.createElement('span');
        textSpan.textContent     = `"${item.text}"`;
        textSpan.style.fontWeight = 'bold';
        textSpan.style.color      = 'var(--text-main)';
        textSpan.style.wordBreak  = 'break-word';

        const playIcon         = document.createElement('i');
        playIcon.className     = 'fas fa-volume-up';
        playIcon.style.color   = '#2193b0';
        playIcon.style.opacity = '0.8';

        textContainer.appendChild(textSpan);
        textContainer.appendChild(playIcon);

        div.appendChild(infoP);
        div.appendChild(textContainer);

        // Clic: reproducir desde historial
        div.onclick = () => {
            textInput.value = item.text;
            document.querySelectorAll('.active-speaking')
                    .forEach(b => b.classList.remove('active-speaking'));
            div.classList.add('active-speaking');
            speak();
        };

        historyList.appendChild(div);
    });
}
