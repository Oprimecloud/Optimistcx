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

// ✅ Helper function (TOP OF FILE)
async function saveToGoogleSheets(lead) {
  await fetch(process.env.GOOGLE_SHEETS_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });
}

let sessions = {}; // simple in-memory session store

export default async function handler(req, res) {
  const { sessionId = "default", type, value, message } = req.body;

  if (type === "service") {
  session.state = "QUALIFYING";
  session.service = value;
  session.lead = {};
  session.goal = null;

  return res.json({
    reply: `Nice 👍 What is your main goal with this project?`,
    showGoals: true
  });
  }

  const session = sessions[sessionId];

  // --- MENU SELECTION ---
  if (type === "service") {
    session.state = "SERVICE_SELECTED";
    session.service = value;

    return res.json({
      reply: `Great choice! 👌  
Let me ask you a few quick questions about **${value}**.

What is this project for? (business, personal brand, startup, etc.)`,
    });
  }

  // --- QUALIFYING ---
  if (session.state === "SERVICE_SELECTED") {
    session.state = "QUALIFYING";
    session.projectType = message;

    return res.json({
      reply: `Nice 👍  
What is your main goal with this project? (sales, visibility, branding, leads)`,
    });
  }

  if (session.state === "QUALIFYING") {
    session.goal = message;
    session.state = "LEAD_COLLECTION";

    return res.json({
      reply: `Perfect. This is something we handle really well at Gemini Studio 🚀  

To continue, may I have your **name**?`,
    });
  }

  // --- LEAD COLLECTION ---
  if (session.state === "LEAD_COLLECTION" && !session.lead.name) {
    session.lead.name = message;
    return res.json({ reply: "Thanks! What’s your **email address**?" });
  }

  if (session.state === "LEAD_COLLECTION" && !session.lead.email) {
    session.lead.email = message;
    return res.json({ reply: "Great 👍 Please briefly describe your project." });
  }

  if (session.state === "LEAD_COLLECTION" && !session.lead.project) {
    session.lead.project = message;
    session.state = "DONE";

    const leadData = {
      name: session.lead.name,
      email: session.lead.email,
      service: session.service,
      project: session.lead.project,
      goal: session.goal,
    };

    console.log("🔥 NEW LEAD:", leadData);

    // ✅ SAVE TO GOOGLE SHEETS HERE
    try {
      await saveToGoogleSheets(leadData);
    } catch (err) {
      console.error("Google Sheets save failed:", err);
    }

    return res.json({
      reply: `Thanks ${session.lead.name}! 🎉  
We’ve received your details.

Would you like me to connect you with our team now?`,
    });
  }

  // --- FALLBACK (AI FAQ / SUPPORT) ---
  const aiResponse = await client.responses.create({
    model: "gpt-4.1-mini",
    input: message,
  });

  return res.json({
    reply: aiResponse.output_text || "Can you clarify that for me?",
  });
}
