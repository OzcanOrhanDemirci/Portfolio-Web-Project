/*
 * script.js — interactive behaviour for the portfolio.
 *
 * Loaded with `defer`, so it executes once the document has been parsed. The
 * whole file lives in a single IIFE under strict mode to keep the global
 * scope clean; nothing is exported and no inline handlers are required.
 *
 * The *initial* language / colour theme / light-dark mode are applied by a
 * tiny inline script in <head> (anti-FOUC, runs before first paint). This
 * file only wires up the controls that change them afterwards, along with the
 * hero carousel and the two modals.
 *
 * Contents:
 *   1. Language switch (TR / EN)
 *   2. Colour theme (palette) + dark/light mode
 *   3. Experience cards — expandable details
 *   4. About — key summary <-> full text
 *   5. Mobile navigation (hamburger)
 *   6. Hero carousel (roles / affiliations)
 *   7. Image modal (certificate lightbox)
 *   8. Contact (email) modal
 *   9. Global modal dismissal (backdrop click / Escape)
 */
(function () {
    'use strict';

    /* ----- 1. Language switch (TR / EN) ----- */
    // Mirrors the title map in the <head> anti-FOUC script; kept here too so
    // this file remains self-contained.
    var TITLES = {
        tr: 'Özcan Orhan Demirci — Yapay Zeka Eğitmeni & Flutter Geliştirici',
        en: 'Özcan Orhan Demirci — AI Instructor & Flutter Developer'
    };

    var langButtons = document.querySelectorAll('.lang-opt');

    function syncLangUI(lang) {
        document.title = TITLES[lang] || document.title;
        langButtons.forEach(function (btn) {
            var active = btn.getAttribute('data-set-lang') === lang;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    }

    function setLanguage(lang) {
        var root = document.documentElement;
        root.classList.remove('lang-tr', 'lang-en');
        root.classList.add('lang-' + lang);
        root.setAttribute('lang', lang);
        try { localStorage.setItem('site-lang', lang); } catch (e) {}
        syncLangUI(lang);
    }

    langButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            setLanguage(this.getAttribute('data-set-lang'));
        });
    });

    // Sync the toggle highlight + title to the language the head script chose.
    syncLangUI(document.documentElement.classList.contains('lang-en') ? 'en' : 'tr');

    /* ----- 2. Colour theme (palette) + dark/light mode ----- */
    var root = document.documentElement;
    var THEME_COLORS = {
        neutral: { light: '#ffffff', dark: '#14181b' },
        warm: { light: '#f7f1e7', dark: '#1c1917' },
        cool: { light: '#e9f0f4', dark: '#0e1417' }
    };
    var swatches = document.querySelectorAll('.swatch');
    var modeToggle = document.getElementById('modeToggle');
    var metaThemeColor = document.querySelector('meta[name="theme-color"]');

    // Reflect the current theme/mode onto the controls (pressed state) and the
    // browser UI colour (the address-bar tint via <meta name="theme-color">).
    function syncAppearanceUI() {
        var theme = root.getAttribute('data-theme') || 'neutral';
        var mode = root.getAttribute('data-mode') || 'dark';
        swatches.forEach(function (b) {
            b.setAttribute('aria-pressed', b.getAttribute('data-set-theme') === theme ? 'true' : 'false');
        });
        if (modeToggle) {
            modeToggle.setAttribute('aria-pressed', mode === 'dark' ? 'true' : 'false');
        }
        if (metaThemeColor && THEME_COLORS[theme]) {
            metaThemeColor.setAttribute('content', THEME_COLORS[theme][mode]);
        }
    }

    function setTheme(theme) {
        root.setAttribute('data-theme', theme);
        try { localStorage.setItem('site-theme', theme); } catch (e) {}
        syncAppearanceUI();
    }

    function setMode(mode) {
        root.setAttribute('data-mode', mode);
        try { localStorage.setItem('site-mode', mode); } catch (e) {}
        syncAppearanceUI();
    }

    swatches.forEach(function (b) {
        b.addEventListener('click', function () {
            setTheme(this.getAttribute('data-set-theme'));
        });
    });

    if (modeToggle) {
        modeToggle.addEventListener('click', function () {
            setMode(root.getAttribute('data-mode') === 'dark' ? 'light' : 'dark');
        });
    }

    syncAppearanceUI();

    /* ----- 3. Experience: expandable details ----- */
    // Each card (or sub-role within a card) animates its own ".exp-details"
    // block open/closed via a grid-template-rows transition driven by ".open".
    document.querySelectorAll('.exp-toggle').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var scope = this.closest('.exp-role') || this.closest('.exp-card');
            var details = scope ? scope.querySelector('.exp-details') : null;
            if (!details) return;
            var open = details.classList.toggle('open');
            this.classList.toggle('open', open);
            this.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    });

    /* ----- 4. About: key summary <-> full text ----- */
    var aboutToggle = document.getElementById('aboutToggle');
    if (aboutToggle) {
        aboutToggle.addEventListener('click', function () {
            var box = document.querySelector('.about-text');
            if (!box) return;
            var open = box.classList.toggle('expanded');
            this.classList.toggle('open', open);
            this.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    /* ----- 5. Mobile navigation (hamburger) ----- */
    (function () {
        var nav = document.querySelector('header nav');
        var toggle = document.getElementById('navToggle');
        var menu = document.getElementById('navMenu');
        if (!nav || !toggle || !menu) return;

        function setOpen(open) {
            nav.classList.toggle('nav-open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        }

        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            setOpen(toggle.getAttribute('aria-expanded') !== 'true');
        });

        // Tapping any in-page link (incl. the logo) closes the menu so the
        // sticky header collapses before the anchor scroll settles.
        Array.prototype.forEach.call(nav.querySelectorAll('a[href^="#"]'), function (a) {
            a.addEventListener('click', function () { setOpen(false); });
        });

        // Close on outside click / Escape.
        document.addEventListener('click', function (e) {
            if (nav.classList.contains('nav-open') && !nav.contains(e.target)) setOpen(false);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
                setOpen(false);
                toggle.focus();
            }
        });

        // Reset state when the viewport grows back to the desktop nav.
        var mq = window.matchMedia('(min-width: 861px)');
        var onChange = function () { if (mq.matches) setOpen(false); };
        if (mq.addEventListener) mq.addEventListener('change', onChange);
        else if (mq.addListener) mq.addListener(onChange);
    })();

    /* ----- 6. Hero carousel (roles / affiliations) ----- */
    (function () {
        var carousel = document.querySelector('.hero-carousel');
        if (!carousel) return;
        var track = carousel.querySelector('.carousel-track');
        var dotsWrap = carousel.querySelector('.carousel-dots');
        var prevBtn = carousel.querySelector('.carousel-prev');
        var nextBtn = carousel.querySelector('.carousel-next');
        var slides = Array.prototype.slice.call(track.children);
        var n = slides.length;
        if (n < 2) return;

        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var DURATION = reduce ? 0 : 500;
        var EASE = 'cubic-bezier(0.25, 0.8, 0.25, 1)';

        // Clone first + last slides for a seamless infinite loop.
        var firstClone = slides[0].cloneNode(true);
        var lastClone = slides[n - 1].cloneNode(true);
        [firstClone, lastClone].forEach(function (c) {
            c.setAttribute('aria-hidden', 'true');
            Array.prototype.forEach.call(c.querySelectorAll('a, button'), function (el) {
                el.setAttribute('tabindex', '-1');
            });
        });
        track.appendChild(firstClone);
        track.insertBefore(lastClone, slides[0]);

        var pos = 1;          // real slide 0 lives at track position 1
        var animating = false;

        function setX(animate) {
            track.style.transition = animate ? ('transform ' + DURATION + 'ms ' + EASE) : 'none';
            track.style.transform = 'translateX(' + (-pos * 100) + '%)';
        }

        function realIndex() {
            if (pos === 0) return n - 1;
            if (pos === n + 1) return 0;
            return pos - 1;
        }

        function updateDots() {
            var ri = realIndex();
            Array.prototype.forEach.call(dotsWrap.children, function (d, i) {
                d.classList.toggle('active', i === ri);
                d.setAttribute('aria-current', i === ri ? 'true' : 'false');
            });
        }

        function afterMove() {
            if (pos === 0) { pos = n; setX(false); }
            else if (pos === n + 1) { pos = 1; setX(false); }
            animating = false;
            updateDots();
        }

        function go(delta) {
            if (animating) return;
            animating = true;
            pos += delta;
            setX(true);
            updateDots();
            window.setTimeout(afterMove, DURATION + 30);
        }

        function goTo(ri) {
            if (animating || ri === realIndex()) return;
            animating = true;
            pos = ri + 1;
            setX(true);
            updateDots();
            window.setTimeout(afterMove, DURATION + 30);
        }

        for (var i = 0; i < n; i++) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'Slayt / Slide ' + (i + 1));
            (function (idx) {
                dot.addEventListener('click', function () { goTo(idx); });
            })(i);
            dotsWrap.appendChild(dot);
        }

        if (prevBtn) prevBtn.addEventListener('click', function () { go(-1); });
        if (nextBtn) nextBtn.addEventListener('click', function () { go(1); });

        carousel.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') { go(-1); }
            else if (e.key === 'ArrowRight') { go(1); }
        });

        var startX = null;
        carousel.addEventListener('pointerdown', function (e) { startX = e.clientX; });
        carousel.addEventListener('pointerup', function (e) {
            if (startX === null) return;
            var dx = e.clientX - startX;
            startX = null;
            if (Math.abs(dx) > 40) { go(dx < 0 ? 1 : -1); }
        });
        carousel.addEventListener('pointercancel', function () { startX = null; });

        var timer = null;
        function startAuto() {
            if (reduce) return;
            stopAuto();
            timer = window.setInterval(function () { go(1); }, 5000);
        }
        function stopAuto() {
            if (timer) { window.clearInterval(timer); timer = null; }
        }
        carousel.addEventListener('mouseenter', stopAuto);
        carousel.addEventListener('mouseleave', startAuto);
        carousel.addEventListener('focusin', stopAuto);
        carousel.addEventListener('focusout', startAuto);

        setX(false);
        updateDots();
        startAuto();
    })();

    /* ----- 7. Image modal (certificate lightbox) ----- */
    var imgModal = document.getElementById('imageModal');
    var modalImg = document.getElementById('modalImg');
    var imgModalClose = document.getElementsByClassName('close')[0];
    var clickableImages = document.querySelectorAll('.clickable-img');

    clickableImages.forEach(function (img) {
        img.addEventListener('click', function () {
            imgModal.style.display = 'block';
            modalImg.src = this.src;
        });
    });

    if (imgModalClose) {
        imgModalClose.addEventListener('click', function () {
            imgModal.style.display = 'none';
        });
    }

    /* ----- 8. Contact (email) modal ----- */
    var emailModal = document.getElementById('emailModal');
    var emailTrigger = document.querySelector('.email-trigger');
    var emailModalClose = document.querySelector('.close-text-modal');

    function openEmailModal() { if (emailModal) emailModal.style.display = 'block'; }
    function closeEmailModal() { if (emailModal) emailModal.style.display = 'none'; }

    if (emailTrigger) emailTrigger.addEventListener('click', openEmailModal);
    if (emailModalClose) emailModalClose.addEventListener('click', closeEmailModal);

    /* ----- 9. Close either modal on backdrop click / Escape ----- */
    window.addEventListener('click', function (event) {
        if (event.target === imgModal) imgModal.style.display = 'none';
        if (event.target === emailModal) emailModal.style.display = 'none';
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            if (imgModal) imgModal.style.display = 'none';
            if (emailModal) emailModal.style.display = 'none';
        }
    });
})();
