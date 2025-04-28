const firebaseConfig = {
  apiKey: "AIzaSyCXWPjVWQcIuJKsH0b_lPmn4ZatQTaMOP0",
  authDomain: "sphfubot.firebaseapp.com",
  projectId: "sphfubot",
  storageBucket: "sphfubot.firebasestorage.app",
  messagingSenderId: "142367006333",
  appId: "1:142367006333:web:686bc5f6c65e85cbca1b14",
  measurementId: "G-KXRZ2P356L"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

class ScheduleApp {
    constructor() {
        this.subjects = [];
        this.schedule = {};
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.initDragAndDrop();
        this.render();
    }

    async loadData() {
        const [subjectsSnap, scheduleSnap] = await Promise.all([
            db.collection("subjects").get(),
            db.collection("schedule").doc("main").get()
        ]);
        
        this.subjects = subjectsSnap.docs.map(d => d.data().name);
        this.schedule = scheduleSnap.data() || {};
    }

    render() {
        Object.entries(this.schedule).forEach(([day, entries]) => {
            const container = document.querySelector(`[data-day="${day}"] .entries-list`);
            container.innerHTML = entries.map(entry => `
                <div class="schedule-entry">
                    <sl-input type="time" value="${entry.time}"></sl-input>
                    <sl-select value="${entry.subject}">
                        ${this.subjects.map(s => `<sl-option value="${s}">${s}</sl-option>`).join('')}
                    </sl-select>
                    <sl-icon-button name="trash" class="delete-btn"></sl-icon-button>
                </div>
            `).join('');
        });
    }

    initDragAndDrop() {
        document.querySelectorAll('.entries-list').forEach(container => {
            new Sortable(container, {
                animation: 150,
                onEnd: async (evt) => {
                    const day = evt.item.closest('.day-card').dataset.day;
                    const entries = Array.from(evt.from.children).map(item => ({
                        time: item.querySelector('sl-input').value,
                        subject: item.querySelector('sl-select').value
                    }));
                    await db.collection("schedule").doc("main").update({ [day]: entries });
                }
            });
        });
    }

    setupEventListeners() {
        // Добавление предметов
        document.getElementById('add-subject').addEventListener('click', async () => {
            const name = prompt("Название предмета:");
            if (name) {
                await db.collection("subjects").add({ name });
                await this.loadData();
                this.render();
            }
        });

        // Сохранение данных
        document.getElementById('save-all').addEventListener('click', async () => {
            await db.collection("schedule").doc("main").set(this.schedule);
            alert("Все изменения сохранены! 🚀");
        });
    }
}

// Запуск приложения
window.app = new ScheduleApp();
