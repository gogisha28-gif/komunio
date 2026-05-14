/* ─────────────────────────────────────────────────────
   Komunios — script.js
   Handles: email forms, navbar scroll, mobile menu
───────────────────────────────────────────────────── */

// ── Email storage ──────────────────────────────────────
function saveEmail(email) {
  const stored = JSON.parse(localStorage.getItem("komunios_emails") || "[]");
  if (!stored.includes(email)) {
    stored.push(email);
    localStorage.setItem("komunios_emails", JSON.stringify(stored));
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ── Form handler factory ───────────────────────────────
function setupForm(formId, emailId, successId) {
  const form    = document.getElementById(formId);
  const input   = document.getElementById(emailId);
  const success = document.getElementById(successId);

  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = input.value.trim();

    if (!isValidEmail(email)) {
      input.classList.add("border-red-400", "ring-2", "ring-red-200");
      input.focus();
      setTimeout(() => {
        input.classList.remove("border-red-400", "ring-2", "ring-red-200");
      }, 2000);
      return;
    }

    saveEmail(email);

    // Hide form, show success
    form.style.display = "none";
    success.classList.add("show-success");

    // Log to console for developer reference
    console.log("📧 Registered:", email);
    console.log("📋 All registrations:", JSON.parse(localStorage.getItem("komunios_emails") || "[]"));
  });

  // Clear red border on typing
  input.addEventListener("input", function () {
    input.classList.remove("border-red-400", "ring-2", "ring-red-200");
  });
}

// ── Navbar: shadow on scroll ───────────────────────────
function setupNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 10) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // run once on load
}

// ── Mobile menu toggle ─────────────────────────────────
function setupMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const menu   = document.getElementById("mobile-menu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = !menu.classList.contains("hidden");
    if (isOpen) {
      menu.classList.add("hidden");
    } else {
      menu.classList.remove("hidden");
    }
  });

  // Close mobile menu when any link inside it is clicked
  menu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      menu.classList.add("hidden");
    });
  });
}

// ── Smooth scroll for nav links ────────────────────────
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

// ── Scroll-reveal animation ────────────────────────────
function setupScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100", "translate-y-0");
          entry.target.classList.remove("opacity-0", "translate-y-4");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  const targets = document.querySelectorAll(".problem-card, .feature-card");
  targets.forEach(el => {
    el.classList.add("opacity-0", "translate-y-4", "transition-all", "duration-500");
    observer.observe(el);
  });
}

// ── Init ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  setupForm("hero-form", "hero-email", "hero-success");
  setupForm("cta-form",  "cta-email",  "cta-success");
  setupNavbar();
  setupMobileMenu();
  setupSmoothScroll();
  setupScrollReveal();
});
