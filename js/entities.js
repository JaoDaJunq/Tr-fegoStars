class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.speed = 230;
    this.bodyAngle = 0;
    this.aimAngle = 0;
    this.moving = false;
    this.inBush = false;

    this.ammo = 3;
    this.ammoMax = 3;
    this.reloadTimer = 0;
    this.reloadTime = 1.4;

    this.fireCooldown = 0;
    this.fireRate = 0.28;

    this.superCharge = 0;
    this.superMax = 100;

    this.muzzleFlash = 0;
  }

  get gunTipOffset() {
    return this.radius + 18;
  }

  update(dt, input, arena) {
    let mx = 0;
    let my = 0;
    if (input.keys.has('w') || input.keys.has('arrowup')) my -= 1;
    if (input.keys.has('s') || input.keys.has('arrowdown')) my += 1;
    if (input.keys.has('a') || input.keys.has('arrowleft')) mx -= 1;
    if (input.keys.has('d') || input.keys.has('arrowright')) mx += 1;

    this.moving = mx !== 0 || my !== 0;
    if (this.moving) {
      const len = Math.hypot(mx, my) || 1;
      mx /= len;
      my /= len;
      const targetAngle = Math.atan2(my, mx);
      this.bodyAngle = lerpAngle(this.bodyAngle, targetAngle, 1 - Math.pow(0.0005, dt));
      const nx = this.x + mx * this.speed * dt;
      const ny = this.y + my * this.speed * dt;
      this.tryMove(nx, ny, arena);
    }

    this.aimAngle = Math.atan2(input.mouseY - this.y, input.mouseX - this.x);

    if (this.fireCooldown > 0) this.fireCooldown -= dt;

    if (this.ammo < this.ammoMax) {
      this.reloadTimer += dt;
      if (this.reloadTimer >= this.reloadTime) {
        this.reloadTimer = 0;
        this.ammo++;
      }
    }

    if (this.muzzleFlash > 0) this.muzzleFlash -= dt;

    this.inBush = arena.bushes.some(b => circleRectOverlap(this.x, this.y, this.radius * 0.6, b));
  }

  tryMove(nx, ny, arena) {
    nx = clamp(nx, this.radius, ARENA_W - this.radius);
    ny = clamp(ny, this.radius, ARENA_H - this.radius);
    for (const o of arena.blockers) {
      if (o.alive === false) continue;
      const res = resolveCircleRect(nx, ny, this.radius, o);
      nx = res.x;
      ny = res.y;
    }
    this.x = nx;
    this.y = ny;
  }

  canFire() {
    return this.ammo > 0 && this.fireCooldown <= 0;
  }

  fire() {
    this.ammo--;
    this.fireCooldown = this.fireRate;
    this.muzzleFlash = 0.08;
    const tipX = this.x + Math.cos(this.aimAngle) * this.gunTipOffset;
    const tipY = this.y + Math.sin(this.aimAngle) * this.gunTipOffset;
    return { x: tipX, y: tipY, angle: this.aimAngle };
  }

  gainSuper(amount) {
    this.superCharge = Math.min(this.superMax, this.superCharge + amount);
  }

  canSuper() {
    return this.superCharge >= this.superMax;
  }

  useSuper() {
    this.superCharge = 0;
  }
}

class Wall {
  constructor(def) {
    this.type = 'wall';
    this.x = def.x;
    this.y = def.y;
    this.w = def.w;
    this.h = def.h;
    this.label = def.label;
  }

  get depthY() {
    return this.y + this.h;
  }

  hit(px, py, ps) {
    ps.burst(px, py, { count: 8, color: COLORS.crimson, speed: 140, life: 0.35, size: 3 });
    return { destroyed: false, superGain: 14 };
  }

  draw(ctx) {
    ctx.fillStyle = COLORS.pilarEdge;
    ctx.fillRect(this.x, this.y + this.h - 4, this.w, 10);
    ctx.fillStyle = COLORS.pilar;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.fillStyle = COLORS.pilarTop;
    ctx.fillRect(this.x, this.y, this.w, this.h * 0.32);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const bx = this.x + (this.w / 4) * i;
      ctx.beginPath();
      ctx.moveTo(bx, this.y + this.h * 0.32);
      ctx.lineTo(bx, this.y + this.h);
      ctx.stroke();
    }
  }
}

