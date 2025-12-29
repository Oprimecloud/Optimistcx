// // ================================
// // CHATBOT STATE (DO NOT TOUCH)
// // ================================

// const state = {
//   sessionId: null,
//   service: null,
//   subService: null,
//   leadCaptured: false,
//   whatsappLink: null,

//   awaiting: null, // "name" | "email" | "project" | null
//   tempLead: {}
// };

// // ================================
// // SESSION INIT
// // ================================

// async function initSession() {
//   const res = await fetch("/api/session");
//   const data = await res.json();
//   state.sessionId = data.sessionId;
// }

// initSession();

// // ================================
// // SERVICES & SUB-SERVICES
// // ================================

// const SERVICES = {
//   "Web Development": [
//     "Business Website Development",
//     "E-commerce Development",
//     "Landing Page Design",
//     "Website Redesign",
//     "Web App Development",
//     "CMS (WordPress / Headless CMS)",
//     "Website Maintenance & Support",
//     "Speed & Performance Optimization"
//   ],
//   "Branding": [
//     "Brand Identity Design",
//     "Logo Design",
//     "Brand Strategy",
//     "Brand Guidelines",
//     "Visual Identity Systems",
//     "Rebranding Services",
//     "Brand Naming & Messaging"
//   ],
//   "SEO": [
//     "SEO Audit",
//     "On-Page SEO",
//     "Technical SEO",
//     "Keyword Research",
//     "Local SEO",
//     "E-commerce SEO",
//     "Content SEO",
//     "Link Building"
//   ],
//   "Content Creation": [
//     "Website Copywriting",
//     "Blog & Article Writing",
//     "Social Media Content",
//     "Video Scripts & Reels",
//     "Graphic Design Content",
//     "Email Marketing Content",
//     "Product Descriptions"
//   ],
//   "Social Media Management": [
//     "Account Setup & Optimization",
//     "Content Planning & Scheduling",
//     "Daily Posting & Engagement",
//     "Community Management",
//     "Influencer Collaboration",
//     "Analytics & Reporting",
//     "Social Media Growth Strategy"
//   ],
//   "PPC Ads": [
//     "Google Ads Management",
//     "Facebook & Instagram Ads",
//     "TikTok Ads",
//     "YouTube Ads",
//     "Ad Copywriting",
//     "Conversion Tracking",
//     "A/B Testing",
//     "Campaign Optimization"
//   ]
// };

// // ================================
// // MENU RENDERING
// // ================================

// function renderMenu() {
//   const menu = document.getElementById("menu");
//   menu.style.display = "block";
//   menu.innerHTML = "<strong>Select a service:</strong>";

//   Object.keys(SERVICES).forEach(service => {
//     const btn = document.createElement("button");
//     btn.textContent = service;
//     btn.onclick = () => selectService(service);
//     menu.appendChild(btn);
//   });
// }

// renderMenu();

// function selectService(service) {
//   state.service = service;
//   const menu = document.getElementById("menu");
//   menu.innerHTML = `<strong>${service} – Select a sub-service:</strong>`;

//   SERVICES[service].forEach(sub => {
//     const btn = document.createElement("button");
//     btn.textContent = sub;
//     btn.onclick = () => selectSubService(sub);
//     menu.appendChild(btn);
//   });
// }

// function selectSubService(sub) {
//   state.subService = sub;
//   document.getElementById("menu").style.display = "none";
//   askForLead();
// }

// // ================================
// // LEAD FLOW (CORRECT)
// // ================================

// function askForLead() {
//   state.awaiting = "name";
//   state.tempLead = {};
//   addBotMessage("Please enter your name:");
//   unlockChat();
// }

// // ================================
// // INPUT HANDLING
// // ================================

// document.getElementById("send-btn").onclick = () => {
//   const input = document.getElementById("chat-input");
//   const value = input.value.trim();
//   if (!value) return;

//   input.value = "";
//   addUserMessage(value);
//   handleUserInput(value);
// };

