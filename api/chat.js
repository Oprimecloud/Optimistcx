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

//name validation
function isValidName(name) {
  return /^[A-Za-z\s]{2,50}$/.test(name.trim());
}

//email validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

//project validation
function isValidProject(text) {
  if (!text) return false;

  const trimmed = text.trim();

  if (trimmed.length < 10) return false;        // too short
  if (trimmed.length > 500) return false;       // too long
  if (!/[a-zA-Z]/.test(trimmed)) return false;  // must contain letters

  return true;
}


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

  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      state: "MENU",
      service: null,
      goal: null,
      lead: {},
      connected: false,
    };
  }

  const session = sessions[sessionId];

  // ---------- RESET ----------
  if (type === "reset") {
    sessions[sessionId] = {
      state: "MENU",
      service: null,
      goal: null,
      lead: {},
      connected: false,
    };
    return res.json({ reply: "Chat has been deleted. How can I help you today?" });
  }

  // ---------- SERVICE ----------
  if (type === "service") {
    session.service = value;
    session.state = "GOAL";
    return res.json({
      reply: "Nice 👍 What is your main goal with this project?",
      showGoals: true,
    });
  }

  // ---------- GOAL ----------
  if (type === "goal") {
    session.goal = value;
    session.state = "LEAD";
    return res.json({
      reply: "Perfect 🚀 May I have your **name**?",
    });
  }

  // ---------- LEAD ----------
  if (session.state === "LEAD" && !session.lead.name) {
  if (!isValidName(message)) {
    return res.json({
      reply: "Please enter a valid name (letters only, e.g. John or Mary Jane).",
    });
  }

  session.lead.name = message.trim();
  return res.json({ reply: "Thanks! What’s your **email address**?" });
}

 if (session.state === "LEAD" && !session.lead.email) {
  if (!isValidEmail(message)) {
    return res.json({
      reply: "Hmm 🤔 That doesn’t look like a valid email. Can you double check and send it again?",
    });
  }

  session.lead.email = message;
  return res.json({ reply: "Great! Please briefly describe your project." });
}


 if (session.state === "LEAD" && !session.lead.project) {
  if (!isValidProject(message)) {
    return res.json({
      reply:
        "Please describe your project in a bit more detail (at least a sentence or more 😊).",
    });
  }

  session.lead.project = message.trim();
  session.state = "DONE";

  const lead = {
    name: session.lead.name,
    email: session.lead.email,
    service: session.service || "N/A",
    goal: session.goal || "N/A",
    project: session.lead.project,
  };

  try {
    await saveToGoogleSheets(lead);
  } catch (err) {
    console.error("Google Sheets save failed:", err);
  }

  return res.json({
    reply: `Thanks ${lead.name}! 🎉\nWould you like me to connect you with our team ?`,
    showConnectTeam: true,
  });
}


  // ---------- CONNECT TO TEAM (WhatsApp) ----------
  if (type === "connect") {
    if (session.connected) {
      return res.json({
        reply: "You’re already connected with our team 😊",
      });
    }

    session.connected = true;

    const lead = {
      name: session.lead.name || "Unknown",
      email: session.lead.email || "Unknown",
      service: session.service || "N/A",
      goal: session.goal || "N/A",
      project: session.lead.project || "N/A",
    };

    const whatsappMessage = `New Chat Request 🔔
Name: ${lead.name}
Email: ${lead.email}
Service: ${lead.service}
Goal: ${lead.goal}

Project:
${lead.project}

Session ID: ${sessionId}`;

    const whatsappUrl = `https://wa.me/${process.env.WHATSAPP_NUMBER}?text=${encodeURIComponent(
      whatsappMessage
    )}`;

    return res.json({
      reply: "You’re being connected to our team 💬",
      connected: true,
      whatsappUrl,
    });
  }

  // ---------- AI FALLBACK ----------
  if (typeof type === "undefined" && message) {
    try {
      const aiResponse = await client.responses.create({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
               `
You are GemBot 🤖, a professional AI sales and support assistant for Gemini Studio.

Your expertise:
•⁠  ⁠Website design & development
•⁠  ⁠Branding & UI/UX
•⁠  ⁠SEO & online visibility
•⁠  ⁠E-commerce solutions & social media management
•⁠  ⁠AI & automation services
•⁠  ⁠Content Marketing & Paid Advertising

Your goals:
1.⁠ ⁠Be friendly, confident, and concise
2.⁠ ⁠Detect FAQ questions and answer them accurately
3.⁠ ⁠Suggest relevant services dynamically based on user keywords
4.⁠ ⁠If the user expresses interest, pitch your service in a helpful, non-pushy way
5.⁠ ⁠Always sound professional and approachable
6.⁠ ⁠End sales messages with: "Would you like me to connect you with our team?" if relevant and show the connect whatsaap button
7.⁠ ⁠If user is casual, chat naturally; if serious, guide toward lead capture
      `

,
              
          },
          { role: "user", content: message },
        ],
      });

      const keywords = [
        "website",
        "branding",
        "seo",
        "social media",
        "ads",
        "e-commerce",
      ];
      const showGoals = keywords.some((k) =>
        message.toLowerCase().includes(k)
      );

      return res.json({
        reply: aiResponse.output_text || "Can you clarify that?",
        showGoals,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ reply: "AI error occurred." });
    }
  }

  return res.status(400).json({ error: "Invalid request" });
}
