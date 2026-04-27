# 🎙️ VozInteractiva Pro: Resumen del Proyecto y Evolución

¡Hola! En este documento detallamos el proceso de construcción de **VozInteractiva Pro**, las decisiones arquitectónicas que tomamos, las características implementadas, y las próximas mejoras que tenemos planeadas. 

---

## 🛠️ ¿Cómo lo hicimos?

A lo largo del proyecto, hemos transformado una simple herramienta de texto a voz en una **Suite de Comunicación Aumentativa y Alternativa (CAA) avanzada**. Nuestro proceso se dividió en las siguientes fases clave:

### 1. Refactorización y Modularización 🧩
Comenzamos con un archivo `app.js` monolítico que dificultaba la escalabilidad. Decidimos **desacoplar la lógica** en módulos independientes:
- **`speech.js`**: Controlador del motor de síntesis de voz (Web Speech API).
- **`history.js`**: Gestor del historial de auditoría de los mensajes reproducidos.
- **`preferences.js`**: Manejo de estado de la UI y persistencia de ajustes de usuario.
- **`aac.js`**: Módulo dedicado al Modo Niños / Pictogramas.

### 2. Reconocimiento de Escritura Offline (DTW) ✍️
Uno de los mayores logros técnicos fue reemplazar el pesado motor `Tesseract.js` (basado en reconocimiento de píxeles) por un motor de reconocimiento **DTW (Dynamic Time Warping) vectorial**. 
- Creamos un puente lógico en el `canvas` para calcular los trazos en tiempo real.
- Esto nos dio un **reconocimiento de letras y números instantáneo, 100% offline** y sin depender de servicios externos.

### 3. Modo AAC (Pictogramas para Niños) 🖼️
Construimos un robusto sistema de comunicación alternativa para usuarios no verbales o niños:
- Diseñamos una cuadrícula interactiva.
- Implementamos una lógica de **fallback automático**: Si un pictograma no cuenta con su imagen (`.png`), el sistema automáticamente renderiza un emoji representativo y elegante en formato SVG.

### 4. Mejoras de Interfaz (UI/UX) y Responsividad 📱
- Integramos un **menú lateral (Off-canvas)** para mejorar drásticamente la navegación en dispositivos móviles.
- Creamos modales para "Mensajes Predefinidos", integrando atajos rápidos.
- Agregamos un **historial detallado** que muestra el texto, la fecha y la hora exacta de cada reproducción.
- Mejoramos el Footer, dándole un toque profesional con créditos a "Hector Daniel" y un enlace a su GitHub.

---

## 📸 Capturas de la Aplicación

Hemos documentado la aplicación interactuando de forma fluida tanto en entorno de **Escritorio** como en su diseño **Móvil responsivo** (menú lateral, botones accesibles). A continuación puedes ver el recorrido funcional:

### Versión de Escritorio / Tablet
![Captura de Escritorio](./img%20md/desktop.png)

*(Animación del uso en escritorio: [Ver Video](./img%20md/desktop_demo.webp))*

### Versión Móvil
![Captura Móvil](./img%20md/mobile.png)

*(Animación del uso en móvil: [Ver Video](./img%20md/mobile_demo.webp))*

> [!NOTE]
> La aplicación está diseñada bajo el principio "Mobile-First", asegurando que botones como "Reproducir" o la lista de Pictogramas tengan un área táctil óptima para dispositivos móviles y tablets.

---

## 🚀 Mejoras Futuras Planeadas

La aplicación ya es potente, pero el roadmap que tenemos para el futuro la llevará al siguiente nivel:

1. **Soporte PWA (Progressive Web App) Completo 🌐**
   - Instalación nativa (Add to Home Screen) en móviles y PC.
   - Guardado en caché estricto mediante Service Workers para un uso 100% offline garantizado en todos sus módulos.

2. **Categorización de Pictogramas (AAC) 🗂️**
   - Agrupar pictogramas por categorías como: *Alimentos, Acciones, Emociones, Lugares, Cuerpo Humano*, permitiendo armar oraciones completas ("Yo quiero" + "Jugar" + "Pelota").

3. **Sincronización en la Nube y Perfiles ☁️**
   - Permitir a los usuarios crear cuentas para guardar su historial, sus configuraciones de voz y, lo más importante, **subir sus propias imágenes para crear pictogramas personalizados**.

4. **Motor de IA Local Mejorado para Escritura 🤖**
   - Integrar un modelo ligero de Machine Learning directamente en el navegador (`TensorFlow.js` o similar) para entender escritura cursiva o trazos más complejos sin perder la capacidad offline.

5. **Personalización Profunda de la UI 🎨**
   - Agregar paletas de colores personalizables.
   - Modo de "Alto Contraste" para usuarios con discapacidad visual y un selector manual de "Modo Oscuro / Modo Claro".

6. **Más Voces y Soporte Multilingüe 🌍**
   - Integración nativa con Azure TTS o Google Cloud TTS como opción Premium, ofreciendo voces neuronales ultrarrealistas.
   - Interfaz y tarjetas AAC disponibles en inglés, portugués y otros idiomas.

---

*¡Gracias por confiar en el proceso! Esta aplicación es ahora un sistema robusto, rápido y enfocado totalmente en la accesibilidad y el usuario final.*
