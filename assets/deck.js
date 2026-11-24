(function () {
  var slides = [].slice.call(document.querySelectorAll(".slide"));
  var N = slides.length, i = 0;
  var stage = document.getElementById("stage");
  var bar = document.getElementById("bar");
  var count = document.getElementById("count");
  var root = document.documentElement;

  function layout() {
    var w = window.innerWidth, h = window.innerHeight;
    var mobile = w < 860;
    root.classList.toggle("m", mobile);
    if (!mobile) {
      var s = Math.min(w / 1920, h / 1080);
      stage.style.transform = "scale(" + s + ")";
    }
  }
  function go(n, noHash) {
    n = Math.max(0, Math.min(N - 1, n));
    slides[i].classList.remove("active");
    i = n;
    slides[i].classList.add("active");
    var scroller = slides[i].querySelector(".pad, .copy");
    if (slides[i].scrollTop) slides[i].scrollTop = 0;
    bar.style.width = ((i + 1) / N * 100) + "%";
    count.textContent = (i + 1) + " / " + N;
    if (!noHash && history.replaceState) history.replaceState(null, "", "#" + (i + 1));
  }
  function next() { go(i + 1); }
  function prev() { go(i - 1); }
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key;
    if (k === "ArrowRight" || k === "PageDown" || k === " " || k === "Enter") { e.preventDefault(); next(); }
    else if (k === "ArrowLeft" || k === "PageUp" || k === "Backspace") { e.preventDefault(); prev(); }
    else if (k === "Home") go(0);
    else if (k === "End") go(N - 1);
    else if (k === "f" || k === "F") toggleFs();
  });
  document.getElementById("next").onclick = function (e) { e.stopPropagation(); next(); };
  document.getElementById("prev").onclick = function (e) { e.stopPropagation(); prev(); };
  function toggleFs() {
    var d = document;
    if (!d.fullscreenElement) (root.requestFullscreen || function () {}).call(root);
    else (d.exitFullscreen || function () {}).call(d);
  }
  document.getElementById("fs").onclick = function (e) { e.stopPropagation(); toggleFs(); };
  var x0 = null;
  document.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
  }, { passive: true });
  document.getElementById("viewport").addEventListener("click", function (e) {
    if (e.target.closest("a,button,pre,input,textarea")) return;
    var x = e.clientX, w = window.innerWidth;
    if (x > w * 0.72) next();
    else if (x < w * 0.28) prev();
  });
  document.querySelectorAll(".copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var el = document.getElementById(btn.getAttribute("data-for"));
      var text = el ? el.innerText : "";
      var done = function () {
        var old = btn.textContent;
        btn.textContent = "已複製";
        setTimeout(function () { btn.textContent = old; }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () { fallback(); });
      } else fallback();
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (err) { btn.textContent = "請手動選取"; }
        ta.remove();
      }
    });
  });
  function tick() {
    var el = document.getElementById("clock");
    if (!el) return;
    var now = new Date();
    var fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Taipei", hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
    });
    var p = {};
    fmt.formatToParts(now).forEach(function (x) { p[x.type] = x.value; });
    var ymd = p.year + "-" + p.month + "-" + p.day;
    var mins = (+p.hour) * 60 + (+p.minute);
    if (ymd !== "2026-11-24") {
      el.textContent = "2026/11/24（二）18:00–20:00";
      return;
    }
    if (mins < 18 * 60) {
      var left = 18 * 60 - mins;
      el.textContent = "距離 18:00 還有 " + Math.floor(left / 60) + " 小時 " + (left % 60) + " 分";
    } else if (mins < 20 * 60) {
      el.textContent = "進行中 · 距離 20:00 還有 " + (20 * 60 - mins) + " 分";
    } else el.textContent = "今天這個時段已過 20:00";
  }
  window.addEventListener("resize", layout);
  window.addEventListener("hashchange", function () {
    var n = parseInt(location.hash.slice(1), 10);
    if (n) go(n - 1, true);
  });
  layout();
  tick();
  setInterval(tick, 30000);
  var h = parseInt(location.hash.slice(1), 10);
  go(h ? h - 1 : 0, true);
})();
