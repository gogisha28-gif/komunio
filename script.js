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


/* ── FAQ accordion ─────────────────────────────────────── */
function setupFAQ() {
  const items = document.querySelectorAll(".faq-item");
  if (!items.length) return;

  items.forEach(item => {
    const btn = item.querySelector(".faq-question");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const isOpen = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });
}


/* ═══════════════════════════════════════════════════════════
   CHAT WIDGET
   Injects the floating launcher + chat window into every page,
   manages messages, and forwards each user message to our
   serverless function at /.netlify/functions/chat.

   The Anthropic API key lives ONLY on the server. The browser
   never sees it.
═══════════════════════════════════════════════════════════ */

const CHAT_ENDPOINT      = "/.netlify/functions/chat";
const CHAT_STORAGE_KEY   = "komunios_chat_history";
const CHAT_MAX_HISTORY   = 10;     // last N turns to send for context
const CHAT_INITIAL_REPLY =
`გამარჯობა! 👋 მე ვარ Komunios-ის ციფრული ასისტენტი. რით შემიძლია დაგეხმარო?

შეგიძლია მკითხო:
• რა ფიჩერები გვაქვს
• ფასები
• როგორ იწყება
• ნებისმიერი სხვა კითხვა`;

const CHAT_SUGGESTED = [
  "რა განსხვავებაა სხვებისგან?",
  "რა ღირს თვეში?",
  "როდის გაიშვება?",
];


let chatMessages = [];   // [{role:'user'|'assistant', content:'...'}]
let chatIsOpen   = false;
let chatIsLoading = false;


/* ── Inject widget HTML into <body> ────────────────────── */
function injectChatWidget() {
  // Avoid duplicate injection if script runs twice
  if (document.getElementById("chat-launcher")) return;

  const html = `
    <button id="chat-launcher" class="chat-launcher" aria-label="გესაუბრე AI ასისტენტს">
      <i data-lucide="message-circle"></i>
      <span class="chat-tooltip">გესაუბრე ჩვენი AI ასისტენტს</span>
    </button>

    <div id="chat-window" class="chat-window hidden" role="dialog" aria-label="Komunios AI ასისტენტი">
      <header class="chat-header">
        <div class="chat-header-info">
          <div class="chat-avatar">K</div>
          <div>
            <div class="chat-title">Komunios ასისტენტი</div>
            <div class="chat-subtitle">
              <span class="chat-status-dot"></span>
              ცოცხალი AI · ქართულად
            </div>
          </div>
        </div>
        <button id="chat-close" class="chat-close" aria-label="დახურე ჩატი">
          <i data-lucide="x"></i>
        </button>
      </header>

      <div id="chat-messages" class="chat-messages" aria-live="polite"></div>

      <form id="chat-form" class="chat-input-area" autocomplete="off">
        <input id="chat-input" type="text" placeholder="დაწერე შენი კითხვა..." maxlength="1000" />
        <button type="submit" id="chat-send" aria-label="გაგზავნე" disabled>
          <i data-lucide="send"></i>
        </button>
      </form>
    </div>
  `;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  while (wrapper.firstChild) document.body.appendChild(wrapper.firstChild);
}


/* ── localStorage persistence ──────────────────────────── */
function chatLoadHistory() {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) chatMessages = parsed;
    }
  } catch (_) {}
}

function chatSaveHistory() {
  try {
    // Keep only the last 30 turns in storage to avoid bloat
    const toSave = chatMessages.slice(-30);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(toSave));
  } catch (_) {}
}


/* ── Render helpers ────────────────────────────────────── */
function chatScrollToBottom() {
  const box = document.getElementById("chat-messages");
  if (box) box.scrollTop = box.scrollHeight;
}

function chatRenderMessage(role, content, withChips = false) {
  const box = document.getElementById("chat-messages");
  if (!box) return;

  const msg = document.createElement("div");
  msg.className = `chat-msg ${role}`;

  if (role === "assistant") {
    const avatar = document.createElement("div");
    avatar.className = "chat-msg-avatar";
    avatar.textContent = "K";
    msg.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  bubble.className = "chat-msg-bubble";
  bubble.textContent = content;
  msg.appendChild(bubble);

  box.appendChild(msg);

  // Suggested chips appear directly under the initial assistant message
  if (withChips) {
    const chips = document.createElement("div");
    chips.className = "chat-chips";
    chips.id = "chat-chips";
    CHAT_SUGGESTED.forEach(q => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chat-chip";
      chip.textContent = q;
      chip.addEventListener("click", () => {
        chatRemoveChips();
        chatSendMessage(q);
      });
      chips.appendChild(chip);
    });
    box.appendChild(chips);
  }

  chatScrollToBottom();
}

