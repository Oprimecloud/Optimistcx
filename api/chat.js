import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are Gemini Studio's AI assistant. Help visitors with services and pricing." },
      { role: "user", content: message },
    ],
  });

  res.status(200).json({
    reply: completion.choices[0].message.content,
  });
}
