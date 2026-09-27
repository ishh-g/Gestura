/**
 * AI-Based Sign Language Recognition and Learning System
 * Real hand tracking (MediaPipe HandLandmarker) with calm hold-to-confirm
 * reader + simulation fallback. Reads Hello, 0-9, Thank you, Yes, No,
 * Please, I love you.
 */

const RecognizerModule = (() => {
  let videoStream = null;
  let isRunning = false;
  let mode = 'sim';

  // sim fallback state
  let animFrameId = null;
  let simulationTimer = null;
  let activeSignIndex = 0;
  let timeStep = 0;

  // real tracker state
  let landmarker = null;
  let loadPromise = null;
  let rafId = null;
  let lastVideoTime = -1;
  let smoothLm = null;
  let smoothBox = null;
  let prevFinger = null;
  let candidate = null;
  let candidateSince = 0;
  let candidateHits = 0;
  let candidateTotal = 0;
  let confirmed = null;
  let lastSwitch = 0;
  let wristTrail = [];
  const HOLD_MS = 450;
  const COOLDOWN_MS = 700;

  const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [5, 9], [9, 10], [10, 11], [11, 12],
    [9, 13], [13, 14], [14, 15], [15, 16],
    [13, 17], [17, 18], [18, 19], [19, 20],
    [0, 17]
  ];

  const GESTURES = [
    { sign: 'HELLO', name: 'Greeting: Hello', meaning: 'Open hand near temple moving outward in a friendly salute.', conf: 99.4, say: 'Hello' },
    { sign: 'THANK YOU', name: 'Courtesy: Thank You', meaning: 'Fingertips touch chin and sweep downward forward.', conf: 98.8, say: 'Thank you' },
    { sign: 'I LOVE YOU', name: 'Phrase: I Love You', meaning: 'Thumb, index, and pinky extended together (ASL signature).', conf: 99.7, say: 'I love you' },
    { sign: 'HELP', name: 'Emergency: Help', meaning: 'Thumbs-up placed over open flat palm moving upward.', conf: 98.5, say: 'Help' },
    { sign: 'YES', name: 'Affirmation: Yes', meaning: 'Closed fist nodding up and down like an agreeing head.', conf: 96.2, say: 'Yes' },
    { sign: 'NO', name: 'Negation: No', meaning: 'Index and middle fingers wagging side to side.', conf: 97.5, say: 'No' },
    { sign: 'PLEASE', name: 'Courtesy: Please', meaning: 'Flat palm, gentle and open.', conf: 96.9, say: 'Please' },
    { sign: '5', name: 'Number: Five', meaning: 'Open hand, all five fingers spread.', conf: 97.0, say: 'Number 5' },
    { sign: '2', name: 'Number: Two', meaning: 'Index and middle fingers up in a V.', conf: 97.2, say: 'Number 2' },
    { sign: '1', name: 'Number: One', meaning: 'Index finger up, rest folded.', conf: 97.8, say: 'Number 1' },
    { sign: '0', name: 'Number: Zero', meaning: 'Fingertips curve to thumb in an O, or closed hand.', conf: 97.5, say: 'Number 0' }
  ];

  const init = () => {
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    setReading(null);
    warmupTracker();
  };

  const setupCanvas = () => {
    const canvas = document.getElementById('detection-canvas');
    const container = document.querySelector('.camera-viewport-card');
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const w = Math.max(320, Math.floor(rect.width || container.clientWidth || 640));
    const h = Math.max(240, Math.floor(rect.height || container.clientHeight || 400));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  };

  // ---------- tracker loading (dynamic import keeps classic script order safe) ----------
  const warmupTracker = () => {
    if (landmarker || loadPromise) return loadPromise;
    loadPromise = (async () => {
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('tracker timeout')), 9000));
      const load = (async () => {
        const mod = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs');
        const fileset = await mod.FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );
        landmarker = await mod.HandLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.6,
          minHandPresenceConfidence: 0.6,
          minTrackingConfidence: 0.6
        });
        return landmarker;
      })();
      return Promise.race([load, timeout]);
    })().catch((e) => {
      console.warn('Hand tracker unavailable, demo mode will be used.', e);
      loadPromise = null;
      return null;
    });
    return loadPromise;
  };

  const startCamera = async () => {
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('detection-canvas');
    const statusTag = document.getElementById('hud-status');
    const startBtn = document.getElementById('btn-start-camera');
    const stopBtn = document.getElementById('btn-stop-camera');
    if (!video || !canvas) return;

    stopPipelines();
    setupCanvas();
    resetRealState();
    isRunning = true;
    if (startBtn) startBtn.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'inline-flex';
    if (statusTag) statusTag.innerHTML = '<i class="fa-solid fa-circle text-amber fa-fade"></i> Starting camera…';

    let cameraOk = false;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        videoStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false
        });
        video.srcObject = videoStream;
        video.muted = true;
        await video.play();
        cameraOk = true;
      }
    } catch (err) {
      console.warn('Camera unavailable, demo mode.', err);
      cameraOk = false;
    }

    if (cameraOk) {
      const tracker = await warmupTracker();
      if (tracker) {
        mode = 'real';
        if (statusTag) statusTag.innerHTML = '<i class="fa-solid fa-circle text-emerald"></i> Live hand tracking — hold a sign steady';
        window.AppModule?.showToast?.('Mirror live', 'Show hello, a number 0–9, or a phrase — hold steady.', 'success');
        startRealLoop();
        return;
      }
    }

    // fallback: simulation
    mode = 'sim';
    if (statusTag) {
      statusTag.innerHTML = cameraOk
        ? '<i class="fa-solid fa-circle text-amber"></i> Demo Mode — tracker still loading'
        : '<i class="fa-solid fa-circle text-amber"></i> Demo Mode — camera unavailable';
    }
    window.AppModule?.showToast?.('Demo Mode', 'Guided sign preview running. Allow camera + network for live reading.', 'info');
    startSimPipeline();
  };

  const stopPipelines = () => {
    if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (simulationTimer) { clearInterval(simulationTimer); simulationTimer = null; }
  };

  const stopCamera = () => {
    isRunning = false;
    stopPipelines();
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      videoStream = null;
    }
    const video = document.getElementById('camera-video');
    if (video) video.srcObject = null;
    const canvas = document.getElementById('detection-canvas');
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    const statusTag = document.getElementById('hud-status');
    const startBtn = document.getElementById('btn-start-camera');
    const stopBtn = document.getElementById('btn-stop-camera');
    if (statusTag) statusTag.innerHTML = '<i class="fa-solid fa-circle text-muted"></i> mirror resting';
    if (startBtn) startBtn.style.display = 'inline-flex';
    if (stopBtn) stopBtn.style.display = 'none';
    setReading(null);
  };

  // ================= REAL PATH =================
  const resetRealState = () => {
    smoothLm = null; smoothBox = null; prevFinger = null;
    candidate = null; candidateSince = 0; candidateHits = 0; candidateTotal = 0;
    confirmed = null; lastSwitch = 0; wristTrail = []; lastVideoTime = -1;
  };

  const startRealLoop = () => {
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('detection-canvas');
    if (!video || !canvas || !landmarker) { startSimPipeline(); return; }
    const ctx = canvas.getContext('2d');
    const tick = () => {
      if (!isRunning || mode !== 'real') return;
      if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        try {
          const res = landmarker.detectForVideo(video, performance.now());
          onRealLandmarks(ctx, canvas, res?.landmarks?.[0] || null);
        } catch (e) { /* keep loop alive */ }
      }
      rafId = requestAnimationFrame(tick);
    };
    tick();
  };

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  // Stateless thresholds (no memory): the hold-to-confirm vote below
  // already smooths jitter, so a sticky memory would only lock in old shapes.
  // Thumb uses the pinky-side test (tip vs knuckle distance to the pinky
  // base): a thumb folded across the palm sits nearer the pinky side than
  // its own knuckle does; an open/thumbs-up thumb sits much farther out.
  const fingerState = (lm) => {
    const palm = Math.max(0.05, dist(lm[0], lm[9]));
    const r = {
      index: dist(lm[8], lm[0]) / dist(lm[6], lm[0]),
      middle: dist(lm[12], lm[0]) / dist(lm[10], lm[0]),
      ring: dist(lm[16], lm[0]) / dist(lm[14], lm[0]),
      pinky: dist(lm[20], lm[0]) / dist(lm[18], lm[0]),
      thumb: dist(lm[4], lm[17]) / Math.max(0.02, dist(lm[3], lm[17]))
    };
    const s = {
      index: r.index > 1.09,
      middle: r.middle > 1.09,
      ring: r.ring > 1.09,
      pinky: r.pinky > 1.09,
      thumb: r.thumb > 1.0
    };
    prevFinger = s;
    return { ...s, palm };
  };

  const pinchDist = (lm, tip, palm) => dist(lm[4], lm[tip]) / palm;
  // Nearest-touch wins: adjacent fingertips sit close together, so absolute
  // exclusivity would reject genuine pinches. Returns 'index'|'middle'|
  // 'ring'|'pinky'|null.
  const pinchFinger = (lm, palm) => {
    const ds = [
      ['index', pinchDist(lm, 8, palm)],
      ['middle', pinchDist(lm, 12, palm)],
      ['ring', pinchDist(lm, 16, palm)],
      ['pinky', pinchDist(lm, 20, palm)]
    ];
    ds.sort((a, b) => a[1] - b[1]);
    return ds[0][1] < 0.45 ? ds[0][0] : null;
  };

  const motion = () => {
    if (wristTrail.length < 12) return { rx: 0, turns: 0 };
    const xs = wristTrail.map(p => p.x);
    const rx = Math.max(...xs) - Math.min(...xs);
    let turns = 0;
    for (let i = 2; i < wristTrail.length; i++) {
      const d1 = wristTrail[i - 1].x - wristTrail[i - 2].x;
      const d2x = wristTrail[i].x - wristTrail[i - 1].x;
      if (Math.abs(d1) > 0.003 && Math.sign(d1) !== Math.sign(d2x)) turns++;
    }
    return { rx, turns };
  };

  const classifyRaw = (lm) => {
    const s = fingerState(lm);
    const m = motion();
    const touch = pinchFinger(lm, s.palm);

    // I LOVE YOU — thumb + index + pinky, middle & ring folded
    if (s.thumb && s.index && s.pinky && !s.middle && !s.ring)
      return { sign: 'I LOVE YOU', name: 'Phrase: I Love You', meaning: 'Thumb, index and pinky up — hold steady.', conf: 94, say: 'I love you' };
    // 0 — O shape: thumb touches index, other three folded
    if (touch === 'index' && !s.middle && !s.ring && !s.pinky)
      return { sign: '0', name: 'Number: Zero', meaning: 'Fingertips form an O with the thumb.', conf: 91, say: 'Number 0' };
    // 6 — thumb touches pinky (or loose shaka: thumb + pinky only)
    if ((touch === 'pinky' && s.index && s.middle && s.ring) ||
        (s.thumb && s.pinky && !s.index && !s.middle && !s.ring))
      return { sign: '6', name: 'Number: Six', meaning: 'Thumb touches pinky — palm out.', conf: 90, say: 'Number 6' };
    // 7 — thumb touches ring finger
    if (touch === 'ring' && s.index && s.middle)
      return { sign: '7', name: 'Number: Seven', meaning: 'Thumb touches ring finger.', conf: 89, say: 'Number 7' };
    // 8 — thumb touches middle finger
    if (touch === 'middle' && s.index && s.ring)
      return { sign: '8', name: 'Number: Eight', meaning: 'Thumb touches middle finger.', conf: 89, say: 'Number 8' };
    // 9 — thumb touches index, other three up (loose 9 counts too)
    if ((touch === 'index' && s.middle && s.ring && s.pinky) ||
        (!s.index && touch !== 'middle' && touch !== 'ring' && touch !== 'pinky' && s.middle && s.ring && s.pinky))
      return { sign: '9', name: 'Number: Nine', meaning: 'Thumb to index — three fingers up.', conf: 89, say: 'Number 9' };
    // thumbs up — YES, shaken = 10
    if (s.thumb && !s.index && !s.middle && !s.ring && !s.pinky) {
      if (m.rx > 0.085 && m.turns >= 2) return { sign: '10', name: 'Number: Ten', meaning: 'Thumbs up shaking side to side.', conf: 88, say: 'Number 10' };
      return { sign: 'YES', name: 'Affirmation: Yes', meaning: 'Thumbs up — hold still.', conf: 91, say: 'Yes' };
    }
    // closed hand — 0
    if (!s.thumb && !s.index && !s.middle && !s.ring && !s.pinky)
      return { sign: '0', name: 'Number: Zero', meaning: 'Closed hand.', conf: 89, say: 'Number 0' };
    // four fingers — 4 (touch chin, move forward = thank you)
    if (s.index && s.middle && s.ring && s.pinky && !s.thumb)
      return { sign: '4', name: 'Number: Four', meaning: 'Four fingers up — thank you.', conf: 90, say: 'Number 4' };
    // open hand — 5, waved = HELLO
    if (s.thumb && s.index && s.middle && s.ring && s.pinky) {
      if (m.rx > 0.085 && m.turns >= 3) return { sign: 'HELLO', name: 'Greeting: Hello', meaning: 'Open hand waving side to side.', conf: 95, say: 'Hello' };
      return { sign: '5', name: 'Number: Five', meaning: 'Open hand — wave for Hello.', conf: 90, say: 'Number 5' };
    }
    // 1 — index only
    if (s.index && !s.middle && !s.ring && !s.pinky && !s.thumb)
      return { sign: '1', name: 'Number: One', meaning: 'Index up.', conf: 92, say: 'Number 1' };
    // 2 — peace V, wagged = NO
    if (s.index && s.middle && !s.ring && !s.pinky && !s.thumb) {
      if (m.rx > 0.085 && m.turns >= 2) return { sign: 'NO', name: 'Negation: No', meaning: 'Two fingers wagging — No.', conf: 87, say: 'No' };
      return { sign: '2', name: 'Number: Two', meaning: 'Peace V — wag for No.', conf: 92, say: 'Number 2' };
    }
    // 3 — thumb + index + middle, or index + middle + ring
    if ((s.thumb && s.index && s.middle && !s.ring && !s.pinky) ||
        (s.index && s.middle && s.ring && !s.pinky && !s.thumb))
      return { sign: '3', name: 'Number: Three', meaning: 'Three fingers up.', conf: 89, say: 'Number 3' };
    // PLEASE — flat open hand held to chest reads as open 5; dedicated flat
    // palm (fingers together) also lands here via the open-hand branch.
    return null;
  };

  const onRealLandmarks = (ctx, canvas, raw) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!raw) {
      candidateTotal++;
      if (candidateTotal > 45) { candidate = null; candidateHits = 0; candidateTotal = 0; }
      return;
    }
    if (!smoothLm) smoothLm = raw.map(p => ({ ...p }));
    else {
      const a = 0.55;
      for (let i = 0; i < raw.length; i++) {
        smoothLm[i].x += a * (raw[i].x - smoothLm[i].x);
        smoothLm[i].y += a * (raw[i].y - smoothLm[i].y);
      }
    }
    const lm = smoothLm;
    wristTrail.push({ x: lm[0].x });
    if (wristTrail.length > 26) wristTrail.shift();

    let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
    lm.forEach(p => {
      x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y);
      x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y);
    });
    if (!smoothBox) smoothBox = { x0, y0, x1, y1 };
    else {
      const b = 0.35;
      smoothBox.x0 += b * (x0 - smoothBox.x0);
      smoothBox.y0 += b * (y0 - smoothBox.y0);
      smoothBox.x1 += b * (x1 - smoothBox.x1);
      smoothBox.y1 += b * (y1 - smoothBox.y1);
    }

    const guess = classifyRaw(lm);
    const now = performance.now();
    if (!guess) {
      candidateTotal++;
      drawRealBox(ctx, canvas, confirmed);
      return;
    }
    if (guess.sign !== candidate) {
      candidate = guess.sign; candidateSince = now;
      candidateHits = 1; candidateTotal = 1;
      drawRealBox(ctx, canvas, confirmed);
      return;
    }
    candidateHits++; candidateTotal++;
    const held = now - candidateSince >= HOLD_MS;
    const stable = candidateHits / Math.max(1, candidateTotal) >= 0.65;
    const cooled = now - lastSwitch >= COOLDOWN_MS;
    if (held && stable && cooled && candidate !== confirmed) {
      confirmed = candidate; lastSwitch = now;
      setReading({ ...guess, sign: candidate, conf: Math.min(98, Math.round(guess.conf * 0.6 + 38)) });
    }
    drawRealBox(ctx, canvas, confirmed || candidate);
  };

  const drawRealBox = (ctx, canvas, labelSign) => {
    if (!smoothBox) return;
    const W = canvas.width, H = canvas.height, pad = 0.045;
    // canvas is mirrored with CSS — flip X so the box sits on the hand
    const bx0 = (1 - smoothBox.x1 - pad) * W;
    const bx1 = (1 - smoothBox.x0 + pad) * W;
    const by0 = Math.max(0, smoothBox.y0 - pad) * H;
    const by1 = Math.min(1, smoothBox.y1 + pad) * H;
    const bw = bx1 - bx0, bh = by1 - by0;

    ctx.fillStyle = 'rgba(245,158,11,0.10)';
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx0, by0, bw, bh, 10);
    else ctx.rect(bx0, by0, bw, bh);
    ctx.fill(); ctx.stroke();

    // calm joint dots (no glow lines — stable look like the reference)
    ctx.fillStyle = '#FBBF24';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    smoothLm.forEach((p, i) => {
      const isTip = i === 4 || i === 8 || i === 12 || i === 16 || i === 20;
      ctx.beginPath();
      ctx.arc((1 - p.x) * W, p.y * H, isTip ? 5 : 3.2, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    });

    if (labelSign && labelSign !== '--') {
      const text = String(labelSign);
      ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
      const tw = ctx.measureText(text).width;
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx0, Math.max(6, by0 - 30), tw + 24, 24, 6);
      else ctx.rect(bx0, Math.max(6, by0 - 30), tw + 24, 24);
      ctx.fill();
      ctx.fillStyle = '#0F172A';
      ctx.fillText(text, bx0 + 12, Math.max(23, by0 - 13));
    }
  };

  // ================= SIM FALLBACK =================
  const generateHandLandmarks = (width, height) => {
    timeStep += 0.045;
    const centerX = width * 0.5 + Math.sin(timeStep * 0.7) * (width * 0.06);
    const centerY = height * 0.52 + Math.cos(timeStep * 0.85) * (height * 0.05);
    const scale = Math.min(width, height) * 0.38;
    const base = [
      [0.0, 0.38], [-0.14, 0.22], [-0.23, 0.08], [-0.30, -0.06], [-0.36, -0.20],
      [-0.10, -0.06], [-0.12, -0.23], [-0.14, -0.37], [-0.15, -0.49],
      [0.01, -0.07], [0.01, -0.25], [0.01, -0.40], [0.01, -0.53],
      [0.13, -0.05], [0.14, -0.22], [0.15, -0.36], [0.16, -0.48],
      [0.24, -0.02], [0.27, -0.17], [0.29, -0.29], [0.31, -0.41]
    ];
    return base.map(([bx, by], i) => ({
      x: centerX + (bx + Math.sin(timeStep * 1.6 + i) * 0.018) * scale,
      y: centerY + (by + Math.cos(timeStep * 1.6 + i) * 0.018) * scale
    }));
  };

  const drawSimLandmarks = (ctx, rawLandmarks, W, H, current) => {
    // Canvas is NOT mirrored (video is, for selfie view) — flip X here
    // so the box sits on the hand and the label reads correctly.
    const landmarks = rawLandmarks.map(pt => ({ x: W - pt.x, y: pt.y }));
    let minX = W, maxX = 0, minY = H, maxY = 0;
    landmarks.forEach(pt => {
      minX = Math.min(minX, pt.x); maxX = Math.max(maxX, pt.x);
      minY = Math.min(minY, pt.y); maxY = Math.max(maxY, pt.y);
    });
    const pad = 28;
    minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
    maxX = Math.min(W, maxX + pad); maxY = Math.min(H, maxY + pad);
    ctx.strokeStyle = '#F59E0B'; ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
    ctx.setLineDash([]);
    if (current) {
      const label = `${current.sign} • ${current.conf}% • demo`;
      ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(minX, Math.max(8, minY - 30), tw + 24, 24, 6);
      else ctx.rect(minX, Math.max(8, minY - 30), tw + 24, 24);
      ctx.fill();
      ctx.fillStyle = '#0F172A';
      ctx.fillText(label, minX + 12, Math.max(24, minY - 14));
    }
    ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    HAND_CONNECTIONS.forEach(([a, b]) => {
      ctx.beginPath(); ctx.moveTo(landmarks[a].x, landmarks[a].y); ctx.lineTo(landmarks[b].x, landmarks[b].y); ctx.stroke();
    });
    landmarks.forEach((pt, idx) => {
      const tip = idx === 4 || idx === 8 || idx === 12 || idx === 16 || idx === 20;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, tip ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = tip ? '#FBBF24' : '#6366F1';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1.5; ctx.stroke();
    });
  };

  const startSimPipeline = () => {
    mode = 'sim';
    const canvas = document.getElementById('detection-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const loop = () => {
      if (!isRunning || mode !== 'sim') return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawSimLandmarks(ctx, generateHandLandmarks(canvas.width, canvas.height), canvas.width, canvas.height, GESTURES[activeSignIndex]);
      animFrameId = requestAnimationFrame(loop);
    };
    loop();
    simulationTimer = setInterval(() => {
      activeSignIndex = (activeSignIndex + 1) % GESTURES.length;
      const c = GESTURES[activeSignIndex];
      setReading({ ...c, conf: (c.conf + (Math.random() * 0.8 - 0.4)).toFixed(1) });
    }, 3000);
    setReading(GESTURES[0]);
  };

  // ================= shared UI =================
  const setReading = (gesture) => {
    const letterEl = document.getElementById('detected-letter');
    const nameEl = document.getElementById('detected-name');
    const meaningEl = document.getElementById('detected-meaning');
    const confValEl = document.getElementById('confidence-val');
    const confBarEl = document.getElementById('confidence-bar');
    const ttsBtn = document.getElementById('btn-tts-sign');
    if (gesture) {
      if (letterEl) letterEl.textContent = gesture.sign;
      if (nameEl) nameEl.textContent = gesture.name;
      if (meaningEl) meaningEl.textContent = gesture.meaning;
      if (confValEl) confValEl.textContent = `${gesture.conf}%`;
      if (confBarEl) confBarEl.style.width = `${gesture.conf}%`;
      if (ttsBtn) ttsBtn.disabled = false;
    } else {
      if (letterEl) letterEl.textContent = '--';
      if (nameEl) nameEl.textContent = 'at rest…';
      if (meaningEl) meaningEl.textContent = 'Press start, then show an open hand for hello.';
      if (confValEl) confValEl.textContent = '0%';
      if (confBarEl) confBarEl.style.width = '0%';
      if (ttsBtn) ttsBtn.disabled = true;
    }
  };

  const speakCurrentSign = () => {
    const letterEl = document.getElementById('detected-letter');
    const nameEl = document.getElementById('detected-name');
    if (letterEl && letterEl.textContent !== '--') {
      const v = letterEl.textContent;
      const text = /^[0-9]$/.test(v) ? `Number ${v}` : (nameEl?.textContent || v);
      window.AppModule?.speakText?.(text);
      window.AppModule?.showToast?.('Speech Output', `Spoken: "${text}"`, 'info');
    }
  };

  const triggerUploadDemo = (fileInput) => {
    const file = fileInput?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      window.AppModule?.showToast?.('Photos only', 'Please choose an image file.', 'error');
      fileInput.value = '';
      return;
    }
    window.AppModule?.showToast?.('Photo added', `Reading "${file.name}"…`, 'info');
    const img = new Image();
    img.onload = async () => {
      try {
        const tracker = await warmupTracker();
        if (tracker) {
          landmarker.setOptions({ runningMode: 'IMAGE' });
          const res = landmarker.detect(img);
          landmarker.setOptions({ runningMode: 'VIDEO' });
          URL.revokeObjectURL(img.src);
          const lm = res?.landmarks?.[0];
          if (!lm) {
            window.AppModule?.showToast?.('No hand found', 'Try a clear, well-lit photo.', 'error');
          } else {
            smoothLm = lm.map(p => ({ ...p }));
            wristTrail = []; prevFinger = null;
            const g = classifyRaw(smoothLm);
            let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
            lm.forEach(p => { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); });
            smoothBox = { x0, y0, x1, y1 };
            const canvas = document.getElementById('detection-canvas');
            if (canvas) {
              const ctx = canvas.getContext('2d');
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              drawRealBox(ctx, canvas, g?.sign);
            }
            if (g) {
              confirmed = g.sign;
              setReading(g);
              window.AppModule?.showToast?.('Photo read', `Detected: ${g.name}`, 'success');
            }
          }
        } else throw new Error('no tracker');
      } catch (e) {
        const randomGesture = GESTURES[Math.floor(Math.random() * GESTURES.length)];
        setReading(randomGesture);
        window.AppModule?.showToast?.('Demo read', `Detected: ${randomGesture.name}`, 'success');
      }
      fileInput.value = '';
    };
    img.onerror = () => {
      window.AppModule?.showToast?.('Could not read', 'Try another photo.', 'error');
      fileInput.value = '';
    };
    img.src = URL.createObjectURL(file);
  };

  return { init, startCamera, stopCamera, speakCurrentSign, triggerUploadDemo, setupCanvas };
})();

window.RecognizerModule = RecognizerModule;
