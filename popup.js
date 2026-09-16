const DEFAULTS={enabled:true,mode:'smart',invert:.92,brightness:.90,contrast:1.02,saturation:.90,whiteThreshold:.62};
const $=id=>document.getElementById(id);

chrome.storage.sync.get(DEFAULTS,s=>{
  $('enabled').checked=s.enabled;
  $('mode').value=s.mode;
  $('invert').value=s.invert;
  $('brightness').value=s.brightness;
});

$('save').addEventListener('click',()=>{
  chrome.storage.sync.set({
    enabled:$('enabled').checked,
    mode:$('mode').value,
    invert:+$('invert').value,
    brightness:+$('brightness').value
  },()=>{
    $('status').textContent='Settings applied';
  });
});
