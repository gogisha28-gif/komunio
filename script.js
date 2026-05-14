/* ─────────────────────────────────────────────────────────
   Komunios — script.js
   Handles: email forms, navbar, mobile menu, animations
───────────────────────────────────────────────────────── */


/* ═══════════════════════════════════════════════════════════
   ⚠️  FORMSPREE SETUP — REPLACE BEFORE GOING LIVE
   ─────────────────────────────────────────────────────────
   1. Create a free account at https://formspree.io
   2. Create a new form, copy the form's endpoint URL
   3. Replace YOUR_FORM_ID below with the ID from that URL
      (e.g. if Formspree gives you https://formspree.io/f/xyzabcde,
       replace YOUR_FORM_ID with xyzabcde)
═══════════════════════════════════════════════════════════ */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";


// ── Local backup storage (fallback if Formspree fails) ───
function saveEmail(email) {
  try {
    const stored = JSON.parse(localStorage.getItem("komunios_emails") || "[]");
    if (!stored.includes(email)) {
      stored.push(email);
      localStorage.setItem("komunios_emails", JSON.stringify(stored));
    }
  } catch (_) { /* localStorage unavailable — silently ignore */ }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}


// ── Send email to Formspree ──────────────────────────────
async function sendToFormspree(email, source) {
  // If endpoint hasn't been set yet, skip the network call.
  if (FORMSPREE_ENDPOINT.includes("YOUR_FORM_ID")) {
    console.warn("⚠️  Formspree endpoint not configured. Email saved locally only.");
    return false;
  }

  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        source: source,           // "hero" or "cta" — see which form converted
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


// ── Form handler ─────────────────────────────────────────
function setupForm(formId, emailId, successId, source) {
  const form    = document.getElementById(formId);
  const input   = document.getElementById(emailId);
  const success = document.getElementById(successId);
  if (!form) return;

  form.addEventListener("submit", async function (e) {
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

    // Always save locally as backup
    saveEmail(email);

    // Show success immediately — don't make user wait on network
    form.style.display = "none";
    success.classList.add("show-success");

    // Fire-and-forget Formspree send. If it fails, the email is still
    // safe in localStorage and the user sees the same success message.
    const sent = await sendToFormspree(email, source);
    console.log(sent
      ? `✅ ${email} delivered to Formspree (source: ${source})`
      : `📦 ${email} saved locally only (source: ${source})`);
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

  setupForm("hero-form", "hero-email", "hero-success", "hero");
  setupForm("cta-form",  "cta-email",  "cta-success", "cta");
  setupNavbar();
  setupMobileMenu();
  setupSmoothScroll();
  setupScrollReveal();
});
