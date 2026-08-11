// components/ClubBadge.js
import React from 'react';
import styled from 'styled-components';

const CLUB_STYLES = {
  flamengo: {
    outer: '#050505',
    glow: '#ff1f2d',
    pattern: 'horizontal-stripes',
    colors: ['#f31222', '#050505'],
    center: null,
  },

  palmeiras: {
    outer: '#006b3f',
    glow: '#00c46a',
    pattern: 'rings',
    colors: ['#006b3f', '#ffffff'],
    center: '#ffffff',
  },

  saopaulo: {
    outer: '#e01822',
    glow: '#ff3340',
    pattern: 'spfc-bars',
    colors: ['#ffffff', '#e01822', '#050505'],
    center: null,
  },

  santos: {
    outer: '#050505',
    glow: '#ffffff',
    pattern: 'vertical-stripes-clean',
    colors: ['#050505', '#ffffff'],
    center: '#ffffff',
  },

  vasco: {
    outer: '#050505',
    glow: '#ffffff',
    pattern: 'diagonal',
    colors: ['#050505', '#ffffff'],
    center: '#e01822',
  },

  vascodagama: {
    outer: '#050505',
    glow: '#ffffff',
    pattern: 'diagonal',
    colors: ['#050505', '#ffffff'],
    center: '#e01822',
  },

  botafogo: {
    outer: '#050505',
    glow: '#ffffff',
    pattern: 'star',
    colors: ['#050505', '#ffffff'],
    center: null,
  },

  fluminense: {
    outer: '#00613a',
    glow: '#8b1232',
    pattern: 'flu-stripes',
    colors: ['#00613a', '#8b1232', '#ffffff'],
    center: null,
  },

  gremio: {
    outer: '#00a3e0',
    glow: '#00bfff',
    pattern: 'gremio-stripes',
    colors: ['#00a3e0', '#050505', '#ffffff'],
    center: null,
  },

  internacional: {
    outer: '#e30613',
    glow: '#ff3340',
    pattern: 'target',
    colors: ['#e30613', '#ffffff'],
    center: '#ffffff',
  },

  cruzeiro: {
    outer: '#003da5',
    glow: '#2f80ff',
    pattern: 'stars',
    colors: ['#003da5', '#ffffff'],
    center: '#ffffff',
  },

  bahia: {
    outer: '#0057b8',
    glow: '#e30613',
    pattern: 'bahia',
    colors: ['#0057b8', '#ffffff', '#e30613'],
    center: '#ffffff',
  },

  coritiba: {
    outer: '#006b3f',
    glow: '#00c46a',
    pattern: 'coritiba',
    colors: ['#006b3f', '#ffffff'],
    center: '#ffffff',
  },

  vitoria: {
    outer: '#050505',
    glow: '#e30613',
    pattern: 'half-horizontal',
    colors: ['#e30613', '#050505'],
    center: '#ffffff',
  },

  atleticomineiro: {
    outer: '#050505',
    glow: '#ffffff',
    pattern: 'vertical-stripes-clean',
    colors: ['#050505', '#ffffff'],
    center: null,
  },

  atletico: {
    outer: '#050505',
    glow: '#ffffff',
    pattern: 'vertical-stripes-clean',
    colors: ['#050505', '#ffffff'],
    center: null,
  },

  corinthians: {
    outer: '#050505',
    glow: '#e30613',
    pattern: 'corinthians',
    colors: ['#050505', '#ffffff', '#e30613'],
    center: '#ffffff',
  },

  mirassol: {
    outer: '#006b3f',
    glow: '#ffd400',
    pattern: 'mirassol',
    colors: ['#ffd400', '#006b3f'],
    center: '#ffd400',
  },

  remo: {
    outer: '#001f4e',
    glow: '#ffffff',
    pattern: 'horizontal-band',
    colors: ['#001f4e', '#ffffff'],
    center: '#001f4e',
  },

  chapecoense: {
    outer: '#007a3d',
    glow: '#ffffff',
    pattern: 'horizontal-band',
    colors: ['#007a3d', '#ffffff'],
    center: '#ffffff',
  },

  bragantino: {
    outer: '#001f4e',
    glow: '#e30613',
    pattern: 'bragantino',
    colors: ['#001f4e', '#ffffff', '#e30613', '#ffd400'],
    center: '#ffd400',
  },

  rbbragantino: {
    outer: '#001f4e',
    glow: '#e30613',
    pattern: 'bragantino',
    colors: ['#001f4e', '#ffffff', '#e30613', '#ffd400'],
    center: '#ffd400',
  },

  redbullbragantino: {
    outer: '#001f4e',
    glow: '#e30613',
    pattern: 'bragantino',
    colors: ['#001f4e', '#ffffff', '#e30613', '#ffd400'],
    center: '#ffd400',
  },

  athleticoparanaense: {
    outer: '#e30613',
    glow: '#ff3340',
    pattern: 'furacao-diagonal',
    colors: ['#e30613', '#050505', '#ffffff'],
    center: null,
  },

  atleticoparanaense: {
    outer: '#e30613',
    glow: '#ff3340',
    pattern: 'furacao-diagonal',
    colors: ['#e30613', '#050505', '#ffffff'],
    center: null,
  },
};

