const trigger = document.getElementById("gemini-chat-trigger");
const windowBox = document.getElementById("gemini-chat-window");
const closeBtn = document.getElementById("gemini-chat-close");

const messages = document.getElementById("gemini-messages");
const input = document.getElementById("gemini-input");
const sendBtn = document.getElementById("gemini-send");

const typing = document.getElementById("gemini-typing");

// Open UI
trigger.onclick = () => {
  windowBox.style.display = "flex";
  trigger.style.display = "none";
};

// Close UI
closeBtn.onclick = () => {
  windowBox.style.display = "none";
  trigger.style.display = "flex";
};

// Add message to window
function addMessage(text, sender = "bot") {
  const div = document.createElement("div");
  div.classList.add("message", sender === "user" ? "user-message" : "bot-message");
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// Show typing indicator
function showTyping() {
  typing.classList.remove("hidden");
}

// Hide typing indicator
function hideTyping() {
  typing.classList.add("hidden");
}

// Send user message
sendBtn.onclick = async () => {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  showTyping();

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text }),
  });

  const data = await res.json();

  hideTyping();
  addMessage(data.reply, "bot");
};
