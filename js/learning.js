/**
 * AI-Based Sign Language Recognition and Learning System
 * Interactive Learning Center, Sign Cards & Quiz Engine
 */

const LearningModule = (() => {
  const ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(char => ({
    category: 'alphabets',
    symbol: char,
    name: `Letter ${char}`,
    icon: 'fa-solid fa-hand',
    desc: `ASL finger-spelling formation for character '${char}'`,
    handGuide: `Form the standard ASL '${char}' posture with fingers clearly separated against a plain background.`,
    level: 'Beginner'
  }));

  const NUMBERS = [
    { category: 'numbers', symbol: '0', name: '0 — Zero', desc: 'O shape: fingertips to thumb', handGuide: 'Curve all fingertips to touch the thumb in an O. Mirror reads this as 0. A tight fist also reads as 0.', level: 'Beginner' },
    { category: 'numbers', symbol: '1', name: '1 — One', desc: 'Index up only', handGuide: 'Index up, thumb and other fingers folded. Hold palm to camera, steady.', level: 'Beginner' },
    { category: 'numbers', symbol: '2', name: '2 — Two', desc: 'Index + middle in a V', handGuide: 'Index and middle up in a V. Wag side to side and the mirror reads “No”.', level: 'Beginner' },
    { category: 'numbers', symbol: '3', name: '3 — Three', desc: 'Thumb + index + middle', handGuide: 'Thumb, index and middle spread. Palm out to camera.', level: 'Beginner' },
    { category: 'numbers', symbol: '4', name: '4 — Four', desc: 'Four up, thumb folded', handGuide: 'Four fingers up, thumb folded across palm. Same shape starts “thank you”.', level: 'Beginner' },
    { category: 'numbers', symbol: '5', name: '5 — Five', desc: 'Open hand', handGuide: 'All five spread. Wave side to side and the mirror reads “Hello”.', level: 'Beginner' },
    { category: 'numbers', symbol: '6', name: '6 — Six', desc: 'Thumb touches pinky', handGuide: 'From an open hand, touch thumb tip to pinky tip. Index, middle, ring stay up. Palm out.', level: 'Intermediate' },
    { category: 'numbers', symbol: '7', name: '7 — Seven', desc: 'Thumb touches ring', handGuide: 'Touch thumb tip to ring fingertip. Index and middle stay up. Palm out.', level: 'Intermediate' },
    { category: 'numbers', symbol: '8', name: '8 — Eight', desc: 'Thumb touches middle', handGuide: 'Touch thumb tip to middle fingertip. Palm out.', level: 'Intermediate' },
    { category: 'numbers', symbol: '9', name: '9 — Nine', desc: 'Thumb touches index', handGuide: 'Touch thumb tip to index tip, keep middle, ring and pinky up. Palm out.', level: 'Intermediate' },
    { category: 'numbers', symbol: '10', name: '10 — Ten', desc: 'Thumbs up + shake', handGuide: 'Thumbs up, shake side to side. A still thumbs up reads as “Yes”.', level: 'Beginner' }
  ];

  const WORDS = [
    { category: 'greetings', symbol: '👋', name: 'Hello', desc: 'Open hand, wave side to side', handGuide: 'Show all five fingers, palm out, and wave side to side. The mirror reads motion + open hand as HELLO.', level: 'Beginner' },
    { category: 'greetings', symbol: '🙏', name: 'Thank You', desc: 'Flat hand from chin forward', handGuide: 'Start with four fingers up (thumb folded), touch chin, move forward. Mirror reads the 4-shape as “4 / thank you”.', level: 'Beginner' },
    { category: 'greetings', symbol: '🤝', name: 'Please', desc: 'Open hand, gentle', handGuide: 'Open relaxed hand. Practice as an open 5-shape in the mirror first.', level: 'Beginner' },
    { category: 'greetings', symbol: '👍', name: 'Yes', desc: 'Thumbs up', handGuide: 'Closed hand, thumb up. Hold still for YES, shake for 10.', level: 'Beginner' },
    { category: 'greetings', symbol: '✌️', name: 'No', desc: 'Two fingers wagging', handGuide: 'Index + middle up, wag side to side for NO. Hold still for number 2.', level: 'Beginner' },
    { category: 'greetings', symbol: '🤟', name: 'I Love You', desc: 'Thumb + index + pinky', handGuide: 'Thumb, index and pinky up. Middle and ring folded down.', level: 'Beginner' },

    { category: 'daily', symbol: '💧', name: 'Water', desc: 'W-hand tapping on chin', handGuide: 'Form a "W" handshape with three middle fingers upright, tap index finger twice gently against bottom lip.', level: 'Beginner' },
    { category: 'daily', symbol: '🍎', name: 'Food / Eat', desc: 'Flattened O to mouth', handGuide: 'Bring fingertips together into a squashed "O" shape and tap lightly twice against the lips.', level: 'Beginner' },
    { category: 'daily', symbol: '🏠', name: 'Home', desc: 'Eat to sleep cheek touch', handGuide: 'Touch right cheek near mouth with flat-O hand, then move back and touch near the ear.', level: 'Intermediate' },
    { category: 'daily', symbol: '👨‍👩‍👦', name: 'Family', desc: 'Two F-hands circling', handGuide: 'Form "F" shapes with both hands touching index-thumbs, sweep outward in a circle until pinkies touch.', level: 'Intermediate' },

    { category: 'emergency', symbol: '🆘', name: 'Help', desc: 'Closed hand / thumbs up', handGuide: 'Show a closed hand or thumbs up to the mirror — it reads HELP / YES shapes. Then use the help cards to speak.', level: 'Beginner' },
    { category: 'emergency', symbol: '🩺', name: 'Doctor', desc: 'Tapping wrist pulse', handGuide: 'Tap bent fingertips of dominant hand twice against the inner pulse area of the opposite wrist.', level: 'Intermediate' },
    { category: 'emergency', symbol: '🏥', name: 'Hospital', desc: 'H-cross on shoulder', handGuide: 'Form "H" handshape and draw a medical cross on the upper left arm/shoulder.', level: 'Advanced' }
  ];

  const ALL_ITEMS = [...NUMBERS, ...ALPHABETS, ...WORDS];
  let currentFilter = 'all';

  // ==========================================
  // Hand-sign diagrams — stylised finger charts so learners
  // see the SHAPE of each sign, never a bare digit or letter.
  // Pose: [thumb, index, middle, ring, pinky] (1 = raised),
  // plus an optional fingertip the thumb touches.
  // ==========================================
  const SIGN_POSES = {
    '0': { f: [0, 0, 0, 0, 0], touch: 1 },
    '1': { f: [0, 1, 0, 0, 0] },
    '2': { f: [0, 1, 1, 0, 0] },
    '3': { f: [1, 1, 1, 0, 0] },
    '4': { f: [0, 1, 1, 1, 1] },
    '5': { f: [1, 1, 1, 1, 1] },
    '6': { f: [1, 1, 1, 1, 1], touch: 4 },
    '7': { f: [1, 1, 1, 1, 1], touch: 3 },
    '8': { f: [1, 1, 1, 1, 1], touch: 2 },
    '9': { f: [1, 1, 1, 1, 1], touch: 1 },
    '10': { f: [1, 0, 0, 0, 0] }
  };

  const PHRASE_POSES = [
    [/hello/, { f: [1, 1, 1, 1, 1] }],
    [/thank/, { f: [0, 1, 1, 1, 1] }],
    [/please/, { f: [1, 1, 1, 1, 1] }],
    [/yes/, { f: [1, 0, 0, 0, 0] }],
    [/\bno\b/, { f: [0, 1, 1, 0, 0] }],
    [/love you/, { f: [1, 1, 0, 0, 1] }],
    [/help/, { f: [1, 0, 0, 0, 0] }]
  ];

  const poseFor = (item) => {
    if (!item) return null;
    if (item.category === 'numbers' && SIGN_POSES[item.symbol]) return SIGN_POSES[item.symbol];
    const n = (item.name || '').toLowerCase();
    for (const [re, pose] of PHRASE_POSES) {
      if (re.test(n)) return pose;
    }
    return null;
  };

  // Renders a minimal palm + fingers chart in the warm studio palette.
  // Raised fingers are gold, folded ones are short outlines; a dashed
  // bridge shows where the thumb touches a fingertip (0, 6–9).
  const handDiagram = (item, size = 120) => {
    const pose = poseFor(item);
    if (!pose) return null;
    const [t, i, m, r, p] = pose.f;
    const INK = '#3A2518', GOLD = '#D99A16', GOLD_LT = '#E9B44C', CREAM = '#FFF5E8';
    const fx = [32, 49, 66, 83], up = [i, m, r, p];
    let fingers = '';
    fx.forEach((x, k) => {
      const raised = up[k];
      const y = raised ? 14 : 52, h = raised ? 58 : 20;
      fingers += `<rect x="${x}" y="${y}" width="13" height="${h}" rx="6.5" fill="${raised ? GOLD : CREAM}" stroke="${INK}" stroke-width="2.5"/>`;
      if (raised) fingers += `<circle cx="${x + 6.5}" cy="${y + 7}" r="2" fill="${GOLD_LT}"/>`;
    });
    const thumb = t
      ? `<rect x="6" y="66" width="36" height="14" rx="7" transform="rotate(-28 24 73)" fill="${GOLD}" stroke="${INK}" stroke-width="2.5"/><circle cx="12" cy="62" r="3" fill="${GOLD_LT}" stroke="${INK}" stroke-width="1.5"/>`
      : `<rect x="30" y="92" width="34" height="13" rx="6.5" fill="${CREAM}" stroke="${INK}" stroke-width="2.5"/>`;
    let bridge = '';
    if (pose.touch !== undefined) {
      const tx = [0, 38.5, 55.5, 72.5, 89.5][pose.touch];
      const ty = pose.touch === 1 && !i ? 58 : 14;
      bridge = `<path d="M14,60 Q${(14 + tx) / 2},${Math.min(60, ty) - 16} ${tx},${ty}" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="4 3"/><circle cx="${tx}" cy="${ty}" r="3.5" fill="${INK}"/>`;
    }
    return `<svg viewBox="0 0 122 128" width="${size}" height="${Math.round(size * 1.05)}" role="img" aria-label="Hand shape for ${item.name}">`
      + `<rect x="27" y="66" width="68" height="52" rx="14" fill="${CREAM}" stroke="${INK}" stroke-width="2.5"/>`
      + `<circle cx="44" cy="92" r="2" fill="${INK}" opacity="0.35"/><circle cx="61" cy="92" r="2" fill="${INK}" opacity="0.35"/><circle cx="78" cy="92" r="2" fill="${INK}" opacity="0.35"/>`
      + fingers + thumb + bridge + `</svg>`;
  };

  // Visual for a card / preview: diagram when we know the shape,
  // otherwise the item's own glyph (letters, emoji).
  const signVisual = (item, size = 120) => handDiagram(item, size)
    || `<span>${item.symbol}</span>`;

  // Quiz Engine State
  let quizQuestions = [];
  let currentQuestionIndex = 0;
  let quizScore = 0;
  let quizTimer = null;
  let timeLeft = 15;

  const init = () => {
    renderSignCards();
  };

  const setFilter = (category) => {
    currentFilter = category;
    document.querySelectorAll('.filter-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });
    renderSignCards();
  };

  const renderSignCards = () => {
    const grid = document.getElementById('learning-cards-grid');
    if (!grid) return;

    let items = ALL_ITEMS;
    if (currentFilter !== 'all') {
      items = ALL_ITEMS.filter(item => item.category === currentFilter);
    }

    grid.innerHTML = items.map((item, idx) => `
      <div class="sign-learn-card" onclick="LearningModule.openCardDetail(${idx})">
        <div class="sign-card-visual">
          ${signVisual(item, 84)}
        </div>
        <div class="sign-card-letter">${item.name}</div>
        <div class="sign-card-desc">${item.desc}</div>
        <span class="pill-badge pill-${item.level === 'Beginner' ? 'emerald' : item.level === 'Intermediate' ? 'primary' : 'rose'}" style="margin-top: 0.75rem; font-size: 0.65rem;">
          ${item.level}
        </span>
      </div>
    `).join('');
  };

  const openCardDetail = (index) => {
    let items = currentFilter === 'all' ? ALL_ITEMS : ALL_ITEMS.filter(item => item.category === currentFilter);
    const item = items[index];
    if (!item) return;

    const modal = document.getElementById('learning-detail-modal');
    const modalBody = document.getElementById('learning-modal-body');

    if (modal && modalBody) {
      modalBody.innerHTML = `
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <div style="width: 150px; height: 150px; margin: 0 auto 1rem; border-radius: var(--radius-lg); background: var(--bg-surface-elevated); display: flex; align-items: center; justify-content: center; color: var(--primary); border: 2px solid var(--border-subtle); overflow:hidden;">
            ${signVisual(item, 120)}
          </div>
          <h2>${item.name}</h2>
          <p class="text-muted" style="margin-top: 0.25rem;">${item.desc}</p>
          <span class="pill-badge pill-primary" style="margin-top: 0.5rem;">${item.level} Curriculum</span>
        </div>

        <div class="app-card" style="margin-bottom: 1.5rem; background: var(--bg-surface-elevated);">
          <h4 style="margin-bottom: 0.5rem;"><i class="fa-solid fa-hands"></i> How to Form This Sign:</h4>
          <p style="font-size: 0.92rem; color: var(--text-secondary);">${item.handGuide}</p>
        </div>

        <div style="display: flex; gap: 1rem;">
          <button class="btn btn-primary" style="flex: 1;" onclick="AppModule.speakText('${item.name}')">
            <i class="fa-solid fa-volume-high"></i> Pronounce
          </button>
          <button class="btn btn-secondary" style="flex: 1;" onclick="window.location.hash='recognize'; LearningModule.closeModal();">
            <i class="fa-solid fa-camera"></i> Practice with AI
          </button>
        </div>
      `;
      modal.classList.add('modal-open');
    }
  };

  const closeModal = () => {
    const modal = document.getElementById('learning-detail-modal');
    if (modal) modal.classList.remove('modal-open');
  };

  // ==========================================
  // Quiz Module Engine
  // ==========================================
  const startQuiz = () => {
    quizQuestions = [];
    currentQuestionIndex = 0;
    quizScore = 0;

    // Generate 5 random questions
    const pool = [...ALL_ITEMS].sort(() => 0.5 - Math.random());
    for (let i = 0; i < 5; i++) {
      const correct = pool[i];
      const wrongs = pool.filter(p => p.name !== correct.name).sort(() => 0.5 - Math.random()).slice(0, 3);
      const options = [correct, ...wrongs].sort(() => 0.5 - Math.random());

      quizQuestions.push({
        correct: correct,
        options: options
      });
    }

    const modal = document.getElementById('quiz-modal');
    if (modal) {
      modal.classList.add('modal-open');
      renderQuizQuestion();
    }
  };

  const closeQuizModal = () => {
    if (quizTimer) clearInterval(quizTimer);
    const modal = document.getElementById('quiz-modal');
    if (modal) modal.classList.remove('modal-open');
  };

  const renderQuizQuestion = () => {
    if (quizTimer) clearInterval(quizTimer);
    timeLeft = 15;

    const q = quizQuestions[currentQuestionIndex];
    if (!q) {
      renderQuizResults();
      return;
    }

    const container = document.getElementById('quiz-content-container');
    if (!container) return;

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <span class="pill-badge pill-primary">Question ${currentQuestionIndex + 1} of 5</span>
        <span id="quiz-timer-badge" class="pill-badge pill-amber"><i class="fa-solid fa-clock"></i> 15s</span>
      </div>

      <div class="quiz-question-box">
        <h3>Identify the Correct Sign</h3>
        <p class="text-muted">What does this hand gesture represent?</p>
        <div class="quiz-sign-preview">
          ${signVisual(q.correct, 120)}
        </div>
      </div>

      <div class="quiz-options-grid">
        ${q.options.map(opt => `
          <button class="quiz-opt-btn" onclick="LearningModule.submitQuizAnswer('${opt.name.replace(/'/g, "\\'")}', this)">
            ${opt.name}
          </button>
        `).join('')}
      </div>
    `;

    quizTimer = setInterval(() => {
      timeLeft--;
      const badge = document.getElementById('quiz-timer-badge');
      if (badge) badge.innerHTML = `<i class="fa-solid fa-clock"></i> ${timeLeft}s`;

      if (timeLeft <= 0) {
        clearInterval(quizTimer);
        LearningModule.submitQuizAnswer('__TIMEOUT__', null);
      }
    }, 1000);
  };

  const submitQuizAnswer = (selectedName, btnEl) => {
    if (quizTimer) clearInterval(quizTimer);
    const q = quizQuestions[currentQuestionIndex];
    const isCorrect = selectedName === q.correct.name;

    if (btnEl) {
      btnEl.classList.add(isCorrect ? 'correct' : 'wrong');
    }

    if (isCorrect) {
      quizScore += 20; // 20 points per question
      AppModule.showToast('Correct!', `Great job! That's ${q.correct.name}.`, 'success');
    } else {
      AppModule.showToast('Incorrect', `Correct answer was: ${q.correct.name}`, 'error');
    }

    setTimeout(() => {
      currentQuestionIndex++;
      renderQuizQuestion();
    }, 1400);
  };

  const renderQuizResults = () => {
    const container = document.getElementById('quiz-content-container');
    if (!container) return;

    const user = AuthModule.getUser();
    if (user) {
      user.completedLessons = Math.min(user.totalLessons || 26, (user.completedLessons || 0) + 1);
      user.accuracyAvg = Math.round(((user.accuracyAvg || 0) * 4 + quizScore) / 5);
      AuthModule.persist(); // Save quiz gains (previously lost on reload)
      AuthModule.init(); // Refresh session UI
      window.AppModule?.refreshHomeProgress?.();
    }

    container.innerHTML = `
      <div style="text-align: center; padding: 2rem 1rem;">
        <div style="width: 90px; height: 90px; border-radius: 50%; background: var(--primary-subtle); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 3rem; margin: 0 auto 1.25rem;">
          <i class="fa-solid fa-trophy text-amber"></i>
        </div>
        <h2>Quiz Completed!</h2>
        <p class="text-secondary" style="margin-top: 0.5rem;">Your final score is:</p>
        <div style="font-size: 3.5rem; font-weight: 900; color: var(--primary); font-family: var(--font-display); line-height: 1.2; margin: 0.5rem 0;">
          ${quizScore}%
        </div>
        <p class="text-muted" style="margin-bottom: 2rem;">
          ${quizScore >= 80 ? '🌟 Outstanding mastery of sign language!' : quizScore >= 60 ? '👍 Solid effort! Practice a bit more to achieve perfection.' : 'Keep practicing with our visual flashcards!'}
        </p>

        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button class="btn btn-secondary" onclick="LearningModule.startQuiz()">
            <i class="fa-solid fa-rotate-right"></i> Retake Quiz
          </button>
          <button class="btn btn-primary" onclick="CertificateModule.openModal(); LearningModule.closeQuizModal();">
            <i class="fa-solid fa-award"></i> Claim Certificate
          </button>
        </div>
      </div>
    `;
  };

  return {
    init,
    setFilter,
    openCardDetail,
    closeModal,
    startQuiz,
    closeQuizModal,
    submitQuizAnswer
  };
})();
