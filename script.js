
let map, marker, panorama, answerLatLng;
let score = 0;
let round = 1;
const maxRounds = 5;

const generateRandomCoords = () => {
  const lat = Math.random() * (49 - 25) + 25;
  const lng = Math.random() * (-66 - -124) + -124;
  return { lat, lng };
};

const initStreetView = (coords) => {
  const sv = new google.maps.StreetViewService();
  sv.getPanorama({ location: coords, radius: 500 }, (data, status) => {
    if (status === "OK") {
      panorama.setPano(data.location.pano);
      panorama.setPov({ heading: 165, pitch: 0 });
      panorama.setVisible(true);
    } else {
      setupNewRound(); // Retry new location if no street view
    }
  });
};

const updateScore = (distance) => {
  const points = Math.max(1, Math.round(5000 - (distance / 2000) * 4999));
  score += points;
  document.getElementById("score").textContent = score;
};

const setupNewRound = () => {
  answerLatLng = generateRandomCoords();
  initStreetView(answerLatLng);
  if (marker) marker.setMap(null);
};

document.getElementById("playBtn").addEventListener("click", () => {
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-ui").style.display = "block";

  panorama = new google.maps.StreetViewPanorama(document.getElementById("street-view"), {
    visible: false,
    addressControl: false,
    showRoadLabels: false,
    disableDefaultUI: true
  });

  map = new google.maps.Map(document.getElementById("mini-map"), {
    center: { lat: 39, lng: -98 },
    zoom: 4,
    disableDefaultUI: true
  });

  map.addListener("click", function (e) {
    if (marker) marker.setMap(null);
    marker = new google.maps.Marker({
      position: e.latLng,
      map: map,
      title: "Your Guess"
    });
    marker.guessLatLng = e.latLng;
  });

  setupNewRound();
});

document.getElementById("guessBtn").addEventListener("click", () => {
  if (!marker) return alert("Place a guess first!");
  const guessed = marker.guessLatLng;
  const guessedLatLng = new google.maps.LatLng(guessed.lat(), guessed.lng());
  const correctLatLng = new google.maps.LatLng(answerLatLng.lat, answerLatLng.lng);
  const distance = google.maps.geometry.spherical.computeDistanceBetween(guessedLatLng, correctLatLng);
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
