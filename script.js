
let map, marker, score = 0, round = 1, maxRounds = 5;
let answerLatLng;

const generateRandomCoords = () => {
  const lat = Math.random() * (49 - 25) + 25;
  const lng = Math.random() * (-66 - -124) + -124;
  return [lat, lng];
};

const setupNewRound = () => {
  answerLatLng = generateRandomCoords();
  const [lat, lng] = answerLatLng;
  document.getElementById("street-view").src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.001},${lat-0.001},${lng+0.001},${lat+0.001}&layer=mapnik&marker=${lat},${lng}`;
  if (marker) map.removeLayer(marker);
};

const updateScore = (distance) => {
  const points = Math.max(1, Math.round(5000 - (distance / 2000) * 4999));
  score += points;
  document.getElementById("score").textContent = score;
};

document.getElementById("playBtn").addEventListener("click", () => {
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-ui").style.display = "block";

  map = L.map('mini-map').setView([39, -98], 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OSM contributors'
  }).addTo(map);

  map.on("click", function (e) {
    if (marker) map.removeLayer(marker);
    marker = L.marker(e.latlng).addTo(map);
    marker.guessLatLng = e.latlng;
  });

  setupNewRound();
});

document.getElementById("guessBtn").addEventListener("click", () => {
  if (!marker) return alert("Place a guess first!");
  const guessed = marker.guessLatLng;
  const R = 6371e3;
  const φ1 = guessed.lat * Math.PI / 180;
  const φ2 = answerLatLng[0] * Math.PI / 180;
  const Δφ = (answerLatLng[0] - guessed.lat) * Math.PI / 180;
  const Δλ = (answerLatLng[1] - guessed.lng) * Math.PI / 180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  updateScore(distance);

  if (round >= maxRounds) {
    document.getElementById("game-ui").style.display = "none";
    document.getElementById("end-screen").style.display = "block";
    document.getElementById("finalScore").textContent = score;
  } else {
    round++;
    document.getElementById("round").textContent = round;
    setupNewRound();
  }
});

document.getElementById("fullscreenBtn").addEventListener("click", () => {
  document.getElementById("mini-map-container").requestFullscreen();
});
