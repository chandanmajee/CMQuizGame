let correctAnswer;
let score = 0;
let timer;
let timeLeft = 30;
let currentUsername = "";
let highScore = 0;
let difficulty = "easy";
let currentProfilePic = "";

function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";
  if (id === "leaderboard") displayLeaderboard();
}

function saveProfile() {
  const name = document.getElementById("username").value.trim();
  const file = document.getElementById("profilePicInput").files[0];

  if (!name) return alert("Please enter your name");
  currentUsername = name;
  localStorage.setItem("username", name);

  if (file) {
    const reader = new FileReader();
    reader.onload = function () {
      localStorage.setItem("profilePic", reader.result);
      currentProfilePic = reader.result;
      showProfile();
    };
    reader.readAsDataURL(file);
  } else {
    currentProfilePic = localStorage.getItem("profilePic") || "";
    showProfile();
  }
}

function showProfile() {
  const name = localStorage.getItem("username") || "";
  const image = localStorage.getItem("profilePic") || "";
  currentUsername = name;
  currentProfilePic = image;

  let html = `<p><strong>Name:</strong> ${name}</p>`;
  if (image) html += `<img src="${image}" alt="Profile" />`;
  document.getElementById("profilePreview").innerHTML = html;
}

function startGame(levelChoice) {
  if (!currentUsername) {
    alert("Please save your profile first.");
    return;
  }
  difficulty = levelChoice;
  document.getElementById("gameContainer").style.display = "block";
  document.getElementById("levelButtons").style.display = "none";

  const storageKey = `highScore_${difficulty}_${currentUsername}`;
  highScore = parseInt(localStorage.getItem(storageKey) || 0);
  document.getElementById("highScore").innerText = `🏅 High Score: ${highScore}`;

  score = 0;
  generateQuestion();
  clearInterval(timer);
  timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
  timeLeft--;
  document.getElementById("timer").innerText = `Time left: ${timeLeft}s`;
  if (timeLeft === 0) endGame("⏰ Time's up!");
}

function generateQuestion() {
  let a = rand(1, 10), b = rand(1, 10), c = rand(1, 10), d = rand(1, 10);

  if (difficulty === "easy") {
    correctAnswer = a + b;
    questionText = `${a} + ${b}`;
  } else if (difficulty === "medium") {
    correctAnswer = a + b - c;
    questionText = `${a} + ${b} - ${c}`;
  } else if (difficulty === "hard") {
    correctAnswer = a * (b + c) + d;
    questionText = `${a} × (${b} + ${c}) + ${d}`;
  } else {
    if (score < 3) {
      correctAnswer = a + b;
      questionText = `${a} + ${b}`;
    } else if (score < 6) {
      correctAnswer = a + b - c;
      questionText = `${a} + ${b} - ${c}`;
    } else {
      correctAnswer = a * (b + c) + d;
      questionText = `${a} × (${b} + ${c}) + ${d}`;
    }
  }

  document.getElementById("question").innerText = questionText;

  const answers = [correctAnswer];
  while (answers.length < 4) {
    let wrong = correctAnswer + rand(-5, 5);
    if (!answers.includes(wrong)) answers.push(wrong);
  }
  answers.sort(() => Math.random() - 0.5);
  document.querySelectorAll(".options button").forEach((btn, i) => {
    btn.innerText = answers[i];
    btn.disabled = false;
  });

  document.getElementById("status").innerText = "";
  timeLeft = 30;
  document.getElementById("timer").innerText = `Time left: ${timeLeft}s`;
}

function checkAnswer(button) {
  const userAnswer = parseFloat(button.innerText);
  if (userAnswer === correctAnswer) {
    score++;
    document.getElementById("score").innerText = `Score: ${score}`;
    const storageKey = `highScore_${difficulty}_${currentUsername}`;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem(storageKey, highScore);
      document.getElementById("highScore").innerText = `🏅 High Score: ${highScore}`;
    }
    document.getElementById("status").innerText = "✅ Correct!";
    setTimeout(() => {
      document.getElementById("status").innerText = "";
      generateQuestion();
    }, 1000);
  } else {
    clearInterval(timer);
    saveToLeaderboard();
    document.getElementById("status").innerHTML = `
      ❌ Wrong Answer!<br/>
      <button onclick='startGame(difficulty)'>🔁 Restart</button>
      <button onclick='document.getElementById("gameContainer").style.display = "none";document.getElementById("levelButtons").style.display = "block";'>⬅️ Back</button>
    `;
  }
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function saveToLeaderboard() {
  const key = `leaderboard_${difficulty}`;
  const leaderboard = JSON.parse(localStorage.getItem(key) || "[]");
  const existing = leaderboard.find(e => e.name === currentUsername);

  if (!existing || existing.score < score) {
    const filtered = leaderboard.filter(e => e.name !== currentUsername);
    filtered.push({ name: currentUsername, score, pic: currentProfilePic });
    filtered.sort((a, b) => b.score - a.score);
    localStorage.setItem(key, JSON.stringify(filtered.slice(0, 10)));
  }
}

function displayLeaderboard() {
  const types = ["easy", "medium", "hard", "mixed"];
  const names = { easy: "Easy", medium: "Medium", hard: "Hard", mixed: "Easy To Hard" };
  let html = "";

  types.forEach(type => {
    const leaderboard = JSON.parse(localStorage.getItem(`leaderboard_${type}`) || "[]");
    html += `<h3 onclick='toggleBoard("${type}")' style='cursor:pointer'>📊 ${names[type]} - Click to see Leaderboard</h3>`;
    html += `<div id='${type}_board' style='display:none;margin-bottom:15px'>`;

    const topThree = leaderboard.slice(0, 3);
    const others = leaderboard.slice(3);

    html += `<div style="display: flex; justify-content: center; gap: 20px;">
      <div>🥈 ${renderPlayer(topThree[1])}</div>
      <div>🥇 ${renderPlayer(topThree[0])}</div>
      <div>🥉 ${renderPlayer(topThree[2])}</div>
    </div>`;

    if (others.length > 0) {
      html += `<ol style="margin-top:10px">`;
      others.forEach((e, i) => {
        html += `<li>Rank ${i + 4}: ${renderPlayer(e)}</li>`;
      });
      html += `</ol>`;
    }

    html += `</div>`;
  });

  document.getElementById("leaderboardDisplay").innerHTML = html;
}

function toggleBoard(type) {
  const div = document.getElementById(`${type}_board`);
  div.style.display = div.style.display === "none" ? "block" : "none";
}

function renderPlayer(player) {
  if (!player) return "-";
  const img = player.pic ? `<img src='${player.pic}' width='30' style='vertical-align:middle;border-radius:50%'/>` : "";
  return `${img} ${player.name} (${player.score})`;
}

window.onload = () => {
  showProfile();
  showSection("profile");
};
