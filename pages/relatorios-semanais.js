import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import {
  FiActivity,
  FiAlertCircle,
  FiArrowDown,
  FiArrowUp,
  FiAward,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiLock,
  FiRefreshCw,
  FiTarget,
} from 'react-icons/fi';

import api from '../lib/api';
import ClubBadge from '../components/ClubBadge';
import withAuth from '../components/withAuth';

function moeda(valor) {
  if (valor === null || valor === undefined) return 'Em formação';
  return `T$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function percentual(valor) {
  if (valor === null || valor === undefined) return 'Em formação';
  const numero = Number(valor);
  return `${numero > 0 ? '+' : ''}${numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

function dataLonga(valor) {
  return new Date(valor).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Kpi({ titulo, valor, detalhe, tom = 'neutro', icone }) {
  return (
    <KpiCard>
      <KpiHead><KpiIcon $tom={tom}>{icone}</KpiIcon><span>{titulo}</span></KpiHead>
      <KpiValue $tom={tom}>{valor}</KpiValue>
      <KpiDetail>{detalhe}</KpiDetail>
    </KpiCard>
  );
}

function RelatoriosSemanaisPage() {
  const router = useRouter();
  const [lista, setLista] = useState([]);
  const [premium, setPremium] = useState(null);
  const [selecionado, setSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarDetalhe = useCallback(async (id) => {
    if (!id) return;
    try {
      const { data } = await api.get(`/weekly-reports/${id}`);
      setSelecionado(data.relatorio);
    } catch (err) {
      setErro(err?.response?.data?.erro || 'Não foi possível abrir este relatório.');
    }
  }, []);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const { data } = await api.get('/weekly-reports');
      setPremium(Boolean(data.premium));
      setLista(data.relatorios || []);
      if (data.premium && data.relatorios?.length) {
        const pedido = typeof router.query.id === 'string' ? router.query.id : null;
        const id = data.relatorios.some((item) => item._id === pedido) ? pedido : data.relatorios[0]._id;
        await carregarDetalhe(id);
      }
    } catch (err) {
      setErro(err?.response?.data?.erro || 'Não foi possível carregar seus relatórios semanais.');
    } finally {
      setCarregando(false);
    }
  }, [carregarDetalhe, router.query.id]);

  useEffect(() => { if (router.isReady) carregar(); }, [carregar, router.isReady]);

  const resumo = selecionado?.resumo || {};
  const ranking = selecionado?.ranking || {};
  const exposicao = selecionado?.exposicao || {};
  const impactos = selecionado?.clubesImpacto || [];
  const positivos = useMemo(() => impactos.filter((item) => item.impactoObjetivo > 0).slice(0, 3), [impactos]);
  const negativos = useMemo(() => [...impactos].reverse().filter((item) => item.impactoObjetivo < 0).slice(0, 3), [impactos]);
  const resultadoPositivo = Number(resumo.resultadoSemana || 0) >= 0;

  if (carregando) return <Estado><Spinner /><h2>Preparando seu relatório...</h2><p>Consolidando a última semana concluída.</p></Estado>;
  if (erro && !selecionado) return <Estado><FiAlertCircle size={38} /><h2>Não foi possível carregar</h2><p>{erro}</p><Retry onClick={carregar}>Tentar novamente</Retry></Estado>;

  if (premium === false) {
    return (
      <Page>
        <Header><div><Eyebrow><FiFileText /> Exclusivo Premium</Eyebrow><Title>Relatório semanal</Title><Subtitle>Uma leitura objetiva da sua semana na TradeSports, reunida em um só lugar.</Subtitle></div></Header>
        <LockedCard>
          <LockedPreview><PreviewKpis><i /><i /><i /><i /></PreviewKpis><PreviewLines><i /><i /><i /></PreviewLines></LockedPreview>
          <LockedOverlay><LockIcon><FiLock /></LockIcon><h2>Seu desempenho, toda semana</h2><p>Acompanhe patrimônio, operações, taxas, dividendos, ranking, concentração e destaques da carteira.</p><Upgrade href="/planos">Fazer upgrade</Upgrade></LockedOverlay>
        </LockedCard>
      </Page>
    );
  }

  return (
    <Page>
      <Header>
        <div><Eyebrow><FiFileText /> Relatório Premium</Eyebrow><Title>Sua semana em perspectiva</Title><Subtitle>Dados objetivos de segunda a domingo. Sem recomendações de compra ou venda.</Subtitle></div>
        <Refresh type="button" onClick={carregar} aria-label="Atualizar"><FiRefreshCw /></Refresh>
      </Header>

      <Workspace>
        <History>
          <HistoryTitle>Histórico</HistoryTitle>
          {lista.map((item) => (
            <WeekButton key={item._id} $active={selecionado?._id === item._id} onClick={() => carregarDetalhe(item._id)}>
              <FiCalendar /><span><strong>{dataLonga(item.inicio)}</strong><small>até {dataLonga(item.fim)}</small></span>
            </WeekButton>
          ))}
        </History>

        <Report>
          {selecionado && (
            <>
              <ReportHead><div><ReportLabel>SEMANA CONCLUÍDA</ReportLabel><h2>{dataLonga(selecionado.inicio)} — {dataLonga(selecionado.fim)}</h2></div><PremiumBadge>Premium</PremiumBadge></ReportHead>
              <Kpis>
                <Kpi titulo="Patrimônio final" valor={moeda(resumo.patrimonioFinal)} detalhe="Posição consolidada na geração" icone={<FiDollarSign />} />
                <Kpi titulo="Resultado da semana" valor={moeda(resumo.resultadoSemana)} detalhe={selecionado.qualidadeDados?.variacaoPatrimonialDisponivel ? percentual(resumo.variacaoPercentual) : 'Base histórica em formação'} tom={resumo.resultadoSemana === null ? 'destaque' : resultadoPositivo ? 'positivo' : 'negativo'} icone={resultadoPositivo ? <FiArrowUp /> : <FiArrowDown />} />
                <Kpi titulo="Ordens" valor={`${resumo.ordensExecutadas || 0}/${resumo.ordensEnviadas || 0}`} detalhe="Executadas / enviadas" icone={<FiActivity />} />
                <Kpi titulo="Ranking geral" valor={ranking.posicaoGeral ? `#${ranking.posicaoGeral}` : '—'} detalhe={ranking.mudancaPosicoes === null || ranking.mudancaPosicoes === undefined ? 'Comparação em formação' : `${ranking.mudancaPosicoes > 0 ? '+' : ''}${ranking.mudancaPosicoes} posição(ões)`} tom="destaque" icone={<FiAward />} />
              </Kpis>

              {!selecionado.qualidadeDados?.variacaoPatrimonialDisponivel && <DataNotice><FiAlertCircle /><div><strong>Base histórica em formação</strong><span>{selecionado.qualidadeDados?.observacao}</span></div></DataNotice>}

              <Stats>
                <Stat><span>Resultado realizado</span><strong>{moeda(resumo.resultadoRealizado)}</strong></Stat>
                <Stat><span>Taxas pagas</span><strong>{moeda(resumo.taxasPagas)}</strong></Stat>
                <Stat><span>Dividendos recebidos</span><strong>{moeda(resumo.dividendosRecebidos)}</strong></Stat>
                <Stat><span>Maior concentração</span><strong>{percentual(exposicao.concentracaoMaiorPosicao)}</strong></Stat>
              </Stats>

              <TwoColumns>
                <Panel><PanelHead><div><h3>Maiores impactos positivos</h3><p>Resultado realizado e dividendos por clube</p></div><FiArrowUp /></PanelHead><ImpactList items={positivos} positive /></Panel>
                <Panel><PanelHead><div><h3>Maiores impactos negativos</h3><p>Resultado realizado e dividendos por clube</p></div><FiArrowDown /></PanelHead><ImpactList items={negativos} /></Panel>
              </TwoColumns>

              <TwoColumns>
                <Panel><PanelHead><div><h3>Exposição da carteira</h3><p>{exposicao.quantidadePosicoes || 0} posições abertas</p></div><FiTarget /></PanelHead>
                  <PositionList>{(exposicao.posicoes || []).slice(0, 6).map((item) => <Position key={item.clubeId}><ClubInfo><ClubBadge clube={{ id: item.clubeId, nome: item.nome, escudo: item.escudo }} size={32} /><span><strong>{item.nome}</strong><small>{item.quantidade} cota(s)</small></span></ClubInfo><div><strong>{percentual(item.concentracao)}</strong><small>{moeda(item.valorAtual)}</small></div></Position>)}</PositionList>
                </Panel>
                <Panel><PanelHead><div><h3>Próxima rodada</h3><p>Pontos objetivos para acompanhar</p></div><FiAlertCircle /></PanelHead><Alerts>{(selecionado.alertasProximaRodada || []).map((item, index) => <Alert key={`${item.tipo}-${index}`}><span>•</span>{item.texto}</Alert>)}</Alerts><CentralLink href="/performance">Abrir Central de Performance</CentralLink></Panel>
              </TwoColumns>

              <Method><FiAlertCircle /><span>{selecionado.metodologia?.impactoClubes} {selecionado.metodologia?.natureza}</span></Method>
            </>
          )}
        </Report>
      </Workspace>
    </Page>
  );
}

function ImpactList({ items, positive = false }) {
  if (!items.length) return <Empty>Nenhum impacto {positive ? 'positivo' : 'negativo'} registrado nesta semana.</Empty>;
  return <Impacts>{items.map((item) => <Impact key={item.clubeId}><ClubInfo><ClubBadge clube={{ id: item.clubeId, nome: item.nome, escudo: item.escudo }} size={34} /><span><strong>{item.nome}</strong><small>Realizado + dividendos</small></span></ClubInfo><ImpactValue $positive={positive}>{moeda(item.impactoObjetivo)}</ImpactValue></Impact>)}</Impacts>;
}

export default withAuth(RelatoriosSemanaisPage);

const Page = styled.main`max-width:1440px;margin:0 auto;padding:8px 4px 36px;color:#f8fafc;`;
const Header = styled.header`display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:22px;`;
const Eyebrow = styled.div`display:flex;align-items:center;gap:8px;color:#fde68a;font-weight:900;font-size:.76rem;text-transform:uppercase;letter-spacing:.09em;`;
const Title = styled.h1`font-size:clamp(1.75rem,3vw,2.45rem);margin:7px 0 5px;letter-spacing:-.04em;`;
const Subtitle = styled.p`margin:0;color:#94a3b8;max-width:720px;`;
const Refresh = styled.button`width:42px;height:42px;border:1px solid rgba(148,163,184,.16);background:rgba(15,23,42,.72);color:#cbd5e1;border-radius:12px;display:grid;place-items:center;cursor:pointer;`;
const Workspace = styled.div`display:grid;grid-template-columns:230px minmax(0,1fr);gap:16px;@media(max-width:850px){grid-template-columns:1fr}`;
const History = styled.aside`background:rgba(15,23,42,.66);border:1px solid rgba(148,163,184,.13);border-radius:18px;padding:12px;align-self:start;`;
const HistoryTitle = styled.div`padding:7px 8px 12px;color:#94a3b8;font-size:.75rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em;`;
const WeekButton = styled.button`width:100%;display:flex;align-items:center;gap:10px;text-align:left;padding:11px;border-radius:12px;border:1px solid ${({$active})=>$active?'rgba(250,204,21,.25)':'transparent'};background:${({$active})=>$active?'rgba(250,204,21,.1)':'transparent'};color:${({$active})=>$active?'#fde68a':'#cbd5e1'};cursor:pointer;margin-bottom:4px;span strong,span small{display:block}small{color:#64748b;margin-top:3px}`;
const Report = styled.section`min-width:0;`;
const ReportHead = styled.div`display:flex;justify-content:space-between;align-items:center;padding:18px 20px;margin-bottom:14px;border-radius:18px;background:linear-gradient(135deg,#111c31,#0d1729);border:1px solid rgba(250,204,21,.18);h2{margin:4px 0 0;font-size:1.15rem}`;
const ReportLabel = styled.span`color:#fde68a;font-size:.67rem;font-weight:950;letter-spacing:.1em;`;
const PremiumBadge = styled.span`padding:7px 10px;border:1px solid rgba(250,204,21,.25);border-radius:999px;background:rgba(250,204,21,.1);color:#fde68a;font-size:.68rem;font-weight:950;text-transform:uppercase;`;
const Kpis = styled.div`display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:14px;@media(max-width:1080px){grid-template-columns:repeat(2,1fr)}@media(max-width:520px){grid-template-columns:1fr}`;
const KpiCard = styled.article`padding:16px;background:rgba(15,23,42,.68);border:1px solid rgba(148,163,184,.13);border-radius:16px;`;
const KpiHead = styled.div`display:flex;align-items:center;gap:8px;color:#94a3b8;font-size:.76rem;font-weight:750;`;
const KpiIcon = styled.i`width:31px;height:31px;border-radius:9px;display:grid;place-items:center;background:${({$tom})=>$tom==='positivo'?'rgba(0,217,130,.12)':$tom==='negativo'?'rgba(239,68,68,.12)':$tom==='destaque'?'rgba(250,204,21,.12)':'rgba(148,163,184,.1)'};color:${({$tom})=>$tom==='positivo'?'#34d399':$tom==='negativo'?'#fca5a5':$tom==='destaque'?'#fde68a':'#cbd5e1'};`;
const KpiValue = styled.div`font-size:1.28rem;font-weight:900;margin:13px 0 4px;color:${({$tom})=>$tom==='positivo'?'#34d399':$tom==='negativo'?'#fca5a5':$tom==='destaque'?'#fde68a':'#f8fafc'};`;
const KpiDetail = styled.div`font-size:.72rem;color:#64748b;`;
const DataNotice = styled.div`display:flex;gap:11px;align-items:flex-start;padding:13px 15px;margin-bottom:14px;border:1px solid rgba(250,204,21,.18);border-radius:13px;background:rgba(250,204,21,.06);color:#fde68a;strong,span{display:block}span{color:#94a3b8;font-size:.76rem;margin-top:3px}`;
const Stats = styled.div`display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(148,163,184,.12);border:1px solid rgba(148,163,184,.13);border-radius:15px;overflow:hidden;margin-bottom:14px;@media(max-width:700px){grid-template-columns:repeat(2,1fr)}`;
const Stat = styled.div`background:#101a2d;padding:14px;span,strong{display:block}span{font-size:.72rem;color:#94a3b8}strong{margin-top:5px;color:#f8fafc}`;
const TwoColumns = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;@media(max-width:780px){grid-template-columns:1fr}`;
const Panel = styled.section`background:rgba(15,23,42,.68);border:1px solid rgba(148,163,184,.13);border-radius:17px;padding:18px;`;
const PanelHead = styled.div`display:flex;justify-content:space-between;gap:12px;color:#fde68a;margin-bottom:14px;h3{margin:0 0 3px;color:#f8fafc;font-size:.94rem}p{margin:0;color:#64748b;font-size:.73rem}`;
const Impacts = styled.div`display:flex;flex-direction:column;gap:8px;`;
const Impact = styled.div`display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px;border-radius:12px;background:rgba(148,163,184,.055);`;
const ClubInfo = styled.div`display:flex;align-items:center;gap:9px;min-width:0;span strong,span small{display:block}strong{font-size:.8rem}small{font-size:.67rem;color:#64748b;margin-top:2px}`;
const ImpactValue = styled.strong`color:${({$positive})=>$positive?'#34d399':'#fca5a5'};white-space:nowrap;font-size:.82rem;`;
const Empty = styled.div`padding:24px 8px;text-align:center;color:#64748b;font-size:.78rem;`;
const PositionList = styled.div`display:flex;flex-direction:column;gap:7px;`;
const Position = styled.div`display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid rgba(148,163,184,.08);>div:last-child{text-align:right}>div:last-child strong,>div:last-child small{display:block}>div:last-child small{color:#64748b;font-size:.68rem;margin-top:2px}`;
const Alerts = styled.div`display:flex;flex-direction:column;gap:9px;`;
const Alert = styled.div`display:flex;gap:8px;padding:11px;border-radius:12px;background:rgba(250,204,21,.06);color:#cbd5e1;font-size:.78rem;line-height:1.45;span{color:#fde68a}`;
const CentralLink = styled(Link)`display:inline-block;margin-top:14px;color:#fde68a;text-decoration:none;font-size:.76rem;font-weight:900;`;
const Method = styled.div`display:flex;gap:9px;align-items:flex-start;padding:13px 15px;border:1px solid rgba(148,163,184,.12);border-radius:13px;color:#64748b;font-size:.72rem;line-height:1.45;`;
const LockedCard = styled.div`position:relative;overflow:hidden;min-height:460px;background:rgba(15,23,42,.66);border:1px solid rgba(250,204,21,.18);border-radius:22px;`;
const LockedPreview = styled.div`position:absolute;inset:28px;filter:blur(5px);opacity:.34;`;
const PreviewKpis = styled.div`display:grid;grid-template-columns:repeat(4,1fr);gap:12px;i{height:120px;border-radius:15px;background:rgba(148,163,184,.22)}`;
const PreviewLines = styled.div`margin-top:18px;display:grid;grid-template-columns:1fr 1fr;gap:12px;i{height:190px;border-radius:15px;background:rgba(96,165,250,.18)}i:last-child{grid-column:span 2;height:80px}`;
const LockedOverlay = styled.div`position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:28px;background:radial-gradient(circle at center,rgba(15,23,42,.88),rgba(15,23,42,.62));h2{margin:13px 0 7px}p{margin:0 0 18px;color:#b8c6d9;max-width:590px;line-height:1.55}`;
const LockIcon = styled.div`width:52px;height:52px;border-radius:999px;background:rgba(250,204,21,.12);border:1px solid rgba(250,204,21,.25);color:#fde68a;display:grid;place-items:center;font-size:1.2rem;`;
const Upgrade = styled(Link)`padding:11px 17px;border-radius:11px;border:1px solid rgba(250,204,21,.32);background:rgba(250,204,21,.14);color:#fde68a;text-decoration:none;font-weight:950;`;
const Estado = styled.div`min-height:55vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#94a3b8;h2{color:#f8fafc;margin:14px 0 4px}p{margin:0}`;
const Spinner = styled.div`width:42px;height:42px;border:4px solid rgba(148,163,184,.18);border-top-color:#fde68a;border-radius:50%;animation:spin .8s linear infinite;@keyframes spin{to{transform:rotate(360deg)}}`;
const Retry = styled.button`margin-top:16px;border:1px solid rgba(250,204,21,.3);background:rgba(250,204,21,.14);color:#fde68a;border-radius:11px;padding:11px 16px;font-weight:900;cursor:pointer;`;
