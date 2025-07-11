let correctAnswer; let score = 0; let timer; let timeLeft = 30; let currentUsername = ""; let highScore = 0; let difficulty = "easy"; let currentProfilePic = "";

// Firebase Setup const firebaseConfig = { apiKey: "AIzaSyC1hnm2Gy2HUe_sTIE_ZMi-dS576iExDNA", authDomain: "cmquizgame.firebaseapp.com", databaseURL: "https://cmquizgame-default-rtdb.asia-southeast1.firebasedatabase.app", projectId: "cmquizgame", storageBucket: "cmquizgame.firebasestorage.app", messagingSenderId: "886559064118", appId: "1:886559064118:web:4678963166f3a21275d897", measurementId: "G-LXKKBDBQ3J" };

firebase.initializeApp(firebaseConfig); const database = firebase.database();

function showSection(id) { document.querySelectorAll(".section").forEach(sec => sec.style.display = "none"); document.getElementById(id).style.display = "block"; if (id === "leaderboard") displayLeaderboard(); }

function saveProfile() { const name = document.getElementById("username").value.trim(); const file = document.getElementById("profilePicInput").files[0];

if (!name) return alert("Please enter your name"); currentUsername = name; localStorage.setItem("username", name);

if (file) { const reader = new FileReader(); reader.onload = function () { localStorage.setItem("profilePic", reader.result); currentProfilePic = reader.result; showProfile(); }; reader.readAsDataURL(file); } else { currentProfilePic = localStorage.getItem("profilePic") || ""; showProfile(); } }

function showProfile() { const name = localStorage.getItem("username") || ""; const image = localStorage.getItem("profilePic") || ""; currentUsername = name; currentProfilePic = image;

let html = <p><strong>Name:</strong> ${name}</p>; if (image) html += <img src="${image}" alt="Profile" />; document.getElementById("profilePreview").innerHTML = html; }

function startGame(levelChoice) { if (!currentUsername) { alert("Please save your profile first."); return; } difficulty = levelChoice; document.getElementById("gameContainer").style.display = "block"; document.getElementById("levelButtons").style.display = "none";

score = 0; document.getElementById("score").innerText = Score: ${score}; document.getElementById("highScore").innerText = 🏅 High Score: -;

generateQuestion(); clearInterval(timer); timer = setInterval(updateTimer, 1000); }

function updateTimer() { timeLeft--; document.getElementById("timer").innerText = Time left: ${timeLeft}s; if (timeLeft === 0) endGame("⏰ Time's up!"); }

function generateQuestion() { let a = rand(1, 10), b = rand(1, 10), c = rand(1, 10), d = rand(1, 10); let questionText;

if (difficulty === "easy") { correctAnswer = a + b; questionText = ${a} + ${b}; } else if (difficulty === "medium") { correctAnswer = a + b - c; questionText = ${a} + ${b} - ${c}; } else if (difficulty === "hard") { correctAnswer = a * (b + c) + d; questionText = ${a} × (${b} + ${c}) + ${d}; } else { if (score < 3) { correctAnswer = a + b; questionText = ${a} + ${b}; } else if (score < 6) { correctAnswer = a + b - c; questionText = ${a} + ${b} - ${c}; } else { correctAnswer = a * (b + c) + d; questionText = ${a} × (${b} + ${c}) + ${d}; } }

document.getElementById("question").innerText = questionText;

const answers = [correctAnswer]; while (answers.length < 4) { let wrong = correctAnswer + rand(-5, 5); if (!answers.includes(wrong)) answers.push(wrong); } answers.sort(() => Math.random() - 0.5); document.querySelectorAll(".options button").forEach((btn, i) => { btn.innerText = answers[i]; btn.disabled = false; });

document.getElementById("status").innerText = ""; timeLeft = 30; document.getElementById("timer").innerText = Time left: ${timeLeft}s; }

function checkAnswer(button) { const userAnswer = parseFloat(button.innerText); if (userAnswer === correctAnswer) { score++; document.getElementById("score").innerText = Score: ${score}; document.getElementById("status").innerText = "✅ Correct!"; setTimeout(() => { document.getElementById("status").innerText = ""; generateQuestion(); }, 1000); } else { clearInterval(timer); saveToLeaderboard(); document.getElementById("status").innerHTML = ❌ Wrong Answer!<br/> <button onclick='startGame(difficulty)'>🔁 Restart</button> <button onclick='document.getElementById("gameContainer").style.display = "none";document.getElementById("levelButtons").style.display = "block";'>⬅️ Back</button>; } }

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function saveToLeaderboard() { if (!currentUsername) return; const ref = database.ref(leaderboard/${difficulty}/${currentUsername}); ref.once("value", snapshot => { const existing = snapshot.val(); if (!existing || existing.score < score) { ref.set({ name: currentUsername, score, pic: currentProfilePic }); } }); }

function displayLeaderboard() { const types = ["easy", "medium", "hard", "mixed"]; const names = { easy: "Easy", medium: "Medium", hard: "Hard", mixed: "Easy To Hard" }; let html = "";

types.forEach(type => { html += <h3 onclick='toggleBoard("${type}")' style='cursor:pointer'>📊 ${names[type]} - Click to see Leaderboard</h3>; html += <div id='${type}_board' style='display:none;margin-bottom:15px'>Loading...</div>;

const boardRef = database.ref(`leaderboard/${type}`);
boardRef.once("value", snapshot => {
  const data = snapshot.val();
  if (!data) return;

  const players = Object.values(data).sort((a, b) => b.score - a.score);
  let boardHtml = "";

  const topThree = players.slice(0, 3);
  const others = players.slice(3);

  boardHtml += `<div style="display: flex; justify-content: center; gap: 20px;">`;
  boardHtml += `<div>🥈 ${renderPlayer(topThree[1])}</div>`;
  boardHtml += `<div>🥇 ${renderPlayer(topThree[0])}</div>`;
  boardHtml += `<div>🥉 ${renderPlayer(topThree[2])}</div>`;
  boardHtml += `</div>`;

  if (others.length > 0) {
    boardHtml += `<ol style="margin-top:10px">`;
    others.forEach((e, i) => {
      boardHtml += `<li>Rank ${i + 4}: ${renderPlayer(e)}</li>`;
    });
    boardHtml += `</ol>`;
  }

  document.getElementById(`${type}_board`).innerHTML = boardHtml;
});

});

document.getElementById("leaderboardDisplay").innerHTML = html; }

function toggleBoard(type) { const div = document.getElementById(${type}_board); div.style.display = div.style.display === "none" ? "block" : "none"; }

function renderPlayer(player) { if (!player) return "-"; const img = player.pic ? <img src='${player.pic}' width='30' style='vertical-align:middle;border-radius:50%'/> : ""; return ${img} ${player.name} (${player.score}); }

window.onload = () => { showProfile(); showSection("profile"); };

                        
