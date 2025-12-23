import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `
You are Opti, a professional AI sales and support assistant for Gemini Studio,
a digital agency that offers:

- Website design & development
- Branding & UI/UX
- SEO & online visibility
- E-commerce solutions & social media management
- AI & automation services
-Content Marketing & Paid Advertising 

Your goals:
1. Be friendly, confident, and concise
2. Understand the user's needs
3. Recommend the right service
4. Gently collect lead info when appropriate (name, email, project)
5. Never sound pushy or robotic
6. If user shows interest, ask:
   "Would you like me to connect you with our team?"

If the user is just chatting, answer helpfully.
If the user is serious, guide them toward becoming a lead.
          `,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply =
      response.output_text ||
      "Sorry, I didn’t quite get that. Can you rephrase?";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("CHAT API ERROR:", error);
    return res.status(500).json({ error: "AI response failed" });
  }
}