const LEAGUE_STYLES = {
  brasil: {
  outer: '#0b7a3b',
  glow: '#22c55e',
  pattern: 'flag-brazil-premium',
  colors: ['#0b7a3b', '#f7d117', '#1f4ed8', '#ffffff'],
},

brasileirao: {
  outer: '#0b7a3b',
  glow: '#22c55e',
  pattern: 'flag-brazil-premium',
  colors: ['#0b7a3b', '#f7d117', '#1f4ed8', '#ffffff'],
},

brasileiraoseriea: {
  outer: '#0b7a3b',
  glow: '#22c55e',
  pattern: 'flag-brazil-premium',
  colors: ['#0b7a3b', '#f7d117', '#1f4ed8', '#ffffff'],
},

brasileiraoserieb: {
  outer: '#0b7a3b',
  glow: '#22c55e',
  pattern: 'flag-brazil-premium',
  colors: ['#0b7a3b', '#f7d117', '#1f4ed8', '#ffffff'],
},

nba: {
  outer: '#16327a',
  glow: '#ff9a1f',
  pattern: 'basketball-premium',
  colors: ['#f58220', '#1b1b1b', '#ffffff'],
},

nfl: {
  outer: '#4b2a18',
  glow: '#d18a39',
  pattern: 'american-football-premium',
  colors: ['#0f172a', '#7a4320', '#ffffff'],
},

  inglaterra: {
    outer: '#0f172a',
    glow: '#ef4444',
    pattern: 'flag-england',
    colors: ['#ffffff', '#ef4444'],
  },

  premierleague: {
    outer: '#0f172a',
    glow: '#ef4444',
    pattern: 'flag-england',
    colors: ['#ffffff', '#ef4444'],
  },

  espanha: {
    outer: '#dc2626',
    glow: '#facc15',
    pattern: 'flag-spain',
    colors: ['#dc2626', '#facc15'],
  },

  laliga: {
    outer: '#dc2626',
    glow: '#facc15',
    pattern: 'flag-spain',
    colors: ['#dc2626', '#facc15'],
  },

  alemanha: {
    outer: '#111827',
    glow: '#facc15',
    pattern: 'flag-germany',
    colors: ['#050505', '#dc2626', '#facc15'],
  },

  bundesliga: {
    outer: '#111827',
    glow: '#facc15',
    pattern: 'flag-germany',
    colors: ['#050505', '#dc2626', '#facc15'],
  },

  franca: {
    outer: '#1d4ed8',
    glow: '#ef4444',
    pattern: 'flag-france',
    colors: ['#1d4ed8', '#ffffff', '#ef4444'],
  },

  ligue1: {
    outer: '#1d4ed8',
    glow: '#ef4444',
    pattern: 'flag-france',
    colors: ['#1d4ed8', '#ffffff', '#ef4444'],
  },

  holanda: {
    outer: '#1d4ed8',
    glow: '#f97316',
    pattern: 'flag-netherlands',
    colors: ['#ef4444', '#ffffff', '#1d4ed8'],
  },

  eredivisie: {
    outer: '#1d4ed8',
    glow: '#f97316',
    pattern: 'flag-netherlands',
    colors: ['#ef4444', '#ffffff', '#1d4ed8'],
  },

};

