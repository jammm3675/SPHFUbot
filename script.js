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

// Загрузка расписания
function loadSchedule() {
    db.collection("schedule").doc("main").get().then((doc) => {
        if (doc.exists) {
            document.getElementById('schedule').innerHTML = doc.data().content;
        }
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