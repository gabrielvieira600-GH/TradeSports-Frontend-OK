import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import styled from 'styled-components';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, Legend);

function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0));
}

export default function GraficoPatrimonio({ historico }) {
  if (!historico || historico.length === 0) return null;

  const pontos = historico.map((item) => ({
    data: new Date(item.data),
    valor: Number(item.quantidade || 0) * Number(item.preco || 0),
  }));

  const datas = pontos.map((item) =>
    item.data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    })
  );

  const valores = pontos.map((item) => Number(item.valor.toFixed(2)));
  const atual = valores[valores.length - 1] || 0;
  const inicial = valores[0] || 0;
  const max = Math.max(...valores);
  const min = Math.min(...valores);
  const variacao = inicial > 0 ? ((atual - inicial) / inicial) * 100 : 0;

  const data = {
    labels: datas,
    datasets: [
      {
        label: 'Patrimônio movimentado',
        data: valores,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.18)',
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#dbeafe',
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#93c5fd',
        pointHoverBorderColor: '#ffffff',
        fill: true,
        tension: 0.35,
        borderWidth: 2.6,
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
            return pontos[idx]?.data
              ? pontos[idx].data.toLocaleString('pt-BR')
              : '';
          },
          label: (context) => `Valor: ${formatBRL(context.raw)}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#94a3b8',
          callback: (valor) => formatBRL(valor),
        },
        grid: {
          color: 'rgba(148,163,184,0.10)',
        },
        border: {
          display: false,
        },
      },
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
    },
  };

  return (
    <Wrapper>
      <Header>
        <div>
          <Kicker>Patrimônio</Kicker>
          <Title>Evolução do valor movimentado</Title>
        </div>

        <Resumo>
          <ResumoItem>
            <small>Atual</small>
            <strong>{formatBRL(atual)}</strong>
          </ResumoItem>
          <ResumoItem>
            <small>Máx.</small>
            <strong>{formatBRL(max)}</strong>
          </ResumoItem>
          <ResumoItem>
            <small>Min.</small>
            <strong>{formatBRL(min)}</strong>
          </ResumoItem>
          <ResumoItem $positive={variacao >= 0}>
            <small>Variação</small>
            <strong>{variacao.toFixed(2)}%</strong>
          </ResumoItem>
        </Resumo>
      </Header>

      <ChartBox>
        <Line data={data} options={options} />
      </ChartBox>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  border-radius: 22px;
  padding: 18px;
  background: linear-gradient(180deg, rgba(15,23,42,0.98), rgba(11,19,36,0.98));
  border: 1px solid rgba(148,163,184,0.12);
  box-shadow: 0 18px 42px rgba(0,0,0,0.2);
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const Kicker = styled.div`
  color: #60a5fa;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
`;

const Title = styled.h3`
  margin: 0;
  color: #f8fafc;
  font-size: 1.05rem;
  letter-spacing: -0.01em;
`;

const Resumo = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 880px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
  }
`;

const ResumoItem = styled.div`
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(148,163,184,0.10);

  small {
    display: block;
    color: #94a3b8;
    margin-bottom: 5px;
    font-size: 0.76rem;
  }

  strong {
    color: ${({ $positive }) => ($positive === undefined ? '#f8fafc' : $positive ? '#86efac' : '#fca5a5')};
    font-size: 0.96rem;
    font-weight: 800;
  }
`;

const ChartBox = styled.div`
  height: 300px;
  border-radius: 18px;
  padding: 12px;
  background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015));
  border: 1px solid rgba(148,163,184,0.10);
`;
