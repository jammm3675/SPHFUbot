/**************************************************
         ЗАМЕНИТЕ ЭТИ ДАННЫЕ НА СВОИ!
**************************************************/
const firebaseConfig = {
  apiKey: "AIzaSyCXWPjVWQcIuJKsH0b_lPmn4ZatQTaMOP0",
  authDomain: "sphfubot.firebaseapp.com",
  projectId: "sphfubot",
  storageBucket: "sphfubot.firebasestorage.app",
  messagingSenderId: "142367006333",
  appId: "1:142367006333:web:1cb81a93e09f9754ca1b14",
  measurementId: "G-HM5NZ6LJTR"
};
/**************************************************/

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Функционал приложения
document.addEventListener('DOMContentLoaded', () => {
    // Загрузка данных
    loadSubjects();
    loadSchedule();

    // Обработчики событий
    document.getElementById('add-subject').addEventListener('click', addSubject);
    document.querySelectorAll('.add-time').forEach(btn => {
        btn.addEventListener('click', function() {
            addTimeSlot(this.closest('.day').dataset.day);
        });
    });

    // Переключение этажей
    document.querySelectorAll('[data-floor]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('map').src = `maps/floor${btn.dataset.floor}.png`;
        });
    });
});

async function loadSubjects() {
    const snapshot = await db.collection("subjects").get();
    window.subjects = snapshot.docs.map(d => d.data().name);
}

async function loadSchedule() {
    const doc = await db.collection("schedule").doc("main").get();
    window.schedule = doc.data() || {};
    renderSchedule();
}

function renderSchedule() {
    Object.entries(window.schedule).forEach(([day, entries]) => {
        const container = document.querySelector(`[data-day="${day}"] .entries`);
        container.innerHTML = '';
        
        entries.forEach(entry => {
            const div = document.createElement('div');
            div.className = 'time-row';
            div.innerHTML = `
                <sl-input type="time" value="${entry.time}"></sl-input>
                <sl-select placeholder="Предмет">
                    ${window.subjects.map(s => `<sl-option value="${s}">${s}</sl-option>`).join('')}
                </sl-select>
                <sl-icon-button name="trash" class="delete-btn"></sl-icon-button>
            `;
            container.appendChild(div);
        });
    });
}

async function addSubject() {
    const name = prompt("Введите название предмета:");
    if (name) {
        await db.collection("subjects").add({ name });
        loadSubjects();
    }
}

async function addTimeSlot(day) {
    const newEntry = { time: "09:00", subject: "" };
    await db.collection("schedule").doc("main").update({
        [day]: firebase.firestore.FieldValue.arrayUnion(newEntry)
    });
    loadSchedule();
}
