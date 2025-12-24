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

// Save leads helper
async function saveToGoogleSheets(lead) {
  await fetch(process.env.GOOGLE_SHEETS_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });
}

// In-memory session store
let sessions = {};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sessionId = "default", type, value, message } = req.body;

  // Initialize session
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      state: "MENU",
      service: null,
      goal: null,
      lead: {},
    };
  }
  const session = sessions[sessionId];

  // RESET chat/session
  if (type === "reset") {
    sessions[sessionId] = {
      state: "MENU",
      service: null,
      goal: null,
      lead: {},
    };
    return res.json({ reply: "Chat has been reset. How can I help you today?" });
  }

  // ---------- SERVICE ----------
  if (type === "service") {
    session.service = value;
    session.state = "GOAL";
    return res.json({
      reply: `Nice 👍 What is your main goal with this project?`,
      showGoals: true,
    });
  }

  // ---------- GOAL ----------
  if (type === "goal") {
    session.goal = value;
    session.state = "LEAD";
    return res.json({
      reply: `Perfect. This is something we handle really well 🚀\nMay I have your **name**?`,
      showLead: true,
    });
  }

  // ---------- LEAD COLLECTION ----------
  if (session.state === "LEAD" && !session.lead.name) {
    session.lead.name = message;
    return res.json({ reply: "Thanks! What’s your **email address**?" });
  }

  if (session.state === "LEAD" && !session.lead.email) {
    session.lead.email = message;
    return res.json({ reply: "Please briefly describe your project." });
  }

  if (session.state === "LEAD" && !session.lead.project) {
    session.lead.project = message;
    session.state = "DONE";

    const lead = {
      name: session.lead.name,
      email: session.lead.email,
      service: session.service || "N/A",
      goal: session.goal || "N/A",
      project: session.lead.project,
    };

    console.log("🔥 NEW LEAD:", lead);

    try {
      await saveToGoogleSheets(lead);
    } catch (err) {
      console.error("Google Sheets save failed:", err);
    }

    // ✅ Ask if user wants to connect with live team
    return res.json({
      reply: `Thanks ${lead.name}! 🎉\nWe’ve received your details.\nWould you like me to connect you with our team now?`,
      showConnectTeam: true,
    });
  }

  // ---------- AI FALLBACK ----------
  if (!type) {
    try {
      const systemPrompt = `
You are GemBot 🤖, a professional AI sales and support assistant for Gemini Studio.

Your expertise:
- Website design & development
- Branding & UI/UX
- SEO & online visibility
- E-commerce solutions & social media management
- AI & automation services
- Content Marketing & Paid Advertising

Your goals:
1. Be friendly, confident, and concise
2. Detect FAQ questions and answer them accurately
3. Suggest relevant services dynamically based on user keywords
4. If the user expresses interest, pitch your service in a helpful, non-pushy way
5. Always sound professional and approachable
6. End sales messages with: "Would you like me to connect you with our team?" if relevant
7. If user is casual, chat naturally; if serious, guide toward lead capture
      `;

      const aiResponse = await client.responses.create({
        model: "gpt-4.1-mini",
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      });

      // Detect interest keywords to show goal menu
      let showGoals = false;
      const keywords = ["website", "branding", "seo", "social media", "ads", "e-commerce"];
      for (const k of keywords) {
        if (message.toLowerCase().includes(k)) {
          showGoals = true;
          break;
        }
      }

      return res.json({
        reply: aiResponse.output_text || "Can you clarify that?",
        showGoals,
      });

    } catch (err) {
      console.error("AI response error:", err);
      return res.status(500).json({ reply: "Oops! Something went wrong." });
    }
  }
}
