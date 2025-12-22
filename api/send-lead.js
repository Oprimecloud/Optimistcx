import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, project } = req.body;

  if (!name || !email || !project) {
    return res.status(400).json({ error: "Incomplete lead data" });
  }

  try {
    // Create transporter for Zoho Mail
    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.ZOHO_EMAIL,       // your Zoho email
        pass: process.env.ZOHO_PASSWORD,    // Zoho App Password
      },
    });

    // Email content
    const mailOptions = {
      from: `"Gemini Studio Assistant" <${process.env.ZOHO_EMAIL}>`,
      to: process.env.ZOHO_EMAIL,  // send to your own inbox
      subject: "🔥 New Lead from Gemini Studio Website",
      html: `
        <h2>New Lead Captured</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Project:</strong> ${project}</p>
        <br/>
        <p>Respond quickly to convert this lead! 🚀</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Zoho Mail Error:", error);
    return res.status(500).json({ error: "Failed to send lead email" });
  }
}
