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
const calendar = document.getElementById('calendar');
const currentMonthEl = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const userBtns = document.querySelectorAll('.user-btn');
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

userBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        userBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentUser = btn.dataset.user;
    });
});

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