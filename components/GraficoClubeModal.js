import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Filler);

function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0));
}

export default function GraficoClubeModal({ aberto, fechar, clubeId, clubeNome }) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (aberto && clubeId) {
      setLoading(true);
      fetch(`http://localhost:4001/clubes/${clubeId}/historico`)
        .then((res) => res.json())
        .then((data) => setHistorico(Array.isArray(data) ? data : []))
        .catch(() => setHistorico([]))
        .finally(() => setLoading(false));
    }
  }, [aberto, clubeId]);

  const resumo = useMemo(() => {
    if (!historico.length) {
      return { atual: 0, max: 0, min: 0, variacao: 0 };
    }

    const precos = historico.map((h) => Number(h.preco || 0));
    const atual = precos[precos.length - 1] || 0;
    const inicial = precos[0] || 0;
    const max = Math.max(...precos);
    const min = Math.min(...precos);
    const variacao = inicial > 0 ? ((atual - inicial) / inicial) * 100 : 0;

    return { atual, max, min, variacao };
  }, [historico]);

  if (!aberto) return null;

  const dados = {
    labels: historico.map((h) =>
      new Date(h.data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      })
    ),
    datasets: [
      {
        label: 'Preço da cota',
        data: historico.map((h) => Number(h.preco || 0)),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.16)',
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#dcfce7',
        pointHoverBackgroundColor: '#86efac',
        pointHoverBorderColor: '#ffffff',
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 2.5,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: 'rgba(148,163,184,0.18)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        callbacks: {
          title: (items) => {
            const idx = items?.[0]?.dataIndex ?? 0;
            const item = historico[idx];
            return item?.data
              ? new Date(item.data).toLocaleString('pt-BR')
              : '';
          },
          label: (context) => `Preço: ${formatBRL(context.raw)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8',
          maxRotation: 0,
        },
        grid: {
          display: false,
        },
        border: {
          color: 'rgba(148,163,184,0.10)',
        },
      },
      y: {
        ticks: {
          color: '#94a3b8',
          callback: (value) => formatBRL(value),
        },
        grid: {
          color: 'rgba(148,163,184,0.10)',
          drawBorder: false,
        },
        border: {
          display: false,
        },
      },
    },
  };

  return (
    <Overlay onClick={fechar}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <TitleBlock>
            <Kicker>Histórico de valorização</Kicker>
            <h3>{clubeNome}</h3>
            <p>Visualize a evolução do preço da cota com um gráfico mais limpo e profissional.</p>
          </TitleBlock>
          <BotaoFechar type="button" onClick={fechar}>
            Fechar
          </BotaoFechar>
        </Header>

        <ResumoGrid>
          <ResumoCard>
            <small>Preço atual</small>
            <strong>{formatBRL(resumo.atual)}</strong>
          </ResumoCard>
          <ResumoCard>
            <small>Máxima</small>
            <strong>{formatBRL(resumo.max)}</strong>
          </ResumoCard>
          <ResumoCard>
            <small>Mínima</small>
            <strong>{formatBRL(resumo.min)}</strong>
          </ResumoCard>
          <ResumoCard $positive={resumo.variacao >= 0}>
            <small>Variação</small>
            <strong>{resumo.variacao.toFixed(2)}%</strong>
          </ResumoCard>
        </ResumoGrid>

        <ChartArea>
          {loading ? (
            <Estado>Carregando gráfico...</Estado>
          ) : historico.length === 0 ? (
            <Estado>Nenhum dado histórico encontrado.</Estado>
          ) : (
            <Line data={dados} options={options} />
          )}
        </ChartArea>
      </Modal>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.78);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  padding: 20px;
`;

const Modal = styled.div`
  width: min(920px, 100%);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(11, 19, 36, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
  color: white;
  padding: 22px;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
`;

const TitleBlock = styled.div`
  h3 {
    margin: 4px 0 6px;
    color: #f8fafc;
    font-size: 1.35rem;
    letter-spacing: -0.02em;
  }

  p {
    margin: 0;
    color: #94a3b8;
    font-size: 0.9rem;
    line-height: 1.45;
  }
`;

const Kicker = styled.div`
  color: #22c55e;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const ResumoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const ResumoCard = styled.div`
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.10);

  small {
    display: block;
    color: #94a3b8;
    font-size: 0.78rem;
    margin-bottom: 6px;
  }

  strong {
    color: ${({ $positive }) => ($positive === undefined ? '#f8fafc' : $positive ? '#86efac' : '#fca5a5')};
    font-size: 1.05rem;
    font-weight: 800;
  }
`;

const ChartArea = styled.div`
  height: 340px;
  border-radius: 18px;
  padding: 14px;
  background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015));
  border: 1px solid rgba(148, 163, 184, 0.10);
`;

const Estado = styled.div`
  height: 100%;
  display: grid;
  place-items: center;
  color: #94a3b8;
  font-size: 0.95rem;
`;

const BotaoFechar = styled.button`
  background: rgba(239, 68, 68, 0.14);
  color: #fecaca;
  border: 1px solid rgba(239, 68, 68, 0.18);
  padding: 0.7rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 800;

  &:hover {
    background: rgba(239, 68, 68, 0.22);
  }
`;
