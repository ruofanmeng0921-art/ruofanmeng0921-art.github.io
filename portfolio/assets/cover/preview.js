/* Three reversible cover studies. Existing sections and materials stay in place. */
(function () {
  'use strict';
  if (window.__rowanCoverStudies) return;
  window.__rowanCoverStudies = true;
  var root = document.documentElement;
  var styles = ['gold', 'paper', 'runway'];
  var params = new URLSearchParams(location.search);
  var selected = styles.includes(params.get('cover')) ? params.get('cover') : 'gold';
  var preview = params.get('preview') === '1';
  var replayTimer;
  root.dataset.coverStyle = selected;
  if (preview) root.classList.add('edition-preview');

  function replay() {
    clearTimeout(replayTimer);
    root.classList.remove('edition-enter');
    void root.offsetWidth;
    root.classList.add('edition-enter');
    window.dispatchEvent(new CustomEvent('rowan:replay-intro', { detail: { style: selected } }));
    replayTimer = setTimeout(function () { root.classList.remove('edition-enter'); }, 2400);
  }

  function setStyle(style, move) {
    selected = style;
    root.dataset.coverStyle = style;
    document.querySelectorAll('[data-cover-choice]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.coverChoice === style));
    });
    var url = new URL(location.href);
    url.searchParams.set('cover', style);
    url.searchParams.set('preview', '1');
    // 不改网址，避免刷新后 not found
    window.dispatchEvent(new CustomEvent('rowan:cover-style', { detail: { style: style } }));
    if (move) window.scrollTo({ top: 0, behavior: 'instant' });
    replay();
  }

  function mount() {
    var cover = document.querySelector('.wcx-cover');
    if (!cover || cover.querySelector('.edition')) return;
    var stage = document.createElement('section');
    stage.className = 'edition';
    stage.setAttribute('aria-label', '人物专刊封面');
    stage.innerHTML = '<div class="edition-grain" aria-hidden="true"></div>' +
      '<div class="edition-rule" aria-hidden="true"></div>' +
      '<p class="edition-issue">NO. 001 <span>人物专刊 · 2026</span></p>' +
      '<div class="edition-masthead" aria-hidden="true">ROWAN</div>' +
      '<div class="edition-number" aria-hidden="true">01</div>' +
      '<div class="edition-portrait" tabindex="0" role="img" aria-label="封面人物，聚焦查看金色衣料反光">' +
        '<img src="./assets/cover/v3-person-lit.webp" width="1124" height="1380" alt="" draggable="false">' +
        '<span class="edition-portrait-shine" aria-hidden="true"></span></div>' +
      '<div class="edition-heading"><p>THE CONTENT ISSUE</p><h1>一个 IP<br>是怎么<br><em>被养大的</em></h1>' +
        '<span>从选题到变现的全部答案</span></div>' +
      '<a class="edition-feature" href="#works"><span>成长档案 / 01</span><strong>37 万 <i>→</i> 188 万</strong><small>+151 万粉丝<br>三年，626 条作品</small></a>' +
      '<a class="edition-workflow" href="#ai-native"><span>AI 工作流 / 02</span><strong>27 <i>→</i> 50</strong><small>月产能 · 从内容到系统</small></a>' +
      '<div class="edition-footer"><span>IP 编导 · AI 内容编导</span><a href="#works">翻开作品 <i>↘</i></a><span>489 条万赞 · 单条最高播放 683.66 万</span></div>';
    cover.appendChild(stage);
    var intro = document.createElement('div');
    intro.className = 'edition-intro';
    intro.setAttribute('aria-hidden', 'true');
    intro.innerHTML = '<span><img class="edition-gold-wordmark" src="./assets/cover/rowan-gold-wordmark.png" width="2009" height="783" alt="Rowan"></span><i>THE CONTENT ISSUE — 2026</i>';
    document.body.appendChild(intro);
    if (preview) {
      root.classList.add('edition-preview');
      var bar = document.createElement('aside');
      bar.className = 'edition-switcher';
      bar.setAttribute('aria-label', '封面风格预览');
      bar.innerHTML = '<span>封面提案</span>' +
        '<button type="button" data-cover-choice="gold">01 黑金刊封</button>' +
        '<button type="button" data-cover-choice="paper">02 极简时装刊</button>' +
        '<button type="button" data-cover-choice="runway">03 秀场开幕</button>' +
        '<button type="button" data-replay aria-label="重播当前封面入场动画">↻ 重播入场</button>';
      document.body.appendChild(bar);
      bar.querySelectorAll('[data-cover-choice]').forEach(function (button) {
        button.addEventListener('click', function () { setStyle(button.dataset.coverChoice, true); });
      });
      bar.querySelector('[data-replay]').addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'instant' }); replay();
      });
    }
    var portrait = stage.querySelector('.edition-portrait');
    portrait.addEventListener('pointermove', function (event) {
      var rect = portrait.getBoundingClientRect();
      portrait.style.setProperty('--shine-x', ((event.clientX - rect.left) / rect.width * 100) + '%');
      portrait.style.setProperty('--shine-y', ((event.clientY - rect.top) / rect.height * 100) + '%');
    });
    Promise.all([stage.querySelector('img').decode().catch(function () {}), intro.querySelector('img').decode().catch(function () {})]).then(function () {
      if (preview) setStyle(selected, false);
      else { window.dispatchEvent(new CustomEvent('rowan:cover-style', { detail: { style: selected } })); replay(); }
    });
  }
  function mountWhenReady() {
    if (window.__rowanAppReady === true && document.readyState === 'complete') mount();
  }
  addEventListener('rowan:app-ready', mountWhenReady);
  addEventListener('load', mountWhenReady);
  mountWhenReady();
})();
