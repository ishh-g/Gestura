/**
 * AI-Based Sign Language Recognition and Learning System
 * Accessible Emergency Communication Board & SOS Module
 */

const EmergencyModule = (() => {
  let audioCtx = null;
  let sirenOsc = null;
  let sirenGain = null;
  let isSirenPlaying = false;
  let isStrobeActive = false;

  const init = () => {
    // Ready
  };

  const triggerEmergency = (phrase, priorityLevel = 'CRITICAL') => {
    // 1. Loud Speech Synthesis
    AppModule.speakText(phrase, 1.0, 1.0, 1.0);

    // 2. High Visibility Strobe Flash
    activateStrobe(4000);

    // 3. Show Toast notification
    AppModule.showToast(`EMERGENCY ALERT: ${priorityLevel}`, `Broadcasting audio: "${phrase}"`, 'error');

    // 4. Update preview banner
    const banner = document.getElementById('emergency-active-banner');
    if (banner) {
      banner.style.display = 'block';
      banner.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
          <div>
            <strong><i class="fa-solid fa-triangle-exclamation"></i> ACTIVE SOS BROADCAST:</strong>
            <span>"${phrase}"</span>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="EmergencyModule.stopAllAlerts()">Dismiss</button>
        </div>
      `;
    }
  };

  const toggleSiren = () => {
    if (isSirenPlaying) {
      stopSiren();
    } else {
      startSiren();
    }
  };

  const startSiren = () => {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      sirenOsc = audioCtx.createOscillator();
      sirenGain = audioCtx.createGain();

      sirenOsc.type = 'sawtooth';
      sirenOsc.frequency.setValueAtTime(600, audioCtx.currentTime);

      // Modulate frequency to create European emergency siren wail
      let isHigh = false;
      const modulate = setInterval(() => {
        if (!isSirenPlaying) {
          clearInterval(modulate);
          return;
        }
        if (sirenOsc && audioCtx) {
          isHigh = !isHigh;
          sirenOsc.frequency.setValueAtTime(isHigh ? 960 : 600, audioCtx.currentTime);
        }
      }, 350);

      sirenGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      sirenOsc.connect(sirenGain);
      sirenGain.connect(audioCtx.destination);

      sirenOsc.start();
      isSirenPlaying = true;

      const sirenBtn = document.getElementById('btn-siren-toggle');
      if (sirenBtn) {
        sirenBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> Stop Siren';
        sirenBtn.classList.add('btn-danger');
      }

      AppModule.showToast('Audio Alarm Active', 'Emergency siren wail activated at high volume.', 'error');
    } catch (e) {
      console.warn('Web Audio API unavailable', e);
    }
  };

  const stopSiren = () => {
    if (sirenOsc) {
      try { sirenOsc.stop(); } catch(e){}
      sirenOsc.disconnect();
      sirenOsc = null;
    }
    isSirenPlaying = false;
    const sirenBtn = document.getElementById('btn-siren-toggle');
    if (sirenBtn) {
      sirenBtn.innerHTML = '<i class="fa-solid fa-bullhorn"></i> Sound Emergency Siren';
      sirenBtn.classList.remove('btn-danger');
    }
  };

  const activateStrobe = (durationMs = 3000) => {
    document.body.classList.add('screen-flash-active');
    isStrobeActive = true;
    setTimeout(() => {
      document.body.classList.remove('screen-flash-active');
      isStrobeActive = false;
    }, durationMs);
  };

  const stopAllAlerts = () => {
    stopSiren();
    document.body.classList.remove('screen-flash-active');
    const banner = document.getElementById('emergency-active-banner');
    if (banner) banner.style.display = 'none';
  };

  const simulateDispatch = (type) => {
    AppModule.showToast('SOS Dispatch Simulated', `Simulating automated GPS & SMS dispatch to emergency contact for: ${type}`, 'success');
  };

  return {
    init,
    triggerEmergency,
    toggleSiren,
    stopAllAlerts,
    simulateDispatch
  };
})();
