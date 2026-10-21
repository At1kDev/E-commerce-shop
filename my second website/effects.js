/* ===================== EFFECTS — animatsiyalar =====================
   Hamma narsa GPU uchun yengil (transform / opacity) qilingan, telefonda ham silliq ishlaydi.
   Sichqoncha effektlari faqat kompyuterda yoqiladi. */
(function () {
    'use strict';

    document.documentElement.classList.add('js');

    const FX = (window.FX = {});
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

    FX.reduced = reduced;
    FX.lastSource = null;

    /* ---------- 1. scroll chizig'i + parallax (bitta rAF) ---------- */
    const bar = document.createElement('div');
    bar.className = 'fx-progress';
    document.body.appendChild(bar);

    let heroContent = null;
    let heroEl = null;
    let ticking = false;

    function update() {
        ticking = false;
        const max = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = 'scaleX(' + (max > 0 ? clamp(scrollY / max, 0, 1) : 0) + ')';

        if (heroContent && heroEl && !reduced) {
            const h = heroEl.offsetHeight || 1;
            if (scrollY < h * 1.1) {
                heroContent.style.transform = 'translate3d(0,' + (scrollY * 0.18).toFixed(1) + 'px,0)';
                heroContent.style.opacity = String(clamp(1 - scrollY / (h * 0.85), 0, 1));
            }
        }
    }
    function onScroll() {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);

    /* ---------- 2. kompyuterda silliq g'ildirak scrolli ---------- */
    if (fine && !reduced) {
        let target = scrollY, cur = scrollY, raf = 0;
        const loop = function () {
            cur += (target - cur) * 0.12;
            if (Math.abs(target - cur) < 0.4) { cur = target; raf = 0; }
            window.scrollTo({ top: cur, behavior: 'instant' });
            if (raf) raf = requestAnimationFrame(loop);
        };
        addEventListener('wheel', function (e) {
            if (e.ctrlKey || e.defaultPrevented) return;
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
            if (e.target.closest && e.target.closest('.modal-box,select,input,textarea')) return;
            const max = document.documentElement.scrollHeight - innerHeight;
            if (!raf) { target = cur = scrollY; }
            e.preventDefault();
            target = clamp(target + e.deltaY * (e.deltaMode === 1 ? 32 : 1), 0, max);
            if (!raf) raf = requestAnimationFrame(loop);
        }, { passive: false });
        addEventListener('scroll', function () { if (!raf) { target = cur = scrollY; } }, { passive: true });
    }

    /* ---------- 3. kartalar: 3D burilish (faqat kompyuterda) ---------- */
    if (fine && !reduced) {
        const TILT = '.cards,.Card,.CateCard,#imagee';
        let tEl = null, tRaf = 0, px = 0, py = 0;

        const resetTilt = function (el) {
            if (!el) return;
            el.style.transform = '';
            el.classList.remove('is-tilt');
        };
        const applyTilt = function () {
            tRaf = 0;
            if (!tEl) return;
            const r = tEl.getBoundingClientRect();
            const x = clamp((px - r.left) / r.width, 0, 1);
            const y = clamp((py - r.top) / r.height, 0, 1);
            tEl.style.transform = 'perspective(900px) rotateX(' + ((0.5 - y) * 10).toFixed(2) + 'deg) rotateY(' +
                ((x - 0.5) * 12).toFixed(2) + 'deg) translateY(-6px) scale(1.02)';
            tEl.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
            tEl.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
            tEl.classList.add('is-tilt');
        };
        document.addEventListener('pointermove', function (e) {
            const el = e.target.closest ? e.target.closest(TILT) : null;
            if (el !== tEl) { resetTilt(tEl); tEl = el; }
            if (!el) return;
            px = e.clientX; py = e.clientY;
            if (!tRaf) tRaf = requestAnimationFrame(applyTilt);
        }, { passive: true });
        document.addEventListener('pointerleave', function () { resetTilt(tEl); tEl = null; }, true);
    }

    /* ---------- 4. magnit tugmalar (faqat kompyuterda) ---------- */
    if (fine && !reduced) {
        const MAG = '#Verify-btn,.Buy,.AddCard,.ComeBack,#like,.helpCenter,.Location,.modal-confirm';
        let mEl = null;
        document.addEventListener('pointermove', function (e) {
            const el = e.target.closest ? e.target.closest(MAG) : null;
            if (el !== mEl) { if (mEl) mEl.style.translate = ''; mEl = el; }
            if (!el) return;
            const r = el.getBoundingClientRect();
            const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
            const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
            el.style.translate = (dx * 10).toFixed(1) + 'px ' + (dy * 10).toFixed(1) + 'px';
        }, { passive: true });
    }

    /* ---------- 5. ripple + "savatga uchish" manbasi ---------- */
    const RIP = '#Verify-btn,.Buy,.qty-btn,.remove-btn,.AddCard,.modal-confirm,.modal-cancel,.CateNavElements,.ComeBack';
    document.addEventListener('pointerdown', function (e) {
        const el = e.target.closest ? e.target.closest(RIP) : null;
        if (!el || reduced) return;
        const r = el.getBoundingClientRect();
        const d = Math.max(r.width, r.height) * 2;
        const s = document.createElement('span');
        s.className = 'fx-ripple';
        s.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px';
        el.appendChild(s);
        setTimeout(function () { s.remove(); }, 700);
    }, true);

    document.addEventListener('click', function (e) {
        const t = e.target.closest ? e.target.closest('.Buy,.AddCard') : null;
        if (!t) return;
        const card = t.closest('.CateCard');
        FX.lastSource = (card && card.querySelector('img')) || document.getElementById('imagee') || null;
    }, true);

    /* ---------- 6. rasmlar yuklanganda yumshoq paydo bo'ladi ---------- */
    document.addEventListener('load', function (e) {
        if (e.target && e.target.tagName === 'IMG') e.target.classList.add('loaded');
    }, true);

    /* ---------- 7. scroll bilan paydo bo'lish (reveal) ---------- */
    const SEL = '.grandCard,.grandCategory,.basket-section,.contact,.cards,.Card,.CateCard';
    const PANEL = '.grandCard,.grandCategory,.basket-section,.contact';

    const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            const el = en.target;
            io.unobserve(el);
            el.classList.add('in');
            const done = function (ev) {
                if (ev.target !== el || ev.propertyName !== 'opacity') return;
                el.removeEventListener('transitionend', done);
                el.classList.remove('reveal', 'in');
                el.style.removeProperty('--i');
            };
            el.addEventListener('transitionend', done);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });

    function markOne(el) {
        if (el.dataset.fx) return;
        el.dataset.fx = '1';
        el.classList.add('reveal');
        const idx = el.matches(PANEL) || !el.parentElement ? 0 : Array.prototype.indexOf.call(el.parentElement.children, el);
        el.style.setProperty('--i', Math.min(idx, 8));
        io.observe(el);
    }
    function markAll(root) {
        if (reduced) return;
        if (root.matches && root.matches(SEL)) markOne(root);
        if (root.querySelectorAll) root.querySelectorAll(SEL).forEach(markOne);
    }
    new MutationObserver(function (muts) {
        muts.forEach(function (m) {
            m.addedNodes.forEach(function (n) { if (n.nodeType === 1) markAll(n); });
        });
    }).observe(document.body, { childList: true, subtree: true });

    /* ---------- 8. so'zlarni ajratib, ko'tarib chiqarish ---------- */
    FX.splitWords = function (el) {
        if (!el || el.dataset.split || reduced) return;
        const text = el.textContent.trim();
        if (!text) return;
        el.dataset.split = '1';
        el.setAttribute('aria-label', text);
        el.textContent = '';
        text.split(/\s+/).forEach(function (w, i) {
            const line = document.createElement('span');
            line.className = 'fx-line';
            line.setAttribute('aria-hidden', 'true');
            const word = document.createElement('span');
            word.className = 'fx-word';
            word.style.setProperty('--w', i);
            word.textContent = w;
            line.appendChild(word);
            el.appendChild(line);
            el.appendChild(document.createTextNode(' '));
        });
    };

    /* ---------- 9. har bir sahifa uchun sozlash ---------- */
    let navIO = null;
    let pauseIO = null;

    FX.initPage = function () {
        markAll(document.body);
        document.querySelectorAll('img').forEach(function (img) { if (img.complete) img.classList.add('loaded'); });

        // --- Hero ---
        heroEl = document.querySelector('.navbarMainPage');
        heroContent = heroEl ? heroEl.querySelector('.grandPart') : null;
        if (heroContent) { heroContent.style.transform = ''; heroContent.style.opacity = ''; }

        if (heroEl) {
            FX.splitWords(heroEl.querySelector('.mainWords'));

            if (!heroEl.querySelector('.fx-scroll') && !reduced) {
                const cue = document.createElement('div');
                cue.className = 'fx-scroll';
                cue.setAttribute('aria-hidden', 'true');
                heroEl.appendChild(cue);
            }

            if (fine && !reduced && !heroEl.querySelector('.fx-spot')) {
                const spot = document.createElement('div');
                spot.className = 'fx-spot';
                heroEl.appendChild(spot);
                heroEl.addEventListener('pointermove', function (e) {
                    const r = heroEl.getBoundingClientRect();
                    spot.style.opacity = '1';
                    spot.style.transform = 'translate3d(' + (e.clientX - r.left - 300) + 'px,' + (e.clientY - r.top - 300) + 'px,0)';
                });
                heroEl.addEventListener('pointerleave', function () { spot.style.opacity = '0'; });
            }

            if (!document.querySelector('.fx-marquee')) {
                const words = ['iPhone', 'MacBook', 'AirPods', 'Apple Watch', 'iPad', 'HomePod', 'Accessories'];
                const sec = document.createElement('section');
                sec.className = 'fx-marquee';
                sec.setAttribute('aria-hidden', 'true');
                const track = document.createElement('div');
                track.className = 'fx-track';
                for (let copy = 0; copy < 4; copy++) {
                    words.forEach(function (w) {
                        const s = document.createElement('span');
                        s.textContent = w;
                        track.appendChild(s);
                        track.appendChild(document.createElement('i'));
                    });
                }
                sec.appendChild(track);
                heroEl.insertAdjacentElement('afterend', sec);
            }
        }

        // --- Navbar: indikator va faol havola ---
        const nav = document.querySelector('.Navbar');
        if (navIO) { navIO.disconnect(); navIO = null; }
        if (nav) {
            const links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
            let ind = nav.querySelector('.fx-ind');
            if (!ind) { ind = document.createElement('span'); ind.className = 'fx-ind'; nav.appendChild(ind); }
            const move = function (a) {
                links.forEach(function (l) { l.classList.toggle('on', l === a); });
                ind.style.width = a.offsetWidth + 'px';
                ind.style.transform = 'translateX(' + a.offsetLeft + 'px)';
            };
            if (links.length) {
                move(links[0]);
                navIO = new IntersectionObserver(function (entries) {
                    entries.forEach(function (en) {
                        if (!en.isIntersecting) return;
                        const a = links.filter(function (l) { return l.getAttribute('href') === '#' + en.target.id; })[0];
                        if (a) move(a);
                    });
                }, { rootMargin: '-45% 0px -50% 0px' });
                links.forEach(function (l) {
                    const t = document.getElementById(l.getAttribute('href').slice(1));
                    if (t) navIO.observe(t);
                });
            }
        }

        // --- ko'rinmaydigan animatsiyalarni to'xtatish (batareya uchun) ---
        if (pauseIO) { pauseIO.disconnect(); pauseIO = null; }
        const pausable = [heroEl, document.querySelector('.fx-marquee')].filter(Boolean);
        if (pausable.length) {
            pauseIO = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) { en.target.classList.toggle('fx-paused', !en.isIntersecting); });
            });
            pausable.forEach(function (el) { pauseIO.observe(el); });
        }

        update();
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', FX.initPage);
    else FX.initPage();
})();
