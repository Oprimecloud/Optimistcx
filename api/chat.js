import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.responses.create({
  prompt: {
    "id": "pmpt_694a7bb321448197b6cbdbc4aaa033dd03b76c7ac7bb175a",
    "version": "1"
  }
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // SYSTEM PROMPT — Hybrid personality for Gemini Studio Assistant
    const systemPrompt = `
You are Gemini Studio Assistant, an AI representative for Geministudio.agency.
Personality:
- Friendly, warm, polite
- Professional and confident
- Helpful and solution-focused
- Slightly persuasive in a natural way
- Never aggressive or pushy
- Encourage users to describe their project so you can help

Capabilities:
- Answer questions about web design, SEO, branding, digital growth, pricing, etc.
- Provide service information clearly
- Suggest solutions Gemini Studio can deliver
- Ask qualifying questions if the user seems interested
- Attempt to collect leads when appropriate

Lead Capture Rules:
- If the user mentions wanting a website, branding, SEO, project, pricing, hiring, or getting started:
  → Ask for their name, email, and a short project description.
- Once provided, return JSON: { leadCaptured: true, lead: { name, email, project } }

NEVER ask for budget directly.
NEVER be rude or too salesy.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini", // cheap + fast; upgradeable
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    const aiReply = completion.choices[0].message.content;

    // Lead extraction pattern
    let leadCaptured = false;
    let leadData = null;

    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const nameRegex = /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/;

    const email = message.match(emailRegex);
    const name = message.match(nameRegex);

    if (email) {
      leadCaptured = true;
      leadData = {
        name: name ? name[0] : "Unknown",
        email: email[0],
        project: message,
      };

      // Call Zoho Mail endpoint
      await fetch(`${process.env.SITE_URL}/api/send-lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData),
      });
    }

    return res.status(200).json({
      reply: aiReply,
      leadCaptured,
      lead: leadData || null,
    });
  } catch (err) {
    console.error("Chat Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
