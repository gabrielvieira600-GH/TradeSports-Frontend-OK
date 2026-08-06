import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Link from 'next/link';
import styled, { keyframes } from 'styled-components';
import {
  FiActivity,
  FiArrowRight,
  FiBarChart2,
  FiBriefcase,
  FiClock,
  FiRefreshCw,
  FiShoppingCart,
  FiTarget,
  FiTrendingDown,
  FiTrendingUp,
  FiZap,
} from 'react-icons/fi';

import api from '../lib/api';
import ClubBadge from '../components/ClubBadge';
import withAuth from '../components/withAuth';
import { AuthContext } from '../contexts/AuthContexts';

function formatarTS(valor) {
  return `T$ ${Number(valor || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatarPercentual(valor) {
  const numero = Number(valor || 0);
  const sinal = numero > 0 ? '+' : '';

  return `${sinal}${numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

function formatarData(valor, incluirHora = false) {
  if (!valor) return null;

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return null;

  return data.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: 'short',
    ...(incluirHora
      ? {
          hour: '2-digit',
          minute: '2-digit',
        }
      : {
          year: 'numeric',
        }),
  });
}

function saudacaoAtual() {
  const hora = new Date().getHours();

  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

function labelAtividade(item) {
  const clube = item?.clubeNome
    ? ` · ${item.clubeNome}`
    : '';

  const labels = {
    IPO: 'Compra no mercado inicial',
    COMPRA: 'Compra de cotas',
    VENDA: 'Venda de cotas',
    LIQUIDACAO: 'Liquidação',
    DIVIDENDO: 'Bonificação por desempenho',
    DEPOSITO: 'Crédito de saldo simulado',
    SAQUE: 'Retirada de saldo simulado',
    AJUSTE: 'Ajuste de saldo',
    ORDEM_COMPRA: 'Ordem de compra criada',
    ORDEM_VENDA: 'Ordem de venda criada',
  };

  return `${labels[item?.tipo] || 'Movimento'}${clube}`;
}

function sinalAtividade(item) {
  if (
    [
      'VENDA',
      'LIQUIDACAO',
      'DIVIDENDO',
      'DEPOSITO',
    ].includes(item?.tipo)
  ) {
    return 'positivo';
  }

  if (
    [
      'IPO',
      'COMPRA',
      'SAQUE',
      'ORDEM_COMPRA',
    ].includes(item?.tipo)
  ) {
    return 'negativo';
  }

  return 'neutro';
}

function KpiCard({
  icone,
  rotulo,
  valor,
  detalhe,
  tom = 'neutro',
  destaque,
}) {
  return (
    <Kpi>
      <KpiTopo>
        <KpiIcone $tom={tom}>{icone}</KpiIcone>
        {destaque && (
          <KpiBadge $tom={tom}>{destaque}</KpiBadge>
        )}
      </KpiTopo>

      <KpiRotulo>{rotulo}</KpiRotulo>
      <KpiValor $tom={tom}>{valor}</KpiValor>
      <KpiDetalhe>{detalhe}</KpiDetalhe>
    </Kpi>
  );
}

function DashboardPage() {
  const { usuario } = useContext(AuthContext);

  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');

  const carregarDashboard = useCallback(
    async ({ silencioso = false } = {}) => {
      if (silencioso) {
        setAtualizando(true);
      } else {
        setCarregando(true);
      }

      setErro('');

      try {
        const { data } = await api.get('/dashboard');
        setDados(data || null);
      } catch (err) {
        setErro(
          err?.response?.data?.erro ||
            'Não foi possível carregar sua visão geral.'
        );
      } finally {
        setCarregando(false);
        setAtualizando(false);
      }
    },
    []
  );

  useEffect(() => {
    carregarDashboard();
  }, [carregarDashboard]);

  const primeiroNome =
    dados?.usuario?.nome?.trim()?.split(/\s+/)?.[0] ||
    usuario?.nome?.trim()?.split(/\s+/)?.[0] ||
    usuario?.nomeUsuario ||
    'estrategista';

  const patrimonio = useMemo(
    () => dados?.patrimonio || {},
    [dados]
  );

  const mercado = useMemo(
    () => dados?.mercado || {},
    [dados]
  );

  const quota = useMemo(
    () => dados?.ordens?.quota || {},
    [dados]
  );

  const ordensAbertas = useMemo(
    () => dados?.ordens?.abertas || {},
    [dados]
  );

  const posicoes = useMemo(
    () =>
      dados?.carteira
        ?.principaisPosicoes || [],
    [dados]
  );

  const atividades = useMemo(
    () => dados?.atividadesRecentes || [],
    [dados]
  );

  const resultadoPositivo =
    Number(patrimonio.resultado || 0) >= 0;

  const percentualQuota = useMemo(() => {
    if (
      quota?.ilimitadas ||
      !Number(quota?.limite)
    ) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        (Number(quota.utilizadas || 0) /
          Number(quota.limite)) *
          100
      )
    );
  }, [quota]);

  const proximoPasso = useMemo(() => {
    if (!mercado?.temporadaAtiva) {
      return {
        titulo: 'Prepare sua estratégia',
        texto:
          'Não há uma temporada ativa agora. Use este momento para conhecer os mercados e montar sua watchlist.',
        href: '/brasileirao-a',
        acao: 'Explorar clubes',
      };
    }

    if (!mercado?.mercadoAberto) {
      return {
        titulo: 'Mercado temporariamente fechado',
        texto:
          'Suas posições continuam visíveis. Acompanhe a classificação enquanto aguarda a reabertura.',
        href: '/carteira',
        acao: 'Ver carteira',
      };
    }

    if (
      Number(
        dados?.carteira?.quantidadePosicoes || 0
      ) === 0
    ) {
      return {
        titulo: 'Faça sua primeira análise',
        texto:
          'Compare os clubes, observe os preços e escolha onde iniciar sua carteira simulada.',
        href: '/brasileirao-a',
        acao: 'Explorar mercado',
      };
    }

    if (Number(ordensAbertas.total || 0) > 0) {
      return {
        titulo: 'Acompanhe suas ordens',
        texto: `Você tem ${Number(
          ordensAbertas.total
        )} ordem(ns) aguardando execução total ou parcial.`,
        href: '/minhas-ordens',
        acao: 'Revisar ordens',
      };
    }

    return {
      titulo: 'Mercado pronto para você',
      texto:
        'Revise suas posições e procure oportunidades para a próxima decisão.',
      href: '/brasileirao-a',
      acao: 'Analisar mercados',
    };
  }, [dados, mercado, ordensAbertas]);

  if (carregando) {
    return (
      <Container aria-busy="true">
        <Cabecalho>
          <div>
            <Skeleton $largura="150px" />
            <Skeleton
              $largura="330px"
              $altura="38px"
              $margem="10px 0 0"
            />
          </div>
        </Cabecalho>

        <Skeleton
          $altura="190px"
          $raio="22px"
          $margem="26px 0 0"
        />

        <KpiGrid>
          {[1, 2, 3, 4].map((item) => (
            <Skeleton
              key={item}
              $altura="170px"
              $raio="18px"
            />
          ))}
        </KpiGrid>

        <ConteudoGrid>
          <Skeleton
            $altura="410px"
            $raio="20px"
          />
          <Skeleton
            $altura="410px"
            $raio="20px"
          />
        </ConteudoGrid>
      </Container>
    );
  }

  if (erro && !dados) {
    return (
      <Container>
        <ErroCard role="alert">
          <ErroIcone>!</ErroIcone>
          <h1>Não conseguimos abrir seu dashboard</h1>
          <p>{erro}</p>
          <RetryButton
            type="button"
            onClick={() => carregarDashboard()}
          >
            <FiRefreshCw /> Tentar novamente
          </RetryButton>
        </ErroCard>
      </Container>
    );
  }

  return (
    <Container>
      <Cabecalho>
        <div>
          <Eyebrow>VISÃO GERAL DA CONTA</Eyebrow>
          <Titulo>
            {saudacaoAtual()}, {primeiroNome}.
          </Titulo>
          <Subtitulo>
            Seu desempenho e os próximos passos em um só lugar.
          </Subtitulo>
        </div>

        <CabecalhoAcoes>
          <SimuladoBadge>
            <StatusDot /> Ambiente simulado
          </SimuladoBadge>

          <AtualizarButton
            type="button"
            onClick={() =>
              carregarDashboard({
                silencioso: true,
              })
            }
            disabled={atualizando}
          >
            <FiRefreshCw
              className={
                atualizando ? 'girando' : ''
              }
            />
            {atualizando
              ? 'Atualizando'
              : 'Atualizar'}
          </AtualizarButton>
        </CabecalhoAcoes>
      </Cabecalho>

      {erro && (
        <AvisoAtualizacao role="alert">
          {erro} Os últimos dados carregados continuam visíveis.
        </AvisoAtualizacao>
      )}

      <MercadoHero
        $aberto={mercado?.mercadoAberto}
      >
        <HeroConteudo>
          <HeroStatus>
            <HeroStatusDot
              $aberto={mercado?.mercadoAberto}
            />
            {!mercado?.temporadaAtiva
              ? 'Sem temporada ativa'
              : mercado?.mercadoAberto
              ? 'Mercado aberto'
              : 'Mercado fechado'}
          </HeroStatus>

          <HeroTitulo>
            {mercado?.temporada?.nome ||
              'Próxima temporada TradeSports'}
          </HeroTitulo>

          <HeroTexto>
            {mercado?.temporada?.descricao ||
              'Acompanhe o status operacional e organize sua estratégia antes da próxima decisão.'}
          </HeroTexto>

          <HeroMeta>
            <MetaItem>
              <FiTarget />
              <span>
                <small>Rodada</small>
                <strong>
                  {mercado?.rodada
                    ? `${mercado.rodada.numero}${
                        mercado.rodada.nome
                          ? ` · ${mercado.rodada.nome}`
                          : ''
                      }`
                    : mercado?.temporada?.rodadaAtual
                    ? `Rodada ${mercado.temporada.rodadaAtual}`
                    : 'Não aberta'}
                </strong>
              </span>
            </MetaItem>

            <MetaItem>
              <FiClock />
              <span>
                <small>Próxima referência</small>
                <strong>
                  {formatarData(
                    mercado?.rodada?.fimPrevisto ||
                      mercado?.temporada?.fim
                  ) || 'A definir'}
                </strong>
              </span>
            </MetaItem>
          </HeroMeta>
        </HeroConteudo>

        <QuotaCard>
          <QuotaTopo>
            <div>
              <QuotaRotulo>Limite de ordens</QuotaRotulo>
              <QuotaPlano
                $premium={quota?.ilimitadas}
              >
                Plano{' '}
                {quota?.plano === 'premium'
                  ? 'Premium'
                  : 'Lite'}
              </QuotaPlano>
            </div>

            <FiZap />
          </QuotaTopo>

          {quota?.ilimitadas ? (
            <>
              <QuotaValor>Ilimitadas</QuotaValor>
              <QuotaAjuda>
                Envie ordens sem quota semanal durante a temporada.
              </QuotaAjuda>
            </>
          ) : (
            <>
              <QuotaValor>
                {Number(quota?.restantes || 0)}
                <span>
                  {' '}
                  de {Number(quota?.limite || 15)} restantes
                </span>
              </QuotaValor>

              <QuotaBarra>
                <QuotaPreenchimento
                  $percentual={percentualQuota}
                  $atingido={
                    quota?.limiteAtingido
                  }
                />
              </QuotaBarra>

              <QuotaAjuda>
                {Number(quota?.utilizadas || 0)} usadas · renova em{' '}
                {formatarData(
                  quota?.periodo?.renovaEm,
                  true
                ) || 'data a definir'}
              </QuotaAjuda>
            </>
          )}

          <HeroLink href="/minhas-ordens">
            Ver minhas ordens <FiArrowRight />
          </HeroLink>
        </QuotaCard>
      </MercadoHero>

      <KpiGrid>
        <KpiCard
          icone={<FiBriefcase />}
          rotulo="Patrimônio total"
          valor={formatarTS(
            patrimonio.patrimonio
          )}
          detalhe={`${formatarTS(
            patrimonio.valorPosicoes
          )} em posições`}
          tom="azul"
          destaque="Saldo + posições"
        />

        <KpiCard
          icone={<FiShoppingCart />}
          rotulo="Saldo disponível"
          valor={formatarTS(patrimonio.saldo)}
          detalhe="Disponível para operações simuladas"
          tom="verde"
          destaque="T$"
        />

        <KpiCard
          icone={
            resultadoPositivo ? (
              <FiTrendingUp />
            ) : (
              <FiTrendingDown />
            )
          }
          rotulo="Resultado da temporada"
          valor={formatarTS(
            patrimonio.resultado
          )}
          detalhe={`${formatarPercentual(
            patrimonio.rentabilidade
          )} sobre o patrimônio inicial`}
          tom={
            resultadoPositivo
              ? 'verde'
              : 'vermelho'
          }
          destaque={
            resultadoPositivo
              ? 'Positivo'
              : 'Negativo'
          }
        />

        <KpiCard
          icone={<FiBarChart2 />}
          rotulo="Ranking geral"
          valor={
            dados?.ranking?.geral?.posicao
              ? `${dados.ranking.geral.posicao}º`
              : '—'
          }
          detalhe={
            dados?.ranking?.geral?.posicao
              ? `${dados.ranking.geral.total} participantes · ${dados?.ranking?.plano?.posicao || '—'}º no plano`
              : 'Você ainda não aparece no ranking'
          }
          tom="roxo"
          destaque={
            dados?.ranking?.plano?.nome ===
            'premium'
              ? 'Premium'
              : 'Lite'
          }
        />
      </KpiGrid>

      <ConteudoGrid>
        <ColunaPrincipal>
          <Card>
            <CardCabecalho>
              <div>
                <CardEyebrow>SUA CARTEIRA</CardEyebrow>
                <CardTitulo>
                  Principais posições
                </CardTitulo>
              </div>

              <CardLink href="/carteira">
                Ver carteira <FiArrowRight />
              </CardLink>
            </CardCabecalho>

            {posicoes.length === 0 ? (
              <EmptyState>
                <EmptyIcone>
                  <FiBriefcase />
                </EmptyIcone>
                <h3>Sua carteira está vazia</h3>
                <p>
                  Analise os clubes e faça sua primeira operação com T$.
                </p>
                <EmptyLink href="/brasileirao-a">
                  Explorar mercado
                </EmptyLink>
              </EmptyState>
            ) : (
              <PosicoesLista>
                {posicoes.map((posicao) => {
                  const positivo =
                    Number(
                      posicao.resultado || 0
                    ) >= 0;

                  return (
                    <PosicaoLinha
                      key={posicao.clubeId}
                      href={`/clube/${posicao.clubeId}`}
                    >
                      <ClubeInfo>
                        <ClubBadge
                          clube={posicao.nome}
                          size={42}
                        />
                        <div>
                          <strong>
                            {posicao.nome}
                          </strong>
                          <span>
                            {Number(
                              posicao.quantidade || 0
                            ).toLocaleString('pt-BR')}{' '}
                            cotas · preço médio{' '}
                            {formatarTS(
                              posicao.precoMedio
                            )}
                          </span>
                        </div>
                      </ClubeInfo>

                      <PosicaoValores>
                        <strong>
                          {formatarTS(
                            posicao.valorAtual
                          )}
                        </strong>
                        <Resultado
                          $positivo={positivo}
                        >
                          {formatarPercentual(
                            posicao.rentabilidade
                          )}
                        </Resultado>
                      </PosicaoValores>
                    </PosicaoLinha>
                  );
                })}
              </PosicoesLista>
            )}

            {posicoes.length > 0 && (
              <CarteiraResumo>
                <span>
                  {Number(
                    dados?.carteira
                      ?.quantidadePosicoes || 0
                  )}{' '}
                  posições
                </span>
                <span>
                  {Number(
                    dados?.carteira
                      ?.quantidadeUnidades || 0
                  ).toLocaleString('pt-BR')}{' '}
                  cotas no total
                </span>
              </CarteiraResumo>
            )}
          </Card>

          <Card>
            <CardCabecalho>
              <div>
                <CardEyebrow>HISTÓRICO</CardEyebrow>
                <CardTitulo>
                  Atividades recentes
                </CardTitulo>
              </div>

              <CardLink href="/extrato">
                Ver extrato <FiArrowRight />
              </CardLink>
            </CardCabecalho>

            {atividades.length === 0 ? (
              <EmptyState $compacto>
                <EmptyIcone>
                  <FiActivity />
                </EmptyIcone>
                <h3>Nenhuma atividade ainda</h3>
                <p>
                  Suas ordens e movimentações aparecerão aqui.
                </p>
              </EmptyState>
            ) : (
              <AtividadesLista>
                {atividades.map((item) => {
                  const sinal =
                    sinalAtividade(item);

                  return (
                    <AtividadeLinha
                      key={`${item.categoria}-${item.id}`}
                    >
                      <AtividadeIcone
                        $sinal={sinal}
                      >
                        {item.categoria ===
                        'ordem' ? (
                          <FiTarget />
                        ) : (
                          <FiActivity />
                        )}
                      </AtividadeIcone>

                      <AtividadeTexto>
                        <strong>
                          {labelAtividade(item)}
                        </strong>
                        <span>
                          {formatarData(
                            item.data,
                            true
                          ) || 'Data não informada'}
                          {item.status
                            ? ` · ${item.status}`
                            : ''}
                        </span>
                      </AtividadeTexto>

                      <AtividadeValor
                        $sinal={sinal}
                      >
                        {formatarTS(item.valor)}
                      </AtividadeValor>
                    </AtividadeLinha>
                  );
                })}
              </AtividadesLista>
            )}
          </Card>
        </ColunaPrincipal>

        <ColunaLateral>
          <ProximoCard>
            <ProximoIcone>
              <FiZap />
            </ProximoIcone>
            <CardEyebrow>PRÓXIMA AÇÃO</CardEyebrow>
            <ProximoTitulo>
              {proximoPasso.titulo}
            </ProximoTitulo>
            <ProximoTexto>
              {proximoPasso.texto}
            </ProximoTexto>
            <ProximoLink href={proximoPasso.href}>
              {proximoPasso.acao}{' '}
              <FiArrowRight />
            </ProximoLink>
          </ProximoCard>

          <Card>
            <CardCabecalho>
              <div>
                <CardEyebrow>ORDENS</CardEyebrow>
                <CardTitulo>
                  Em aberto
                </CardTitulo>
              </div>

              <NumeroDestaque>
                {Number(
                  ordensAbertas.total || 0
                )}
              </NumeroDestaque>
            </CardCabecalho>

            <OrdensGrid>
              <OrdemMetrica>
                <span>Compra</span>
                <strong>
                  {Number(
                    ordensAbertas.compra || 0
                  )}
                </strong>
              </OrdemMetrica>
              <OrdemMetrica>
                <span>Venda</span>
                <strong>
                  {Number(
                    ordensAbertas.venda || 0
                  )}
                </strong>
              </OrdemMetrica>
            </OrdensGrid>

            <OrdemTotal>
              <span>Valor em aberto</span>
              <strong>
                {formatarTS(
                  ordensAbertas.valorEmAberto
                )}
              </strong>
            </OrdemTotal>

            <CardLinkGrande href="/minhas-ordens">
              Gerenciar ordens <FiArrowRight />
            </CardLinkGrande>
          </Card>

          <AtalhosCard>
            <CardEyebrow>ATALHOS</CardEyebrow>
            <AtalhosGrid>
              <Atalho href="/brasileirao-a">
                <FiTrendingUp />
                <span>Mercados</span>
              </Atalho>
              <Atalho href="/carteira">
                <FiBriefcase />
                <span>Carteira</span>
              </Atalho>
              <Atalho href="/ranking">
                <FiBarChart2 />
                <span>Ranking</span>
              </Atalho>
              <Atalho href="/extrato">
                <FiActivity />
                <span>Extrato</span>
              </Atalho>
            </AtalhosGrid>
          </AtalhosCard>
        </ColunaLateral>
      </ConteudoGrid>

      <RodapeNota>
        <span>Simulação educacional</span>
        Os valores são expressos em T$ e não representam dinheiro real,
        investimento ou promessa de retorno.
      </RodapeNota>
    </Container>
  );
}

