// Configuración
const API_URL = window.location.origin + '/api';
let currentUser = 'josue';
let currentDate = new Date();
let unavailableDays = [];
let selectedDate = null;
let selectedHours = [];

// Fechas importantes (día, mes)
const BIRTHDAYS = {
    josue: { day: 12, month: 6, name: 'Cumpleaños de Josué 🎉' },
    ivonne: { day: 7, month: 1, name: 'Cumpleaños de Ivonne 🎂' }
};

function isBirthday(day, month) {
    return Object.values(BIRTHDAYS).some(b => b.day === day && b.month === month);
}

function getBirthdayName(day, month) {
    const birthday = Object.values(BIRTHDAYS).find(b => b.day === day && b.month === month);
    return birthday ? birthday.name : null;
}

// Elementos del DOM
const loginScreen = document.getElementById('loginScreen');
const mainContainer = document.getElementById('mainContainer');
const userCards = document.querySelectorAll('.user-card');
const logoutBtn = document.getElementById('logoutBtn');
const currentUserNameEl = document.getElementById('currentUserName');
const calendar = document.getElementById('calendar');
const currentMonthEl = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const daysListEl = document.getElementById('daysList');
const timeModal = document.getElementById('timeModal');
const closeModalBtn = document.getElementById('closeModal');
const saveHoursBtn = document.getElementById('saveHours');
const clearAllHoursBtn = document.getElementById('clearAllHours');
const timeGrid = document.getElementById('timeGrid');
const modalDate = document.getElementById('modalDate');
const modalUser = document.getElementById('modalUser');

