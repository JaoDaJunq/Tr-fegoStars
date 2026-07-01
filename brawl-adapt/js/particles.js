class Particle {
  constructor(x, y, vx, vy, life, color, size, shape) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.size = size;
    this.shape = shape || 'dot';
    this.rot = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 8;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= 0.9;
    this.vy *= 0.9;
    this.rot += this.rotSpeed * dt;
    this.life -= dt;
  }

  get alive() {
    return this.life > 0;
  }

  get t() {
    return Math.max(0, this.life / this.maxLife);
  }
}

class ParticleSystem {
  constructor() {
    this.list = [];
  }

  burst(x, y, opts) {
    opts = opts || {};
    const count = opts.count || 10;
    const color = opts.color || '#ffffff';
    const speed = opts.speed || 160;
    const life = opts.life || 0.5;
    const size = opts.size || 3;
    const shape = opts.shape || 'dot';
    const spread = opts.spread !== undefined ? opts.spread : Math.PI * 2;
    const angle = opts.angle || 0;

    for (let i = 0; i < count; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const s = speed * (0.4 + Math.random() * 0.9);
      this.list.push(new Particle(
        x, y,
        Math.cos(a) * s, Math.sin(a) * s,
        life * (0.6 + Math.random() * 0.7),
        color,
        size * (0.6 + Math.random() * 0.8),
        shape
      ));
    }
  }

  update(dt) {
    for (const p of this.list) p.update(dt);
    this.list = this.list.filter(p => p.alive);
  }

  draw(ctx) {
    for (const p of this.list) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.t);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}