export default withAuth(DashboardPage);

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: .42; }
`;

const shine = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Container = styled.div`
  width: min(1440px, 100%);
  margin: 0 auto;
  padding: 10px 4px 30px;
  color: #f8fafc;

  @media (max-width: 640px) {
    padding-top: 4px;
  }
`;

const Cabecalho = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;

  @media (max-width: 760px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const Eyebrow = styled.div`
  margin-bottom: 7px;
  color: #60a5fa;
  font-size: 0.69rem;
  font-weight: 900;
  letter-spacing: 0.13em;

  @media (max-width: 640px) {
    font-size: 0.75rem;
  }
`;

const Titulo = styled.h1`
  margin: 0;
  color: #f8fafc;
  font-size: clamp(1.75rem, 3vw, 2.55rem);
  line-height: 1.08;
  letter-spacing: -0.04em;
`;

const Subtitulo = styled.p`
  margin: 9px 0 0;
  color: #94a3b8;
  font-size: 0.86rem;
  line-height: 1.55;
`;

const CabecalhoAcoes = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const SimuladoBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 38px;
  padding: 0 13px;
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.07);
  color: #86efac;
  font-size: 0.68rem;
  font-weight: 850;
  letter-spacing: 0.04em;
  text-transform: uppercase;

  @media (max-width: 640px) {
    min-height: 44px;
    font-size: 0.73rem;
  }
`;

