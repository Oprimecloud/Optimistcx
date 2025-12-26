import OpenAI from "openai";
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ================= VALIDATIONS ================= */
function isValidName(name) {
  if (!name) return false;
  const n = name.trim();
  return n.length >= 2 && n.length <= 60;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidProject(text) {
  if (!text) return false;
  const t = text.trim();
  return t.length >= 10 && t.length <= 500 && /[a-zA-Z]/.test(t);
}

/* ================= FAQ ================= */
const FAQS = [
  { keywords: ["price", "cost", "pricing"], answer: "Our pricing depends on your project scope. I can connect you with our team 💬" },
  { keywords: ["timeline", "delivery", "how long"], answer: "Most projects take 2–4 weeks depending on complexity." },
  { keywords: ["services", "what do you do"], answer: "We provide coding, design, content marketing, branding, SEO, social media management, ads, and AI assistance." },
  { keywords: ["location", "where are you", "based"], answer: "We work with clients worldwide 🌍" },
  { keywords: ["payment", "pay", "installment"], answer: "We offer flexible payment options depending on the project." },

  // Leadership & Structure
  { keywords: ["ceo", "who is the ceo"], answer: "Gemini Studio is a virtual agency led collectively by experienced developers, marketers, and designers." },
  { keywords: ["founder", "who founded", "owner"], answer: "Gemini Studio does not have a single founder. It was created and is managed by a collaborative team of professionals." },
  { keywords: ["leadership", "management", "who runs"], answer: "The agency is guided by a leadership group made up of experts across technology, marketing, and design." },
  { keywords: ["company", "about", "who are you"], answer: "Gemini Studio is a virtual digital agency delivering innovative tech and marketing solutions." },

  // Team & Experience
  { keywords: ["team", "staff", "developers"], answer: "Our team includes skilled developers, designers, content creators, marketers, and AI specialists." },
  { keywords: ["experience", "how experienced"], answer: "Our professionals bring years of hands-on experience across multiple digital industries." },
  { keywords: ["virtual", "remote", "online agency"], answer: "Yes, Gemini Studio operates as a fully virtual agency, allowing us to serve clients globally." },

  // Services
  { keywords: ["website", "web development", "coding"], answer: "We build modern, scalable, and high-performing websites and web applications." },
  { keywords: ["branding", "logo", "identity"], answer: "We help businesses create strong brand identities that stand out." },
  { keywords: ["seo", "search engine"], answer: "Our SEO services improve visibility, rankings, and organic traffic." },
  { keywords: ["social media", "management", "content"], answer: "We manage social media accounts with strategic content and engagement." },
  { keywords: ["ai", "automation", "assistant"], answer: "We offer AI-powered tools and automation to improve efficiency and customer experience." },

  // Process & Trust
  { keywords: ["process", "how it works"], answer: "We consult, plan, execute, and deliver with clear communication at every stage." },
  { keywords: ["revision", "changes"], answer: "Revisions are included to ensure the final result meets your expectations." },
  { keywords: ["help", "maintenance"], answer: "Yes, we provide full support and maintenance even after your project is delivered — so you’re never left on your own. You can start your project with confidence. To get started, simply type (yes)." },
  { keywords: ["portfolio", "previous work"], answer: "Yes, we can share samples of our work upon request." },

  // Getting Started
  { keywords: ["start", "get started", "begin"], answer: "Send us a message and our team will guide you step by step 🚀 type (yes) to get connected" },
  { keywords: ["contact", "talk to human", "reach"], answer: "I can connect you directly with a Gemini Studio team member right now 💬 type (yes) to get connected" },
  { keywords: ["consultation", "meeting", "call"], answer: "We offer free consultations to understand your goals and recommend the best solution. type (yes) to get connected" }
];

function getFaqAnswer(message) {
  if (!message) return null;
  const lower = message.toLowerCase();
  return FAQS.find(f => f.keywords.some(k => lower.includes(k)))?.answer || null;
}

/* ================= INTENT SCORING ================= */
function scoreIntent(message, session) {
  if (!message) return session.intentScore || 0;
  let score = session.intentScore || 0;
  const text = message.toLowerCase();

  if (/website|seo|ads|branding|ecommerce|automation/.test(text)) score += 10;
  if (/price|cost|budget/.test(text)) score += 15;
  if (/urgent|asap|now/.test(text)) score += 15;
  if (/whatsapp|agent|human|contact/.test(text)) score += 20;
  if (session.state === "DONE") score += 30;

  return Math.min(score, 100);
}

function getLeadLevel(score) {
  if (score >= 70) return "HOT 🔥";
  if (score >= 40) return "WARM 🙂";
  return "COLD ❄️";
}

/* ================= GOOGLE SHEETS ================= */
async function saveToGoogleSheets(data) {
  try {
    await fetch(process.env.GOOGLE_SHEETS_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.error("Sheets error:", err);
  }
}

/* ================= SESSION ================= */
const SESSION_TIMEOUT = 30 * 60 * 1000;
let sessions = {};

function isSessionExpired(session) {
  return Date.now() - session.lastActive > SESSION_TIMEOUT;
}

/* ================= AUTO CONNECT ================= */
const CONNECT_KEYWORDS = [
  "yes","connect","talk to human","human","agent",
  "representative","whatsapp","contact","call me"
];

function shouldAutoConnect(message) {
  if (!message) return false;
  const text = message.toLowerCase().trim();
  return CONNECT_KEYWORDS.some(k => text === k || text.includes(k));
}

/* ================= HANDLER ================= */
export default async function handler(req, res) {
  try {
    
    if (req.method !== "POST") return res.status(405).end();

    const { sessionId = "default", type, value, message } = req.body;

    if (!sessions[sessionId] || isSessionExpired(sessions[sessionId])) {
      sessions[sessionId] = {
        state: "MENU",
        service: null,
        subService: null,
        lead: {},
        connected: false,
        intentScore: 0,
        leadLevel: "COLD ❄️",
        lastActive: Date.now(),
      };
    }

    const session = sessions[sessionId];
    session.lastActive = Date.now();

    if (message) {
      session.intentScore = scoreIntent(message, session);
      session.leadLevel = getLeadLevel(session.intentScore);
    }

    /* RESET */
    if (type === "reset") {
      delete sessions[sessionId];
      return res.json({ reply: "Chat reset. How can I help you?" });
    }

    /* AUTO CONNECT — ONLY AFTER LEAD DONE */
if (
  message &&
  shouldAutoConnect(message) &&
  session.state === "DONE" &&
  !session.connected
) {
  session.connected = true;

  const waMsg = `🔥 New Lead

Name: ${session.lead.name}
Email: ${session.lead.email}
Service: ${session.service}
Sub-Service: ${session.subService}

Project:
${session.lead.project}

Intent: ${session.intentScore}
Lead: ${session.leadLevel}
Session: ${sessionId}`;

  return res.json({
    reply: "Great! Connecting you with our team now 💬",
    whatsappUrl: `https://wa.me/${process.env.WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`
  });
}


    /* SERVICE */
    if (type === "service") {
      session.service = value;
      return res.json({ reply: "Please select a sub-service." });
    }

    /* SUBSERVICE */
    if (type === "subservice") {
      session.subService = value;
      session.state = "LEAD";
      return res.json({ reply: "May I have your full name?" });
    }

    /* LEAD FLOW */
    if (session.state === "LEAD") {
      if (!session.lead.name) {
        if (!isValidName(message))
          return res.json({ reply: "Please enter your full name." });
        session.lead.name = message.trim();
        return res.json({ reply: "What’s your email address?" });
      }

      if (!session.lead.email) {
        if (!isValidEmail(message))
          return res.json({ reply: "Enter a valid email." });
        session.lead.email = message.trim();
        return res.json({ reply: "Please describe your project." });
      }

      if (!session.lead.project) {
        if (!isValidProject(message))
          return res.json({ reply: "Please describe your project clearly." });

        session.lead.project = message.trim();
        session.state = "DONE";

        await saveToGoogleSheets({
          name: session.lead.name,
          email: session.lead.email,
          service: session.service,
          subService: session.subService,
          project: session.lead.project,
          intentScore: session.intentScore,
          leadLevel: session.leadLevel,
          sessionId,
        });

        return res.json({
          reply: `Thanks ${session.lead.name}! Would you like me to connect you with our team?`,
          showConnectTeam: true,
        });
      }
    }

    /* FAQ */
    if (message) {
      const faq = getFaqAnswer(message);
      if (faq) return res.json({ reply: faq });
    }

/* ================= AI FALLBACK ================= */
if (shouldUseAI(message, session)) {
  try {
    const ai = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    return res.json({
      reply: ai.choices[0]?.message?.content || "Can you clarify that?"
    });

  } catch (err) {
    console.error("AI ERROR:", err);
    return res.json({
      reply: "I’m here to help 😊 Please choose an option below."
    });
  }
}
  } catch (err) {
    console.error("HANDLER ERROR:", err);
    return res.status(500).json({
      reply: "Server error. Please try again later."
    });
  }
}
