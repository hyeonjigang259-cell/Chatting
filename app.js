import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

let currentRoom = "general";
let user = null;

window.login = async function () {
  await signInWithPopup(auth, provider);
};

onAuthStateChanged(auth, (u) => {
  user = u;
  if (u) document.getElementById("userInfo").innerText = u.displayName;
});

window.switchRoom = function (room) {
  currentRoom = room;
  document.getElementById("roomTitle").innerText = "#" + room;
  listenMessages();
};

window.sendMessage = async function () {
  const text = document.getElementById("message").value;
  if (!text || !user) return;

  await addDoc(collection(db, "rooms", currentRoom, "messages"), {
    name: user.displayName,
    text,
    time: serverTimestamp()
  });

  document.getElementById("message").value = "";
};

function listenMessages() {
  const q = query(collection(db, "rooms", currentRoom, "messages"), orderBy("time"));

  onSnapshot(q, (snap) => {
    const box = document.getElementById("chatBox");
    box.innerHTML = "";

    snap.forEach(d => {
      const m = d.data();
      const div = document.createElement("div");
      div.className = "msg";
      div.innerHTML = `<span class="name">${m.name}</span>: ${m.text}`;
      box.appendChild(div);
    });

    box.scrollTop = box.scrollHeight;
  });
}

window.setNotice = async function () {
  const text = document.getElementById("noticeInput").value;

  await setDoc(doc(db, "system", "notice"), { text });
};

onSnapshot(doc(db, "system", "notice"), (d) => {
  if (d.exists()) {
    document.getElementById("noticeText").innerText = d.data().text;
  }
});

listenMessages();
