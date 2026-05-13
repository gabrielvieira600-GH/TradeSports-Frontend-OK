// components/ClubBadge.js
import React from 'react';
import styled from 'styled-components';

const CLUB_STYLES = {
  Flamengo: {
    outer: '#050505',
    glow: '#ff1f2d',
    pattern: 'horizontal-stripes',
    colors: ['#f31222', '#050505'],
    center: null,
  },

  Palmeiras: {
    outer: '#006b3f',
    glow: '#00c46a',
    pattern: 'rings',
    colors: ['#006b3f', '#ffffff'],
    center: '#ffffff',
  },

  'São Paulo': {
    outer: '#e01822',
    glow: '#ff3340',
    pattern: 'spfc-bars',
    colors: ['#ffffff', '#e01822', '#050505'],
    center: null,
  },

  Santos: {
    outer: '#050505',
    glow: '#ffffff',
    pattern: 'vertical-stripes',
    colors: ['#050505', '#ffffff'],
    center: '#ffffff',
  },

  Vasco: {
    outer: '#050505',
    glow: '#ffffff',
    pattern: 'diagonal',
    colors: ['#050505', '#ffffff'],
    center: '#e01822',
  },

  Botafogo: {
    outer: '#050505',
    glow: '#ffffff',
    pattern: 'star',
    colors: ['#050505', '#ffffff'],
    center: null,
  },

  Fluminense: {
    outer: '#00613a',
    glow: '#8b1232',
    pattern: 'vertical-stripes',
    colors: ['#00613a', '#8b1232', '#ffffff'],
    center: null,
  },

  Grêmio: {
    outer: '#00a3e0',
    glow: '#00bfff',
    pattern: 'vertical-stripes',
    colors: ['#00a3e0', '#050505', '#ffffff'],
    center: null,
  },

  Internacional: {
    outer: '#e30613',
    glow: '#ff3340',
    pattern: 'target',
    colors: ['#e30613', '#ffffff'],
    center: '#ffffff',
  },

  Cruzeiro: {
    outer: '#003da5',
    glow: '#2f80ff',
    pattern: 'stars',
    colors: ['#003da5', '#ffffff'],
    center: '#ffffff',
  },

  Bahia: {
    outer: '#0057b8',
    glow: '#e30613',
    pattern: 'bahia',
    colors: ['#0057b8', '#ffffff', '#e30613'],
    center: '#ffffff',
  },

  Coritiba: {
    outer: '#006b3f',
    glow: '#00c46a',
    pattern: 'coritiba',
    colors: ['#006b3f', '#ffffff'],
    center: '#ffffff',
  },

  Vitória: {
    outer: '#050505',
    glow: '#e30613',
    pattern: 'half-horizontal',
    colors: ['#e30613', '#050505'],
    center: '#ffffff',
  },

  'Atlético Mineiro': {
    outer: '#050505',
    glow: '#ffffff',
    pattern: 'vertical-stripes',
    colors: ['#050505', '#ffffff'],
    center: null,
  },

  Corinthians: {
    outer: '#050505',
    glow: '#e30613',
    pattern: 'corinthians',
    colors: ['#050505', '#ffffff', '#e30613'],
    center: '#ffffff',
  },

  Mirassol: {
    outer: '#006b3f',
    glow: '#ffd400',
    pattern: 'half-horizontal',
    colors: ['#ffd400', '#006b3f'],
    center: '#ffd400',
  },

  Remo: {
    outer: '#001f4e',
    glow: '#ffffff',
    pattern: 'horizontal-band',
    colors: ['#001f4e', '#ffffff'],
    center: '#001f4e',
  },

  Chapecoense: {
    outer: '#007a3d',
    glow: '#ffffff',
    pattern: 'horizontal-band',
    colors: ['#007a3d', '#ffffff'],
    center: '#ffffff',
  },

  Bragantino: {
    outer: '#001f4e',
    glow: '#e30613',
    pattern: 'bragantino',
    colors: ['#001f4e', '#ffffff', '#e30613', '#ffd400'],
    center: '#ffd400',
  },
};

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
    0 0 0 1px rgba(255,255,255,0.12),
    0 0 10px ${({ $glow }) => `${$glow}55`},
    inset 0 0 10px rgba(255,255,255,0.16);
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
    inset 0 0 8px rgba(255,255,255,0.2);
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

    case 'diagonal':
      return `linear-gradient(
        135deg,
        ${a} 0%,
        ${a} 37%,
        ${b} 37%,
        ${b} 63%,
        ${a} 63%,
        ${a} 100%
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
        linear-gradient(90deg, transparent 0%, transparent 100%),
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
        ${b} 40%,
        ${c} 40%,
        ${c} 60%,
        ${b} 60%,
        ${b} 100%
      )`;

    case 'rings':
    case 'target':
    case 'star':
    case 'stars':
    default:
      return a;
  }
}

export default function ClubBadge({ clube, size = 34 }) {
  const style = CLUB_STYLES[clube] || {
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
      aria-label={`Símbolo de ${clube}`}
    >
      <Inner $bg={bg}>
        {style.pattern === 'star' && <Star $size={size} />}
        {style.center && <Center $color={style.center} />}
      </Inner>
    </Wrap>
  );
}