// function handleUserInput(value) {
//   // NAME
//   if (state.awaiting === "name") {
//     if (value.length < 2) {
//       return addBotMessage("Please enter a valid name.");
//     }
//     state.tempLead.name = value;
//     state.awaiting = "email";
//     return addBotMessage("Great 😊 What’s your email address?");
//   }

//   // EMAIL
//   if (state.awaiting === "email") {
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
//       return addBotMessage("That email doesn’t look valid. Please try again.");
//     }
//     state.tempLead.email = value;
//     state.awaiting = "project";
//     return addBotMessage("Please describe your project.");
//   }

//   // PROJECT
//   if (state.awaiting === "project") {
//     if (value.length < 10) {
//       return addBotMessage("Please add more detail about your project.");
//     }
//     state.tempLead.project = value;
//     state.awaiting = null;

//     return submitLead(
//       state.tempLead.name,
//       state.tempLead.email,
//       state.tempLead.project
//     );
//   }

//   // NORMAL CHAT
//   if (state.leadCaptured) {
//     return sendMessage(value);
//   }

//   addBotMessage("Please select a service from the menu above.");
// }

// // ================================
// // SUBMIT LEAD
// // ================================

// async function submitLead(name, email, project) {
//   const res = await fetch("/api/lead", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       name,
//       email,
//       service: state.service,
//       subService: state.subService,
//       project,
//       sessionId: state.sessionId
//     })
//   });

//   const data = await res.json();

//   state.leadCaptured = true;
//   state.whatsappLink = data.whatsappLink;

//   addBotMessage("✅ Thanks! You can now chat with me.");
// }

// // ================================
// // CHAT → AI / FAQ / HUMAN
// // ================================

// async function sendMessage(msg) {
//   const res = await fetch("/api/chat", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       message: msg,
//       leadCaptured: state.leadCaptured
//     })
//   });

//   const data = await res.json();
//   addBotMessage(data.reply);

//   if (data.showWhatsapp && state.whatsappLink) {
//     showWhatsappButton();
//   }
// }

// // ================================
// // UI HELPERS
// // ================================

// function unlockChat() {
//   document.getElementById("input-area").style.display = "flex";
// }

// function addBotMessage(text) {
//   document.getElementById("chat-window").innerHTML +=
//     `<div class="bot">${text}</div>`;
// }

// function addUserMessage(text) {
//   document.getElementById("chat-window").innerHTML +=
//     `<div class="user">${text}</div>`;
// }

// function showWhatsappButton() {
//   const btn = document.createElement("a");
//   btn.href = state.whatsappLink;
//   btn.target = "_blank";
//   btn.className = "whatsapp-btn";
//   btn.textContent = "💬 Chat on WhatsApp";
//   document.getElementById("chat-window").appendChild(btn);
// }


// ================================
// STATE (PERSISTENT)
// ================================

const savedState = JSON.parse(localStorage.getItem("chatbotState")) || {};

const state = {
  soundEnabled: savedState.soundEnabled || false,
  soundPrompted: savedState.soundPrompted || false,
  welcomeShown: savedState.welcomeShown || false,
  sessionId: savedState.sessionId || null,
  service: savedState.service || null,
  subService: savedState.subService || null,
  leadCaptured: savedState.leadCaptured || false,
  whatsappLink: savedState.whatsappLink || null,
  

  awaiting: null,
  tempLead: {},

  intentScore: savedState.intentScore || 0,
  followUpStage: savedState.followUpStage || "new",

  // 🆕 POST-LEAD DECISION STATE
  postLeadChoice: savedState.postLeadChoice || null, // "human" | "bot" | null

  leadSubmitting: false
};

function saveState() {
  localStorage.setItem("chatbotState", JSON.stringify(state));
}

// ================================
// SESSION INIT
// ================================

async function initSession() {
  if (state.sessionId) return;

  const res = await fetch("/api/session");
  const data = await res.json();
  state.sessionId = data.sessionId;
  saveState();
}

initSession();

// ================================
// SERVICES
// ================================

