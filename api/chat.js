// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const response = await openai.responses.create({
//   prompt: {
//     "id": "pmpt_694a7bb321448197b6cbdbc4aaa033dd03b76c7ac7bb175a",
//     "version": "1"
//   }
// });

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   const { message } = req.body;

//   if (!message) {
//     return res.status(400).json({ error: "Message is required" });
//   }

//   try {
//     const client = new OpenAI({
//       apiKey: process.env.OPENAI_API_KEY,
//     });

    // SYSTEM PROMPT — Hybrid personality for Gemini Studio Assistant
//     const systemPrompt = 
//       `You are GemBot 🤖, an AI-powered sales and support assistant for Gemini Studio,
// a digital agency offering:

// - Web Development
// - Branding & UI/UX
// - SEO
// - Content Creation
// - Social Media Management
// - PPC Ads

// PERSONALITY:
// - Friendly, professional, human, and confident
// - Never robotic or pushy
// - Short, clear responses

// PRIMARY GOALS:
// 1. Help users understand Gemini Studio’s services
// 2. Guide users through a clear service menu
// 3. Answer FAQs and support questions accurately
// 4. Qualify potential clients
// 5. Collect lead information when appropriate

// CONVERSATION RULES:
// - Always start by greeting the user and showing the main menu:
//   Web Development, Branding, SEO, Content Creation, Social Media Management, PPC Ads
// - If the user selects a service, ask 2–3 relevant follow-up questions
// - Educate first, sell second
// - If the user shows interest or intent, politely ask for:
//   Name, Email, and Project details
// - After collecting lead info, ask:
//   “Would you like me to connect you with our team?”

// MODE SWITCHING:
// - FAQ Mode → pricing, timeline, process
// - Support Mode → issues, help, troubleshooting
// - Sales Mode → interest, services, onboarding

// If the user is just chatting, respond helpfully.
// If the user is serious, guide them toward becoming a lead.
// Always aim to move the conversation forward.

// `;

//     const completion = await client.chat.completions.create({
//       model: "gpt-4.1-mini", // cheap + fast; upgradeable
//       messages: [
//         { role: "system", content: systemPrompt },
//         { role: "user", content: message },
//       ],
//     });

//     const aiReply = completion.choices[0].message.content;

//     // Lead extraction pattern
//     let leadCaptured = false;
//     let leadData = null;

//     const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
//     const nameRegex = /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/;

//     const email = message.match(emailRegex);
//     const name = message.match(nameRegex);

//     if (email) {
//       leadCaptured = true;
//       leadData = {
//         name: name ? name[0] : "Unknown",
//         email: email[0],
//         project: message,
//       };

//       // Call Zoho Mail endpoint
//       await fetch(`${process.env.SITE_URL}/api/send-lead`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(leadData),
//       });
//     }

//     return res.status(200).json({
//       reply: aiReply,
//       leadCaptured,
//       lead: leadData || null,
//     });
//   } catch (err) {
//     console.error("Chat Error:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// }
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ---------------- VALIDATIONS ---------------- */
function isValidName(name) {
  return /^[A-Za-z\s]{2,50}$/.test(name.trim());
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidProject(text) {
  if (!text) return false;
  const t = text.trim();
  return t.length >= 10 && t.length <= 500 && /[a-zA-Z]/.test(t);
}

/* ---------------- FAQ ---------------- */
const FAQS = [
  { keywords: ["price", "cost", "pricing"], answer: "Our pricing depends on your project scope. I can connect you with our team 💬" },
  { keywords: ["timeline", "delivery", "how long"], answer: "Most projects take 2–4 weeks depending on complexity." },
  { keywords: ["services", "what do you do"], answer: "We offer web development, branding, SEO, ads, e-commerce, and AI automation." },
];

function getFaqAnswer(message) {
  const lower = message.toLowerCase();
  return FAQS.find(f => f.keywords.some(k => lower.includes(k)))?.answer || null;
}

/* ---------------- CONFIDENCE SCORING ---------------- */
function scoreIntent(message, session) {
  if (!message) return session.intentScore || 0;

  let score = session.intentScore || 0;
  const text = message.toLowerCase();

  if (/website|seo|ads|branding|ecommerce|automation/.test(text)) score += 10;
  if (/price|cost|budget|how much/.test(text)) score += 15;
  if (/urgent|asap|immediately|now/.test(text)) score += 15;
  if (/whatsapp|agent|human|representative|contact/.test(text)) score += 20;
  if (session.state === "DONE") score += 30;

  return Math.min(score, 100);
}

function getLeadLevel(score) {
  if (score >= 70) return "HOT 🔥";
  if (score >= 40) return "WARM 🙂";
  return "COLD ❄️";
}

/* ---------------- AI GUARD ---------------- */
function shouldUseAI(message, session) {
  if (!message) return false;
  if (session.state === "LEAD") return false;
  if (message.length < 5) return false;
  return true;
}

/* ---------------- GOOGLE SHEETS ---------------- */
async function saveToGoogleSheets(lead) {
  await fetch(process.env.GOOGLE_SHEETS_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });
}

