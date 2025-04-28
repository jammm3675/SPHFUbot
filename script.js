// Firebase config (замените на свои данные)
const firebaseConfig = {
    apiKey: "ВАШ_API_KEY",
    authDomain: "ВАШ_PROJECT.firebaseapp.com",
    projectId: "ВАШ_PROJECT"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Загрузка данных
let subjects = [];
let timeSlots = [];

// Реальная синхронизация
db.collection("subjects").onSnapshot(snap => {
    subjects = snap.docs.map(d => d.data().name);
    renderTable();
});

db.collection("timeSlots").onSnapshot(snap => {
    timeSlots = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderTable();
});

// Рендер таблицы
function renderTable() {
    const tbody = document.getElementById('scheduleBody');
    tbody.innerHTML = '';

    timeSlots.sort((a,b) => a.order - b.order).forEach((slot, index) => {
        const row = document.createElement('tr');
        
        // Время
        row.innerHTML = `
            <td>
                <sl-input value="${slot.time}" 
                    @sl-change="${e => updateTime(slot.id, e.target.value)}">
                </sl-input>
            </td>
        `;

        // Дни недели
        ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].forEach(day => {
            const cell = document.createElement('td');
            const select = document.createElement('sl-select');
            
            // Предметы
            subjects.forEach(subj => {
                const option = document.createElement('sl-option');
                option.value = subj;
                option.textContent = subj;
                select.appendChild(option);
            });

            // Текущее значение
            select.value = slot[day] || '';
            select.addEventListener('sl-change', e => {
                db.collection("timeSlots").doc(slot.id).update({
                    [day]: e.target.value
                });
            });

            cell.appendChild(select);
            row.appendChild(cell);
        });

        // Удаление
        const delCell = document.createElement('td');
        delCell.innerHTML = `
            <sl-button variant="danger" 
                @click="${() => deleteTimeSlot(slot.id)}">
                <sl-icon name="trash"></sl-icon>
            </sl-button>
        `;
        row.appendChild(delCell);

        tbody.appendChild(row);
    });
}

// Редакторы
function openTimeEditor() {
    const newTime = prompt("Новое время (например: 09:30):");
    if (newTime) {
        db.collection("timeSlots").add({
            time: newTime,
            order: timeSlots.length,
            mon: '', tue: '', wed: '', thu: '', fri: '', sat: ''
        });
    }
}

function openSubjectEditor() {
    const newSubject = prompt("Новый предмет:");
    if (newSubject) {
        db.collection("subjects").add({ name: newSubject });
    }
}

// Вспомогательные функции
function updateTime(id, newTime) {
    db.collection("timeSlots").doc(id).update({ time: newTime });
}

function deleteTimeSlot(id) {
    if (confirm("Удалить эту строку?")) {
        db.collection("timeSlots").doc(id).delete();
    }
}

// Карта
function changeFloor(floor) {
    document.getElementById('map').src = `maps/floor${floor}.png`;
}
