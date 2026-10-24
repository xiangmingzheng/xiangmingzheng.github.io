/* ==========================================================================
   装饰预览脚本（仅 index-decor.html 使用）
   构建三套装饰层：① 章节导航轨 ② 语义水印 ③ 视差光晕 + 控制面板
   ========================================================================== */
(function () {
  'use strict';

  /* ===== ① 章节导航轨 ===== */
  var rail = document.createElement('nav');
  rail.className = 'decor-rail';
  rail.setAttribute('aria-label', '章节导航（装饰预览）');

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

  /* 滚动高亮当前章节 */
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

  /* ===== 控制面板（A/B 逐层开关） ===== */
  var panel = document.createElement('div');
  panel.className = 'decor-panel';
  panel.setAttribute('role', 'group');
  panel.setAttribute('aria-label', '装饰预览开关');

  var head = document.createElement('div');
  head.className = 'decor-panel__head';
  head.textContent = '装饰预览 · 可开关';
  panel.appendChild(head);

  [
    { key: 'rail', label: '① 章节导航轨' },
    { key: 'wm', label: '② 语义水印' },
    { key: 'glow', label: '③ 视差光晕' }
  ].forEach(function (opt) {
    var row = document.createElement('label');
    row.className = 'decor-panel__row';

    var input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = true;
    input.dataset.decor = opt.key;

    var span = document.createElement('span');
    span.textContent = opt.label;

    input.addEventListener('change', function () {
      document.documentElement.classList.toggle('decor-' + opt.key + '-off', !input.checked);
    });

    row.appendChild(input);
    row.appendChild(span);
    panel.appendChild(row);
  });

  document.body.appendChild(panel);
})();
