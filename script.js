// Add Firebase SDK scripts (place this in your HTML <head> or right before closing </body> tag): // <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"></script> // <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"></script>

// Initialize Firebase const firebaseConfig = { apiKey: "AIzaSyC1hnm2Gy2HUe_sTIE_ZMi-dS576iExDNA", authDomain: "cmquizgame.firebaseapp.com", databaseURL: "https://cmquizgame-default-rtdb.asia-southeast1.firebasedatabase.app", projectId: "cmquizgame", storageBucket: "cmquizgame.appspot.com", messagingSenderId: "886559064118", appId: "1:886559064118:web:4678963166f3a21275d897", measurementId: "G-LXKKBDBQ3J" };

firebase.initializeApp(firebaseConfig); const database = firebase.database();

// Save Score to Firebase function saveToLeaderboard() { const difficultyKey = leaderboard_${difficulty}; const userRef = database.ref(${difficultyKey}/${currentUsername});

userRef.once("value", snapshot => { const data = snapshot.val(); if (!data || score > data.score) { userRef.set({ name: currentUsername, score: score, pic: currentProfilePic || "" }); } }); }

// Display Leaderboard from Firebase function displayLeaderboard() { const types = ["easy", "medium", "hard", "mixed"]; const names = { easy: "Easy", medium: "Medium", hard: "Hard", mixed: "Easy To Hard" }; let html = "";

let pending = types.length;

types.forEach(type => { const typeRef = database.ref(leaderboard_${type});

typeRef.once("value", snapshot => {
  const entries = snapshot.val() || {};
  const leaderboard = Object.values(entries);
  leaderboard.sort((a, b) => b.score - a.score);

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

  pending--;
  if (pending === 0) {
    document.getElementById("leaderboardDisplay").innerHTML = html;
  }
});

}); }

