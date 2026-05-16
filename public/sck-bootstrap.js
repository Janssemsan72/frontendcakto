/**
 * Bootstrap síncrono do sck — executar ANTES do GTM.
 * Manter alinhado com src/utils/sckSession.ts
 */
(function () {
  try {
    var p = (window.location && window.location.pathname) || '';
    if (p === '/admin' || p.indexOf('/admin/') === 0 || p.indexOf('/app/admin') === 0) return;
  } catch (e) {
    return;
  }

  var TRACKING_KEY = 'musiclovely_tracking_params';
  var COOKIE_INDEX = 'index';
  var ENTRY_KEY = 'ml_sck_entry';

  function cookieDomain() {
    var h = (location.hostname || '').toLowerCase();
    if (h === 'localhost' || h === '127.0.0.1') return '';
    if (h.indexOf('musiclovely.online') !== -1) return '.musiclovely.online';
    if (h.indexOf('musiclovely.com.br') !== -1) return '.musiclovely.com.br';
    if (h.indexOf('musiclovely.com') !== -1) return '.musiclovely.com';
    return '';
  }

  function readSck() {
    try {
      var saved = localStorage.getItem(TRACKING_KEY);
      if (saved) {
        var j = JSON.parse(saved);
        if (j && j.sck) return String(j.sck);
      }
    } catch (e) {}
    try {
      var idx = localStorage.getItem(COOKIE_INDEX);
      if (idx) return String(idx);
    } catch (e) {}
    return null;
  }

  function generateSck() {
    var now = String(Date.now());
    var entry = now;
    try {
      var stored = sessionStorage.getItem(ENTRY_KEY);
      if (stored) entry = stored;
      else sessionStorage.setItem(ENTRY_KEY, entry);
    } catch (e) {}
    return entry + '_' + now;
  }

  function persist(sck) {
    try {
      var saved = localStorage.getItem(TRACKING_KEY);
      var params = saved ? JSON.parse(saved) : {};
      params.sck = sck;
      localStorage.setItem(TRACKING_KEY, JSON.stringify(params));
    } catch (e) {}
    try {
      localStorage.setItem(COOKIE_INDEX, sck);
      sessionStorage.setItem(COOKIE_INDEX, sck);
    } catch (e) {}
    try {
      var exp = new Date(Date.now() + 400 * 86400000).toUTCString();
      var domain = cookieDomain();
      var ck = COOKIE_INDEX + '=' + encodeURIComponent(sck) + ';expires=' + exp + ';path=/;SameSite=Lax';
      if (domain) ck += ';domain=' + domain;
      document.cookie = ck;
    } catch (e) {}
  }

  function ensureInUrl(sck) {
    try {
      var url = new URL(window.location.href);
      if (url.searchParams.has('sck')) return;
      url.searchParams.set('sck', sck);
      window.history.replaceState(null, '', url.toString());
    } catch (e) {}
  }

  var sck = readSck() || generateSck();
  persist(sck);
  window.__ML_SCK__ = sck;
  ensureInUrl(sck);

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'sck_ready', sck: sck });
})();
