/* TapMind mockup kit. Build any interactive TapMind-style mockup from a plain spec. No dependencies.
   TapMindKit.build(el, specOrPresetName, overrides) -> { el, frame, spec, play(), reset() }
   See references/kit-api.md for the full spec. */
(function (g) {
  'use strict';

  var BASE = { web: 560, app: 280, feed: 280, tv: 640, game: 600, dashboard: 680, bare: 560 };
  var RATIO = { web: '16 / 11', app: '10 / 17', feed: '10 / 17', tv: '16 / 9', game: '19.5 / 9', dashboard: '16 / 10', bare: 'auto' };
  var KF = {
    'slide-right': 'tmSlideRight', 'slide-left': 'tmSlideLeft', 'slide-up': 'tmSlideUp', 'slide-down': 'tmSlideDown',
    'dock': 'tmDock', 'fade-scale': 'tmFadeScale', 'pop': 'tmPop', 'detach': 'tmDetach', 'rise': 'tmRise',
    'fade': 'tmFade', 'grow-y': 'tmGrowY', 'grow-x': 'tmGrowX'
  };
  var EASE_SCROLL = 'cubic-bezier(.4,0,.2,1)';
  var SIZE = { br: [46, '88u'], bl: [46, '88u'], tr: [46, '88u'], tl: [46, '88u'], bottom: [100, '74u'], top: [100, '64u'],
    full: [100, 100], behind: [100, 100], center: [64, 56], 'right-rail': [30, 100] };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // 40 -> 40%, '88u' -> scaled px, anything else passes through as CSS.
  function len(v) {
    if (typeof v === 'number') return v + '%';
    var m = /^(-?\d*\.?\d+)u$/.exec(String(v));
    return m ? 'calc(' + m[1] + 'px * var(--s))' : String(v);
  }
  // Animation attributes for one element. o.at is the start (ms from play), o.dur the length.
  function A(o, kfDefault, offset, extra) {
    if (!o || o.at == null) return { c: '', s: extra || '' };
    var kf = KF[o.enter] || o.enter || kfDefault || 'tmFadeScale';
    var at = o.at + (offset || 0);
    return { c: ' tm-anim', s: '--tm-kf:' + kf + ';--at:' + at + 'ms;--dur:' + (o.dur || 560) + 'ms;' + (o.ease ? '--ease:' + o.ease + ';' : '') + (extra || '') };
  }
  function tag(t, cls, a, inner, more) { return '<' + t + ' class="' + cls + a.c + '"' + (a.s ? ' style="' + a.s + '"' : '') + (more || '') + '>' + (inner || '') + '</' + t + '>'; }
  var NONE = { c: '', s: '' };
  function kid(o, i, kf, extra) { return o.at == null ? { c: '', s: extra || '' } : A(o, kf, i * (o.stagger == null ? 110 : o.stagger), extra); }
  var LW = [100, 88, 100, 62, 94, 76];
  function lines(n, start) { var h = ''; for (var i = 0; i < n; i++) h += '<span class="tm-w" style="width:' + LW[(i + (start || 0)) % LW.length] + '%"></span>'; return h; }
  function rep(n, f) { var h = ''; for (var i = 0; i < n; i++) h += f(i); return h; }

  var BLOCKS = {
    head: function (o) { return '<span class="tm-w tm-w--head" style="width:' + (o.w || 76) + '%"></span>'; },
    byline: function (o) { return '<span class="tm-w tm-w--byline" style="width:' + (o.w || 34) + '%"></span>'; },
    sub: function (o) { return '<span class="tm-w tm-w--sub" style="width:' + (o.w || 48) + '%"></span>'; },
    lines: function (o) { return lines(o.n || 3, o.start); },
    media: function (o) { return '<div class="tm-media" style="height:' + len(o.h || '74u') + '"></div>'; },
    hero: function (o) { return '<div class="tm-media" style="height:' + len(o.h || '130u') + ';margin:0"></div>'; },
    player: function (o) { return '<div class="tm-media tm-media--player" style="height:' + len(o.h || '96u') + '"><span class="tm-glyph-play"></span><span class="tm-vbar"><i></i></span></div>'; },
    cards: function (o) { return '<div class="tm-grid" style="--cols:' + (o.cols || 3) + '">' + rep(o.n || o.cols || 3, function (i) { var a = kid(o, i, 'tmRise', '--ratio:' + (o.ratio || '1') + ';'); return tag('span', 'tm-tile', a); }) + '</div>'; },
    rail: function (o) { return '<div class="tm-rail">' + (o.title === false ? '' : '<span class="tm-w tm-w--rail"></span>') + '<div class="tm-rail-row" style="--cols:' + (o.cols || 4.3) + '">' + rep(o.n || 6, function (i) { return tag('span', 'tm-tile', kid(o, i, 'tmRise')); }) + '</div></div>'; },
    post: function (o) { return '<div class="tm-post"><div class="tm-post-head"><span class="tm-av"></span><span class="tm-w" style="width:46%"></span></div><div class="tm-media" style="height:' + len(o.h || '120u') + ';margin:0"></div>' + lines(o.n || 2) + '<div class="tm-post-act"><i></i><i></i><i></i></div></div>'; },
    list: function (o) { return '<div class="tm-list">' + rep(o.n || 4, function (i) { return tag('div', 'tm-row', kid(o, i, 'tmFade'), '<i></i><span class="tm-w" style="width:' + LW[i % 6] + '%"></span>'); }) + '</div>'; },
    search: function () { return '<div class="tm-search"><i></i><span></span></div>'; },
    result: function (o) { return '<div class="tm-result"><span class="tm-w tm-w--link" style="width:58%"></span><span class="tm-w tm-w--url" style="width:32%"></span>' + lines(o.n || 2, 1) + '</div>'; },
    sponsored: function (o) { return '<span class="tm-tag tm-tag--sponsored">' + esc(o.label || 'Sponsored') + '</span><span class="tm-w tm-w--link" style="width:62%"></span><span class="tm-w tm-w--url" style="width:30%"></span>' + lines(2, 1); },
    native: function (o) { return '<span class="tm-tag tm-tag--sponsored">' + esc(o.label || 'Sponsored') + '</span><div class="tm-media" style="height:' + len(o.h || '110u') + '"></div>' + lines(2) + '<span class="tm-cta">' + esc(o.cta || 'Learn more') + '</span>'; },
    products: function (o) { return '<div class="tm-products" style="--cols:' + (o.cols || 2) + '">' + rep(o.n || 2, function (i) { return tag('div', 'tm-product', kid(o, i, 'tmRise'), '<span class="tm-tile"></span><span class="tm-w" style="width:80%"></span><span class="tm-price"></span>'); }) + '</div>'; },
    button: function (o) { return '<span class="tm-btn">' + esc(o.label || '') + '</span>'; },
    kpis: function (o) { var labels = o.labels || []; var n = o.n || labels.length || 3; return '<div class="tm-kpis" style="--cols:' + n + '">' + rep(n, function (i) { return tag('div', 'tm-kpi' + (o.accent === i ? ' tm-kpi--on' : ''), kid(o, i, 'tmRise'), (labels[i] ? '<b>' + esc(labels[i]) + '</b>' : '<span class="tm-w" style="width:50%"></span>') + '<i></i>'); }) + '</div>'; },
    chart: function (o) { var bars = o.bars || [40, 58, 50, 70, 64, 82]; return '<div class="tm-chart" style="height:' + len(o.h || '120u') + '">' + bars.map(function (b, i) { return tag('span', 'tm-bar' + (o.accent === i ? ' is-on' : ''), kid(o, i, 'tmGrowY', 'height:' + b + '%;')); }).join('') + '</div>'; },
    table: function (o) { var c = o.cols || 3; return '<div class="tm-table">' + tag('div', 'tm-tr tm-tr--head', NONE, rep(c + 1, function () { return '<i></i>'; }), ' style="--cols:' + c + '"') + rep(o.rows || 4, function (i) { return tag('div', 'tm-tr', kid(o, i, 'tmFade', '--cols:' + c + ';'), rep(c + 1, function () { return '<i></i>'; })); }) + '</div>'; },
    playfield: function (o) { var c = o.cols || 7; return '<div class="tm-field" style="--cols:' + c + '">' + rep(c * (o.rows || 3), function () { return '<span class="tm-gem"></span>'; }) + '</div>'; },
    flow: function (o) { var nodes = o.nodes || ['A', 'B', 'C']; var st = o.stagger == null ? 420 : o.stagger; return '<div class="tm-flow" style="--n:' + nodes.length + '">' + nodes.map(function (n, i) {
      var na = o.at == null ? NONE : A({ at: o.at + i * st, dur: o.dur || 420, enter: o.enter || 'pop' });
      var la = o.at == null ? NONE : A({ at: o.at + i * st + (o.dur || 420) - 80, dur: st - 60, enter: 'grow-x', ease: 'linear' });
      return '<div class="tm-node-wrap">' + tag('span', 'tm-node' + (o.accent === i ? ' is-on' : ''), na, esc(n)) + (i < nodes.length - 1 ? tag('span', 'tm-link', la) : '') + '</div>';
    }).join('') + '</div>'; },
    text: function (o) { return '<p class="tm-text" style="font-size:' + len((o.size || 13) + 'u') + ';font-weight:' + (o.weight || 500) + '">' + esc(o.text || '') + '</p>'; },
    spacer: function (o) { return '<span style="display:block;height:' + len(o.h || '12u') + '"></span>'; }
  };
  var WHOLE = { sponsored: 'tm-result tm-result--sponsored', native: 'tm-native' };
  var STAGGERED = { cards: 1, rail: 1, list: 1, products: 1, kpis: 1, chart: 1, table: 1, flow: 1 };

  function block(item) {
    var type = typeof item === 'string' ? item : Array.isArray(item) ? item[0] : item.type;
    var o = Array.isArray(item) ? (item[1] || {}) : typeof item === 'object' ? item : {};
    var f = BLOCKS[type];
    if (!f) { console.warn('[TapMindKit] unknown block', type); return ''; }
    var html = f(o);
    if (WHOLE[type]) return tag('div', WHOLE[type], STAGGERED[type] ? NONE : A(o, 'tmRise'), html);
    if (!STAGGERED[type] && o.at != null) return tag('div', 'tm-blk', A(o, 'tmRise'), html, ' style="display:grid;gap:inherit"');
    return html;
  }

  function insets(place, W, H, m) {
    var r = function (a, b) { return 'calc(100% - ' + a + ' - ' + b + ')'; };
    var half = function (x) { return 'calc((100% - ' + x + ') / 2)'; };
    switch (place) {
      case 'br': return [r(m, H), m, m, r(m, W)];
      case 'bl': return [r(m, H), r(m, W), m, m];
      case 'tr': return [m, m, r(m, H), r(m, W)];
      case 'tl': return [m, r(m, W), r(m, H), m];
      case 'bottom': return [r('0px', H), '0', '0', '0'];
      case 'top': return ['0', '0', r('0px', H), '0'];
      case 'center': return [half(H), half(W), half(H), half(W)];
      case 'right-rail': return ['0', '0', '0', r('0px', W)];
      default: return ['0', '0', '0', '0'];
    }
  }

  var CREATIVES = {
    standard: function () { return '<div class="tm-cr"><span class="tm-cr-brand"></span><span class="tm-cr-l" style="width:62%"></span><span class="tm-cr-l" style="width:42%"></span><span class="tm-cta">Learn more</span></div>'; },
    impact: function () { return '<div class="tm-cr"><span class="tm-impact-play"></span><span class="tm-cr-brand"></span><span class="tm-cr-l" style="width:62%"></span><span class="tm-cr-l" style="width:42%"></span><span class="tm-cta">Learn more</span></div>'; },
    video: function () { return '<span class="tm-glyph-play"></span><span class="tm-vbar"><i></i></span>'; },
    campaign: function (L) { var c = L.campaign || {}; return '<div class="tm-camp-shot"><img src="' + esc(c.src) + '" alt="' + esc(c.alt || '') + '"></div><div class="tm-camp-copy"><span class="tm-cr-brand"></span><strong>' + esc(c.headline || 'Your campaign headline') + '</strong><span class="tm-cta">' + esc(c.cta || 'Learn more') + '</span></div>'; },
    reward: function (L) { var p = A({ at: (L.at || 0) + (L.dur || 560), dur: L.progress || 2000, enter: 'grow-x', ease: 'linear' }); return '<span class="tm-pill">' + esc(L.text || 'Reward after the video') + '</span><span class="tm-glyph-play"></span>' + tag('span', 'tm-progress', NONE, tag('i', '', p)); },
    endcard: function (L) { return '<span class="tm-app-icon"></span><span class="tm-cr-l" style="background:#1d1d1b;width:40%"></span><span class="tm-stars"><i></i><i></i><i></i><i></i><i></i></span><span class="tm-install">' + esc(L.cta || 'Install') + '</span>'; },
    lbar: function () { return '<div class="tm-lbar-copy"><span class="tm-cr-brand"></span><span class="tm-cr-l" style="width:80%"></span><span class="tm-cr-l" style="width:56%"></span><span class="tm-cta">Learn more</span></div>'; },
    panel: function (L) { return '<div class="tm-cr"><span class="tm-cr-title">' + esc(L.title || '') + '</span>' + (L.body ? '<span class="tm-cr-body">' + esc(L.body) + '</span>' : '') + '</div>'; },
    sheet: function (L) { return '<div class="tm-cr"><span class="tm-handle"></span>' + (L.title ? '<span class="tm-cr-title">' + esc(L.title) + '</span>' : '<span class="tm-cr-l" style="background:#1d1d1b;width:54%;height:calc(11px * var(--s))"></span>') + '<span class="tm-cr-l" style="background:#eeeeea;width:88%"></span><span class="tm-cr-l" style="background:#eeeeea;width:64%"></span><span class="tm-cta" style="background:#fe5f00;color:#fff">' + esc(L.cta || 'Learn more') + '</span></div>'; },
    toast: function (L) { return esc(L.text || ''); }
  };
  var IS_AD = { standard: 1, impact: 1, video: 1, campaign: 1, reward: 1, endcard: 1, lbar: 1, sheet: 1 };
  var CR_CLASS = { standard: 'tm-cr--standard', impact: 'tm-cr--impact', video: 'tm-cr--video', campaign: 'tm-cr--campaign', reward: 'tm-cr--reward', endcard: 'tm-cr--endcard', lbar: 'tm-cr--lbar', panel: 'tm-cr--panel', sheet: 'tm-cr--sheet', toast: 'tm-cr--toast tm-cr' };

  function layer(L, i, S) {
    var place = L.place || 'br', d = SIZE[place] || SIZE.br, cr = L.creative || 'standard';
    var ins = insets(place, len(L.w == null ? d[0] : L.w), len(L.h == null ? d[1] : L.h), len(L.margin || '14u'));
    var to = S.page && S.page.squeeze ? '--to:' + (S.page.squeeze.to || .76) + ';' : '';
    var a = A(L, place === 'behind' ? 'tmFade' : 'tmFadeScale', 0, to);
    var showTag = L.tag == null ? !!IS_AD[cr] : L.tag;
    var inner = (showTag ? '<span class="tm-tag tm-tag--ad">Ad</span>' : '') + (CREATIVES[cr] || CREATIVES.standard)(L) + (L.expand ? '<span class="tm-exp" aria-hidden="true"></span>' : '');
    var more = L.expand ? ' role="button" tabindex="0" aria-expanded="false" aria-label="' + esc(L.label || 'Expand') + '"' : '';
    var close = L.closable ? tag('button', 'tm-x', a, '<i></i>', ' type="button" aria-label="' + esc(L.closeLabel || 'Close') + '"') : '';
    return '<div class="tm-layer tm-layer--' + place + (L.expand ? ' tm-layer--expand' : '') + '" data-layer="' + i + '" style="top:' + ins[0] + ';right:' + ins[1] + ';bottom:' + ins[2] + ';left:' + ins[3] + ';' + (L.z != null ? 'z-index:' + L.z + ';' : '') + '">'
      + tag('div', 'tm-layer-in ' + (CR_CLASS[cr] || ''), a, inner, more) + close + '</div>';
  }

  var REPLAY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"></path><path d="M3.2 4.6v4.2h4.2"></path></svg>';
  var EXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"></path><path d="M8 7h9v9"></path></svg>';
  var PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="width:14px;height:14px"><path d="M7 5v14l12-7z"></path></svg>';

  function html(S) {
    var f = S.frame || 'web', P = S.page || {};
    var top = '', bottom = '', side = '';
    if (f === 'web' || f === 'dashboard') top = '<div class="tm-chrome"><span class="tm-dots"><i></i><i></i><i></i></span><span class="tm-url"></span></div>';
    if (f === 'dashboard') side = '<div class="tm-side"><span class="tm-side-logo"></span><i class="is-on"></i><i></i><i></i><i></i><i></i></div>';
    if (f === 'app' || f === 'feed') { top = '<div class="tm-apptop"><span class="tm-apptitle"></span><span class="tm-appico"></span></div>'; bottom = '<div class="tm-apptabs"><i class="is-on"></i><i></i><i></i><i></i></div>'; }
    if (f === 'game') top = '<div class="tm-hud"><span class="tm-hud-pill"></span><span class="tm-hud-pill tm-hud-pill--s"></span></div>';
    var sq = P.squeeze ? A({ at: P.squeeze.at, dur: P.squeeze.dur || 700, enter: 'tmSqueeze', ease: EASE_SCROLL }, null, 0, '--to:' + (P.squeeze.to || .76) + ';') : NONE;
    var sc = P.scroll ? A({ at: P.scroll.at, dur: P.scroll.dur || 900, enter: 'tmScroll', ease: EASE_SCROLL }, null, 0, '--by:' + (P.scroll.by || '-30%') + ';') : NONE;
    var dim = P.dim ? tag('div', 'tm-dim', A({ at: P.dim.at, dur: P.dim.dur || 400, enter: 'tmDim', ease: 'ease' }, null, 0, '--to:' + (P.dim.to || .45) + ';')) : '';
    var doc = tag('div', 'tm-docwrap', sq, tag('div', 'tm-doc', sc, (S.content || []).map(block).join('')));
    var layers = (S.layers || []).map(function (L, i) { return layer(L, i, S); }).join('');
    var interactive = (S.layers || []).some(function (L) { return L.closable || L.expand; });
    var role = interactive ? ' role="group"' : ' role="img"';
    var ratio = S.ratio || RATIO[f];
    var start = S.start === 'click' ? '<button type="button" class="tm-start" aria-label="' + esc(S.startLabel || 'Play demo') + '"><span>' + PLAY + esc(S.startLabel || 'Play demo') + '</span></button>' : '';
    var C = S.controls || {};
    var tools = (C.replay || C.live || C.caption) ? '<div class="tm-tools">' + (C.caption ? '<p class="tm-cap" aria-live="polite"><strong>' + esc(C.caption) + '</strong>' + (C.note ? '<span>' + esc(C.note) + '</span>' : '') + '</p>' : '<span></span>')
      + '<div class="tm-acts">' + (C.replay ? '<button type="button" class="tm-replay">' + REPLAY + 'Replay</button>' : '')
      + (C.live ? '<a class="tm-live" href="' + esc(C.live.href) + '" target="_blank" rel="noreferrer" aria-label="' + esc((C.live.label || 'View Live Preview') + ' (opens in a new tab)') + '">' + esc(C.live.label || 'View Live Preview') + EXT + '</a>' : '') + '</div></div>' : '';
    return '<div class="tm-mock tm-mock--' + f + '"' + (S.maxWidth ? ' style="--tm-max:' + S.maxWidth + '"' : '') + '>'
      + '<div class="tm-frame tm-frame--' + f + '"' + role + ' aria-label="' + esc(S.label || 'Interactive mockup') + '" style="aspect-ratio:' + ratio + '">'
      + top + '<div class="tm-view">' + side + '<div class="tm-stage">' + doc + dim + layers + '</div></div>' + bottom + start + '</div>'
      + tools + '</div>';
  }

  function reduced() { return (g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches) || document.documentElement.classList.contains('no-motion'); }
  (function guard() { var t = false; requestAnimationFrame(function () { t = true; }); setTimeout(function () { if (!t) document.documentElement.classList.add('no-motion'); }, 400); })();

  // Restart: remove, force reflow, re-add on the next frame. The timeout covers throttled tabs and
  // iframes where requestAnimationFrame never fires, so the end state is always reached.
  function play(node) {
    node.classList.remove('tm-play');
    void node.offsetWidth;
    var done = false, add = function () { if (!done) { done = true; node.classList.add('tm-play'); } };
    requestAnimationFrame(add);
    setTimeout(add, 60);
  }
  function scale(frame, S) {
    var base = S.base || BASE[S.frame || 'web'], lo = S.minScale || .4, hi = S.maxScale || 2.2;
    var set = function () { var w = frame.getBoundingClientRect().width; if (w) frame.style.setProperty('--s', Math.max(lo, Math.min(hi, w / base)).toFixed(3)); };
    set();
    requestAnimationFrame(set);
    setTimeout(set, 60);
    setTimeout(set, 400);
    if (g.ResizeObserver) { var ro = new ResizeObserver(set); ro.observe(frame); if (frame.parentNode) ro.observe(frame.parentNode); }
    g.addEventListener('resize', set);
  }
  function budget(S) {
    var end = 0, push = function (o, extra) { if (o && o.at != null) end = Math.max(end, o.at + (o.dur || 560) + (extra || 0)); };
    var P = S.page || {}; push(P.scroll); push(P.squeeze); push(P.dim);
    (S.layers || []).forEach(function (L) { push(L, L.creative === 'reward' ? (L.progress || 2000) : 0); });
    (S.content || []).forEach(function (b) { var o = Array.isArray(b) ? b[1] : b; if (o && o.at != null) { var n = (o.n || o.rows || (o.bars || o.nodes || []).length || 1) - 1; push(o, n * (o.stagger == null ? 110 : o.stagger)); } });
    if (end > 4200) console.warn('[TapMindKit] "' + (S.label || '') + '" runs ' + end + 'ms. Keep demonstrations between 2.5 and 4 seconds.');
    return end;
  }
  function track(S, action, label) {
    g.dispatchEvent(new CustomEvent('tapmind:track', { detail: { action: action, label: label } }));
    if (S.onTrack) S.onTrack(action, label);
  }
  function merge(a, b) { var o = {}, k; for (k in a) o[k] = a[k]; for (k in (b || {})) o[k] = b[k]; return o; }

  function build(el, spec, overrides) {
    var S = typeof spec === 'string' ? merge(PRESETS[spec], overrides) : merge(spec, overrides);
    if (!S || !S.frame && !S.content) throw new Error('[TapMindKit] empty spec or unknown preset: ' + spec);
    el.innerHTML = html(S);
    var root = el.firstElementChild, frame = root.querySelector('.tm-frame');
    scale(frame, S);
    S.duration = budget(S);
    function reset() {
      Array.prototype.forEach.call(root.querySelectorAll('.tm-layer'), function (n) { n.classList.remove('is-closed', 'is-expanded'); });
      Array.prototype.forEach.call(root.querySelectorAll('[aria-expanded]'), function (n) { n.setAttribute('aria-expanded', 'false'); });
    }
    var ctl = { el: root, frame: frame, spec: S, reset: reset, play: function () { reset(); play(frame); } };
    function toggle(t) {
      var L = t.closest('.tm-layer'), on = !L.classList.contains('is-expanded');
      L.classList.add('is-resizing');
      clearTimeout(L._rz);
      L._rz = setTimeout(function () { L.classList.remove('is-resizing'); }, 320);
      L.classList.toggle('is-expanded', on); t.setAttribute('aria-expanded', on ? 'true' : 'false'); track(S, on ? 'Expand' : 'Collapse', S.label); }
    root.addEventListener('click', function (e) {
      var t;
      if ((t = e.target.closest('.tm-x'))) { t.closest('.tm-layer').classList.add('is-closed'); track(S, 'Close', S.label); return; }
      if ((t = e.target.closest('.tm-layer-in[aria-expanded]'))) { toggle(t); return; }
      if ((t = e.target.closest('.tm-replay'))) { ctl.play(); track(S, 'Replay', S.label); return; }
      if ((t = e.target.closest('.tm-start'))) { t.hidden = true; ctl.play(); track(S, 'Play', S.label); return; }
      if (e.target.closest('.tm-live')) track(S, 'View Live Preview', S.label);
    });
    root.addEventListener('keydown', function (e) {
      var t = e.target.closest('.tm-layer-in[aria-expanded]');
      if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(t); }
      if (e.key === 'Escape') { var x = root.querySelector('.tm-layer.is-expanded'); if (x) toggle(x.querySelector('[aria-expanded]')); }
    });
    var start = S.start || 'visible';
    if (start === 'click') { if (reduced()) { /* wait for the tap, end state applies instantly */ } }
    else if (start === 'auto' || reduced() || !g.IntersectionObserver) play(frame);
    else { var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); play(frame); } }, { threshold: S.threshold || 0.28 }); io.observe(frame); }
    return ctl;
  }

  /* Presets: worked examples of the method in references/recipe.md. Copy one and change it. */
  var ARTICLE = ['head', 'byline', ['lines', { n: 2 }], 'media', ['lines', { n: 4 }], ['media', { h: '44u' }], ['lines', { n: 4 }], 'sub', ['lines', { n: 3 }]];
  var PRESETS = {
    'web-slider': { frame: 'web', label: 'Slider ad on an article page', content: ARTICLE,
      layers: [{ creative: 'standard', place: 'br', at: 420, dur: 620, enter: 'slide-right' }],
      controls: { caption: 'Slider Ads', replay: true } },
    'web-stayon': { frame: 'web', label: 'StayOn ad docked while the article scrolls', content: ARTICLE,
      page: { scroll: { by: '-14%', at: 700, dur: 1100 } },
      layers: [{ creative: 'standard', place: 'bottom', at: 380, dur: 560, enter: 'dock' }],
      controls: { caption: 'StayOn Ads', replay: true } },
    'web-expand': { frame: 'web', label: 'Slider ad that expands when tapped', content: ARTICLE,
      layers: [{ creative: 'impact', place: 'br', at: 420, dur: 620, enter: 'slide-right', expand: true, label: 'Expand the ad' }],
      controls: { caption: 'Tap the ad to expand it', note: 'Press Escape or tap again to collapse', replay: true } },
    'ctv-lbar': { frame: 'tv', label: 'CTV L-bar ad squeezing the programme', content: [['hero', { h: '150u' }], ['rail', { n: 6 }], ['rail', { n: 6 }]],
      page: { squeeze: { to: .74, at: 600, dur: 700 } },
      layers: [{ creative: 'lbar', place: 'behind', at: 700, dur: 500, enter: 'fade' }],
      controls: { caption: 'CTV L-bar', replay: true } },
    'ctv-pause': { frame: 'tv', label: 'CTV pause ad over dimmed playback', content: [['player', { h: '190u' }], ['rail', { n: 6 }]],
      page: { dim: { at: 500, dur: 400, to: .5 } },
      layers: [{ creative: 'standard', place: 'center', w: 52, h: 44, at: 760, dur: 520, enter: 'fade-scale', closable: true }],
      controls: { caption: 'CTV pause ad', replay: true } },
    'game-rewarded': { frame: 'game', label: 'Rewarded video then end card in a mobile game', content: [['playfield', { cols: 9, rows: 3 }]],
      layers: [
        { creative: 'reward', place: 'full', at: 400, dur: 480, enter: 'fade-scale', progress: 2000, text: 'Reward after the video' },
        { creative: 'endcard', place: 'full', at: 3000, dur: 480, enter: 'fade-scale', closable: true, cta: 'Install' }],
      controls: { caption: 'Rewarded video', replay: true } },
    'feed-native': { frame: 'feed', label: 'Native ad appearing in a social feed', content: ['post', ['native', { at: 1100, dur: 620, enter: 'rise' }], 'post'],
      page: { scroll: { by: '-34%', at: 400, dur: 900 } },
      controls: { caption: 'In-feed native', replay: true } },
    'search-sponsored': { frame: 'web', label: 'Sponsored result at the top of search', content: ['search', ['sponsored', { at: 400, dur: 560, enter: 'slide-down' }], 'result', 'result', 'result'],
      controls: { caption: 'Sponsored search result', replay: true } },
    'app-checkout-sheet': { frame: 'app', label: 'Bottom sheet offer in a shopping app', content: [['products', { n: 2 }], ['lines', { n: 2 }], ['button', { label: 'Checkout' }]],
      page: { dim: { at: 600, dur: 300, to: .3 } },
      layers: [{ creative: 'sheet', place: 'bottom', h: 44, at: 700, dur: 560, enter: 'dock', closable: true, cta: 'Learn more' }],
      controls: { caption: 'App bottom sheet', replay: true } },
    'dashboard-reveal': { frame: 'dashboard', label: 'Reporting dashboard building up', content: [
        ['kpis', { labels: ['Revenue', 'Fill rate', 'eCPM'], accent: 0, at: 300, stagger: 120, dur: 420 }],
        ['chart', { bars: [38, 52, 46, 64, 58, 76, 70, 88], accent: 7, at: 700, stagger: 70, dur: 520 }],
        ['table', { rows: 4, at: 1500, stagger: 90, dur: 360 }]],
      controls: { caption: 'Product UI reveal', replay: true } },
    'flow-diagram': { frame: 'bare', ratio: '16 / 4', label: 'How a request flows through TapMind', content: [
        ['flow', { nodes: ['Your app', 'Your mediation', 'TapMind', 'Demand partners'], accent: 2, at: 300, stagger: 520, dur: 420 }]],
      controls: { replay: true } }
  };

  g.TapMindKit = { build: build, html: html, play: play, presets: PRESETS, blocks: BLOCKS, creatives: CREATIVES, keyframes: KF };
})(window);
