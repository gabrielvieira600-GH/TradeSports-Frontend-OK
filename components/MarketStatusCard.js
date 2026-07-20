import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import api from '../lib/api';

function formatarData(valor) {
  if (!valor) return null;

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return null;
  }

  return data.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MarketStatusCard({
  compacto = false,
}) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] =
    useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarStatusMercado() {
      try {
        setCarregando(true);

        const { data } = await api.get(
          '/mercado/limite-ordens'
        );

        if (!componenteAtivo) return;

        setDados(data || null);
        setErro('');
      } catch (err) {
        if (!componenteAtivo) return;

        setErro(
          err?.response?.data?.erro ||
            'Não foi possível consultar o status do mercado.'
        );
      } finally {
        if (componenteAtivo) {
          setCarregando(false);
        }
      }
    }

    carregarStatusMercado();

    return () => {
      componenteAtivo = false;
    };
  }, []);

  const planoPremium =
    dados?.plano === 'premium' ||
    dados?.ordensIlimitadas === true;

  const mercadoAberto =
    dados?.temporadaAtiva === true &&
    dados?.mercadoAberto !== false;

  const percentualUtilizado = useMemo(() => {
    if (!dados || planoPremium) {
      return 0;
    }

    const limite = Math.max(
      1,
      Number(dados.limite || 15)
    );

    const utilizadas = Math.max(
      0,
      Number(dados.utilizadas || 0)
    );

    return Math.min(
      100,
      Math.max(
        0,
        (utilizadas / limite) * 100
      )
    );
  }, [dados, planoPremium]);

  const renovacao = formatarData(
    dados?.periodo?.renovaEm
  );

  const nomeTemporada =
    dados?.temporada?.nome ||
    dados?.temporada?.codigo ||
    'Temporada TradeSports';

  return (
    <Card
      $compacto={compacto}
      $fechado={
        !carregando && !mercadoAberto
      }
    >
      <Topo>
        <Identificacao>
          <Rotulo>
            Temporada TradeSports
          </Rotulo>

          <Titulo>
            {nomeTemporada}
          </Titulo>
        </Identificacao>

        <Status
          $carregando={carregando}
          $aberto={mercadoAberto}
        >
          <StatusPonto />

          {carregando
            ? 'Consultando'
            : mercadoAberto
            ? 'Mercado aberto'
            : 'Mercado fechado'}
        </Status>
      </Topo>

      {erro ? (
        <Mensagem $erro>
          {erro}
        </Mensagem>
      ) : carregando ? (
        <Mensagem>
          Consultando temporada e limite de
          ordens...
        </Mensagem>
      ) : !dados?.temporadaAtiva ? (
        <Mensagem>
          Nenhuma temporada ativa no momento.
        </Mensagem>
      ) : (
        <Conteudo>
          <Plano>
            <PlanoLabel>
              Seu plano
            </PlanoLabel>

            <PlanoNome $premium={planoPremium}>
              {planoPremium
                ? 'Premium'
                : 'Lite'}
            </PlanoNome>
          </Plano>

          {!mercadoAberto ? (
            <AvisoMercado>
              O mercado está temporariamente
              fechado para novas ordens.
            </AvisoMercado>
          ) : planoPremium ? (
            <PremiumMensagem>
              Ordens ilimitadas durante a
              temporada.
            </PremiumMensagem>
          ) : (
            <Quota>
              <QuotaCabecalho>
                <span>
                  Quota semanal
                </span>

                <strong>
                  {Number(
                    dados?.restantes || 0
                  )}{' '}
                  de{' '}
                  {Number(
                    dados?.limite || 15
                  )}{' '}
                  restantes
                </strong>
              </QuotaCabecalho>

              <Barra>
                <BarraPreenchimento
                  $percentual={
                    percentualUtilizado
                  }
                  $limiteAtingido={
                    dados?.limiteAtingido
                  }
                />
              </Barra>

              <QuotaRodape>
                <span>
                  {Number(
                    dados?.utilizadas || 0
                  )}{' '}
                  ordens utilizadas
                </span>

                {renovacao && (
                  <span>
                    Renova em {renovacao}
                  </span>
                )}
              </QuotaRodape>

              {dados?.limiteAtingido && (
                <LimiteAtingido>
                  Limite semanal atingido.
                </LimiteAtingido>
              )}
            </Quota>
          )}
        </Conteudo>
      )}
    </Card>
  );
}

