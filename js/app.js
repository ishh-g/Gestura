/**
 * AI-Based Sign Language Recognition and Learning System
 * Master Application Controller & Router
 */

const AppModule = (() => {
  const init = () => {
    initTheme();
    initRouter();
    initSpeechSynthesis();
    initSearch();
    
    // Initialize submodules
    AuthModule.init();
    window.RecognizerModule?.init?.();
    TranslatorModule.init();
    LearningModule.init();
    EmergencyModule.init();
    ChatbotModule.init();
    CertificateModule.init();

    // Trigger initial route
    handleRoute();
  };

  // ==========================================
  // Hash-based Router
  // ==========================================
  const initRouter = () => {
    window.addEventListener('hashchange', handleRoute);
  };

  const handleRoute = () => {
    const hash = window.location.hash.replace('#', '') || 'home';
    const user = AuthModule.getUser();

    // Guard Admin Route
    if (hash === 'admin' && (!user || user.role !== 'admin')) {
      showToast('Admin Only', 'Please sign in with an Administrator account to view this panel.', 'error');
      window.location.hash = 'dashboard';
      return;
    }

    // Guard Dashboard Route
    if (hash === 'dashboard' && !user) {
      AuthModule.openAuthModal();
      return;
    }

    // Toggle active view section
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active-view'));
    const targetSection = document.getElementById(`view-${hash}`);
    if (targetSection) {
      targetSection.classList.add('active-view');
    } else {
      const homeSec = document.getElementById('view-home');
      if (homeSec) homeSec.classList.add('active-view');
    }

    // Update active nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${hash}`);
    });

    // Close mobile drawer if open
    closeMobileDrawer();

    // Trigger route-specific lifecycles
    if (hash === 'dashboard') {
      DashboardModule.init();
    } else if (hash === 'admin') {
      AdminModule.init();
    } else if (hash === 'home') {
      refreshHomeProgress();
    } else if (hash === 'recognize') {
      window.RecognizerModule?.setupCanvas?.();
    } else {
      // Stop camera if navigating away from recognize
      window.RecognizerModule?.stopCamera?.();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==========================================
  // Homepage journey preview — reads the REAL
  // signed-in learner state from AuthModule.
  // ==========================================
  const refreshHomeProgress = () => {
    const user = window.AuthModule?.getUser?.();
    const headline = document.getElementById('journey-headline');
    if (!headline) return;
    const sub = document.getElementById('journey-sub');
    const bar = document.getElementById('journey-bar');
    const wrap = document.getElementById('journey-bar-wrap');
    const learned = document.getElementById('journey-learned');
    const left = document.getElementById('journey-left');
    const streak = document.getElementById('journey-streak');
    const pct = document.getElementById('journey-pct');

    if (!user) {
      headline.textContent = 'Begin your journey';
      if (sub) sub.textContent = 'Sign in to save lessons, streaks, and accuracy.';
      if (learned) learned.textContent = '0';
      if (left) left.textContent = '–';
      if (streak) streak.textContent = '0';
      if (pct) pct.textContent = '0%';
      if (bar) bar.style.width = '0%';
      if (wrap) wrap.setAttribute('aria-valuenow', '0');
      return;
    }
    const total = Math.max(1, user.totalLessons || 26);
    const done = Math.min(total, Math.max(0, user.completedLessons || 0));
    const percent = Math.round((done / total) * 100);
    const first = String(user.name || 'friend').split(' ')[0];
    headline.textContent = `Keep going, ${first}`;
    if (sub) sub.textContent = `${user.level || 'Learning'} · ${user.accuracyAvg || 0}% average accuracy`;
    if (learned) learned.textContent = String(done);
    if (left) left.textContent = String(total - done);
    if (streak) streak.textContent = `${user.streakDays || 0}d`;
    if (pct) pct.textContent = `${percent}%`;
    if (wrap) wrap.setAttribute('aria-valuenow', String(percent));
    if (bar) requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = `${percent}%`; }));
  };

  // ==========================================
  // Theme Toggle (Light / Dark)
  // ==========================================
  const initTheme = () => {
    const saved = localStorage.getItem('signai_theme') || 'light';
    setTheme(saved);
  };

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('signai_theme', theme);
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
      themeBtn.title = theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme';
    }
    // Refresh active charts for theme colors
    DashboardModule.initProgressChart?.();
    AdminModule.initAdminCharts?.();
  };

  // ==========================================
  // Universal Web Speech API Synthesizer
  // ==========================================
  let synth = null;
  const initSpeechSynthesis = () => {
    if ('speechSynthesis' in window) {
      synth = window.speechSynthesis;
    }
  };

  const speakText = (text, rate = 0.95, pitch = 1.0, volume = 1.0) => {
    if (!synth) {
      showToast('Speech Not Supported', 'Your browser does not support Web Speech API.', 'error');
      return;
    }

    synth.cancel(); // Stop ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Pick a natural English voice if available
    const voices = synth.getVoices();
    const naturalVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) utterance.voice = naturalVoice;

    synth.speak(utterance);
  };

  // ==========================================
  // Toast Notification System
  // ==========================================
  const showToast = (title, message, type = 'info') => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-solid fa-circle-info';
    if (type === 'success') iconClass = 'fa-solid fa-circle-check';
    if (type === 'error') iconClass = 'fa-solid fa-triangle-exclamation';

    toast.innerHTML = `
      <div class="toast-icon"><i class="${iconClass}"></i></div>
      <div class="toast-content">
        <h4>${title}</h4>
        <p>${message}</p>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 300ms ease';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  };

  // ==========================================
  // Mobile Drawer
  // ==========================================
  const toggleMobileDrawer = () => {
    const drawer = document.getElementById('mobile-drawer');
    if (drawer) drawer.classList.toggle('open');
  };

  const closeMobileDrawer = () => {
    const drawer = document.getElementById('mobile-drawer');
    if (drawer) drawer.classList.remove('open');
  };

  // ==========================================
  // Universal Search
  // ==========================================
  const initSearch = () => {
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const q = searchInput.value.trim().toLowerCase();
          if (q.includes('learn') || q.includes('alphabet') || q.includes('sign')) {
            window.location.hash = 'learn';
          } else if (q.includes('camera') || q.includes('recognize') || q.includes('ai')) {
            window.location.hash = 'recognize';
          } else if (q.includes('translate') || q.includes('speech')) {
            window.location.hash = 'translator';
          } else if (q.includes('emergency') || q.includes('sos') || q.includes('help')) {
            window.location.hash = 'emergency';
          } else if (q.includes('admin') || q.includes('stats')) {
            window.location.hash = 'admin';
          } else {
            ChatbotModule.toggleChat();
            ChatbotModule.sendMessage(q);
          }
          searchInput.value = '';
        }
      });
    }
  };

  return {
    init,
    toggleTheme,
    speakText,
    showToast,
    toggleMobileDrawer,
    closeMobileDrawer,
    refreshHomeProgress
  };
})();

// Bootstrap app on DOMContentLoaded
window.addEventListener('DOMContentLoaded', AppModule.init);