const StatusDot = styled.i`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 10px #22c55e;
  animation: ${pulse} 2s infinite;
`;

const AtualizarButton = styled.button`
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 13px;
  border: 1px solid rgba(148, 163, 184, 0.17);
  border-radius: 11px;
  background: rgba(15, 23, 42, 0.68);
  color: #cbd5e1;
  font-size: 0.71rem;
  font-weight: 800;
  cursor: pointer;
  transition: 0.18s ease;

  &:hover:not(:disabled) {
    color: #fff;
    border-color: rgba(96, 165, 250, 0.42);
    background: rgba(30, 41, 59, 0.84);
  }

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  .girando {
    animation: ${spin} 0.8s linear infinite;
  }

  @media (max-width: 640px) {
    font-size: 0.78rem;
  }
`;

const AvisoAtualizacao = styled.div`
  margin-top: 18px;
  padding: 11px 13px;
  border: 1px solid rgba(245, 158, 11, 0.22);
  border-radius: 12px;
  background: rgba(245, 158, 11, 0.07);
  color: #fcd34d;
  font-size: 0.72rem;

  @media (max-width: 640px) {
    font-size: 0.8rem;
    line-height: 1.45;
  }
`;

const MercadoHero = styled.section`
  position: relative;
  min-height: 190px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 310px;
  gap: 28px;
  margin-top: 25px;
  padding: 27px 29px;
  overflow: hidden;
  border: 1px solid
    ${({ $aberto }) =>
      $aberto
        ? 'rgba(34,197,94,.2)'
        : 'rgba(148,163,184,.16)'};
  border-radius: 22px;
  background:
    radial-gradient(
      circle at 17% 20%,
      ${({ $aberto }) =>
          $aberto
            ? 'rgba(34,197,94,.13)'
            : 'rgba(59,130,246,.11)'},
      transparent 34%
    ),
    linear-gradient(
      135deg,
      rgba(15, 31, 51, 0.98),
      rgba(7, 17, 33, 0.98)
    );
  box-shadow: 0 18px 48px rgba(2, 6, 23, 0.23);

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(
        rgba(96, 165, 250, 0.025) 1px,
        transparent 1px
      ),
      linear-gradient(
        90deg,
        rgba(96, 165, 250, 0.025) 1px,
        transparent 1px
      );
    background-size: 38px 38px;
    mask-image: linear-gradient(
      90deg,
      #000,
      transparent 72%
    );
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 640px) {
    padding: 22px 18px;
    border-radius: 18px;
  }
`;

