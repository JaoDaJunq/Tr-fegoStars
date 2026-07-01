const ARENA_W = 960;
const ARENA_H = 600;

const COLORS = {
  floor: '#0F1B2E',
  floorLine: '#16283F',
  pilar: '#2A3B52',
  pilarTop: '#3C5170',
  pilarEdge: '#18233A',
  crate: '#C98A3B',
  crateDark: '#8F5F26',
  crateLight: '#E4AF63',
  bush: 'rgba(47,230,198,0.10)',
  bushEdge: 'rgba(47,230,198,0.30)',
  playerBody: '#2FE6C6',
  playerBodyDark: '#1CB39B',
  playerVisor: '#0B1220',
  gold: '#F4B740',
  crimson: '#E5484D',
  ink: '#F5F1E8'
};

const OBSTACLES = [
  { type: 'wall', x: 140, y: 118, w: 130, h: 32, label: 'Pilar de Report' },
  { type: 'wall', x: 690, y: 118, w: 130, h: 32, label: 'Pilar de Report' },
  { type: 'wall', x: 140, y: 450, w: 130, h: 32, label: 'Pilar de Report' },
  { type: 'wall', x: 690, y: 450, w: 130, h: 32, label: 'Pilar de Report' },
  { type: 'wall', x: 414, y: 284, w: 32, h: 132, label: 'Pilar de Report' },

  { type: 'crate', x: 300, y: 200, w: 46, h: 46, hp: 3, label: 'Caixa de Briefing' },
  { type: 'crate', x: 614, y: 200, w: 46, h: 46, hp: 3, label: 'Caixa de Briefing' },
  { type: 'crate', x: 300, y: 354, w: 46, h: 46, hp: 3, label: 'Caixa de Briefing' },
  { type: 'crate', x: 614, y: 354, w: 46, h: 46, hp: 3, label: 'Caixa de Briefing' },
  { type: 'crate', x: 457, y: 480, w: 46, h: 46, hp: 3, label: 'Caixa de Briefing' },

  { type: 'bush', x: 56, y: 258, w: 120, h: 92, label: 'Zona de Baixo CTR' },
  { type: 'bush', x: 784, y: 258, w: 120, h: 92, label: 'Zona de Baixo CTR' },
  { type: 'bush', x: 418, y: 36, w: 124, h: 66, label: 'Zona de Baixo CTR' }
];
