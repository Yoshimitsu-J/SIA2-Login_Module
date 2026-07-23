const SESSION_START = Date.now();
const AUTO_LOGOUT_SECONDS = 30;
let idleSeconds = AUTO_LOGOUT_SECONDS;
let sessionInterval = null;
let idleInterval = null;

function formatTime(totalSeconds) {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function updateDateTime() {
  const now = new Date();
  const formatted = now.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const currentDateTime = document.getElementById('current-datetime');
  if (currentDateTime) currentDateTime.textContent = formatted;
}

function updateSessionTimer() {
  const elapsedSeconds = Math.floor((Date.now() - SESSION_START) / 1000);
  const sessionTimer = document.getElementById('session-timer');
  if (sessionTimer) sessionTimer.textContent = formatTime(elapsedSeconds);
}

function updateIdleTimer() {
  const idleTimer = document.getElementById('idle-timer');
  if (idleTimer) idleTimer.textContent = String(idleSeconds).padStart(2, '0');

  if (idleSeconds <= 0) {
    clearIntervals();
    if (location.pathname.endsWith('dashboard.html')) {
      window.location.href = 'index.html';
    } else {
      window.location.reload();
    }
  }
}

function resetIdleTimer() {
  idleSeconds = AUTO_LOGOUT_SECONDS;
  updateIdleTimer();
}

function clearIntervals() {
  if (sessionInterval) window.clearInterval(sessionInterval);
  if (idleInterval) window.clearInterval(idleInterval);
  sessionInterval = null;
  idleInterval = null;
}

function startTimers() {
  updateDateTime();
  updateSessionTimer();
  updateIdleTimer();

  sessionInterval = window.setInterval(updateSessionTimer, 1000);
  idleInterval = window.setInterval(() => {
    idleSeconds -= 1;
    updateIdleTimer();
  }, 1000);
}

function initDashboardDebugBar() {
  startTimers();

  ['click', 'touchstart', 'keydown', 'mousemove'].forEach((eventName) => {
    window.addEventListener(eventName, resetIdleTimer, { passive: true });
  });
}

document.addEventListener('DOMContentLoaded', initDashboardDebugBar);
