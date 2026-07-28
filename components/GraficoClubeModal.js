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
import EstadoInterface from './EstadoInterface';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Filler);
const API = process.env.NEXT_PUBLIC_API_URL;

function formatTS(value) {
  return `T$ ${Number(value || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function GraficoClubeModal({ aberto, fechar, clubeId, clubeNome }) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (aberto && clubeId) {
      setLoading(true);
      setErro('');

      if (!API) {
        setHistorico([]);
        setErro('Endereço da API não configurado.');
        setLoading(false);
        return;
      }

      fetch(`${API}/clubes/${clubeId}/historico`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Falha ao consultar o histórico.');
          }
          return res.json();
        })
        .then((data) => setHistorico(Array.isArray(data) ? data : []))
        .catch((err) => {
          console.error('Erro ao carregar histórico do clube:', err);
          setHistorico([]);
          setErro('Não foi possível carregar o histórico deste clube.');
        })
        .finally(() => setLoading(false));
    }
  }, [aberto, clubeId]);

  useEffect(() => {
    if (!aberto || typeof document === 'undefined') return undefined;

    const overflowAnterior = document.body.style.overflow;
    const fecharComEscape = (event) => {
      if (event.key === 'Escape') fechar?.();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', fecharComEscape);

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener('keydown', fecharComEscape);
    };
  }, [aberto, fechar]);

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
          label: (context) => `Preço: ${formatTS(context.raw)}`,
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
          callback: (value) => formatTS(value),
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
            <strong>{formatTS(resumo.atual)}</strong>
          </ResumoCard>
          <ResumoCard>
            <small>Máxima</small>
            <strong>{formatTS(resumo.max)}</strong>
          </ResumoCard>
          <ResumoCard>
            <small>Mínima</small>
            <strong>{formatTS(resumo.min)}</strong>
          </ResumoCard>
          <ResumoCard $positive={resumo.variacao >= 0}>
            <small>Variação</small>
            <strong>{resumo.variacao.toFixed(2)}%</strong>
          </ResumoCard>
        </ResumoGrid>

        <ChartArea>
          {loading ? (
            <EstadoInterface
              variante="carregando"
              titulo="Carregando histórico"
              descricao="Estamos reunindo os preços registrados deste clube."
              compacto
            />
          ) : erro ? (
            <EstadoInterface
              variante="erro"
              titulo="Histórico indisponível"
              descricao={erro}
              compacto
            />
          ) : historico.length === 0 ? (
            <EstadoInterface
              titulo="Ainda não há histórico suficiente"
              descricao="O gráfico será exibido depois que o clube tiver preços registrados ao longo do tempo."
              compacto
            />
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
  height: 100vh;
  height: 100dvh;
  padding:
    max(20px, env(safe-area-inset-top))
    max(20px, env(safe-area-inset-right))
    max(20px, env(safe-area-inset-bottom))
    max(20px, env(safe-area-inset-left));

  @media (max-width: 640px) {
    align-items: stretch;
    padding:
      max(10px, env(safe-area-inset-top))
      max(8px, env(safe-area-inset-right))
      max(10px, env(safe-area-inset-bottom))
      max(8px, env(safe-area-inset-left));
  }
`;

const Modal = styled.div`
  width: min(920px, 100%);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(11, 19, 36, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
  color: white;
  padding: 22px;
  max-height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;

  @media (max-width: 640px) {
    padding: 16px 12px;
    border-radius: 18px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;

  @media (max-width: 520px) {
    align-items: stretch;
    flex-direction: column;
    gap: 12px;
  }
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

  @media (max-width: 420px) {
    gap: 8px;
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

  @media (max-width: 420px) {
    min-width: 0;
    padding: 11px 10px;
    border-radius: 14px;

    small {
      font-size: 0.75rem;
    }

    strong {
      font-size: 0.9rem;
      overflow-wrap: anywhere;
    }
  }
`;

const ChartArea = styled.div`
  height: 340px;
  border-radius: 18px;
  padding: 14px;
  background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015));
  border: 1px solid rgba(148, 163, 184, 0.10);

  @media (max-width: 640px) {
    height: 260px;
    padding: 8px;
    border-radius: 14px;
  }

  @media (max-height: 660px) and (max-width: 640px) {
    height: 210px;
  }
`;

const Estado = styled.div`
  height: 100%;
  display: grid;
  place-items: center;
  color: #94a3b8;
  font-size: 0.95rem;
`;

const BotaoFechar = styled.button`
  min-height: 44px;
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

  @media (max-width: 520px) {
    width: 100%;
  }
`;