const SERVICES = {
  "Web Development": [
    "Business Website Development",
    "E-commerce Development",
    "Landing Page Design",
    "Website Redesign",
    "Web App Development",
    "CMS (WordPress / Headless CMS)",
    "Website Maintenance & Support",
    "Speed & Performance Optimization"
  ],
  "Branding": [
    "Brand Identity Design",
    "Logo Design",
    "Brand Strategy",
    "Brand Guidelines",
    "Visual Identity Systems",
    "Rebranding Services",
    "Brand Naming & Messaging"
  ],
  "SEO": [
    "SEO Audit",
    "On-Page SEO",
    "Technical SEO",
    "Keyword Research",
    "Local SEO",
    "E-commerce SEO",
    "Content SEO",
    "Link Building"
  ],
  "Content Creation": [
    "Website Copywriting",
    "Blog & Article Writing",
    "Social Media Content",
    "Video Scripts & Reels",
    "Graphic Design Content",
    "Email Marketing Content",
    "Product Descriptions"
  ],
  "Social Media Management": [
    "Account Setup & Optimization",
    "Content Planning & Scheduling",
    "Daily Posting & Engagement",
    "Community Management",
    "Influencer Collaboration",
    "Analytics & Reporting",
    "Social Media Growth Strategy"
  ],
  "PPC Ads": [
    "Google Ads Management",
    "Facebook & Instagram Ads",
    "TikTok Ads",
    "YouTube Ads",
    "Ad Copywriting",
    "Conversion Tracking",
    "A/B Testing",
    "Campaign Optimization"
  ]
};


// ================================
// MENU RENDERING
// ================================

function renderMenu() {
  const menu = document.getElementById("menu");

  // 🔄 Reset menu state
  menu.style.display = "flex";
  menu.className = "";

  // 🧭 Progress hint
  menu.innerHTML = `<strong>select a service to get started</strong>`;

  Object.keys(SERVICES).forEach(service => {
    const btn = document.createElement("button");
    btn.textContent = service;
    btn.onclick = () => selectService(service);
    menu.appendChild(btn);
  });
}

renderMenu();

// function renderMenu() {
//   if (state.leadCaptured) return; // 🚫 STOP menu forever after lead

//   const menu = document.getElementById("menu");

//   menu.style.display = "flex";
//   menu.className = "";
//   menu.innerHTML = `<strong>Select a service</strong>`;

//   Object.keys(SERVICES).forEach(service => {
//     const btn = document.createElement("button");
//     btn.textContent = service;
//     btn.onclick = () => selectService(service);
//     menu.appendChild(btn);
//   });
// }


// ================================
// SERVICE SELECTION
// ================================

function selectService(service) {
  state.service = service;

  const menu = document.getElementById("menu");

  // ❗ Do NOT lock menu here
  menu.classList.remove("menu-locked", "menu-slide-out");
  menu.classList.add("menu-slide-in");

  menu.innerHTML = `
    <button class="menu-back">← Back</button>
    <strong>${service} – Select a sub-service</strong>
  `;

  // ⬅️ Back button
  menu.querySelector(".menu-back").onclick = () => {
    menu.classList.remove("menu-slide-in");
    menu.classList.add("menu-slide-out");

    setTimeout(renderMenu, 200);
  };

  SERVICES[service].forEach(sub => {
    const btn = document.createElement("button");
    btn.textContent = sub;
    btn.onclick = () => selectSubService(sub);
    menu.appendChild(btn);
  });
}

// ================================
// SUB-SERVICE SELECTION
// ================================

function selectSubService(sub) {
  state.subService = sub;

  const menu = document.getElementById("menu");

  // 🔒 Lock menu ONLY after final selection
  menu.classList.add("menu-locked", "menu-slide-out");

  setTimeout(() => {
    menu.style.display = "none";
    askForLead(); // Lead flow starts
  }, 200);
}



// ================================
// LEAD FLOW
// ================================

function askForLead() {
  if (state.leadCaptured) return unlockChat();

  state.awaiting = "name";
  addBotMessage("Please enter your name:");
  unlockChat();
}

function calculateIntentScore(text) {
  const keywords = ["price", "cost", "start", "timeline", "urgent", "hire"];
  keywords.forEach(k => {
    if (text.toLowerCase().includes(k)) state.intentScore += 2;
  });
}

