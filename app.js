import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { 
    getFirestore,
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCXWPjVWQcIuJKsH0b_lPmn4ZatQTaMOP0",
    authDomain: "sphfubot.firebaseapp.com",
    projectId: "sphfubot",
    storageBucket: "sphfubot.firebasestorage.app",
    messagingSenderId: "142367006333",
    appId: "1:142367006333:web:686bc5f6c65e85cbca1b14",
    measurementId: "G-KXRZ2P356L"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class ScheduleApp {
    constructor() {
        this.subjects = [];
        this.schedule = {};
        this.init();
    }

    async init() {
        await this.loadSubjects();
        await this.loadSchedule();
        this.setupEventListeners();
        this.render();
    }

    async loadSubjects() {
        const snapshot = await getDocs(collection(db, "subjects"));
        this.subjects = snapshot.docs.map(d => d.data().name);
    }

    async loadSchedule() {
        const snapshot = await getDocs(collection(db, "schedule"));
        this.schedule = {};
        snapshot.forEach(doc => {
            this.schedule[doc.id] = doc.data();
        });
    }

    render() {
        const grid = document.getElementById('scheduleGrid');
        grid.innerHTML = '';
        
        Object.entries(this.schedule).forEach(([day, data]) => {
            const dayCard = document.createElement('div');
            dayCard.className = 'day-card';
            dayCard.innerHTML = `
                <h3>${this.getDayName(day)}</h3>
                <div class="entries" data-day="${day}"></div>
                <sl-button class="add-entry" data-day="${day}">
                    + Добавить пару
                </sl-button>
            `;
            grid.appendChild(dayCard);
        });
    }

    getDayName(dayKey) {
        const days = {
            monday: 'Понедельник',
            tuesday: 'Вторник',
            wednesday: 'Среда',
            thursday: 'Четверг',
            friday: 'Пятница',
            saturday: 'Суббота'
        };
        return days[dayKey] || dayKey;
    }

    setupEventListeners() {
        // Добавление предметов
        document.getElementById('addSubjectBtn').addEventListener('click', () => {
            const dialog = document.getElementById('subjectDialog');
            dialog.show();
        });

        // Сохранение предмета
        document.getElementById('saveSubjectBtn').addEventListener('click', async () => {
            const name = document.getElementById('subjectName').value;
            if (name) {
                await addDoc(collection(db, "subjects"), { name });
                await this.loadSubjects();
                this.render();
            }
        });
    }
}

// Инициализация приложения
window.addEventListener('DOMContentLoaded', () => {
    new ScheduleApp();
});
