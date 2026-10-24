/* ==========================================================================
   郑翔鸣 · 个人名片站 交互脚本（原生 JS，无框架、无依赖）
   P1 交互：滚动高亮 / 汉堡菜单 / 回到顶部 / 复制邮箱 / 证书 lightbox
   全部 P0 功能不依赖本文件；脚本加载失败不影响浏览与锚点跳转。
   ========================================================================== */
(function () {
  'use strict';

  // 移除 no-js 标记：JS 可用，启用 reveal 动画
  document.documentElement.classList.remove('no-js');

  /* ======================================================================
     0. Hero 名字逐字拆分 + 滚动进场 reveal
     ====================================================================== */
  var heroName = document.querySelector('.hero-name');

  if (heroName) {
    // 把「郑翔鸣」拆成逐字 span，配合 CSS char-rise 动画；每字间隔 0.6s，一个字一个字慢慢来
    var text = heroName.textContent;
    heroName.textContent = '';
    Array.prototype.forEach.call(text, function (ch) {
      var span = document.createElement('span');
      span.className = 'hero-char';
      span.textContent = ch;
      span.style.animationDelay = (0.6 * heroName.childElementCount) + 's';
      heroName.appendChild(span);
    });
  }

  // Hero 定位语「永远愿意去尝试」逐字从右向左滑入
  var heroTagline = document.querySelector('.hero-tagline');

  if (heroTagline) {
    var tagText = heroTagline.textContent;
    heroTagline.textContent = '';
    Array.prototype.forEach.call(tagText, function (ch) {
      var span = document.createElement('span');
      span.className = 'tagline-char';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      // 从最左边开始，一个字一个字向右依次滑入；每字间隔 0.25s，慢速从容
      span.style.animationDelay = (0.25 * heroTagline.childElementCount) + 's';
      heroTagline.appendChild(span);
    });
  }

  // 让定位语在名字全部出现完后再开始：读取名字最后一个字的完成时间，动态调整
  (function delayTaglineAfterName() {
    if (!heroTagline || !heroName) return;
    var nameChars = heroName.querySelectorAll('.hero-char');
    if (!nameChars.length) return;
    var lastChar = nameChars[nameChars.length - 1];
    // 最后一个字的 delay（0.6 * (n-1)）+ 单字时长 1.2s
    var lastDelay = parseFloat(lastChar.style.animationDelay) || 0;
    var nameEnd = (lastDelay + 1.2) * 1000; // 转毫秒
    // 给每个 tagline 字追加 nameEnd 作为起始偏移
    Array.prototype.forEach.call(heroTagline.querySelectorAll('.tagline-char'), function (ch) {
      var baseDelay = parseFloat(ch.style.animationDelay) || 0;
      ch.style.animationDelay = (nameEnd / 1000 + baseDelay) + 's';
    });
  })();

  // 滚动进场：给 .reveal 元素在进入视口时加 .is-visible
  // 同时：若 .reveal 内部有「块级子元素」，让它们错峰依次浮现，滚动全程有节奏
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  function revealChildStagger(container) {
    var children = Array.prototype.slice.call(container.children);
    children.forEach(function (child, i) {
      if (child.classList.contains('reveal')) return; // 嵌套 reveal 交给自身处理
      child.classList.add('reveal-child');
      child.style.transitionDelay = (0.16 * i) + 's';
      requestAnimationFrame(function () {
        child.classList.add('is-visible');
      });
    });
  }

  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          obs.unobserve(entry.target);
          // 点亮容器自身
          entry.target.classList.add('is-visible');
          // 再让内部子块错峰浮现
          revealChildStagger(entry.target);
        });
      },
      // threshold 0.35 + 底部留白：元素滚到视口较明显位置才触发，滚动持续有浮现感
      { threshold: 0.35, rootMargin: '0px 0px -12% 0px' }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else if (revealEls.length) {
    // 降级：不支持 IO 时直接全部显示
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
      revealChildStagger(el);
    });
  }

  /* ======================================================================
     0c. 滚动方式：使用浏览器原生滚动（最跟手、零延迟）
     注：此前自写的惯性平滑滚动已移除，因用户反馈「太粘、需要正常滚动」
     ====================================================================== */

  /* ======================================================================
     1. 汉堡菜单（移动端 <640px）
     ====================================================================== */
  var navToggle = document.querySelector('.nav-toggle');
  var navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    function setMenu(open) {
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
      navMenu.classList.toggle('is-open', open);
    }

    navToggle.addEventListener('click', function () {
      var isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      setMenu(!isOpen);
    });

    // 点击任意导航项后收起
    navMenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        setMenu(false);
      }
    });

    // 点击菜单外部收起
    document.addEventListener('click', function (e) {
      if (
        navMenu.classList.contains('is-open') &&
        !navMenu.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        setMenu(false);
      }
    });

    // Esc 收起
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        setMenu(false);
        navToggle.focus();
      }
    });

    // 视口跨过移动端断点时复位菜单状态
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 640) {
        setMenu(false);
      }
    });
  }

  /* ======================================================================
     2. 滚动高亮当前 Section（IntersectionObserver）
     ====================================================================== */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav-link[href^="#"]')
  );
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute('href').slice(1);
      return document.getElementById(id);
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var currentId = entry.target.id;
            navLinks.forEach(function (link) {
              var id = link.getAttribute('href').slice(1);
              var isActive = id === currentId;
              link.classList.toggle('active', isActive);
              if (isActive) {
                link.setAttribute('aria-current', 'true');
              } else {
                link.removeAttribute('aria-current');
              }
            });
          }
        });
      },
      {
        // 顶部预留导航高度 + 缓冲，让「当前区块」判定更贴近阅读位置
        rootMargin: '-40% 0px -55% 0px',
        threshold: 0
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ======================================================================
     3. 回到顶部按钮（下滑超过一屏后出现）
     ====================================================================== */
  var backToTop = document.getElementById('back-to-top');

  if (backToTop) {
    var onScroll = function () {
      var shouldShow = window.scrollY > window.innerHeight;
      if (shouldShow) {
        backToTop.hidden = false;
      } else {
        backToTop.hidden = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ======================================================================
     4. 复制邮箱（clipboard API + 降级）
     ====================================================================== */
  var copyBtn = document.getElementById('copy-email');
  var copyToast = document.getElementById('copy-toast');
  var PRIMARY_EMAIL = '276124661@qq.com';

  function showToast(text, type) {
    if (!copyToast) return;
    copyToast.textContent = text;
    copyToast.className = 'copy-toast is-' + type;
    copyToast.hidden = false;
    window.clearTimeout(showToast._timer);
    showToast._timer = window.setTimeout(function () {
      copyToast.hidden = true;
    }, 2000);
  }

  function legacyCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    var ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (err) {
      ok = false;
    }
    document.body.removeChild(textarea);
    return ok;
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(PRIMARY_EMAIL)
          .then(function () {
            showToast('已复制', 'success');
          })
          .catch(function () {
            // 剪贴板写入失败 → 尝试降级，再失败提示手动选中
            if (legacyCopy(PRIMARY_EMAIL)) {
              showToast('已复制', 'success');
            } else {
              showToast('请手动选中邮箱复制', 'info');
            }
          });
      } else if (legacyCopy(PRIMARY_EMAIL)) {
        showToast('已复制', 'success');
      } else {
        showToast('请手动选中邮箱复制', 'info');
      }
    });
  }

  /* ======================================================================
     5. 证书 lightbox
     ====================================================================== */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxClose = document.getElementById('lightbox-close');
  var certThumbs = Array.prototype.slice.call(document.querySelectorAll('.cert-thumb'));
  var lastFocused = null;

  function openLightbox(src) {
    if (!lightbox || !lightboxImg) return;
    lastFocused = document.activeElement;
    lightboxImg.src = src;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    lightboxImg.src = '';
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  if (lightbox && certThumbs.length) {
    certThumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var src = thumb.getAttribute('data-src');
        if (src) openLightbox(src);
      });
    });

    // 点击遮罩关闭（遮罩带 data-lightbox-close）
    var backdrop = lightbox.querySelector('[data-lightbox-close]');
    if (backdrop) {
      backdrop.addEventListener('click', closeLightbox);
    }

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    // Esc 关闭
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) {
        closeLightbox();
      }
    });
  }

  /* ======================================================================
     6. 旅行照片轮播（自动播放 + 左右按钮 + 圆点 + 触摸滑动）
     ====================================================================== */
  var travelTrack = document.getElementById('travel-track');

  if (travelTrack && travelTrack.children.length > 1) {
    var slides = Array.prototype.slice.call(travelTrack.children);
    var dots = Array.prototype.slice.call(document.querySelectorAll('.carousel-dot'));
    var btnPrev = document.querySelector('.carousel-btn--prev');
    var btnNext = document.querySelector('.carousel-btn--next');
    var travelCurrent = 0;
    var travelTotal = slides.length;
    var travelTimer = null;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function travelGoTo(i) {
      travelCurrent = (i + travelTotal) % travelTotal;
      travelTrack.style.transform = 'translateX(-' + (travelCurrent * 100) + '%)';
      Array.prototype.forEach.call(slides, function (s, idx) {
        s.classList.toggle('is-active', idx === travelCurrent);
      });
      dots.forEach(function (d, idx) {
        d.classList.toggle('is-active', idx === travelCurrent);
      });
    }

    function travelNext() { travelGoTo(travelCurrent + 1); }
    function travelPrev() { travelGoTo(travelCurrent - 1); }

    function travelRestart() {
      if (travelTimer) clearInterval(travelTimer);
      if (!reduceMotion) {
        travelTimer = setInterval(travelNext, 5000);
      }
    }

    if (btnNext) {
      btnNext.addEventListener('click', function () { travelNext(); travelRestart(); });
    }

    if (btnPrev) {
      btnPrev.addEventListener('click', function () { travelPrev(); travelRestart(); });
    }

    dots.forEach(function (d, idx) {
      d.addEventListener('click', function () { travelGoTo(idx); travelRestart(); });
    });

    // 触摸滑动（手机上左右划切换）
    var touchStartX = null;
    travelTrack.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    travelTrack.addEventListener('touchend', function (e) {
      if (touchStartX === null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) {
        if (dx < 0) { travelNext(); } else { travelPrev(); }
        travelRestart();
      }
      touchStartX = null;
    }, { passive: true });

    travelRestart();
  }
})();
