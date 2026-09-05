/* ═══════════════════════════════
   PARTICLE CANVAS ANIMATION
═══════════════════════════════ */
(function(){
  const C = document.getElementById('particle-canvas');
  if(!C) return;
  const ctx = C.getContext('2d');
  let W, H, particles = [];
  const dark = () => document.documentElement.getAttribute('data-theme') === 'dark';

  function resize(){ W = C.width = window.innerWidth; H = C.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);

  class Particle {
    constructor(){ this.reset(); }
    reset(){
      this.x = Math.random() * W; this.y = Math.random() * H;
      this.size = Math.random() * 1.8 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.25; this.speedY = (Math.random() - 0.5) * 0.25;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.life = Math.random(); this.maxLife = 0.008 + Math.random() * 0.004;
    }
    update(){
      this.x += this.speedX; this.y += this.speedY;
      this.life += this.maxLife;
      if(this.x < 0 || this.x > W || this.y < 0 || this.y > H || this.life > 1) this.reset();
    }
    draw(){
      const alpha = Math.sin(this.life * Math.PI) * this.opacity;
      const col = dark() ? `rgba(91,138,255,${alpha})` : `rgba(26,79,255,${alpha * 0.6})`;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = col; ctx.fill();
    }
  }

  for(let i = 0; i < 90; i++) particles.push(new Particle());

  function drawLines(){
    for(let i = 0; i < particles.length; i++){
      for(let j = i + 1; j < particles.length; j++){
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if(dist < 130){
          const alpha = (1 - dist / 130) * 0.08 * (dark() ? 1 : 0.6);
          ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = dark() ? `rgba(91,138,255,${alpha})` : `rgba(26,79,255,${alpha})`;
          ctx.lineWidth = 0.6; ctx.stroke();
        }
      }
    }
  }

  function frame(){
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(frame);
  }
  frame();
})();
