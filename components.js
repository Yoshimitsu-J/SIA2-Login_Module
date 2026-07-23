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
  const error = document.getElementById('login-error');

  const account = { email: 'jayiscotton@gmail.com', password: 'HelloWorld@123' };

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
      const vEmail = email ? email.value.trim() : '';
      const vPass = password ? password.value : '';
      if (vEmail === account.email && vPass === account.password) {
        // Successful hardcoded login — navigate to dashboard
        window.location.href = 'dashboard.html';
      } else {
        if (error) error.textContent = 'Invalid student name or password.';
      }
    });
  }
}