const HeroConteudo = styled.div`
  position: relative;
  z-index: 1;
`;

const HeroStatus = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #cbd5e1;
  font-size: 0.69rem;
  font-weight: 850;
  letter-spacing: 0.07em;
  text-transform: uppercase;

  @media (max-width: 640px) {
    font-size: 0.74rem;
  }
`;

const HeroStatusDot = styled.i`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $aberto }) =>
    $aberto ? '#22c55e' : '#f59e0b'};
  box-shadow: 0 0 13px
    ${({ $aberto }) =>
      $aberto ? '#22c55e' : '#f59e0b'};
`;

const HeroTitulo = styled.h2`
  margin: 11px 0 0;
  color: #fff;
  font-size: clamp(1.4rem, 2.4vw, 2rem);
  letter-spacing: -0.035em;
`;

const HeroTexto = styled.p`
  max-width: 720px;
  margin: 9px 0 0;
  color: #94a3b8;
  font-size: 0.79rem;
  line-height: 1.6;

  @media (max-width: 640px) {
    font-size: 0.88rem;
  }
`;

const HeroMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 22px;
  margin-top: 22px;
  flex-wrap: wrap;

  @media (max-width: 420px) {
    display: grid;
    grid-template-columns: 1fr;
    gap: 13px;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #60a5fa;

  > svg {
    font-size: 1rem;
  }

  span {
    display: grid;
    gap: 2px;
  }

  small {
    color: #64748b;
    font-size: 0.61rem;
  }

  strong {
    color: #e2e8f0;
    font-size: 0.72rem;
  }

  @media (max-width: 640px) {
    small {
      font-size: 0.72rem;
    }

    strong {
      font-size: 0.82rem;
    }
  }
`;

