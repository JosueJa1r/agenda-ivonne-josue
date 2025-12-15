# 🌐 Cómo Compartir la Aplicación

## Opción 1: Red Local (Misma WiFi)

1. Asegúrate de que el servidor esté corriendo:
   ```powershell
   python app.py
   ```

2. Tu servidor está en: `http://192.168.1.11:5000`

3. Comparte el archivo `index.html` con Ivonne (WhatsApp, Drive, etc.)

4. Ella abre el archivo HTML en su navegador

5. **IMPORTANTE:** Tu computadora debe estar encendida y el servidor corriendo

## Opción 2: Ngrok (Acceso desde Internet)

### Instalación de Ngrok:

1. Descarga Ngrok: https://ngrok.com/download
2. Registrate gratis en ngrok.com
3. Instala y autentica:
   ```powershell
   ngrok config add-authtoken TU_TOKEN_AQUI
   ```

### Usar Ngrok:

1. Inicia el servidor Python:
   ```powershell
   python app.py
   ```

2. En otra terminal, ejecuta:
   ```powershell
   ngrok http 5000
   ```

3. Ngrok te dará una URL pública como: `https://abc123.ngrok.io`

4. **Actualiza el archivo java.js:**
   - Cambia `const API_URL = 'http://localhost:5000/api';`
   - Por `const API_URL = 'https://abc123.ngrok.io/api';`

5. Sube los archivos (index.html, style.css, java.js) a Google Drive o envíalos por WhatsApp

6. Ivonne abre el `index.html` y funcionará desde cualquier lugar

**Desventaja:** La URL de Ngrok cambia cada vez que lo reinicias (en la versión gratis)

## Opción 3: Hosting Gratuito (Mejor para Largo Plazo)

### PythonAnywhere (Gratis):

1. Crea cuenta en https://www.pythonanywhere.com
2. Sube tu código
3. Configura la aplicación Flask
4. Te dan una URL permanente como: `https://tuusuario.pythonanywhere.com`

### Vercel (Para Frontend):

1. Instala Vercel CLI:
   ```powershell
   npm install -g vercel
   ```

2. Ejecuta:
   ```powershell
   vercel
   ```

3. Sigue las instrucciones
4. Para el backend, usa PythonAnywhere o Railway

### Render (Gratis para Backend):

1. Sube tu código a GitHub
2. Crea cuenta en https://render.com
3. Conecta tu repositorio
4. Render desplegará automáticamente

## Opción 4: Crear una Aplicación Todo en Uno

Puedo ayudarte a crear una versión que empaquete todo en un solo archivo HTML con base de datos en localStorage (sin necesidad de servidor Python).

**Ventaja:** Un solo archivo HTML que pueden abrir ambos
**Desventaja:** No sincroniza entre dispositivos automáticamente

## 🎯 Recomendación

**Para empezar ahora:**
- Usa **Ngrok** (15 minutos de configuración)

**Para uso permanente:**
- Usa **PythonAnywhere** (gratis, URL permanente, 1 hora de configuración)

¿Qué opción prefieres que te ayude a configurar?