const humanKeywords = ["human", "agent", "connect", "representative", "support", "now"];

// ================================
// INPUT HANDLING
// ================================

document.getElementById("send-btn").onclick = handleSend;

function handleSend() {
  const input = document.getElementById("chat-input");
  const value = input.value.trim();
  if (!value) return;

  input.value = "";
  addUserMessage(value);
  handleUserInput(value);
}

function handleUserInput(value) {
  calculateIntentScore(value);
  saveState();

//   if (state.postLeadChoice === "human") {
//   return addBotMessage(
//     "You’re currently connecting with our team. Click “Continue chatting with bot” to come back 😊"
//   );
// }


  if (state.awaiting === "name") {
    if (value.length < 2) return addBotMessage("Please enter a valid name.");
    state.tempLead.name = value;
    state.awaiting = "email";
    return addBotMessage("Great 😊 What’s your email address?");
  }

  if (state.awaiting === "email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return addBotMessage("That email doesn’t look valid. Please try again.");
    state.tempLead.email = value;
    state.awaiting = "project";
    return addBotMessage("Describe your project.");
  }

  if (state.awaiting === "project") {
    if (value.length < 10)
      return addBotMessage("Please give more details.");

    state.tempLead.project = value;
    state.awaiting = null;
    return submitLead();
  }

// ================================
// KEYWORD → HUMAN HANDOFF (FRONTEND OVERRIDE)
// ================================

if (
  state.leadCaptured &&
  humanKeywords.some(k => value.toLowerCase().includes(k))
) {
  // prevent backend AI reply
  state.postLeadChoice = "human";
  saveState();

  addBotMessage("Sure 😊 You can connect with our team below.");
  disableChat();
  showWhatsappButton();
  showBackToBotButton();
  return;
}
// ================================
// ⛔ Block bot replies if user is in HUMAN mode
if (state.leadCaptured && state.postLeadChoice === "human") {
  addBotMessage(
    "You’re currently chatting with our team 😊 Click below to return to the bot."
  );
  showBackToBotButton();
  return;
}

// 🤖 Continue normal bot chat
if (state.leadCaptured) return sendMessage(value);

  addBotMessage("please select a service to continue!!!");
}

// ================================
// SUBMIT LEAD (SAFE)
// ================================

async function submitLead() {
  if (state.leadSubmitting || state.leadCaptured) return;
  state.leadSubmitting = true;

  showTyping();

  const res = await fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...state.tempLead,
      service: state.service,
      subService: state.subService,
      sessionId: state.sessionId,
      intentScore: state.intentScore,
      followUpStage: state.followUpStage
    })
  });

  const data = await res.json();

  hideTyping();

  state.leadCaptured = true;
  state.whatsappLink = data.whatsappLink;
  saveState();

  addBotMessage("✅ Thanks! You can now chat with me.");
  showPostLeadOptions();

}
// POST-LEAD OPTIONS UI (ADD THIS FUNCTION)

function showPostLeadOptions() {
  const container = document.createElement("div");
  container.className = "post-lead-options";

  const humanBtn = document.createElement("button");
  humanBtn.textContent = "💬 Chat with Human";
  humanBtn.onclick = chooseHuman;

  const botBtn = document.createElement("button");
  botBtn.textContent = "🤖 Continue with Bot";
  botBtn.onclick = chooseBot;

  container.appendChild(humanBtn);
  container.appendChild(botBtn);

  document.getElementById("chat-window").appendChild(container);
}

//BUTTON ACTIONS (ADD THESE FUNCTIONS)
function chooseBot() {
  state.postLeadChoice = "bot";
  saveState();

  removeHumanUI();   // 👈 remove WhatsApp + back button
  showBotUI();       // 👈 restore chat input

  enableChat();
  addBotMessage("Great! I’m here to help 😊");
}


function chooseHuman() {
  state.postLeadChoice = "human";
  saveState();

  hideBotUI();          // 👈 hide bot UI
  removeHumanUI();      // 👈 safety cleanup

  addBotMessage("Connecting you with our team 👇");
  showWhatsappButton();
  showBackToBotButton();
}

