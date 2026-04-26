// =============================================================
// predefined.js — Módulo de Mensajes Predefinidos
// Gestiona: lista de mensajes de acceso rápido, persistencia en
//           localStorage, modo edición y modal para añadir mensajes.
// Depende de: textInput, speak() (voice.js)
// =============================================================

'use strict';

/* ─── Mensajes por defecto ───────────────────────────────────── */
const defaultMessages = [
    "Hola, ¿cómo estás?",
    "Muchas gracias",
    "Por favor",
    "Sí",
    "No",
    "No entiendo",
    "¿Me puedes ayudar?",
    "Buenos días",
    "Buenas tardes",
    "Buenas noches",
    "Adiós, hasta luego",
    "Me llamo Ramón",
    "Necesito ir al baño",
    "Tengo hambre",
    "Tengo sed",
    "Me duele"
];

/* ─── Estado del módulo ──────────────────────────────────────── */
const predefinedList = document.getElementById('predefined-list');
let isEditMode       = false;

// Cargar desde localStorage o usar por defecto
let predefinedMessages = [];
const storedMessages   = localStorage.getItem('predefinedMessages');
if (storedMessages) {
    predefinedMessages = JSON.parse(storedMessages);
} else {
    predefinedMessages = [...defaultMessages];
}

/* ─── Renderizar la lista de predefinidos ────────────────────── */
function renderPredefined() {
    predefinedList.innerHTML = '';

    predefinedMessages.forEach((msg, index) => {
        const btnContainer               = document.createElement('div');
        btnContainer.style.display       = 'flex';
        btnContainer.style.gap           = '8px';
        btnContainer.style.marginBottom  = '10px';
        btnContainer.style.alignItems    = 'stretch';

        const btn          = document.createElement('button');
        btn.className      = 'message-btn';
        btn.style.flex     = '1';
        btn.style.marginBottom = '0';
        btn.textContent    = msg;
        btn.onclick = () => {
            textInput.value = msg;
            document.querySelectorAll('.active-speaking')
                    .forEach(b => b.classList.remove('active-speaking'));
            btn.classList.add('active-speaking');
            speak();
        };

        const deleteBtn       = document.createElement('button');
        deleteBtn.innerHTML   = '<i class="fas fa-trash"></i>';
        deleteBtn.className   = 'delete-btn';
        deleteBtn.title       = 'Eliminar mensaje';
        deleteBtn.onclick     = () => removePredefined(index);

        btnContainer.appendChild(btn);
        btnContainer.appendChild(deleteBtn);
        predefinedList.appendChild(btnContainer);
    });

    // Persistir en localStorage
    localStorage.setItem('predefinedMessages', JSON.stringify(predefinedMessages));
}

/* ─── Modo edición (mostrar/ocultar botones de borrar) ───────── */
function toggleEditMode() {
    isEditMode        = !isEditMode;
    const panel       = document.getElementById('left-panel');
    const btn         = document.getElementById('edit-mode-btn');

    if (isEditMode) {
        panel.classList.add('edit-mode');
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-check"></i>';
        btn.title     = 'Terminar edición';
    } else {
        panel.classList.remove('edit-mode');
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-edit"></i>';
        btn.title     = 'Editar mensajes';
    }
}

/* ─── Modal: añadir nuevo mensaje ────────────────────────────── */
function openAddModal() {
    document.getElementById('add-modal').classList.add('active');
    setTimeout(() => {
        document.getElementById('new-predefined-input').focus();
    }, 100);
}

function closeAddModal() {
    document.getElementById('add-modal').classList.remove('active');
    document.getElementById('new-predefined-input').value = '';
}

function addPredefined() {
    const input = document.getElementById('new-predefined-input');
    const val   = input.value.trim();
    if (!val) return;

    predefinedMessages.push(val);
    input.value = '';
    renderPredefined();
    closeAddModal();

    // Scroll automático al nuevo mensaje
    setTimeout(() => {
        predefinedList.scrollTop = predefinedList.scrollHeight;
    }, 100);
}

function removePredefined(index) {
    predefinedMessages.splice(index, 1);
    renderPredefined();
}

/* ─── Evento: Enter en el input del modal ────────────────────── */
document.getElementById('new-predefined-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addPredefined();
    }
});

/* ─── Inicialización ─────────────────────────────────────────── */
renderPredefined();
