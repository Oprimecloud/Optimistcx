import crypto from "crypto";

export default function handler(req, res) {
  const sessionId = crypto.randomUUID();

  res.status(200).json({
    sessionId
  });
}
