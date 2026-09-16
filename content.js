(() => {
  const DEFAULTS = {
    enabled: true,
    mode: 'smart',
    invert: 0.92,
    brightness: 0.90,
    contrast: 1.02,
    saturation: 0.90,
    whiteThreshold: 0.62
  };

  let settings = { ...DEFAULTS };
  let started = false;
  const timers = new WeakMap();

  chrome.storage.sync.get(DEFAULTS, (saved) => {
    settings = { ...DEFAULTS, ...saved };
    start();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    for (const [key, change] of Object.entries(changes)) {
      settings[key] = change.newValue;
    }
    refreshAll();
  });

  function start() {
    if (started) return;
    started = true;
    refreshAll();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          if (node.matches?.('video') || node.querySelector?.('video')) {
            queueRefresh();
            return;
          }
        }
      }
    });

    observer.observe(document.documentElement || document, {
      childList: true,
      subtree: true
    });

    setInterval(refreshAll, 2500);
  }

  function queueRefresh() {
    clearTimeout(queueRefresh.timer);
    queueRefresh.timer = setTimeout(refreshAll, 100);
  }

  function refreshAll() {
    document.querySelectorAll('video').forEach(prepareVideo);
  }

  function prepareVideo(video) {
    applyVariables(video);

    if (!settings.enabled) {
      disable(video);
      cancelSmartCheck(video);
      return;
    }

    if (settings.mode === 'always') {
      cancelSmartCheck(video);
      enable(video);
      return;
    }

    scheduleSmartCheck(video);
  }

  function applyVariables(video) {
    video.style.setProperty('--dark-video-invert', String(settings.invert));
    video.style.setProperty('--dark-video-brightness', String(settings.brightness));
    video.style.setProperty('--dark-video-contrast', String(settings.contrast));
    video.style.setProperty('--dark-video-saturation', String(settings.saturation));
  }

  function scheduleSmartCheck(video) {
    cancelSmartCheck(video);

    if (video.readyState < 2) {
      const id = setTimeout(() => scheduleSmartCheck(video), 350);
      timers.set(video, { type: 'timeout', id });
      return;
    }

    if ('requestVideoFrameCallback' in video) {
      const id = video.requestVideoFrameCallback(() => smartCheck(video));
      timers.set(video, { type: 'rvfc', id });
    } else {
      const id = setTimeout(() => smartCheck(video), 350);
      timers.set(video, { type: 'timeout', id });
    }
  }

  function cancelSmartCheck(video) {
    const pending = timers.get(video);
    if (!pending) return;

    try {
      if (pending.type === 'rvfc' && video.cancelVideoFrameCallback) {
        video.cancelVideoFrameCallback(pending.id);
      } else if (pending.type === 'timeout') {
        clearTimeout(pending.id);
      }
    } catch {}

    timers.delete(video);
  }

  function smartCheck(video) {
    if (!video.isConnected || video.readyState < 2) return;

    const rect = video.getBoundingClientRect();
    if (rect.width < 120 || rect.height < 80) return;

    try {
      const canvas = document.createElement('canvas');
      const W = 64;
      const H = 36;
      canvas.width = W;
      canvas.height = H;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, W, H);

      const { data } = ctx.getImageData(0, 0, W, H);
      let luminanceTotal = 0;
      let brightPixels = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i] / 255;
        const g = data[i + 1] / 255;
        const b = data[i + 2] / 255;
        const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        luminanceTotal += y;
        if (y > 0.80) brightPixels++;
      }

      const pixels = W * H;
      const mean = luminanceTotal / pixels;
      const brightRatio = brightPixels / pixels;
      const shouldDarken = mean >= settings.whiteThreshold || brightRatio >= 0.42;

      setEnabledState(video, shouldDarken);
    } catch {
      // Some protected/remote players cannot be sampled. Keep them usable.
      enable(video);
    }
  }

  function enable(video) {
    video.classList.add('dark-video-enabled');
  }

  function disable(video) {
    video.classList.remove('dark-video-enabled');
  }

  function setEnabledState(video, enabled) {
    if (enabled) enable(video);
    else disable(video);
  }
})();