function normalizeClubName(nome = '') {
  const base = String(nome)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
    .trim();

  const aliases = {
  sao: 'saopaulo',
  saopaulofc: 'saopaulo',
  spfc: 'saopaulo',

  gremio: 'gremio',
  gremiofbpa: 'gremio',
  gremiofootballportoalegrense: 'gremio',

  rbbragantino: 'rbbragantino',
  bragantino: 'bragantino',
  redbullbragantino: 'redbullbragantino',

  athletico: 'athleticoparanaense',
  athleticoparanaense: 'athleticoparanaense',
  athleticopr: 'athleticoparanaense',
  atleticoparanaense: 'athleticoparanaense',
  atleticopr: 'athleticoparanaense',
  cap: 'athleticoparanaense',

  vasco: 'vasco',
  vascodagama: 'vascodagama',

  atletico: 'atleticomineiro',
  atleticomg: 'atleticomineiro',
  atleticomineiro: 'atleticomineiro',
};

  return aliases[base] || base;
}

function normalizeLeagueName(nome = '') {
  const base = String(nome)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
    .trim();

  const aliases = {
    br: 'brasil',
    brazil: 'brasil',
    brasileiro: 'brasileirao',
    brasileiraoa: 'brasileiraoseriea',
    brasileiraob: 'brasileiraoserieb',

    premier: 'premierleague',
    england: 'inglaterra',
    englishpremierleague: 'premierleague',

    espanha: 'espanha',
    spain: 'espanha',
    laligasantander: 'laliga',

    germany: 'alemanha',
    alemanha: 'alemanha',

    france: 'franca',
    franca: 'franca',
    ligueone: 'ligue1',

    netherlands: 'holanda',
    holland: 'holanda',
    holanda: 'holanda',

    nba: 'nba',
    nationalbasketballassociation: 'nba',

    nfl: 'nfl',
    nationalfootballleague: 'nfl',
  };

  return aliases[base] || base;
}

const Wrap = styled.div`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  min-width: ${({ $size }) => $size}px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: ${({ $outer }) => $outer};
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.14),
    0 0 12px ${({ $glow }) => `${$glow}66`},
    inset 0 0 10px rgba(255,255,255,0.14);
  overflow: hidden;
`;

const Inner = styled.div`
  width: 76%;
  height: 76%;
  border-radius: 999px;
  position: relative;
  overflow: hidden;
  background: ${({ $bg }) => $bg};
  box-shadow:
    inset 0 0 12px rgba(0,0,0,0.35),
    0 0 0 2px rgba(255,255,255,0.82);
`;

const Center = styled.div`
  position: absolute;
  width: 34%;
  height: 34%;
  border-radius: 999px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: ${({ $color }) => $color};
  box-shadow:
    0 0 0 2px rgba(0,0,0,0.35),
    inset 0 0 8px rgba(255,255,255,0.24);
  z-index: 3;
`;

const Star = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: ${({ $size }) => Math.floor($size * 0.42)}px;
  font-weight: 900;
  text-shadow: 0 0 8px rgba(255,255,255,0.45);
  z-index: 2;

  &::before {
    content: '★';
  }
`;

const StarsRing = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;

  span {
    position: absolute;
    color: #fff;
    font-size: ${({ $size }) => Math.max(7, Math.floor($size * 0.16))}px;
    line-height: 1;
    text-shadow: 0 0 6px rgba(255,255,255,0.35);
  }

  span:nth-child(1) {
    left: 50%;
    top: 14%;
    transform: translateX(-50%);
  }

  span:nth-child(2) {
    left: 22%;
    top: 40%;
    transform: translate(-50%, -50%);
  }

  span:nth-child(3) {
    right: 22%;
    top: 40%;
    transform: translate(50%, -50%);
  }

  span:nth-child(4) {
    left: 34%;
    bottom: 16%;
    transform: translateX(-50%);
  }

  span:nth-child(5) {
    right: 34%;
    bottom: 16%;
    transform: translateX(50%);
  }
`;

const BrazilDiamond = styled.div`
  position: absolute;
  width: 62%;
  height: 62%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  border-radius: 8px;
  background: ${({ $color }) => $color};
  z-index: 1;
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.18);
`;

const BrazilBlueCircle = styled.div`
  position: absolute;
  width: 38%;
  height: 38%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background: ${({ $color }) => $color};
  z-index: 2;
  box-shadow: inset 0 0 8px rgba(255, 255, 255, 0.18);
`;

const BrazilBand = styled.div`
  position: absolute;
  width: 44%;
  height: 9%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) rotate(-12deg);
  border-radius: 999px;
  background: ${({ $color }) => $color};
  z-index: 3;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.22);
`;

