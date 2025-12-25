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
  { keywords: ["support", "maintenance"], answer: "We provide ongoing support and maintenance after project delivery." },
  { keywords: ["portfolio", "previous work"], answer: "Yes, we can share samples of our work upon request." },

  // Getting Started
  { keywords: ["start", "get started", "begin"], answer: "Send us a message and our team will guide you step by step 🚀 type (Yes) to get connected" },
  { keywords: ["contact", "talk to human", "reach"], answer: "I can connect you directly with a Gemini Studio team member right now 💬 type (Yes) to get connected" },
  { keywords: ["consultation", "meeting", "call"], answer: "We offer free consultations to understand your goals and recommend the best solution. type (Yes) to get connected" }
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
  if (/price|cost|budget|how much/.test(text)) score += 15;
  if (/urgent|asap|immediately|now/.test(text)) score += 15;
  if (/whatsapp|agent|human|contact|representative/.test(text)) score += 20;
  if (session.state === "DONE") score += 30;

  return Math.min(score, 100);
}

function getLeadLevel(score) {
  if (score >= 70) return "HOT 🔥";
  if (score >= 40) return "WARM 🙂";
  return "COLD ❄️";
}

/* ================= AI GUARD ================= */
function shouldUseAI(message, session) {
  if (!message) return false;
  if (session.state === "LEAD") return false;
  if (message.length < 5) return false;
  return true;
}

/* ================= GOOGLE SHEETS ================= */
async function saveToGoogleSheets(data) {
  await fetch(process.env.GOOGLE_SHEETS_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

/* ================= SESSION STORE ================= */
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
let sessions = {};

function isSessionExpired(session) {
  return Date.now() - session.lastActive > SESSION_TIMEOUT;
}

/* ================= HANDLER ================= */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { sessionId = "default", type, value, message } = req.body;

  if (!sessions[sessionId] || isSessionExpired(sessions[sessionId])) {
    sessions[sessionId] = {
      state: "MENU",
      service: null,
      goal: null,
      lead: {},
      connected: false,
      intentScore: 0,
      leadLevel: "COLD ❄️",
      lastActive: Date.now(),
    };
  }

  const session = sessions[sessionId];
  session.lastActive = Date.now();

  /* -------- SCORE -------- */
  if (message) {
    session.intentScore = scoreIntent(message, session);
    session.leadLevel = getLeadLevel(session.intentScore);
  }

  /* ================= RESET ================= */
  if (type === "reset") {
    delete sessions[sessionId];
    return res.json({ reply: "Chat reset. How can I help you?" });
  }

  /* ================= SERVICE ================= */
  if (type === "service") {
    session.service = value;
    session.state = "GOAL";
    return res.json({
      reply: "Nice 👍 What is your main goal?",
      showGoals: true,
      delayMs: 600,
    });
  }

  /* ================= GOAL ================= */
  if (type === "goal") {
    session.goal = value;
    session.state = "LEAD";
    return res.json({
      reply: "May I have your full name?",
      resumeStep: "name",
      delayMs: 600,
    });
  }

  /* ================= LEAD FLOW ================= */
  if (session.state === "LEAD") {

    if (!session.lead.name) {
      if (!isValidName(message)) {
        return res.json({
          reply: "Please enter your full name (e.g. John Doe).",
          resumeStep: "name",
        });
      }
      session.lead.name = message.trim();
      return res.json({ reply: "What’s your email address?", resumeStep: "email" });
    }

    if (!session.lead.email) {
      if (!isValidEmail(message)) {
        return res.json({
          reply: "That email doesn’t look correct. Please try again.",
          resumeStep: "email",
        });
      }
      session.lead.email = message.trim();
      return res.json({ reply: "Please describe your project.", resumeStep: "project" });
    }

    if (!session.lead.project) {
      if (!isValidProject(message)) {
        return res.json({
          reply: "Please describe your project in more detail 😊",
          resumeStep: "project",
        });
      }

      session.lead.project = message.trim();
      session.state = "DONE";

      return res.json({
        reply: `Thanks ${session.lead.name}! Would you like me to connect you with our team?`,
        showConnectTeam: true,
        delayMs: 800,
      });
    }
  }

  /* ================= CONNECT ================= */
  if (type === "connect") {
    if (session.connected) return res.json({ reply: "You’re already connected 😊" });

    session.connected = true;

    await saveToGoogleSheets({
      timestamp: new Date().toISOString(),
      name: session.lead.name,
      email: session.lead.email,
      service: session.service,
      goal: session.goal,
      project: session.lead.project,
      intentScore: session.intentScore,
      leadLevel: session.leadLevel,
      sessionId,
    });

    const waMsg = `🔥 New Chat Request

Name: ${session.lead.name}
Email: ${session.lead.email}
Service: ${session.service}
Goal: ${session.goal}

Project:
${session.lead.project}

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

  /* ================= FAQ FIRST ================= */
  if (message) {
    const faq = getFaqAnswer(message);
    if (faq) return res.json({ reply: faq });
  }

  /* ================= AI FALLBACK ================= */
  if (shouldUseAI(message, session)) {
    const ai = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: "You are GemBot 🤖, a professional AI sales assistant." },
        { role: "user", content: message },
      ],
    });

    return res.json({ reply: ai.output_text || "Can you clarify that?" });
  }

  return res.status(400).json({ error: "Invalid request" });
}

