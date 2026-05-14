/* ═══════════════════════════════════════════════════════════
   Komunios — script.js
   Forms, navbar, mobile menu, scroll reveal, count-up stats
═══════════════════════════════════════════════════════════ */


/* ─────────────────────────────────────────────────────────
   ⚠️  FORMSPREE — replace YOUR_FORM_ID with your real ID
   ───────────────────────────────────────────────────────── */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/maqvzkzb";


/* ── Motion preference (respect users who want less motion) */
const prefersReducedMotion =
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/* ── Email storage (local backup) ──────────────────────── */
function saveEmail(email) {
  try {
    const stored = JSON.parse(localStorage.getItem("komunios_emails") || "[]");
    if (!stored.includes(email)) {
      stored.push(email);
      localStorage.setItem("komunios_emails", JSON.stringify(stored));
    }
  } catch (_) { /* localStorage unavailable */ }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}


/* ── Send to Formspree ─────────────────────────────────── */
async function sendToFormspree(email, source) {
  if (FORMSPREE_ENDPOINT.includes("YOUR_FORM_ID")) {
    console.warn("⚠️  Formspree endpoint not configured.");
    return false;
  }
  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        email, source,
        page: window.location.href,
        timestamp: new Date().toISOString(),
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn("Formspree submission failed:", err);
    return false;
  }
}


/* ── Form handler ──────────────────────────────────────── */
function setupForm(formId, emailId, successId, source) {
  const form    = document.getElementById(formId);
  const input   = document.getElementById(emailId);
  const success = document.getElementById(successId);
  if (!form) return;

  form.addEventListener("submit", async (e) => {
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

    const sent = await sendToFormspree(email, source);
    console.log(sent
      ? `✅ ${email} delivered to Formspree (source: ${source})`
      : `📦 ${email} saved locally only (source: ${source})`);
  });

  input.addEventListener("input", () => {
    input.classList.remove("border-red-400", "ring-2", "ring-red-200");
  });
}


/* ── Navbar shadow on scroll ───────────────────────────── */
function setupNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;
  const onScroll = () => navbar.classList.toggle("scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}


/* ── Mobile menu ───────────────────────────────────────── */
function setupMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const menu   = document.getElementById("mobile-menu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => menu.classList.toggle("hidden"));
  menu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => menu.classList.add("hidden"));
  });
}


/* ── Smooth scroll ─────────────────────────────────────── */
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      }
    });
  });
}


/* ── Scroll-reveal with stagger ────────────────────────── */
function setupScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = Array.from(entry.target.parentElement.children).filter(
        el => el.classList.contains("reveal-item")
      );
      const idx = siblings.indexOf(entry.target);
      const delay = prefersReducedMotion ? 0 : idx * 90;
      setTimeout(() => entry.target.classList.add("revealed"), delay);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -36px 0px" });

  document.querySelectorAll(".reveal-item").forEach(el => observer.observe(el));
}


/* ── Stat count-up animation ───────────────────────────── */
function animateNumber(el, target, duration) {
  // Honour reduced-motion preference
  if (prefersReducedMotion) {
    el.textContent = target;
    return;
  }

  const startTime = performance.now();
  const startVal  = 0;

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic for a satisfying decel
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startVal + (target - startVal) * eased);
    el.textContent = current;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function setupStatCounters() {
  const nums = document.querySelectorAll(".stat-num");
  if (!nums.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10) || 0;
      animateNumber(el, target, 1500);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  nums.forEach(el => observer.observe(el));
}


/* ── Init ──────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof lucide !== "undefined") lucide.createIcons();

  setupForm("hero-form", "hero-email", "hero-success", "hero");
  setupForm("cta-form",  "cta-email",  "cta-success",  "cta");
  setupNavbar();
  setupMobileMenu();
  setupSmoothScroll();
  setupScrollReveal();
  setupStatCounters();
});
