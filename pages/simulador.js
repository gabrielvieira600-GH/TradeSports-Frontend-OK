import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { FiActivity, FiAlertCircle, FiLock, FiRefreshCw, FiShield } from 'react-icons/fi';
import api from '../lib/api';
import withAuth from '../components/withAuth';

const moeda = (valor) => `T$ ${Number(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const sinal = (valor) => `${Number(valor || 0) >= 0 ? '+' : ''}${moeda(valor)}`;

function SimuladorPage() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [aba, setAba] = useState('individual');
  const [form, setForm] = useState({ clubeId: '', posicaoFinal: 3, variacaoQuantidade: 0, precoOperacao: '', tipoTaxa: 'taker', quantidadeElegivelDividendos: 0 });
  const [posicoes, setPosicoes] = useState({});
  const [resultado, setResultado] = useState(null);
  const [calculando, setCalculando] = useState(false);

  useEffect(() => {
    api.get('/scenario-simulator').then(({ data }) => {
      setDados(data);
      if (data.premium && data.clubes?.length) {
        const primeiro = data.carteira?.posicoes?.[0] || data.clubes[0];
        setForm((atual) => ({ ...atual, clubeId: String(primeiro.clubeId), precoOperacao: String(primeiro.precoAtual || '') }));
        setPosicoes(Object.fromEntries((data.carteira?.posicoes || []).map((item) => [item.clubeId, item.posicaoAtual || 20])));
      }
    }).catch((e) => setErro(e?.response?.data?.erro || 'Não foi possível carregar o simulador.')).finally(() => setCarregando(false));
  }, []);

  const clubeSelecionado = useMemo(() => dados?.clubes?.find((item) => String(item.clubeId) === String(form.clubeId)), [dados, form.clubeId]);
  const ativoSelecionado = useMemo(() => dados?.carteira?.posicoes?.find((item) => String(item.clubeId) === String(form.clubeId)), [dados, form.clubeId]);

  function trocarClube(clubeId) {
    const clube = dados.clubes.find((item) => String(item.clubeId) === String(clubeId));
    const ativo = dados.carteira.posicoes.find((item) => String(item.clubeId) === String(clubeId));
    setForm((atual) => ({ ...atual, clubeId, precoOperacao: String(clube?.precoAtual || ''), quantidadeElegivelDividendos: Math.max(0, Number(ativo?.quantidade || 0)) }));
    setResultado(null);
  }

  async function simularIndividual(evento) {
    evento.preventDefault(); setCalculando(true); setErro('');
    try { const { data } = await api.post('/scenario-simulator/individual', { ...form, clubeId: Number(form.clubeId), posicaoFinal: Number(form.posicaoFinal), variacaoQuantidade: Number(form.variacaoQuantidade), precoOperacao: Number(form.precoOperacao), quantidadeElegivelDividendos: Number(form.quantidadeElegivelDividendos) }); setResultado(data); }
    catch (e) { setErro(e?.response?.data?.erro || 'Não foi possível calcular o cenário.'); }
    finally { setCalculando(false); }
  }

  async function simularCarteira() {
    setCalculando(true); setErro('');
    try { const { data } = await api.post('/scenario-simulator/carteira', { cenarios: Object.entries(posicoes).map(([clubeId, posicaoFinal]) => ({ clubeId: Number(clubeId), posicaoFinal: Number(posicaoFinal) })) }); setResultado(data); }
    catch (e) { setErro(e?.response?.data?.erro || 'Não foi possível calcular a carteira.'); }
    finally { setCalculando(false); }
  }

  if (carregando) return <Page><Loading><FiRefreshCw /> Preparando seus cenários...</Loading></Page>;
  if (!dados) return <Page><Error>{erro}</Error></Page>;
  if (!dados.premium) return <Page><Hero><Eyebrow><FiActivity /> Exclusivo Premium</Eyebrow><h1>Simulador de cenários</h1><p>Teste posições finais, operações e liquidações hipotéticas sem alterar sua conta.</p></Hero><Locked><Preview><i/><i/><i/></Preview><Overlay><Lock><FiLock /></Lock><h2>Planeje antes de agir</h2><p>Compare o impacto de cenários na carteira com as regras vigentes da TradeSports.</p><Upgrade href="/planos">Fazer upgrade</Upgrade></Overlay></Locked></Page>;

  return <Page>
    <Hero><div><Eyebrow><FiActivity /> Estratégia Premium</Eyebrow><h1>Simulador de cenários</h1><p>Explore hipóteses com seus dados reais. Nenhuma simulação envia ordens ou altera a conta.</p></div><Patrimonio><span>Patrimônio atual</span><strong>{moeda(dados.carteira.patrimonio)}</strong></Patrimonio></Hero>
    <Notice><FiShield /><div><strong>Ambiente exclusivamente hipotético</strong><span>Os resultados não representam previsão, probabilidade ou promessa de rentabilidade.</span></div></Notice>
    <Tabs><TabButton $ativo={aba === 'individual'} onClick={() => { setAba('individual'); setResultado(null); }}>Clube individual</TabButton><TabButton $ativo={aba === 'carteira'} onClick={() => { setAba('carteira'); setResultado(null); }}>Carteira completa</TabButton></Tabs>
    {erro && <Error>{erro}</Error>}
    {aba === 'individual' ? <Grid>
      <Panel as="form" onSubmit={simularIndividual}><PanelTitle><div><h2>Monte o cenário</h2><p>Operação opcional + posição final</p></div></PanelTitle>
        <Fields>
          <Field><label>Clube</label><select value={form.clubeId} onChange={(e) => trocarClube(e.target.value)}>{dados.clubes.map((clube) => <option key={clube.clubeId} value={clube.clubeId}>{clube.nome}</option>)}</select></Field>
          <Field><label>Posição final</label><select value={form.posicaoFinal} onChange={(e) => setForm({ ...form, posicaoFinal: e.target.value })}>{Array.from({ length: 20 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}º lugar</option>)}</select></Field>
          <Field><label>Comprar (+) ou vender (-)</label><input type="number" step="1" value={form.variacaoQuantidade} onChange={(e) => setForm({ ...form, variacaoQuantidade: e.target.value })}/><small>Você possui {ativoSelecionado?.quantidade || 0} cotas.</small></Field>
          <Field><label>Preço hipotético da operação</label><input type="number" min="0.01" step="0.01" value={form.precoOperacao} onChange={(e) => setForm({ ...form, precoOperacao: e.target.value })}/><small>Cotação atual: {moeda(clubeSelecionado?.precoAtual)}</small></Field>
          <Field><label>Tipo de taxa</label><select value={form.tipoTaxa} onChange={(e) => setForm({ ...form, tipoTaxa: e.target.value })}><option value="taker">Taker — {dados.regras.taxaTaker}%</option><option value="maker">Maker — {dados.regras.taxaMaker}%</option></select></Field>
          <Field><label>Cotas elegíveis a dividendos</label><input type="number" min="0" step="1" value={form.quantidadeElegivelDividendos} onChange={(e) => setForm({ ...form, quantidadeElegivelDividendos: e.target.value })}/><small>Condicional à permanência por {dados.regras.rodadasDividendos} rodadas.</small></Field>
        </Fields><Primary disabled={calculando}>{calculando ? 'Calculando...' : 'Simular cenário'}</Primary>
      </Panel>
      <ResultPanel>{resultado?.tipo === 'individual' ? <IndividualResult resultado={resultado}/> : <EmptyResult><FiActivity/><h3>Seu comparativo aparecerá aqui</h3><p>Defina a operação e a posição final para calcular.</p></EmptyResult>}</ResultPanel>
    </Grid> : <Panel><PanelTitle><div><h2>Liquidação hipotética da carteira</h2><p>Defina uma posição final para cada clube que você possui.</p></div></PanelTitle>
      {!dados.carteira.posicoes.length ? <EmptyResult><FiAlertCircle/><h3>Sua carteira ainda não possui posições</h3></EmptyResult> : <PortfolioList>{dados.carteira.posicoes.map((item) => <PortfolioRow key={item.clubeId}><Club><Badge>{item.nome.slice(0, 1)}</Badge><div><strong>{item.nome}</strong><span>{item.quantidade} cotas · {moeda(item.valorAtual)}</span></div></Club><select value={posicoes[item.clubeId] || item.posicaoAtual || 20} onChange={(e) => setPosicoes({ ...posicoes, [item.clubeId]: e.target.value })}>{Array.from({ length: 20 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}º lugar</option>)}</select></PortfolioRow>)}</PortfolioList>}
      {!!dados.carteira.posicoes.length && <Primary onClick={simularCarteira} disabled={calculando}>{calculando ? 'Calculando...' : 'Comparar liquidação'}</Primary>}
      {resultado?.tipo === 'carteira' && <PortfolioResult resultado={resultado}/>} 
    </Panel>}
    <Method><FiAlertCircle/><p>Preços de liquidação consideram T$ 5,00 no 20º lugar e acréscimo de 5% por posição, incluindo ajustes de split. Dividendos da simulação individual seguem os percentuais vigentes e são sempre condicionais.</p></Method>
  </Page>;
}

function IndividualResult({ resultado }) { const r = resultado; return <Result><ResultHead><span>Cenário calculado</span><h2>{r.clube.nome} em {r.cenario.posicaoFinal}º</h2></ResultHead><Metrics><Metric><span>Cotas após operação</span><strong>{r.operacao.quantidadeFinal}</strong></Metric><Metric><span>Taxa estimada</span><strong>{moeda(r.operacao.taxaOperacao)}</strong></Metric><Metric><span>Liquidação por cota</span><strong>{moeda(r.cenario.precoLiquidacao)}</strong></Metric><Metric><span>Liquidação total</span><strong>{moeda(r.cenario.totalLiquidacao)}</strong></Metric><Metric><span>Concentração após operação</span><strong>{r.patrimonio.concentracaoDepois}%</strong></Metric><Metric><span>Dividendo condicional</span><strong>{moeda(r.cenario.dividendoCondicional)}</strong></Metric><Metric $destaque><span>Patrimônio no cenário</span><strong>{moeda(r.patrimonio.liquidadoNoCenario)}</strong></Metric></Metrics><Impact $positivo={r.patrimonio.impactoTotal >= 0}><span>Impacto contra o patrimônio atual</span><strong>{sinal(r.patrimonio.impactoTotal)}</strong></Impact><Comparison><h3>Comparativo por posição final</h3>{r.comparativoPosicoes.map((item) => <ResultRow key={item.posicao}><span>{item.posicao}º · {moeda(item.precoLiquidacao)}/cota</span><strong>{moeda(item.patrimonio)} ({sinal(item.impacto)})</strong></ResultRow>)}</Comparison><Disclaimer>{r.avisos.map((aviso) => <span key={aviso}>• {aviso}</span>)}</Disclaimer></Result>; }
function PortfolioResult({ resultado }) { return <Result $portfolio><Metrics><Metric><span>Patrimônio atual</span><strong>{moeda(resultado.resumo.patrimonioAtual)}</strong></Metric><Metric><span>Valor liquidado</span><strong>{moeda(resultado.resumo.valorLiquidado)}</strong></Metric><Metric $destaque><span>Patrimônio no cenário</span><strong>{moeda(resultado.resumo.patrimonioLiquidado)}</strong></Metric></Metrics><Impact $positivo={resultado.resumo.impactoTotal >= 0}><span>Impacto total</span><strong>{sinal(resultado.resumo.impactoTotal)}</strong></Impact>{resultado.posicoes.map((item) => <ResultRow key={item.clubeId}><span>{item.nome} · {item.posicaoFinal}º</span><strong>{moeda(item.valorLiquidacao)} ({sinal(item.impacto)})</strong></ResultRow>)}</Result>; }

export default withAuth(SimuladorPage);

const Page = styled.main`padding: 28px; max-width: 1280px; margin: 0 auto; color: #e5edf8; @media(max-width:700px){padding:16px;}`;
const Hero = styled.section`background:linear-gradient(135deg,#071426,#0b2037);border:1px solid rgba(250,204,21,.2);border-radius:20px;padding:28px;display:flex;justify-content:space-between;gap:20px;align-items:center;box-shadow:0 18px 48px rgba(2,8,23,.22);h1{margin:7px 0;font-size:clamp(28px,4vw,44px);color:#fff}p{margin:0;color:#9fb0c6;max-width:720px}@media(max-width:700px){padding:22px;align-items:flex-start;flex-direction:column;}`;
const Eyebrow = styled.span`color:#facc15;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;display:flex;gap:8px;align-items:center;`;
const Patrimonio = styled.div`min-width:210px;background:rgba(250,204,21,.07);border:1px solid rgba(250,204,21,.16);padding:16px 18px;border-radius:14px;span{display:block;color:#c7b86b;font-size:12px}strong{font-size:22px;color:#fde68a}`;
const Notice = styled.div`display:flex;gap:12px;align-items:center;margin:16px 0;padding:13px 16px;border-radius:13px;background:#0b1728;border:1px solid #1d344e;color:#facc15;div{display:flex;flex-direction:column}span{font-size:12px;color:#9fb0c6;margin-top:2px}`;
const Tabs = styled.div`display:flex;gap:8px;margin:20px 0;`;
const TabButton = styled.button`border:1px solid ${({$ativo})=>$ativo?'rgba(250,204,21,.34)':'#20354d'};background:${({$ativo})=>$ativo?'rgba(250,204,21,.09)':'#0c192b'};color:${({$ativo})=>$ativo?'#fde68a':'#9fb0c6'};padding:11px 17px;border-radius:10px;font-weight:700;cursor:pointer;`;
const Grid = styled.div`display:grid;grid-template-columns:minmax(0,1.05fr) minmax(340px,.95fr);gap:18px;@media(max-width:960px){grid-template-columns:1fr}`;
const Panel = styled.section`background:#081626;border:1px solid #1b3047;border-radius:18px;padding:22px;`;
const ResultPanel = styled(Panel)`min-height:420px;display:flex;flex-direction:column;justify-content:center;`;
const PanelTitle = styled.div`display:flex;justify-content:space-between;margin-bottom:18px;h2{margin:0;color:#fff;font-size:20px}p{margin:4px 0 0;color:#8092a9;font-size:13px}`;
const Fields = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:14px;@media(max-width:600px){grid-template-columns:1fr}`;
const Field = styled.div`label{display:block;color:#c8d4e3;font-size:12px;font-weight:700;margin-bottom:7px}input,select{width:100%;box-sizing:border-box;background:#0d2034;border:1px solid #29435f;color:#f8fafc;border-radius:10px;padding:11px;outline:none}small{display:block;color:#74869d;margin-top:5px}`;
const Primary = styled.button`margin-top:18px;border:0;border-radius:11px;padding:12px 18px;background:linear-gradient(135deg,#facc15,#eab308);color:#172033;font-weight:900;cursor:pointer;disabled{opacity:.55}`;
const EmptyResult = styled.div`text-align:center;color:#73859a;padding:35px;svg{font-size:35px;color:#d6b82d}h3{color:#dfe8f4;margin-bottom:5px}p{margin:0}`;
const Result = styled.div`width:100%;${({$portfolio})=>$portfolio?'margin-top:22px;padding-top:22px;border-top:1px solid #1b3047;':''}`;
const ResultHead = styled.div`span{color:#d6b82d;font-size:11px;text-transform:uppercase;font-weight:800;letter-spacing:.1em}h2{color:#fff;margin:6px 0 18px}`;
const Metrics = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:9px;@media(max-width:520px){grid-template-columns:1fr}`;
const Metric = styled.div`background:${({$destaque})=>$destaque?'rgba(250,204,21,.08)':'#0d1d30'};border:1px solid ${({$destaque})=>$destaque?'rgba(250,204,21,.22)':'#1d344d'};border-radius:11px;padding:12px;span{display:block;color:#8294aa;font-size:11px}strong{display:block;color:${({$destaque})=>$destaque?'#fde68a':'#f4f7fb'};margin-top:4px}`;
const Impact = styled.div`display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding:14px;border-radius:11px;background:${({$positivo})=>$positivo?'rgba(34,197,94,.09)':'rgba(239,68,68,.09)'};color:${({$positivo})=>$positivo?'#86efac':'#fca5a5'};strong{font-size:20px}`;
const Disclaimer = styled.div`display:flex;flex-direction:column;gap:4px;margin-top:13px;color:#6f8299;font-size:11px;`;
const Comparison = styled.div`margin-top:16px;max-height:250px;overflow:auto;padding-right:5px;h3{position:sticky;top:0;background:#081626;color:#dce7f3;font-size:13px;margin:0;padding:8px 0}`;
const PortfolioList = styled.div`display:flex;flex-direction:column;gap:8px;`;
const PortfolioRow = styled.div`display:flex;align-items:center;justify-content:space-between;gap:15px;background:#0d1d30;border:1px solid #1d344d;border-radius:12px;padding:11px 13px;select{background:#12283e;color:#fff;border:1px solid #31506d;border-radius:8px;padding:9px}`;
const Club = styled.div`display:flex;align-items:center;gap:11px;min-width:0;div{min-width:0}strong,span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}span{color:#7f91a7;font-size:12px;margin-top:2px}`;
const Badge = styled.i`width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#18334e;color:#fde68a;font-style:normal;font-weight:900;flex:none;`;
const ResultRow = styled.div`display:flex;justify-content:space-between;gap:15px;border-bottom:1px solid #172b40;padding:10px 2px;color:#9fb0c6;strong{color:#dce7f3;text-align:right}`;
const Method = styled.div`display:flex;gap:10px;color:#708399;font-size:11px;margin-top:16px;align-items:flex-start;p{margin:0}`;
const Error = styled.div`background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);color:#fca5a5;padding:12px 15px;border-radius:11px;margin:13px 0;`;
const Loading = styled.div`min-height:55vh;display:grid;place-items:center;color:#8da0b7;svg{color:#facc15}`;
const Locked = styled.div`position:relative;margin-top:20px;min-height:390px;border-radius:18px;overflow:hidden;border:1px solid rgba(250,204,21,.17);background:#071426;`;
const Preview = styled.div`display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:25px;filter:blur(6px);opacity:.35;i{height:220px;border-radius:14px;background:linear-gradient(#18324d,#0c1d30)}@media(max-width:700px){grid-template-columns:1fr;i{height:90px}}`;
const Overlay = styled.div`position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;background:rgba(4,13,25,.72);padding:25px;h2{color:#fff;margin:13px 0 6px}p{color:#9fb0c6;max-width:510px}`;
const Lock = styled.div`width:54px;height:54px;border-radius:50%;display:grid;place-items:center;color:#facc15;background:rgba(250,204,21,.09);border:1px solid rgba(250,204,21,.26);font-size:23px;`;
const Upgrade = styled(Link)`margin-top:13px;background:#facc15;color:#172033;text-decoration:none;font-weight:900;padding:11px 19px;border-radius:10px;`;