function chatRemoveChips() {
  const chips = document.getElementById("chat-chips");
  if (chips) chips.remove();
}

function chatShowTyping() {
  const box = document.getElementById("chat-messages");
  if (!box || document.getElementById("chat-typing-indicator")) return;
  const wrap = document.createElement("div");
  wrap.id = "chat-typing-indicator";
  wrap.className = "chat-typing";
  wrap.innerHTML = "<span></span><span></span><span></span>";
  box.appendChild(wrap);
  chatScrollToBottom();
}

function chatHideTyping() {
  const t = document.getElementById("chat-typing-indicator");
  if (t) t.remove();
}


/* ── Open / close ──────────────────────────────────────── */
function chatOpen() {
  if (chatIsOpen) return;
  chatIsOpen = true;

  document.getElementById("chat-window").classList.remove("hidden");
  document.getElementById("chat-launcher").classList.add("hidden");

  // First-time open: render initial greeting + chips
  if (chatMessages.length === 0) {
    chatRenderMessage("assistant", CHAT_INITIAL_REPLY, true);
  }

  setTimeout(() => {
    const input = document.getElementById("chat-input");
    if (input) input.focus();
  }, 50);
}

function chatClose() {
  if (!chatIsOpen) return;
  chatIsOpen = false;

  document.getElementById("chat-window").classList.add("hidden");
  document.getElementById("chat-launcher").classList.remove("hidden");
}


/* ── Send message → /.netlify/functions/chat ──────────── */
async function chatSendMessage(text) {
  const message = (text || "").trim();
  if (!message || chatIsLoading) return;

  chatRemoveChips();

  // 1. Show user message immediately
  chatRenderMessage("user", message);
  chatMessages.push({ role: "user", content: message });
  chatSaveHistory();

  // 2. Lock input + show typing
  chatSetLoading(true);
  chatShowTyping();

  // 3. Call serverless function
  let reply;
  try {
    const res = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message,
        // Send only the most recent context (excluding the just-pushed message)
        conversationHistory: chatMessages.slice(-CHAT_MAX_HISTORY - 1, -1),
      }),
    });

    if (!res.ok) {
      console.warn("Chat function returned non-OK:", res.status);
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    reply = (data && data.reply) ? data.reply : null;
  } catch (err) {
    console.error("Chat fetch failed:", err);
    reply = null;
  }

  chatHideTyping();

  if (reply) {
    chatRenderMessage("assistant", reply);
    chatMessages.push({ role: "assistant", content: reply });
    chatSaveHistory();
  } else {
    const errorMsg = "ბოდიში, რაღაც ვერ მოხერხდა. სცადე ხელახლა.";
    chatRenderMessage("assistant", errorMsg);
    // Don't save error messages to history — they'd confuse the AI's context
  }

  chatSetLoading(false);
}

function chatSetLoading(loading) {
  chatIsLoading = loading;
  const input = document.getElementById("chat-input");
  const send  = document.getElementById("chat-send");
  if (input) input.disabled = loading;
  if (send)  send.disabled  = loading || !(input && input.value.trim());
}


/* ── Wire up event listeners ────────────────────────────── */
function setupChat() {
  injectChatWidget();

  // Render Lucide icons that were just injected
  if (typeof lucide !== "undefined") lucide.createIcons();

  // Restore saved conversation
  chatLoadHistory();
  if (chatMessages.length > 0) {
    chatMessages.forEach(m => chatRenderMessage(m.role, m.content));
  }

  // Launcher
  document.getElementById("chat-launcher").addEventListener("click", chatOpen);
  document.getElementById("chat-close").addEventListener("click", chatClose);

  // Form
  const form  = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value;
    input.value = "";
    chatSendMessage(text);
    chatSetLoading(false);   // re-evaluates send button disabled state
  });

  // Enable send button only when input has content
  input.addEventListener("input", () => {
    const send = document.getElementById("chat-send");
    if (send) send.disabled = chatIsLoading || !input.value.trim();
  });

  // Esc closes the chat
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && chatIsOpen) chatClose();
  });
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
  setupFAQ();
  setupChat();
});
