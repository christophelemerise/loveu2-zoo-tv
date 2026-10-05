/* Outils partagés par les layouts 6 à 13. Le contenu vient de data.js (window.LOVEU2). */
(function (L) {
  L.RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  L.mobile = function () { return innerWidth < 700; };

  /* Le prochain spectacle à venir, à 20 h, heure locale */
  L.next = function () {
    var now = new Date();
    return L.upcoming.find(function (s) { return new Date(s.iso + 'T20:00:00') > now; }) || L.upcoming[0];
  };

  /* Compte à rebours : rappelle cb({d,h,m,s}) chaque seconde. Jamais de zéro devant un nombre. */
  L.countdown = function (show, cb) {
    function t() {
      var ms = Math.max(0, new Date(show.iso + 'T20:00:00') - new Date());
      cb({ d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60 });
    }
    t(); return setInterval(t, 1000);
  };

  /* Vidéo : la vignette ne charge YouTube qu'au clic */
  L.thumb = 'https://i.ytimg.com/vi/' + L.video + '/maxresdefault.jpg';
  L.videoFacade = function (el) {
    function play() { el.innerHTML = '<iframe style="position:absolute;inset:0;width:100%;height:100%;border:0" src="https://www.youtube.com/embed/' + L.video + '?autoplay=1&rel=0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen title="LOVEU2 live"></iframe>'; }
    el.addEventListener('click', play);
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); } });
  };

  /* Liens d'un contact de booking */
  L.tel = function (p) { return 'tel:' + p.phone.replace(/[^+\d]/g, ''); };
  L.peopleHTML = function (b, cls) {
    return b.people.map(function (p) {
      return '<div class="' + (cls || 'p') + '"><b>' + p.name + '</b><span><a href="' + L.tel(p) + '">' + p.phone + '</a><a href="mailto:' + p.email + '">Email</a></span></div>';
    }).join('');
  };

  /* Villes déjà jouées, sans doublon, de la plus récente à la plus ancienne */
  L.pastCities = function () {
    var seen = {};
    return L.past.filter(function (s) { var k = L.place(s.city); if (seen[k]) return false; seen[k] = 1; return true; });
  };

  /* Toutes les photos disponibles (versions légères dans img/s/) */
  L.photos = ['p00003','p00005','p00006','p00011','p00012','p00013','p00014','p00018','p00019','p00020','p00021','p00023','p00024','p00026','p00029','p00030','p00032','p00038','p00040','p00042','p00043','p00048','p00050','p00051','p00053','p00055','p00057','p00059','p00061','p00062','p00064','p00065','p00069','p00076','p00079','p00081','p00082','p00083','p00087','p00090','p00093','p00095','p00096','p00097','p00098','p00099'];
})(window.LOVEU2);
