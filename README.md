# 💕 Agenda Compartida - Josué e Ivonne

Aplicación web para registrar días de no disponibilidad compartida entre dos personas.

## 🚀 Características

- ✅ Calendario interactivo para marcar días no disponibles
- 👥 Dos usuarios: Josué e Ivonne
- 🎨 Colores distintos para cada persona
- 💾 Base de datos SQLite para persistencia
- 🔄 API REST con Python/Flask
- 📱 Diseño responsive

## 📋 Requisitos

- Python 3.8 o superior
- Navegador web moderno

## ⚙️ Instalación

### 1. Instalar dependencias de Python

```powershell
pip install -r requirements.txt
```

### 2. Iniciar el servidor backend

```powershell
python app.py
```

El servidor se ejecutará en `http://localhost:5000`

### 3. Abrir la aplicación

Abre el archivo `index.html` en tu navegador o usa un servidor local:

```powershell
# Opción 1: Abrir directamente
start index.html

# Opción 2: Usar servidor HTTP de Python
python -m http.server 8000
# Luego abre http://localhost:8000
```

## 📖 Uso

1. **Seleccionar usuario**: Haz clic en el botón con tu nombre (Josué o Ivonne)
2. **Marcar días**: Haz clic en los días del calendario que no tienes disponibilidad
3. **Ver disponibilidad**: Los colores indican quién no está disponible:
   - 🔵 Azul: Josué no disponible
   - 🔴 Rosa: Ivonne no disponible
   - 🔵🔴 Ambos colores: Ninguno disponible
4. **Navegar meses**: Usa las flechas para ver otros meses

## 🗄️ Base de datos

La aplicación crea automáticamente un archivo `agenda.db` con SQLite que almacena:
- Fecha del día marcado
- Usuario que lo marcó
- Timestamp de creación

## 🛠️ API Endpoints

- `GET /api/days/<year>/<month>` - Obtener días no disponibles de un mes
- `POST /api/toggle` - Marcar/desmarcar día
- `GET /api/all-days` - Ver todos los días registrados
- `GET /api/stats` - Estadísticas de disponibilidad

## 🎨 Personalización

Puedes cambiar los nombres editando:
- Los botones en [index.html](index.html)
- Las clases CSS en [style.css](style.css)
- Las variables en [java.js](java.js)

## 📝 Notas

- Los datos se guardan localmente en la base de datos SQLite
- Para acceso remoto, necesitarás configurar el servidor en una red o hosting
- Para producción, considera usar PostgreSQL o MySQL en lugar de SQLite

---

Hecho con 💕 para Josué e Ivonne
