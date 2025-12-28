import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ================= FAQ ================= */
const FAQS = [
  // Pricing & Payment
  {
    keywords: ["how much"],
    answer: "Our pricing depends on your project scope and requirements. I can connect you with our team to get an exact quote 💬"
  },
 {
  keywords: ["mode of payment", "how to pay"],
  answer: "We offer flexible payment options based on your project size and timeline. Once we understand your needs, we’ll guide you to the best option.",
  cta: [
    { label: "✅ Yes", action: "proceed" },
    { label: "💬 Talk to an Agent", action: "handoff" },
    { label: "➡️ Continue", action: "continue" }
  ]
},
function botReply(text, ctas = null) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "bot-message";
  messageDiv.innerText = text;

  chatBody.appendChild(messageDiv);

  // 👇 RENDER BUTTONS IF CTA EXISTS
  if (ctas && ctas.length) {
    const btnWrapper = document.createElement("div");
    btnWrapper.className = "cta-buttons";

    ctas.forEach(cta => {
      const btn = document.createElement("button");
      btn.innerText = cta.label;
      btn.onclick = () => handleCTA(cta.action);
      btnWrapper.appendChild(btn);
    });

    chatBody.appendChild(btnWrapper);
  }

  chatBody.scrollTop = chatBody.scrollHeight;
},
function handleCTA(action) {
  switch (action) {
    case "proceed":
      botReply("Great 👍 What service are you interested in?");
      break;

    case "handoff":
      botReply("No problem 😊 I’ll connect you with our team.");
      // WhatsApp / human handoff here
      break;

    case "continue":
      botReply("Alright, tell me more about your project.");
      break;
  }
},
  // Timeline
  {
    keywords: ["timeline", "delivery", "how long"],
    answer: "Most projects are typically completed within 2–4 weeks, depending on scope and requirements."

  },

  // Services Overview
  {
    keywords: ["services", "what do you do"],
    answer: "We offer web development, UI/UX design, branding, content marketing, SEO, social media management, paid ads, and AI-powered solutions."
  },

  // Location
  {
    keywords: ["location", "where are you", "based"],
    answer: "Gemini Studio is a fully virtual agency working with clients worldwide 🌍"
  },

  // Leadership & Company
  {
    keywords: ["ceo", "who is the ceo"],
    answer: "Gemini Studio is a virtual agency led collaboratively by experienced developers, designers, and marketing professionals."
  },
  {
    keywords: ["founder", "who founded", "owner"],
    answer: "Gemini Studio was built and is managed by a collective team of industry experts rather than a single founder."
  },
  {
    keywords: ["leadership", "management", "who runs"],
    answer: "Our leadership consists of specialists across technology, design, marketing, and AI."
  },
  {
    keywords: ["company", "about", "who are you"],
    answer: "Gemini Studio is a digital agency delivering modern technology and marketing solutions for growing businesses."
  },

  // Team & Experience
  {
    keywords: ["teams", "staff", "developers"],
    answer: "Our team includes skilled developers, designers, marketers, content creators, and AI specialists."
  },
  {
    keywords: ["experience", "how experienced"],
    answer: "Our professionals bring years of hands-on experience across multiple digital industries."
  },
  {
    keywords: ["virtual", "remote", "online agency"],
    answer: "Yes, we operate as a fully remote agency, allowing us to serve clients globally with flexibility."
  },

  // Specific Services
  {
    keywords: ["website", "web development", "coding", "code"],
    answer: "We build modern, fast, scalable websites and web applications tailored to your business goals."
  },
  {
    keywords: ["branding", "logo", "identity"],
    answer: "We create strong brand identities including logos, visual systems, and brand guidelines."
  },
  {
    keywords: ["seo", "search engine"],
    answer: "Our SEO services help improve visibility, search rankings, and organic traffic."
  },
  {
    keywords: ["social media", "management", "content"],
    answer: "We manage social media accounts with strategic content, engagement, and growth-focused campaigns."
  },
  {
    keywords: ["ai", "automation", "assistant"],
    answer: "We provide AI-powered tools and automation to enhance efficiency and customer experience."
  },

  // Process & Trust
  {
    keywords: ["process", "how it works"],
    answer: "Our process includes consultation, planning, execution, and delivery with clear communication at every stage."
  },
  {
    keywords: ["revision", "changes"],
    answer: "Yes, revisions are included to ensure the final result meets your expectations."
  },
  {
    keywords: ["help", "maintenance", "supports"],
    answer: "We provide ongoing support and maintenance even after project delivery. To get started, simply type (now)."
  },
  {
    keywords: ["portfolio", "previous work"],
    answer: "Yes, we can share samples of our previous work upon request."
  },

  // Getting Started
  {
    keywords: ["start", "get started", "begin"],
    answer: "Getting started is easy 🚀 Just type (now) and I’ll connect you with our team."
  },
  {
    keywords: ["contact", "talk to human", "reachs"],
    answer: "I can connect you directly with a Gemini Studio team member 💬 Just type (now)."
  },
  {
    keywords: ["consultation", "meeting", "call"],
    answer: "We offer free consultations to understand your goals and recommend the best solution. Type (now) to get connected."
  }
];