const QuotaCard = styled.div`
  position: relative;
  z-index: 1;
  align-self: stretch;
  padding: 18px;
  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 17px;
  background: rgba(2, 6, 23, 0.42);
  backdrop-filter: blur(9px);
`;

const QuotaTopo = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  > svg {
    color: #4ade80;
    font-size: 1.18rem;
  }
`;

const QuotaRotulo = styled.div`
  color: #64748b;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;

  @media (max-width: 640px) {
    font-size: 0.72rem;
  }
`;

const QuotaPlano = styled.div`
  margin-top: 4px;
  color: ${({ $premium }) =>
    $premium ? '#c4b5fd' : '#93c5fd'};
  font-size: 0.69rem;
  font-weight: 850;

  @media (max-width: 640px) {
    font-size: 0.78rem;
  }
`;

const QuotaValor = styled.div`
  margin-top: 16px;
  color: #f8fafc;
  font-size: 1.42rem;
  font-weight: 900;
  letter-spacing: -0.035em;

  span {
    color: #64748b;
    font-size: 0.67rem;
    font-weight: 700;
    letter-spacing: 0;
  }

  @media (max-width: 640px) {
    span {
      font-size: 0.76rem;
    }
  }
`;

const QuotaBarra = styled.div`
  height: 7px;
  margin-top: 13px;
  overflow: hidden;
  border-radius: 99px;
  background: rgba(148, 163, 184, 0.12);
