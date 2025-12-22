document.addEventListener("DOMContentLoaded", () => {
  const trigger = document.getElementById("gemini-chat-trigger");
  const windowBox = document.getElementById("gemini-chat-window");
  const closeBtn = document.getElementById("gemini-chat-close");

  const messages = document.getElementById("gemini-messages");
  const input = document.getElementById("gemini-input");
  const sendBtn = document.getElementById("gemini-send");
  const typing = document.getElementById("gemini-typing");

  // Open chat
  trigger.onclick = () => {
    windowBox.style.display = "flex";
    trigger.style.display = "none";
  };

  // Close chat
  closeBtn.onclick = () => {
    windowBox.style.display = "none";
    trigger.style.display = "flex";
  };

  // Send message
  sendBtn.onclick = sendMessage;
  input.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
  });

  async function sendMessage() {
    const msg = input.value.trim();
    if (!msg) return;

    appendMessage(msg, "user");
    input.value = "";

    showTyping();

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });

    const data = await res.json();

    hideTyping();
    appendMessage(data.reply, "bot");
  }

  function appendMessage(text, sender) {
    const div = document.createElement("div");
    div.classList.add("message", sender === "user" ? "user-message" : "bot-message");
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() { typing.classList.remove("hidden"); }
  function hideTyping() { typing.classList.add("hidden"); }
});
