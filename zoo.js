/* Les pièces Zoo TV communes aux huit layouts. Chaque layout ne garde que son héros à lui. */
(function (L) {
  var Z = window.ZOO = {};
  Z.RM = L.RM;
  /* Les photos où le chanteur est le plus net et le mieux éclairé */
  Z.SINGER = ['p00099', 'p00087', 'p00003', 'p00030', 'p00081', 'p00005', 'p00011', 'p00050', 'p00015', 'p00023', 'p00069', 'p00029', 'p00026', 'p00043', 'p00064', 'p00018', 'p00074', 'p00076'];
  Z.ALL = Object.keys(window.LOVEU2_PHOTOS || {});
  Z.next = L.next();
  var $ = function (id) { return document.getElementById(id); };

  /* Neige télé, générée une fois */
  (function () {
    var c = document.createElement('canvas'); c.width = c.height = 200; var x = c.getContext('2d'), d = x.createImageData(200, 200);
    for (var i = 0; i < d.data.length; i += 4) { var v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0); document.documentElement.style.setProperty('--noise', 'url(' + c.toDataURL() + ')');
  })();

  /* Une télé : changer de chaîne avec un éclair de neige */
  Z.zap = function (tv, src) {
    tv.classList.add('zap');
    setTimeout(function () { if (src) tv.querySelector('img').src = src; }, 110);
    setTimeout(function () { tv.classList.remove('zap'); }, 260);
  };

  /* Machine à écrire */
  Z.type = function (el, lines) {
    if (!el) return; var li = 0, ci = 0, del = false;
    if (Z.RM) { el.textContent = lines[0]; return; }
    (function step() {
      var s = lines[li];
      if (!del) { ci++; el.textContent = s.slice(0, ci); if (ci === s.length) { del = true; return setTimeout(step, 1400); } }
      else { ci--; el.textContent = s.slice(0, ci); if (ci === 0) { del = false; li = (li + 1) % lines.length; } }
      setTimeout(step, del ? 30 : 70);
    })();
  };

  /* Visionneuse des photos */
  var lb;
  Z.open = function (list, i) {
    if (!lb) {
      lb = document.createElement('div');
      lb.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.94);display:grid;place-items:center;opacity:0;transition:opacity .25s';
      lb.innerHTML = '<img alt="LOVEU2 live" style="max-width:92vw;max-height:80vh;border-radius:14px;box-shadow:0 0 0 6px #111,0 30px 80px #000"><div class="osd" style="position:absolute;top:18px;left:20px;font:30px VT323;color:#19c25a;text-shadow:0 0 8px #19c25a"></div>' +
        '<button class="pv" aria-label="Previous" style="position:absolute;left:16px;top:50%;font:40px VT323;background:#ffe600;border:0;border-radius:10px;padding:6px 14px;cursor:pointer">◀</button><button class="nx" aria-label="Next" style="position:absolute;right:16px;top:50%;font:40px VT323;background:#ffe600;border:0;border-radius:10px;padding:6px 14px;cursor:pointer">▶</button>' +
        '<button class="x" style="position:absolute;right:16px;top:16px;font:28px VT323;background:#ff2a2a;color:#fff;border:0;border-radius:10px;padding:6px 14px;cursor:pointer">OFF</button>';
      document.body.appendChild(lb);
      var img = lb.querySelector('img'), osd = lb.querySelector('.osd');
      lb.show = function (k) { lb.k = (k + lb.list.length) % lb.list.length; img.src = 'img/' + lb.list[lb.k] + '.jpg'; osd.textContent = 'CH ' + (lb.k + 1) + ' / ' + lb.list.length; };
      var close = function () { lb.style.opacity = 0; lb.style.pointerEvents = 'none'; lb.on = false; };
      lb.querySelector('.x').onclick = close; lb.onclick = function (e) { if (e.target === lb) close(); };
      lb.querySelector('.pv').onclick = function () { lb.show(lb.k - 1); }; lb.querySelector('.nx').onclick = function () { lb.show(lb.k + 1); };
      addEventListener('keydown', function (e) { if (!lb.on) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') lb.show(lb.k - 1); if (e.key === 'ArrowRight') lb.show(lb.k + 1); });
      var sx = 0; lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
      /* balayage : le doigt vers la gauche amène la photo suivante, comme sur iOS */
      lb.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) lb.show(lb.k + (dx < 0 ? 1 : -1)); });
    }
    lb.list = list; lb.show(i); lb.style.pointerEvents = 'auto'; lb.style.opacity = 1; lb.on = true;
  };

  /* Remplit les sections communes présentes dans la page */
  Z.fill = function () {
    var U = L.upcoming, n = Z.next;
    if ($('tickerI')) { var tk = U.map(function (s) { return '● ' + L.fmt(s.iso, 'short').toUpperCase() + ' ' + L.place(s.city).toUpperCase(); }).join('  '); $('tickerI').innerHTML = '<span>' + tk + '</span><span>' + tk + '</span>'; }
    if ($('aCity')) { $('aCity').textContent = L.place(n.city) + ' · ' + L.fmt(n.iso, 'short'); $('aVenue').textContent = n.venue + ' · 8 pm'; $('aBtn').href = n.url; }
    if ($('clock')) L.countdown(n, function (c) { $('clock').innerHTML = [[c.d, 'days'], [c.h, 'hrs'], [c.m, 'min'], [c.s, 'sec']].map(function (x) { return '<div><b>' + x[0] + '</b><small>' + x[1] + '</small></div>'; }).join(''); });
    if ($('flaps')) {
      var cells = function (t, c) { return '<span class="cells ' + (c || '') + '" data-t="' + t + '">' + t.split('').map(function (ch) { return '<i>' + (ch === ' ' ? '&nbsp;' : ch) + '</i>'; }).join('') + '</span>'; };
      $('flaps').innerHTML = U.map(function (s) { return '<div class="fl">' + cells(L.fmt(s.iso, 'short').toUpperCase()) + '<div>' + cells(L.place(s.city).toUpperCase(), 'c') + '</div><div class="v">' + s.venue + '<br>' + s.city + ' · 8 pm · ' + s.iso.slice(0, 4) + '</div><a class="pill" href="' + s.url + '" target="_blank" rel="noopener">Tickets ▶</a></div>'; }).join('');
    }
    if ($('arch')) { $('archT').textContent = 'ARCHIVE · ' + L.past.length + ' PAST SHOWS'; $('arch').innerHTML = L.past.map(function (s) { return '<div><b>' + L.place(s.city).toUpperCase() + '</b>' + L.fmt(s.iso) + '<br>' + s.venue + '</div>'; }).join(''); }
    if ($('tvwall')) {
      var list = Z.ALL;
      $('tvwall').innerHTML = list.map(function (id, i) { return '<div class="tv" data-i="' + i + '"><img src="img/s/' + id + '.jpg" alt="LOVEU2 live" loading="lazy"><div class="st"></div><div class="ch">CH ' + (i + 1) + '</div></div>'; }).join('');
      $('tvwall').addEventListener('click', function (e) { var t = e.target.closest('.tv'); if (t) Z.open(list, +t.dataset.i); });
    }
    if ($('vid')) { $('vthumb').src = L.thumb; L.videoFacade($('vid')); }
    if ($('chs')) $('chs').innerHTML = L.booking.map(function (b, i) { return '<div class="chn"><div class="n">CH ' + (i + 1) + '</div><div class="rg">' + b.region + '</div><div class="co">' + b.company + '</div><div class="ad">' + b.address + '</div>' + L.peopleHTML(b) + '</div>'; }).join('');
  };

  /* Les animations communes : rapides, tout le contenu visible en moins d'une seconde */
  Z.animate = function () {
    if (Z.RM || !window.gsap) return;
    gsap.registerPlugin(ScrollTrigger);
    var GLY = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
    /* Le tableau : les palettes tournent quelques coups puis s'arrêtent sur la bonne lettre */
    document.querySelectorAll('.fl').forEach(function (row) {
      ScrollTrigger.create({ trigger: row, start: 'top 95%', once: true, onEnter: function () {
        row.querySelectorAll('.cells').forEach(function (c) {
          var t = c.dataset.t;
          c.querySelectorAll('i').forEach(function (el, k) {
            if (t[k] === ' ') return; var n = 3 + k + Math.floor(Math.random() * 3), s = 0;
            var iv = setInterval(function () { s++; if (s >= n) { el.textContent = t[k]; clearInterval(iv); return; } el.textContent = GLY[Math.floor(Math.random() * GLY.length)]; }, 40);
          });
        });
      } });
    });
    gsap.utils.toArray('.h').forEach(function (h) { gsap.from(h, { x: -100, opacity: 0, skewX: -12, duration: .7, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%' } }); });
    if (document.querySelector('.tvwall')) gsap.from('.tvwall .tv', { scaleY: .02, opacity: 0, duration: .3, ease: 'power4.out', stagger: { each: .008, from: 'random' }, scrollTrigger: { trigger: '.tvwall', start: 'top 80%' }, clearProps: 'transform,opacity' });
    if (document.querySelector('.chn')) gsap.fromTo('.chn', { clipPath: 'inset(49% 0 49% 0 round 22px)' }, { clipPath: 'inset(0% 0 0% 0 round 22px)', duration: .45, ease: 'power4.out', stagger: .1, scrollTrigger: { trigger: '.chs', start: 'top 85%' } });
    if (document.querySelector('.clock')) gsap.from('.clock div', { y: 40, opacity: 0, stagger: .08, duration: .6, ease: 'back.out(2)', scrollTrigger: { trigger: '.clock', start: 'top 92%' } });
    /* De temps en temps, une télé du mur change de chaîne (neige seulement, la photo reste) */
    var walls = document.querySelectorAll('.tvwall .tv');
    if (walls.length) setInterval(function () { Z.zap(walls[Math.floor(Math.random() * walls.length)]); }, 700);
    addEventListener('load', function () { ScrollTrigger.refresh(); });
  };
})(window.LOVEU2);
