        const synth = window.speechSynthesis;
        const textInput = document.getElementById('text-input');
        const voiceSelect = document.getElementById('voice-select');
        const rateInput = document.getElementById('rate');

        let voices = [];

        function loadVoices() {
            voices = synth.getVoices();
            voiceSelect.innerHTML = '';

            // Filtramos para mostrar voces en espaÃ±ol primero
            let spanishVoices = voices.filter(v => v.lang.includes('es'));

            // Priorizar voces Naturales, Online o de Google (suelen ser neuronales y mucho mÃ¡s expresivas)
            spanishVoices.sort((a, b) => {
                const aName = a.name.toLowerCase();
                const bName = b.name.toLowerCase();
                const aPremium = aName.includes('natural') || aName.includes('online') || aName.includes('google') || aName.includes('premium');
                const bPremium = bName.includes('natural') || bName.includes('online') || bName.includes('google') || bName.includes('premium');
                if (aPremium && !bPremium) return -1;
                if (!aPremium && bPremium) return 1;
                return 0;
            });

            spanishVoices.forEach(voice => {
                const option = document.createElement('option');
                
                // AÃ±adir un indicador visual a las mejores voces
                const isPremium = voice.name.toLowerCase().match(/natural|online|google|premium/);
                const star = isPremium ? "â­ " : "";
                
                option.textContent = `${star}${voice.name.replace('Microsoft', '').split(' - ')[0]} (${voice.lang})`;
                option.value = voice.name;
                voiceSelect.appendChild(option);
            });

            if (spanishVoices.length === 0) {
                const option = document.createElement('option');
                option.textContent = "No se hallaron voces en espaÃ±ol";
                voiceSelect.appendChild(option);
            }
        }

        // Inicializar voces
        loadVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }

        function speak() {
            if (synth.speaking) { synth.cancel(); } // Si ya estÃ¡ hablando, reinicia
            const fullText = textInput.value.trim();
            
            if (fullText !== '') {
                const selectedVoice = voices.find(v => v.name === voiceSelect.value);
                const baseRate = parseFloat(rateInput.value);
                
                // Dividir el texto en oraciones conservando los signos de puntuaciÃ³n
                const sentences = fullText.match(/[^.!?]+[.!?]*/g) || [fullText];
                
                sentences.forEach(sentence => {
                    const text = sentence.trim();
                    if (!text) return;
                    
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.voice = selectedVoice;
                    
                    let currentPitch = 1;
                    let currentRate = baseRate;
                    
                    // Modificar drÃ¡sticamente tono y velocidad para simular viveza
                    if (text.includes('!') || text.includes('Â¡')) {
                        currentPitch = 1.8; // Muy agudo y emocionado
                        currentRate = Math.min(baseRate * 1.25, 2); // Bastante mÃ¡s rÃ¡pido
                    } else if (text.includes('?') || text.includes('Â¿')) {
                        currentPitch = 1.5; // Agudo inquisitivo
                        currentRate = Math.max(baseRate * 0.9, 0.5); // Ligeramente mÃ¡s pausado
                    } else if (text.includes('...')) {
                        currentPitch = 0.6; // Grave y misterioso
                        currentRate = Math.max(baseRate * 0.6, 0.5); // Muy lento
                    } else {
                        // Ligera variaciÃ³n natural para que cada frase suene un poco distinta y no tan robÃ³tica
                        currentPitch = 1.0 + (Math.random() * 0.1 - 0.05);
                    }
                    
                    // Si el texto estÃ¡ completamente en MAYÃšSCULAS (simulando un grito)
                    if (text === text.toUpperCase() && text.match(/[A-ZÃÃ‰ÃÃ“Ãš]/)) {
                        currentPitch = 1.7;
                        currentRate = Math.min(baseRate * 1.3, 2);
                    }
                    
                    utterance.pitch = currentPitch;
                    utterance.rate = currentRate;
                    
                    synth.speak(utterance);
                });
                
                addToHistory(fullText);
            }
        }

        function clearText() {
            textInput.value = '';
            synth.cancel();
        }

        function applyPunctuation(type) {
            const ta = document.getElementById('text-input');
            let start = ta.selectionStart;
            let end = ta.selectionEnd;
            let text = ta.value;

            // Si no hay texto, no hacemos nada
            if (text.trim() === '') return;

            // Si no hay texto seleccionado, seleccionamos todo
            if (start === end) {
                start = 0;
                end = text.length;
            }

            const selectedText = text.substring(start, end);
            
            // Limpiamos la puntuaciÃ³n que ya tenga a los lados para no duplicar (ej: Â¡Â¡Hola!!)
            let cleanText = selectedText.replace(/^[Â¡Â¿]+|[!?.]+$/g, '').trim();

            let newText = '';
            if (type === '!') {
                newText = `Â¡${cleanText}!`;
            } else if (type === '?') {
                newText = `Â¿${cleanText}?`;
            } else if (type === '...') {
                newText = `${cleanText}...`;
            }

            ta.value = text.substring(0, start) + newText + text.substring(end);
            
            // Devolver el foco al textarea
            ta.focus();
        }

        // Evento de teclado
        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                speak();
            }
        });

        // --- Funciones del Historial ---
        const historyList = document.getElementById('history-list');
        let messageHistory = [];

        function addToHistory(text) {
            if (messageHistory[0] === text) return; // Evitar duplicados consecutivos
            
            messageHistory.unshift(text);
            if (messageHistory.length > 30) messageHistory.pop(); // Limitar a 30
            
            renderHistory();
        }

        function renderHistory() {
            if (messageHistory.length === 0) {
                historyList.innerHTML = '<div class="empty-history">AÃºn no hay mensajes.</div>';
                return;
            }

            historyList.innerHTML = '';
            messageHistory.forEach(msg => {
                const div = document.createElement('div');
                div.className = 'history-item';
                div.textContent = msg;
                div.title = "Haz clic para copiar al texto";
                div.onclick = () => {
                    textInput.value = msg;
                };
                historyList.appendChild(div);
            });
        }

        // --- Mensajes Predefinidos ---
        const defaultMessages = [
            "Hola, Â¿cÃ³mo estÃ¡s?",
            "Muchas gracias",
            "Por favor",
            "SÃ­",
            "No",
            "No entiendo",
            "Â¿Me puedes ayudar?",
            "Buenos dÃ­as",
            "Buenas tardes",
            "Buenas noches",
            "AdiÃ³s, hasta luego",
            "Me llamo RamÃ³n",
            "Necesito ir al baÃ±o",
            "Tengo hambre",
            "Tengo sed",
            "Me duele"
        ];

        let predefinedMessages = [];
        const storedMessages = localStorage.getItem('predefinedMessages');
        if (storedMessages) {
            predefinedMessages = JSON.parse(storedMessages);
        } else {
            predefinedMessages = [...defaultMessages];
        }

        const predefinedList = document.getElementById('predefined-list');
        let isEditMode = false;
        
        function toggleEditMode() {
            isEditMode = !isEditMode;
            const panel = document.getElementById('left-panel');
            const btn = document.getElementById('edit-mode-btn');
            
            if (isEditMode) {
                panel.classList.add('edit-mode');
                btn.classList.add('active');
                btn.innerHTML = '<i class="fas fa-check"></i>';
                btn.title = "Terminar ediciÃ³n";
            } else {
                panel.classList.remove('edit-mode');
                btn.classList.remove('active');
                btn.innerHTML = '<i class="fas fa-edit"></i>';
                btn.title = "Editar mensajes";
            }
        }
        
        function renderPredefined() {
            predefinedList.innerHTML = '';
            predefinedMessages.forEach((msg, index) => {
                const btnContainer = document.createElement('div');
                btnContainer.style.display = 'flex';
                btnContainer.style.gap = '8px';
                btnContainer.style.marginBottom = '10px';
                btnContainer.style.alignItems = 'stretch';

                const btn = document.createElement('button');
                btn.className = 'message-btn';
                btn.style.flex = '1';
                btn.style.marginBottom = '0';
                btn.textContent = msg;
                btn.onclick = () => {
                    textInput.value = msg;
                    speak(); 
                };

                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.className = 'delete-btn';
                deleteBtn.title = "Eliminar mensaje";
                deleteBtn.onclick = () => removePredefined(index);

                btnContainer.appendChild(btn);
                btnContainer.appendChild(deleteBtn);
                predefinedList.appendChild(btnContainer);
            });
            localStorage.setItem('predefinedMessages', JSON.stringify(predefinedMessages));
        }

        function addPredefined() {
            const input = document.getElementById('new-predefined-input');
            const val = input.value.trim();
            if (val) {
                predefinedMessages.push(val);
                input.value = '';
                renderPredefined();
            }
        }

        function removePredefined(index) {
            predefinedMessages.splice(index, 1);
            renderPredefined();
        }

        document.getElementById('new-predefined-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addPredefined();
            }
        });

        renderPredefined();

        // Registrar Service Worker para soporte Offline
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(registration => {
                        console.log('ServiceWorker registrado con Ã©xito: ', registration.scope);
                    })
                    .catch(error => {
                        console.log('Fallo al registrar el ServiceWorker: ', error);
                    });
            });
        }
