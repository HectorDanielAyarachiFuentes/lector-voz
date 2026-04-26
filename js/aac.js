// =============================================================
// aac.js — Módulo Modo Niños (Pictogramas AAC)
// Comunicación Aumentativa y Alternativa para VozInteractiva Pro
// Depende de: speak() y textInput definidos en app.js
// =============================================================

'use strict';

/* ─── Estado del módulo ──────────────────────────────────────── */
let kidsModeActive = false;

/* ─── Banco de pictogramas ───────────────────────────────────── */
const kidsItems = [
    // Básicos / Acciones
    { text: "Sí",           img: "si.jpg",          emoji: "✅", color: "#e8f5e9" },
    { text: "No",           img: "no.jpg",          emoji: "❌", color: "#ffebee" },
    { text: "Hola",         img: "hola.jpg",        emoji: "👋", color: "#e3f2fd" },
    { text: "Ayuda",        img: "ayuda.jpg",       emoji: "🙋", color: "#fff3e0" },
    { text: "Más",          img: "mas.jpg",         emoji: "➕", color: "#e8f5e9" },
    { text: "Terminé",      img: "termine.jpg",     emoji: "🏁", color: "#f3e5f5" },
    { text: "Parar",        img: "parar.jpg",       emoji: "✋", color: "#ffebee" },
    { text: "Quiero",       img: "quiero.jpg",      emoji: "🤲", color: "#e3f2fd" },
    { text: "No quiero",    img: "no_quiero.jpg",   emoji: "🙅", color: "#ffebee" },
    { text: "Ir al baño",   img: "bano.jpg",        emoji: "🚽", color: "#e1f5fe" },
    { text: "Comer",        img: "comer.jpg",       emoji: "🍽️", color: "#fff8e1" },
    { text: "Beber",        img: "beber.jpg",       emoji: "🥤", color: "#e3f2fd" },
    { text: "Jugar",        img: "jugar.jpg",       emoji: "🎮", color: "#e8f5e9" },
    { text: "Dormir",       img: "dormir.jpg",      emoji: "😴", color: "#ede7f6" },
    { text: "Caminar",      img: "caminar.jpg",     emoji: "🚶", color: "#e8f5e9" },
    { text: "Pasear",       img: "pasear.jpg",      emoji: "🌳", color: "#e8f5e9" },
    { text: "Bañarse",      img: "banarse.jpg",     emoji: "🛁", color: "#e1f5fe" },
    // Objetos / Personas
    { text: "Mamá",         img: "mama.jpg",        emoji: "👩", color: "#fce4ec" },
    { text: "Papá",         img: "papa.jpg",        emoji: "👨", color: "#e3f2fd" },
    { text: "Bicicleta",    img: "bicicleta.jpg",   emoji: "🚲", color: "#e8f5e9" },
    { text: "Pelota",       img: "pelota.jpg",      emoji: "⚽", color: "#fff8e1" },
    { text: "Libro",        img: "libro.jpg",       emoji: "📚", color: "#fff3e0" },
    { text: "Casa",         img: "casa.jpg",        emoji: "🏠", color: "#e8f5e9" },
    { text: "Escuela",      img: "escuela.jpg",     emoji: "🏫", color: "#e3f2fd" },
    { text: "Juguete",      img: "juguete.jpg",     emoji: "🧸", color: "#fce4ec" },
    // Emergencias / Auxilio
    { text: "Policía",      img: "policia.jpg",     emoji: "👮", color: "#e3f2fd" },
    { text: "Ambulancia",   img: "ambulancia.jpg",  emoji: "🚑", color: "#ffebee" },
    { text: "Hospital",     img: "hospital.jpg",    emoji: "🏥", color: "#e1f5fe" },
    { text: "Auxilio",      img: "auxilio.jpg",     emoji: "🆘", color: "#ffebee" },
    // Emociones / Estados
    { text: "Contento",     img: "contento.jpg",    emoji: "😄", color: "#fff9c4" },
    { text: "Triste",       img: "triste.jpg",      emoji: "😢", color: "#e3f2fd" },
    { text: "Enojado",      img: "enojado.jpg",     emoji: "😠", color: "#ffebee" },
    { text: "Asustado",     img: "asustado.jpg",    emoji: "😨", color: "#f3e5f5" },
    { text: "Cansado",      img: "cansado.jpg",     emoji: "😪", color: "#ede7f6" },
    { text: "Enfermo",      img: "enfermo.jpg",     emoji: "🤒", color: "#ffebee" },
    { text: "Aburrido",     img: "aburrido.jpg",    emoji: "😑", color: "#eceff1" },
    { text: "Sorprendido",  img: "sorprendido.jpg", emoji: "😲", color: "#fff3e0" },
    { text: "Tengo hambre", img: "hambre.jpg",      emoji: "🍔", color: "#fff8e1" },
    { text: "Tengo sed",    img: "sed.jpg",         emoji: "💧", color: "#e1f5fe" },
    { text: "Me duele",     img: "duele.jpg",       emoji: "🤕", color: "#ffebee" },
    { text: "Tengo calor",  img: "calor.jpg",       emoji: "🥵", color: "#fff3e0" },
    { text: "Tengo frío",   img: "frio.jpg",        emoji: "🥶", color: "#e3f2fd" },
    { text: "Bien",         img: "bien.jpg",        emoji: "😊", color: "#e8f5e9" },
    { text: "Mal",          img: "mal.jpg",         emoji: "😞", color: "#ffebee" }
];

