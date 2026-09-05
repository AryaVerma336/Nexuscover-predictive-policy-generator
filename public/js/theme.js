/* ═══════════════════════════════
   MAGNETIC CURSOR & THEME SWITCHER
═══════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Cursor Tracking
  const dot = document.getElementById('cur-dot');
  const ring = document.getElementById('cur-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;

  function lerpCursor(){
    rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
    if(ring){ ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
    requestAnimationFrame(lerpCursor);
  }

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if(dot){ dot.style.left = mx + 'px'; dot.style.top = my + 'px'; }
  });
  lerpCursor();

  document.querySelectorAll('button,input,.chip,.bento-card,.bc,.how-card,.cov-card,.claim-card,.ff-card').forEach(el => {
    el.addEventListener('mouseenter', () => { document.body.classList.add('cursor-expand'); });
    el.addEventListener('mouseleave', () => { document.body.classList.remove('cursor-expand'); });
  });

  // Theme Toggle
  let isDark = false;
  const themeBtn = document.getElementById('themeBtn');
  const themeKnob = document.getElementById('themeKnob');
  if(themeBtn){
    themeBtn.onclick = () => {
      isDark = !isDark;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      if(themeKnob) themeKnob.textContent = isDark ? '🌙' : '☀️';
    };
  }
});
