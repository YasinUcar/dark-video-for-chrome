// Video Karanlık Mod - content script
//
// Sayfadaki <video> etiketlerini bulur, oynarken periyodik olarak küçük bir
// canvas'a kare çizip ortalama parlaklığı ölçer. Arka plan "açık" (beyaza
// yakın) ise videoya bir CSS filtresi uygulayarak karanlığa çevirir.
//
// ÖNEMLİ SINIRLAMA: Bazı sitelerde (özellikle YouTube ve DRM korumalı
// içerikler) tarayıcı, videonun piksellerini JS ile okumayı güvenlik
// gereği tamamen engeller (canvas "tainted" hale gelir). Bu durumda
// otomatik algılama o video için çalışmaz; kullanıcı popup'tan otomatik
// algılamayı kapatıp sabit mod seçebilir ya da Alt+Shift+D kısayoluyla
// o sayfadaki videoyu elle aç/kapat yapabilir.

(() => {
  const DEFAULTS = {
    globalEnabled: true,
    autoDetect: true,
    threshold: 140, // 0-255 parlaklık; yüksek = sadece çok açık kareler karanlığa çevrilir
    mode: 'invert', // 'invert' | 'dim'
    disabledSites: [],
    fallbackWhenBlocked: false // piksel okunamadığında (CORS) ne yapılacağı
  };

  const CHECK_INTERVAL_MS = 1500;
  const SAMPLE_W = 16;
  const SAMPLE_H = 9;

  let settings = { ...DEFAULTS };
  let pageForce = null; // null: ayarları takip et, true/false: bu sayfa için geçici zorlama

  // --- Anlık sayfa geneli aç/kapat (klavye kısayolu / popup butonu) ---
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === 'TOGGLE_PAGE_DARK') {
      pageForce = pageForce === true ? false : true;
      retickAllVideos();
    }
  });

  // --- Ayarları yükle ---
  chrome.storage.local.get(DEFAULTS, (stored) => {
    settings = { ...DEFAULTS, ...stored };
    start();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    let changed = false;
    for (const key of Object.keys(changes)) {
      if (key in DEFAULTS) {
        settings[key] = changes[key].newValue;
        changed = true;
      }
    }
    if (changed) retickAllVideos();
  });

  // --- Video takibi ---
  const knownVideos = new Set();
  const intervals = new WeakMap();

  function start() {
    scan(document);
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.tagName === 'VIDEO') initVideo(node);
          else if (node.querySelectorAll) scan(node);
        });
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function scan(root) {
    root.querySelectorAll?.('video').forEach(initVideo);
  }

  function initVideo(video) {
    if (knownVideos.has(video)) return;
    knownVideos.add(video);
    tick(video);
    video.addEventListener('play', () => startLoop(video));
    video.addEventListener('pause', () => stopLoop(video));
    video.addEventListener('emptied', () => stopLoop(video));
    if (!video.paused) startLoop(video);
  }

  function startLoop(video) {
    if (intervals.has(video)) return;
    intervals.set(video, setInterval(() => tick(video), CHECK_INTERVAL_MS));
  }

  function stopLoop(video) {
    const id = intervals.get(video);
    if (id) {
      clearInterval(id);
      intervals.delete(video);
    }
  }

  function retickAllVideos() {
    knownVideos.forEach(tick);
  }

  // --- Karar mantığı ---
  function tick(video) {
    if (!document.body.contains(video)) {
      stopLoop(video);
      knownVideos.delete(video);
      return;
    }

    if (pageForce !== null) {
      setDark(video, pageForce);
      return;
    }

    if (!settings.globalEnabled) return setDark(video, false);
    if (settings.disabledSites.includes(location.hostname)) return setDark(video, false);
    if (!settings.autoDetect) return setDark(video, true);

    const brightness = sampleBrightness(video);
    if (brightness === null) return setDark(video, settings.fallbackWhenBlocked);
    setDark(video, brightness >= settings.threshold);
  }

  function setDark(video, on) {
    video.classList.toggle('vdm-invert', on && settings.mode === 'invert');
    video.classList.toggle('vdm-dim', on && settings.mode === 'dim');
  }

  function sampleBrightness(video) {
    if (video.readyState < 2 || video.videoWidth === 0) return null;
    let canvas = video.__vdmCanvas;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = SAMPLE_W;
      canvas.height = SAMPLE_H;
      video.__vdmCanvas = canvas;
    }
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    try {
      ctx.drawImage(video, 0, 0, SAMPLE_W, SAMPLE_H);
      const { data } = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H);
      let sum = 0;
      const n = data.length / 4;
      for (let i = 0; i < data.length; i += 4) {
        sum += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      }
      return sum / n;
    } catch (err) {
      // Cross-origin / DRM video: canvas "tainted" oldu, tarayıcı piksel
      // okumayı engelliyor. Bu beklenen bir durum, hata değil.
      return null;
    }
  }
})();
