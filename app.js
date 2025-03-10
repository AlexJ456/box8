let animationId;
let startTime;
let timeLimit;
const phases = ['Inhale', 'Hold', 'Exhale', 'Wait'];
const phaseDuration = 4000; // 4 seconds per phase
const cycleDuration = phaseDuration * 4; // 16 seconds per cycle

function startExercise(minutes) {
    timeLimit = minutes * 60; // Convert to seconds
    beginExercise();
}

function startCustomExercise() {
    const customTime = document.getElementById('custom-time').value;
    timeLimit = customTime ? parseInt(customTime) * 60 : null; // Optional limit
    beginExercise();
}

function beginExercise() {
    document.getElementById('controls').style.display = 'none';
    document.getElementById('stop').style.display = 'block';
    startTime = performance.now();
    animate(startTime);
    updateTimer();
}

function stopExercise() {
    cancelAnimationFrame(animationId);
    clearInterval(timerInterval);
    resetUI();
}

function resetUI() {
    document.getElementById('controls').style.display = 'block';
    document.getElementById('stop').style.display = 'none';
    document.getElementById('phase').textContent = 'Inhale';
    document.getElementById('timer').textContent = '00:00';
    document.getElementById('circle').style.left = '0px';
    document.getElementById('circle').style.top = '180px';
}

function animate(time) {
    const elapsed = time - startTime;
    const cycleTime = elapsed % cycleDuration;
    const phaseIndex = Math.floor(cycleTime / phaseDuration) % 4;
    document.getElementById('phase').textContent = phases[phaseIndex];

    let left, top;
    if (cycleTime < phaseDuration) { // Inhale: bottom left to top left
        const progress = cycleTime / phaseDuration;
        left = 0;
        top = 180 - (180 * progress);
    } else if (cycleTime < 2 * phaseDuration) { // Hold: top left to top right
        const progress = (cycleTime - phaseDuration) / phaseDuration;
        left = 180 * progress;
        top = 0;
    } else if (cycleTime < 3 * phaseDuration) { // Exhale: top right to bottom right
        const progress = (cycleTime - 2 * phaseDuration) / phaseDuration;
        left = 180;
        top = 180 * progress;
    } else { // Wait: bottom right to bottom left
        const progress = (cycleTime - 3 * phaseDuration) / phaseDuration;
        left = 180 - (180 * progress);
        top = 180;
    }
    document.getElementById('circle').style.left = `${left}px`;
    document.getElementById('circle').style.top = `${top}px`;

    if (timeLimit && elapsed / 1000 >= timeLimit) {
        if (phaseIndex === 2 && cycleTime >= 3 * phaseDuration - 100) { // End of exhale
            stopExercise();
            return;
        }
    }
    animationId = requestAnimationFrame(animate);
}

let timerInterval;
function updateTimer() {
    timerInterval = setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000;
        const minutes = Math.floor(elapsed / 60);
        const seconds = Math.floor(elapsed % 60);
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').then(() => {
        console.log('Service Worker registered');
    }).catch(error => {
        console.log('Service Worker registration failed:', error);
    });
}