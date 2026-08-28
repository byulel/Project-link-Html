
function genPhotos(n) {
  var a = [];
  for (var i = 1; i <= n; i++) a.push('photo-' + i + '.jpeg');
  return a;
}

var F = {
  lieu:   { name: 'Lieu',             photos: genPhotos(7) },
  rdc:    { name: 'Rez-de-chaussée',  photos: genPhotos(9) },
  etage1: { name: '1er Étage',        photos: genPhotos(8) },
  etage2: { name: '2ème Étage',       photos: genPhotos(17) },
  etage3: { name: '3ème Étage',       photos: genPhotos(12) }
};

var folders = {
  lieu: 'Lieu', rdc: 'RDC', etage1: 'Etage-1', etage2: 'Etage-2', etage3: 'Etage-3'
};

var cur = 'lieu', idx = 0, animating = false;
var photo = document.getElementById('photo');
var floorName = document.getElementById('floorName');
var progress = document.getElementById('progress');
var counter = document.getElementById('counter');
var preloaded = {};

function preload(folder, arr, i) {
  var key = folder + '-' + i;
  if (preloaded[key]) return;
  var img = new Image();
  img.src = folder + '/' + arr[i];
  preloaded[key] = true;
}

function preloadAdjacent() {
  var p = F[cur].photos;
  var folder = folders[cur];
  var n = p.length;
  preload(folder, p, (idx + 1) % n);
  preload(folder, p, (idx - 1 + n) % n);
}

function show(dir) {
  var p = F[cur].photos;
  var folder = folders[cur];

  photo.className = '';
  photo.classList.add(dir >= 0 ? 'out-left' : 'out-right');

  var img = new Image();
  var ready = false;
  function onReady() {
    if (ready) return;
    ready = true;
    photo.src = img.src;
    photo.className = dir >= 0 ? 'out-right' : 'out-left';
    void photo.offsetHeight;
    photo.className = 'visible';
    animating = false;
    preloadAdjacent();
  }
  img.onload = onReady;
  img.onerror = onReady;
  img.src = folder + '/' + p[idx];
  if (img.complete && img.naturalWidth > 0) onReady();

  floorName.textContent = F[cur].name;
  counter.innerHTML = '<span class="num">' + (idx + 1) + '</span> / ' + p.length;
  progress.style.width = ((idx + 1) / p.length * 100) + '%';
}

function nav(d) {
  var p = F[cur].photos;
  idx = (idx + d + p.length) % p.length;
  show(d);
}

function setFloor(id) {
  cur = id;
  idx = 0;
  var tabs = document.querySelectorAll('.tab');
  for (var t = 0; t < tabs.length; t++) {
    tabs[t].classList.toggle('active', tabs[t].getAttribute('data-floor') === id);
  }
  show(1);
}

var tabs = document.querySelectorAll('.tab');
for (var t = 0; t < tabs.length; t++) {
  tabs[t].addEventListener('click', function() {
    setFloor(this.getAttribute('data-floor'));
  });
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowLeft') nav(-1);
  if (e.key === 'ArrowRight') nav(1);
  var keys = ['lieu','rdc','etage1','etage2','etage3'];
  var num = parseInt(e.key);
  if (num >= 1 && num <= 5) setFloor(keys[num - 1]);
});

var sx = 0;
document.addEventListener('touchstart', function(e) { sx = e.touches[0].clientX; }, {passive:true});
document.addEventListener('touchend', function(e) {
  var dx = e.changedTouches[0].clientX - sx;
  if (Math.abs(dx) > 50) nav(dx > 0 ? -1 : 1);
}, {passive:true});

function startSite() {
  document.getElementById('loader').classList.add('hidden');
  photo.classList.add('visible');
  preloadAdjacent();
}

var started = false;
function ensureStart() {
  if (started) return;
  started = true;
  startSite();
}

if (document.readyState === 'complete') {
  setTimeout(ensureStart, 800);
} else {
  window.addEventListener('load', function() { setTimeout(ensureStart, 800); });
}
setTimeout(ensureStart, 2000);