/* ---------------- SESSION STORE ---------------- */
let sessions = {};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { sessionId = "default", type, value, message } = req.body;

  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      state: "MENU",
      service: null,
      goal: null,
      lead: {},
      connected: false,
      intentScore: 0,
      language: "English",
    };
  }

  const session = sessions[sessionId];

  /* -------- SCORE USER MESSAGE -------- */
  if (message) {
    session.intentScore = scoreIntent(message, session);
    session.leadLevel = getLeadLevel(session.intentScore);
  }

  /* ---------------- RESET ---------------- */
  if (type === "reset") {
    sessions[sessionId] = {
      state: "MENU",
      service: null,
      goal: null,
      lead: {},
      connected: false,
      intentScore: 0,
      language: "English",
    };
    return res.json({ reply: "Chat reset. How can I help you?" });
  }

  /* ---------------- SERVICE ---------------- */
  if (type === "service") {
    session.service = value;
    session.state = "GOAL";
    return res.json({ reply: "Nice 👍 What is your main goal?", showGoals: true });
  }

  /* ---------------- GOAL ---------------- */
  if (type === "goal") {
    session.goal = value;
    session.state = "LEAD";
    return res.json({ reply: "May I have your full name?" });
  }

  /* ---------------- LEAD FLOW ---------------- */
  if (session.state === "LEAD" && !session.lead.name) {
    if (!isValidName(message)) return res.json({ reply: "Please enter a valid name." });
    session.lead.name = message.trim();
    return res.json({ reply: "What’s your email address?" });
  }

  if (session.state === "LEAD" && !session.lead.email) {
    if (!isValidEmail(message)) return res.json({ reply: "That email doesn’t look correct." });
    session.lead.email = message.trim();
    return res.json({ reply: "Please describe your project." });
  }

  if (session.state === "LEAD" && !session.lead.project) {
    if (!isValidProject(message)) return res.json({ reply: "Please describe your project in more detail." });

    session.lead.project = message.trim();
    session.state = "DONE";

    return res.json({
      reply: `Thanks ${session.lead.name}! Would you like me to connect you with our team?`,
      showConnectTeam: true,
    });
  }

  /* ---------------- CONNECT ---------------- */
  if (type === "connect") {
    if (session.connected) return res.json({ reply: "You’re already connected 😊" });
    session.connected = true;

    await saveToGoogleSheets({
      name: session.lead.name,
      email: session.lead.email,
      service: session.service,
      goal: session.goal,
      project: session.lead.project,
      intentScore: session.intentScore,
      leadLevel: session.leadLevel,
      sessionId,
    });

    const waMsg = `🔥 New Sales Lead
Name: ${session.lead.name}
Email: ${session.lead.email}
Service: ${session.service}
Goal: ${session.goal}
Intent Score: ${session.intentScore}
Lead Level: ${session.leadLevel}
Session ID: ${sessionId}`;

    const whatsappUrl = `https://wa.me/${process.env.WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`;

    return res.json({
      reply: "Connecting you to our team 💬",
      whatsappUrl,
      connected: true,
    });
  }

  /* ---------------- FAQ FIRST ---------------- */
  if (message) {
    const faq = getFaqAnswer(message);
    if (faq) return res.json({ reply: faq });
  }

  /* ---------------- AI FALLBACK ---------------- */
  if (shouldUseAI(message, session)) {
    const ai = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: "You are GemBot 🤖, a professional sales assistant.",
        },
        { role: "user", content: message },
      ],
    });

    return res.json({ reply: ai.output_text || "Can you clarify that?" });
  }

  return res.status(400).json({ error: "Invalid request" });
}
