/* =====================================================
   WebSandbox – JavaScript
   ===================================================== */

(function () {
  "use strict";

  /* ----- Footer year ----- */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ----- Mobile nav toggle ----- */
  const toggle = document.querySelector(".nav__toggle");
  const navLinks = document.querySelector(".nav__links");

  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      const isOpen = navLinks.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close nav when a link is clicked
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ----- Contact form ----- */
  const form = document.querySelector(".contact-form");
  const feedback = form ? form.querySelector(".form-feedback") : null;

  if (form && feedback) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Clear previous state
      feedback.textContent = "";
      feedback.className = "form-feedback";
      form.querySelectorAll("input, textarea").forEach(function (el) {
        el.classList.remove("error");
      });

      // Simple client-side validation
      let valid = true;
      form.querySelectorAll("[required]").forEach(function (el) {
        if (!el.value.trim()) {
          el.classList.add("error");
          valid = false;
        }
      });

      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput && emailInput.value.trim() && !emailInput.value.includes("@")) {
        emailInput.classList.add("error");
        valid = false;
      }

      if (!valid) {
        feedback.textContent = "Please fill in all required fields correctly.";
        feedback.classList.add("error");
        return;
      }

      // Simulate a successful submission (no real endpoint)
      feedback.textContent = "Thanks! Your message has been received.";
      feedback.classList.add("success");
      form.reset();
    });
  }
})();