const BasketballSeams = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;

  .line-v,
  .line-h {
    position: absolute;
    background: ${({ $color }) => $color};
    opacity: 0.88;
  }

  .line-v {
    left: 50%;
    top: 0;
    bottom: 0;
    width: 3px;
    transform: translateX(-50%);
  }

  .line-h {
    top: 50%;
    left: 0;
    right: 0;
    height: 3px;
    transform: translateY(-50%);
  }

  .arc-left,
  .arc-right {
    position: absolute;
    top: -10%;
    bottom: -10%;
    width: 40%;
    border: 3px solid ${({ $color }) => $color};
    border-top: 0;
    border-bottom: 0;
    border-radius: 999px;
    opacity: 0.88;
  }

  .arc-left {
    left: 8%;
  }

  .arc-right {
    right: 8%;
  }
`;

const FootballBall = styled.div`
  position: absolute;
  left: 18%;
  right: 18%;
  top: 28%;
  bottom: 28%;
  border-radius: 999px / 70%;
  transform: rotate(-18deg);
  background: ${({ $color }) => $color};
  border: 2px solid rgba(255, 255, 255, 0.9);
  z-index: 2;
  box-shadow:
    inset 0 0 10px rgba(0, 0, 0, 0.28),
    0 0 8px rgba(0, 0, 0, 0.18);

  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 18%;
    bottom: 18%;
    width: 2px;
    transform: translateX(-50%);
    background: ${({ $laceColor }) => $laceColor};
  }

  &::after {
    content: '';
    position: absolute;
    left: 32%;
    right: 32%;
    top: 50%;
    height: 2px;
    transform: translateY(-50%);
    background: ${({ $laceColor }) => $laceColor};
    box-shadow:
      0 -6px 0 ${({ $laceColor }) => $laceColor},
      0 6px 0 ${({ $laceColor }) => $laceColor};
  }
`;

const BallLine = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 999px;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -12%;
    bottom: -12%;
    width: 34%;
    border: 3px solid rgba(17, 24, 39, 0.9);
    border-top: 0;
    border-bottom: 0;
    border-radius: 999px;
  }

  &::before {
    left: 13%;
  }

  &::after {
    right: 13%;
  }
`;

