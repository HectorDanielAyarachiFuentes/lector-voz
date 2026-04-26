        const synth = window.speechSynthesis;
        const textInput = document.getElementById('text-input');
        const voiceSelect = document.getElementById('voice-select');
        const rateInput = document.getElementById('rate');

        let voices = [];
        let totalSentencesToSpeak = 0;
        let sentencesFinished = 0;

        function loadVoices() {
            voices = synth.getVoices();
            voiceSelect.innerHTML = '';

            // Filtramos para mostrar voces en español primero
            let spanishVoices = voices.filter(v => v.lang.includes('es'));

            // Priorizar voces Naturales, Online o de Google (suelen ser neuronales y mucho más expresivas)
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
                
                // Añadir un indicador visual a las mejores voces
                const isPremium = voice.name.toLowerCase().match(/natural|online|google|premium/);
                const star = isPremium ? "⭐ " : "";
                
                option.textContent = `${star}${voice.name.replace('Microsoft', '').split(' - ')[0]} (${voice.lang})`;
                option.value = voice.name;
                voiceSelect.appendChild(option);
            });

            if (spanishVoices.length === 0) {
                const option = document.createElement('option');
                option.textContent = "No se hallaron voces en español";
                voiceSelect.appendChild(option);
            }
        }

        // Inicializar voces
        loadVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }

        function speak() {
            const visualizer = document.getElementById('visualizer');
            
            if (synth.speaking) { 
                synth.cancel(); 
                if (visualizer) visualizer.classList.remove('active');
                totalSentencesToSpeak = 0;
                sentencesFinished = 0;
            }
            
            const fullText = textInput.value.trim();
            
            if (fullText !== '') {
                const selectedVoice = voices.find(v => v.name === voiceSelect.value);
                const baseRate = parseFloat(rateInput.value);
                
                // Dividir el texto en oraciones conservando los signos de puntuación
                const sentences = fullText.match(/[^.!?]+[.!?]*/g) || [fullText];
                
                sentences.forEach(sentence => {
                    const text = sentence.trim();
                    if (!text) return;
                    
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.voice = selectedVoice;
                    
                    let currentPitch = 1;
                    let currentRate = baseRate;
                    
                    // Modificar drásticamente tono y velocidad para simular viveza
                    if (text.includes('!') || text.includes('¡')) {
                        currentPitch = 1.8; // Muy agudo y emocionado
                        currentRate = Math.min(baseRate * 1.25, 2); // Bastante más rápido
                    } else if (text.includes('?') || text.includes('¿')) {
                        currentPitch = 1.5; // Agudo inquisitivo
                        currentRate = Math.max(baseRate * 0.9, 0.5); // Ligeramente más pausado
                    } else if (text.includes('...')) {
                        currentPitch = 0.6; // Grave y misterioso
                        currentRate = Math.max(baseRate * 0.6, 0.5); // Muy lento
                    } else {
                        // Ligera variación natural para que cada frase suene un poco distinta y no tan robótica
                        currentPitch = 1.0 + (Math.random() * 0.1 - 0.05);
                    }
                    
                    // Si el texto está completamente en MAYÚSCULAS (simulando un grito)
                    if (text === text.toUpperCase() && text.match(/[A-ZÁÉÍÓÚ]/)) {
                        currentPitch = 1.7;
                        currentRate = Math.min(baseRate * 1.3, 2);
                    }
                    
                    utterance.pitch = currentPitch;
                    utterance.rate = currentRate;
                    
                    totalSentencesToSpeak++;
                    
                    utterance.onstart = () => {
                        if (visualizer) visualizer.classList.add('active');
                    };
                    
                    utterance.onend = () => {
                        sentencesFinished++;
                        if (sentencesFinished >= totalSentencesToSpeak) {
                            if (visualizer) visualizer.classList.remove('active');
                            totalSentencesToSpeak = 0;
                            sentencesFinished = 0;
                        }
                    };
                    
                    utterance.onerror = utterance.onend;
                    
                    synth.speak(utterance);
                });
                
                addToHistory(fullText);
            }
        }

        function clearText() {
            textInput.value = '';
            synth.cancel();
            const visualizer = document.getElementById('visualizer');
            if (visualizer) visualizer.classList.remove('active');
            totalSentencesToSpeak = 0;
            sentencesFinished = 0;
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
            
            // Limpiamos la puntuación que ya tenga a los lados para no duplicar (ej: ¡¡Hola!!)
            let cleanText = selectedText.replace(/^[¡¿]+|[!?.]+$/g, '').trim();

            let newText = '';
            if (type === '!') {
                newText = `¡${cleanText}!`;
            } else if (type === '?') {
                newText = `¿${cleanText}?`;
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
                historyList.innerHTML = '<div class="empty-history">Aún no hay mensajes.</div>';
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
                btn.title = "Terminar edición";
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
                closeAddModal();
                
                // Hacer scroll al fondo de la lista
                setTimeout(() => {
                    const list = document.getElementById('predefined-list');
                    list.scrollTop = list.scrollHeight;
                }, 100);
            }
        }

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
                        console.log('ServiceWorker registrado con éxito: ', registration.scope);
                    })
                    .catch(error => {
                        console.log('Fallo al registrar el ServiceWorker: ', error);
                    });
            });
        }

        // --- Funciones para los paneles en versión móvil ---
        function toggleMobilePanel(side) {
            const panel = document.getElementById(side + '-panel');
            const overlay = document.getElementById('overlay');
            
            // Cerrar todos primero
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

        // --- Soporte para Swipe (Deslizar en Móviles) ---
        let touchstartX = 0;
        let touchendX = 0;

        function checkDirection() {
            const swipeThreshold = 50; // Distancia mínima para considerar que fue un deslizamiento
            
            // Deslizó hacia la derecha -> Abrir panel izquierdo (Predefinidos) o cerrar el derecho
            if (touchendX > touchstartX + swipeThreshold) {
                if (document.getElementById('right-panel').classList.contains('open')) {
                    closeAllPanels();
                } else if (!document.getElementById('left-panel').classList.contains('open')) {
                    toggleMobilePanel('left');
                }
            }
            
            // Deslizó hacia la izquierda -> Abrir panel derecho (Historial) o cerrar el izquierdo
            if (touchendX < touchstartX - swipeThreshold) {
                if (document.getElementById('left-panel').classList.contains('open')) {
                    closeAllPanels();
                } else if (!document.getElementById('right-panel').classList.contains('open')) {
                    toggleMobilePanel('right');
                }
            }
        }

        document.addEventListener('touchstart', e => {
            // Ignorar gestos si el usuario está interactuando con el slider de velocidad
            if(e.target.tagName.toLowerCase() === 'input' && e.target.type === 'range') return;
            touchstartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', e => {
            if(e.target.tagName.toLowerCase() === 'input' && e.target.type === 'range') return;
            touchendX = e.changedTouches[0].screenX;
            // Solo activar swipe si estamos en vista móvil
            if (window.innerWidth <= 950) {
                checkDirection();
            }
        });