class Crate {
  constructor(def) {
    this.type = 'crate';
    this.x = def.x;
    this.y = def.y;
    this.w = def.w;
    this.h = def.h;
    this.label = def.label;
    this.hpMax = def.hp;
    this.hp = def.hp;
    this.shake = 0;
    this.alive = true;
    this.respawnTimer = 0;
  }

  get depthY() {
    return this.y + this.h;
  }

  hit(px, py, ps, damage) {
    this.hp -= damage || 1;
    this.shake = 0.22;
    ps.burst(px, py, { count: 10, color: COLORS.crateLight, speed: 150, life: 0.4, size: 3, shape: 'rect' });

    if (this.hp <= 0) {
      this.alive = false;
      this.respawnTimer = 6;
      ps.burst(this.x + this.w / 2, this.y + this.h / 2, {
        count: 22, color: COLORS.gold, speed: 220, life: 0.6, size: 4, shape: 'rect'
      });
      return { destroyed: true, superGain: 26 };
    }
    return { destroyed: false, superGain: 16 };
  }

  update(dt) {
    if (this.shake > 0) this.shake -= dt;
    if (!this.alive) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.alive = true;
        this.hp = this.hpMax;
      }
    }
  }

  draw(ctx) {
    if (!this.alive) return;
    const sh = this.shake > 0 ? Math.sin(this.shake * 60) * this.shake * 6 : 0;
    ctx.save();
    ctx.translate(sh, 0);

    ctx.fillStyle = COLORS.crateDark;
    ctx.fillRect(this.x, this.y + this.h - 6, this.w, 10);
    ctx.fillStyle = COLORS.crate;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeStyle = COLORS.crateDark;
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x + 2, this.y + 2, this.w - 4, this.h - 4);
    ctx.beginPath();
    ctx.moveTo(this.x + 4, this.y + 4);
    ctx.lineTo(this.x + this.w - 4, this.y + this.h - 4);
    ctx.moveTo(this.x + this.w - 4, this.y + 4);
    ctx.lineTo(this.x + 4, this.y + this.h - 4);
    ctx.lineWidth = 2;
    ctx.stroke();

    if (this.hp < this.hpMax) {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(this.x, this.y - 9, this.w, 4);
      ctx.fillStyle = COLORS.crimson;
      ctx.fillRect(this.x, this.y - 9, this.w * (this.hp / this.hpMax), 4);
    }
    ctx.restore();
  }
}

class Projectile {
  constructor(x, y, angle, speed, range, damage, big) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.traveled = 0;
    this.range = range;
    this.damage = damage;
    this.big = !!big;
    this.dead = false;
  }

  update(dt, arena, ps, player) {
    for (let s = 0; s < 2; s++) {
      const dx = this.vx * dt * 0.5;
      const dy = this.vy * dt * 0.5;
      this.x += dx;
      this.y += dy;
      this.traveled += Math.hypot(dx, dy);

      if (this.x < 0 || this.x > ARENA_W || this.y < 0 || this.y > ARENA_H) {
        this.dead = true;
        return;
      }

      for (const o of arena.blockers) {
        if (o.alive === false) continue;
        if (pointInRect(this.x, this.y, o)) {
          const res = o.hit(this.x, this.y, ps, this.damage);
          if (res) player.gainSuper(res.superGain);
          this.dead = true;
          return;
        }
      }

      if (this.traveled >= this.range) {
        this.dead = true;
        return;
      }
    }
  }

  draw(ctx) {
    ctx.save();
    const angle = Math.atan2(this.vy, this.vx);
    ctx.translate(this.x, this.y);
    ctx.rotate(angle);
    ctx.fillStyle = this.big ? COLORS.gold : COLORS.playerBody;
    ctx.shadowColor = this.big ? COLORS.gold : COLORS.playerBody;
    ctx.shadowBlur = this.big ? 14 : 8;
    const len = this.big ? 16 : 11;
    const wid = this.big ? 6 : 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, len / 2, wid / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