const FootballShape = styled.div`
  position: absolute;
  left: 17%;
  right: 17%;
  top: 25%;
  bottom: 25%;
  border-radius: 999px / 70%;
  border: 2px solid rgba(255, 255, 255, 0.9);
  transform: rotate(-22deg);
  box-shadow: inset 0 0 10px rgba(0,0,0,0.28);

  &::before {
    content: '';
    position: absolute;
    left: 48%;
    top: 17%;
    bottom: 17%;
    width: 2px;
    background: rgba(255,255,255,0.95);
  }

  &::after {
    content: '';
    position: absolute;
    left: 34%;
    right: 34%;
    top: 50%;
    height: 2px;
    background: rgba(255,255,255,0.95);
    box-shadow:
      0 -6px 0 rgba(255,255,255,0.95),
      0 6px 0 rgba(255,255,255,0.95);
  }
`;
function getBackground(style) {
  const [a, b, c, d] = style.colors;

  switch (style.pattern) {
    case 'horizontal-stripes':
      return `repeating-linear-gradient(
        0deg,
        ${a} 0%,
        ${a} 16%,
        ${b} 16%,
        ${b} 32%
      )`;

    case 'vertical-stripes':
      return `repeating-linear-gradient(
        90deg,
        ${a} 0%,
        ${a} 16%,
        ${b} 16%,
        ${b} 32%,
        ${c || a} 32%,
        ${c || a} 48%
      )`;

    case 'vertical-stripes-clean':
      return `repeating-linear-gradient(
        90deg,
        ${a} 0%,
        ${a} 15%,
        ${b} 15%,
        ${b} 30%
      )`;

    case 'flu-stripes':
      return `repeating-linear-gradient(
        90deg,
        ${a} 0%,
        ${a} 18%,
        ${c} 18%,
        ${c} 26%,
        ${b} 26%,
        ${b} 44%,
        ${c} 44%,
        ${c} 52%
      )`;

    case 'gremio-stripes':
      return `repeating-linear-gradient(
        90deg,
        ${a} 0%,
        ${a} 16%,
        ${c} 16%,
        ${c} 24%,
        ${b} 24%,
        ${b} 40%,
        ${c} 40%,
        ${c} 48%
      )`;

    case 'diagonal':
      return `linear-gradient(
        135deg,
        ${a} 0%,
        ${a} 36%,
        ${b} 36%,
        ${b} 64%,
        ${a} 64%,
        ${a} 100%
      )`;

    case 'furacao-diagonal':
      return `repeating-linear-gradient(
        135deg,
        ${a} 0%,
        ${a} 24%,
        ${c} 24%,
        ${c} 29%,
        ${b} 29%,
        ${b} 53%,
        ${c} 53%,
        ${c} 58%
      )`;

    case 'half-horizontal':
      return `linear-gradient(
        180deg,
        ${a} 0%,
        ${a} 50%,
        ${b} 50%,
        ${b} 100%
      )`;

    case 'horizontal-band':
      return `linear-gradient(
        180deg,
        ${a} 0%,
        ${a} 38%,
        ${b} 38%,
        ${b} 62%,
        ${a} 62%,
        ${a} 100%
      )`;

    case 'bahia':
      return `linear-gradient(
        180deg,
        ${a} 0%,
        ${a} 36%,
        ${b} 36%,
        ${b} 50%,
        ${c} 50%,
        ${c} 66%,
        ${b} 66%,
        ${b} 78%,
        ${a} 78%,
        ${a} 100%
      )`;

    case 'coritiba':
      return `linear-gradient(
        180deg,
        ${b} 0%,
        ${b} 38%,
        ${a} 38%,
        ${a} 62%,
        ${b} 62%,
        ${b} 100%
      )`;

    case 'corinthians':
      return `
        linear-gradient(
          180deg,
          transparent 0%,
          transparent 42%,
          ${c} 42%,
          ${c} 58%,
          transparent 58%,
          transparent 100%
        ),
        repeating-linear-gradient(
          90deg,
          ${a} 0%,
          ${a} 15%,
          ${b} 15%,
          ${b} 30%
        )
      `;

    case 'bragantino':
      return `linear-gradient(
        180deg,
        ${b} 0%,
        ${b} 38%,
        ${c} 38%,
        ${c} 62%,
        ${b} 62%,
        ${b} 100%
      )`;

    case 'spfc-bars':
      return `linear-gradient(
        180deg,
        ${a} 0%,
        ${a} 32%,
        ${c} 32%,
        ${c} 38%,
        ${b} 38%,
        ${b} 58%,
        ${a} 58%,
        ${a} 64%,
        ${c} 64%,
        ${c} 84%,
        ${a} 84%,
        ${a} 100%
      )`;

    case 'mirassol':
      return `linear-gradient(
        180deg,
        ${a} 0%,
        ${a} 38%,
        ${b} 38%,
        ${b} 62%,
        ${a} 62%,
        ${a} 100%
      )`;

    case 'rings':
      return `radial-gradient(
        circle at center,
        ${b} 0%,
        ${b} 34%,
        ${a} 35%,
        ${a} 48%,
        ${b} 49%,
        ${b} 55%,
        ${a} 56%,
        ${a} 100%
      )`;

    case 'target':
      return `radial-gradient(
        circle at center,
        ${b} 0%,
        ${b} 32%,
        ${a} 33%,
        ${a} 100%
      )`;

    case 'star':
    case 'stars':

        case 'flag-brazil':
      return `
        radial-gradient(circle at center, ${c} 0%, ${c} 24%, ${d} 25%, ${d} 31%, transparent 32%),
        linear-gradient(135deg, transparent 22%, ${b} 22%, ${b} 50%, transparent 50%),
        linear-gradient(45deg, transparent 22%, ${b} 22%, ${b} 50%, transparent 50%),
        ${a}
      `;

    case 'flag-england':
      return `
        linear-gradient(90deg, transparent 0%, transparent 42%, ${b} 42%, ${b} 58%, transparent 58%, transparent 100%),
        linear-gradient(180deg, transparent 0%, transparent 42%, ${b} 42%, ${b} 58%, transparent 58%, transparent 100%),
        ${a}
      `;

    case 'flag-spain':
      return `linear-gradient(
        180deg,
        ${a} 0%,
        ${a} 28%,
        ${b} 28%,
        ${b} 72%,
        ${a} 72%,
        ${a} 100%
      )`;

    case 'flag-germany':
      return `linear-gradient(
        180deg,
        ${a} 0%,
        ${a} 33.33%,
        ${b} 33.33%,
        ${b} 66.66%,
        ${c} 66.66%,
        ${c} 100%
      )`;

    case 'flag-france':
      return `linear-gradient(
        90deg,
        ${a} 0%,
        ${a} 33.33%,
        ${b} 33.33%,
        ${b} 66.66%,
        ${c} 66.66%,
        ${c} 100%
      )`;

    case 'flag-netherlands':
      return `linear-gradient(
        180deg,
        ${a} 0%,
        ${a} 33.33%,
        ${b} 33.33%,
        ${b} 66.66%,
        ${c} 66.66%,
        ${c} 100%
      )`;

    case 'basketball':
      return `
        radial-gradient(circle at center, transparent 0%, transparent 48%, ${b} 49%, ${b} 54%, transparent 55%),
        linear-gradient(90deg, transparent 0%, transparent 46%, ${b} 47%, ${b} 53%, transparent 54%),
        linear-gradient(180deg, transparent 0%, transparent 46%, ${b} 47%, ${b} 53%, transparent 54%),
        ${a}
      `;

    case 'american-football':
      return `
        linear-gradient(90deg, transparent 0%, transparent 47%, ${b} 47%, ${b} 53%, transparent 53%, transparent 100%),
        repeating-linear-gradient(
          180deg,
          transparent 0%,
          transparent 12%,
          ${b} 12%,
          ${b} 17%,
          transparent 17%,
          transparent 29%
        ),
        ${a}
      `;
    case 'flag-brazil-premium':
  return `
    radial-gradient(circle at 30% 25%, rgba(255,255,255,0.16), transparent 32%),
    ${a}
  `;

    case 'basketball-premium':
  return `
    radial-gradient(circle at 28% 24%, rgba(255,255,255,0.20), transparent 32%),
    ${a}
  `;

    case 'american-football-premium':
  return `
    radial-gradient(circle at 30% 25%, rgba(255,255,255,0.10), transparent 32%),
    linear-gradient(180deg, ${a}, #0b1220)
  `;
    default:
      return a;
  }
}

