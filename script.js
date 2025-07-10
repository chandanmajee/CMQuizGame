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

  let html = <p><strong>Name:</strong> ${name}</p>;
  if (image) html += <img src="${image}" alt="Profile" />;
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

  const storageKey = highScore_${difficulty}_${currentUsername};
  highScore = parseInt(localStorage.getItem(storageKey) || 0);
  document.getElementById("highScore").innerText = 🏅 High Score: ${highScore};

  score = 0;
  generateQuestion();
  clearInterval(timer);
  timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
  timeLeft--;
  document.getElementById("timer").innerText = Time left: ${timeLeft}s;
  if (timeLeft === 0) endGame("⏰ Time's up!");
}

function generateQuestion() {
  let a = rand(1, 10), b = rand(1, 10), c = rand(1, 10), d = rand(1, 10);

  if (difficulty === "easy") {
    correctAnswer = a + b;
    questionText = ${a} + ${b};
  } else if (difficulty === "medium") {
    correctAnswer = a + b - c;
    questionText = ${a} + ${b} - ${c};
  } else if (difficulty === "hard") {
    correctAnswer = a * (b + c) + d;
    questionText = ${a} × (${b} + ${c}) + ${d};
  } else {
    if (score < 3) {
      correctAnswer = a + b;
      questionText = ${a} + ${b};
    } else if (score < 6) {
      correctAnswer = a + b - c;
      questionText = ${a} + ${b} - ${c};
    } else {
      correctAnswer = a * (b + c) + d;
      questionText = ${a} × (${b} + ${c}) + ${d};
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
  document.getElementById("timer").innerText = Time left: ${timeLeft}s;
}

function checkAnswer(button) {
  const userAnswer = parseFloat(button.innerText);
  if (userAnswer === correctAnswer) {
    score++;
    document.getElementById("score").innerText = Score: ${score};
    const storageKey = highScore_${difficulty}_${currentUsername};
    if (score > highScore) {
      highScore = score;
      localStorage.setItem(storageKey, highScore);