// DISABLE CHAT INPUT (ADD THIS FUNCTION)
function disableChat() {
  document.getElementById("chat-input").disabled = true;
  document.getElementById("send-btn").disabled = true;
}

// ================================
// CHAT
// ================================

async function sendMessage(msg) {
  showTyping();

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: msg })
  });

  const data = await res.json();
  hideTyping();

  addBotMessage(data.reply);

  if (data.showWhatsapp && state.whatsappLink) {
    state.followUpStage = "whatsapp_clicked";
    saveState();
    showWhatsappButton();
  }
}

// ================================
// UI HELPERS
// ================================
function hideBotUI() {
  document.getElementById("input-area").style.display = "none";
}

function showBotUI() {
  document.getElementById("input-area").style.display = "flex";
}

function removeHumanUI() {
  document.querySelectorAll(".whatsapp-btn, .back-to-bot-btn").forEach(el => el.remove());
}

function unlockChat() {
  document.getElementById("input-area").style.display = "flex";
}

function scrollToBottom() {
  const chatWindow = document.getElementById("chat-window");
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addBotMessage(text) {
  const chat = document.getElementById("chat-window");
  chat.innerHTML += `<div class="bot">${text}</div>`;
  scrollToBottom();
  // playNotificationSound(); // 🔔 bot reply sound modified
  showUnreadBadge(); // 🔴 NEW
}


function addUserMessage(text) {
  const chat = document.getElementById("chat-window");
  chat.innerHTML += `<div class="user">${text}</div>`;
  scrollToBottom();

   playNotificationSound(); // 🔔 user message sound modified
}

function showTyping() {
  document.getElementById("typing-indicator").style.display = "block";
  scrollToBottom();
}

function hideTyping() {
  document.getElementById("typing-indicator").style.display = "none";
  scrollToBottom();
}


function showWelcomeBack() {
  addBotMessage("👋 Welcome back — let’s continue from where you stopped 😊");
}

function getTimeGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "☀️ Good morning";
  if (hour < 18) return "🌤️ Good afternoon";
  return "🌙 Good evening";
}


function showWhatsappButton() {
  if (document.querySelector(".whatsapp-btn")) return;

  const btn = document.createElement("a");
  btn.href = state.whatsappLink;
  btn.target = "_blank";
  btn.className = "whatsapp-btn";
  btn.textContent = "💬 Live Chat";
  document.getElementById("chat-window").appendChild(btn);
}


function enableChat() {
  document.getElementById("chat-input").disabled = false;
  document.getElementById("send-btn").disabled = false;
}

function showBackToBotButton() {
  if (document.querySelector(".back-to-bot-btn")) return;

  const btn = document.createElement("button");
  btn.className = "back-to-bot-btn";
  btn.textContent = "← Continue chatting with bot";
  btn.onclick = returnToBot;

  document.getElementById("chat-window").appendChild(btn);
}


function returnToBot() {
  state.postLeadChoice = "bot";
  saveState();

  removeHumanUI();
  showBotUI();
  enableChat();

  addBotMessage("No problem 😊 I’m back. How can I help?");
}

//SOUND HELPER FUNCTIONS modified
const notificationSound = new Audio("/sounds/notify.mp3");

function playNotificationSound() {
  if (!state.soundEnabled) return;

  // Reset so it can play repeatedly modified
  notificationSound.currentTime = 0;
  notificationSound.play().catch(() => {});
}
function showSoundOptIn() {
  const container = document.createElement("div");
  container.className = "sound-optin";

  container.innerHTML = `
    <p>🔔 Turn on chat sound effects?</p>
    <button id="sound-yes">Yes</button>
    <button id="sound-no">No</button>
  `;

  document.getElementById("chat-window").appendChild(container);

  document.getElementById("sound-yes").onclick = () => {
    state.soundEnabled = true;
    state.soundPrompted = true;
    saveState();

    playNotificationSound();
    container.remove();
    addBotMessage("Got it! effects are now ON. 🔊");
  };

  document.getElementById("sound-no").onclick = () => {
    state.soundEnabled = false;
    state.soundPrompted = true;
    saveState();

    container.remove();
    addBotMessage("No problem! We'll keep things quiet. 🔇");
  };
}
//JS HELPERS
function showUnreadBadge() {
  const badge = document.getElementById("unread-badge");
  const widget = document.getElementById("chatbot-widget");

  if (widget.classList.contains("hidden")) {
    badge.classList.remove("hidden");
  }
}

