/**
 * ═══════════════════════════════════════════════════════════
 * Komunios — Chat Function (serverless)
 * ───────────────────────────────────────────────────────────
 * Receives a chat message from the browser, forwards it to
 * Anthropic's Messages API using a server-held API key, and
 * returns Claude's reply. The API key is read from the
 * ANTHROPIC_API_KEY environment variable and is NEVER sent
 * to the browser.
 *
 * Native fetch is available because Netlify runs Node 18+.
 * ═══════════════════════════════════════════════════════════
 */

const ANTHROPIC_URL    = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const MODEL            = "claude-haiku-4-5-20251001";   // fast + cheap
const MAX_TOKENS       = 500;                            // concise answers
const MAX_HISTORY      = 10;                             // last N turns
const MAX_MESSAGE_LEN  = 1000;                           // anti-abuse

const SYSTEM_PROMPT = `შენ ხარ Komunios-ის ციფრული ასისტენტი. Komunios არის პლატფორმა, რომელიც ქართულ კორპუსებს თემად აქცევს.

შენი დანიშნულება:
- მისალმე ხალხს თბილად, ქართულად
- უპასუხე კითხვებზე Komunios-ის შესახებ
- დაეხმარე მათ გაიგონ, რას ვაკეთებთ ჩვენ
- მიმართე მათ შესაბამის გვერდებზე (ფასები, FAQ, სერვისები)

Komunios-ის ფუნქციები:
1. სოციალური სივრცე — ჯგუფური ჩატი, განცხადებები, ციფრული კენჭისყრები
2. გამჭვირვალე ფინანსები — ყველა ხედავს რა, რატომ, როდის
3. სამეზობლო Marketplace — გაყიდე, აჩუქე, გაცვალე ნივთები მეზობლებთან
4. ბავშვები და ოჯახი — ძიძების გაცვლა, რეპეტიტორი, სათამაშო ჯგუფები
5. შინაური ცხოველები — ვინ გაატარებს ძაღლს, ვინ მოუვლის სანამ მოგზაურობ
6. უსაფრთხოება — ეჭვმიტანილი აქტივობის შეტყობინება, QR წვდომა სტუმრებისთვის
7. AI ასისტენტი — ეს ხარ შენ!
8. პოზიტიური წახალისება — ჯარიმის მაგივრად აღიარება

ფასები:
- უფასო — საცდელი, 10 მეზობლამდე
- სტანდარტი — 2₾/თვეში ბინაზე, სრული ფუნქციონალი
- პრემიუმი — დეველოპერებისთვის, შეთანხმებით

წესები:
- ვინაიდან Komunios ჯერ კიდევ ვითარდება, თუ რთულ ტექნიკურ კითხვას სვამენ — გაუგზავნე info@komunios.ge
- არასოდეს დაარქვა კონკურენტი კომპანიის სახელით
- იყავი მოკლე — 2-3 წინადადება საკმარისია
- გამოიყენე თბილი, მეგობრული ენა
- ნუ გამოიყენებ ბევრ emoji-ს — 1-2 საკმარისია
- თუ რამე არ იცი — გულახდილად თქვი: 'ეს დეტალი ჩემთვის ჯერ უცნობია, შეგიძლია info@komunios.ge-ზე იკითხო'
- შეინარჩუნე საუბრის კონტექსტი previous messages-დან`;


/* ── Helpers ────────────────────────────────────────────── */

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
    body: JSON.stringify(payload),
  };
}

function isValidRole(role) {
  return role === "user" || role === "assistant";
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .filter(m => m && typeof m === "object"
                 && isValidRole(m.role)
                 && typeof m.content === "string"
                 && m.content.length > 0
                 && m.content.length <= MAX_MESSAGE_LEN)
    .slice(-MAX_HISTORY)
    .map(m => ({ role: m.role, content: m.content }));
}


/* ── Handler ────────────────────────────────────────────── */

exports.handler = async function (event) {

  // Only POST allowed
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  // Parse JSON body
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { error: "Invalid JSON" });
  }

  const message = (body.message || "").toString().trim();
  if (!message) {
    return jsonResponse(400, { error: "Message is required" });
  }
  if (message.length > MAX_MESSAGE_LEN) {
    return jsonResponse(413, { error: "Message too long" });
  }

  // Validate API key is present
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY env var is not set");
    return jsonResponse(500, { error: "Server not configured" });
  }

  // Build messages: trimmed history followed by current user message
  const history = sanitizeHistory(body.conversationHistory);
  const messages = [...history, { role: "user", content: message }];

  // Call Anthropic Messages API
  let upstream;
  try {
    upstream = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type":      "application/json",
        "x-api-key":         apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model:      MODEL,
        max_tokens: MAX_TOKENS,
        system:     SYSTEM_PROMPT,
        messages,
      }),
    });
  } catch (err) {
    console.error("Network error contacting Anthropic:", err);
    return jsonResponse(502, { error: "AI service unreachable" });
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    console.error("Anthropic API non-2xx:", upstream.status, detail);
    return jsonResponse(502, { error: "AI service error" });
  }

  let data;
  try {
    data = await upstream.json();
  } catch (err) {
    console.error("Could not parse Anthropic response:", err);
    return jsonResponse(502, { error: "AI service returned invalid response" });
  }

  const reply = data?.content?.[0]?.text?.trim();
  if (!reply) {
    console.error("Empty reply in Anthropic response:", data);
    return jsonResponse(502, { error: "Empty AI response" });
  }

  return jsonResponse(200, { reply });
};
