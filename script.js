/* ─────────────────────────────────────────────────────────
   Komunios — script.js
   Handles: email forms, navbar, mobile menu, animations
───────────────────────────────────────────────────────── */


// ── Email storage ────────────────────────────────────────
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


// ── Form handler ─────────────────────────────────────────
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
      }, 2200);
      return;
    }

    saveEmail(email);
    form.style.display = "none";
    success.classList.add("show-success");

    console.log("📧 Registered:", email);
    console.log("📋 All registrations:", JSON.parse(localStorage.getItem("komunios_emails") || "[]"));
  });

  input.addEventListener("input", () => {
    input.classList.remove("border-red-400", "ring-2", "ring-red-200");
  });
}


// ── Navbar shadow on scroll ──────────────────────────────
function setupNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 10);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}


// ── Mobile menu ──────────────────────────────────────────
function setupMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const menu   = document.getElementById("mobile-menu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });

  menu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => menu.classList.add("hidden"));
  });
}


// ── Smooth scroll ────────────────────────────────────────
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


// ── Scroll-reveal with stagger ───────────────────────────
function setupScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        // Read sibling index for stagger delay
        const siblings = Array.from(entry.target.parentElement.children).filter(
          el => el.classList.contains("reveal-item")
        );
        const idx = siblings.indexOf(entry.target);
        const delay = idx * 90; // 90ms per card

        setTimeout(() => {
          entry.target.classList.add("revealed");
        }, delay);

        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -36px 0px" }
  );

  document.querySelectorAll(".reveal-item").forEach(el => {
    observer.observe(el);
  });
}


// ── Init ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Render Lucide <i data-lucide="..."> → SVG
  if (typeof lucide !== "undefined") lucide.createIcons();

  setupForm("hero-form", "hero-email", "hero-success");
  setupForm("cta-form",  "cta-email",  "cta-success");
  setupNavbar();
  setupMobileMenu();
  setupSmoothScroll();
  setupScrollReveal();
});
