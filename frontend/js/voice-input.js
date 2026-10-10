/**
 * BPUT 2.O - Voice Input Engine for All AI Portals
 * 
 * Provides 100% robust, real-time voice speech-to-text input across:
 * - Plant Operations AI (ai-plant.html)
 * - EHS Carbon AI (ai-ehs.html)
 * - HR Social AI (ai-hr.html)
 * - Statutory Auditor AI (ai-auditor.html)
 * - Boardroom AI (ai-board.html)
 * - Unified AI Assistant (ai-assistant.html)
 */

(function () {
  // Inject CSS styles for voice input button and listening states
  const style = document.createElement("style");
  style.id = "voice-input-styles";
  style.textContent = `
    .btn-voice-input {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      min-width: 38px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #cbd5e1;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      padding: 0;
      flex-shrink: 0;
      box-sizing: border-box;
    }
    .btn-voice-input:hover {
      background: rgba(245, 183, 46, 0.12);
      border-color: rgba(245, 183, 46, 0.4);
      color: #f5b72e;
      transform: scale(1.05);
    }
    .input-pill .btn-voice-input {
      border-radius: 50%;
      width: 34px;
      height: 34px;
      min-width: 34px;
      background: #1e1e26;
    }
    .btn-voice-input.listening {
      background: rgba(239, 68, 68, 0.2) !important;
      border-color: #ef4444 !important;
      color: #ef4444 !important;
      animation: voicePulse 1.2s infinite ease-in-out;
    }
    @keyframes voicePulse {
      0% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6);
        transform: scale(1);
      }
      50% {
        box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
        transform: scale(1.08);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
        transform: scale(1);
      }
    }
    .voice-hint-tooltip {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      background: #18181b;
      border: 1px solid rgba(239, 68, 68, 0.5);
      color: #f87171;
      font-size: 11px;
      font-weight: 700;
      padding: 5px 12px;
      border-radius: 6px;
      white-space: nowrap;
      pointer-events: none;
      box-shadow: 0 4px 14px rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      gap: 6px;
      z-index: 1000;
    }
    .voice-hint-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #ef4444;
      animation: voiceDot 0.8s infinite alternate;
    }
    @keyframes voiceDot {
      from { opacity: 0.3; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  // Core Voice Recognition Instance
  let recognition = null;
  let isListening = false;
  let activeInput = null;
  let activeBtn = null;
  let hintTooltip = null;
  let originalPlaceholder = "";

  function initVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    // Check each AI page input
    const input = document.getElementById("chatInput");
    if (!input) return;

    // Find parent container or form
    const container = input.closest(".input-bar") || input.closest(".input-pill") || input.parentElement;
    if (!container) return;

    // Check if voice button already exists
    let voiceBtn = container.querySelector(".btn-voice-input");
    if (!voiceBtn) {
      voiceBtn = document.createElement("button");
      voiceBtn.type = "button";
      voiceBtn.className = "btn-voice-input";
      voiceBtn.id = "btnVoiceInput";
      voiceBtn.title = "Click to speak in Hindi or English (Voice Input)";
      voiceBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      `;

      // Insert before sendBtn
      const sendBtn = container.querySelector("#sendBtn") || container.querySelector("button[type='submit']") || container.querySelector(".send-btn");
      if (sendBtn) {
        container.insertBefore(voiceBtn, sendBtn);
      } else {
        container.appendChild(voiceBtn);
      }
    }

    voiceBtn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (!SpeechRecognition) {
        alert("Voice speech recognition is supported in Google Chrome, Microsoft Edge, and modern Chromium browsers.");
        return;
      }

      if (isListening) {
        stopListening();
      } else {
        startListening(input, voiceBtn);
      }
    };
  }

  function startListening(input, btn) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      if (recognition) {
        try { recognition.abort(); } catch (_) {}
      }

      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-IN"; // Seamlessly transcribes Indian English & Hinglish/Hindi

      activeInput = input;
      activeBtn = btn;
      originalPlaceholder = input.placeholder || "";

      recognition.onstart = function () {
        isListening = true;
        btn.classList.add("listening");
        input.placeholder = "🎙️ Listening... Bolna shuru kijiye (Speak now)";
        showTooltip(btn, "Listening... Speak now");
      };

      recognition.onresult = function (event) {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        if (text) {
          input.value = text;
        }

        if (finalTranscript.trim()) {
          const submittedText = finalTranscript.trim();
          stopListening();
          triggerSend(input, submittedText);
        }
      };

      recognition.onerror = function (event) {
        console.warn("Speech recognition note:", event.error);
        stopListening();
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          alert("Microphone permission was denied. Please allow microphone access in your browser settings.");
        }
      };

      recognition.onend = function () {
        stopListening();
      };

      recognition.start();
    } catch (err) {
      console.warn("Could not start speech recognition:", err);
      stopListening();
    }
  }

  function stopListening() {
    isListening = false;
    if (activeBtn) {
      activeBtn.classList.remove("listening");
    }
    if (activeInput && originalPlaceholder) {
      activeInput.placeholder = originalPlaceholder;
    }
    removeTooltip();
    if (recognition) {
      try { recognition.stop(); } catch (_) {}
    }
  }

  function showTooltip(btn, text) {
    removeTooltip();
    hintTooltip = document.createElement("div");
    hintTooltip.className = "voice-hint-tooltip";
    hintTooltip.innerHTML = `<span class="voice-hint-dot"></span><span>${text}</span>`;
    btn.appendChild(hintTooltip);
  }

  function removeTooltip() {
    if (hintTooltip) {
      hintTooltip.remove();
      hintTooltip = null;
    }
  }

  function triggerSend(input, finalQuery) {
    const val = finalQuery || (input ? input.value : "").trim();
    if (!val) return;

    // Check if sendPrompt exists (in portal pages)
    if (typeof window.sendPrompt === "function") {
      window.sendPrompt(val);
      return;
    }

    // Check if handleSend exists (in ai-assistant.html)
    if (typeof window.handleSend === "function") {
      window.handleSend();
      return;
    }

    // Otherwise trigger form submit or send button click
    const form = input.closest("form");
    if (form) {
      form.dispatchEvent(new Event("submit", { cancelable: true }));
      return;
    }

    const sendBtn = document.getElementById("sendBtn");
    if (sendBtn) {
      sendBtn.click();
    }
  }

  // Auto-init on DOMContentLoaded or immediate if already loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initVoiceInput);
  } else {
    initVoiceInput();
  }

  // Global helper
  window.initVoiceInput = initVoiceInput;
})();