`;

const QuotaPreenchimento = styled.div`
  width: ${({ $percentual }) =>
    `${$percentual}%`};
  height: 100%;
  border-radius: inherit;
  background: ${({ $atingido }) =>
    $atingido
      ? 'linear-gradient(90deg,#ef4444,#f97316)'
      : 'linear-gradient(90deg,#2563eb,#22c55e)'};
  transition: width 0.3s ease;
`;

const QuotaAjuda = styled.div`
  margin-top: 9px;
  color: #64748b;
  font-size: 0.61rem;
  line-height: 1.45;

  @media (max-width: 640px) {
    font-size: 0.74rem;
  }
`;

const HeroLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 15px;
  color: #93c5fd;
  font-size: 0.67rem;
  font-weight: 850;
  text-decoration: none;
  min-height: 44px;
  align-items: center;

  &:hover {
    color: #fff;
  }

  @media (max-width: 640px) {
    font-size: 0.76rem;
  }
`;

const KpiGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: 16px;

  @media (max-width: 1160px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Kpi = styled.article`
  min-width: 0;
  padding: 17px 18px 16px;
  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 18px;
  background: linear-gradient(
    145deg,
    rgba(15, 31, 51, 0.95),
    rgba(9, 20, 36, 0.96)
  );
  box-shadow: 0 10px 28px rgba(2, 6, 23, 0.16);
`;

const KpiTopo = styled.div`
  min-height: 31px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
`;

const KpiIcone = styled.div`
  width: 31px;
  height: 31px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: ${({ $tom }) => {
    if ($tom === 'verde')
      return 'rgba(34,197,94,.1)';
    if ($tom === 'vermelho')
      return 'rgba(239,68,68,.1)';
    if ($tom === 'roxo')
      return 'rgba(139,92,246,.1)';
    return 'rgba(59,130,246,.1)';
  }};
  color: ${({ $tom }) => {
    if ($tom === 'verde') return '#4ade80';
    if ($tom === 'vermelho') return '#f87171';
    if ($tom === 'roxo') return '#c4b5fd';
    return '#60a5fa';
  }};
`;

const KpiBadge = styled.span`
  padding: 5px 8px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.07);
  color: ${({ $tom }) => {
    if ($tom === 'verde') return '#86efac';
    if ($tom === 'vermelho') return '#fca5a5';
    if ($tom === 'roxo') return '#c4b5fd';
    return '#93c5fd';
  }};
  font-size: 0.57rem;
  font-weight: 850;

  @media (max-width: 640px) {
    font-size: 0.7rem;
  }
`;

const KpiRotulo = styled.div`
  margin-top: 13px;
  color: #64748b;
  font-size: 0.66rem;
  font-weight: 750;

  @media (max-width: 640px) {
    font-size: 0.76rem;
  }
`;

const KpiValor = styled.div`
  margin-top: 4px;
  overflow: hidden;
  color: ${({ $tom }) => {
    if ($tom === 'verde') return '#86efac';
    if ($tom === 'vermelho') return '#fca5a5';
    if ($tom === 'roxo') return '#ddd6fe';
    return '#f8fafc';
  }};
  font-size: clamp(1.25rem, 2vw, 1.68rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 640px) {
    overflow: visible;
    text-overflow: clip;
    white-space: normal;
    overflow-wrap: anywhere;
  }
`;

const KpiDetalhe = styled.div`
  margin-top: 6px;
  color: #64748b;
  font-size: 0.61rem;
  line-height: 1.4;

  @media (max-width: 640px) {
    font-size: 0.74rem;
  }
`;

const ConteudoGrid = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(300px, 0.75fr);
  gap: 16px;
  margin-top: 16px;

  @media (max-width: 1040px) {
    grid-template-columns: 1fr;
  }
`;

const ColunaPrincipal = styled.div`
  display: grid;
  align-content: start;
  gap: 16px;
`;

const ColunaLateral = styled.aside`
  display: grid;
  align-content: start;
  gap: 16px;
`;

const Card = styled.article`
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 20px;
  background: linear-gradient(
    145deg,
    rgba(15, 31, 51, 0.95),
    rgba(9, 20, 36, 0.97)
  );
`;

const CardCabecalho = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 19px 20px 15px;

  @media (max-width: 600px) {
    align-items: flex-start;
    padding: 16px 15px 13px;
  }
`;

const CardEyebrow = styled.div`
  color: #60a5fa;
  font-size: 0.59rem;
  font-weight: 900;
  letter-spacing: 0.11em;

  @media (max-width: 640px) {
    font-size: 0.7rem;
  }
`;

const CardTitulo = styled.h2`
  margin: 5px 0 0;
  color: #f8fafc;
  font-size: 1.02rem;
  letter-spacing: -0.02em;
`;

const CardLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #93c5fd;
  font-size: 0.64rem;
  font-weight: 850;
  text-decoration: none;
  white-space: nowrap;
  min-height: 44px;
  align-items: center;

  &:hover {
    color: #fff;
  }

  @media (max-width: 640px) {
    font-size: 0.75rem;
  }
`;

const PosicoesLista = styled.div`
  border-top: 1px solid rgba(148, 163, 184, 0.09);
`;

const PosicaoLinha = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
  color: inherit;
  text-decoration: none;
  transition: 0.17s ease;

  &:hover {
    background: rgba(59, 130, 246, 0.055);
  }

  @media (max-width: 600px) {
    align-items: flex-start;
    padding: 14px 15px;
  }
`;

const ClubeInfo = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;

  > div:last-child {
    min-width: 0;
    display: grid;
    gap: 4px;
  }

  strong {
    overflow: hidden;
    color: #e2e8f0;
    font-size: 0.76rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    overflow: hidden;
    color: #64748b;
    font-size: 0.6rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 600px) {
    strong {
      font-size: 0.84rem;
    }

    span {
      max-width: 170px;
      font-size: 0.72rem;
      white-space: normal;
    }
  }
`;

const PosicaoValores = styled.div`
  flex: 0 0 auto;
  display: grid;
  justify-items: end;
  gap: 4px;

  strong {
    color: #f8fafc;
    font-size: 0.75rem;
  }

  @media (max-width: 600px) {
    min-width: 82px;

    strong {
      font-size: 0.82rem;
      overflow-wrap: anywhere;
      text-align: right;
    }
  }
`;

const Resultado = styled.span`
  color: ${({ $positivo }) =>
    $positivo ? '#4ade80' : '#f87171'};
  font-size: 0.62rem;
  font-weight: 850;

  @media (max-width: 640px) {
    font-size: 0.75rem;
  }
`;

const CarteiraResumo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(2, 6, 23, 0.24);
  color: #64748b;
  font-size: 0.61rem;

  @media (max-width: 640px) {
    padding: 12px 15px;
    font-size: 0.72rem;
  }
`;

const EmptyState = styled.div`
  display: grid;
  justify-items: center;
  padding: ${({ $compacto }) =>
    $compacto ? '30px 20px 34px' : '36px 20px 40px'};
  border-top: 1px solid rgba(148, 163, 184, 0.09);
  text-align: center;

  h3 {
    margin: 12px 0 0;
    color: #e2e8f0;
    font-size: 0.86rem;
  }

  p {
    max-width: 360px;
    margin: 7px 0 0;
    color: #64748b;
    font-size: 0.68rem;
    line-height: 1.5;
  }

  @media (max-width: 640px) {
    h3 {
      font-size: 0.95rem;
    }

    p {
      font-size: 0.78rem;
    }
  }
`;

const EmptyIcone = styled.div`
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  background: rgba(59, 130, 246, 0.09);
  color: #60a5fa;
`;

const EmptyLink = styled(Link)`
  margin-top: 14px;
  padding: 9px 13px;
  border-radius: 9px;
  background: #2563eb;
  color: #fff;
  font-size: 0.66rem;
  font-weight: 850;
  text-decoration: none;
  min-height: 44px;
  display: inline-flex;
  align-items: center;

  @media (max-width: 640px) {
    font-size: 0.76rem;
  }
`;

const AtividadesLista = styled.div`
  border-top: 1px solid rgba(148, 163, 184, 0.09);
`;

const AtividadeLinha = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 11px;
  padding: 13px 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.07);

  &:last-child {
    border-bottom: 0;
  }

  @media (max-width: 600px) {
    padding: 13px 15px;
  }
