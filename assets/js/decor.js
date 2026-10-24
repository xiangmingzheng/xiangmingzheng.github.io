/* ==========================================================================
   郑翔鸣 · 个人主页 两侧留白装饰层（生产版，无预览开关面板）
   构建三套装饰：① 章节导航轨 ② 语义水印 ③ 视差光晕
   --------------------------------------------------------------------------
   改章节名 → 改下面 sectionList 的 label
   改水印符号 → 改下面 wmList 的 text（side 控制左右、size 控制大小、mono 用等宽字体）
   ========================================================================== */
(function () {
  'use strict';

  /* ===== ① 章节导航轨 ===== */
  var rail = document.createElement('nav');
  rail.className = 'decor-rail';
  rail.setAttribute('aria-label', '章节导航');

  // 【可调】章节顺序与显示名（id 必须和 HTML 里的 section id 完全一致）
  var sectionList = [
    { id: 'hero', label: '首页' },
    { id: 'about', label: '关于我' },
    { id: 'strengths', label: '竞争力' },
    { id: 'works', label: '作品' },
    { id: 'journey', label: '学习轨迹' },
    { id: 'travel', label: '在路上' },
    { id: 'contact', label: '联系' }
  ];

  sectionList.forEach(function (s) {
    if (!document.getElementById(s.id)) return;
    var a = document.createElement('a');
    a.className = 'decor-rail__item';
    a.href = '#' + s.id;
    a.dataset.section = s.id;

    var dot = document.createElement('span');
    dot.className = 'decor-rail__dot';

    var label = document.createElement('span');
    label.className = 'decor-rail__label';
    label.textContent = s.label;

    a.appendChild(dot);
    a.appendChild(label);
    rail.appendChild(a);
  });

  document.body.appendChild(rail);

  // 滚动高亮当前章节
  var railItems = Array.prototype.slice.call(rail.querySelectorAll('.decor-rail__item'));
  var railSections = railItems
    .map(function (item) { return document.getElementById(item.dataset.section); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && railSections.length) {
    var railObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        railItems.forEach(function (item) {
          item.classList.toggle('is-active', item.dataset.section === entry.target.id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    railSections.forEach(function (sec) { railObserver.observe(sec); });
  }

  /* ===== ② 语义水印 ===== */
  // 【可调】每个区块的水印符号：text=符号，side=左右，size=sm/md/lg，mono=等宽字体
  var wmList = [
    { id: 'about', text: '♪', size: 'decor-wm--lg', side: 'decor-wm--left' },
    { id: 'strengths', text: "4'40″", size: 'decor-wm--sm', side: 'decor-wm--right' },
    { id: 'works', text: '</>', size: 'decor-wm--md', side: 'decor-wm--left', mono: true },
    { id: 'journey', text: '↗', size: 'decor-wm--lg', side: 'decor-wm--right' },
    { id: 'travel', text: '✈', size: 'decor-wm--md', side: 'decor-wm--left' },
    { id: 'contact', text: '@', size: 'decor-wm--lg', side: 'decor-wm--right', mono: true }
  ];

  wmList.forEach(function (w) {
    var sec = document.getElementById(w.id);
    if (!sec) return;
    var el = document.createElement('span');
    el.className = 'decor-wm ' + w.size + ' ' + w.side + (w.mono ? ' decor-wm--mono' : '');
    el.textContent = w.text;
    el.setAttribute('aria-hidden', 'true');
    sec.appendChild(el);
  });

  /* ===== ③ 视差光晕 ===== */
  var glow = document.createElement('div');
  glow.className = 'decor-glow';
  glow.setAttribute('aria-hidden', 'true');
  [1, 2, 3].forEach(function (n) {
    var blob = document.createElement('div');
    blob.className = 'decor-glow__blob decor-glow__blob--' + n;
    glow.appendChild(blob);
  });
  document.body.appendChild(glow);

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    var ticking = false;
    function updateParallax() {
      // 0.1 = 漂移系数，越大光晕漂得越明显
      glow.style.transform = 'translate3d(0, ' + (window.scrollY * 0.1) + 'px, 0)';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
    updateParallax();
  }
})();
