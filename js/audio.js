/**
 * NetPulse Network Lab - 8-Bit Retro Sound Synthesizer
 * Pure Web Audio API synthesizers for arcade-style chiptune effects.
 * Author: Pranav Aitha
 */

const RetroAudio = (() => {
  let audioCtx = null;
  let isMuted = false;

  // Restore mute preference
  try {
    const saved = localStorage.getItem('netpulse_sound_muted');
    if (saved !== null) {
      isMuted = saved === 'true';
    }
  } catch (e) {
    // Ignore storage issues
  }

  function initContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'square', duration = 0.08, volume = 0.1, pitchBend = 0) {
    if (isMuted) return;
    try {
      initContext();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      if (pitchBend !== 0) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(20, freq + pitchBend),
          audioCtx.currentTime + duration
        );
      }

      gain.gain.setValueAtTime(volume, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (err) {
      // Audio not permitted yet or unsupported
    }
  }

  return {
    toggleMute() {
      isMuted = !isMuted;
      try {
        localStorage.setItem('netpulse_sound_muted', isMuted);
      } catch (e) {}
      if (!isMuted) {
        this.blip();
      }
      return isMuted;
    },

    isMuted() {
      return isMuted;
    },

    // Crisp high-frequency keystroke or select blip
    blip() {
      playTone(880, 'square', 0.04, 0.05);
    },

    // Packet inspection sound
    inspect() {
      playTone(523.25, 'triangle', 0.04, 0.08);
      setTimeout(() => playTone(1046.5, 'square', 0.06, 0.06), 40);
    },

    // Cartridge preset loaded
    preset() {
      playTone(440, 'square', 0.05, 0.06);
      setTimeout(() => playTone(659.25, 'square', 0.05, 0.06), 60);
      setTimeout(() => playTone(880, 'square', 0.08, 0.07), 120);
    },

    // Subnet calculation success
    calculate() {
      playTone(587.33, 'triangle', 0.04, 0.06);
      setTimeout(() => playTone(880, 'square', 0.05, 0.06), 50);
    },

    // Error / invalid IP
    error() {
      playTone(180, 'sawtooth', 0.12, 0.09, -50);
    }
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RetroAudio;
}
