
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

// Notify team helper (for live connect)
async function notifyTeam(lead, sessionId) {
  const payload = {
    sessionId,
    lead,
    timestamp: new Date().toISOString(),
  };

  if (process.env.TEAM_WEBHOOK) {
    await fetch(process.env.TEAM_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
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

  // ---------- CONNECT TO TEAM ----------
  // Frontend should call with type: "connect" to trigger live connect
  if (type === "connect") {
    // Use the session lead if available
    const lead = {
      name: session.lead.name || "Unknown",
      email: session.lead.email || "Unknown",
      service: session.service || "N/A",
      goal: session.goal || "N/A",
      project: session.lead.project || "N/A",
    };

    try {
      // notify team webhook so a human can join the session
      await notifyTeam(lead, sessionId);
    } catch (err) {
      console.error("Team notify failed:", err);
      return res.status(500).json({ reply: "Failed to notify the team. Please try again." });
    }

    // Provide a live URL the frontend can open (if your system supports it)
    const liveUrl = `${process.env.SITE_URL || ""}/live?sessionId=${encodeURIComponent(sessionId)}`;

    return res.json({
      reply: "Connecting you to our team now. Please wait a moment — a team member will join shortly.",
      connected: true,
      liveUrl,
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

  // If no branch matched
  return res.status(400).json({ error: "Invalid request" });
}