// Horas del día (24 horas)
const HOURS = Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}:00`);

// Nombres de días y meses
const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// Event Listeners
prevMonthBtn.addEventListener('click', () => changeMonth(-1));
nextMonthBtn.addEventListener('click', () => changeMonth(1));

// Event listeners para login
userCards.forEach(card => {
    card.addEventListener('click', () => {
        const user = card.dataset.user;
        loginUser(user);
    });
});

logoutBtn.addEventListener('click', () => {
    logoutUser();
});

// Verificar si hay usuario guardado al cargar
window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        showMainApp();
    }
});

function loginUser(user) {
    currentUser = user;
    localStorage.setItem('currentUser', user);
    
    // Ocultar pantalla de login
    loginScreen.style.display = 'none';
    
    // Mostrar bienvenida
    showWelcomeMessage();
    createFloatingHearts();
    
    // Después de la bienvenida, mostrar app
    setTimeout(() => {
        showMainApp();
    }, 3000);
}

function showMainApp() {
    mainContainer.style.display = 'block';
    currentUserNameEl.textContent = currentUser === 'josue' ? 'Josué' : 'Ivonne';
    currentUserNameEl.style.color = currentUser === 'josue' ? '#00ff88' : '#ff69b4';
    
    const userDisplay = document.getElementById('currentUserDisplay');
    userDisplay.style.borderColor = currentUser === 'josue' ? '#00ff88' : '#ff69b4';
    
    // Cargar calendario
    loadUnavailableDays();
}

function logoutUser() {
    localStorage.removeItem('currentUser');
    mainContainer.style.display = 'none';
    loginScreen.style.display = 'flex';
    
    // Reset
    const welcomeOverlay = document.getElementById('welcomeOverlay');
    welcomeOverlay.style.display = 'none';
    welcomeOverlay.style.animation = 'none';
}

function showWelcomeMessage() {
    const welcomeOverlay = document.getElementById('welcomeOverlay');
    const welcomeTitle = document.getElementById('welcomeTitle');
    const userName = currentUser === 'josue' ? 'Josué' : 'Ivonne';
    const emoji = currentUser === 'josue' ? '💚' : '💗';
    
    welcomeTitle.textContent = `¡Hola ${userName}! ${emoji}`;
    welcomeTitle.style.color = currentUser === 'josue' ? '#00ff88' : '#ff69b4';
    
    welcomeOverlay.style.display = 'flex';
    welcomeOverlay.style.animation = 'fadeOut 0.5s ease 2.5s forwards';
}



function createFloatingHearts() {
    const heartsContainer = document.getElementById('heartsContainer');
    const heartEmojis = ['💚', '💗', '💕', '💖', '💝', '💞', '💓'];
    
    // Crear 20 corazones
    for (let i = 0; i < 20; i++) {
        const heart = document.createElement('div');
        heart.classList.add('floating-heart');
        heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = (2 + Math.random() * 2) + 's';
        heart.style.animationDelay = (Math.random() * 2) + 's';
        heartsContainer.appendChild(heart);
    }
}

closeModalBtn.addEventListener('click', closeModal);
timeModal.addEventListener('click', (e) => {
    if (e.target === timeModal) closeModal();
});

saveHoursBtn.addEventListener('click', saveHours);
clearAllHoursBtn.addEventListener('click', clearAllHours);

// Funciones principales
function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    loadUnavailableDays();
}

function renderCalendar() {
    calendar.innerHTML = '';
    
    // Renderizar nombres de días
    dayNames.forEach(day => {
        const dayNameEl = document.createElement('div');
        dayNameEl.classList.add('day-name');
        dayNameEl.textContent = day;
        calendar.appendChild(dayNameEl);
    });
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    currentMonthEl.textContent = `${monthNames[month]} ${year}`;
    
    // Primer día del mes
    const firstDay = new Date(year, month, 1).getDay();
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0).getDate();
    // Último día del mes anterior
    const prevLastDay = new Date(year, month, 0).getDate();
    
    // Días del mes anterior
    for (let i = firstDay; i > 0; i--) {
        createDayElement(prevLastDay - i + 1, true, year, month - 1);
    }
    
    // Días del mes actual
    for (let day = 1; day <= lastDay; day++) {
        createDayElement(day, false, year, month);
    }
    
    // Días del mes siguiente
    const totalCells = calendar.children.length - 7; // Restar los nombres de días
    const remainingCells = 35 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
        createDayElement(day, true, year, month + 1);
    }
    
    updateDaysList();
}

function createDayElement(day, isOtherMonth, year, month) {
    const dayEl = document.createElement('div');
    dayEl.classList.add('day');
    dayEl.textContent = day;
    
    if (isOtherMonth) {
        dayEl.classList.add('other-month');
    }
    
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Verificar si es hoy
    const today = new Date();
    if (!isOtherMonth && day === today.getDate() && 
        month === today.getMonth() && year === today.getFullYear()) {
        dayEl.classList.add('today');
    }
    
    // Verificar si es cumpleaños
    if (!isOtherMonth && isBirthday(day, month + 1)) {
        dayEl.classList.add('birthday');
        dayEl.title = getBirthdayName(day, month + 1);
    } else {
        // Aplicar clases según disponibilidad
        const dayData = unavailableDays.find(d => d.date === dateStr);
        if (dayData) {
            const users = dayData.users.split(',');
            const hourCounts = dayData.hour_counts ? dayData.hour_counts.split(',') : [];
            
            if (users.includes('josue') && users.includes('ivonne')) {
                dayEl.classList.add('both');
            } else if (users.includes('josue')) {
                dayEl.classList.add('josue');
            } else if (users.includes('ivonne')) {
                dayEl.classList.add('ivonne');
            }
            
            // Agregar indicador de horas
            dayEl.classList.add('has-hours');
            
            // Mostrar cantidad de horas ocupadas
            if (hourCounts.length > 0) {
                const totalHours = hourCounts.reduce((sum, count) => sum + parseInt(count || 0), 0);
                if (totalHours > 0) {
                    const indicator = document.createElement('span');
                    indicator.classList.add('hours-indicator');
                    indicator.textContent = `${totalHours}h`;
                    dayEl.appendChild(indicator);
                }
            }
            
            // Agregar evento hover para mostrar horas específicas
            dayEl.addEventListener('mouseenter', async (e) => {
                const hours = await getHoursForDate(dateStr);
                showHoursTooltip(e, dateStr, hours);
            });
            
            dayEl.addEventListener('mouseleave', () => {
                hideHoursTooltip();
            });
        }
    }
    
    // Evento de click (no permitir marcar cumpleaños)
    if (!isOtherMonth && !isBirthday(day, month + 1)) {
        dayEl.addEventListener('click', () => openTimeModal(dateStr));
    } else if (!isOtherMonth && isBirthday(day, month + 1)) {
        dayEl.style.cursor = 'default';
    }
    
    calendar.appendChild(dayEl);
}

async function openTimeModal(dateStr) {
    selectedDate = dateStr;
    const date = new Date(dateStr);
    const formattedDate = `${date.getDate()} de ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    
    modalDate.textContent = formattedDate;
    modalUser.textContent = currentUser === 'josue' ? 'Josué' : 'Ivonne';
    
    // Cargar horas ya seleccionadas
    await loadSelectedHours(dateStr);
    
    // Renderizar grid de horas
    renderTimeGrid();
    
    // Mostrar modal
    timeModal.classList.add('active');
}

function closeModal() {
    timeModal.classList.remove('active');
    selectedDate = null;
    selectedHours = [];
}

function renderTimeGrid() {
    timeGrid.innerHTML = '';
    
    HOURS.forEach(hour => {
        const slot = document.createElement('div');
        slot.classList.add('time-slot');
        slot.textContent = hour;
        slot.dataset.hour = hour;
        
        if (selectedHours.includes(hour)) {
            slot.classList.add('selected');
        }
        
        slot.addEventListener('click', () => {
            slot.classList.toggle('selected');
            
            if (slot.classList.contains('selected')) {
                if (!selectedHours.includes(hour)) {
                    selectedHours.push(hour);
                }
            } else {
                selectedHours = selectedHours.filter(h => h !== hour);
            }
        });
        
        timeGrid.appendChild(slot);
    });
}

