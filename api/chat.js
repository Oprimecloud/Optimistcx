import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ================= FAQ ================= */
const FAQS = [
  // Pricing & Payment
  {
    keywords: ["how much"],
    answer: "Our pricing depends on your project scope and requirements. I can connect you with our team to get an exact quote 💬 <br> just type [connect]"
  },
  {
    keywords: ["mode of payment", "how to pay"],
    answer: "Our payment options are flexible and tailored to your project requirements. <br>👉 Can I connect you with our team to discuss the best payment plan? if yes type [now]"
  },
  // Timeline
  {
    keywords: ["delivery", "how long"],
    answer: "Most projects are typically completed within 2–4 weeks, depending on scope and requirements."
  },

  // Services Overview
  // {
  //   keywords: ["service"],
  //   answer: "We offer web development, UI/UX design, branding, content marketing, SEO, social media management, paid ads."
    
  // },

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
    keywords: ["founder", "who founded"],
    answer: "Gemini Studio was built and is managed by a collective team of industry experts."
  },
  {
    keywords: ["leadership", "management"],
    answer: "Our leadership consists of specialists across technology, design, marketing, and AI."
  },
  {
    keywords: ["what is gemini studio", "about gemini studio"],
    answer: "Gemini Studio is a digital agency delivering modern technology and marketing solutions for growing businesses."
  },

  // Team & Experience
  {
    keywords: ["teams", "staff"],
    answer: "Our team includes skilled developers, designers, marketers, content creators."
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
  // {
  //   keywords: ["website", "web development"],
  //   answer: "We build modern, fast, scalable websites and web applications tailored to your business goals."
  // },
  // {
  //   keywords: ["branding", "logo", "identity"],
  //   answer: "We create strong brand identities including logos, visual systems, and brand guidelines."
  // },
  // {
  //   keywords: ["seo", "search engine"],
  //   answer: "Our SEO services help improve visibility, search rankings, and organic traffic."
  // },
  // {
  //   keywords: ["social media", "management", "content"],
  //   answer: "We manage social media accounts with strategic content, engagement, and growth-focused campaigns."
  // },

  // Process & Trust
  {
    keywords: ["process", "how you works"],
    answer: "Our process includes consultation, planning, execution, and delivery with clear communication at every stage."
  },
  {
    keywords: ["revision", "changes"],
    answer: "Yes, revisions are included to ensure the final result meets your expectations."
  },
  {
    keywords: ["help", "maintenance", "supports"],
    answer: "We provide ongoing support and maintenance even after project delivery. <br> To get started, simply type [now]."
  },
  // {
  //   keywords: ["portfolio", "previous work"],
  //   answer: "Yes, we can share samples of our previous work upon request."
  // },

  // Getting Started
  {
    keywords: ["start", "get started", "begin"],
    answer: "Getting started is easy 🚀 Just type [now] and I’ll connect you with our team."
  },
  {
    keywords: ["contact", "talk to human", "support"],
    answer: "I can connect you directly with a Gemini Studio team member 💬 Just type [now]."
  },
  {
    keywords: ["consultation", "meeting", "call"],
    answer: "We offer free consultations to understand your goals and recommend the best solution. <br>Type [now] to get connected."
  }
];

/* ============ HUMAN HANDOFF ============ */
const HUMAN_KEYWORDS = [
"human", "agent", "connect", "representative", "now"
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
- Stay on topic
- Encourage next steps (brief, discovery call, live chat), politely tell them: “We can connect you to a live chat. Just type [now] and we’ll show you.”

FACTS ABOUT

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
- Stay on topic
- Use friendly persuasion
- Avoid pressure or urgency lies but sale.
- Encourage next steps (brief, discovery call, live chat), politely tell them: “We can connect you to a live chat. Just type [now] and we’ll show you.”


ESCALATION:
If interest is high or low, suggest speaking with a human team member.
`;

const SUPPORT_SYSTEM_PROMPT = `
You are a customer support assistant focused on clarity and trust.

GOAL:
Help users feel confident, informed, and supported.

RULES:
- Reassure politely
- Explain things simply
- Reduce confusion
- Stay on topic
- Encourage next steps (brief, discovery call, live chat), politely tell them: “We can connect you to a live chat. Just type [now] and we’ll show you.”
- Never upsell aggressively
`;

const TECHNICAL_SYSTEM_PROMPT = `
ROLE & COMMUNICATION STYLE

You explain technical topics in a simple, non-technical, client-friendly way.

COMMUNICATION RULES

Do not use code or technical jargon

use simple language

Stay on topic

our services are " web development, UI/UX design, branding, content marketing, SEO, social media management, paid ads."

Do not mention frameworks, tools, or programming languages unless the client specifically asks and you must limit to one or two well-known examples

Use simple analogies that everyday people understand

Focus on results and benefits, not how things are built

Keep responses clear, calm, and easy to follow

PORTFOLIO & PROOF

When clients ask about portfolio or past work, explain it in simple terms

Do not list technical details If needed, politely tell them: “We can share samples of our previous work. Just type [now] and we’ll show you.”

GOAL

Help clients understand, feel confident, and move forward without overwhelming them.
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
    text.includes("website") ||
    text.includes("service") ||
    text.includes("web development") ||
    text.includes("logo design") ||
    text.includes("web design") ||
    text.includes("branding") ||
    text.includes("paid ads") ||
    text.includes("seo") ||
    text.includes("social media management") ||
    text.includes("content marketing") ||
    text.includes("backend") ||
    text.includes("hosting") ||
    text.includes("portfolio") ||
    text.includes("previous work")
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
