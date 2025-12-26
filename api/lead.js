export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    name,
    email,
    service,
    subService,
    project,
    sessionId,
    source = "Website Chatbot"
  } = req.body;

  // 🔒 VALIDATION
  if (!name || name.length < 2) {
    return res.status(400).json({ error: "Invalid name, enter a valid name e.g. John Doe" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email, enter a valid email address e.g. john@example.com" });
  }

  if (!project || project.length < 10) {
    return res.status(400).json({ error: "Project description too short" });
  }

  // 🔥 INTENT SCORE LOGIC
  let intentScore = 0;
  if (service) intentScore += 2;
  if (subService) intentScore += 2;
  if (project.length > 20) intentScore += 3;
  intentScore += 3; // lead submission bonus

  let leadLevel = "COLD ❄️";
  if (intentScore >= 8) leadLevel = "HOT 🚀";
  else if (intentScore >= 5) leadLevel = "WARM 🔥";

  // 📤 SEND TO GOOGLE SHEETS
  const payload = {
    name,
    email,
    service,
    subService,
    project,
    intentScore,
    leadLevel,
    sessionId,
    whatsappClicked: false,
    followUpStage: "NEW",
    lastFollowUpAt: new Date().toISOString(),
    source
  };

  try {
    await fetch(process.env.GOOGLE_SHEET_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // 📲 WHATSAPP MESSAGE
    const whatsappMessage = `
🔥 New Chat Request

Name: ${name}
Email: ${email}
Service: ${service}
Sub-Service: ${subService}
Goal: null

Project:
${project}

Intent Score: ${intentScore}
Lead Level: ${leadLevel}
Session ID: ${sessionId}
    `.trim();

    res.status(200).json({
      success: true,
      intentScore,
      leadLevel,
      whatsappLink: `https://wa.me/${process.env.WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save lead" });
  }
}