export default function ClubBadge({ clube, size = 34 }) {
  const key = normalizeClubName(clube);

  const style = CLUB_STYLES[key] || {
    outer: '#1f2937',
    glow: '#3b82f6',
    pattern: 'target',
    colors: ['#1f2937', '#ffffff'],
    center: '#ffffff',
  };

  const bg = getBackground(style);

  return (
    <Wrap
      $size={size}
      $outer={style.outer}
      $glow={style.glow}
      title={clube}
      aria-label={`Símbolo de ${clube || 'clube'}`}
    >
      <Inner $bg={bg}>
        {style.pattern === 'star' && <Star $size={size} />}

        {style.pattern === 'stars' && (
          <StarsRing $size={size}>
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>★</span>
          </StarsRing>
        )}

        {style.center && <Center $color={style.center} />}
      </Inner>
    </Wrap>
  );

}

export function LeagueBadge({ liga, size = 28 }) {
  const key = normalizeLeagueName(liga);

  const style = LEAGUE_STYLES[key] || {
    outer: '#1f2937',
    glow: '#3b82f6',
    pattern: 'target',
    colors: ['#1f2937', '#ffffff'],
  };

  const bg = getBackground(style);

  return (
    <Wrap
      $size={size}
      $outer={style.outer}
      $glow={style.glow}
      title={liga}
      aria-label={`Símbolo de ${liga || 'liga'}`}
    >
      <Inner $bg={bg}>
        {style.pattern === 'flag-brazil-premium' && (
          <>
            <BrazilDiamond $color={style.colors[1]} />
            <BrazilBlueCircle $color={style.colors[2]} />
            <BrazilBand $color={style.colors[3]} />
          </>
        )}

        {style.pattern === 'basketball-premium' && (
          <BasketballSeams $color={style.colors[1]}>
            <div className="arc-left" />
            <div className="arc-right" />
            <div className="line-v" />
            <div className="line-h" />
          </BasketballSeams>
        )}

        {style.pattern === 'american-football-premium' && (
          <FootballBall
            $color={style.colors[1]}
            $laceColor={style.colors[2]}
          />
        )}
      </Inner>
    </Wrap>
  );
}