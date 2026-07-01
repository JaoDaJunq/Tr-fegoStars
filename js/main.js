(function () {
  const canvas = document.getElementById('arena');
  const ctx = canvas.getContext('2d');
  const hudAmmoPips = document.querySelectorAll('#hud-ammo .pip');
  const hudSuperBox = document.getElementById('hud-super');
  const hudSuperFill = document.getElementById('hud-super-fill');
  const menuOverlay = document.getElementById('menu-overlay');
  const playBtn = document.getElementById('play-btn');

  let scale = 1;

  function resize() {
    const availW = window.innerWidth - 24;
    const availH = window.innerHeight - 24;
    scale = Math.min(availW / ARENA_W, availH / ARENA_H);
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = ARENA_W * scale + 'px';
    canvas.style.height = ARENA_H * scale + 'px';
    canvas.width = ARENA_W * scale * dpr;
    canvas.height = ARENA_H * scale * dpr;
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  const input = new Input(canvas, () => scale);

  const arena = {
    walls: OBSTACLES.filter(o => o.type === 'wall').map(o => new Wall(o)),
    crates: OBSTACLES.filter(o => o.type === 'crate').map(o => new Crate(o)),
    bushes: OBSTACLES.filter(o => o.type === 'bush')
  };
  arena.blockers = [...arena.walls, ...arena.crates];

  const ps = new ParticleSystem();
  let player = new Player(ARENA_W / 2, ARENA_H / 2 + 120);
  let projectiles = [];
  let state = 'menu';
  let shake = 0;

  playBtn.addEventListener('click', () => {
    state = 'playing';
    menuOverlay.classList.add('hidden');
  });

  window.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'r' && state === 'playing') resetArena();
  });

  function resetArena() {
    player = new Player(ARENA_W / 2, ARENA_H / 2 + 120);
    projectiles = [];
    ps.list = [];
    for (const c of arena.crates) {
      c.alive = true;
      c.hp = c.hpMax;
      c.respawnTimer = 0;
      c.shake = 0;
    }
  }

  function update(dt) {
    player.update(dt, input, arena);

    if (input.firing && player.canFire()) {
      const shot = player.fire();
      projectiles.push(new Projectile(shot.x, shot.y, shot.angle, 520, 420, 1, false));
      ps.burst(shot.x, shot.y, {
        count: 4, color: COLORS.playerBody, speed: 60, life: 0.12, size: 2, angle: shot.angle, spread: 0.6
      });
    }

    if (input.consumeSuperPress() && player.canSuper()) {
      const baseAngle = player.aimAngle;
      const offsets = [-0.26, -0.13, 0, 0.13, 0.26];
      for (const off of offsets) {
        const a = baseAngle + off;
        const tx = player.x + Math.cos(a) * player.gunTipOffset;
        const ty = player.y + Math.sin(a) * player.gunTipOffset;
        projectiles.push(new Projectile(tx, ty, a, 620, 460, 3, true));
      }
      player.useSuper();
      ps.burst(player.x, player.y, { count: 26, color: COLORS.gold, speed: 260, life: 0.5, size: 4 });
      shake = 0.25;
    }

    for (const p of projectiles) p.update(dt, arena, ps, player);
    projectiles = projectiles.filter(p => !p.dead);

    for (const c of arena.crates) c.update(dt);
    ps.update(dt);

    if (shake > 0) shake -= dt;

    hudAmmoPips.forEach((el, i) => el.classList.toggle('filled', i < player.ammo));
    hudSuperFill.style.width = player.superCharge + '%';
    hudSuperBox.classList.toggle('is-ready', player.superCharge >= player.superMax);
  }

  function drawFloor() {
    ctx.fillStyle = COLORS.floor;
    ctx.fillRect(0, 0, ARENA_W, ARENA_H);

    ctx.strokeStyle = COLORS.floorLine;
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x <= ARENA_W; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ARENA_H);
      ctx.stroke();
    }
    for (let y = 0; y <= ARENA_H; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ARENA_W, y);
      ctx.stroke();
    }

    const grad = ctx.createRadialGradient(ARENA_W / 2, ARENA_H / 2, 60, ARENA_W / 2, ARENA_H / 2, ARENA_W * 0.7);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, ARENA_W, ARENA_H);
  }

  function drawBushes() {
    for (const b of arena.bushes) {
      ctx.beginPath();
      roundRectPath(ctx, b.x, b.y, b.w, b.h, 14);
      ctx.fillStyle = COLORS.bush;
      ctx.fill();
      ctx.strokeStyle = COLORS.bushEdge;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  function drawPlayer() {
    const p = player;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = p.inBush ? 0.55 : 1;

    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, p.radius * 0.7, p.radius * 0.9, p.radius * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.rotate(p.bodyAngle);
    ctx.fillStyle = COLORS.playerBody;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.playerVisor;
    ctx.beginPath();
    ctx.ellipse(p.radius * 0.25, 0, p.radius * 0.55, p.radius * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.rotate(p.aimAngle);
    ctx.fillStyle = COLORS.playerBodyDark;
    ctx.fillRect(p.radius - 6, -4, 24, 8);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(p.radius - 6, -4, 24, 8);
    ctx.restore();

    ctx.restore();

    if (p.muzzleFlash > 0) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.aimAngle);
      ctx.translate(p.gunTipOffset, 0);
      ctx.fillStyle = COLORS.gold;
      ctx.globalAlpha = p.muzzleFlash / 0.08;
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, ARENA_W, ARENA_H);
    ctx.save();
    if (shake > 0) {
      ctx.translate((Math.random() - 0.5) * shake * 14, (Math.random() - 0.5) * shake * 14);
    }

    drawFloor();
    drawBushes();

    const drawables = [...arena.walls, ...arena.crates.filter(c => c.alive), player];
    drawables.sort((a, b) => (a.depthY !== undefined ? a.depthY : a.y) - (b.depthY !== undefined ? b.depthY : b.y));
    for (const d of drawables) {
      if (d === player) drawPlayer();
      else d.draw(ctx);
    }

    for (const p of projectiles) p.draw(ctx);
    ps.draw(ctx);

    ctx.restore();
  }

  let last = performance.now();
  function loop(now) {
    let dt = (now - last) / 1000;
    last = now;
    dt = Math.min(dt, 1 / 30);

    if (state === 'playing') update(dt);
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
