// ---- Custom Cursor System (ring + dot) ----
(function () {
  var root = document.documentElement;

  var ring = document.createElement('div');
  ring.className = 'cursor';
  root.appendChild(ring);

  var dot = document.createElement('div');
  dot.className = 'cursor-dot';
  root.appendChild(dot);

  var mx = 0, my = 0, cx = 0, cy = 0, dx = 0, dy = 0;
  var moving = false;

  function setPosition() {
    ring.style.left = cx + 'px';
    ring.style.top = cy + 'px';
    dot.style.left = dx + 'px';
    dot.style.top = dy + 'px';
  }

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    if (!moving) {
      moving = true;
      loop();
    }
  });

  function loop() {
    cx += (mx - cx) * 0.15;
    cy += (my - cy) * 0.15;
    dx += (mx - dx) * 0.4;
    dy += (my - dy) * 0.4;
    setPosition();

    if (Math.abs(mx - cx) > 0.5 || Math.abs(my - cy) > 0.5) {
      requestAnimationFrame(loop);
    } else {
      cx = mx; cy = my; dx = mx; dy = my;
      setPosition();
      moving = false;
    }
  }

  document.querySelectorAll('a, button, .photo-stack, .interest-toggle, .writing-row-link').forEach(function (el) {
    el.addEventListener('mouseenter', function () { ring.classList.add('hovering'); });
    el.addEventListener('mouseleave', function () { ring.classList.remove('hovering'); });
  });
})();
