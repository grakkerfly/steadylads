'use strict';

// EDIT THESE THREE VALUES. Leave empty until your links / contract are ready.
function siteLinks() {
  return {
    twitter: 'https://x.com/holdsteadylads', // e.g. https://x.com/your_account
    pumpfun: 'https://pump.fun', // e.g. https://pump.fun/coin/YOUR_CONTRACT
    contract: 'contract address' // Solana contract address to copy
  };
}

const links = siteLinks();
const navStatus = document.querySelector('#nav-status');
let navStatusTimer;
function showNavStatus(message) {
  clearTimeout(navStatusTimer);
  navStatus.textContent = message;
  navStatusTimer = setTimeout(() => { navStatus.textContent = ''; }, 3000);
}
for (const key of ['twitter', 'pumpfun']) {
  const link = document.querySelector('#' + key + '-link');
  const url = links[key].trim();
  if (/^https?:\/\//i.test(url)) link.href = url;
  else {
    link.href = '#';
    link.addEventListener('click', event => {
      event.preventDefault();
      showNavStatus(key + ' link coming soon');
    });
  }
}
if (links.contract.trim()) document.querySelector('.contract span').textContent = links.contract.trim();
document.querySelector('#copy-contract').addEventListener('click', async () => {
  const address = links.contract.trim();
  if (!address) { showNavStatus('contract not deployed yet'); return; }
  try {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(address);
    } catch {
      const field = document.createElement('textarea');
      field.value = address;
      field.style.cssText = 'position:fixed;left:-9999px;top:0;';
      document.body.append(field);
      let copied;
      try { field.select(); copied = document.execCommand('copy'); }
      finally { field.remove(); document.querySelector('#copy-contract').focus(); }
      if (!copied) throw new Error('Copy failed');
    }
    showNavStatus('contract copied!');
  } catch { showNavStatus('could not copy — select the address below'); }
});

const deploy = document.querySelector('#deploy');
const total = document.querySelector('#count');
const status = document.querySelector('#deployment-status');
const gain = document.querySelector('#capital-gain');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const replies = ['done. do you feel better?', 'ok that should fix it', 'the dip got bigger', 'maybe one more', 'please stop checking the chart', 'we are so back (unconfirmed)', 'still deploying, lads'];
let clicks = 0, displayed = 0, countFrame = 0, rainPromise;
const format = value => '$' + Math.round(value).toLocaleString('en-US');
function loadRain() {
 if (reduced.matches) return Promise.resolve(null);
 if (!rainPromise) rainPromise = window.createMoneyRain(document.querySelector('#money-layer')).catch(error => {
   rainPromise = null;
   status.textContent = '3D could not start. Please enable WebGL in your browser.';
   console.error('3D money rain:', error);
   return null;
 });
 return rainPromise;
}
function pulse(element, frames, duration) {
  if (!element || typeof element.animate !== 'function') return;
  element.getAnimations().forEach(a => a.cancel());
  element.animate(frames, {duration, easing: 'cubic-bezier(.22,1,.36,1)'});
}
deploy.addEventListener('pointerenter', loadRain, {once:true});
deploy.addEventListener('focus', loadRain, {once:true});
if ('requestIdleCallback' in window) requestIdleCallback(loadRain, {timeout:1800});
else setTimeout(loadRain, 600);
deploy.addEventListener('click', () => {
  clicks++;
  const target = clicks * 1000000, from = displayed, started = performance.now();
  status.textContent = replies[(clicks - 1) % replies.length];
  cancelAnimationFrame(countFrame);
  if (reduced.matches) { displayed = target; total.textContent = format(target); return; }
  function count(now) {
    const t = Math.min(1, (now - started) / 850);
    displayed = from + (target - from) * (1 - Math.pow(1 - t, 4));
    total.textContent = format(displayed);
    if (t < 1) countFrame = requestAnimationFrame(count);
  }
  countFrame = requestAnimationFrame(count);
  pulse(deploy, [
    {transform:'scale(1)',background:'#efefef',color:'#000',boxShadow:'0 0 0 0 #42dc7b00'},
    {offset:.18,transform:'scale(1.045)',background:'#7af1a1',color:'#09391c',boxShadow:'0 0 30px 8px #42dc7b55'},
    {transform:'scale(1)',background:'#efefef',color:'#000',boxShadow:'0 0 0 18px #42dc7b00'}
  ], 900);
  pulse(total, [
    {transform:'scale(1)',color:'#18492d',textShadow:'0 0 0 #42dc7b00'},
    {offset:.22,transform:'scale(1.09)',color:'#12a84b',textShadow:'0 0 24px #42dc7b66'},
    {transform:'scale(1)',color:'#18492d',textShadow:'0 0 0 #42dc7b00'}
  ], 1050);
  gain.textContent = '+$1,000,000';
  pulse(gain, [{opacity:0,transform:'translate(-50%,10px)'},{offset:.15,opacity:1,transform:'translate(-50%,0)'},{opacity:0,transform:'translate(-50%,-32px)'}], 1100);
  loadRain().then(rain => { if (!reduced.matches) rain?.burst(); });
});

