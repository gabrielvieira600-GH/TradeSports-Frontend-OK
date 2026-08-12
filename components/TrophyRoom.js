import { useId, useMemo, useState } from 'react';
import styled from 'styled-components';

const CORES_POSICAO = {
  1: { metal: '#f8d56b', sombra: '#b97713', brilho: '#fff2a8' },
  2: { metal: '#dce7f1', sombra: '#75879a', brilho: '#ffffff' },
  3: { metal: '#d99862', sombra: '#8a4d2b', brilho: '#ffd0a6' },
};

const CORES_CATEGORIA = {
  geral: { principal: '#38bdf8', secundaria: '#1d4ed8' },
  premium: { principal: '#c084fc', secundaria: '#7c3aed' },
  privado: { principal: '#34d399', secundaria: '#047857' },
};

const LABELS_FILTRO = {
  todos: 'Todos',
  temporada: 'Temporada',
  mes: 'Mensais',
  semana: 'Semanais',
};

function formatarData(data) {
  if (!data) return '';
  try {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function CategoriaMarca({ categoria, cor }) {
  if (categoria === 'premium') {
    return (
      <g>
        <path d="M56 44 67 55 56 68 45 55Z" fill={cor.principal} />
        <path d="m56 44 4 11-4 13-4-13Z" fill="rgba(255,255,255,.55)" />
      </g>
    );
  }

  if (categoria === 'privado') {
    return (
      <g fill="none" stroke={cor.principal} strokeWidth="3">
        <circle cx="48" cy="55" r="5" fill={cor.secundaria} />
        <circle cx="64" cy="49" r="5" fill={cor.secundaria} />
        <circle cx="63" cy="64" r="5" fill={cor.secundaria} />
        <path d="m52 53 7-2M52 58l7 4M64 54v5" />
      </g>
    );
  }

  return (
    <g fill="none" stroke={cor.principal} strokeWidth="2.5">
      <circle cx="56" cy="56" r="13" fill="rgba(15,23,42,.74)" />
      <path d="M43 56h26M56 43v26M48 45c5 6 5 16 0 22M64 45c-5 6-5 16 0 22" />
    </g>
  );
}

function DecoracaoPeriodo({ periodoTipo, metal }) {
  if (periodoTipo === 'temporada') {
    return (
      <g>
        <path
          d="M29 68c-11-6-15-16-15-27M83 68c11-6 15-16 15-27"
          fill="none"
          stroke={metal.brilho}
          strokeWidth="2.6"
          strokeLinecap="round"
          opacity=".78"
        />
        <path d="m45 22 5 5 6-10 6 10 6-5-2 14H47Z" fill={metal.brilho} />
        <circle cx="20" cy="47" r="2.4" fill={metal.brilho} />
        <circle cx="92" cy="47" r="2.4" fill={metal.brilho} />
      </g>
    );
  }

  if (periodoTipo === 'mes') {
    return (
      <g fill="none" stroke={metal.brilho} opacity=".8">
        <ellipse cx="56" cy="35" rx="28" ry="10" strokeWidth="2.5" transform="rotate(-12 56 35)" />
        <circle cx="81" cy="28" r="3" fill={metal.brilho} stroke="none" />
        <path d="M31 75h50M35 80h42" strokeWidth="2" strokeLinecap="round" />
      </g>
    );
  }

  return (
    <g stroke={metal.brilho} strokeWidth="2.4" strokeLinecap="round" opacity=".82">
      <path d="M56 14v8M39 18l4 7M73 18l-4 7M26 29l7 4M86 33l7-4" />
      <path d="M30 76h52" />
    </g>
  );
}

function CorpoTrofeu({ posicao, fill }) {
  if (posicao === 2) {
    return (
      <>
        <path d="M30 31h52l-7 35-19 12-19-12Z" fill={fill} />
        <path d="M30 38H18c0 17 8 24 19 25M82 38h12c0 17-8 24-19 25" fill="none" stroke={fill} strokeWidth="7" />
      </>
    );
  }

  if (posicao === 3) {
    return (
      <>
        <path d="M36 29h40l7 15-9 27-18 8-18-8-9-27Z" fill={fill} />
        <path d="M31 39H18l4 18 16 9M81 39h13l-4 18-16 9" fill="none" stroke={fill} strokeWidth="6" strokeLinejoin="round" />
      </>
    );
  }

  return (
    <>
      <path d="M32 28h48l-4 29c-2 13-9 20-20 20S38 70 36 57Z" fill={fill} />
      <path d="M35 36H18c0 19 7 28 21 28M77 36h17c0 19-7 28-21 28" fill="none" stroke={fill} strokeWidth="7" />
    </>
  );
}

export function TrophyArt({ trofeu, size = 126, muted = false }) {
  const reactId = useId();
  const id = `trofeu-${String(reactId).replace(/[:]/g, '')}`;
  const posicao = Number(trofeu?.posicao || 1);
  const metal = CORES_POSICAO[posicao] || CORES_POSICAO[1];
  const categoria = CORES_CATEGORIA[trofeu?.categoria] || CORES_CATEGORIA.geral;
  const periodoTipo = trofeu?.periodoTipo || 'semana';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 112 112"
      role="img"
      aria-label={trofeu?.titulo || 'Troféu ainda não conquistado'}
      style={{ filter: muted ? 'grayscale(1)' : 'none', opacity: muted ? 0.22 : 1 }}
    >
      <defs>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={metal.brilho} />
          <stop offset=".45" stopColor={metal.metal} />
          <stop offset="1" stopColor={metal.sombra} />
        </linearGradient>
        <linearGradient id={`${id}-base`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={categoria.secundaria} />
          <stop offset=".5" stopColor={categoria.principal} />
          <stop offset="1" stopColor={categoria.secundaria} />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-40%" y="-40%" width="180%" height="190%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor={categoria.principal} floodOpacity=".26" />
        </filter>
      </defs>

      <g filter={`url(#${id}-shadow)`}>
        <DecoracaoPeriodo periodoTipo={periodoTipo} metal={metal} />
        <CorpoTrofeu posicao={posicao} fill={`url(#${id}-metal)`} />
        <path d="M50 73h12v15H50z" fill={`url(#${id}-metal)`} />
        <path d="M35 87h42l7 12H28Z" fill={`url(#${id}-base)`} />
        <path d="M32 99h48v6H32z" rx="3" fill={metal.sombra} />
        <CategoriaMarca categoria={trofeu?.categoria || 'geral'} cor={categoria} />
        <circle cx="56" cy="56" r="18" fill="none" stroke="rgba(255,255,255,.34)" strokeWidth="1" />
        <text x="56" y="61" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="900" fontFamily="Arial, sans-serif">
          {posicao}º
        </text>
      </g>
    </svg>
  );
}

function CartaoTrofeu({ trofeu }) {
  const categoriaLabel =
    trofeu.categoria === 'premium'
      ? 'Premium'
      : trofeu.categoria === 'privado'
        ? 'Privado'
        : 'Geral';

  return (
    <TrophyCard $posicao={trofeu.posicao}>
      <ArtArea>
        <Glow $categoria={trofeu.categoria} />
        <TrophyArt trofeu={trofeu} />
        <PlaceBadge $posicao={trofeu.posicao}>{trofeu.posicao}º lugar</PlaceBadge>
      </ArtArea>
      <CardContent>
        <MetaLine>
          <CategoryTag $categoria={trofeu.categoria}>{categoriaLabel}</CategoryTag>
          <PeriodTag>{trofeu.periodoLabel}</PeriodTag>
        </MetaLine>
        <CardTitle>{trofeu.titulo}</CardTitle>
        <CardDescription>{trofeu.descricao}</CardDescription>
        {trofeu.rankingNome && <RankingName>Competição: {trofeu.rankingNome}</RankingName>}
        <EarnedDate>Conquistado em {formatarData(trofeu.concedidoEm)}</EarnedDate>
      </CardContent>
    </TrophyCard>
  );
}

function EmptyRoom() {
  return (
    <EmptyState>
      <GhostShelf aria-hidden="true">
        {[1, 2, 3].map((posicao) => (
          <TrophyArt
            key={posicao}
            size={100}
            muted
            trofeu={{ posicao, categoria: 'geral', periodoTipo: 'temporada' }}
          />
        ))}
      </GhostShelf>
      <EmptyTitle>A primeira conquista ainda está por vir</EmptyTitle>
      <EmptyText>
        Os pódios semanais, mensais e da temporada aparecerão aqui assim que forem oficializados.
      </EmptyText>
    </EmptyState>
  );
}

export default function TrophyRoom({ trofeus = [], resumo = {}, carregando = false, erro = '' }) {
  const [filtro, setFiltro] = useState('todos');
  const lista = Array.isArray(trofeus) ? trofeus : [];
  const filtrados = useMemo(
    () => (filtro === 'todos' ? lista : lista.filter((item) => item.periodoTipo === filtro)),
    [filtro, lista]
  );

  return (
    <Room id="sala-de-trofeus">
      <RoomHeader>
        <div>
          <Eyebrow>Sala de Troféus</Eyebrow>
          <RoomTitle>Uma estante para cada conquista</RoomTitle>
          <RoomSubtitle>
            Pódios oficializados nos rankings Geral, Premium e Privado.
          </RoomSubtitle>
        </div>
        <TotalSeal>
          <strong>{Number(resumo.total || lista.length)}</strong>
          <span>{Number(resumo.total || lista.length) === 1 ? 'troféu' : 'troféus'}</span>
        </TotalSeal>
      </RoomHeader>

      <StatsRow>
        <PositionStat $posicao={1}><span>Ouro</span><strong>{Number(resumo.primeiros || 0)}</strong></PositionStat>
        <PositionStat $posicao={2}><span>Prata</span><strong>{Number(resumo.segundos || 0)}</strong></PositionStat>
        <PositionStat $posicao={3}><span>Bronze</span><strong>{Number(resumo.terceiros || 0)}</strong></PositionStat>
      </StatsRow>

      <FilterBar aria-label="Filtrar troféus por período">
        {Object.entries(LABELS_FILTRO).map(([valor, label]) => (
          <FilterButton
            key={valor}
            type="button"
            $ativo={filtro === valor}
            onClick={() => setFiltro(valor)}
          >
            {label}
          </FilterButton>
        ))}
      </FilterBar>

      {carregando ? (
        <LoadingGrid>{[1, 2, 3].map((item) => <LoadingCard key={item} />)}</LoadingGrid>
      ) : erro ? (
        <ErrorState>{erro}</ErrorState>
      ) : lista.length === 0 ? (
        <EmptyRoom />
      ) : filtrados.length === 0 ? (
        <ErrorState>Nenhum troféu conquistado neste período.</ErrorState>
      ) : (
        <TrophyGrid>
          {filtrados.map((trofeu) => <CartaoTrofeu key={trofeu.id} trofeu={trofeu} />)}
        </TrophyGrid>
      )}
    </Room>
  );
}

const Room = styled.section`
  position: relative;
  overflow: hidden;
  margin: 18px 0;
  padding: 24px;
  border: 1px solid rgba(250, 204, 21, 0.2);
  border-radius: 24px;
  background:
    radial-gradient(circle at 92% 0%, rgba(250, 204, 21, 0.12), transparent 30%),
    radial-gradient(circle at 0% 100%, rgba(37, 99, 235, 0.13), transparent 34%),
    linear-gradient(145deg, rgba(15, 23, 42, 0.97), rgba(8, 15, 29, 0.95));
  box-shadow: 0 24px 54px rgba(0, 0, 0, 0.2);

  @media (max-width: 640px) {
    margin: 12px 0;
    padding: 17px 14px;
    border-radius: 19px;
  }
`;

const RoomHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;

  @media (max-width: 560px) { gap: 12px; }
`;

const Eyebrow = styled.div`
  margin-bottom: 6px;
  color: #facc15;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.15em;
  text-transform: uppercase;
`;

const RoomTitle = styled.h2`
  margin: 0;
  color: #f8fafc;
  font-size: clamp(1.25rem, 2vw, 1.72rem);
  line-height: 1.15;
`;

const RoomSubtitle = styled.p`
  margin: 8px 0 0;
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.5;

  @media (max-width: 560px) { display: none; }
`;

const TotalSeal = styled.div`
  width: 72px;
  min-width: 72px;
  height: 72px;
  border: 1px solid rgba(250, 204, 21, 0.35);
  border-radius: 50%;
  background: rgba(250, 204, 21, 0.08);
  display: grid;
  place-content: center;
  text-align: center;

  strong { color: #fde68a; font-size: 1.3rem; line-height: 1; }
  span { margin-top: 4px; color: #cbd5e1; font-size: 0.65rem; font-weight: 800; }

  @media (max-width: 560px) {
    width: 58px; min-width: 58px; height: 58px;
    strong { font-size: 1.05rem; }
  }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 20px 0 14px;
`;

const PositionStat = styled.div`
  padding: 11px 13px;
  border: 1px solid ${({ $posicao }) =>
    $posicao === 1 ? 'rgba(250,204,21,.22)' : $posicao === 2 ? 'rgba(203,213,225,.18)' : 'rgba(217,119,6,.19)'};
  border-radius: 13px;
  background: rgba(255,255,255,.025);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  span { color: #94a3b8; font-size: .78rem; font-weight: 800; }
  strong { color: ${({ $posicao }) => $posicao === 1 ? '#fde68a' : $posicao === 2 ? '#e2e8f0' : '#fdba74'}; font-size: 1.02rem; }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const FilterButton = styled.button`
  min-height: 38px;
  padding: 8px 14px;
  border: 1px solid ${({ $ativo }) => $ativo ? 'rgba(56,189,248,.46)' : 'rgba(148,163,184,.14)'};
  border-radius: 999px;
  background: ${({ $ativo }) => $ativo ? 'rgba(14,165,233,.15)' : 'rgba(255,255,255,.025)'};
  color: ${({ $ativo }) => $ativo ? '#e0f2fe' : '#94a3b8'};
  font-weight: 850;
  white-space: nowrap;
  cursor: pointer;
`;

const TrophyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 16px;

  @media (max-width: 1050px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 640px) { grid-template-columns: 1fr; gap: 11px; }
`;

const TrophyCard = styled.article`
  min-width: 0;
  overflow: hidden;
  border: 1px solid ${({ $posicao }) => $posicao === 1 ? 'rgba(250,204,21,.24)' : 'rgba(148,163,184,.14)'};
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(30,41,59,.74), rgba(15,23,42,.82));
  transition: transform .2s ease, border-color .2s ease;
  &:hover { transform: translateY(-3px); border-color: rgba(125,211,252,.36); }

  @media (max-width: 640px) {
    display: grid;
    grid-template-columns: 122px minmax(0, 1fr);
    border-radius: 16px;
  }
`;

const ArtArea = styled.div`
  position: relative;
  min-height: 164px;
  display: grid;
  place-items: center;
  background: radial-gradient(circle at 50% 46%, rgba(255,255,255,.07), transparent 48%);

  @media (max-width: 640px) {
    min-height: 100%;
    svg { width: 105px; height: 105px; }
  }
`;

const Glow = styled.div`
  position: absolute;
  width: 82px;
  height: 82px;
  border-radius: 50%;
  background: ${({ $categoria }) =>
    $categoria === 'premium' ? 'rgba(168,85,247,.18)' : $categoria === 'privado' ? 'rgba(16,185,129,.16)' : 'rgba(14,165,233,.18)'};
  filter: blur(19px);
`;

const PlaceBadge = styled.span`
  position: absolute;
  right: 11px;
  top: 11px;
  padding: 5px 8px;
  border-radius: 999px;
  background: ${({ $posicao }) => $posicao === 1 ? 'rgba(250,204,21,.13)' : $posicao === 2 ? 'rgba(203,213,225,.1)' : 'rgba(217,119,6,.12)'};
  color: ${({ $posicao }) => $posicao === 1 ? '#fde68a' : $posicao === 2 ? '#e2e8f0' : '#fdba74'};
  font-size: .66rem;
  font-weight: 900;
`;

const CardContent = styled.div`
  padding: 0 16px 17px;
  @media (max-width: 640px) { padding: 14px 12px 14px 0; align-self: center; }
`;

const MetaLine = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

const CategoryTag = styled.span`
  padding: 4px 7px;
  border-radius: 7px;
  background: ${({ $categoria }) => $categoria === 'premium' ? 'rgba(168,85,247,.14)' : $categoria === 'privado' ? 'rgba(16,185,129,.13)' : 'rgba(14,165,233,.13)'};
  color: ${({ $categoria }) => $categoria === 'premium' ? '#d8b4fe' : $categoria === 'privado' ? '#6ee7b7' : '#7dd3fc'};
  font-size: .65rem;
  font-weight: 900;
  text-transform: uppercase;
`;

const PeriodTag = styled.span`
  overflow: hidden;
  color: #64748b;
  font-size: .68rem;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CardTitle = styled.h3`
  margin: 10px 0 6px;
  color: #f8fafc;
  font-size: .96rem;
  line-height: 1.35;
`;

const CardDescription = styled.p`
  margin: 0;
  color: #94a3b8;
  font-size: .78rem;
  line-height: 1.48;
`;

const RankingName = styled.div`
  margin-top: 8px;
  color: #cbd5e1;
  font-size: .71rem;
  font-weight: 800;
`;

const EarnedDate = styled.div`
  margin-top: 10px;
  color: #64748b;
  font-size: .67rem;
`;

const EmptyState = styled.div`
  margin-top: 16px;
  padding: 25px 18px 22px;
  border: 1px dashed rgba(148,163,184,.17);
  border-radius: 18px;
  background: rgba(255,255,255,.018);
  text-align: center;
`;

const GhostShelf = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 4px;
  margin-bottom: 4px;
`;

const EmptyTitle = styled.h3`
  margin: 4px 0 6px;
  color: #e2e8f0;
  font-size: 1rem;
`;

const EmptyText = styled.p`
  max-width: 520px;
  margin: 0 auto;
  color: #64748b;
  font-size: .82rem;
  line-height: 1.5;
`;

const ErrorState = styled.div`
  margin-top: 16px;
  padding: 24px;
  border: 1px dashed rgba(148,163,184,.18);
  border-radius: 16px;
  color: #94a3b8;
  text-align: center;
`;

const LoadingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 16px;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const LoadingCard = styled.div`
  height: 310px;
  border-radius: 18px;
  background: linear-gradient(100deg, rgba(255,255,255,.025) 20%, rgba(255,255,255,.07) 45%, rgba(255,255,255,.025) 70%);
  background-size: 220% 100%;
  animation: trophyPulse 1.5s ease infinite;
  @keyframes trophyPulse { to { background-position: -220% 0; } }
  @media (max-width: 640px) { height: 160px; }
`;
