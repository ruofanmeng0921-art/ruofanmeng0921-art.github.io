/* Rowan native background music.
   Keep the two original recordings. Their full audio sources are not available yet.
   Set src only after receiving a usable original audio file or an authorized direct URL.
   Empty sources remain honestly off: no substitute, external player, or synthetic playback. */
(function () {
  'use strict';
  if (window.__rowanMusicMounted) return;
  window.__rowanMusicMounted = true;

  var tracks = [
    { title: 'The Breakup Song', artist: 'Mateus Asato', src: '' },
    { title: 'Your Love', artist: 'Lari Basilio', src: '' }
  ];
  var audio, status, selected = 0, generation = 0, source = '';
  var enabled = false, playing = false, pending = false, blocked = false;
  var phase = 'missing', message = '', refreshFrame = 0;
  var mounted = false, pageLoaded = document.readyState === 'complete';

  function setAttribute(element, name, value) {
    if (element.getAttribute(name) !== value) element.setAttribute(name, value);
  }
  function hasSource(index) {
    return typeof tracks[index].src === 'string' && tracks[index].src.trim() !== '';
  }
  function positionStatus() {
    if (!status || status.hidden) return;
    var trigger = document.querySelector('.music-trigger');
    if (!trigger) return;
    var rect = trigger.getBoundingClientRect();
    status.style.top = Math.max(8, rect.bottom + 7) + 'px';
    status.style.right = Math.max(12, innerWidth - rect.right) + 'px';
  }
  function updateTrigger() {
    // The React Hero effect announces its completed commit explicitly.
    // Never mutate server-rendered button attributes before React takes ownership.
    if (!mounted || !window.__rowanAppReady) return;
    document.querySelectorAll('.music-trigger').forEach(function (button) {
      ['aria-haspopup', 'aria-controls', 'aria-expanded'].forEach(function (name) {
        if (button.hasAttribute(name)) button.removeAttribute(name);
      });
      var track = tracks[selected];
      var label = playing ? '暂停背景音乐：' + track.title :
        (hasSource(selected) ? '播放背景音乐：' + track.title : '背景音乐关闭：原曲音频待接入');
      setAttribute(button, 'aria-label', label);
      setAttribute(button, 'aria-pressed', String(playing));
      setAttribute(button, 'data-playing', String(playing));
      setAttribute(button, 'data-music-off', String(!playing));
      setAttribute(button, 'data-music-state', phase);
      setAttribute(button, 'title', hasSource(selected) ?
        (playing ? '点击暂停 · ' : '点击播放 · ') + track.title + ' — ' + track.artist :
        '原曲音频待接入 · The Breakup Song / Your Love');
    });
    if (status) {
      if (status.textContent !== message) status.textContent = message;
      status.hidden = !message;
      positionStatus();
    }
  }
  function scheduleRefresh() {
    if (refreshFrame) return;
    refreshFrame = requestAnimationFrame(function () { refreshFrame = 0; updateTrigger(); });
  }
  function state(next, text) {
    phase = next;
    // Only the audio element's actual `playing` event may enter this state.
    playing = next === 'playing';
    message = text || '';
    updateTrigger();
  }
  function stop() {
    generation += 1;
    enabled = false; blocked = false; pending = false;
    audio.pause();
    state(hasSource(selected) ? 'paused' : 'missing', hasSource(selected) ? '' : '原曲音频待接入');
  }
  function requestPlay() {
    if (!hasSource(selected)) {
      stop();
      return;
    }
    enabled = true; blocked = false; pending = true;
    var request = ++generation;
    var nextSource = tracks[selected].src.trim();
    if (source !== nextSource) {
      source = nextSource;
      audio.src = source;
      audio.load();
    }
    state('loading', '音乐加载中');
    try {
      var promise = audio.play();
      if (promise && typeof promise.catch === 'function') promise.catch(function (error) {
        if (request !== generation || !enabled) return;
        pending = false;
        if (error && error.name === 'NotAllowedError') {
          blocked = true;
          state('blocked', '点击音乐图标开启');
        } else {
          blocked = false;
          state('error', '音乐暂时无法播放');
        }
      });
    } catch (_) {
      pending = false; blocked = false;
      state('error', '音乐暂时无法播放');
    }
  }
  function mount() {
    if (mounted || !pageLoaded || !window.__rowanAppReady) return;
    mounted = true;
    audio = document.createElement('audio');
    audio.id = 'rowan-native-audio';
    audio.preload = 'metadata';
    audio.volume = .32;
    audio.hidden = true;
    audio.setAttribute('aria-hidden', 'true');
    audio.setAttribute('data-rowan-native-player', 'true');
    document.body.appendChild(audio);

    status = document.createElement('span');
    status.className = 'rowan-music-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    document.body.appendChild(status);

    audio.addEventListener('playing', function () {
      if (!enabled || !hasSource(selected)) { audio.pause(); return; }
      pending = false; blocked = false;
      state('playing');
    });
    audio.addEventListener('pause', function () {
      pending = false;
      // A media pause never claims sound is playing, including after a failed start.
      if (phase !== 'missing' && phase !== 'error' && phase !== 'blocked') state('paused');
      else { playing = false; updateTrigger(); }
    });
    audio.addEventListener('waiting', function () {
      if (enabled && hasSource(selected)) { pending = true; state('loading', '音乐缓冲中'); }
    });
    audio.addEventListener('error', function () {
      generation += 1;
      pending = false; blocked = false;
      state(hasSource(selected) ? 'error' : 'missing', hasSource(selected) ? '音乐暂时无法播放' : '原曲音频待接入');
    });
    audio.addEventListener('ended', function () {
      playing = false; pending = false;
      if (!enabled) { updateTrigger(); return; }
      selected = (selected + 1) % tracks.length;
      requestPlay();
    });

    document.addEventListener('click', function (event) {
      var trigger = event.target.closest && event.target.closest('.music-trigger');
      if (trigger) {
        // Replace the old React menu at capture phase: this is a plain sound switch.
        event.preventDefault(); event.stopImmediatePropagation();
        if (enabled && (playing || pending)) stop();
        else requestPlay();
        return;
      }
      // Only the initial autoplay block may be retried by a page gesture.
      // Explicitly stopping clears enabled, so ordinary browsing never restarts music.
      if (enabled && blocked && hasSource(selected)) requestPlay();
    }, true);

    // React hydration can replace the trigger or reattach menu-related attributes.
    // Observe only mutations that matter; conditional writes avoid observer loops.
    new MutationObserver(scheduleRefresh).observe(document.body, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ['aria-haspopup', 'aria-controls', 'aria-expanded']
    });
    addEventListener('resize', positionStatus, { passive: true });
    addEventListener('scroll', positionStatus, { passive: true });
    updateTrigger();
    if (hasSource(0)) requestPlay();
  }
  // `load` alone does not prove a lazy React subtree has hydrated.
  // Wait for both load and the Hero component's actual effect commit.
  addEventListener('rowan:app-ready', mount);
  if (pageLoaded) mount();
  else addEventListener('load', function () { pageLoaded = true; mount(); }, { once: true });
})();
