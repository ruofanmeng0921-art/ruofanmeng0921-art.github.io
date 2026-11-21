/* 背景音乐：嵌入两首官方 MV（YouTube 播放器）。
   进页面静音自动播放；页面第一次点击 / 轻触 / 按键后自动开声音（浏览器规定必须有一次操作才能出声）。
   右上角唱片按钮：暂停 / 继续。小窗可切歌、收起。 */
(function () {
  'use strict';
  if (window.__mrfMv) return; window.__mrfMv = true;
  // claude.ai 链接里 YouTube 播放器会被拦截、放不出声：这里先不显示，拿到音频文件或换到自己的网址后再启用
  if (/claudeusercontent\.com$|claude\.ai$/.test(location.hostname)) return;
  var LIST = [
    { id: 'l20AbWpEbQU', title: 'The Breakup Song', artist: 'Mateus Asato' },
    { id: '8XDMy7m8w7w', title: 'Your Love', artist: 'Lari Basilio' }
  ];
  var cur = 0, muted = true, paused = false, frame, box, ttl;
  function src(i) {
    var ids = LIST.map(function (t) { return t.id; });
    var rest = ids.slice(i + 1).concat(ids.slice(0, i + 1));
    return 'https://www.youtube-nocookie.com/embed/' + LIST[i].id + '?autoplay=1&mute=1&playsinline=1&controls=0&rel=0&modestbranding=1&enablejsapi=1&loop=1&playlist=' + rest.join(',') + '&origin=' + encodeURIComponent(location.origin);
  }
  function cmd(func, args) { try { frame.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: args || [] }), '*'); } catch (e) {} }
  function setTrigger() {
    var t = document.querySelector('.music-trigger');
    if (t) { t.setAttribute('data-playing', String(!paused && !muted)); t.setAttribute('aria-label', paused ? '继续播放背景音乐' : '暂停背景音乐'); t.title = (paused ? '点击播放 · ' : '点击暂停 · ') + LIST[cur].title + ' — ' + LIST[cur].artist; }
    if (box) { box.classList.toggle('is-muted', muted); box.classList.toggle('is-paused', paused); }
    if (ttl) ttl.innerHTML = '<b>' + LIST[cur].title + '</b><span>' + LIST[cur].artist + '</span>';
  }
  function unmute() { if (!muted) return; muted = false; cmd('unMute'); cmd('setVolume', [70]); if (!paused) cmd('playVideo'); setTrigger(); }
  function load(i) { cur = (i + LIST.length) % LIST.length; frame.src = src(cur); muted = true; paused = false; setTrigger(); setTimeout(unmuteIfActive, 1200); }
  var active = false;
  function unmuteIfActive() { if (active) { muted = true; unmute(); } }
  function mount() {
    if (box && document.body.contains(box)) return;
    if (document.querySelector('.mrf-mv')) return;
    box = document.createElement('div'); box.className = 'mrf-mv is-muted is-folded';   // 默认收起，只在后台播放
    box.innerHTML = '<div class="mrf-mv__screen"><iframe title="背景音乐 MV" allow="autoplay; encrypted-media; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin"></iframe><button type="button" class="mrf-mv__sound">轻点开启声音</button></div>' +
      '<div class="mrf-mv__bar"><span class="mrf-mv__disc" aria-hidden="true"></span><div class="mrf-mv__ttl"></div>' +
      '<button type="button" class="mrf-mv__btn" data-a="prev" aria-label="上一首">‹</button><button type="button" class="mrf-mv__btn" data-a="next" aria-label="下一首">›</button><button type="button" class="mrf-mv__btn mrf-mv__fold" data-a="fold" aria-label="展开 / 收起 MV"></button></div>';
    document.body.appendChild(box);
    frame = box.querySelector('iframe'); ttl = box.querySelector('.mrf-mv__ttl');
    frame.addEventListener('load', function () { setTimeout(function () { cmd('setVolume', [70]); if (active && !muted) cmd('unMute'); }, 600); });
    frame.src = src(0); setTrigger();
    box.addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b) return; ev.stopPropagation(); active = true;
      if (b.classList.contains('mrf-mv__sound')) { unmute(); return; }
      var a = b.getAttribute('data-a');
      if (a === 'prev') load(cur - 1); else if (a === 'next') load(cur + 1); else if (a === 'fold') box.classList.toggle('is-folded');
    });
    if (window.__mrfMvBound) return; window.__mrfMvBound = true;
    // 第一次与页面互动时自动开声音
    function first() { active = true; unmute(); ['pointerdown', 'keydown', 'touchstart'].forEach(function (e) { removeEventListener(e, first, true); }); }
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (e) { addEventListener(e, first, true); });
    // 右上角唱片：暂停 / 继续（拦截原播放器）
    document.addEventListener('click', function (ev) {
      var t = ev.target.closest && ev.target.closest('.music-trigger'); if (!t) return;
      ev.preventDefault(); ev.stopImmediatePropagation();
      if (muted) { paused = false; unmute(); cmd('playVideo'); }
      else { paused = !paused; cmd(paused ? 'pauseVideo' : 'playVideo'); }
      setTrigger();
    }, true);
    setInterval(setTrigger, 2000);
  }
  // 等页面框架渲染完成再挂载，避免被首屏重绘清掉
  function ready() { if (window.__rowanAppReady === true && document.readyState === 'complete') mount(); }
  addEventListener('rowan:app-ready', ready); addEventListener('load', function () { ready(); setTimeout(mount, 2500); }); ready();
})();
