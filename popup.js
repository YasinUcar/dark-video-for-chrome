const DEFAULTS = {
  globalEnabled: true,
  autoDetect: true,
  threshold: 140,
  mode: 'invert',
  disabledSites: [],
  fallbackWhenBlocked: false
};

const els = {
  globalEnabled: document.getElementById('globalEnabled'),
  autoDetect: document.getElementById('autoDetect'),
  threshold: document.getElementById('threshold'),
  thresholdRow: document.getElementById('thresholdRow'),
  thresholdValue: document.getElementById('thresholdValue'),
  modeInvert: document.getElementById('modeInvert'),
  modeDim: document.getElementById('modeDim'),
  siteToggle: document.getElementById('siteToggle'),
  siteLabel: document.getElementById('siteLabel'),
  pageForce: document.getElementById('pageForce')
};

let currentHostname = null;
let settings = { ...DEFAULTS };

function render() {
  els.globalEnabled.checked = settings.globalEnabled;
  els.autoDetect.checked = settings.autoDetect;
  els.threshold.value = settings.threshold;
  els.thresholdValue.textContent = settings.threshold;
  els.thresholdRow.style.display = settings.autoDetect ? 'flex' : 'none';
  (settings.mode === 'dim' ? els.modeDim : els.modeInvert).checked = true;

  if (currentHostname) {
    const disabled = settings.disabledSites.includes(currentHostname);
    els.siteLabel.textContent = currentHostname;
    els.siteToggle.textContent = disabled ? 'Bu sitede etkinleştir' : 'Bu sitede kapat';
  }
}

function save(partial) {
  Object.assign(settings, partial);
  chrome.storage.local.set(partial);
}

chrome.storage.local.get(DEFAULTS, (stored) => {
  settings = { ...DEFAULTS, ...stored };
  render();
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  if (tab && tab.url) {
    try { currentHostname = new URL(tab.url).hostname; } catch (e) {}
  }
  render();
});

els.globalEnabled.addEventListener('change', () => save({ globalEnabled: els.globalEnabled.checked }));
els.autoDetect.addEventListener('change', () => {
  save({ autoDetect: els.autoDetect.checked });
  els.thresholdRow.style.display = els.autoDetect.checked ? 'flex' : 'none';
});
els.threshold.addEventListener('input', () => {
  els.thresholdValue.textContent = els.threshold.value;
});
els.threshold.addEventListener('change', () => save({ threshold: Number(els.threshold.value) }));
els.modeInvert.addEventListener('change', () => { if (els.modeInvert.checked) save({ mode: 'invert' }); });
els.modeDim.addEventListener('change', () => { if (els.modeDim.checked) save({ mode: 'dim' }); });

els.siteToggle.addEventListener('click', () => {
  if (!currentHostname) return;
  const set = new Set(settings.disabledSites);
  if (set.has(currentHostname)) set.delete(currentHostname);
  else set.add(currentHostname);
  save({ disabledSites: Array.from(set) });
  render();
});

els.pageForce.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab) chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_PAGE_DARK' });
  });
});