const Card = styled.section`
  width: 100%;
  margin: ${({ $compacto }) =>
    $compacto ? '0 0 20px' : '0'};

  padding: ${({ $compacto }) =>
    $compacto ? '16px' : '18px'};

  border-radius: 18px;
  box-sizing: border-box;

  background: ${({ $fechado }) =>
    $fechado
      ? `linear-gradient(
          135deg,
          rgba(127, 29, 29, 0.26),
          rgba(15, 23, 42, 0.96)
        )`
      : `linear-gradient(
          135deg,
          rgba(29, 78, 216, 0.23),
          rgba(15, 23, 42, 0.96)
        )`};

  border: 1px solid
    rgba(148, 163, 184, 0.18);

  box-shadow:
    0 16px 40px rgba(2, 6, 23, 0.2);
`;

const Topo = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 520px) {
    align-items: stretch;
    flex-direction: column;
    gap: 12px;
  }
`;

const Identificacao = styled.div`
  min-width: 0;
`;

const Rotulo = styled.div`
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Titulo = styled.h2`
  margin: 4px 0 0;
  color: #f8fafc;
  font-size: 1.05rem;
  line-height: 1.3;
`;

const Status = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex: 0 0 auto;

  padding: 7px 10px;
  border-radius: 999px;

  color: ${({ $carregando, $aberto }) =>
    $carregando
      ? '#dbeafe'
      : $aberto
      ? '#bbf7d0'
      : '#fecaca'};

  background: ${({
    $carregando,
    $aberto,
  }) =>
    $carregando
      ? 'rgba(37, 99, 235, 0.16)'
      : $aberto
      ? 'rgba(22, 163, 74, 0.16)'
      : 'rgba(239, 68, 68, 0.16)'};

  font-size: 0.76rem;
  font-weight: 800;

  @media (max-width: 520px) {
    align-self: flex-start;
  }
`;

const StatusPonto = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
`;

const Mensagem = styled.p`
  margin: 14px 0 0;
  color: ${({ $erro }) =>
    $erro ? '#fca5a5' : '#cbd5e1'};
  font-size: 0.88rem;
  line-height: 1.45;
`;

const Conteudo = styled.div`
  margin-top: 15px;

  display: grid;
  grid-template-columns:
    minmax(120px, 0.32fr)
    minmax(0, 1fr);

  gap: 18px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 13px;
  }
`;

const Plano = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PlanoLabel = styled.span`
  color: #94a3b8;
  font-size: 0.76rem;
`;

const PlanoNome = styled.strong`
  color: ${({ $premium }) =>
    $premium ? '#facc15' : '#ffffff'};

  font-size: 1.02rem;
`;

const PremiumMensagem = styled.div`
  display: flex;
  align-items: center;

  color: #bbf7d0;
  font-size: 0.88rem;
  font-weight: 800;
  line-height: 1.4;
`;

const AvisoMercado = styled.div`
  display: flex;
  align-items: center;

  color: #fecaca;
  font-size: 0.86rem;
  font-weight: 700;
  line-height: 1.45;
`;

const Quota = styled.div`
  min-width: 0;
`;

const QuotaCabecalho = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  color: #cbd5e1;
  font-size: 0.82rem;

  strong {
    color: #ffffff;
    text-align: right;
  }

  @media (max-width: 520px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;

    strong {
      text-align: left;
    }
  }
`;

const Barra = styled.div`
  width: 100%;
  height: 7px;

  margin-top: 10px;

  border-radius: 999px;
  overflow: hidden;

  background:
    rgba(148, 163, 184, 0.18);
`;

const BarraPreenchimento = styled.div`
  width: ${({ $percentual }) =>
    `${$percentual}%`};

  height: 100%;
  border-radius: inherit;

  background: ${({ $limiteAtingido }) =>
    $limiteAtingido
      ? `linear-gradient(
          90deg,
          #dc2626,
          #f87171
        )`
      : `linear-gradient(
          90deg,
          #2563eb,
          #00c776
        )`};

  transition: width 0.2s ease;
`;

const QuotaRodape = styled.div`
  margin-top: 8px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  color: #94a3b8;
  font-size: 0.73rem;

  @media (max-width: 520px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 3px;
  }
`;

const LimiteAtingido = styled.div`
  margin-top: 8px;
  color: #fca5a5;
  font-size: 0.76rem;
  font-weight: 800;
`;