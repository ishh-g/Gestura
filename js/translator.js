/**
 * AI-Based Sign Language Recognition and Learning System
 * Real-Time Sign-to-Text Translator Module
 */

const TranslatorModule = (() => {
  const STORAGE_KEY = 'signai_translation_history';

  let currentSentence = 'HELLO HOW ARE YOU TODAY';
  let historyList = [];
  let isStreaming = false;
  let streamInterval = null;

  const demoPhrases = [
    'HELLO NICE TO MEET YOU',
    'PLEASE ASSIST ME WITH DIRECTIONS',
    'I AM PRACTICING SIGN LANGUAGE TODAY',
    'THANK YOU VERY MUCH FOR YOUR SUPPORT',
    'CAN YOU PLEASE SPEAK A LITTLE SLOWER',
    'WHERE IS THE NEAREST PHARMACY'
  ];

  const init = () => {
    loadHistory();
    renderHistory();
  };

  const loadHistory = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        historyList = JSON.parse(saved);
      } catch (e) {
        historyList = [];
      }
    } else {
      historyList = [
        { text: 'Hello, good morning everyone', timestamp: '10:14 AM' },
        { text: 'Can I have some water please', timestamp: '09:42 AM' },
        { text: 'Thank you for your assistance', timestamp: 'Yesterday' }
      ];
      saveHistory();
    }
  };

  const saveHistory = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(historyList));
  };

  const renderHistory = () => {
    const container = document.getElementById('translation-history-container');
    if (!container) return;

    if (historyList.length === 0) {
      container.innerHTML = '<div class="text-muted text-center py-4">No recent translations recorded.</div>';
      return;
    }

    container.innerHTML = historyList.map((item, idx) => `
      <div class="history-item">
        <div>
          <div class="history-text">"${item.text}"</div>
          <div class="history-time"><i class="fa-regular fa-clock"></i> ${item.timestamp}</div>
        </div>
        <div style="display: flex; gap: 0.35rem;">
          <button class="btn btn-secondary btn-sm" onclick="AppModule.speakText('${item.text.replace(/'/g, "\\'")}')" title="Speak">
            <i class="fa-solid fa-volume-high"></i>
          </button>
          <button class="btn btn-secondary btn-sm" onclick="TranslatorModule.deleteHistoryItem(${idx})" title="Delete">
            <i class="fa-solid fa-trash text-rose"></i>
          </button>
        </div>
      </div>
    `).join('');
  };

  const startStream = () => {
    const streamBox = document.getElementById('translator-stream-text');
    const toggleBtn = document.getElementById('btn-toggle-translator');

    if (isStreaming) {
      stopStream();
      return;
    }

    isStreaming = true;
    if (toggleBtn) {
      toggleBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause Translation';
      toggleBtn.className = 'btn btn-secondary';
    }

    let phrase = demoPhrases[Math.floor(Math.random() * demoPhrases.length)];
    let charIdx = 0;
    currentSentence = '';

    streamInterval = setInterval(() => {
      if (charIdx < phrase.length) {
        currentSentence += phrase[charIdx];
        charIdx++;
        if (streamBox) streamBox.textContent = currentSentence;
      } else {
        stopStream();
        commitSentence(phrase);
      }
    }, 120);

    AppModule.showToast('Translation Started', 'Buffering continuous sign gesture sequence...', 'info');
  };

  const stopStream = () => {
    isStreaming = false;
    if (streamInterval) clearInterval(streamInterval);
    const toggleBtn = document.getElementById('btn-toggle-translator');
    if (toggleBtn) {
      toggleBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start Continuous Translate';
      toggleBtn.className = 'btn btn-primary';
    }
  };

  const commitSentence = (text) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    historyList.unshift({ text, timestamp: timeStr });
    if (historyList.length > 20) historyList.pop();
    saveHistory();
    renderHistory();
    AppModule.showToast('Translation Saved', 'Sentence transcribed and added to history ledger.', 'success');
  };

  const clearCurrent = () => {
    currentSentence = '';
    const streamBox = document.getElementById('translator-stream-text');
    if (streamBox) streamBox.textContent = 'Waiting for gesture stream...';
  };

  const speakCurrent = () => {
    const streamBox = document.getElementById('translator-stream-text');
    const text = streamBox ? streamBox.textContent : currentSentence;
    if (text && text !== 'Waiting for gesture stream...') {
      AppModule.speakText(text);
      AppModule.showToast('Audio Synthesis', `Speaking: "${text}"`, 'info');
    }
  };

  const copyToClipboard = () => {
    const streamBox = document.getElementById('translator-stream-text');
    const text = streamBox ? streamBox.textContent : currentSentence;
    if (text) {
      navigator.clipboard.writeText(text);
      AppModule.showToast('Copied', 'Transcribed text copied to clipboard.', 'success');
    }
  };

  const deleteHistoryItem = (index) => {
    historyList.splice(index, 1);
    saveHistory();
    renderHistory();
  };

  const exportTranscript = () => {
    if (historyList.length === 0) {
      AppModule.showToast('Empty History', 'No translations to export.', 'info');
      return;
    }
    const content = historyList.map(h => `[${h.timestamp}] ${h.text}`).join('\n');
    const blob = new Blob([`AI SIGN LANGUAGE TRANSLATION LOG\nDate: ${new Date().toLocaleDateString()}\n\n${content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SignAI_Transcript_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    AppModule.showToast('Exported', 'Translation transcript downloaded successfully.', 'success');
  };

  return {
    init,
    startStream,
    stopStream,
    clearCurrent,
    speakCurrent,
    copyToClipboard,
    deleteHistoryItem,
    exportTranscript
  };
})();