async function loadSelectedHours(dateStr) {
    try {
        const response = await fetch(`${API_URL}/hours/${dateStr}/${currentUser}`);
        if (response.ok) {
            const data = await response.json();
            selectedHours = data.hours || [];
        } else {
            selectedHours = [];
        }
    } catch (error) {
        console.error('Error al cargar horas:', error);
        selectedHours = [];
    }
}

async function getHoursForDate(dateStr) {
    try {
        const response = await fetch(`${API_URL}/hours-all/${dateStr}`);
        if (response.ok) {
            return await response.json();
        }
        return { josue: [], ivonne: [] };
    } catch (error) {
        console.error('Error al cargar horas del día:', error);
        return { josue: [], ivonne: [] };
    }
}

async function saveHours() {
    try {
        const response = await fetch(`${API_URL}/hours`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date: selectedDate,
                user: currentUser,
                hours: selectedHours
            })
        });
        
        if (response.ok) {
            closeModal();
            await loadUnavailableDays();
        } else {
            alert('Error al guardar las horas');
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        alert('No se pudo conectar al servidor.');
    }
}

function clearAllHours() {
    selectedHours = [];
    renderTimeGrid();
}

let tooltipEl = null;

function showHoursTooltip(event, dateStr, hours) {
    // Crear tooltip si no existe
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.classList.add('hours-tooltip');
        document.body.appendChild(tooltipEl);
    }
    
    const date = new Date(dateStr);
    const formattedDate = `${date.getDate()} de ${monthNames[date.getMonth()]}`;
    
    let content = `<div class="tooltip-title">${formattedDate}</div>`;
    
    if (hours.josue && hours.josue.length > 0) {
        content += `<div class="tooltip-user josue-hours">`;
        content += `<strong>Josué:</strong> ${formatHoursRange(hours.josue)}`;
        content += `</div>`;
    }
    
    if (hours.ivonne && hours.ivonne.length > 0) {
        content += `<div class="tooltip-user ivonne-hours">`;
        content += `<strong>Ivonne:</strong> ${formatHoursRange(hours.ivonne)}`;
        content += `</div>`;
    }
    
    tooltipEl.innerHTML = content;
    tooltipEl.style.display = 'block';
    
    // Posicionar tooltip
    const rect = event.target.getBoundingClientRect();
    tooltipEl.style.left = rect.left + (rect.width / 2) + 'px';
    tooltipEl.style.top = (rect.top - 10) + 'px';
}

function hideHoursTooltip() {
    if (tooltipEl) {
        tooltipEl.style.display = 'none';
    }
}

function formatHoursRange(hours) {
    if (!hours || hours.length === 0) return 'Sin horas';
    
    // Ordenar horas
    const sorted = hours.sort();
    
    // Agrupar horas consecutivas
    const ranges = [];
    let start = sorted[0];
    let prev = sorted[0];
    
    for (let i = 1; i < sorted.length; i++) {
        const current = sorted[i];
        const prevHour = parseInt(prev.split(':')[0]);
        const currentHour = parseInt(current.split(':')[0]);
        
        if (currentHour !== prevHour + 1) {
            // No consecutivo, guardar rango
            if (start === prev) {
                ranges.push(start);
            } else {
                ranges.push(`${start}-${prev}`);
            }
            start = current;
        }
        prev = current;
    }
    
    // Agregar último rango
    if (start === prev) {
        ranges.push(start);
    } else {
        ranges.push(`${start}-${prev}`);
    }
    
    return ranges.join(', ');
}

async function loadUnavailableDays() {
    try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        
        const response = await fetch(`${API_URL}/days/${year}/${month}`);
        if (response.ok) {
            unavailableDays = await response.json();
            renderCalendar();
        }
    } catch (error) {
        console.error('Error al cargar días:', error);
        unavailableDays = [];
        renderCalendar();
    }
}

function updateDaysList() {
    const currentMonthDays = unavailableDays.filter(d => {
        const date = new Date(d.date);
        return date.getMonth() === currentDate.getMonth() && 
               date.getFullYear() === currentDate.getFullYear();
    });
    
    if (currentMonthDays.length === 0) {
        daysListEl.innerHTML = '<p style="color: #999;">No hay días marcados este mes</p>';
        return;
    }
    
    daysListEl.innerHTML = currentMonthDays.map(day => {
        const date = new Date(day.date);
        const users = day.users.split(',');
        let userText = '';
        
        if (users.includes('josue') && users.includes('ivonne')) {
            userText = 'Ambos no disponibles';
        } else if (users.includes('josue')) {
            userText = 'Josué no disponible';
        } else {
            userText = 'Ivonne no disponible';
        }
        
        return `
            <div class="day-info">
                <strong>${date.getDate()} de ${monthNames[date.getMonth()]}</strong> - ${userText}
            </div>
        `;
    }).join('');
}

// Inicializar
loadUnavailableDays();