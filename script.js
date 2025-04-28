// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "ВАШ_API_KEY",
    authDomain: "ВАШ_PROJECT.firebaseapp.com",
    projectId: "ВАШ_PROJECT_ID"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Переменные приложения
let subjects = [];
let schedule = {};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initFirebaseListeners();
    setupEventListeners();
});

function initFirebaseListeners() {
    // Загрузка предметов
    db.collection("subjects").onSnapshot(snap => {
        subjects = snap.docs.map(d => d.data().name);
        renderSchedule();
    });

    // Загрузка расписания
    db.collection("schedule").doc("main").onSnapshot(doc => {
        schedule = doc.data() || {};
        renderSchedule();
    });
}

function setupEventListeners() {
    // Управление предметами
    document.getElementById('manageSubjects').addEventListener('click', openSubjectManager);
    
    // Добавление временного слота
    document.getElementById('addTimeSlot').addEventListener('click', addNewTimeSlot);
    
    // Переключение этажей
    document.querySelectorAll('[data-floor]').forEach(btn => {
        btn.addEventListener('click', () => changeFloor(btn.dataset.floor));
    });
}

// Рендер расписания
function renderSchedule() {
    Object.keys(schedule).forEach(day => {
        const container = document.querySelector(`[data-day="${day}"]`);
        container.innerHTML = '';
        
        schedule[day].forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'schedule-item';
            item.innerHTML = `
                <sl-input class="time-input" value="${entry.time}"
                          @sl-change="${e => updateTime(day, index, e.target.value)}">
                </sl-input>
                <sl-select value="${entry.subject}" 
                           @sl-change="${e => updateSubject(day, index, e.target.value)}">
                    ${subjects.map(s => `<sl-option value="${s}">${s}</sl-option>`).join('')}
                </sl-select>
                <sl-button variant="danger" size="small" 
                           @click="${() => removeEntry(day, index)}">
                    <sl-icon name="trash"></sl-icon>
                </sl-button>
            `;
            container.appendChild(item);
        });
    });
}

// Функции управления
function openSubjectManager() {
    const dialog = document.createElement('sl-dialog');
    dialog.label = "Управление предметами";
    dialog.innerHTML = `
        <div class="subject-manager">
            <sl-input id="newSubject" placeholder="Новый предмет"></sl-input>
            <sl-button variant="primary" @click="${addSubject}">Добавить</sl-button>
        </div>
    `;
    document.body.appendChild(dialog);
    dialog.show();
}

function addSubject() {
    const input = document.getElementById('newSubject');
    if (input.value.trim()) {
        db.collection("subjects").add({ name: input.value.trim() });
        input.value = '';
    }
}

function changeFloor(floor) {
    document.getElementById('map').src = `maps/floor${floor}.png`;
}

// Остальные функции (updateTime, removeEntry и т.д.) аналогичны предыдущим примерам

Sortable.create(document.querySelector('.entries-list'), {
    animation: 150,
    onEnd: (evt) => {
        const day = evt.to.closest('[data-day]').dataset.day;
        const entries = [...evt.to.children].map(item => 
            ({ 
                time: item.querySelector('.time-input').value,
                subject: item.querySelector('sl-select').value
            })
        );
        db.collection("days").doc("schedule").update({ [day]: entries });
    }
});
