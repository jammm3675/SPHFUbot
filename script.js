// Настройка Firebase
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

let subjects = []; // Здесь будут храниться предметы
let schedule = {}; // Структура: { "time": "09:00", "days": { "monday": "Математика", ... } }

// Загрузка предметов из Firebase
function loadSubjects() {
    db.collection("subjects").onSnapshot((snapshot) => {
        subjects = snapshot.docs.map(doc => doc.data().name);
        renderScheduleTable();
    });
}

// Загрузка расписания
function loadSchedule() {
    db.collection("schedule").onSnapshot((snapshot) => {
        schedule = {};
        snapshot.docs.forEach(doc => schedule[doc.id] = doc.data());
        renderScheduleTable();
    });
}

// Редактирование
function openEdit() {
    const editor = document.createElement('sl-dialog');
    editor.label = "Редактирование расписания";
    editor.innerHTML = `
        <sl-textarea id="editArea" style="width:100%; height:300px"></sl-textarea>
        <sl-button slot="footer" type="primary" onclick="saveSchedule()">Сохранить</sl-button>
    `;
    document.body.appendChild(editor);
    editor.show();
}

function saveSchedule() {
    const content = document.getElementById('editArea').value;
    db.collection("schedule").doc("main").set({ content: content });
    loadSchedule();
}

// Переключение этажей
function changeFloor(floor) {
    document.getElementById('map').src = `map_floor${floor}.png`;
}

// Запуск при загрузке
window.onload = loadSchedule;

function renderScheduleTable() {
    const tbody = document.getElementById('scheduleBody');
    tbody.innerHTML = '';

    // Для каждого временного слота
    Object.keys(schedule).forEach(time => {
        const row = document.createElement('tr');
        
        // Ячейка времени
        const timeCell = document.createElement('td');
        const timeInput = document.createElement('sl-input');
        timeInput.value = time;
        timeInput.addEventListener('sl-change', (e) => updateTime(time, e.target.value));
        timeCell.appendChild(timeInput);
        row.appendChild(timeCell);

        // Ячейки для дней недели
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].forEach(day => {
            const cell = document.createElement('td');
            const select = document.createElement('sl-select');
            
            // Пункты выбора
            subjects.forEach(subject => {
                const option = document.createElement('sl-option');
                option.value = subject;
                option.textContent = subject;
                select.appendChild(option);
            });

            // Текущее значение
            select.value = schedule[time]?.[day] || '';
            select.addEventListener('sl-change', (e) => updateSchedule(time, day, e.target.value));
            
            cell.appendChild(select);
            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });
}

function openSubjectsEditor() {
    const dialog = document.createElement('sl-dialog');
    dialog.label = "Управление предметами";
    
    const content = document.createElement('div');
    content.innerHTML = `
        <sl-input id="newSubject" placeholder="Новый предмет"></sl-input>
        <sl-button @click="${addSubject}">Добавить</sl-button>
        <ul id="subjectsList" style="margin-top:15px;"></ul>
    `;

    // Рендер списка
    const list = content.querySelector('#subjectsList');
    subjects.forEach(subject => {
        const li = document.createElement('li');
        li.textContent = subject;
        li.style.margin = "5px 0";
        list.appendChild(li);
    });

    dialog.appendChild(content);
    document.body.appendChild(dialog);
    dialog.show();
}

function addSubject() {
    const input = document.querySelector('#newSubject');
    if (input.value.trim()) {
        db.collection("subjects").add({ name: input.value.trim() });
        input.value = '';
    }
}
