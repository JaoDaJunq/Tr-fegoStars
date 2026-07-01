class Input {
  constructor(canvas, getScale) {
    this.keys = new Set();
    this.mouseX = ARENA_W / 2;
    this.mouseY = ARENA_H / 2;
    this.firing = false;
    this.superPressed = false;

    window.addEventListener('keydown', e => {
      const k = e.key.toLowerCase();
      this.keys.add(k);
      if (k === ' ') {
        this.superPressed = true;
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', e => {
      this.keys.delete(e.key.toLowerCase());
    });

    canvas.addEventListener('mousemove', e => {
      const s = getScale();
      const rect = canvas.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left) / s;
      this.mouseY = (e.clientY - rect.top) / s;
    });

    canvas.addEventListener('mousedown', () => {
      this.firing = true;
    });

    window.addEventListener('mouseup', () => {
      this.firing = false;
    });

    canvas.addEventListener('contextmenu', e => e.preventDefault());
  }

  consumeSuperPress() {
    const v = this.superPressed;
    this.superPressed = false;
    return v;
  }
}
