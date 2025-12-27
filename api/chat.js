import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ================= FAQ ================= */
const FAQS = [
  { keywords: ["price", "cost", "pricing"], answer: "Our pricing depends on your project scope. I can connect you with our team 💬" },
  { keywords: ["timeline", "delivery", "how long"], answer: "Most projects take 2–4 weeks depending on complexity." },
  { keywords: ["services", "what do you do"], answer: "We provide coding, design, content marketing, branding, SEO, social media management, ads, and AI assistance." },
  { keywords: ["location", "where are you", "based"], answer: "We work with clients worldwide 🌍" },
  { keywords: ["payment", "pay", "installment"], answer: "We offer flexible payment options depending on the project." },
  { keywords: ["contacts", "humans", "reach"], answer: "I can connect you with our team 💬 type (yes) to get connected" }
];

/* ============ HUMAN HANDOFF ============ */
const HUMAN_KEYWORDS = [
  "yes",
  "connect",
  "connect me",
  "talk to human",
  "human",
  "agent",
  "whatsapp",
  "contact"
];

function wantsHuman(message) {
  const msg = message.toLowerCase();
  return HUMAN_KEYWORDS.some(keyword => msg.includes(keyword));
}

/* ============ API HANDLER ============ */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  const { message, leadCaptured } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "Please enter a message." });
  }

  // 👤 HUMAN INTENT (CHECK FIRST)
  if (wantsHuman(message)) {
    if (!leadCaptured) {
      return res.status(200).json({
        reply: "Before I connect you with our team, please complete your details above 😊"
      });
    }

    return res.status(200).json({
      reply: "Great 👍 I can connect you with our team now.",
      showWhatsapp: true
    });
  }

  // 📘 FAQ CHECK
  const lowerMsg = message.toLowerCase();
  for (const faq of FAQS) {
    if (faq.keywords.some(k => lowerMsg.includes(k))) {
      return res.status(200).json({ reply: faq.answer });
    }
  }

  // 🤖 OPENAI FALLBACK
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are Gemini Studio's AI assistant. Answer professionally and concisely." },
        { role: "user", content: message }
      ]
    });

    res.status(200).json({
      reply: completion.choices[0].message.content
    });

  } catch (error) {
    res.status(500).json({
      reply: "Sorry, something went wrong. Please try again."
    });
  }
}
