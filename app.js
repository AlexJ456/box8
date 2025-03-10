const T = 4; // Seconds per phase
let startTime;
let isRunning = false;
let stopAfterNextExhale = false;
let timeLimit = null;
let lastCycleTime = 0;
let animationFrameId;

const squareSize = 200; // Square size in pixels
const phaseNames = ['Inhale', 'Hold', 'Exhale', 'Wait'];

// Set initial marker position to bottom-left
document.getElementById('marker').style.left = '0px';
document.getElementById('marker').style.top = squareSize + 'px';

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function startExercise() {
  const timeLimitMin = parseFloat(document.getElementById('time-limit').value);
  if (!isNaN(timeLimitMin) && timeLimitMin > 0) {
    timeLimit = timeLimitMin * 60; // Convert to seconds
  } else {
    timeLimit = null; // No time limit
  }
  startTime = performance.now();
  isRunning = true;
  stopAfterNextExhale = false;
  lastCycleTime = 0;
  document.getElementById('controls').style.display = 'none';
  document.getElementById('stop').style.display = 'inline';
  animationFrameId = requestAnimationFrame(animationLoop);
}

function stopExercise() {
  isRunning = false;
  cancelAnimationFrame(animationFrameId);
  document.getElementById('controls').style.display = 'flex';
  document.getElementById('stop').style.display = 'none';
  document.getElementById('phase').textContent = 'Press Start to begin';
  document.getElementById('total-time').textContent = '00:00';
  document.getElementById('marker').style.left = '0px';
  document.getElementById('marker').style.top = squareSize + 'px';
}

function animationLoop() {
  if (!isRunning) return;
  const currentTime = performance.now();
  const elapsed = (currentTime - startTime) / 1000; // Seconds
  const cycleTime = elapsed % (4 * T);
  const phaseIndex = Math.floor(cycleTime / T);
  const currentPhase = phaseNames[phaseIndex];
  const timeIntoPhase = cycleTime % T;
  const timeRemaining = T - timeIntoPhase;

  // Update phase text
  document.getElementById('phase').textContent = `${currentPhase}: ${Math.ceil(timeRemaining)}`;

  // Update total time
  document.getElementById('total-time').textContent = formatTime(elapsed);

  // Update marker position
  let x, y;
  if (currentPhase === 'Inhale') {
    x = 0;
    y = squareSize - (timeIntoPhase / T) * squareSize;
  } else if (currentPhase === 'Hold') {
    x = (timeIntoPhase / T) * squareSize;
    y = 0;
  } else if (currentPhase === 'Exhale') {
    x = squareSize;
    y = (timeIntoPhase / T) * squareSize;
  } else { // Wait
    x = squareSize - (timeIntoPhase / T) * squareSize;
    y = squareSize;
  }
  document.getElementById('marker').style.left = `${x}px`;
  document.getElementById('marker').style.top = `${y}px`;

  // Check if time limit is reached
  if (timeLimit !== null && elapsed >= timeLimit && !stopAfterNextExhale) {
    stopAfterNextExhale = true;
  }
  // Stop after exhale completes
  if (stopAfterNextExhale && lastCycleTime < 3 * T && cycleTime >= 3 * T) {
    stopExercise();
  } else {
    lastCycleTime = cycleTime;
    animationFrameId = requestAnimationFrame(animationLoop);
  }
}

// Event listeners for buttons
document.getElementById('set-2min').addEventListener('click', () => {
  document.getElementById('time-limit').value = 2;
});
document.getElementById('set-5min').addEventListener('click', () => {
  document.getElementById('time-limit').value = 5;
});
document.getElementById('set-10min').addEventListener('click', () => {
  document.getElementById('time-limit').value = 10;
});
document.getElementById('start').addEventListener('click', startExercise);
document.getElementById('stop').addEventListener('click', stopExercise);

// Register service worker for offline use
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(() => console.log('Service Worker registered'))
    .catch(err => console.log('Service Worker error:', err));
}