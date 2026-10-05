/* Le mur de photos qui suit le curseur (inspiré de yabupushelberg.com).
   Le mur est plus grand que l'écran ; la position du curseur dans la section choisit la partie montrée :
   curseur à droite → on voit la droite du mur, curseur en haut à gauche → le haut à gauche, etc.
   Au doigt : on fait glisser le mur dans le sens du doigt. Sans geste, il dérive doucement tout seul.
   Un clic ouvre la photo en grand (flèches, Échap, balayage). */
(function (L) {
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hasard stable : le mur garde toujours la même composition */
  function rnd(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  /* Visionneuse partagée */
  var lb, lbImg, lbCap, lbList = [], lbI = 0;
  function lightbox() {
    if (lb) return;
    var css = document.createElement('style');
    css.textContent = '.cv-lb{position:fixed;inset:0;z-index:200;display:grid;place-items:center;background:var(--lb-bg,rgba(0,0,0,.92));opacity:0;pointer-events:none;transition:opacity .3s}' +
      '.cv-lb.on{opacity:1;pointer-events:auto}' +
      '.cv-lb img{max-width:min(92vw,1400px);max-height:80vh;object-fit:contain;box-shadow:0 30px 80px rgba(0,0,0,.5);transform:scale(.94);transition:transform .35s cubic-bezier(.2,.8,.2,1)}' +
      '.cv-lb.on img{transform:scale(1)}' +
      '.cv-lb .cap{position:absolute;left:0;right:0;bottom:22px;text-align:center;font:600 13px/1 system-ui,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:var(--lb-ink,#fff)}' +
      '.cv-lb button{position:absolute;top:50%;translate:0 -50%;width:56px;height:56px;border-radius:50%;border:0;background:var(--lb-accent,#fff);color:var(--lb-on,#000);font:700 22px system-ui;cursor:pointer;transition:scale .2s}' +
      '.cv-lb button:hover{scale:1.1}' +
      '.cv-lb .pv{left:18px}.cv-lb .nx{right:18px}' +
      '.cv-lb .x{top:22px;right:18px;translate:none;width:48px;height:48px;font-size:18px}' +
      '@media(max-width:700px){.cv-lb .pv,.cv-lb .nx{top:auto;bottom:56px;translate:none}}';
    document.head.appendChild(css);
    lb = document.createElement('div');
    lb.className = 'cv-lb';
    lb.innerHTML = '<img alt="LOVEU2 live"><div class="cap"></div><button class="pv" aria-label="Previous photo">←</button><button class="nx" aria-label="Next photo">→</button><button class="x" aria-label="Close">✕</button>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector('img'); lbCap = lb.querySelector('.cap');
    function close() { lb.classList.remove('on'); }
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    lb.querySelector('.x').addEventListener('click', close);
    lb.querySelector('.pv').addEventListener('click', function () { show(lbI - 1); });
    lb.querySelector('.nx').addEventListener('click', function () { show(lbI + 1); });
    addEventListener('keydown', function (e) {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(lbI - 1); if (e.key === 'ArrowRight') show(lbI + 1);
    });
    var sx = 0;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    /* balayage : le doigt vers la gauche amène la photo suivante, comme sur iOS */
    lb.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(lbI + (dx < 0 ? 1 : -1)); });
  }
  function show(i) {
    lbI = (i + lbList.length) % lbList.length;
    lbImg.src = 'img/' + lbList[lbI] + '.jpg';
    lbCap.textContent = 'LOVEU2 live · ' + (lbI + 1) + ' / ' + lbList.length;
    lb.classList.add('on');
  }

  /* opts : root (la section), cell / cellMobile (taille d'une case), item(id, i, ar) → HTML, onFrame(cx, cy, W, H, ox, oy) */
  L.canvas = function (opts) {
    var root = opts.root, P = window.LOVEU2_PHOTOS, ids = Object.keys(P);
    var world = document.createElement('div');
    world.className = 'cv-world';
    world.style.cssText = 'position:absolute;left:0;top:0;will-change:transform';
    root.appendChild(world);
    var api = { world: world, items: [], count: ids.length }, W = 0, H = 0;

    /* Composition : une grille de cases, une photo par case, taille et décalage variés */
    function build() {
      var mob = innerWidth < 700, cell = mob ? (opts.cellMobile || 190) : (opts.cell || 330);
      var cols = mob ? 6 : 10, rows = Math.ceil(ids.length / cols);
      W = cols * cell + cell * .4; H = rows * cell * .92 + cell * .5;
      world.style.width = W + 'px'; world.style.height = H + 'px';
      world.innerHTML = '';
      /* les cases vides (grille plus grande que le nombre de photos) sont réparties au hasard, pas toutes au bout */
      var slots = []; for (var k = 0; k < cols * rows; k++) slots.push(k);
      slots.sort(function (p, q) { return rnd(p + 500) - rnd(q + 500); });
      var used = slots.slice(0, ids.length).sort(function (p, q) { return p - q; });
      api.items = ids.map(function (id, i) {
        var slot = used[i], c = slot % cols, r = Math.floor(slot / cols), ar = P[id];
        var w = cell * (ar >= 1 ? .72 + rnd(i) * .24 : .5 + rnd(i) * .2);
        var x = cell * .2 + c * cell + rnd(i + 99) * (cell - w), y = cell * .2 + r * cell * .92 + rnd(i + 7) * cell * .12;
        var el = document.createElement('figure');
        el.className = 'cv-it';
        el.style.cssText = 'position:absolute;left:' + x.toFixed(0) + 'px;top:' + y.toFixed(0) + 'px;width:' + w.toFixed(0) + 'px;margin:0;cursor:zoom-in';
        el.dataset.i = i;
        el.innerHTML = opts.item ? opts.item(id, i, ar) : '<img src="img/s/' + id + '.jpg" alt="LOVEU2 live" style="width:100%;aspect-ratio:' + ar + ';object-fit:cover;display:block">';
        world.appendChild(el);
        /* profondeur : certaines photos glissent un peu plus vite que d'autres */
        return { el: el, z: (rnd(i + 31) - .5) * .05 };
      });
    }
    build();

    var tgt = { x: .5, y: .5 }, cur = { x: .5, y: .5 }, lastInput = -1e9, on = false, drag = null, moved = 0;
    new IntersectionObserver(function (e) { on = e[0].isIntersecting; }).observe(root);
    root.addEventListener('pointermove', function (e) {
      var r = root.getBoundingClientRect();
      if (e.pointerType === 'mouse') {
        /* la position du curseur dans la section → la partie du mur à montrer */
        tgt.x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
        tgt.y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
        lastInput = performance.now();
      } else if (drag) {
        /* au doigt : le mur suit le doigt */
        var dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved += Math.abs(dx) + Math.abs(dy);
        tgt.x = Math.max(0, Math.min(1, tgt.x - dx / Math.max(1, W - r.width)));
        tgt.y = Math.max(0, Math.min(1, tgt.y - dy / Math.max(1, H - r.height)));
        drag.x = e.clientX; drag.y = e.clientY; lastInput = performance.now();
      }
    });
    root.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') { drag = { x: e.clientX, y: e.clientY }; moved = 0; } });
    addEventListener('pointerup', function () { drag = null; });
    root.style.touchAction = 'pan-y';
    root.addEventListener('click', function (e) {
      var f = e.target.closest('.cv-it'); if (!f || moved > 12) { moved = 0; return; }
      lightbox(); lbList = ids; show(+f.dataset.i);
    });

    function frame(t) {
      requestAnimationFrame(frame);
      if (!on) return;
      /* sans geste depuis 3 s : une dérive lente, en forme de huit */
      if (performance.now() - lastInput > 3000 && !RM) { tgt.x = .5 + Math.sin(t / 5200) * .42; tgt.y = .5 + Math.sin(t / 3700) * .38; }
      var k = RM ? 1 : .06;
      cur.x += (tgt.x - cur.x) * k; cur.y += (tgt.y - cur.y) * k;
      var vw = root.clientWidth, vh = root.clientHeight;
      var ox = -(W - vw) * cur.x, oy = -(H - vh) * cur.y;
      world.style.transform = 'translate3d(' + ox.toFixed(1) + 'px,' + oy.toFixed(1) + 'px,0)';
      var cx = (cur.x - .5) * (W - vw), cy = (cur.y - .5) * (H - vh);
      api.items.forEach(function (it) { it.el.style.translate = (-cx * it.z).toFixed(1) + 'px ' + (-cy * it.z).toFixed(1) + 'px'; });
      if (opts.onFrame) opts.onFrame(cur.x, cur.y, W, H, ox, oy);
    }
    requestAnimationFrame(frame);
    var wasMob = innerWidth < 700;
    addEventListener('resize', function () { if (wasMob !== (innerWidth < 700)) { wasMob = innerWidth < 700; build(); } });
    return api;
  };
})(window.LOVEU2);
