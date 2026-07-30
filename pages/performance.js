import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import {
  FiActivity,
  FiAward,
  FiBarChart2,
  FiInfo,
  FiLock,
  FiRefreshCw,
  FiTarget,
  FiTrendingDown,
  FiTrendingUp,
} from 'react-icons/fi';
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

import api from '../lib/api';
import ClubBadge from '../components/ClubBadge';
import withAuth from '../components/withAuth';

ChartJS.register(
  ArcElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
);

const CORES = ['#00d982', '#38bdf8', '#a78bfa', '#fbbf24', '#fb7185', '#94a3b8'];

function moeda(valor) {
  return `T$ ${Number(valor || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function percentual(valor) {
  const numero = Number(valor || 0);
  return `${numero > 0 ? '+' : ''}${numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

function dataCurta(valor) {
  return new Date(valor).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

function Kpi({ titulo, valor, detalhe, tom = 'neutro', icone }) {
  return (
    <KpiCard>
      <KpiTopo>
        <KpiIcone $tom={tom}>{icone}</KpiIcone>
        <KpiTitulo>{titulo}</KpiTitulo>
      </KpiTopo>
      <KpiValor $tom={tom}>{valor}</KpiValor>
      <KpiDetalhe>{detalhe}</KpiDetalhe>
    </KpiCard>
  );
}

function Bloqueado({ titulo, texto }) {
  return (
    <LockedCard>
      <LockIcon><FiLock /></LockIcon>
      <div>
        <LockedTitle>{titulo}</LockedTitle>
        <LockedText>{texto}</LockedText>
      </div>
      <Upgrade href="/planos">Conhecer Premium</Upgrade>
    </LockedCard>
  );
}

function PerformancePage() {
  const [periodo, setPeriodo] = useState('30d');
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async (silencioso = false) => {
    silencioso ? setAtualizando(true) : setCarregando(true);
    setErro('');
    try {
      const { data } = await api.get('/performance', { params: { periodo } });
      setDados(data);
    } catch (err) {
      setErro(
        err?.response?.data?.erro ||
          'Não foi possível carregar sua Central de Performance.'
      );
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, [periodo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const resumo = dados?.resumo || {};
  const clubes = dados?.carteira?.porClube || [];
  const curva = dados?.curvaPatrimonial || [];
  const positivo = Number(resumo.resultadoDoPeriodo ?? resumo.resultadoNaoRealizado) >= 0;

  const linha = useMemo(() => ({
    labels: curva.map((item) => dataCurta(item.data)),
    datasets: [{
      label: 'Patrimônio',
      data: curva.map((item) => item.patrimonio),
      borderColor: '#00d982',
      backgroundColor: 'rgba(0, 217, 130, 0.12)',
      fill: true,
      tension: 0.35,
      pointRadius: curva.length > 15 ? 0 : 3,
    }],
  }), [curva]);

  const composicao = useMemo(() => ({
    labels: clubes.slice(0, 6).map((item) => item.nome),
    datasets: [{
      data: clubes.slice(0, 6).map((item) => item.valorAtual),
      backgroundColor: CORES,
      borderWidth: 0,
    }],
  }), [clubes]);

  if (carregando) {
    return <Estado><Spinner /><h2>Calculando sua performance...</h2><p>Consolidando carteira, operações e ranking.</p></Estado>;
  }

  if (erro) {
    return <Estado><FiActivity size={36} /><h2>Não foi possível carregar</h2><p>{erro}</p><Retry onClick={() => carregar()}>Tentar novamente</Retry></Estado>;
  }

  return (
    <Page>
      <Header>
        <div>
          <Eyebrow><FiActivity /> Inteligência da carteira</Eyebrow>
          <Title>Central de Performance</Title>
          <Subtitle>Entenda de onde vem seu resultado e acompanhe a evolução da sua estratégia.</Subtitle>
        </div>
        <HeaderActions>
          <Periodos aria-label="Período da análise">
            {[
              ['7d', '7 dias'],
              ['30d', '30 dias'],
              ['temporada', 'Temporada'],
            ].map(([valor, label]) => (
              <Periodo
                key={valor}
                type="button"
                $ativo={periodo === valor}
                onClick={() => setPeriodo(valor)}
              >
                {label}
              </Periodo>
            ))}
          </Periodos>
          <Refresh
            type="button"
            onClick={() => carregar(true)}
            disabled={atualizando}
            aria-label="Atualizar indicadores"
          >
            <FiRefreshCw className={atualizando ? 'girando' : ''} />
          </Refresh>
        </HeaderActions>
      </Header>

      <Kpis>
        <Kpi
          titulo="Patrimônio atual"
          valor={moeda(resumo.patrimonioAtual)}
          detalhe={`Variação acumulada ${percentual(resumo.variacaoAcumulada)}`}
          tom={Number(resumo.variacaoAcumulada) >= 0 ? 'positivo' : 'negativo'}
          icone={<FiBarChart2 />}
        />
        <Kpi
          titulo="Resultado no período"
          valor={dados?.premium ? moeda(resumo.resultadoDoPeriodo) : moeda(resumo.resultadoNaoRealizado)}
          detalhe={dados?.premium ? 'Realizado, posições abertas e dividendos' : 'Resultado atual das posições abertas'}
          tom={positivo ? 'positivo' : 'negativo'}
          icone={positivo ? <FiTrendingUp /> : <FiTrendingDown />}
        />
        {dados?.premium ? (
          <>
            <Kpi titulo="Resultado realizado" valor={moeda(resumo.resultadoRealizado)} detalhe="Vendas e liquidações concluídas" tom={Number(resumo.resultadoRealizado) >= 0 ? 'positivo' : 'negativo'} icone={<FiTarget />} />
            <Kpi titulo="Taxa de acerto" valor={resumo.taxaAcerto == null ? '—' : percentual(resumo.taxaAcerto)} detalhe={`${resumo.operacoesEncerradas || 0} operação(ões) encerrada(s)`} tom="destaque" icone={<FiAward />} />
          </>
        ) : (
          <MiniLock><FiLock /><span>Mais dois indicadores disponíveis no Premium</span></MiniLock>
        )}
      </Kpis>

      {!dados?.premium ? (
        <>
          <LiteCallout>
            <div>
              <BadgeLite>PRÉVIA LITE</BadgeLite>
              <h2>Sua estratégia tem mais histórias para contar.</h2>
              <p>Desbloqueie evolução patrimonial, resultados realizados, taxas, dividendos, concentração, taxa de acerto e desempenho por clube.</p>
            </div>
            <UpgradePrimary href="/planos">Ver Central completa</UpgradePrimary>
          </LiteCallout>
          <LockedGrid>
            <Bloqueado titulo="Curva patrimonial" texto="Acompanhe a evolução diária do patrimônio." />
            <Bloqueado titulo="Desempenho por clube" texto="Descubra quais posições geram ou reduzem resultado." />
            <Bloqueado titulo="Qualidade das operações" texto="Veja taxa de acerto e melhores negociações." />
          </LockedGrid>
        </>
      ) : (
        <>
          <ChartGrid>
            <Panel>
              <PanelHeader>
                <div><PanelTitle>Evolução patrimonial</PanelTitle><PanelText>Snapshots diários disponíveis desde a ativação da Central.</PanelText></div>
                <Info title={dados?.metodologia?.curvaPatrimonial}><FiInfo /></Info>
              </PanelHeader>
              <ChartBox>
                {curva.length > 1 ? (
                  <Line
                    data={linha}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { grid: { display: false }, ticks: { color: '#64748b' } },
                        y: { grid: { color: 'rgba(148,163,184,.12)' }, ticks: { color: '#64748b' } },
                      },
                    }}
                  />
                ) : (
                  <EmptyChart><FiActivity /><strong>Primeiro ponto registrado</strong><span>A curva aparecerá conforme novos snapshots diários forem gravados.</span></EmptyChart>
                )}
              </ChartBox>
            </Panel>
            <Panel>
              <PanelHeader><div><PanelTitle>Composição da carteira</PanelTitle><PanelText>Distribuição pelo valor atual das posições.</PanelText></div></PanelHeader>
              <DonutBox>
                {clubes.length ? (
                  <Doughnut
                    data={composicao}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '68%',
                      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 14 } } },
                    }}
                  />
                ) : (
                  <EmptyChart><FiBarChart2 /><strong>Carteira sem posições</strong><span>Quando você comprar cotas, a composição aparecerá aqui.</span></EmptyChart>
                )}
              </DonutBox>
            </Panel>
          </ChartGrid>

          <StatsStrip>
            <Stat><span>Taxas pagas</span><strong>{moeda(resumo.taxasPagas)}</strong></Stat>
            <Stat><span>Dividendos recebidos</span><strong>{moeda(resumo.dividendosRecebidos)}</strong></Stat>
            <Stat><span>Ordens executadas</span><strong>{resumo.ordensExecutadas || 0}</strong></Stat>
            <Stat><span>Maior concentração</span><strong>{percentual(dados?.carteira?.concentracaoMaiorPosicao)}</strong></Stat>
            <Stat><span>Ranking geral</span><strong>{dados?.ranking?.posicaoGeral ? `#${dados.ranking.posicaoGeral}` : '—'}</strong></Stat>
          </StatsStrip>

          <Panel>
            <PanelHeader><div><PanelTitle>Contribuição por clube</PanelTitle><PanelText>Resultado realizado e não realizado de cada posição atual.</PanelText></div></PanelHeader>
            {clubes.length ? (
              <TableWrap>
                <Table>
                  <thead><tr><th>Clube</th><th>Valor atual</th><th>Concentração</th><th>Realizado</th><th>Não realizado</th><th>Resultado total</th></tr></thead>
                  <tbody>
                    {clubes.map((item) => (
                      <tr key={item.clubeId}>
                        <td><Club><ClubBadge clube={{ id: item.clubeId, nome: item.nome, escudo: item.escudo }} size={34} /><div><strong>{item.nome}</strong><small>{item.liga}</small></div></Club></td>
                        <td>{moeda(item.valorAtual)}</td>
                        <td>{percentual(item.concentracao)}</td>
                        <Result $positivo={item.resultadoRealizado >= 0}>{moeda(item.resultadoRealizado)}</Result>
                        <Result $positivo={item.resultadoNaoRealizado >= 0}>{moeda(item.resultadoNaoRealizado)}</Result>
                        <Result $positivo={item.resultadoTotal >= 0}><strong>{moeda(item.resultadoTotal)}</strong></Result>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrap>
            ) : <EmptyRow>Você ainda não possui posições para analisar.</EmptyRow>}
          </Panel>

          <BottomGrid>
            <Panel>
              <PanelTitle>Melhor negociação</PanelTitle>
              <TradeCard $positivo>
                <FiTrendingUp />
                <div><strong>{dados?.negociacoes?.melhor?.clubeNome || 'Nenhuma encerrada'}</strong><span>{dados?.negociacoes?.melhor ? `${dados.negociacoes.melhor.quantidade} cotas` : 'O indicador será calculado após uma venda ou liquidação.'}</span></div>
                <b>{dados?.negociacoes?.melhor ? moeda(dados.negociacoes.melhor.resultado) : '—'}</b>
              </TradeCard>
            </Panel>
            <Panel>
              <PanelTitle>Pior negociação</PanelTitle>
              <TradeCard $positivo={false}>
                <FiTrendingDown />
                <div><strong>{dados?.negociacoes?.pior?.clubeNome || 'Nenhuma encerrada'}</strong><span>{dados?.negociacoes?.pior ? `${dados.negociacoes.pior.quantidade} cotas` : 'O indicador será calculado após uma venda ou liquidação.'}</span></div>
                <b>{dados?.negociacoes?.pior ? moeda(dados.negociacoes.pior.resultado) : '—'}</b>
              </TradeCard>
            </Panel>
          </BottomGrid>

          <Method>
            <FiInfo />
            <div><strong>Metodologia transparente</strong><span>{dados?.metodologia?.taxaAcerto}</span></div>
          </Method>
        </>
      )}
    </Page>
  );
}

export default withAuth(PerformancePage);

const Page = styled.main`max-width: 1440px; margin: 0 auto; padding: 8px 4px 34px; color: #0f172a;`;
const Header = styled.header`display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin-bottom:24px;@media(max-width:900px){align-items:flex-start;flex-direction:column;}`;
const Eyebrow = styled.div`display:flex;align-items:center;gap:8px;color:#008f59;font-weight:800;font-size:.78rem;text-transform:uppercase;letter-spacing:.08em;`;
const Title = styled.h1`font-size:clamp(1.75rem,3vw,2.45rem);margin:7px 0 5px;letter-spacing:-.04em;`;
const Subtitle = styled.p`margin:0;color:#64748b;max-width:680px;`;
const HeaderActions = styled.div`display:flex;align-items:center;gap:10px;`;
const Periodos = styled.div`display:flex;padding:4px;background:#eef2f7;border-radius:13px;`;
const Periodo = styled.button`border:0;border-radius:10px;padding:9px 13px;background:${({$ativo})=>$ativo?'#fff':'transparent'};color:${({$ativo})=>$ativo?'#0f172a':'#64748b'};font-weight:800;cursor:pointer;box-shadow:${({$ativo})=>$ativo?'0 2px 8px rgba(15,23,42,.08)':'none'};`;
const Refresh = styled.button`width:42px;height:42px;border:1px solid #dbe3ec;background:#fff;border-radius:12px;display:grid;place-items:center;cursor:pointer;.girando{animation:spin .8s linear infinite;}@keyframes spin{to{transform:rotate(360deg)}}`;
const Kpis = styled.section`display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:20px;@media(max-width:1050px){grid-template-columns:repeat(2,1fr)}@media(max-width:560px){grid-template-columns:1fr}`;
const KpiCard = styled.article`padding:18px;background:#fff;border:1px solid #e2e8f0;border-radius:18px;box-shadow:0 8px 24px rgba(15,23,42,.04);`;
const KpiTopo = styled.div`display:flex;align-items:center;gap:10px;`;
const KpiIcone = styled.div`width:36px;height:36px;border-radius:11px;display:grid;place-items:center;background:${({$tom})=>$tom==='positivo'?'#e7fff4':$tom==='negativo'?'#fff0f0':$tom==='destaque'?'#eff6ff':'#f1f5f9'};color:${({$tom})=>$tom==='positivo'?'#008f59':$tom==='negativo'?'#dc2626':$tom==='destaque'?'#2563eb':'#475569'};`;
const KpiTitulo = styled.span`font-size:.82rem;color:#64748b;font-weight:700;`;
const KpiValor = styled.div`font-size:1.45rem;font-weight:900;margin:15px 0 4px;color:${({$tom})=>$tom==='positivo'?'#008f59':$tom==='negativo'?'#dc2626':'#0f172a'};`;
const KpiDetalhe = styled.div`font-size:.76rem;color:#94a3b8;`;
const MiniLock = styled.div`grid-column:span 2;border:1px dashed #cbd5e1;border-radius:18px;display:flex;align-items:center;justify-content:center;gap:10px;color:#64748b;font-weight:700;min-height:132px;@media(max-width:560px){grid-column:auto}`;
const LiteCallout = styled.section`background:linear-gradient(135deg,#0b172b,#10243b);color:#fff;border-radius:22px;padding:28px;display:flex;align-items:center;justify-content:space-between;gap:24px;margin-bottom:18px;h2{margin:8px 0;font-size:1.5rem}p{margin:0;color:#b8c6d9;max-width:750px}@media(max-width:700px){align-items:flex-start;flex-direction:column}`;
const BadgeLite = styled.span`color:#00e98b;font-size:.72rem;font-weight:900;letter-spacing:.09em;`;
const UpgradePrimary = styled(Link)`background:#00d982;color:#042719;text-decoration:none;font-weight:900;padding:12px 18px;border-radius:12px;white-space:nowrap;`;
const LockedGrid = styled.div`display:grid;grid-template-columns:repeat(3,1fr);gap:14px;@media(max-width:850px){grid-template-columns:1fr}`;
const LockedCard = styled.div`background:#fff;border:1px solid #e2e8f0;border-radius:17px;padding:18px;display:grid;grid-template-columns:auto 1fr;gap:12px;`;
const LockIcon = styled.div`width:38px;height:38px;border-radius:11px;background:#f1f5f9;color:#64748b;display:grid;place-items:center;`;
const LockedTitle = styled.strong`display:block;margin-bottom:4px;`;
const LockedText = styled.p`margin:0;color:#64748b;font-size:.82rem;`;
const Upgrade = styled(Link)`grid-column:2;color:#008f59;text-decoration:none;font-size:.8rem;font-weight:900;`;
const ChartGrid = styled.section`display:grid;grid-template-columns:1.45fr 1fr;gap:16px;margin-bottom:16px;@media(max-width:950px){grid-template-columns:1fr}`;
const Panel = styled.section`background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:20px;box-shadow:0 8px 24px rgba(15,23,42,.035);`;
const PanelHeader = styled.div`display:flex;justify-content:space-between;gap:14px;margin-bottom:18px;`;
const PanelTitle = styled.h2`font-size:1rem;margin:0 0 4px;`;
const PanelText = styled.p`font-size:.78rem;color:#64748b;margin:0;`;
const Info = styled.span`color:#94a3b8;cursor:help;`;
const ChartBox = styled.div`height:300px;`;
const DonutBox = styled.div`height:300px;`;
const EmptyChart = styled.div`height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;color:#94a3b8;gap:8px;strong{color:#475569}span{font-size:.8rem;max-width:320px}`;
const StatsStrip = styled.section`display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:#e2e8f0;border:1px solid #e2e8f0;border-radius:17px;overflow:hidden;margin-bottom:16px;@media(max-width:850px){grid-template-columns:repeat(2,1fr)}`;
const Stat = styled.div`background:#fff;padding:16px;display:flex;flex-direction:column;gap:5px;span{font-size:.74rem;color:#64748b}strong{font-size:1.02rem}`;
const TableWrap = styled.div`overflow-x:auto;`;
const Table = styled.table`width:100%;border-collapse:collapse;min-width:820px;th{text-align:right;font-size:.7rem;text-transform:uppercase;color:#94a3b8;padding:10px;border-bottom:1px solid #e2e8f0}th:first-child{text-align:left}td{text-align:right;padding:13px 10px;border-bottom:1px solid #f1f5f9;font-size:.84rem}td:first-child{text-align:left}`;
const Club = styled.div`display:flex;align-items:center;gap:10px;strong,small{display:block}small{color:#94a3b8;font-size:.7rem;margin-top:2px}`;
const Result = styled.td`color:${({$positivo})=>$positivo?'#008f59':'#dc2626'};`;
const EmptyRow = styled.div`padding:34px;text-align:center;color:#94a3b8;`;
const BottomGrid = styled.section`display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;@media(max-width:750px){grid-template-columns:1fr}`;
const TradeCard = styled.div`display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;margin-top:15px;padding:14px;border-radius:14px;background:${({$positivo})=>$positivo?'#f0fff8':'#fff5f5'};color:${({$positivo})=>$positivo?'#008f59':'#dc2626'};div strong,div span{display:block}div span{font-size:.75rem;color:#64748b;margin-top:3px}b{white-space:nowrap}`;
const Method = styled.div`display:flex;gap:10px;align-items:flex-start;margin-top:16px;padding:14px 16px;border-radius:14px;background:#eef6ff;color:#475569;font-size:.78rem;strong,span{display:block}strong{color:#1e3a5f;margin-bottom:3px}`;
const Estado = styled.div`min-height:55vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#64748b;h2{color:#0f172a;margin:14px 0 4px}p{margin:0}`;
const Spinner = styled.div`width:42px;height:42px;border:4px solid #dbe5ee;border-top-color:#00d982;border-radius:50%;animation:spin .8s linear infinite;@keyframes spin{to{transform:rotate(360deg)}}`;
const Retry = styled.button`margin-top:16px;border:0;background:#0f172a;color:#fff;border-radius:11px;padding:11px 16px;font-weight:800;cursor:pointer;`;
