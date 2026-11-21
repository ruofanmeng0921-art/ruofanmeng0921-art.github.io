/* MRF 封面（首屏）v4 · B1 居中海报
   图层：背景 / 人物 / 文字（文字与数字从分层图切片后按版式重排）。
   开场亮灯 → 两盏灯跟随鼠标 → 数字照到才亮并翻滚 → 188 老虎机 → 字形发光 → 签名书写。 */
(function () {
  var W = 2560, H = 1600, DESIGN = 1586;
  // 分层图里的原始切片
  var SRC = {
    tag: [80, 370, 370, 481], title: [80, 500, 595, 691], ai: [80, 970, 550, 1157], sig: [80, 1230, 496, 1444],
    n37: [1895, 490, 2257, 615], n188: [1890, 625, 2405, 842], n151: [1895, 890, 2383, 1020], n489: [1895, 1020, 2405, 1218]
  };
  // 需要翻滚的数字（只滚数字本身，单位不动）
  var ROLL = { ai: [[280, 1040, 375, 1140], [448, 1040, 545, 1140]], n37: [[1918, 498, 2050, 610]], n151: [[1980, 892, 2142, 1000]], n489: [[1925, 1066, 2091, 1160], [2191, 1066, 2377, 1160]] };
  // 数字滚轮：每个数字按位做成老虎机，0-9 转过去再停在真实数字（base=数字底线，h=数字高度，cx=中心）
  var NUMS = {
    n37: [{ r: [1916, 494, 2074, 612], t: '37', it: 1, base: 606, h: 105, cx: 1995 }],
    n151: [{ r: [1980, 890, 2144, 1002], t: '151', it: 0, base: 997, h: 102, cx: 2062 }],
    n489: [{ r: [1922, 1064, 2094, 1162], t: '489', it: 0, base: 1157, h: 88, cx: 2008 }, { r: [2188, 1064, 2380, 1161], t: '1175', it: 0, base: 1156, h: 87, cx: 2284 }]
  };
  var HREF = { tag: '#works', title: '#works', ai: '#ai-native', sig: '#contact', n37: '#works', n188: '#works', n151: '#works', n489: '#works' };
  var REEL0 = { cols: [1946, 2068, 2196], base: 819, size: 259, band: [1870, 618, 2273, 842], cx: 2071, cy: 730 };
  var RING0 = [1905, 608, 2510, 890];
  var LAYOUTS = {
    land: {
      x0: 0, w: 2560, lampX: [200, 2360], rule: 0, band: 0, ps: .9, py: 358,
      at: { tag: [110, 390, 1],
        n37: [1895, 470, 1], n188: [1890, 605, 1], n151: [1895, 870, 1], n489: [1895, 1000, 1] },
      ticket: [1905, 300], hello: null, guide: null, cue: null,
      head: [110, 500], cta: null, hits: [1895, 1250], card: [100, 1150], dlabel: [1895, 410], down: [1280, 1548],
      sweep: [[2080, 560], [2080, 700], [2140, 950], [2150, 1100], [330, 600], [330, 880]]
    },
    port: {
      x0: 560, w: 1440, lampX: [640, 1920], rule: 0, band: 760, ps: .8, py: 190,
      at: { n188: [1015, 1236, 1], n37: [646, 1461, .85], n151: [1085, 1474, .8], n489: [1575, 1450, .75] },
      ticket: null, hello: null, guide: null, cue: null,
      head: [1280, 820], cta: null, hits: null, card: [1280, 1180], dlabel: null, down: null,
      sweep: [[1280, 1010], [1280, 1250], [800, 1480], [1280, 1490], [1760, 1490]]
    }
  };
  var LAMPS = [{ x: 300, y: 58, s: 'l' }, { x: 2260, y: 58, s: 'r' }];
  var BULB_XY = [[769, 115], [769, 185], [769, 256], [769, 326], [769, 397], [1590, 115], [1590, 185], [1590, 256], [1590, 326], [1590, 397]];
  var PS = .98, PX = 716, PY = 248, HOME, HAT, FACE, SPARK;      // 人物：居中，随版式缩放
  var SPARK0 = [[322, 84], [531, 33], [761, 94], [424, 216], [260, 666], [839, 666], [472, 849], [1024, 625], [142, 564]];   // 人物图内坐标
  var MRFPT = [[1050, 300], [1480, 300]];
  function personAt(l) {
    PS = l.ps; PY = l.py; PX = Math.round(1267 - 1124 * PS / 2);
    FACE = [PX + 562 * PS, PY + 560 * PS];
    HOME = [[FACE[0] - 30, FACE[1]], [FACE[0] + 30, FACE[1]]];
    HAT = { x: PX + 586 * PS, y: PY + 278 * PS, rx: 408 * PS, ry: 163 * PS };
    SPARK = SPARK0.map(function (a) { return [PX + a[0] * PS, PY + a[1] * PS]; });
  }
  var STORE = 'mrf-cover-seen-v4';
  function load(src) { return new Promise(function (r) { var i = new Image(); i.onload = function () { r(i); }; i.onerror = function () { r(null); }; i.src = src; }); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function e3(t) { return 1 - Math.pow(1 - t, 3); }
  function e4(t) { return 1 - Math.pow(1 - t, 4); }
  function seen() { return false; }   // 每次打开都播放开幕
  function markSeen() { try { localStorage.setItem(STORE, '1'); } catch (e) {} }

  function mount() {
    if (document.querySelector('.wcx-cover')) return;
    var hero = document.getElementById('hero');
    if (!hero) return setTimeout(mount, 100);
    var root = document.documentElement;
    var fine = matchMedia('(pointer:fine)').matches;
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var d = document.createElement('div');
    d.className = 'wcx-cover';
    d.innerHTML = '<canvas class="mc-canvas" width="' + W + '" height="' + H + '" role="img" aria-label="MRF 人物专刊封面：孟若凡，3 年 IP 编导，账号粉丝由 37 万增长至 188 万，新增 151 万，489 条万赞作品，单条最高播放 683.66 万"></canvas>' +
      '<div class="mc-grain" aria-hidden="true"></div>' +
      '<div class="mc-guide" aria-hidden="true"><i></i><span>' + (fine ? '移动鼠标 · 点亮舞台' : '滑动手指 · 点亮舞台') + '</span></div>' +
      '<a class="mc-cue" href="#works"><span>往下滚 · 第一幕 作品</span><i></i></a>' +
      '<div class="mc-ticket" tabindex="0" aria-label="求职意向：IP 编导，长沙，随时到岗"><div class="mc-ticket__no">NO.001 · 人物专刊 · 2026</div>' +
      '<div class="mc-ticket__stub"><b>求职意向</b><span>IP 编导 · 长沙 · 随时到岗</span></div></div>' +
      '<div class="mc-hello" aria-hidden="true">你好，我是孟若凡</div>' +
      '<div class="mc-head"><h1 class="mc-h1"><span>少说一句，</span><span>多做一条。</span></h1>' +
      '<p class="mc-h1 mc-h1--2"><span>3 年 709 条作品，</span><span>是我对待工作的态度。</span></p></div>' +
      '<div class="mc-card"><img src="./assets/cover/sig.webp" alt="孟若凡" width="416" height="214"><div class="mc-card__role">AI <b>＋</b> IP 编导</div></div>' +
      '<div class="mc-cta"><a class="mc-btn mc-btn--solid" href="#toolkit">查看作品</a><a class="mc-btn" href="#contact">联系我</a></div>' +
      '<div class="mc-hits"><span class="mc-hits__k">代表作</span>' +
      '<a href="#works"><img src="./assets/cover/hit-1.webp?v=3" alt="林纸巾 · 金杯爷爷：巴西队第 12 人" width="323" height="430"></a>' +
      '<a href="#works"><img src="./assets/cover/hit-2.webp?v=3" alt="林纸巾 · 牧羊人保罗：最穷 VIP 球迷" width="323" height="430"></a></div>' +
      '<div class="mc-dlabel">三年账号粉丝增长</div>' +
      '<a class="mc-down" href="#toolkit" aria-label="往下看"><i></i></a>' +
      '<div class="mc-dot" aria-hidden="true"></div>';
    root.classList.add('mc-intro-on');
    document.body.appendChild(d);
    root.classList.add('has-wcx-cover');
    if (fine) d.classList.add('mc-fine');
    // 幕布转场层
    var cur2 = document.createElement('div'); cur2.className = 'mc-curtain'; cur2.setAttribute('aria-hidden', 'true');
    cur2.innerHTML = '<i class="mc-curtain__l"></i><i class="mc-curtain__r"></i><b class="mc-curtain__top"></b>';
    cur2.classList.add('open');
    document.body.appendChild(cur2);
    // 工具节目单：给每个工具加“担任”说明
    var ROLE = { 'ChatGPT': '脚本 · 选题', '即梦': '画面生成', 'Cursor': '工具开发', 'HeyGen': '数字人', 'Fish Audio': '克隆配音', 'Obsidian': '知识库',
      'Nano Banana': '修图 · 生图', '剪映': '剪辑', 'Lovart': '设计', 'Claude': '写作 · 开发', 'LibTV': '视频生成', '飞影数字人': '数字人口播',
      'Gemini': '资料研究', 'Seed Audio': '配乐', 'ChatCut': '智能剪辑', 'MiniMax': '视频生成', '百度一镜': '视频生成', 'Image2': '生图' };
    function roles() { [].forEach.call(document.querySelectorAll('.brand-item span'), function (sp) { var r = ROLE[sp.textContent.trim()]; if (r && sp.getAttribute('data-role') !== '担任 · ' + r) sp.setAttribute('data-role', '担任 · ' + r); }); }
    roles(); setTimeout(roles, 1500);

    // 胶片颗粒
    (function () {
      var g = document.createElement('canvas'); g.width = g.height = 160; var gx = g.getContext('2d'), id = gx.createImageData(160, 160);
      for (var i = 0; i < id.data.length; i += 4) { var v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
      gx.putImageData(id, 0, 0); d.querySelector('.mc-grain').style.backgroundImage = 'url(' + g.toDataURL() + ')';
    })();

    var cv = d.querySelector('canvas'), ctx = cv.getContext('2d');
    var dlabel = d.querySelector('.mc-dlabel'), down = d.querySelector('.mc-down'), card = d.querySelector('.mc-card'), head = d.querySelector('.mc-head'), cta = d.querySelector('.mc-cta'), hits = d.querySelector('.mc-hits');
    [].forEach.call(d.querySelectorAll('.mc-cta a,.mc-hits a,.mc-down'), function (a) { a.addEventListener('click', function (ev) { var el = document.querySelector(a.getAttribute('href')); if (el) { ev.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); } }); });
    var ticket = d.querySelector('.mc-ticket'), hello = d.querySelector('.mc-hello'), guide = d.querySelector('.mc-guide'), cue = d.querySelector('.mc-cue'), dot = d.querySelector('.mc-dot');
    var portQ = matchMedia('(max-aspect-ratio: 9/10)');
    var L = portQ.matches ? LAYOUTS.port : LAYOUTS.land, S = 1, OX = 0, OY = 0, onLayout = null;
    personAt(L);

    function place(el, pt, anchor) {
      if (!el) return;
      if (!pt) { el.style.display = 'none'; return; }
      el.style.display = '';
      el.style.left = OX + (pt[0] - L.x0) * S + 'px'; el.style.top = OY + pt[1] * S + 'px';
    }
    function fit() {
      var nl = portQ.matches ? LAYOUTS.port : LAYOUTS.land;
      if (nl !== L) { L = nl; personAt(L); if (onLayout) onLayout(); }
      var r = hero.getBoundingClientRect();
      d.style.top = (r.top + window.scrollY) + 'px';
      d.style.height = r.height + 'px';
      if (cv.width !== L.w) cv.width = L.w;
      var header = document.querySelector('.portfolio-header'), hh0 = header ? header.offsetHeight + 12 : 0;
      var foot = L === LAYOUTS.port ? 70 : 0;
      S = Math.min(d.clientWidth / L.w, (r.height - hh0 - foot) / H);
      OX = (d.clientWidth - L.w * S) / 2; OY = r.height - foot - H * S;   // 底对齐，顶部给导航留位
      cv.style.width = L.w * S + 'px'; cv.style.height = H * S + 'px'; cv.style.left = OX + 'px'; cv.style.top = OY + 'px';
      d.style.setProperty('--mc-s', 2560 * S / DESIGN);
      d.style.setProperty('--mc-unit', S + 'px');
      LAMPS[0].x = L.lampX[0]; LAMPS[1].x = L.lampX[1];
      LAMPS[0].y = LAMPS[1].y = 70;
      place(ticket, L.ticket); place(hello, L.hello); place(guide, L.guide); place(cue, L.cue);
      place(head, L.head); place(cta, L.cta); place(hits, L.hits); place(card, L.card); place(dlabel, L.dlabel); place(down, L.down);
      d.classList.toggle('mc-port', L === LAYOUTS.port);
    }
    fit(); addEventListener('resize', fit);
    if (window.ResizeObserver) new ResizeObserver(fit).observe(hero);
    var vh = innerHeight;
    function onScroll() {
      var y = window.scrollY, hh = hero.offsetHeight || vh;
      root.classList.toggle('mc-top', y < hh * 0.55);
      finale();
    }
    // 闭幕：滚到联系区，两侧幕布合拢，追光打在结尾大字上
    var fin = null, finHead = null;
    function finale() {
      if (!fin) {
        var sec = document.querySelector('.ending-contact'); if (!sec) return;
        finHead = sec.querySelector('.ending-contact-copy h2') || sec.querySelector('h2');
        fin = document.createElement('div'); fin.className = 'mc-finale'; fin.setAttribute('aria-hidden', 'true');
        fin.innerHTML = '<i class="mc-finale__l"></i><i class="mc-finale__r"></i><b class="mc-finale__top"></b><em class="mc-finale__beam"></em><span class="mc-finale__spot"></span>';
        sec.insertBefore(fin, sec.firstChild); sec.classList.add('mc-has-finale');
      }
      var sr = fin.parentNode.getBoundingClientRect(), e = clamp((vh * .95 - sr.top) / (vh * .75), 0, 1);
      e = reduce ? (e > .5 ? 1 : 0) : e * e * (3 - 2 * e);
      fin.style.setProperty('--e', e.toFixed(3));
      if (finHead) {
        var hr = finHead.getBoundingClientRect();
        fin.style.setProperty('--sx', ((hr.left + hr.width / 2 - sr.left) / sr.width * 100).toFixed(1) + '%');
        fin.style.setProperty('--sy', ((hr.top + hr.height / 2 - sr.top) / sr.height * 100).toFixed(1) + '%');
        finHead.classList.toggle('mc-finale-lit', e > .65);
      }
    }
    addEventListener('resize', function () { vh = innerHeight; });
    onScroll(); addEventListener('scroll', onScroll, { passive: true });
    setInterval(function () { if (!fin) finale(); }, 1500);

    var P = './assets/cover/';
    var FILES = ['v3-bg-dark.webp', 'v3-bg-lit.webp', 'v3-person-dark.webp', 'v3-person-lit.webp', 'v3-text.webp', 'v3-nums.webp',
      'v3-mrf.webp', 'v3-mrfmask.webp', 'v3-ring.webp', 'v3-stairs.webp',
      'v3-lamp-l-on.png', 'v3-lamp-l-off.png', 'v3-lamp-r-on.png', 'v3-lamp-r-off.png'];
    Promise.all(FILES.map(function (f) { return load(P + f); })).then(function (im) {
      var bgDark = im[0], bgLit = im[1], pDark = im[2], pLit = im[3], textSrc = im[4], numsSrc = im[5],
        mrf = im[6], mrfMask = im[7], ring = im[8], stairs = im[9];
      var spr = { l: { on: im[10], off: im[11] }, r: { on: im[12], off: im[13] } };
      if (!bgDark || !bgLit) return;
      var mrfImg = mrf;   // 原 MRF 金字：缩小放到左栏
      // 「成长档案」金箔大字：替换原来 MRF 的位置
      var titleC = document.createElement('canvas'); titleC.width = W; titleC.height = H;
      function drawTitle() {
        var c = titleC.getContext('2d'); c.clearRect(0, 0, W, H);
        var fs = 252, y = 352, txt = '成长档案';
        c.font = '900 ' + fs + 'px "MRF Title","MRF Editorial Chinese",serif'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
        if (c.letterSpacing !== undefined) c.letterSpacing = '18px';
        c.fillStyle = 'rgba(30,16,4,.9)'; c.fillText(txt, 1280 + 6, y + 12);                 // 厚度
        c.fillStyle = '#5a3a12'; c.fillText(txt, 1280 + 3, y + 6);
        var g = c.createLinearGradient(0, y - fs * .9, 0, y + fs * .05);
        g.addColorStop(0, '#fff3cf'); g.addColorStop(.28, '#f2cf7e'); g.addColorStop(.5, '#b9822f'); g.addColorStop(.62, '#f6dc96'); g.addColorStop(.85, '#c38d3b'); g.addColorStop(1, '#8a5a1c');
        c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = 24; c.shadowOffsetY = 10; c.fillStyle = g; c.fillText(txt, 1280, y);
        c.shadowColor = 'transparent'; c.lineWidth = 2.5; c.strokeStyle = 'rgba(255,236,190,.55)'; c.strokeText(txt, 1280, y);
        // 下方金线 + 小字
        var lg = c.createLinearGradient(760, 0, 1800, 0); lg.addColorStop(0, 'rgba(217,182,112,0)'); lg.addColorStop(.5, 'rgba(232,200,130,.9)'); lg.addColorStop(1, 'rgba(217,182,112,0)');
        c.fillStyle = lg; c.fillRect(720, 396, 1120, 3); c.fillRect(720, 468, 1120, 2);
      }
      drawTitle();
      if (document.fonts) document.fonts.load('900 252px "MRF Title"').then(function () { drawTitle(); kick(); });

      function mk(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
      var textL = mk(W, H), tlx = textL.getContext('2d'), numsL = mk(W, H), nlx = numsL.getContext('2d');
      var sigC = mk(10, 10), sgx = sigC.getContext('2d');
      function revealK() { var t0 = window.__mcTextT; if (!t0) return document.documentElement.classList.contains('mc-intro-on') ? 0 : 1; var q = Math.min(1, Math.max(0, (performance.now() - t0 - 100) / 2000)); return q * q * (3 - 2 * q); }
      var BLOCKS = [], REEL = null, RINGD = null, rolls = {}, numReels = [];
      // 坐标换算：源切片 → 版式位置
      function T(key, x, y) { var s = SRC[key], a = L.at[key]; return [a[0] + (x - s[0]) * a[2], a[1] + (y - s[1]) * a[2]]; }
      function TR(key, r) { var p0 = T(key, r[0], r[1]), p1 = T(key, r[2], r[3]); return [p0[0], p0[1], p1[0], p1[1]]; }
      function blit(c, img, key, r) { var d0 = TR(key, r); c.drawImage(img, r[0], r[1], r[2] - r[0], r[3] - r[1], d0[0], d0[1], d0[2] - d0[0], d0[3] - d0[1]); }
      var sigP = 0, sigStart = -1, sigDone = false;
      function build() {
        tlx.clearRect(0, 0, W, H); nlx.clearRect(0, 0, W, H); BLOCKS = []; rolls = {}; numReels = [];
        Object.keys(L.at).forEach(function (k) {
          if (k !== 'sig' && textSrc) blit(tlx, textSrc, k, SRC[k]);
          if (numsSrc) blit(nlx, numsSrc, k, SRC[k]);
          BLOCKS.push({ k: k, r: TR(k, SRC[k]), href: HREF[k], f: 0, lit: 0 });
          (NUMS[k] || []).forEach(function (n) {   // 抹掉原图里的数字，改由滚轮来画
            var dr = TR(k, n.r); nlx.clearRect(dr[0], dr[1], dr[2] - dr[0], dr[3] - dr[1]);
            var a = L.at[k], c = T(k, n.cx, n.base), h = n.h * a[2], size = h / .708;
            var font = (n.it ? 'italic ' : '') + '900 ' + size.toFixed(1) + 'px "MRF Latin","MRF Display",serif';
            ctx.font = font; var ws = n.t.split('').map(function (ch) { return ctx.measureText(ch).width; }), tw = ws.reduce(function (x, y) { return x + y; }, 0), x0 = c[0] - tw / 2;
            var cols = n.t.split('').map(function (ch, i) { var cx = x0 + ws.slice(0, i).reduce(function (x, y) { return x + y; }, 0) + ws[i] / 2; return { cx: cx, d: +ch, pos: +ch, from: +ch, to: +ch, start: -1, dur: 1 }; });
            numReels.push({ k: k, font: font, base: c[1], h: h, cols: cols, on: false, lit: 0, it: n.it });
          });
        });
        if (L.at.sig) {
          var sr = TR('sig', SRC.sig); sigC.width = Math.ceil(sr[2] - sr[0]); sigC.height = Math.ceil(sr[3] - sr[1]);
          if (sigDone && textSrc) blit(tlx, textSrc, 'sig', SRC.sig);
        }
        var a = L.at.n188;
        REEL = { cols: REEL0.cols.map(function (x) { return T('n188', x, 0)[0]; }), band: TR('n188', REEL0.band), s: a[2] };
        REEL.cx = (REEL.band[0] + REEL.band[2]) / 2; REEL.cy = (REEL.band[1] + REEL.band[3]) / 2;
        RINGD = TR('n188', RING0);
      }
      build(); onLayout = function () { build(); kick(); };
      if (document.fonts) Promise.all(['italic 900 100px "MRF Latin"', '900 100px "MRF Latin"'].map(function (f) { return document.fonts.load(f); })).then(function () { build(); kick(); });

      var K = 16, mkc = mk(Math.ceil(W / K), Math.ceil(H / K)), mx = mkc.getContext('2d');
      var tmp = mk(W, H), tx = tmp.getContext('2d');
      var sh = mk(W, 600), shx = sh.getContext('2d');
      var gl = mk(W, H), glx = gl.getContext('2d');
      var raf = 0, inside = false, mouse = null, sweeping = false, coverVisible = true;
      var styleActive = !root.dataset.coverStyle || root.dataset.coverStyle === 'gold';
      var power = 0, powerT = 0, lp = [0, 0], lpT = [0, 0], flick = [0, 0], black = 1, blackT = 1;
      var cur = [MRFPT[0].slice(), MRFPT[1].slice()], tgt = [MRFPT[0].slice(), MRFPT[1].slice()];
      var poolR = [300, 250], poolTgt = [300, 250];
      var personF = 0, personHold = 0, introDone = false, flash = [-1, -1], chase = -1;
      // 金粉聚合：从 MRF 金字里取样目标点
      var dust = null, DUST_T = [];
      (function () {
        var src = mrfMask || mrf; if (!src) return;
        var sc = 6, c = document.createElement('canvas'); c.width = Math.ceil(W / sc); c.height = Math.ceil(600 / sc);
        var x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(src, 0, 0, W, 600, 0, 0, c.width, c.height);
        try { var dd = x.getImageData(0, 0, c.width, c.height).data; for (var i = 0; i < c.width * c.height; i++) if (dd[i * 4 + 3] > 120) DUST_T.push([(i % c.width + Math.random()) * sc, (Math.floor(i / c.width) + Math.random()) * sc]); } catch (e) {}
      })();
      var slit = null, textA = 1, textAT = 1, dim = 0, dimT = 0, burst = -1, poolK = .1, latch = 0, latchT = 0, beamK = 1, beamKT = 1;   // latch：照亮过的字保持常亮
      function zoomFace(on) {   // 高潮镜头：画面推向人物脸部
        cv.style.transformOrigin = ((FACE[0] - L.x0) / L.w * 100).toFixed(1) + '% ' + (FACE[1] / H * 100).toFixed(1) + '%';
        d.classList.toggle('mc-zoom', on);
      }
      function startSlit(now) {   // 金点拉成光缝，光缝上下张开露出舞台，缝里洒出金粉
        var r = cv.getBoundingClientRect(), sc = r.width / L.w;
        var cy = clamp((innerHeight / 2 - r.top) / sc, 200, H - 200), cx = L.x0 + (innerWidth / 2 - r.left) / sc;
        var pts = [];
        for (var i = 0; i < 900; i++) {
          var u = (Math.random() * 2 - 1); u = u * Math.abs(u);
          pts.push({ x: cx + u * L.w * .55, y: cy + (Math.random() - .5) * 6, vx: (Math.random() - .5) * 120, vy: (Math.random() < .5 ? -1 : 1) * (60 + Math.random() * 420) - 80, d: 1200 + Math.random() * 450, life: 1100 + Math.random() * 900, s: 1 + Math.random() * 2.4, tw: Math.random() * 6 });
        }
        slit = { t0: now, cx: cx, cy: cy, pts: pts };
      }
      function startDust(now) {
        var pts = [], n = Math.min(2200, DUST_T.length);
        for (var i = 0; i < n; i++) {
          var t = DUST_T[Math.floor(Math.random() * DUST_T.length)], a = Math.random() * 6.283, r = 900 + Math.random() * 1100;
          pts.push({ tx: t[0], ty: t[1], sx: 1280 + Math.cos(a) * r * 1.3, sy: 300 + Math.sin(a) * r * .8 + 300, d: Math.random() * 350, dur: 1150 + Math.random() * 450, sw: (Math.random() - .5) * 260, s: 1.4 + Math.random() * 2.8, tw: Math.random() * 6 });
        }
        dust = { t0: now, pts: pts };
      }
      var bulbs = BULB_XY.map(function (b) { return { x: b[0], y: b[1], v: 0 }; });
      var motes = []; for (var q = 0; q < 46; q++) motes.push({ t: Math.random(), u: Math.random() * 2 - 1, v: .15 + Math.random() * .6, r: .8 + Math.random() * 1.8, b: q % 2 });
      var flies = []; for (var q2 = 0; q2 < 3; q2++) flies.push({ t: .35 + q2 * .2, u: (q2 - 1) * .5, ph: q2 * 2.1, b: q2 % 2, dir: q2 % 2 ? -1 : 1 });
      var hatFlies = [];
      // 188 老虎机
      var SYM = ['?', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], REAL = [2, 9, 9];
      var reels = [0, 1, 2].map(function () { return { pos: 0, from: 0, to: 0, start: -1, dur: 1, v: 0 }; });
      var reelOn = false, rc = mk(REEL0.band[2] - REEL0.band[0], REEL0.band[3] - REEL0.band[1]), rx2 = rc.getContext('2d');
      var reelFont = 'italic 900 ' + REEL0.size + 'px "MRF Display", "Playfair Display", serif';
      if (document.fonts && document.fonts.load) document.fonts.load(reelFont).then(function () { kick(); });

      function dirOf(A, B) { var dx = B[0] - A[0], dy = B[1] - A[1], n = Math.hypot(dx, dy) || 1; return [dx / n, dy / n, n]; }
      function lampAngle(i, P2) { var Lm = LAMPS[i]; return clamp(Math.atan2(P2[0] - Lm.x, P2[1] - Lm.y), -1.31, 1.31); }
      function lens(i, P2) { var Lm = LAMPS[i], a = lampAngle(i, P2); return [Lm.x + Math.sin(a) * 70, Lm.y + Math.cos(a) * 70]; }
      function cone(c, i, P2, half, sc, a0, a1, rgb) {
        var o = lens(i, P2), dd = dirOf(o, P2), nx = -dd[1], ny = dd[0];
        var ex = P2[0] + dd[0] * 160, ey = P2[1] + dd[1] * 160;
        var g = c.createLinearGradient(o[0] / sc, o[1] / sc, ex / sc, ey / sc);
        g.addColorStop(0, 'rgba(' + rgb + ',' + a0 + ')'); g.addColorStop(1, 'rgba(' + rgb + ',' + a1 + ')');
        c.fillStyle = g; c.beginPath();
        c.moveTo((o[0] + nx * 22) / sc, (o[1] + ny * 22) / sc); c.lineTo((o[0] - nx * 22) / sc, (o[1] - ny * 22) / sc);
        c.lineTo((ex - nx * half * 1.25) / sc, (ey - ny * half * 1.25) / sc); c.lineTo((ex + nx * half * 1.25) / sc, (ey + ny * half * 1.25) / sc);
        c.closePath(); c.fill();
      }
      function pool(c, P2, rx, ry, sc, a) {
        c.save(); c.translate(P2[0] / sc, P2[1] / sc); c.scale(1, ry / rx);
        var g = c.createRadialGradient(0, 0, 0, 0, 0, rx / sc);
        g.addColorStop(0, 'rgba(255,226,170,' + a + ')'); g.addColorStop(.55, 'rgba(255,226,170,' + a * .75 + ')'); g.addColorStop(1, 'rgba(255,226,170,0)');
        c.fillStyle = g; c.beginPath(); c.arc(0, 0, rx / sc, 0, 7); c.fill(); c.restore();
      }
      function drawLamp(i, P2, pw) {
        var Lm = LAMPS[i], s = spr[Lm.s], a = lampAngle(i, P2);
        ctx.save(); ctx.translate(Lm.x, Lm.y); ctx.rotate(-a);
        if (s.off) ctx.drawImage(s.off, -55, -58);
        if (s.on && pw > .01) { ctx.globalAlpha = pw; ctx.drawImage(s.on, -55, -58); }
        ctx.restore(); ctx.globalAlpha = 1;
        var fa = flash[i] < 0 ? 0 : 1 - (performance.now() - flash[i]) / 520;
        if (fa > 0) {   // 开灯瞬间的镜头炫光
          var o2 = lens(i, P2), fg = ctx.createRadialGradient(o2[0], o2[1], 0, o2[0], o2[1], 300);
          fg.addColorStop(0, 'rgba(255,250,232,' + .95 * fa + ')'); fg.addColorStop(.18, 'rgba(255,220,150,' + .45 * fa + ')'); fg.addColorStop(1, 'rgba(255,200,120,0)');
          ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(o2[0], o2[1], 300, 0, 7); ctx.fill();
          ctx.globalCompositeOperation = 'source-over';
        }
        if (pw > .01) {
          var o = lens(i, P2), g = ctx.createRadialGradient(o[0], o[1], 0, o[0], o[1], 70);
          g.addColorStop(0, 'rgba(255,248,226,' + .7 * pw + ')'); g.addColorStop(.35, 'rgba(255,214,140,' + .28 * pw + ')'); g.addColorStop(1, 'rgba(255,214,140,0)');
          ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o[0], o[1], 70, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
        }
      }
      function butterfly(c, x, y, sc, rot, flap, a, col) {
        c.save(); c.translate(x, y); c.rotate(rot); c.scale(flap * sc, sc); c.globalAlpha = a; c.fillStyle = col || '#ffd98a';
        c.beginPath(); c.ellipse(-6, -3, 6, 4.5, -.5, 0, 7); c.ellipse(6, -3, 6, 4.5, .5, 0, 7); c.fill();
        c.beginPath(); c.ellipse(-4, 4, 3.5, 3, .4, 0, 7); c.ellipse(4, 4, 3.5, 3, -.4, 0, 7); c.fill(); c.restore();
      }
      function inRect(pt, r, pad) { pad = pad || 0; return pt && pt[0] >= r[0] - pad && pt[0] <= r[2] + pad && pt[1] >= r[1] - pad && pt[1] <= r[3] + pad; }
      function inEll(pt, e) { return pt && Math.pow((pt[0] - e.x) / e.rx, 2) + Math.pow((pt[1] - e.y) / e.ry, 2) < 1; }
      function drawPerson(c, img) { if (img) c.drawImage(img, PX, PY, img.width * PS, img.height * PS); }
      function darkBand(c) {
        if (!L.band) return;
        var g = c.createLinearGradient(0, L.band, 0, L.band + 300);
        g.addColorStop(0, 'rgba(6,4,2,0)'); g.addColorStop(1, 'rgba(6,4,2,.9)');
        c.fillStyle = g; c.fillRect(0, L.band, W, H - L.band);
      }
      function lightAt(TT, pw, x, y, R) {
        var v = 0; for (var j = 0; j < 2; j++) v = Math.max(v, pw * lp[j] * Math.max(0, 1 - Math.hypot(TT[j][0] - x, (TT[j][1] - y) * 1.2) / R));
        return v;
      }
      // 数字翻滚：把这一块的数字像翻牌一样滚两三圈再停住
      function drawRoll(k, now) {
        var st = rolls[k], t = st.start < 0 ? 1 : Math.min(1, (now - st.start) / 760), moving = t < 1;
        ROLL[k].forEach(function (rr) {
          var dr = TR(k, rr), w = dr[2] - dr[0], h = dr[3] - dr[1];
          nlx.clearRect(dr[0] - 1, dr[1] - 1, w + 2, h + 2);
          nlx.save(); nlx.beginPath(); nlx.rect(dr[0], dr[1], w, h); nlx.clip();
          if (!moving || !numsSrc) { if (numsSrc) nlx.drawImage(numsSrc, rr[0], rr[1], rr[2] - rr[0], rr[3] - rr[1], dr[0], dr[1], w, h); }
          else {
            var off = (1 - e4(t)) * 3, fr = off % 1, fast = (1 - t) > .25;
            [[0, 1], [-.16, fast ? .3 : 0], [.16, fast ? .3 : 0]].forEach(function (gh) {
              if (!gh[1]) return; nlx.globalAlpha = gh[1];
              [fr, fr - 1].forEach(function (o2) { nlx.drawImage(numsSrc, rr[0], rr[1], rr[2] - rr[0], rr[3] - rr[1], dr[0], dr[1] + (o2 + gh[0]) * h, w, h); });
            });
            nlx.globalAlpha = 1;
          }
          nlx.restore();
        });
        if (!moving) st.start = -1;
        return moving;
      }

      function frame(now) {
        raf = 0;
        if (!styleActive || !coverVisible || document.hidden) return;
        var moving = sweeping || inside || hatFlies.length > 0;
        var fdt = Math.min(4, Math.max(.5, (now - (frame.last || now - 16.7)) / 16.7)); frame.last = now;   // 按真实时间推进，帧率低时动画也不拖慢
        function kf(k) { return 1 - Math.pow(1 - k, fdt); }
        for (var i = 0; i < 2; i++) {
          var ox = cur[i][0], oy = cur[i][1];
          cur[i][0] += (tgt[i][0] - cur[i][0]) * kf(.08); cur[i][1] += (tgt[i][1] - cur[i][1]) * kf(.08);
          if (Math.abs(cur[i][0] - ox) + Math.abs(cur[i][1] - oy) > .3) moving = true;
          lp[i] += (lpT[i] - lp[i]) * (lpT[i] > lp[i] ? .22 : .07); if (Math.abs(lpT[i] - lp[i]) > .003) moving = true;
        }
        poolR = [poolR[0] + (poolTgt[0] - poolR[0]) * kf(poolK), poolR[1] + (poolTgt[1] - poolR[1]) * kf(poolK)];
        if (Math.abs(poolTgt[0] - poolR[0]) > .5) moving = true;
        power += (powerT - power) * .07; if (Math.abs(powerT - power) > .002) moving = true;
        black += (blackT - black) * .06; if (Math.abs(blackT - black) > .003) moving = true;
        var p = power, lv = [lp[0], lp[1]];
        for (var f0 = 0; f0 < 2; f0++) if (flick[f0] > 0) { lv[f0] *= (Math.random() < .45 ? .12 : 1); flick[f0]--; moving = true; }
        var sway = inside && !reduce ? Math.sin(now / 900) * 8 : 0; if (inside) moving = true;
        var TT = [[cur[0][0] + sway, cur[0][1]], [cur[1][0] - sway, cur[1][1]]];
        var focus = [(TT[0][0] + TT[1][0]) / 2, (TT[0][1] + TT[1][1]) / 2];
        var lsum = Math.max(lv[0], lv[1]) * p;

        // 人物：灯打到脸才亮，停两秒浮出问候
        var onPerson = lsum > .5 && Math.pow((focus[0] - FACE[0]) / (330 * PS), 2) + Math.pow((focus[1] - FACE[1]) / (430 * PS), 2) < 1;
        personF += ((onPerson ? 1 : 0) - personF) * .06; if (Math.abs(personF - (onPerson ? 1 : 0)) > .004) moving = true;
        if (onPerson && introDone && L.hello) { if (!personHold) personHold = now; if (now - personHold > 2000) hello.classList.add('on'); moving = true; }
        else { personHold = 0; hello.classList.remove('on'); }

        // 188 滚轮触发
        beamK += (beamKT - beamK) * kf(.03); if (Math.abs(beamKT - beamK) > .003) moving = true;
        latch += (latchT - latch) * kf(.04); if (Math.abs(latchT - latch) > .003) moving = true;
        var l188 = Math.max(lightAt(TT, p, REEL.cx, REEL.cy, 440), latch);
        var want = !!(inside && mouse && inRect(mouse, REEL.band, 30));   // 放上去才转出 188，移开回到 ???
        if (want !== reelOn) {
          reelOn = want;
          reels.forEach(function (r, c) {
            var c0 = r.pos, tIdx = want ? REAL[c] : 0, base = Math.floor(c0 / 11) * 11, to = base + tIdx;
            while (to < c0 + 22) to += 11;
            r.from = c0; r.to = to; r.start = now + c * 60; r.dur = reduce ? 1 : (want ? 900 + c * 260 : 750 + c * 200);
          });
        }
        // 每块文字的受光与悬停
        var hb = -1;
        BLOCKS.forEach(function (b, k) {
          if (inside && inRect(mouse, b.r)) hb = k;
          b.lit = lightAt(TT, p, (b.r[0] + b.r[2]) / 2, (b.r[1] + b.r[3]) / 2, Math.max(poolR[0], 260) + 120);
          numReels.forEach(function (nr) {
            if (nr.k !== b.k) return;
            var on = b.lit > .35; nr.lit = b.lit;
            if (false && on && !nr.on && !reduce) nr.cols.forEach(function (c, i) {   // 每一位多转几圈，错开停下
              c.from = c.pos; var base = Math.floor(c.pos / 10) * 10 + c.d; c.to = base + 10 * (2 + i); c.start = now + i * 70; c.dur = 760 + i * 140;
            });
            nr.on = on;
          });
          if (b.k === 'sig' && !sigDone && sigStart < 0 && b.lit > .3) sigStart = now;
        });
        BLOCKS.forEach(function (b, k) { var tg = k === hb ? 1 : 0; b.f += (tg - b.f) * .14; if (Math.abs(b.f - tg) > .003) moving = true; });
        var hatHover = inside && inEll(mouse, HAT);
        var link = hb >= 0 && BLOCKS[hb].href;
        cv.style.cursor = fine ? 'none' : (link ? 'pointer' : '');
        dot.classList.toggle('big', !!(link || hatHover));

        ctx.setTransform(1, 0, 0, 1, -L.x0, 0);
        // ① 暗场底
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
        ctx.drawImage(bgDark, 0, 0);
        if (stairs) ctx.drawImage(stairs, 0, 0);
        if (mrf) { ctx.globalAlpha = .55; ctx.drawImage(mrf, 0, 0); ctx.globalAlpha = 1; }
        drawPerson(ctx, pDark);
        darkBand(ctx);
        var rk = revealK(); if (rk < 1) moving = true;
        if (ring) { ctx.globalAlpha = (.3 + .7 * latch) * rk; ctx.drawImage(ring, RING0[0], RING0[1], RING0[2] - RING0[0], RING0[3] - RING0[1], RINGD[0], RINGD[1], RINGD[2] - RINGD[0], RINGD[3] - RINGD[1]); ctx.globalAlpha = 1; }
        ctx.globalAlpha = (.26 + .74 * latch) * rk; ctx.drawImage(numsL, 0, 0); ctx.globalAlpha = 1;   // 数字平时暗着；照亮过后保持常亮
        dim += (dimT - dim) * kf(.022); if (Math.abs(dimT - dim) > .004) moving = true;
        if (dim > .004) { ctx.globalAlpha = dim; ctx.fillStyle = '#050302'; ctx.fillRect(L.x0, 0, L.w, H); ctx.globalAlpha = 1; }   // 开场时舞台压暗，只有灯光照到的地方亮
        if (dim > .004 && stairs) { ctx.globalAlpha = dim * .4; ctx.drawImage(stairs, 0, 0); ctx.globalAlpha = 1; }   // 台阶在暗场里保持约 40% 亮度

        // ② 追光照到的地方换成亮场
        if (lsum > .01) {
          mx.setTransform(1, 0, 0, 1, 0, 0); mx.clearRect(0, 0, mkc.width, mkc.height);
          for (var j = 0; j < 2; j++) if (lv[j] > .01) { cone(mx, j, TT[j], 170, K, .42 * p * lv[j] * beamK, .7 * p * lv[j] * beamK, '255,226,170'); pool(mx, TT[j], poolR[0], poolR[1], K, .92 * p * lv[j]); }
          tx.globalCompositeOperation = 'source-over'; tx.clearRect(0, 0, W, H);
          tx.drawImage(bgLit, 0, 0);
          if (mrf) tx.drawImage(mrf, 0, 0);
          drawPerson(tx, pLit);
          darkBand(tx);
          tx.globalAlpha = rk;
          if (ring) tx.drawImage(ring, RING0[0], RING0[1], RING0[2] - RING0[0], RING0[3] - RING0[1], RINGD[0], RINGD[1], RINGD[2] - RINGD[0], RINGD[3] - RINGD[1]);
          tx.drawImage(numsL, 0, 0); tx.globalAlpha = 1;
          tx.globalCompositeOperation = 'destination-in'; tx.imageSmoothingEnabled = true; tx.imageSmoothingQuality = 'high';
          tx.drawImage(mkc, 0, 0, W, H);
          ctx.drawImage(tmp, 0, 0);
          // 金箔反光：只在光经过 MRF 时
          var near = Math.max(0, 1 - Math.max(0, focus[1] - 480) / 340);
          if (mrfMask && near > .02) {
            shx.globalCompositeOperation = 'source-over'; shx.clearRect(0, 0, W, 600);
            var sx = focus[0] + Math.sin(now / 1300) * 60, gr = shx.createLinearGradient(sx - 240, 0, sx + 240, 200);
            gr.addColorStop(0, 'rgba(255,236,190,0)'); gr.addColorStop(.5, 'rgba(255,236,190,1)'); gr.addColorStop(1, 'rgba(255,236,190,0)');
            shx.fillStyle = gr; shx.fillRect(0, 0, W, 600);
            shx.globalCompositeOperation = 'destination-in'; shx.drawImage(mrfMask, 0, 0, W, 600, 0, 0, W, 600);
            ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .32 * lsum * near; ctx.drawImage(sh, 0, 0);
            ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
          }
          // 光柱空气感、微尘、小蝴蝶
          ctx.globalCompositeOperation = 'screen';
          for (var k2 = 0; k2 < 2; k2++) { ctx.globalAlpha = .07 * p * lv[k2] * beamK; cone(ctx, k2, TT[k2], 150, 1, .9, 0, '255,217,154'); }
          ctx.globalAlpha = 1;
          for (var m = 0; m < motes.length; m++) {
            var mo = motes[m], L0 = lens(mo.b, TT[mo.b]), T0 = TT[mo.b], d0 = dirOf(L0, T0);
            mo.t += .0006 * mo.v; if (mo.t > 1) mo.t -= 1;
            var tt = mo.t, w0 = 20 + 170 * tt, x = L0[0] + (T0[0] - L0[0]) * tt - d0[1] * mo.u * w0, y = L0[1] + (T0[1] - L0[1]) * tt + d0[0] * mo.u * w0;
            ctx.fillStyle = 'rgba(255,236,196,' + (.45 * p * lv[mo.b] * Math.sin(tt * Math.PI)) + ')';
            ctx.beginPath(); ctx.arc(x, y + Math.sin(now / 700 + m) * 4, mo.r, 0, 7); ctx.fill();
          }
          flies.forEach(function (fl) {
            fl.t += .0007 * fl.dir; if (fl.t > .95) fl.dir = -1; if (fl.t < .3) fl.dir = 1;
            var L1 = lens(fl.b, TT[fl.b]), T1 = TT[fl.b], d1 = dirOf(L1, T1), w1 = 20 + 170 * fl.t, u1 = fl.u + Math.sin(now / 1900 + fl.ph) * .35;
            var bx = L1[0] + (T1[0] - L1[0]) * fl.t - d1[1] * u1 * w1, by = L1[1] + (T1[1] - L1[1]) * fl.t + d1[0] * u1 * w1 + Math.sin(now / 520 + fl.ph) * 8;
            butterfly(ctx, bx, by, 1.5, Math.sin(now / 800 + fl.ph) * .4, .25 + .75 * Math.abs(Math.sin(now / 110 + fl.ph)), .75 * p * lv[fl.b] * Math.sin(fl.t * Math.PI));
          });
          if (personF > .05) SPARK.forEach(function (sp, n) {
            var a = personF * Math.max(0, Math.sin(now / 260 + n * 1.7)) * .9, r = 14 + 7 * Math.sin(now / 400 + n);
            if (a < .05) return;
            ctx.save(); ctx.translate(sp[0], sp[1]); ctx.rotate(n); ctx.fillStyle = 'rgba(255,246,220,' + a + ')';
            ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * .18, -r * .18); ctx.lineTo(r, 0); ctx.lineTo(r * .18, r * .18); ctx.lineTo(0, r); ctx.lineTo(-r * .18, r * .18); ctx.lineTo(-r, 0); ctx.lineTo(-r * .18, -r * .18); ctx.closePath(); ctx.fill(); ctx.restore();
          });
          ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
        }

        // ③ 188 滚轮
        var spinning = false;
        reels.forEach(function (r) {
          if (r.start >= 0) { var t = Math.max(0, Math.min(1, (now - r.start) / r.dur)); r.pos = r.from + (r.to - r.from) * e4(t); r.v = (r.to - r.from) * 4 * Math.pow(1 - t, 3) / r.dur; if (t >= 1) { r.start = -1; r.v = 0; } else spinning = true; }
        });
        if (spinning) moving = true;
        rx2.globalCompositeOperation = 'source-over'; rx2.clearRect(0, 0, rc.width, rc.height); rx2.font = reelFont; rx2.textAlign = 'center'; rx2.textBaseline = 'alphabetic';
        var yb = REEL0.base - REEL0.band[1], gg = rx2.createLinearGradient(0, yb - REEL0.size * .72, 0, yb);
        gg.addColorStop(0, '#fff6d6'); gg.addColorStop(.35, '#f5d27e'); gg.addColorStop(.62, '#c88c2e'); gg.addColorStop(.8, '#f7dc95'); gg.addColorStop(1, '#a8701f');
        var hS = REEL0.size * .83;
        reels.forEach(function (r, c) {
          var i0 = Math.floor(r.pos), fr = r.pos - i0, x = REEL0.cols[c] - REEL0.band[0];
          var ghosts = r.v > .004 ? [[0, 1], [-20, .35], [20, .35]] : [[0, 1]];
          ghosts.forEach(function (g) {
            rx2.globalAlpha = g[1];
            (fr > .002 ? [[i0, fr * hS], [i0 + 1, (fr - 1) * hS]] : [[i0, 0]]).forEach(function (it) {
              rx2.shadowColor = 'rgba(60,35,5,.9)'; rx2.shadowOffsetY = 5; rx2.shadowBlur = 0;
              rx2.fillStyle = gg; rx2.fillText(SYM[((it[0] % 11) + 11) % 11], x, yb + it[1] + g[0]);
            });
          });
        });
        rx2.globalAlpha = 1; rx2.shadowColor = 'transparent';
        var band = rx2.createLinearGradient(0, 0, 0, rc.height);
        band.addColorStop(0, 'rgba(0,0,0,1)'); band.addColorStop(.12, 'rgba(0,0,0,0)'); band.addColorStop(.88, 'rgba(0,0,0,0)'); band.addColorStop(1, 'rgba(0,0,0,1)');
        rx2.globalCompositeOperation = 'destination-out'; rx2.fillStyle = band; rx2.fillRect(0, 0, rc.width, rc.height);
        rx2.globalCompositeOperation = 'source-atop'; rx2.fillStyle = 'rgba(8,6,4,' + (reelOn ? 0 : (1 - Math.min(1, l188 * 1.6)) * .45) + ')'; rx2.fillRect(0, 0, rc.width, rc.height);
        rx2.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = (1 - dim * .9) * revealK(); ctx.drawImage(rc, REEL.band[0], REEL.band[1], REEL.band[2] - REEL.band[0], REEL.band[3] - REEL.band[1]); ctx.globalAlpha = 1;

        // 其他数字的滚轮
        numReels.forEach(function (nr) {
          var lit = Math.max(latch, Math.min(1, nr.lit * 1.6)), h = nr.h, step = h * 1.38;
          ctx.save(); ctx.beginPath(); ctx.rect(nr.cols[0].cx - 400, nr.base - h * 1.12, 800 + (nr.cols[nr.cols.length - 1].cx - nr.cols[0].cx), h * 1.26); ctx.clip();
          ctx.font = nr.font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
          var g = ctx.createLinearGradient(0, nr.base - h, 0, nr.base);
          g.addColorStop(0, '#fff6d6'); g.addColorStop(.35, '#f5d27e'); g.addColorStop(.62, '#c88c2e'); g.addColorStop(.8, '#f7dc95'); g.addColorStop(1, '#a8701f');
          ctx.fillStyle = g; ctx.shadowColor = 'rgba(40,22,4,.85)'; ctx.shadowOffsetY = 4;
          nr.cols.forEach(function (c) {
            var v = 0;
            if (c.start >= 0) { var t = clamp((now - c.start) / c.dur, 0, 1); c.pos = c.from + (c.to - c.from) * e4(t); v = (c.to - c.from) * 4 * Math.pow(1 - t, 3) / c.dur; if (t >= 1) { c.start = -1; c.pos = c.to; } moving = true; }
            var i0 = Math.floor(c.pos + 1e-6), fr = c.pos - i0;
            var gh = v > .006 ? [[0, 1], [-.18, .32], [.18, .32]] : [[0, 1]];
            gh.forEach(function (q) {
              ctx.globalAlpha = (.26 + .74 * lit) * q[1] * (1 - dim * .9) * revealK();
              ctx.fillText(String(((i0 % 10) + 10) % 10), c.cx, nr.base - fr * step + q[0] * step);
              if (fr > .001) ctx.fillText(String((((i0 + 1) % 10) + 10) % 10), c.cx, nr.base + (1 - fr) * step + q[0] * step);
            });
          });
          ctx.restore(); ctx.globalAlpha = 1;
        });

        // 金线分隔
        if (L.rule) {
          var rg = ctx.createLinearGradient(200, 0, 2360, 0);
          rg.addColorStop(0, 'rgba(201,160,82,0)'); rg.addColorStop(.15, 'rgba(201,160,82,.55)'); rg.addColorStop(.85, 'rgba(201,160,82,.55)'); rg.addColorStop(1, 'rgba(201,160,82,0)');
          ctx.fillStyle = rg; ctx.fillRect(200, L.rule - 1, 2160, 2);
          ctx.fillStyle = 'rgba(232,195,122,.9)'; ctx.beginPath(); ctx.moveTo(1280, L.rule - 8); ctx.lineTo(1288, L.rule); ctx.lineTo(1280, L.rule + 8); ctx.lineTo(1272, L.rule); ctx.closePath(); ctx.fill();
        }

        // ④ 灯头
        drawLamp(0, TT[0], p * lv[0]); drawLamp(1, TT[1], p * lv[1]);

        // ⑤ 签名书写（只写一次）
        if (L.at.sig && !sigDone && sigStart >= 0 && textSrc) {
          sigP = reduce ? 1 : Math.min(1, (now - sigStart) / 1500); moving = true;
          var sr = TR('sig', SRC.sig), sw = sigC.width, shh = sigC.height, xe = sigP * (sw + 80);
          sgx.globalCompositeOperation = 'source-over'; sgx.clearRect(0, 0, sw, shh);
          sgx.drawImage(textSrc, SRC.sig[0], SRC.sig[1], SRC.sig[2] - SRC.sig[0], SRC.sig[3] - SRC.sig[1], 0, 0, sw, shh);
          var wg = sgx.createLinearGradient(xe - 80, 0, xe, 0); wg.addColorStop(0, '#000'); wg.addColorStop(1, 'rgba(0,0,0,0)');
          sgx.globalCompositeOperation = 'destination-in'; sgx.fillStyle = wg; sgx.fillRect(0, 0, sw, shh);
          ctx.drawImage(sigC, sr[0], sr[1]);
          if (sigP < 1) {
            var px2 = sr[0] + xe - 50, py2 = sr[1] + shh * (.42 + Math.sin(now / 60) * .14), pg = ctx.createRadialGradient(px2, py2, 0, px2, py2, 34);
            pg.addColorStop(0, 'rgba(255,240,200,.9)'); pg.addColorStop(1, 'rgba(255,200,110,0)');
            ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(px2, py2, 34, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
          } else { sigDone = true; blit(tlx, textSrc, 'sig', SRC.sig); }
        }

        // ⑥ 常亮文字；悬停时只让字形本身发光
        if (textAT === 1 && window.__mcTextT) { var tq = Math.min(1, Math.max(0, (performance.now() - window.__mcTextT - 100) / 2000)); textA = tq * tq * (3 - 2 * tq); if (tq < 1) moving = true; } else { textA += (textAT - textA) * kf(.035); if (Math.abs(textAT - textA) > .004) moving = true; }   // 开场：右侧文字与左侧大字同节奏渐出
        if (textA > .01) { ctx.globalAlpha = textA; ctx.drawImage(textL, 0, 0); ctx.globalAlpha = 1; }
        BLOCKS.forEach(function (b) {
          var f = b.f; if (f < .01) return;
          var r = b.r, w = r[2] - r[0], h = r[3] - r[1];
          glx.clearRect(r[0] - 60, r[1] - 60, w + 120, h + 120);
          glx.drawImage(textL, r[0], r[1], w, h, r[0], r[1], w, h);
          if (b.lit > .3) glx.drawImage(numsL, r[0], r[1], w, h, r[0], r[1], w, h);
          ctx.save(); ctx.beginPath(); ctx.rect(r[0] - 60, r[1] - 60, w + 120, h + 120); ctx.clip();
          ctx.shadowColor = 'rgba(255,196,100,' + .9 * f + ')'; ctx.shadowBlur = 26 * f;
          ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .55 * f * revealK();
          ctx.drawImage(gl, r[0] - 60, r[1] - 60, w + 120, h + 120, r[0] - 60, r[1] - 60, w + 120, h + 120);
          ctx.restore();
        });

        // ⑦ MRF 竖笔灯泡
        bulbs.forEach(function (b, bi2) {
          var t = 0; for (var q3 = 0; q3 < 2; q3++) t = Math.max(t, lv[q3] * (1 - Math.hypot(TT[q3][0] - b.x, (TT[q3][1] - b.y) * .8) / 360));
          t = clamp(t * 1.6, 0, 1) * p;
          if (chase >= 0) { var ce = now - chase - [0, 1, 2, 3, 4, 9, 8, 7, 6, 5].indexOf(bi2) * 110; if (ce > 0 && ce < 1500) { t = Math.max(t, 1); moving = true; } else if (ce < 0) moving = true; }
          b.v += (t - b.v) * (t > b.v ? .1 : .035); if (Math.abs(t - b.v) > .004) moving = true;
          if (b.v > .02) {
            var g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 34);
            g.addColorStop(0, 'rgba(255,226,160,' + .75 * b.v + ')'); g.addColorStop(1, 'rgba(255,200,110,0)');
            ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, 34, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
          }
          ctx.fillStyle = '#281c0e'; ctx.strokeStyle = 'rgba(150,112,58,.9)'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(b.x, b.y, 11, 0, 7); ctx.fill(); ctx.stroke();
          var c0 = [120, 88, 44], c1 = [255, 246, 222];
          ctx.fillStyle = 'rgb(' + c0.map(function (a, i2) { return Math.round(a + (c1[i2] - a) * b.v); }).join(',') + ')';
          ctx.beginPath(); ctx.arc(b.x, b.y, 7, 0, 7); ctx.fill();
        });

        // ⑧ 帽子上飞出的金蝴蝶
        hatFlies = hatFlies.filter(function (hf) {
          var t = (now - hf.t0) / 2800; if (t >= 1) return false;
          var a = hf.ang + t * Math.PI * 2 * hf.dir, rr = hf.R * Math.sin(Math.PI * t);
          var x = hf.x + Math.cos(a) * rr * 1.4, y = hf.y - Math.sin(Math.PI * t) * 170 + Math.sin(a) * rr * .55;
          var flap = .25 + .75 * Math.abs(Math.sin(now / 90 + hf.ph));
          ctx.save(); ctx.shadowColor = 'rgba(255,200,110,.8)'; ctx.shadowBlur = 14;
          butterfly(ctx, x, y, 2.4, Math.cos(a) * .5, flap, Math.min(1, Math.sin(Math.PI * t) * 1.6), '#ffdc94');
          ctx.restore();
          return true;
        });

        if (burst >= 0) {   // 高潮：光落到脸上时冒出一圈闪光
          var bt = (now - burst) / 900;
          if (bt >= 1) burst = -1; else {
            moving = true; ctx.globalCompositeOperation = 'screen';
            for (var bk = 0; bk < 18; bk++) {
              var ang = bk / 18 * 6.283 + bt * .6, rr = 120 + e3(bt) * 330 * PS, sx2 = FACE[0] + Math.cos(ang) * rr * 1.1, sy2 = FACE[1] - 40 + Math.sin(ang) * rr * .85, ra = (1 - bt) * (bk % 3 ? .7 : 1), sz = (bk % 3 ? 9 : 16) * (1 - bt * .5);
              ctx.save(); ctx.translate(sx2, sy2); ctx.rotate(ang); ctx.fillStyle = 'rgba(255,240,205,' + ra + ')';
              ctx.beginPath(); ctx.moveTo(0, -sz); ctx.lineTo(sz * .2, -sz * .2); ctx.lineTo(sz, 0); ctx.lineTo(sz * .2, sz * .2); ctx.lineTo(0, sz); ctx.lineTo(-sz * .2, sz * .2); ctx.lineTo(-sz, 0); ctx.lineTo(-sz * .2, -sz * .2); ctx.closePath(); ctx.fill(); ctx.restore();
            }
            var fg2 = ctx.createRadialGradient(FACE[0], FACE[1], 0, FACE[0], FACE[1], 420 * PS); fg2.addColorStop(0, 'rgba(255,230,180,' + .35 * (1 - bt) + ')'); fg2.addColorStop(1, 'rgba(255,210,140,0)');
            ctx.fillStyle = fg2; ctx.beginPath(); ctx.arc(FACE[0], FACE[1], 420 * PS, 0, 7); ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
          }
        }
        // ⑨ 开场黑场
        if (black > .004) { ctx.globalAlpha = black; ctx.fillStyle = '#050302'; ctx.fillRect(L.x0, 0, L.w, H); ctx.globalAlpha = 1; }
        if (slit) {
          var se = now - slit.t0, op = (function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; })(clamp((se - 1150) / 1000, 0, 1)), gap = op * (H * .62), cy = slit.cy;
          ctx.fillStyle = '#050302';
          if (op < 1) { ctx.fillRect(L.x0, 0, L.w, Math.max(0, cy - gap)); ctx.fillRect(L.x0, cy + gap, L.w, H - cy - gap); }
          var la = (1 - op) * .95 + .05 * (1 - op);
          if (la > .01) {
            [cy - gap, cy + gap].forEach(function (yy) {
              var lg = ctx.createLinearGradient(L.x0, 0, L.x0 + L.w, 0);
              lg.addColorStop(0, 'rgba(255,214,140,0)'); lg.addColorStop(.5, 'rgba(255,236,190,' + la + ')'); lg.addColorStop(1, 'rgba(255,214,140,0)');
              ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = lg; ctx.fillRect(L.x0, yy - 2, L.w, 4);
              var gl2 = ctx.createLinearGradient(0, yy - 60, 0, yy + 60); gl2.addColorStop(0, 'rgba(255,200,110,0)'); gl2.addColorStop(.5, 'rgba(255,200,110,' + .25 * la + ')'); gl2.addColorStop(1, 'rgba(255,200,110,0)');
              ctx.fillStyle = gl2; ctx.fillRect(L.x0, yy - 60, L.w, 120); ctx.globalCompositeOperation = 'source-over';
            });
          }
          var fa2 = 0;   // 横向眩光已去掉
          if (fa2 > .01) {   // 宽银幕横向眩光
            ctx.globalCompositeOperation = 'screen';
            var fx = slit.cx, hg = ctx.createLinearGradient(L.x0, 0, L.x0 + L.w, 0);
            hg.addColorStop(0, 'rgba(120,160,255,0)'); hg.addColorStop(.3, 'rgba(150,185,255,' + .35 * fa2 + ')'); hg.addColorStop(.5, 'rgba(255,245,225,' + .95 * fa2 + ')'); hg.addColorStop(.7, 'rgba(150,185,255,' + .35 * fa2 + ')'); hg.addColorStop(1, 'rgba(120,160,255,0)');
            ctx.fillStyle = hg; ctx.fillRect(L.x0, cy - 3, L.w, 6);
            var vg = ctx.createLinearGradient(0, cy - 40, 0, cy + 40); vg.addColorStop(0, 'rgba(140,175,255,0)'); vg.addColorStop(.5, 'rgba(160,190,255,' + .22 * fa2 + ')'); vg.addColorStop(1, 'rgba(140,175,255,0)');
            ctx.fillStyle = vg; ctx.fillRect(L.x0, cy - 40, L.w, 80);
            var cg = ctx.createRadialGradient(fx, cy, 0, fx, cy, 260); cg.addColorStop(0, 'rgba(255,248,230,' + .8 * fa2 + ')'); cg.addColorStop(.25, 'rgba(255,215,150,' + .3 * fa2 + ')'); cg.addColorStop(1, 'rgba(255,200,120,0)');
            ctx.fillStyle = cg; ctx.beginPath(); ctx.ellipse(fx, cy, 520, 120, 0, 0, 7); ctx.fill();
            [[-.32, 26, .22], [.22, 16, .18], [.45, 40, .12]].forEach(function (g) {   // 镜头光斑
              var gx = fx + (fx - L.x0 - L.w / 2) * 0 + g[0] * L.w * .5; ctx.fillStyle = 'rgba(170,200,255,' + g[2] * fa2 + ')'; ctx.beginPath(); ctx.arc(gx, cy, g[1], 0, 7); ctx.fill();
            });
            ctx.globalCompositeOperation = 'source-over';
          }
          ctx.globalCompositeOperation = 'lighter';
          slit.pts.forEach(function (q, i) {
            var t = (se - q.d) / q.life; if (t <= 0 || t >= 1) return;
            var tt = t * q.life / 1000, x = q.x + q.vx * tt, y = q.y + q.vy * tt + 40 * tt * tt;
            var a = Math.sin(Math.PI * t) * (.6 + .4 * Math.sin(now / 110 + q.tw));
            ctx.fillStyle = 'rgba(255,' + (205 + (i % 35)) + ',135,' + a + ')'; ctx.beginPath(); ctx.arc(x, y, q.s * (1 - t * .5), 0, 7); ctx.fill();
          });
          ctx.globalCompositeOperation = 'source-over';
          if (se > 3500) slit = null; else moving = true;
        }
        if (dust) {   // 金粉从四周飘来，聚成 MRF，闪光后舞台亮起
          var el = now - dust.t0, form = clamp((el - 1250) / 550, 0, 1), fade = clamp((el - 2300) / 900, 0, 1);
          ctx.globalCompositeOperation = 'lighter';
          dust.pts.forEach(function (q, i) {
            var t = clamp((el - q.d) / q.dur, 0, 1); if (t <= 0) return;
            var e = 1 - Math.pow(1 - t, 3), sw = Math.sin(t * Math.PI) * q.sw;
            var x = q.sx + (q.tx - q.sx) * e + sw * .6, y = q.sy + (q.ty - q.sy) * e - sw * .4;
            var a = Math.min(1, t * 2) * (1 - form * .85) * (1 - fade) * (.55 + .45 * Math.sin(now / 120 + q.tw));
            if (a < .02) return;
            ctx.fillStyle = 'rgba(255,' + (200 + (i % 40)) + ',130,' + a + ')';
            ctx.beginPath(); ctx.arc(x, y, q.s * (1 - e * .45), 0, 7); ctx.fill();
          });
          ctx.globalCompositeOperation = 'source-over';
          if (mrf && form > 0) { ctx.globalAlpha = form * (1 - fade) * Math.max(black, .0); ctx.drawImage(mrf, 0, 0); ctx.globalAlpha = 1; }
          var fl = Math.max(0, 1 - Math.abs(el - 1850) / 380);
          if (fl > 0) {
            var fg = ctx.createRadialGradient(1270, 260, 0, 1270, 260, 760);
            fg.addColorStop(0, 'rgba(255,240,205,' + .75 * fl + ')'); fg.addColorStop(.35, 'rgba(255,205,120,' + .3 * fl + ')'); fg.addColorStop(1, 'rgba(255,200,110,0)');
            ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = fg; ctx.fillRect(L.x0, 0, L.w, 1100); ctx.globalCompositeOperation = 'source-over';
          }
          if (el > 3300) dust = null; else moving = true;
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        raf = moving ? requestAnimationFrame(frame) : 0;
      }
      function kick() { if (!raf && styleActive && coverVisible && !document.hidden) raf = requestAnimationFrame(frame); }
      frame(performance.now());

      function aim(pt, spread) { spread = spread || 40; tgt = [[pt[0] - spread, pt[1]], [pt[0] + spread, pt[1]]]; }
      function rest() { tgt = [[FACE[0] - 70, FACE[1] + 230], [FACE[0] + 70, FACE[1] + 230]]; poolTgt = [640, 720]; }   // 平时：两束光照亮整个人物和周围
      var timers = [];
      function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
      function finishIntro() {
        introDone = true; markSeen(); poolK = .1; beamKT = .4; d.classList.add('mc-guide-on', 'mc-ready'); d.classList.remove('mc-intro');
        later(function () { if (sigStart < 0) { sigStart = performance.now(); kick(); } }, 2600);
        if (!fine) autoSweep();
        kick();
      }
      // 开场：黑场 → 左灯“咔哒”亮 → 右灯亮 → 光从 MRF 扫到人物
      function intro(skip) {
        timers.forEach(clearTimeout); timers = []; introDone = false;
        // 加载画面：金光点炸开成金粉，接上开场
        root.classList.add('mrf-boot-out'); setTimeout(function () { root.classList.add('mrf-booted'); }, 1400);
        if (skip || reduce) { latch = latchT = 1; card.classList.add('mc-card-on', 'mc-card-lit'); card.style.transform = ''; textA = textAT = 1; dim = dimT = 0; root.classList.remove('mc-intro-on'); cur2.classList.add('open'); cur2.style.visibility = 'hidden'; d.classList.add('mc-ready'); blackT = 0; black = 0; powerT = power = 1; lpT = [1, 1]; lp = [1, 1]; cur = [HOME[0].slice(), HOME[1].slice()]; rest(); finishIntro(); return; }
        black = 1; blackT = 1; power = powerT = 1; lp = [0, 0]; lpT = [0, 0];
        d.classList.remove('mc-ready'); d.classList.add('mc-intro'); void cv.offsetWidth; d.classList.add('mc-intro-go');
        cur = [MRFPT[0].slice(), MRFPT[1].slice()]; tgt = [MRFPT[0].slice(), MRFPT[1].slice()];
        kick();
        // 开场（约 3 秒，高潮=人物被点亮）：金点拉成光缝 → 光缝张开露出暗舞台、洒出金粉 → 双灯亮起 → 光落到脸上 → 两束光分别扫过左右两栏，文字随光出现 → 回到人物
        cur2.classList.add('open'); cur2.style.visibility = 'hidden';
        black = 0; blackT = 0; textA = 0; textAT = 0; latch = latchT = 0; dim = dimT = .88; root.classList.add('mc-intro-on');
        d.classList.remove('mc-ready-l', 'mc-ready-r');
        startSlit(performance.now());
        // 第一眼：「孟若凡 · AI＋IP 编导」在黑场正中亮起，随后飞到左下角，把舞台带出来
        (function () {
          card.classList.remove('mc-card-on'); card.style.transition = 'none'; card.style.transform = '';
          var r = card.getBoundingClientRect(), sc = L === LAYOUTS.port ? 1.25 : 1.55;
          var dx = innerWidth / 2 - (r.left + r.width / 2), dy = innerHeight * .47 - (r.top + r.height / 2);
          card.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) scale(' + sc + ')';
          void card.offsetWidth;
          later(function () { card.classList.add('mc-card-on'); }, 250);
          later(function () { card.style.transition = 'transform 1.25s cubic-bezier(.55,0,.25,1)'; card.style.transform = ''; }, 1250);
        })();
        // 灯光（两盏灯动作统一：同时亮、同时移动；左灯只管左边，右灯只管右边，最后一起收到人物）
        later(function () {   // ① 同时亮起：左灯定在名字，右灯定在 188
          lpT = [1, 1]; lp = [0, 0]; flick = [5, 5]; var n = performance.now(); flash = [n, n];
          tgt = [[333, 1292], [2075, 735]]; cur = [tgt[0].slice(), tgt[1].slice()]; poolR = [270, 210]; poolTgt = [270, 210];
          card.classList.add('mc-card-lit'); kick();
        }, 2550);
        later(function () {   // ③ 同时收到人物身上，舞台亮起
          rest(); poolK = .035; latchT = 1; d.classList.add('mc-ready-l', 'mc-ready-r'); window.__mcTextT = performance.now(); dimT = 0; textAT = 1;   // 光斑扩散，点亮整个人物和周围 root.classList.remove('mc-intro-on'); if (sigStart < 0) sigStart = performance.now(); kick();
        }, 3450);
        later(finishIntro, 4300);
      }
      // 触屏：灯自动慢慢扫场，数字依次亮起；手指滑动时跟手
      var sweepIdx = 0, sweepT = 0, touchHold = 0;
      function autoSweep() {
        clearTimeout(sweepT); if (reduce) return;
        sweeping = true;
        (function step() {
          if (Date.now() < touchHold) { sweepT = setTimeout(step, 600); return; }
          var path = L.sweep; if (sweepIdx >= path.length) { sweepIdx = 0; rest(); sweepT = setTimeout(step, 2600); kick(); return; }
          aim(path[sweepIdx++], 30); poolTgt = [270, 220]; kick();
          sweepT = setTimeout(step, 1500);
        })();
      }
      var started = false;
      function start(delay) {
        if (started) return; started = true;
        setTimeout(function () { intro(seen()); }, delay);
      }
      var ts = Date.now();
      (function wait() {
        var e = document.querySelector('.entrance');
        var gone = !e || e.classList.contains('entrance--exit') || getComputedStyle(e).opacity === '0' || getComputedStyle(e).display === 'none';
        var ed = document.querySelector('.edition-intro');
        var edOn = ed && root.classList.contains('edition-enter');
        if ((gone && !edOn) || Date.now() - ts > 600) start(0);
        else setTimeout(wait, 120);
      })();

      function toPoster(ev) { var r = cv.getBoundingClientRect(), s = r.width / L.w; return [(ev.clientX - r.left) / s + L.x0, (ev.clientY - r.top) / s]; }
      d.addEventListener('pointermove', function (ev) {
        if (ev.pointerType === 'touch') return;
        dot.style.transform = 'translate(' + ev.clientX + 'px,' + (ev.clientY - d.getBoundingClientRect().top) + 'px)';
        if (!introDone && !seen()) return;
        var pt = toPoster(ev); mouse = pt; inside = true; d.classList.add('mc-guided', 'mc-in');
        var blk = null; for (var bi = 0; bi < BLOCKS.length; bi++) if (inRect(pt, BLOCKS[bi].r, 20)) blk = BLOCKS[bi].r;
        if (blk) {   // 光斑刚好盖住这一块
          var bcx = (blk[0] + blk[2]) / 2, bcy = (blk[1] + blk[3]) / 2, ax = pt[0] * .35 + bcx * .65, ay = pt[1] * .35 + bcy * .65;
          tgt = [[ax - 30, ay], [ax + 30, ay]]; poolTgt = [Math.min(480, (blk[2] - blk[0]) / 2 + 80), Math.min(420, (blk[3] - blk[1]) / 2 + 80)];
        } else { tgt = [[pt[0] - 30, pt[1] + 10], [pt[0] + 30, pt[1] + 10]]; poolTgt = [300, 250]; }
        lpT = [1, 1]; powerT = 1; kick();
      });
      d.addEventListener('pointerleave', function () { inside = false; mouse = null; d.classList.remove('mc-in'); rest(); kick(); });
      function touchAt(t) {
        var pt = toPoster(t); touchHold = Date.now() + 3500; d.classList.add('mc-guided');
        tgt = [[pt[0] - 30, pt[1] - 60], [pt[0] + 30, pt[1] - 60]]; poolTgt = [280, 230]; kick();
      }
      cv.addEventListener('touchstart', function (ev) { if (ev.touches[0]) touchAt(ev.touches[0]); }, { passive: true });
      cv.addEventListener('touchmove', function (ev) { if (ev.touches[0]) touchAt(ev.touches[0]); }, { passive: true });
      cv.addEventListener('click', function (ev) {
        var pt = toPoster(ev);
        if (inEll(pt, HAT)) {   // 点帽子：金蝴蝶飞起绕一圈再落回去
          if (hatFlies.length < 12) for (var n = 0; n < 6; n++) hatFlies.push({ t0: performance.now() + n * 70, x: HAT.x - 260 + n * 104 + Math.random() * 30, y: HAT.y - 40 + Math.random() * 80, ang: Math.random() * 6.28, dir: n % 2 ? 1 : -1, R: 120 + Math.random() * 90, ph: n });
          kick(); return;
        }
        for (var k = 0; k < BLOCKS.length; k++) if (BLOCKS[k].href && inRect(pt, BLOCKS[k].r)) {
          var el = document.querySelector(BLOCKS[k].href); if (el) el.scrollIntoView({ behavior: 'smooth' }); return;
        }
      });
      if (window.IntersectionObserver) new IntersectionObserver(function (es) { coverVisible = es[0].isIntersecting; if (coverVisible) kick(); }).observe(d);
      document.addEventListener('visibilitychange', kick);
      addEventListener('resize', kick);
      addEventListener('rowan:cover-style', function (ev) {
        styleActive = !ev.detail || !ev.detail.style || ev.detail.style === 'gold';
        if (!styleActive && raf) { cancelAnimationFrame(raf); raf = 0; }
        if (styleActive) { fit(); kick(); }
      });
      addEventListener('rowan:replay-intro', function () { if (started && root.classList.contains('edition-preview')) setTimeout(function () { intro(false); }, 1800); });
    });
  }
  function mountWhenReady() {
    if (window.__rowanAppReady === true && document.readyState === 'complete') mount();
  }
  addEventListener('rowan:app-ready', mountWhenReady);
  addEventListener('load', mountWhenReady);
  mountWhenReady();
})();
