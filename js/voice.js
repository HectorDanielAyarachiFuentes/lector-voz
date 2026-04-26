// =============================================================
// voice.js — Módulo de Síntesis de Voz
// Gestiona: carga de voces, reproducción expresiva, limpieza de texto,
//           puntuación automática y el visualizador de audio.
// Depende de: textInput, voiceSelect, rateInput (definidos en app.js)
// =============================================================

'use strict';

/* ─── Motor de síntesis ──────────────────────────────────────── */
const synth = window.speechSynthesis;

let voices = [];
let totalSentencesToSpeak = 0;
let sentencesFinished     = 0;

/* ─── Carga y ordenamiento de voces ─────────────────────────── */
function loadVoices() {
    voices = synth.getVoices();
    voiceSelect.innerHTML = '';

    // Mostrar voces en español primero
    let spanishVoices = voices.filter(v => v.lang.includes('es'));

    // Priorizar voces neurales / premium
    spanishVoices.sort((a, b) => {
        const aName    = a.name.toLowerCase();
        const bName    = b.name.toLowerCase();
        const aPremium = aName.includes('natural') || aName.includes('online')
                      || aName.includes('google')  || aName.includes('premium');
        const bPremium = bName.includes('natural') || bName.includes('online')
                      || bName.includes('google')  || bName.includes('premium');
        if (aPremium && !bPremium) return -1;
        if (!aPremium && bPremium) return  1;
        return 0;
    });

    spanishVoices.forEach(voice => {
        const option      = document.createElement('option');
        const isPremium   = voice.name.toLowerCase().match(/natural|online|google|premium/);
        const star        = isPremium ? '⭐ ' : '';
        option.textContent = `${star}${voice.name.replace('Microsoft', '').split(' - ')[0]} (${voice.lang})`;
        option.value       = voice.name;
        voiceSelect.appendChild(option);
    });

    if (spanishVoices.length === 0) {
        const option       = document.createElement('option');
        option.textContent = 'No se hallaron voces en español';
        voiceSelect.appendChild(option);
    }
}

// Inicialización
loadVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}

/* ─── Función principal de habla ─────────────────────────────── */
function speak() {
    const visualizer = document.getElementById('visualizer');

    if (synth.speaking) {
        synth.cancel();
        if (visualizer) visualizer.classList.remove('active');
        totalSentencesToSpeak = 0;
        sentencesFinished     = 0;
    }

    const fullText = textInput.value.trim();
    if (fullText === '') return;

    const selectedVoice = voices.find(v => v.name === voiceSelect.value);
    const baseRate      = parseFloat(rateInput.value);

    // Dividir en oraciones respetando puntuación
    const sentences = fullText.match(/[^.!?]+[.!?]*/g) || [fullText];

    sentences.forEach(sentence => {
        const text = sentence.trim();
        if (!text) return;

        const utterance  = new SpeechSynthesisUtterance(text);
        utterance.voice  = selectedVoice;

        let currentPitch = 1;
        let currentRate  = baseRate;

        // Entonación expresiva según puntuación
        if (text.includes('!') || text.includes('¡')) {
            currentPitch = 1.8;
            currentRate  = Math.min(baseRate * 1.25, 2);
        } else if (text.includes('?') || text.includes('¿')) {
            currentPitch = 1.5;
            currentRate  = Math.max(baseRate * 0.9, 0.5);
        } else if (text.includes('...')) {
            currentPitch = 0.6;
            currentRate  = Math.max(baseRate * 0.6, 0.5);
        } else {
            // Pequeña variación natural anti-robot
            currentPitch = 1.0 + (Math.random() * 0.1 - 0.05);
        }

        // Texto en MAYÚSCULAS → simula grito
        if (text === text.toUpperCase() && text.match(/[A-ZÁÉÍÓÚ]/)) {
            currentPitch = 1.7;
            currentRate  = Math.min(baseRate * 1.3, 2);
        }

        utterance.pitch = currentPitch;
        utterance.rate  = currentRate;
        totalSentencesToSpeak++;

        utterance.onstart = () => {
            if (visualizer) visualizer.classList.add('active');
        };

        utterance.onend = () => {
            sentencesFinished++;
            if (sentencesFinished >= totalSentencesToSpeak) {
                if (visualizer) visualizer.classList.remove('active');
                totalSentencesToSpeak = 0;
                sentencesFinished     = 0;
                document.querySelectorAll('.active-speaking')
                        .forEach(b => b.classList.remove('active-speaking'));
            }
        };

        utterance.onerror = utterance.onend;
        synth.speak(utterance);
    });

    // Guardar en historial (definido en history.js)
    addToHistory(fullText);
}

/* ─── Limpiar textarea y detener síntesis ────────────────────── */
function clearText() {
    textInput.value = '';
    synth.cancel();
    const visualizer = document.getElementById('visualizer');
    if (visualizer) visualizer.classList.remove('active');
    totalSentencesToSpeak = 0;
    sentencesFinished     = 0;
    document.querySelectorAll('.active-speaking')
            .forEach(b => b.classList.remove('active-speaking'));
}

/* ─── Aplicar puntuación expresiva al texto seleccionado ─────── */
function applyPunctuation(type) {
    const ta   = textInput;
    let start  = ta.selectionStart;
    let end    = ta.selectionEnd;
    let text   = ta.value;

    if (text.trim() === '') return;

    // Sin selección → aplicar a todo
    if (start === end) { start = 0; end = text.length; }

    const selectedText = text.substring(start, end);
    let cleanText      = selectedText.replace(/^[¡¿]+|[!?.]+$/g, '').trim();

    let newText = '';
    if (type === '!')   newText = `¡${cleanText}!`;
    else if (type === '?')   newText = `¿${cleanText}?`;
    else if (type === '...') newText = `${cleanText}...`;

    ta.value = text.substring(0, start) + newText + text.substring(end);
    ta.focus();
}

/* ─── Evento: Enter rápido para hablar ───────────────────────── */
textInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        speak();
    }
});
