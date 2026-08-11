import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import {
  FiActivity,
  FiArrowLeft,
  FiBarChart2,
  FiClock,
  FiInfo,
  FiRefreshCw,
  FiStar,
  FiTrendingDown,
  FiTrendingUp,
  FiZap,
} from 'react-icons/fi';

import NegociacaoModal from '../../components/NegociacaoModal';
import ClubBadge from '../../components/ClubBadge';
import mercados from '../../Data/mercados';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const RANGES = [
  { key: '24H', label: '24h' },
  { key: '7D', label: '7 dias' },
  { key: '1M', label: '1 mês' },
  { key: '3M', label: '3 meses' },
  { key: 'ALL', label: 'Tudo' },
];

function numero(valor, fallback = 0) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : fallback;
}

function formatTrade(valor) {
  return `T$ ${numero(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPercent(valor) {
  const n = numero(valor);
  return `${n > 0 ? '+' : ''}${n.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

function formatInteger(valor) {
  return Math.max(0, numero(valor)).toLocaleString('pt-BR', {
    maximumFractionDigits: 0,
  });
}

function formatDate(valor, incluiHora = false) {
  const data = valor ? new Date(valor) : null;
  if (!data || Number.isNaN(data.getTime())) return '—';

  return data.toLocaleString('pt-BR', incluiHora
    ? { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short' });
}

function normalizePoints(pontos) {
  if (!Array.isArray(pontos)) return [];

  return pontos
    .map((ponto, index) => {
      const price = Number(
        ponto?.price ?? ponto?.preco ?? ponto?.precoUnitario ?? ponto?.value ?? ponto?.y
      );
      const timestamp =
        ponto?.timestamp ?? ponto?.data ?? ponto?.criadoEm ?? ponto?.createdAt ?? ponto?.x;
      const date = timestamp ? new Date(timestamp) : null;

      if (!Number.isFinite(price) || price <= 0) return null;

      return {
        price,
        volume: Math.max(0, numero(ponto?.volume ?? ponto?.quantidade)),
        timestamp:
          date && !Number.isNaN(date.getTime())
            ? date.toISOString()
            : new Date(index).toISOString(),
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

function PriceChart({ pontos }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const width = 920;
  const height = 318;
  const padding = { top: 24, right: 24, bottom: 46, left: 72 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const points = useMemo(() => normalizePoints(pontos), [pontos]);

  const chart = useMemo(() => {
    if (!points.length) return null;

    const values = points.map((point) => point.price);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const spread = rawMax - rawMin;
    const yPadding = spread > 0 ? spread * 0.16 : Math.max(rawMax * 0.025, 0.05);
    const minY = Math.max(0, rawMin - yPadding);
    const maxY = rawMax + yPadding;
    const x = (index) =>
      points.length === 1
        ? padding.left + chartWidth / 2
        : padding.left + (index * chartWidth) / (points.length - 1);
    const y = (value) =>
      padding.top + ((maxY - value) / Math.max(maxY - minY, 0.01)) * chartHeight;
    const coordinates = points.map((point, index) => ({
      ...point,
      x: x(index),
      y: y(point.price),
    }));
    const line = coordinates
      .map((point, index) => `${index ? 'L' : 'M'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(' ');
    const area = points.length > 1
      ? `${line} L ${coordinates[coordinates.length - 1].x} ${padding.top + chartHeight} L ${coordinates[0].x} ${padding.top + chartHeight} Z`
      : '';

    return {
      coordinates,
      line,
      area,
      minY,
      maxY,
      positive: points[points.length - 1].price >= points[0].price,
    };
  }, [points, chartHeight, chartWidth, padding.left, padding.top]);

  if (!chart) {
    return (
      <ChartEmpty>
        <EmptyChartIcon><FiActivity /></EmptyChartIcon>
        <strong>Aguardando o primeiro negócio</strong>
        <span>Assim que houver uma execução, a evolução do preço aparecerá aqui.</span>
      </ChartEmpty>
    );
  }

  const active = activeIndex == null ? null : chart.coordinates[activeIndex];
  const lineColor = chart.positive ? '#24dc94' : '#fb7185';
  const gridValues = Array.from({ length: 5 }, (_, index) =>
    chart.maxY - ((chart.maxY - chart.minY) * index) / 4
  );
  const labelIndexes = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])];

  function handlePointer(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const cursorX = ((event.clientX - rect.left) / rect.width) * width;
    const nearest = chart.coordinates.reduce((best, point, index) =>
      Math.abs(point.x - cursorX) < Math.abs(chart.coordinates[best].x - cursorX)
        ? index
        : best, 0);
    setActiveIndex(nearest);
  }

  return (
    <ChartViewport>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Evolução do preço com ${points.length} negociações`}
        onPointerMove={handlePointer}
        onPointerDown={handlePointer}
        onPointerLeave={() => setActiveIndex(null)}
      >
        <defs>
          <linearGradient id="club-price-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.28" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
          <filter id="club-price-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {gridValues.map((value, index) => {
          const y = padding.top + (chartHeight * index) / 4;
          return (
            <g key={value}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="rgba(148, 163, 184, 0.12)"
                strokeDasharray="4 7"
              />
              <text x={padding.left - 12} y={y + 4} textAnchor="end" fill="#718399" fontSize="12">
                {formatTrade(value)}
              </text>
            </g>
          );
        })}

        {labelIndexes.map((index) => (
          <text
            key={index}
            x={chart.coordinates[index].x}
            y={height - 13}
            textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}
            fill="#718399"
            fontSize="12"
          >
            {formatDate(points[index].timestamp)}
          </text>
        ))}

        {chart.area && <path d={chart.area} fill="url(#club-price-area)" />}
        {points.length === 1 ? (
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={chart.coordinates[0].y}
            y2={chart.coordinates[0].y}
            stroke={lineColor}
            strokeWidth="3"
            strokeDasharray="8 7"
          />
        ) : (
          <path
            d={chart.line}
            fill="none"
            stroke={lineColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#club-price-glow)"
          />
        )}

        {active && (
          <g pointerEvents="none">
            <line
              x1={active.x}
              x2={active.x}
              y1={padding.top}
              y2={padding.top + chartHeight}
              stroke="rgba(226, 232, 240, 0.36)"
              strokeDasharray="4 5"
            />
            <circle cx={active.x} cy={active.y} r="10" fill={lineColor} opacity="0.18" />
            <circle cx={active.x} cy={active.y} r="4.5" fill="#071422" stroke={lineColor} strokeWidth="3" />
          </g>
        )}
      </svg>

      {active && (
        <ChartTooltip
          $left={`${Math.min(84, Math.max(16, (active.x / width) * 100))}%`}
          $top={`${Math.min(78, Math.max(10, (active.y / height) * 100))}%`}
        >
          <strong>{formatTrade(active.price)}</strong>
          <span>{formatDate(active.timestamp, true)}</span>
          {active.volume > 0 && <small>{formatInteger(active.volume)} cotas</small>}
        </ChartTooltip>
      )}
    </ChartViewport>
  );
}

function StatCard({ icon, label, value, detail, tone = 'neutral' }) {
  return (
    <Stat $tone={tone}>
      <StatIcon $tone={tone}>{icon}</StatIcon>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {detail && <small>{detail}</small>}
      </div>
    </Stat>
  );
}

export default function ClubeDetalhe() {
  const router = useRouter();
  const { id } = router.query;
  const [clube, setClube] = useState(null);
  const [range, setRange] = useState('7D');
  const [hist, setHist] = useState(null);
  const [loadingClub, setLoadingClub] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [clubError, setClubError] = useState('');
  const [historyError, setHistoryError] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [watchlist, setWatchlist] = useState({ clubes: [], ligas: [] });
  const [favoriting, setFavoriting] = useState(false);

  const carregarClube = useCallback(async (signal) => {
    if (!id || !API_BASE) return;
    setLoadingClub(true);
    setClubError('');

    try {
      const { data } = await axios.get(`${API_BASE}/clube/${id}`, { signal });
      const item = data?.data || data;

      if (!item) throw new Error('CLUBE_VAZIO');

      setClube({
        ...item,
        id: item.id ?? item.legacyId ?? id,
        legacyId: item.legacyId ?? item.id ?? id,
        nome: item.nome || 'Clube',
        preco: numero(item.preco),
        precoAtual:
          item.precoAtual != null ? numero(item.precoAtual) : numero(item.preco),
        cotasDisponiveis: numero(item.cotasDisponiveis),
        cotasEmitidas: numero(item.cotasEmitidas),
        ipoEncerrado: Boolean(item.ipoEncerrado),
        metadata: item.metadata || {},
      });
    } catch (error) {
      if (error?.code === 'ERR_CANCELED') return;
      setClubError(
        error?.response?.data?.erro || 'Não foi possível carregar os dados deste clube.'
      );
      setClube(null);
    } finally {
      if (!signal?.aborted) setLoadingClub(false);
    }
  }, [id]);

  const carregarHistorico = useCallback(async (signal) => {
    if (!id || !API_BASE) return;
    setLoadingHistory(true);
    setHistoryError('');

    try {
      const { data } = await axios.get(`${API_BASE}/clube/${id}/historico-precos`, {
        params: { range },
        signal,
      });
      setHist(data || null);
    } catch (error) {
      if (error?.code === 'ERR_CANCELED') return;
      setHistoryError(
        error?.response?.data?.erro || 'Não foi possível carregar o histórico de preços.'
      );
      setHist(null);
    } finally {
      if (!signal?.aborted) setLoadingHistory(false);
    }
  }, [id, range]);

  useEffect(() => {
    if (!router.isReady) return undefined;
    const controller = new AbortController();
    carregarClube(controller.signal);
    return () => controller.abort();
  }, [router.isReady, carregarClube]);

  useEffect(() => {
    if (!router.isReady) return undefined;
    const controller = new AbortController();
    carregarHistorico(controller.signal);
    return () => controller.abort();
  }, [router.isReady, carregarHistorico]);

  useEffect(() => {
    if (!router.isReady || typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token || !API_BASE) return;

    axios.get(`${API_BASE}/watchlist`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(({ data }) => {
      setWatchlist(data?.watchlist || { clubes: [], ligas: [] });
    }).catch(() => {});
  }, [router.isReady]);

  const pontos = useMemo(() => normalizePoints(hist?.pontos), [hist]);
  const resumo = useMemo(() => {
    const primeiro = pontos[0];
    const ultimo = pontos[pontos.length - 1];
    const variacaoAbs = hist?.resumo?.variacaoAbs ??
      (primeiro && ultimo ? ultimo.price - primeiro.price : 0);
    const variacaoPct = hist?.resumo?.variacaoPct ??
      (primeiro?.price ? (variacaoAbs / primeiro.price) * 100 : 0);

    return {
      ...(hist?.resumo || {}),
      variacaoAbs: numero(variacaoAbs),
      variacaoPct: numero(variacaoPct),
      min: hist?.resumo?.min ?? (pontos.length ? Math.min(...pontos.map((p) => p.price)) : null),
      max: hist?.resumo?.max ?? (pontos.length ? Math.max(...pontos.map((p) => p.price)) : null),
      tradesCount: numero(hist?.resumo?.tradesCount, pontos.length),
      volume: numero(
        hist?.resumo?.volume,
        pontos.reduce((total, ponto) => total + ponto.volume, 0)
      ),
    };
  }, [hist, pontos]);

  const currentPrice = numero(hist?.precoMercado, clube?.precoAtual ?? clube?.preco);
  const theoreticalPrice = numero(hist?.ipoLiquidacao, clube?.preco);
  const positive = resumo.variacaoAbs >= 0;
  const ligaId = clube?.metadata?.ligaId || clube?.ligaId || 'brasileirao-a';
  const liga = mercados[ligaId] || mercados['brasileirao-a'];
  const marketLabel = clube?.ipoEncerrado ? 'Mercado secundário' : 'Oferta inicial';
  const favorito = (watchlist?.clubes || []).some((item) =>
    String(item.id ?? item.entityId) === String(clube?.id ?? clube?.legacyId)
  );

  async function toggleClubeFavorito() {
    if (favoriting || !clube) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      router.push('/login');
      return;
    }

    setFavoriting(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/watchlist/toggle`,
        {
          entityType: 'clube',
          entityId: clube.id ?? clube.legacyId,
          nome: clube.nome,
          ligaId,
          ligaNome: clube.metadata?.ligaNome || liga.nome,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWatchlist(data?.watchlist || { clubes: [], ligas: [] });
      window.dispatchEvent(new Event('watchlist-updated'));
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (error) {
      console.error('Erro ao favoritar clube:', error?.response?.data || error.message);
    } finally {
      setFavoriting(false);
    }
  }

  if (loadingClub) {
    return (
      <Page>
        <LoadingState>
          <Spinner />
          <strong>Carregando mercado...</strong>
          <span>Preparando cotação, disponibilidade e histórico.</span>
        </LoadingState>
      </Page>
    );
  }

  if (clubError || !clube) {
    return (
      <Page>
        <ErrorState>
          <FiActivity />
          <h1>Não foi possível abrir este clube</h1>
          <p>{clubError || 'O clube solicitado não foi encontrado.'}</p>
          <ErrorActions>
            <BackLink href={liga.rota}><FiArrowLeft /> Voltar para a classificação</BackLink>
            <RetryButton type="button" onClick={() => carregarClube()}>
              <FiRefreshCw /> Tentar novamente
            </RetryButton>
          </ErrorActions>
        </ErrorState>
      </Page>
    );
  }

  return (
    <Page>
      <Breadcrumb href={liga.rota}>
        <FiArrowLeft /> {liga.nome}
      </Breadcrumb>

      <Hero>
        <HeroGlow />
        <ClubIdentity>
          <BadgeFrame>
            <ClubBadge clube={clube} liga={ligaId} size={78} />
          </BadgeFrame>
          <IdentityCopy>
            <Eyebrow><FiZap /> Mercado TradeSports</Eyebrow>
            <ClubTitleRow>
              <ClubTitle>{clube.nome}</ClubTitle>
              <FavoriteButton
                type="button"
                onClick={toggleClubeFavorito}
                $active={favorito}
                disabled={favoriting}
                aria-label={favorito ? 'Remover clube dos favoritos' : 'Adicionar clube aos favoritos'}
                title={favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <FiStar />
              </FavoriteButton>
            </ClubTitleRow>
            <MetaLine>
              <span>{liga.nome}</span>
              <i />
              <MarketStatus $active><b /> {marketLabel}</MarketStatus>
            </MetaLine>
          </IdentityCopy>
        </ClubIdentity>

        <QuoteBlock>
          <QuoteLabel>Preço de mercado</QuoteLabel>
          <Quote>{formatTrade(currentPrice)}</Quote>
          <Variation $positive={positive}>
            {positive ? <FiTrendingUp /> : <FiTrendingDown />}
            {resumo.tradesCount > 0
              ? `${formatPercent(resumo.variacaoPct)} no período`
              : 'Sem variação no período'}
          </Variation>
        </QuoteBlock>

        <TradeButton type="button" onClick={() => setModalAberto(true)}>
          Negociar agora <FiTrendingUp />
        </TradeButton>
      </Hero>

      <StatsGrid>
        <StatCard
          icon={<FiBarChart2 />}
          label="Preço de referência"
          value={formatTrade(theoreticalPrice)}
          detail="Definido pela posição esportiva"
          tone="gold"
        />
        <StatCard
          icon={positive ? <FiTrendingUp /> : <FiTrendingDown />}
          label="Variação"
          value={resumo.tradesCount ? formatTrade(resumo.variacaoAbs) : '—'}
          detail={resumo.tradesCount ? formatPercent(resumo.variacaoPct) : 'Sem negócios no período'}
          tone={resumo.tradesCount ? (positive ? 'positive' : 'negative') : 'neutral'}
        />
        <StatCard
          icon={<FiActivity />}
          label="Negócios"
          value={formatInteger(resumo.tradesCount)}
          detail={`${formatInteger(resumo.volume)} cotas movimentadas`}
        />
        <StatCard
          icon={<FiClock />}
          label="Disponibilidade"
          value={formatInteger(clube.cotasDisponiveis)}
          detail={`${formatInteger(clube.cotasEmitidas)} cotas em circulação`}
        />
      </StatsGrid>

      <ContentGrid>
        <ChartCard>
          <PanelHeader>
            <div>
              <PanelEyebrow>Evolução de mercado</PanelEyebrow>
              <PanelTitle>Histórico de preços</PanelTitle>
              <PanelSubtitle>Valores efetivamente executados entre compradores e vendedores.</PanelSubtitle>
            </div>
            <RangeTabs aria-label="Período do histórico">
              {RANGES.map((item) => (
                <RangeButton
                  key={item.key}
                  type="button"
                  $active={range === item.key}
                  onClick={() => setRange(item.key)}
                >
                  {item.label}
                </RangeButton>
              ))}
            </RangeTabs>
          </PanelHeader>

          <ChartBody>
            {loadingHistory ? (
              <ChartLoading><Spinner /><span>Atualizando histórico...</span></ChartLoading>
            ) : historyError ? (
              <ChartError>
                <FiActivity />
                <div><strong>Histórico indisponível</strong><span>{historyError}</span></div>
                <IconButton type="button" onClick={() => carregarHistorico()} aria-label="Tentar novamente">
                  <FiRefreshCw />
                </IconButton>
              </ChartError>
            ) : (
              <PriceChart pontos={pontos} />
            )}
          </ChartBody>

          <ChartFooter>
            <FooterMetric>
              <span>Mínima</span>
              <strong>{resumo.min == null ? '—' : formatTrade(resumo.min)}</strong>
            </FooterMetric>
            <FooterMetric>
              <span>Máxima</span>
              <strong>{resumo.max == null ? '—' : formatTrade(resumo.max)}</strong>
            </FooterMetric>
            <FooterMetric>
              <span>Primeiro registro</span>
              <strong>{formatDate(resumo.desde, true)}</strong>
            </FooterMetric>
            <FooterMetric>
              <span>Último registro</span>
              <strong>{formatDate(resumo.ate, true)}</strong>
            </FooterMetric>
          </ChartFooter>
        </ChartCard>

        <SideColumn>
          <MarketCard>
            <CardTop>
              <div><PanelEyebrow>Visão geral</PanelEyebrow><PanelTitle>Dados do ativo</PanelTitle></div>
              <InfoIcon title="Informações atualizadas conforme as operações e a classificação."><FiInfo /></InfoIcon>
            </CardTop>
            <DataList>
              <DataRow><span>Cotação atual</span><strong>{formatTrade(currentPrice)}</strong></DataRow>
              <DataRow><span>Preço de referência</span><strong>{formatTrade(theoreticalPrice)}</strong></DataRow>
              <DataRow><span>Cotas emitidas</span><strong>{formatInteger(clube.cotasEmitidas)}</strong></DataRow>
              <DataRow><span>Cotas disponíveis</span><strong>{formatInteger(clube.cotasDisponiveis)}</strong></DataRow>
              {clube.posicao != null && (
                <DataRow><span>Posição atual</span><strong>{clube.posicao}º lugar</strong></DataRow>
              )}
              <DataRow><span>Ambiente</span><StatusPill>Simulado</StatusPill></DataRow>
            </DataList>
          </MarketCard>

          <ActionCard>
            <ActionIcon><FiZap /></ActionIcon>
            <div>
              <h2>Monte sua posição</h2>
              <p>Consulte o livro de ofertas e escolha preço e quantidade para negociar.</p>
            </div>
            <TradeButton type="button" onClick={() => setModalAberto(true)} $full>
              Abrir negociação <FiTrendingUp />
            </TradeButton>
            <ActionHint>Moeda virtual sem valor real.</ActionHint>
          </ActionCard>
        </SideColumn>
      </ContentGrid>

      <MobileTradeBar>
        <div><span>{clube.nome}</span><strong>{formatTrade(currentPrice)}</strong></div>
        <TradeButton type="button" onClick={() => setModalAberto(true)}>Negociar</TradeButton>
      </MobileTradeBar>

      {modalAberto && (
        <NegociacaoModal
          isOpen={modalAberto}
          onClose={() => setModalAberto(false)}
          clube={clube}
          modoInicial="compra"
        />
      )}
    </Page>
  );
}

const spin = keyframes`to { transform: rotate(360deg); }`;

const Page = styled.main`
  width: 100%;
  max-width: 1380px;
  margin: 0 auto;
  padding: 8px 8px 40px;
  color: #e8eff8;

  @media (max-width: 700px) {
    padding: 2px 0 92px;
  }
`;

const Breadcrumb = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 2px 0 14px;
  color: #8fa4bc;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.18s ease;

  &:hover { color: #f8fafc; }
`;

const Hero = styled.section`
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 30px;
  min-height: 188px;
  padding: 30px 32px;
  border: 1px solid rgba(72, 111, 146, 0.38);
  border-radius: 22px;
  background:
    radial-gradient(circle at 12% 0%, rgba(0, 217, 130, 0.13), transparent 36%),
    linear-gradient(135deg, #071522 0%, #0b2134 58%, #0a1929 100%);
  box-shadow: 0 22px 60px rgba(2, 8, 23, 0.28);

  @media (max-width: 1000px) {
    grid-template-columns: 1fr auto;
    > button:last-child { grid-column: 1 / -1; justify-self: start; }
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
    gap: 22px;
    min-height: 0;
    padding: 22px 18px;
    border-radius: 18px;
  }
`;

const HeroGlow = styled.div`
  position: absolute;
  z-index: -1;
  right: -80px;
  top: -150px;
  width: 380px;
  height: 380px;
  border-radius: 50%;
  background: rgba(56, 189, 248, 0.08);
  filter: blur(2px);
`;

const ClubIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 0;

  @media (max-width: 520px) { align-items: flex-start; gap: 14px; }
`;

const BadgeFrame = styled.div`
  flex: none;
  display: grid;
  place-items: center;
  width: 100px;
  height: 100px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 24px;
  background: linear-gradient(145deg, rgba(255,255,255,.08), rgba(255,255,255,.025));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 16px 34px rgba(0,0,0,.22);

  @media (max-width: 520px) {
    width: 78px;
    height: 78px;
    border-radius: 20px;
    > div { transform: scale(.82); }
  }
`;

const IdentityCopy = styled.div`min-width: 0;`;
const Eyebrow = styled.span`
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 8px;
  color: #facc15;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .13em;
  text-transform: uppercase;
`;
const ClubTitleRow = styled.div`display: flex; align-items: center; gap: 10px; min-width: 0;`;
const ClubTitle = styled.h1`
  overflow: hidden;
  margin: 0;
  color: #fff;
  font-size: clamp(27px, 3.2vw, 43px);
  line-height: 1.08;
  letter-spacing: -.035em;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 520px) { white-space: normal; }
`;

const FavoriteButton = styled.button`
  flex: none;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid ${({ $active }) => $active ? 'rgba(250, 204, 21, .48)' : 'rgba(148, 163, 184, .24)'};
  border-radius: 12px;
  background: ${({ $active }) => $active ? 'rgba(250, 204, 21, .13)' : 'rgba(255,255,255,.04)'};
  color: ${({ $active }) => $active ? '#facc15' : '#9fb0c4'};
  cursor: pointer;
  transition: .18s ease;

  svg { ${({ $active }) => $active ? 'fill: currentColor;' : ''} }
  &:hover { transform: translateY(-1px); border-color: rgba(250,204,21,.5); color: #facc15; }
  &:disabled { opacity: .55; cursor: wait; }
`;

const MetaLine = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 10px;
  color: #93a6bd;
  font-size: 13px;

  i { width: 3px; height: 3px; border-radius: 50%; background: #51687f; }
`;

const MarketStatus = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #8ee8bd;
  b { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 4px rgba(34,197,94,.1); }
`;

const QuoteBlock = styled.div`
  min-width: 180px;
  padding-left: 28px;
  border-left: 1px solid rgba(148,163,184,.16);

  @media (max-width: 700px) {
    padding: 18px 0 0;
    border-top: 1px solid rgba(148,163,184,.14);
    border-left: 0;
  }
`;
const QuoteLabel = styled.span`display: block; color: #8195ad; font-size: 12px; font-weight: 700;`;
const Quote = styled.strong`display: block; margin: 5px 0; color: #fff; font-size: clamp(26px, 3vw, 36px); letter-spacing: -.035em;`;
const Variation = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${({ $positive }) => $positive ? '#66e7ad' : '#fda4af'};
  font-size: 12px;
  font-weight: 800;
`;

const TradeButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: ${({ $full }) => $full ? '100%' : 'auto'};
  min-height: 48px;
  padding: 0 20px;
  border: 0;
  border-radius: 13px;
  background: linear-gradient(135deg, #24dc94, #00b978);
  color: #042318;
  font-size: 14px;
  font-weight: 900;
  box-shadow: 0 11px 26px rgba(0, 217, 130, .18);
  cursor: pointer;
  transition: transform .18s ease, box-shadow .18s ease;

  &:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(0, 217, 130, .26); }
  &:focus-visible { outline: 3px solid rgba(56,189,248,.35); outline-offset: 3px; }

  @media (max-width: 700px) { ${Hero} > & { display: none; } }
`;

const StatsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin: 16px 0;

  @media (max-width: 1050px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 560px) { grid-template-columns: 1fr 1fr; gap: 8px; }
`;

const Stat = styled.article`
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
  padding: 16px;
  border: 1px solid #1a3248;
  border-radius: 15px;
  background: #091827;

  > div:last-child { min-width: 0; }
  span, strong, small { display: block; }
  span { color: #7f94aa; font-size: 11px; font-weight: 700; }
  strong { overflow: hidden; margin: 4px 0 2px; color: ${({ $tone }) => $tone === 'positive' ? '#70e8b4' : $tone === 'negative' ? '#fda4af' : $tone === 'gold' ? '#fde68a' : '#f5f8fc'}; font-size: 18px; text-overflow: ellipsis; white-space: nowrap; }
  small { overflow: hidden; color: #62778e; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }

  @media (max-width: 560px) {
    align-items: flex-start;
    padding: 13px 11px;
    strong { font-size: 15px; }
    small { white-space: normal; line-height: 1.3; }
  }
`;

const StatIcon = styled.div`
  flex: none;
  display: grid;
  place-items: center;
  width: 39px;
  height: 39px;
  border-radius: 11px;
  background: ${({ $tone }) => $tone === 'positive' ? 'rgba(34,197,94,.1)' : $tone === 'negative' ? 'rgba(244,63,94,.1)' : $tone === 'gold' ? 'rgba(250,204,21,.1)' : 'rgba(56,189,248,.09)'};
  color: ${({ $tone }) => $tone === 'positive' ? '#4ade80' : $tone === 'negative' ? '#fb7185' : $tone === 'gold' ? '#facc15' : '#38bdf8'};
  font-size: 18px;

  @media (max-width: 560px) { display: none; }
`;

const ContentGrid = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.58fr) minmax(300px, .62fr);
  gap: 16px;
  align-items: start;

  @media (max-width: 1060px) { grid-template-columns: 1fr; }
`;

const BaseCard = styled.section`
  border: 1px solid #1a3248;
  border-radius: 18px;
  background: #081725;
  box-shadow: 0 16px 42px rgba(2, 8, 23, .16);
`;
const ChartCard = styled(BaseCard)`overflow: hidden;`;
const PanelHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 21px 22px 15px;

  @media (max-width: 720px) { flex-direction: column; padding: 18px 15px 12px; }
`;
const PanelEyebrow = styled.span`display: block; margin-bottom: 4px; color: #d0b93e; font-size: 10px; font-weight: 900; letter-spacing: .11em; text-transform: uppercase;`;
const PanelTitle = styled.h2`margin: 0; color: #f5f8fc; font-size: 19px; letter-spacing: -.015em;`;
const PanelSubtitle = styled.p`margin: 5px 0 0; color: #758aa1; font-size: 12px; line-height: 1.45;`;
const RangeTabs = styled.div`
  display: flex;
  gap: 4px;
  padding: 4px;
  border: 1px solid #1c354e;
  border-radius: 11px;
  background: #0b1c2d;

  @media (max-width: 720px) { width: 100%; overflow-x: auto; }
`;
const RangeButton = styled.button`
  flex: none;
  min-height: 32px;
  padding: 0 11px;
  border: 1px solid ${({ $active }) => $active ? 'rgba(36,220,148,.22)' : 'transparent'};
  border-radius: 8px;
  background: ${({ $active }) => $active ? 'rgba(36,220,148,.11)' : 'transparent'};
  color: ${({ $active }) => $active ? '#77e9bb' : '#8194aa'};
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
`;

const ChartBody = styled.div`position: relative; min-height: 330px; padding: 0 12px;`;
const ChartViewport = styled.div`
  position: relative;
  width: 100%;
  min-height: 318px;
  svg { display: block; width: 100%; height: auto; min-height: 270px; touch-action: pan-y; }
`;
const ChartTooltip = styled.div`
  position: absolute;
  z-index: 3;
  left: ${({ $left }) => $left};
  top: ${({ $top }) => $top};
  min-width: 128px;
  padding: 9px 11px;
  border: 1px solid #294861;
  border-radius: 10px;
  background: rgba(5, 17, 29, .96);
  box-shadow: 0 12px 30px rgba(0,0,0,.34);
  transform: translate(-50%, -115%);
  pointer-events: none;

  strong, span, small { display: block; }
  strong { color: #fff; font-size: 13px; }
  span { margin-top: 2px; color: #8ea2b9; font-size: 10px; }
  small { margin-top: 3px; color: #61dfaa; font-size: 10px; }
`;

const ChartFooter = styled.footer`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid #172d42;
  background: rgba(10, 28, 45, .58);

  @media (max-width: 650px) { grid-template-columns: 1fr 1fr; }
`;
const FooterMetric = styled.div`
  padding: 13px 17px;
  border-right: 1px solid #172d42;
  &:last-child { border-right: 0; }
  span, strong { display: block; }
  span { color: #657b92; font-size: 10px; }
  strong { margin-top: 3px; color: #dfe8f2; font-size: 12px; }

  @media (max-width: 650px) {
    &:nth-child(2) { border-right: 0; }
    &:nth-child(n+3) { border-top: 1px solid #172d42; }
  }
`;

const SideColumn = styled.aside`display: grid; gap: 16px;`;
const MarketCard = styled(BaseCard)`padding: 20px;`;
const CardTop = styled.div`display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 15px;`;
const InfoIcon = styled.span`display: grid; place-items: center; width: 32px; height: 32px; border-radius: 9px; background: #10263a; color: #7991a9;`;
const DataList = styled.div`display: flex; flex-direction: column;`;
const DataRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 46px;
  border-top: 1px solid #152b40;
  span { color: #778ba1; font-size: 12px; }
  strong { color: #edf3fa; font-size: 13px; text-align: right; }
`;
const StatusPill = styled.b`
  padding: 5px 9px;
  border: 1px solid rgba(56,189,248,.2);
  border-radius: 999px;
  background: rgba(56,189,248,.08);
  color: #7dd3fc !important;
  font-size: 10px !important;
  text-transform: uppercase;
`;
const ActionCard = styled(BaseCard)`
  padding: 21px;
  background:
    radial-gradient(circle at 100% 0%, rgba(250,204,21,.1), transparent 44%),
    linear-gradient(145deg, #0a1c2c, #0a1827);
  h2 { margin: 14px 0 6px; color: #fff; font-size: 19px; }
  p { margin: 0 0 17px; color: #8094aa; font-size: 12px; line-height: 1.5; }
`;
const ActionIcon = styled.div`display: grid; place-items: center; width: 41px; height: 41px; border-radius: 12px; background: rgba(250,204,21,.1); color: #facc15; font-size: 19px;`;
const ActionHint = styled.small`display: block; margin-top: 10px; color: #61768c; font-size: 10px; text-align: center;`;

const ChartEmpty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 28px;
  text-align: center;
  strong { margin: 13px 0 5px; color: #dfe8f2; font-size: 15px; }
  span { max-width: 390px; color: #6f849b; font-size: 12px; line-height: 1.5; }
`;
const EmptyChartIcon = styled.div`display: grid; place-items: center; width: 52px; height: 52px; border-radius: 16px; background: rgba(36,220,148,.08); color: #46dba1; font-size: 23px;`;
const ChartLoading = styled.div`display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 300px; color: #7f94aa; font-size: 12px;`;
const ChartError = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 300px;
  max-width: 480px;
  margin: 0 auto;
  padding: 25px;
  color: #fb7185;
  > svg { flex: none; font-size: 25px; }
  div { flex: 1; }
  strong, span { display: block; }
  strong { color: #f1f5f9; font-size: 14px; }
  span { margin-top: 4px; color: #8599ae; font-size: 11px; }
`;
const IconButton = styled.button`display: grid; place-items: center; width: 38px; height: 38px; border: 1px solid #29435b; border-radius: 10px; background: #0d2134; color: #b7c7d8; cursor: pointer;`;

const Spinner = styled.span`
  display: inline-block;
  width: 25px;
  height: 25px;
  border: 3px solid rgba(56,189,248,.18);
  border-top-color: #24dc94;
  border-radius: 50%;
  animation: ${spin} .75s linear infinite;
`;
const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 62vh;
  color: #7e93a9;
  text-align: center;
  strong { margin-top: 14px; color: #dfe8f2; }
  span { margin-top: 5px; font-size: 12px; }
`;
const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  > svg { color: #fb7185; font-size: 38px; }
  h1 { margin: 15px 0 7px; color: #fff; font-size: 24px; }
  p { max-width: 500px; margin: 0; color: #8196ac; }
`;
const ErrorActions = styled.div`display: flex; flex-wrap: wrap; justify-content: center; gap: 9px; margin-top: 18px;`;
const BackLink = styled(Link)`display: inline-flex; align-items: center; gap: 7px; padding: 11px 14px; border: 1px solid #29435b; border-radius: 10px; color: #c5d1de; text-decoration: none; font-size: 12px; font-weight: 800;`;
const RetryButton = styled.button`display: inline-flex; align-items: center; gap: 7px; padding: 11px 14px; border: 0; border-radius: 10px; background: #24dc94; color: #042318; font-size: 12px; font-weight: 900; cursor: pointer;`;

const MobileTradeBar = styled.div`
  display: none;

  @media (max-width: 700px) {
    position: fixed;
    z-index: 40;
    right: max(10px, env(safe-area-inset-right));
    bottom: max(10px, env(safe-area-inset-bottom));
    left: max(10px, env(safe-area-inset-left));
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 11px 10px 14px;
    border: 1px solid #29445d;
    border-radius: 16px;
    background: rgba(5, 18, 30, .96);
    box-shadow: 0 18px 48px rgba(0,0,0,.46);
    backdrop-filter: blur(16px);
    div { min-width: 0; }
    span, strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    span { color: #71869c; font-size: 10px; }
    strong { margin-top: 2px; color: #fff; font-size: 15px; }
    button { min-height: 43px; padding: 0 17px; }
  }
`;