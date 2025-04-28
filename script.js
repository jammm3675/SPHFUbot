// Инициализация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCXWPjVWQcIuJKsH0b_lPmn4ZatQTaMOP0",
  authDomain: "sphfubot.firebaseapp.com",
  projectId: "sphfubot",
  storageBucket: "sphfubot.firebasestorage.app",
  messagingSenderId: "142367006333",
  appId: "1:142367006333:web:1cb81a93e09f9754ca1b14",
  measurementId: "G-HM5NZ6LJTR"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Состояние приложения
let state = {
    subjects: [],
    schedule: {},
    currentFloor: 1
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initDragAndDrop();
    loadInitialData();
    setupEventListeners();
});

// Загрузка данных
async function loadInitialData() {
    try {
        const [subjectsSnap, scheduleSnap] = await Promise.all([
            db.collection("subjects").get(),
            db.collection("schedule").doc("main").get()
        ]);
        
        state.subjects = subjectsSnap.docs.map(d => d.data().name);
        state.schedule = scheduleSnap.data() || {};
        
        renderSchedule();
    } catch (error) {
        showError("Ошибка загрузки данных");
    }
}

// Рендер расписания
function renderSchedule() {
    Object.entries(state.schedule).forEach(([day, entries]) => {
        const container = document.querySelector(`[data-day="${day}"] .time-slots`);
        container.innerHTML = '';
        
        entries.forEach((entry, index) => {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.draggable = true;
            timeSlot.innerHTML = `
                <sl-input type="time" value="${entry.time}"></sl-input>
                <sl-select placeholder="Предмет">
                    ${state.subjects.map(s => `
                        <sl-option value="${s}">${s}</sl-option>
                    `).join('')}
                </sl-select>
                <sl-icon-button name="trash" class="delete-btn"></sl-icon-button>
            `;
            
            // Обработчики событий
            timeSlot.querySelector('sl-input').addEventListener('change', handleTimeChange);
            timeSlot.querySelector('sl-select').addEventListener('sl-change', handleSubjectChange);
            timeSlot.querySelector('.delete-btn').addEventListener('click', deleteTimeSlot);
            
            container.appendChild(timeSlot);
        });
    });
}

// Drag and Drop
function initDragAndDrop() {
    const containers = document.querySelectorAll('.time-slots');
    
    containers.forEach(container => {
        new Sortable(container, {
            animation: 150,
            ghostClass: 'neuro-ghost',
            onEnd: async (evt) => {
                const day = evt.to.closest('[data-day]').dataset.day;
                const newOrder = Array.from(evt.to.children).map(child => {
                    return {
                        time: child.querySelector('sl-input').value,
                        subject: child.querySelector('sl-select').value
                    };
                });
                
                try {
                    await db.collection("schedule").doc("main").update({
                        [day]: newOrder
                    });
                } catch (error) {
                    showError("Ошибка сохранения порядка");
                }
            }
        });
    });
}

// AI-фича: Авторасписание
function generateSmartSchedule() {
    // Реализация алгоритма AI...
}

// Показать ошибку
function showError(message) {
    const alert = Object.assign(document.createElement('sl-alert'), {
        variant: 'danger',
        closable: true,
        innerHTML: `
            <sl-icon name="exclamation-octagon" slot="icon"></sl-icon>
            ${message}
        `
    });
    
    document.body.appendChild(alert);
    alert.toast();
}

// Сохранение всего
document.getElementById('save-all').addEventListener('click', async () => {
    try {
        await db.collection("schedule").doc("main").set(state.schedule);
        showSuccess("Все изменения сохранены!");
    } catch (error) {
        showError("Ошибка сохранения");
    }
});

// Остальные функции...
