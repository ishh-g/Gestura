/**
 * AI-Based Sign Language Recognition and Learning System
 * Intelligent AI Sign Tutor Chatbot Assistant
 */

const ChatbotModule = (() => {
  let isOpen = false;

  const BOT_KNOWLEDGE = [
    {
      keywords: ['hello', 'hi', 'hey', 'start'],
      response: 'Hello, welcome to the studio. I can show you numbers 0–9, hello, thank you, yes, no, and a few kind phrases. What would you like to practice?'
    },
    {
      keywords: ['how to sign', 'how do i sign', 'sign for', 'gesture for'],
      handler: (query) => {
        const words = ['hello', 'water', 'food', 'help', 'thank you', 'please', 'family', 'home', 'doctor', 'hospital', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        const found = words.find(w => query.toLowerCase().includes(w));
        if (found) {
          return `For **"${found.toUpperCase()}"**, open the study cards and look under numbers or hello & manners. Then try it in the practice mirror — hold steady in good light.`;
        }
        return 'Have a look at the study cards — numbers 0–10 first, then hello, thank you, yes, no, and I love you. All of them work in the mirror.';
      }
    },
    {
      keywords: ['how it works', 'model', 'ai', 'mirror', 'camera', 'tracking'],
      response: 'The mirror follows your hand joints right in your browser and reads shapes — open hand for hello, finger counts for 0–5, thumb touches for 6–9, thumbs up for yes. Nothing leaves your device.'
    },
    {
      keywords: ['quiz', 'test', 'practice', 'exam', 'score'],
      response: 'Ready for a challenge? Click below or go to the **Learn** tab and click **"Practice Quiz"** to test your knowledge with timed multiple-choice questions!',
      action: 'startQuiz'
    },
    {
      keywords: ['emergency', 'sos', 'ambulance', 'police', 'danger', 'help me'],
      response: 'In urgent situations, please open our **Emergency Module**! It provides high-contrast one-touch buttons that speak out loud and broadcast emergency strobe alerts.'
    },
    {
      keywords: ['certificate', 'degree', 'completion', 'download'],
      response: 'You can generate and download your personalized **Certificate of Completion** from the top right or after finishing your practice quiz!'
    },
    {
      keywords: ['asl', 'what is sign language', 'american sign language'],
      response: 'American Sign Language (ASL) is a complete, natural language that has the same linguistic properties as spoken languages, with grammar that differs from English. It is expressed by movements of the hands and face.'
    }
  ];

  const init = () => {
    // Initial welcome message already in markup
  };

  const toggleChat = () => {
    const windowEl = document.getElementById('chatbot-window');
    if (!windowEl) return;
    isOpen = !isOpen;
    windowEl.classList.toggle('chat-open', isOpen);
    if (isOpen) {
      const input = document.getElementById('chat-input-field');
      if (input) input.focus();
    }
  };

  const sendMessage = (customText = null) => {
    const input = document.getElementById('chat-input-field');
    const text = customText || (input ? input.value.trim() : '');
    if (!text) return;

    if (input && !customText) input.value = '';

    appendMessage(text, 'user');

    // Simulate AI thinking
    setTimeout(() => {
      generateBotResponse(text);
    }, 600);
  };

  const appendMessage = (text, sender) => {
    const container = document.getElementById('chat-messages-container');
    if (!container) return;

    const msgEl = document.createElement('div');
    msgEl.className = `chat-msg ${sender === 'user' ? 'msg-user' : 'msg-bot'}`;
    msgEl.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
  };

  const generateBotResponse = (query) => {
    const lower = query.toLowerCase();
    let reply = null;

    for (const item of BOT_KNOWLEDGE) {
      if (item.keywords.some(k => lower.includes(k))) {
        if (typeof item.handler === 'function') {
          reply = item.handler(query);
        } else {
          reply = item.response;
        }
        break;
      }
    }

    if (!reply) {
      reply = `I understand you are asking about: "${query}". Try exploring the **Learn** tab for interactive vocabulary, **Recognize** tab for live AI camera feedback, or test yourself with a **Quiz**!`;
    }

    appendMessage(reply, 'bot');
  };

  return {
    init,
    toggleChat,
    sendMessage
  };
})();
