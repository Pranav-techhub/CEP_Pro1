/**
 * TeaRoute Notification Service
 * Toast notifications, badge counters, audio cues using Web Audio API.
 */

class NotificationService {
  constructor() {
    this.audioCtx = null;
    this.notifications = JSON.parse(localStorage.getItem('tearoute_notifications') || '[]');
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
  }

  playChime(type = 'info') {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;

      if (type === 'proximity' || type === 'arrival') {
        // High dual chime for 1-KM arrival alert
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'warning') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(370, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else {
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // Audio playback fails silently if browser policy blocks autoplay
    }
  }

  showToast(message, type = 'info', title = '') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconMap = {
      success: '✓',
      warning: '⚠',
      error: '✕',
      info: 'ℹ',
      proximity: '⚡'
    };

    const heading = title || (type.charAt(0).toUpperCase() + type.slice(1));
    toast.innerHTML = `
      <div style="font-weight: 800; font-size: 1.1rem; color: var(--primary-gold);">${iconMap[type] || 'ℹ'}</div>
      <div style="flex: 1;">
        <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 0.2rem;">${heading}</div>
        <div style="font-size: 0.85rem; color: var(--text-secondary);">${message}</div>
      </div>
    `;

    container.appendChild(toast);
    this.playChime(type);

    // Save in notification log
    this.recordNotification({
      id: 'notif_' + Date.now(),
      title: heading,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(120%)';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  recordNotification(notif) {
    this.notifications.unshift(notif);
    if (this.notifications.length > 50) this.notifications.pop();
    localStorage.setItem('tearoute_notifications', JSON.stringify(this.notifications));
    window.dispatchEvent(new CustomEvent('tearoute:notification', { detail: notif }));
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    localStorage.setItem('tearoute_notifications', JSON.stringify(this.notifications));
  }
}

export const notifications = new NotificationService();