function clearUnreadBadge() {
  const badge = document.getElementById("unread-badge");
  badge.classList.add("hidden");
}


// ================================
// UX COPY (OPTIONAL BUT NICE)
// ================================

// const UX_COPY = {
//   resetConfirm: "This will restart the conversation. Are you sure?",
//   resetSuccess: "🧹 Chat reset successfully. Let’s start fresh!",
//   humanMode: "You’re now chatting with a human agent.",
//   botMode: "🤖 You’re back with the assistant. How can I help?",
//   connectingHuman: "Connecting you with our team 👇",
//   backToBot: "← Continue chatting with bot"
// };


// ================================
// RESUME CHAT STATE ON LOAD
// ================================

document.addEventListener("DOMContentLoaded", () => {
  if (state.postLeadChoice === "human") {
    hideBotUI();
    showWhatsappButton();
    showBackToBotButton();
  }

  if (state.postLeadChoice === "bot") {
    removeHumanUI();
    showBotUI();
    enableChat();
  }
});


// ================================
//widget
// ================================
// WIDGET + RESET BINDING
// ================================

document.addEventListener("DOMContentLoaded", () => {
  const launcher = document.getElementById("chatbot-launcher");
  const widget = document.getElementById("chatbot-widget");
  const closeChat = document.getElementById("close-chat");
  

  if (!launcher || !widget || !closeChat) {
    console.error("Chatbot elements not found");
    return;
  }

  // Open widget
  launcher.addEventListener("click", () => {
    widget.classList.remove("hidden");
    document.body.style.overflow = "hidden"; // 🔒
    clearUnreadBadge();

// 🔁 SMART REOPEN — SHOW WELCOME ONLY ONCE
if (state.leadCaptured && !state.welcomeShown) {
  const greeting = getTimeGreeting();
  addBotMessage(`${greeting}! 👋 Welcome back — let’s continue from where you stopped 😊`);

  state.welcomeShown = true;
  saveState();
}

// 🔔 Ask for sound permission once
if (!state.soundPrompted) {
  setTimeout(() => {
    showSoundOptIn();
  }, 800);
}

    // 🧠 PROTECT ON CHAT REOPEN
    if (state.leadCaptured) {
      const menu = document.getElementById("menu");
      if (menu) menu.style.display = "none";

      if (state.postLeadChoice === "human") {
        disableChat();
        showWhatsappButton();
        showBackToBotButton();
      } else {
        enableChat();
      }
    }
  });

  // ❌➡️✅ CLOSE widget (THIS WAS MISSING)
  closeChat.addEventListener("click", () => {
    widget.classList.add("hidden");
    document.body.style.overflow = ""; // 🔓
  });
});

  // 🗑️ Reset chat safely
  // if (resetBtn) {
  //   resetBtn.addEventListener("click", resetChatbot);
  // }


// //ADD RESET FUNCTION
// function resetChatbot() {
//   // 1️⃣ Clear storage
//   localStorage.removeItem("chatbotState");

//   // 2️⃣ Reset UI
//   document.getElementById("chat-window").innerHTML = "";
//   document.getElementById("menu").style.display = "flex";

//   removeHumanUI();
//   showBotUI();
//   enableChat();

//   // 3️⃣ Reset in-memory state
//   Object.keys(state).forEach(key => delete state[key]);

//   // 4️⃣ Reload page logic (safe re-init)
//   window.location.reload();
// }

// ================================
// VIEWPORT HEIGHT ADJUSTMENT
// ================================
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", () => {
    const widget = document.getElementById("chatbot-widget");
    if (!widget) return;

    widget.style.height = window.visualViewport.height + "px";
  });
}
