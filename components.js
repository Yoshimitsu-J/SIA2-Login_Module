// components.js
document.addEventListener("DOMContentLoaded", function () {
  fetch("navbar.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navbar-placeholder").innerHTML = data;
      initNavbarInteraction();
      initLoginModal();
    })
    .catch((error) => console.error("Error loading component:", error));
});

function initNavbarInteraction() {
  const burger = document.querySelector('.grc-navbar-burger');
  const menu = document.querySelector('.grc-navbar-menu');
  const dropdownButtons = document.querySelectorAll('.has-dropdown > .dropdown-toggle');

  if (burger && menu) {
    burger.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', isOpen.toString());
    });
  }

  dropdownButtons.forEach((button) => {
    const toggleDropdown = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const parent = button.closest('.has-dropdown');
      const shouldOpen = !parent.classList.contains('expanded');

      dropdownButtons.forEach((other) => {
        const otherParent = other.closest('.has-dropdown');
        if (otherParent && otherParent !== parent) {
          otherParent.classList.remove('expanded');
          other.setAttribute('aria-expanded', 'false');
        }
      });

      parent.classList.toggle('expanded', shouldOpen);
      button.setAttribute('aria-expanded', shouldOpen.toString());
    };

    button.addEventListener('click', toggleDropdown);
    button.addEventListener('touchstart', toggleDropdown, { passive: false });
  });
}

function initLoginModal() {
  const modal = document.getElementById('login-modal');
  if (!modal) return;
  const openButtons = document.querySelectorAll('.apply-entrance');
  const closeBtn = modal.querySelector('.modal-close');
  const form = document.getElementById('login-form');
  const email = document.getElementById('login-email');
  const password = document.getElementById('login-password');
  const submitButton = form ? form.querySelector('button[type="submit"]') : null;
  const error = document.getElementById('login-error');
  const ACCOUNT_STORAGE_KEY = 'grc_account';
  const DEFAULT_ACCOUNT = { email: 'jayiscotton@gmail.com', password: 'HelloWorld@123' };
  let failedAttempts = 0;
  let lockoutTimer = null;
  let lockoutInterval = null;

  function setLoginDisabled(disabled) {
    if (email) email.disabled = disabled;
    if (password) password.disabled = disabled;
    if (submitButton) submitButton.disabled = disabled;
  }

  function startLockout() {
    setLoginDisabled(true);
    let remaining = 10;
    if (error) error.textContent = `Too many failed attempts. Please wait ${remaining} seconds.`;

    lockoutInterval = window.setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        if (error) error.textContent = `Too many failed attempts. Please wait ${remaining} seconds.`;
      } else {
        clearLockout();
      }
    }, 1000);

    lockoutTimer = window.setTimeout(() => {
      clearLockout();
    }, 10000);
  }

  function clearLockout() {
    if (lockoutTimer) {
      window.clearTimeout(lockoutTimer);
      lockoutTimer = null;
    }
    if (lockoutInterval) {
      window.clearInterval(lockoutInterval);
      lockoutInterval = null;
    }
    failedAttempts = 0;
    setLoginDisabled(false);
    if (error) error.textContent = '';
  }

  function getStoredAccount() {
    const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (!raw) {
      saveStoredAccount(DEFAULT_ACCOUNT);
      return { ...DEFAULT_ACCOUNT };
    }
    try {
      console.log('getStoredAccount - raw:', raw);
      const stored = JSON.parse(raw);
      if (!stored || typeof stored !== 'object') {
        saveStoredAccount(DEFAULT_ACCOUNT);
        return { ...DEFAULT_ACCOUNT };
      }
      const merged = { ...DEFAULT_ACCOUNT, ...stored };
      if (!merged.email || !merged.password) {
        saveStoredAccount(DEFAULT_ACCOUNT);
        return { ...DEFAULT_ACCOUNT };
      }
      return merged;
    } catch (err) {
      console.warn('getStoredAccount - parse error, resetting to default', err);
      saveStoredAccount(DEFAULT_ACCOUNT);
      return { ...DEFAULT_ACCOUNT };
    }
  }

  function saveStoredAccount(account) {
    try {
      localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
      console.log('saveStoredAccount - saved:', account);
      // also write a timestamp flag to help debugging across navigation
      localStorage.setItem(ACCOUNT_STORAGE_KEY + '_updated_at', String(Date.now()));
    } catch (err) {
      console.error('saveStoredAccount - failed to save', err);
    }
  }

  let account = getStoredAccount();
  // do not display stored account information in the UI

  // Reset-to-default button handler (helps when stored account gets changed)
  const resetBtn = document.getElementById('reset-default');
  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      saveStoredAccount(DEFAULT_ACCOUNT);
      account = getStoredAccount();
      failedAttempts = 0;
      clearLockout();
      if (error) {
        error.style.color = '#155724';
        error.textContent = 'Default account restored. You may now log in.';
        window.setTimeout(() => { if (error) error.textContent = ''; }, 3000);
      }
      console.log('Reset to default account performed');
    });
  }

  openButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      if (email) email.focus();
    });
  });

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (form) form.reset();
    if (error) error.textContent = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (ev) => { if (ev.target === modal) closeModal(); });

  if (form) {
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      if (email && email.disabled) return;
      if (password && password.disabled) return;

      const vEmail = email ? email.value.trim() : '';
      const vPass = password ? password.value : '';
      if (vEmail === account.email && vPass === account.password) {
        if (lockoutTimer) {
          window.clearTimeout(lockoutTimer);
          lockoutTimer = null;
        }
        // Successful login — navigate to dashboard
        window.location.href = 'dashboard.html';
      } else {
        failedAttempts += 1;
        if (failedAttempts >= 5) {
          startLockout();
        } else {
          if (error) error.textContent = 'Invalid student name or password.';
        }
      }
    });
  }
}

