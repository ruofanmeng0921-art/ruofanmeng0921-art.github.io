/* Final alternating magazine cut. Original 18 tools, images and purposes stay intact. */
(function () {
  'use strict';
  if (window.__rowanToolkitMounted) return;
  window.__rowanToolkitMounted = true;

  var purposes = {
    'ChatGPT': '脚本 · 选题', '即梦': '画面生成', 'Cursor': '工具开发', 'HeyGen': '数字人',
    'Fish Audio': '克隆配音', 'Obsidian': '知识库', 'Nano Banana': '修图 · 生图', '剪映': '剪辑',
    'Lovart': '设计', 'Claude': '写作 · 开发', 'LibTV': '视频生成', '飞影数字人': '数字人口播',
    'Gemini': '资料研究', 'Seed Audio': '配乐', 'ChatCut': '智能剪辑', 'MiniMax': '视频生成',
    '百度一镜': '视频生成', 'Image2': '生图'
  };
  var angles = [-2.2, 2.2, -2.2];
  var section, ui, body;
  var titleLetters = [], tools = [], visible = false;
  var titleRaf = 0, observer = null;
  var initialHashPending = location.hash === '#toolkit';
  var reducedQuery = matchMedia('(prefers-reduced-motion: reduce)'), reduced = reducedQuery.matches;

  function node(tag, className, text) {
    var item = document.createElement(tag);
    if (className) item.className = className;
    if (text != null) item.textContent = text;
    return item;
  }
  function readTools() {
    var seen = new Set(), result = [];
    section.querySelectorAll('.brand-item').forEach(function (original) {
      var label = original.querySelector('span'), image = original.querySelector('img');
      var name = label && label.textContent.trim();
      if (!name || !image || seen.has(name)) return;
      seen.add(name);
      var role = label.getAttribute('data-role');
      result.push({ name: name, source: image.getAttribute('src'),
        purpose: role ? role.replace(/^担任\s*·\s*/, '') : (purposes[name] || ''),
        ink: original.classList.contains('brand-item--ink'), crop: original.classList.contains('brand-item--crop-icon') });
    });
    return result;
  }
  function logo(tool, extra) {
    var wrap = node('span', 'rt-logo' + (tool.ink ? ' rt-logo--ink' : '') + (tool.crop ? ' rt-logo--crop' : '') + (extra ? ' ' + extra : ''));
    var image = node('img'); image.src = tool.source; image.alt = ''; image.width = 96; image.height = 96;
    image.loading = 'lazy'; image.decoding = 'async'; image.draggable = false;
    wrap.appendChild(image); return wrap;
  }
  function normalizeUrl() {
    return;   // 不改网址：带参数的网址刷新后会显示 not found
    var url = new URL(location.href);
    // Old preview links resolve to the selected final design, while cover settings remain intact.
    if (url.searchParams.get('toolkit') === 'editorial' && url.searchParams.get('cut') === 'alternating') return;
    url.searchParams.set('toolkit', 'editorial');
    url.searchParams.set('cut', 'alternating');
    history.replaceState(history.state, '', url.pathname + url.search + url.hash);
  }
  function updateMotion() {
    if (!ui) return;
    ui.classList.toggle('rt-running', visible && !document.hidden && !reduced);
  }
  function titleFrame() {
    titleRaf = 0;
    if (!ui || !ui.isConnected) return;
    var heading = ui.querySelector('.rt-title');
    var p = reduced ? 1 : Math.max(0, Math.min(1, (innerHeight * .97 - heading.getBoundingClientRect().top) / (innerHeight * .37)));
    titleLetters.forEach(function (letter, i) {
      var delay = titleLetters.length > 1 ? i / (titleLetters.length - 1) * .48 : 0;
      var value = reduced ? 1 : Math.max(0, Math.min(1, (p - delay) / .52));
      letter.style.opacity = String(value);
      letter.style.filter = 'blur(' + (1 - value) * 7 + 'px)';
      letter.style.transform = 'translate3d(0,' + (1 - value) * .9 + 'em,0) rotateX(' + (1 - value) * -52 + 'deg)';
    });
  }
  function scheduleTitle() { if (!titleRaf) titleRaf = requestAnimationFrame(titleFrame); }
  function createToken(tool, clone, ribbon) {
    var button = node('button', 'rt-token'); button.type = 'button'; button.dataset.toolName = tool.name;
    button.setAttribute('aria-label', tool.name + '：' + tool.purpose);
    button.setAttribute('aria-expanded', 'false');
    if (clone) { button.tabIndex = -1; button.setAttribute('aria-hidden', 'true'); }
    var face = node('span', 'rt-token-face'); face.appendChild(logo(tool));
    var copy = node('span', 'rt-token-copy');
    copy.appendChild(node('span', 'rt-name', tool.name)); copy.appendChild(node('span', 'rt-purpose', tool.purpose));
    face.appendChild(copy); button.appendChild(face);
    button.addEventListener('click', function () {
      var expand = !button.classList.contains('rt-selected');
      ui.querySelectorAll('.rt-token.rt-selected').forEach(function (item) { item.classList.remove('rt-selected'); item.setAttribute('aria-expanded', 'false'); });
      ui.querySelectorAll('.rt-ribbon').forEach(function (item) { item.classList.remove('rt-reading'); });
      if (expand) { button.classList.add('rt-selected'); button.setAttribute('aria-expanded', 'true'); ribbon.classList.add('rt-reading'); }
    });
    return button;
  }
  function renderRibbons() {
    var count = 3;
    var perRow = Math.ceil(tools.length / count);
    var ribbons = node('div', 'rt-ribbons');
    for (var row = 0; row < count; row++) {
      var items = tools.slice(row * perRow, (row + 1) * perRow); if (!items.length) continue;
      var ribbon = node('div', 'rt-ribbon rt-ribbon--' + row);
      ribbon.style.setProperty('--rt-angle', angles[row] + 'deg');
      var track = node('div', 'rt-track');
      for (var copy = 0; copy < 2; copy++) {
        var set = node('div', 'rt-set');
        if (copy) { set.setAttribute('aria-hidden', 'true'); set.classList.add('rt-clone'); }
        items.forEach(function (tool) { set.appendChild(createToken(tool, copy === 1, ribbon)); });
        track.appendChild(set);
      }
      ribbon.appendChild(track); ribbons.appendChild(ribbon);
    }
    body.appendChild(ribbons);
  }
  function render() {
    ui.dataset.layout = 'editorial'; ui.dataset.cut = 'alternating';
    section.dataset.toolkitLayout = 'editorial';
    body.replaceChildren();
    renderRibbons();
    updateMotion(); scheduleTitle();
  }
  function mount() {
    section = document.getElementById('toolkit');
    if (!section || section.querySelector('.rowan-toolkit')) return;
    tools = readTools(); if (!tools.length) return;
    ui = node('div', 'rowan-toolkit');
    var head = node('header', 'rt-heading');
    var title = node('h2', 'rt-title'); title.setAttribute('aria-label', 'My Creative Toolkit');
    titleLetters = [];
    ['My', 'Creative', 'Toolkit'].forEach(function (word, w) {
      if (w) title.appendChild(document.createTextNode(' '));
      var wordSpan = node('span', 'rt-title-word'); wordSpan.setAttribute('aria-hidden', 'true');
      Array.from(word).forEach(function (character) { var letter = node('span', 'rt-title-letter', character); titleLetters.push(letter); wordSpan.appendChild(letter); });
      title.appendChild(wordSpan);
    });
    head.appendChild(title); head.appendChild(node('span', 'rt-edition', String(tools.length).padStart(2, '0') + ' TOOLS / CREATIVE PRACTICE'));
    ui.appendChild(head);
    body = node('div', 'rt-body'); ui.appendChild(body);
    section.appendChild(ui); section.dataset.toolkitReady = 'true';
    normalizeUrl();
    render();
    if (observer) observer.disconnect();
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; ui.classList.toggle('rt-entered', visible); document.documentElement.classList.toggle('rowan-toolkit-in-view', visible); updateMotion(); scheduleTitle(); }, { threshold: .03 });
      observer.observe(section);
    } else { visible = true; ui.classList.add('rt-entered'); document.documentElement.classList.add('rowan-toolkit-in-view'); updateMotion(); }
    if (initialHashPending) {
      initialHashPending = false;
      requestAnimationFrame(function () { if (location.hash === '#toolkit' && section.isConnected) section.scrollIntoView({ behavior: 'instant', block: 'start' }); });
    }
    new MutationObserver(function () { if (!ui.isConnected && document.getElementById('toolkit')) setTimeout(mount, 0); }).observe(section, { childList: true });
  }
  addEventListener('scroll', scheduleTitle, { passive: true });
  addEventListener('resize', scheduleTitle, { passive: true });
  document.addEventListener('visibilitychange', updateMotion);
  reducedQuery.addEventListener('change', function (event) { reduced = event.matches; updateMotion(); scheduleTitle(); });
  addEventListener('popstate', normalizeUrl);
  function mountWhenReady() {
    if (window.__rowanAppReady === true && document.readyState === 'complete') mount();
  }
  // Wait for both the React commit signal and document load; either may arrive first.
  addEventListener('rowan:app-ready', mountWhenReady);
  addEventListener('load', mountWhenReady, { once: true });
  mountWhenReady();
})();
