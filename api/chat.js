

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const trigger = document.getElementById("gemini-chat-trigger");
  const windowBox = document.getElementById("gemini-chat-window");
  const closeBtn = document.getElementById("gemini-chat-close");

  const messages = document.getElementById("gemini-messages");
  const input = document.getElementById("gemini-input");
  const sendBtn = document.getElementById("gemini-send");
  const typing = document.getElementById("gemini-typing");

  // Open chat
  trigger.addEventListener("click", () => {
    windowBox.style.display = "flex";
    trigger.style.display = "none";
  });

  // Close chat
  closeBtn.addEventListener("click", () => {
    windowBox.style.display = "none";
    trigger.style.display = "flex";
  });

  // Send message on click or Enter key
  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
  });

  // Append message to chat
  function appendMessage(text, sender) {
    const div = document.createElement("div");
    div.classList.add("message", sender === "user" ? "user-message" : "bot-message");
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  // Show typing indicator
  function showTyping() { typing.classList.remove("hidden"); }

  // Hide typing indicator
  function hideTyping() { typing.classList.add("hidden"); }

  // Send user message to backend
  async function sendMessage() {
    const msg = input.value.trim();
    if (!msg) return;

    appendMessage(msg, "user");
    input.value = "";

    showTyping();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });

      const data = await res.json();

      hideTyping();
      appendMessage(data.reply, "bot");
    } catch (err) {
      hideTyping();
      appendMessage("Oops! Something went wrong. Please try again.", "bot");
      console.error(err);
    }
  }
});
