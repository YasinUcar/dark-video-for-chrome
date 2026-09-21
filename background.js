const DEFAULTS = {
  globalEnabled: true,
  autoDetect: true,
  threshold: 140,
  mode: 'invert',
  disabledSites: [],
  fallbackWhenBlocked: false
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(DEFAULTS, (stored) => {
    chrome.storage.local.set({ ...DEFAULTS, ...stored });
  });
});

chrome.commands.onCommand.addListener((command) => {
  if (command !== 'toggle-dark') return;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.id != null) {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_PAGE_DARK' });
    }
  });
});