`;

const AtividadeIcone = styled.div`
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: ${({ $sinal }) =>
    $sinal === 'positivo'
      ? 'rgba(34,197,94,.09)'
      : $sinal === 'negativo'
      ? 'rgba(59,130,246,.09)'
      : 'rgba(148,163,184,.08)'};
  color: ${({ $sinal }) =>
    $sinal === 'positivo'
      ? '#4ade80'
      : $sinal === 'negativo'
      ? '#60a5fa'
      : '#94a3b8'};
`;

const AtividadeTexto = styled.div`
  min-width: 0;
  display: grid;
  gap: 4px;

  strong {
    overflow: hidden;
    color: #cbd5e1;
    font-size: 0.68rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    color: #64748b;
    font-size: 0.57rem;
    text-transform: capitalize;
  }

  @media (max-width: 640px) {
    strong {
      font-size: 0.78rem;
      white-space: normal;
    }

    span {
      font-size: 0.7rem;
    }
  }
`;

const AtividadeValor = styled.div`
  color: ${({ $sinal }) =>
    $sinal === 'positivo'
      ? '#86efac'
      : $sinal === 'negativo'
      ? '#bfdbfe'
      : '#94a3b8'};
  font-size: 0.67rem;
  font-weight: 850;

  @media (max-width: 640px) {
    max-width: 92px;
    font-size: 0.78rem;
    overflow-wrap: anywhere;
    text-align: right;
  }
