/* 单一进场音轨：进入页面即尝试播放；点右上角关闭后全部停止，不再被其它点击重新拉起。 */
(function () {
  var playlist = ["./assets/athlete-lofi.mp3", "./assets/chillow-lofi.mp3"];
  var vol = 0.35;
  var player = new Audio(playlist[0]);
  player.preload = "auto";
  player.loop = true;
  player.volume = vol;
  player.setAttribute("data-boot-music", "true");

  var gen = 0;
  var userStopped = false;
  var wantPlaying = true;

  function widgetAudios() {
    return Array.prototype.slice.call(
      document.querySelectorAll(".music-widget audio, audio:not([data-boot-music])")
    );
  }

  function isOurs(el) {
    return el === player;
  }

  function playing() {
    return !player.paused && !player.ended;
  }

  function stopPlayer() {
    gen += 1;
    try {
      player.pause();
      player.currentTime = 0;
    } catch (e) {}
    widgetAudios().forEach(function (a) {
      try { a.pause(); } catch (err) {}
    });
    syncButton();
  }

  function startPlayer() {
    if (userStopped || !wantPlaying) return;
    var my = ++gen;
    player.volume = vol;
    var p = player.play();
    if (p && p.then) {
      p.then(function () {
        if (userStopped || my !== gen) {
          try { player.pause(); } catch (e) {}
          return;
        }
        syncButton();
      }).catch(function () {
        if (userStopped || my !== gen) return;
        syncButton();
      });
    }
    syncButton();
  }

  function syncButton() {
    var on = !userStopped && wantPlaying && playing();
    document.querySelectorAll(".music-trigger").forEach(function (button) {
      button.setAttribute("data-playing", String(on));
      button.setAttribute("data-music-off", String(!on));
      button.setAttribute("aria-label", on ? "暂停背景音乐" : "播放背景音乐");
    });
  }

  function closeMusic() {
    userStopped = true;
    wantPlaying = false;
    stopPlayer();
  }

  function openMusic() {
    userStopped = false;
    wantPlaying = true;
    startPlayer();
  }

  document.addEventListener("click", function (ev) {
    var t = ev.target && ev.target.closest && ev.target.closest(".music-trigger");
    if (!t) return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    if (playing()) closeMusic();
    else openMusic();
  }, true);

  document.addEventListener("play", function (e) {
    var t = e.target;
    if (!t || t.tagName !== "AUDIO" || isOurs(t)) return;
    try { t.pause(); } catch (err) {}
    if (!userStopped && wantPlaying && player.paused) startPlayer();
  }, true);

  ["pointerdown", "keydown", "touchend"].forEach(function (ev) {
    window.addEventListener(ev, function (e) {
      if (e.target && e.target.closest && e.target.closest(".music-widget")) return;
      if (userStopped || !wantPlaying || playing()) return;
      startPlayer();
    }, true);
  });

  function boot() {
    if (userStopped) return;
    startPlayer();
  }

  boot();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  }
  window.addEventListener("load", boot);

  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    if (userStopped || playing() || tries > 40) {
      clearInterval(timer);
      return;
    }
    if (wantPlaying) startPlayer();
  }, 250);

  player.addEventListener("playing", syncButton);
  player.addEventListener("pause", syncButton);
})();
