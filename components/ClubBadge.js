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