/* ============ HUMAN HANDOFF ============ */
const HUMAN_KEYWORDS = [
"human", "agent", "connect", "representative", "support", "now"
];

function wantsHuman(message) {
  const msg = message.toLowerCase();
  return HUMAN_KEYWORDS.some(keyword => msg.includes(keyword));
}

// ================================
// SYSTEM PROMPTS
// ================================

const BASE_SYSTEM_PROMPT = `
You are Geministudio Agency’s Client Support Assistant.

TONE:
Calm, respectful, professional, Nigerian & international friendly.

RULES:
- Be clear and concise
- Simplify confusion
- Ask focused follow-up questions
- Guide users forward
- Do not overwhelm

BUSINESS:
- Pricing depends on scope
- Timeline must be realistic
- Explain process clearly

NEVER:
- Make guarantees
- Expose internal technical details
`;

const SALES_SYSTEM_PROMPT = `
You are a conversion-focused sales assistant for Geministudio Agency.

GOAL:
Help users understand value and move them closer to starting a project.

RULES:
- Highlight benefits, not features
- Never contradict stated pricing or timelines
- Encourage next steps (brief, discovery call, WhatsApp)
- Use friendly persuasion
- Avoid pressure or urgency lies

ESCALATION:
If interest is high, suggest speaking with a human team member.
`;

const SUPPORT_SYSTEM_PROMPT = `
You are a customer support assistant focused on clarity and trust.

GOAL:
Help users feel confident, informed, and supported.

RULES:
- Reassure politely
- Explain things simply
- Reduce confusion
- Never upsell aggressively
`;

const TECHNICAL_SYSTEM_PROMPT = `
You explain technical topics in a non-technical, client-friendly way.

RULES:
- No code
- No frameworks unless asked
- Use simple analogies
- Focus on outcomes, not implementation
`;

function getSystemPrompt(message) {
  const text = message.toLowerCase();

  if (
    text.includes("price") ||
    text.includes("cost") ||
    text.includes("hire") ||
    text.includes("start")
  ) {
    return SALES_SYSTEM_PROMPT;
  }

  if (
    text.includes("issue") ||
    text.includes("problem") ||
    text.includes("confused") ||
    text.includes("help")
  ) {
    return SUPPORT_SYSTEM_PROMPT;
  }

  if (
    text.includes("how does") ||
    text.includes("technical") ||
    text.includes("backend") ||
    text.includes("hosting")
  ) {
    return TECHNICAL_SYSTEM_PROMPT;
  }

  return BASE_SYSTEM_PROMPT;
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
    const systemPrompt = getSystemPrompt(message);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
       { role: "system", content: BASE_SYSTEM_PROMPT },
       { role: "system", content: systemPrompt },
        {
      role: "system",
      content: "All factual information must align with the predefined FAQ. Do not contradict pricing, timeline, services, or company structure stated there."
    },
    { 
  role: "system", 
  content: "Reference FAQ summary: Pricing depends on scope. Timeline usually 2–4 weeks. Fully remote agency. No single founder. Services include web, branding, marketing, AI."
},
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
