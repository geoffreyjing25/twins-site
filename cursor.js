// ---- Custom Cursor System (ring + dot) ----
(function () {
  var ring = document.createElement('div');
  ring.className = 'cursor';
  document.body.appendChild(ring);

  var dot = document.createElement('div');
  dot.className = 'cursor-dot';
  document.body.appendChild(dot);

  var mx = 0, my = 0, cx = 0, cy = 0, dx = 0, dy = 0;
  var moving = false;

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
    ring.style.left = cx + 'px';
    ring.style.top = cy + 'px';

    dx += (mx - dx) * 0.4;
    dy += (my - dy) * 0.4;
    dot.style.left = dx + 'px';
    dot.style.top = dy + 'px';

    // Stop looping once cursor has caught up
    if (Math.abs(mx - cx) > 0.5 || Math.abs(my - cy) > 0.5) {
      requestAnimationFrame(loop);
    } else {
      // Snap to final position
      ring.style.left = mx + 'px';
      ring.style.top = my + 'px';
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
      cx = mx; cy = my; dx = mx; dy = my;
      moving = false;
    }
  }

  // Add hovering class on interactive elements
  document.querySelectorAll('a, button').forEach(function (el) {
    el.addEventListener('mouseenter', function () { ring.classList.add('hovering'); });
    el.addEventListener('mouseleave', function () { ring.classList.remove('hovering'); });
  });
})();
