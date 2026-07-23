// components.js
document.addEventListener("DOMContentLoaded", function () {
  fetch("navbar.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navbar-placeholder").innerHTML = data;
      initNavbarInteraction();
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