`;

const ProximoCard = styled.article`
  position: relative;
  overflow: hidden;
  padding: 21px;
  border: 1px solid rgba(59, 130, 246, 0.22);
  border-radius: 20px;
  background:
    radial-gradient(
      circle at 90% 10%,
      rgba(34, 197, 94, 0.13),
      transparent 34%
    ),
    linear-gradient(
      145deg,
      rgba(16, 40, 67, 0.98),
      rgba(8, 21, 39, 0.98)
    );
`;

const ProximoIcone = styled.div`
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  margin-bottom: 22px;
  border-radius: 13px;
  background: linear-gradient(135deg, #2563eb, #16a34a);
  color: #fff;
  box-shadow: 0 10px 26px rgba(37, 99, 235, 0.24);
`;

const ProximoTitulo = styled.h2`
  margin: 7px 0 0;
  color: #f8fafc;
  font-size: 1.2rem;
  line-height: 1.2;
  letter-spacing: -0.035em;
`;

const ProximoTexto = styled.p`
  margin: 10px 0 0;
  color: #94a3b8;
  font-size: 0.7rem;
  line-height: 1.6;

  @media (max-width: 640px) {
    font-size: 0.8rem;
  }
`;

const ProximoLink = styled(Link)`
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 18px;
  border-radius: 11px;
  background: #2563eb;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 900;
  text-decoration: none;
  transition: 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    background: #1d4ed8;
  }

  @media (max-width: 640px) {
    font-size: 0.8rem;
  }
`;

const NumeroDestaque = styled.div`
  min-width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.11);
  color: #93c5fd;
  font-size: 1rem;
  font-weight: 900;
`;

const OrdensGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 0 20px 15px;
`;

const OrdemMetrica = styled.div`
  padding: 12px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
  background: rgba(2, 6, 23, 0.22);

  span {
    color: #64748b;
    font-size: 0.61rem;
  }

  strong {
    display: block;
    margin-top: 4px;
    color: #e2e8f0;
    font-size: 1rem;
  }

  @media (max-width: 640px) {
    span {
      font-size: 0.74rem;
    }
  }
`;

const OrdemTotal = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin: 0 20px;
  padding: 12px 0;
  border-top: 1px solid rgba(148, 163, 184, 0.09);
  color: #64748b;
  font-size: 0.62rem;

  strong {
    color: #cbd5e1;
    font-size: 0.7rem;
  }

  @media (max-width: 640px) {
    font-size: 0.74rem;

    strong {
      font-size: 0.8rem;
    }
  }
`;

const CardLinkGrande = styled(Link)`
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin: 4px 20px 20px;
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 10px;
  background: rgba(59, 130, 246, 0.07);
  color: #93c5fd;
  font-size: 0.66rem;
  font-weight: 850;
  text-decoration: none;

  &:hover {
    color: #fff;
    background: rgba(59, 130, 246, 0.13);
  }

  @media (max-width: 640px) {
    font-size: 0.78rem;
  }
`;

const AtalhosCard = styled(Card)`
  padding: 19px 20px 20px;
`;

const AtalhosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 9px;
  margin-top: 13px;
`;

const Atalho = styled(Link)`
  min-height: 66px;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 7px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
  background: rgba(2, 6, 23, 0.22);
  color: #94a3b8;
  font-size: 0.61rem;
  font-weight: 750;
  text-decoration: none;
  transition: 0.17s ease;

  svg {
    color: #60a5fa;
    font-size: 1rem;
  }

  &:hover {
    color: #e2e8f0;
    border-color: rgba(96, 165, 250, 0.27);
    background: rgba(59, 130, 246, 0.07);
  }

  @media (max-width: 640px) {
    min-height: 72px;
    font-size: 0.76rem;
  }
`;

const RodapeNota = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 18px;
  color: #475569;
  font-size: 0.57rem;
  text-align: center;

  span {
    padding: 4px 7px;
    border: 1px solid rgba(34, 197, 94, 0.14);
    border-radius: 999px;
    color: #4ade80;
    font-weight: 850;
    white-space: nowrap;
  }

  @media (max-width: 600px) {
    align-items: flex-start;
    font-size: 0.7rem;
    line-height: 1.45;
    text-align: left;
  }
`;

const ErroCard = styled.section`
  max-width: 560px;
  display: grid;
  justify-items: center;
  margin: 90px auto;
  padding: 38px 28px;
  border: 1px solid rgba(239, 68, 68, 0.19);
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.72);
  text-align: center;

  h1 {
    margin: 14px 0 0;
    color: #f8fafc;
    font-size: 1.2rem;
  }

  p {
    margin: 8px 0 0;
    color: #94a3b8;
    font-size: 0.75rem;
  }
`;

const ErroIcone = styled.div`
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  font-size: 1rem;
  font-weight: 900;
`;

const RetryButton = styled.button`
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  padding: 0 15px;
  border: 0;
  border-radius: 10px;
  background: #2563eb;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 850;
  cursor: pointer;
`;

const Skeleton = styled.div`
  width: ${({ $largura }) =>
    $largura || '100%'};
  height: ${({ $altura }) =>
    $altura || '14px'};
  margin: ${({ $margem }) =>
    $margem || '0'};
  border-radius: ${({ $raio }) =>
    $raio || '7px'};
  background: linear-gradient(
    90deg,
    rgba(148, 163, 184, 0.07) 25%,
    rgba(148, 163, 184, 0.14) 50%,
    rgba(148, 163, 184, 0.07) 75%
  );
  background-size: 200% 100%;
  animation: ${shine} 1.5s infinite;
`;