/* ─── Toggle entre Modo Clásico y Modo Niños ─────────────────── */
function toggleKidsMode() {
    kidsModeActive = !kidsModeActive;

    const toggleBtn       = document.getElementById('kids-mode-toggle');
    const classicContainer = document.getElementById('classic-mode-container');
    const kidsContainer   = document.getElementById('kids-mode-container');

    if (kidsModeActive) {
        toggleBtn.classList.add('active');
        classicContainer.style.display = 'none';
        kidsContainer.style.display    = 'block';
        // Renderizar solo la primera vez
        if (kidsContainer.children.length === 0) {
            renderKidsGrid();
        }
    } else {
        toggleBtn.classList.remove('active');
        classicContainer.style.display = 'block';
        kidsContainer.style.display    = 'none';
    }
}

/* ─── Construcción del grid de pictogramas ───────────────────── */
function renderKidsGrid() {
    const container = document.getElementById('kids-mode-container');
    const grid      = document.createElement('div');
    grid.className  = 'kids-grid';

    kidsItems.forEach(item => {
        const card      = document.createElement('div');
        card.className  = 'kids-grid-item';
        card.setAttribute('title', item.text);

        card.onclick = () => {
            // Quitar resaltado de cualquier tarjeta anterior
            document.querySelectorAll('.kids-grid-item.active-speaking')
                    .forEach(b => b.classList.remove('active-speaking'));
            card.classList.add('active-speaking');

            // Enviar texto al motor de voz de app.js
            textInput.value = item.text;
            speak();
        };

        /* Imagen con fallback SVG + emoji */
        const img   = document.createElement('img');
        img.src     = `./Img/pictogramas/${item.img}`;
        img.alt     = item.text;
        img.loading = 'lazy';

        img.onerror = function () {
            this.onerror = null; // evitar loop
            const bgColor = encodeURIComponent(item.color || '#f0f4f8');
            const emoji   = encodeURIComponent(item.emoji || '❓');
            this.src = `data:image/svg+xml;utf8,`
                + `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">`
                + `<rect width="100" height="100" rx="15" fill="${bgColor}"/>`
                + `<text x="50" y="67" font-family="Segoe UI Emoji,Apple Color Emoji,sans-serif"`
                + ` font-size="52" text-anchor="middle">${emoji}</text>`
                + `</svg>`;
        };

        const label       = document.createElement('span');
        label.textContent = item.text;

        card.appendChild(img);
        card.appendChild(label);
        grid.appendChild(card);
    });

    container.appendChild(grid);
}
