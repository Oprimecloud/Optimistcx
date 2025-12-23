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
You are Gemini Studio’s AI assistant.
Gemini Studio is a digital agency that offers:
- Website design & development
- Branding & visual identity
- SEO & digital marketing

Your goal:
- Help visitors understand services
- Answer questions clearly
- Gently qualify leads
- Ask for contact info when appropriate
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
