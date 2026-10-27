import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { FiAlertTriangle, FiCheck, FiInfo, FiRefreshCw, FiShield, FiExternalLink } from 'react-icons/fi';
import api from '../lib/api';
import withAuth from '../components/withAuth';
import EstadoInterface from '../components/EstadoInterface';
import { useToast } from '../components/ToastProvider';
import { AuthContext } from '../contexts/AuthContexts';

const STORAGE_KEY = 'tradesports:recuperacao:asaas';
const formatTs = (v) => `T$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatBrl = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatPercent = (v) => `${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
const finished = ['CONFIRMADA', 'REEMBOLSADA', 'FALHA', 'CANCELADA', 'EXPIRADA'];

function validCheckoutUrl(raw) {
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' &&
      ['sandbox.asaas.com', 'www.asaas.com', 'asaas.com'].includes(u.hostname) &&
      /^\/checkoutSession\/show\/[a-zA-Z0-9_-]+\/?$/.test(u.pathname) &&
      !u.username && !u.password && !u.search && !u.hash;
  } catch (_) { return false; }
}

function RecargaRecuperacaoPage() {
  const [resumo, setResumo] = useState(null);
  const [quantidade, setQuantidade] = useState(100);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');
  const [recarga, setRecarga] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const confirmedRef = useRef(new Set());
  const { adicionarToast } = useToast();
  const { refreshSaldo, refreshUsuario } = useContext(AuthContext);

  const carregarResumo = useCallback(async () => {
    try {
      setCarregando(true);
      const { data } = await api.get('/recarga-recuperacao/resumo');
      setResumo(data);
      setQuantidade((prev) => {
        const min = Number(data.minimoTs || 100);
        const max = Number(data.maximoTs || 0);
        return max < min ? min : Math.min(Math.max(min, prev), max);
      });
      setErro('');
    } catch (e) {
      setErro(e?.response?.data?.erro || 'NÃ£o foi possÃ­vel calcular seu limite de recuperaÃ§Ã£o.');
    } finally { setCarregando(false); }
  }, []);

  useEffect(() => {
    carregarResumo();
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || 'null');
      if (saved?.id && /^[a-f0-9]{24}$/i.test(saved.id)) {
        setRecarga({ id: saved.id, status: 'PENDENTE' });
        if (validCheckoutUrl(saved.url)) setCheckoutUrl(saved.url);
      }
    } catch (_) { window.sessionStorage.removeItem(STORAGE_KEY); }
  }, [carregarResumo]);

  const consultarStatus = useCallback(async (id) => {
    if (!id) return;
    try {
      const { data } = await api.get(`/recarga-recuperacao/intencoes/${encodeURIComponent(id)}`);
      const atual = data.recarga;
      if (!atual) return;
      setRecarga(atual);
      if (validCheckoutUrl(atual.checkoutUrl)) setCheckoutUrl(atual.checkoutUrl);
      if (finished.includes(atual.status)) window.sessionStorage.removeItem(STORAGE_KEY);
      if (atual.status === 'CONFIRMADA' && !confirmedRef.current.has(id)) {
        confirmedRef.current.add(id);
        await Promise.all([refreshSaldo(), refreshUsuario()]);
        adicionarToast(`Recarga de ${formatTs(atual.quantidadeTs)} confirmada.`, 'sucesso');
        await carregarResumo();
      }
    } catch (_) {
      // Somente o backend e o webhook confirmam o crÃ©dito.
    }
  }, [refreshSaldo, refreshUsuario, adicionarToast, carregarResumo]);

  useEffect(() => {
    if (!recarga?.id || recarga.status !== 'PENDENTE') return undefined;
    consultarStatus(recarga.id);
    const timer = window.setInterval(() => consultarStatus(recarga.id), 6000);
    return () => window.clearInterval(timer);
  }, [recarga?.id, recarga?.status, consultarStatus]);

  const minimo = Number(resumo?.minimoTs || 100);
  const passo = Number(resumo?.passoTs || 10);
  const patrimonio = Number(resumo?.patrimonio || 0);
  const maximoPermitido = Number(resumo?.maximoTs || 0);
  const modoDemonstracao = patrimonio >= 900;
  const maximo = modoDemonstracao ? Number(resumo?.alvoPatrimonio || 1000) : maximoPermitido;
  const podeConcluir = Boolean(resumo?.elegivel) && patrimonio < 900;
  const motivoBloqueio = modoDemonstracao
    ? 'O pagamento serÃ¡ liberado quando seu patrimÃ´nio total ficar abaixo de T$ 900.'
    : resumo?.motivoInelegibilidade || 'Complete os requisitos da conta para liberar o pagamento.';
  const valorReais = useMemo(
    () => (Number(quantidade || 0) * Number(resumo?.centavosPorTs || 5)) / 100,
    [quantidade, resumo]
  );
  const patrimonioProjetado = patrimonio + Number(quantidade || 0);
  const progresso = maximo > minimo ? ((quantidade - minimo) / (maximo - minimo)) * 100 : 100;

  const selecionarPercentual = (pct) => {
    if (maximo < minimo) return;
    const bruto = pct === 1 ? maximo : minimo + (maximo - minimo) * pct;
    const ajustado = Math.round(bruto / passo) * passo;
    setQuantidade(Math.min(maximo, Math.max(minimo, ajustado)));
  };

  const iniciarPagamento = async () => {
    if (!podeConcluir || processando) return;
    if (!resumo?.asaasConfigurado) {
      adicionarToast('O pagamento pelo Asaas ainda nÃ£o estÃ¡ habilitado.', 'erro');
      return;
    }
    try {
      setProcessando(true);
      setErro('');
      const key = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const { data } = await api.post('/recarga-recuperacao/intencoes',
        { quantidadeTs: Number(quantidade) },
        { headers: { 'Idempotency-Key': key } }
      );
      const url = data.checkoutUrl || data.url || data.recarga?.checkoutUrl;
      if (!validCheckoutUrl(url)) throw new Error('O Asaas nÃ£o retornou um endereÃ§o seguro de pagamento.');
      const id = data.recarga?.id;
      if (!id || !/^[a-f0-9]{24}$/i.test(id)) throw new Error('A recarga nÃ£o foi registrada corretamente.');
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ id, url }));
      setRecarga(data.recarga);
      setCheckoutUrl(url);
      window.location.assign(url);
    } catch (e) {
      const msg = e?.response?.data?.erro || e?.message || 'NÃ£o foi possÃ­vel iniciar o pagamento.';
      setErro(msg);
      adicionarToast(msg, 'erro');
    } finally { setProcessando(false); }
  };

  if (carregando && !resumo) {
    return <Page><EstadoInterface tipo="loading" titulo="Calculando seu limite" descricao="Estamos marcando suas posiÃ§Ãµes a mercado." /></Page>;
  }
  if (erro && !resumo) {
    return <Page><EstadoInterface tipo="error" titulo="Limite indisponÃ­vel" descricao={erro} acao="Tentar novamente" onAcao={carregarResumo} /></Page>;
  }

  return (
    <Page>
      <Hero>
        <HeroCopy>
          <Eyebrow><FiRefreshCw /> Continuidade competitiva</Eyebrow>
          <h1>Recarga de RecuperaÃ§Ã£o</h1>
          <p>Recomponha seu patrimÃ´nio atÃ© T$ 1.000 sem apagar prejuÃ­zos nem melhorar artificialmente sua posiÃ§Ã£o no ranking.</p>
        </HeroCopy>
        <RateBadge><span>CotaÃ§Ã£o fixa</span><strong>R$ 1 = T$ 20</strong><small>sem bÃ´nus ou desconto progressivo</small></RateBadge>
      </Hero>

      <SummaryGrid>
        <SummaryCard><span>PatrimÃ´nio total</span><strong>{formatTs(resumo?.patrimonio)}</strong><small>saldo, ordens e posiÃ§Ãµes a mercado</small></SummaryCard>
        <SummaryCard><span>Rentabilidade preservada</span><strong className={Number(resumo?.rentabilidade) < 0 ? 'negative' : 'positive'}>{formatPercent(resumo?.rentabilidade)}</strong><small>a recarga nÃ£o altera este percentual</small></SummaryCard>
        <SummaryCard><span>Limite disponÃ­vel</span><strong>{podeConcluir ? formatTs(maximoPermitido) : 'Bloqueado'}</strong><small>{podeConcluir ? 'diferenÃ§a permitida atÃ© T$ 1.000' : motivoBloqueio}</small></SummaryCard>
      </SummaryGrid>

      {!podeConcluir && <Unavailable><FiInfo /><div><strong>Explore a recuperaÃ§Ã£o em modo de demonstraÃ§Ã£o</strong><p>VocÃª pode mover a barra, testar valores e entender a conversÃ£o. {motivoBloqueio}</p></div></Unavailable>}

      <CheckoutGrid>
        <BuilderCard>
          <SectionHead><div><span>{modoDemonstracao ? 'Simule sua recarga' : 'Escolha sua recarga'}</span><h2>{formatTs(quantidade)}</h2></div><Price><span>{modoDemonstracao ? 'Valor simulado' : 'VocÃª pagarÃ¡'}</span><strong>{formatBrl(valorReais)}</strong></Price></SectionHead>
          <SliderLabels><span>{formatTs(minimo)}</span><span>{formatTs(maximo)}</span></SliderLabels>
          <Slider type="range" min={minimo} max={Math.max(minimo, maximo)} step={passo}
            value={Math.min(Math.max(minimo, maximo), Math.max(minimo, quantidade))}
            onChange={(e) => setQuantidade(Number(e.target.value))}
            style={{ '--progress': `${Math.max(0, Math.min(100, progresso))}%` }}
            aria-label="Quantidade de T$ para recarregar" />
          <ConversionScale><span>{formatBrl(minimo * .05)}</span><span>{formatBrl(maximo * .05)}</span></ConversionScale>
          <QuickActions>
            <button type="button" onClick={() => selecionarPercentual(.25)}>25%</button>
            <button type="button" onClick={() => selecionarPercentual(.5)}>50%</button>
            <button type="button" onClick={() => selecionarPercentual(.75)}>75%</button>
            <button type="button" onClick={() => selecionarPercentual(1)}>MÃ¡ximo</button>
          </QuickActions>
          <ExactField><label htmlFor="quantidade-ts">Quantidade exata</label><div><span>T$</span><input id="quantidade-ts" type="number" min={minimo} max={Math.max(minimo,maximo)} step={passo} value={quantidade}
            onChange={(e) => { const v = Number(e.target.value); if (Number.isFinite(v)) setQuantidade(Math.min(Math.max(minimo,maximo), Math.max(minimo, Math.round(v/passo)*passo))); }} /></div></ExactField>
          <Projection>
            <div><span>PatrimÃ´nio atual</span><strong>{formatTs(patrimonio)}</strong></div><Arrow>+</Arrow>
            <div><span>Recarga</span><strong>{formatTs(quantidade)}</strong></div><Arrow>=</Arrow>
            <div><span>{modoDemonstracao ? 'PatrimÃ´nio simulado' : 'PatrimÃ´nio projetado'}</span><strong>{formatTs(patrimonioProjetado)}</strong></div>
          </Projection>
          <PayButton type="button" onClick={iniciarPagamento} disabled={processando || !resumo?.asaasConfigurado || !podeConcluir}>
            {processando ? 'Abrindo checkout seguro...' : !podeConcluir ? 'Pagamento disponÃ­vel abaixo de T$ 900' : resumo?.asaasConfigurado ? `Pagar ${formatBrl(valorReais)} via Pix ou cartÃ£o` : 'Asaas aguardando ativaÃ§Ã£o'}
          </PayButton>
          {!podeConcluir ? <ConfigHint>Esta simulaÃ§Ã£o nÃ£o cria cobranÃ§a nem altera seu saldo.</ConfigHint>
            : !resumo?.asaasConfigurado && <ConfigHint>O pagamento estÃ¡ indisponÃ­vel atÃ© a ativaÃ§Ã£o do Asaas no backend.</ConfigHint>}
        </BuilderCard>
        <RulesCard>
          <h3><FiShield /> ProteÃ§Ã£o da competiÃ§Ã£o</h3>
          <Rule><FiCheck /><span>VocÃª sÃ³ pode comprar a diferenÃ§a atÃ© T$ 1.000.</span></Rule>
          <Rule><FiCheck /><span>A rentabilidade negativa e todo o histÃ³rico permanecem.</span></Rule>
          <Rule><FiCheck /><span>O aporte Ã© neutralizado nos rankings Geral, Premium e Privados.</span></Rule>
          <Rule><FiCheck /><span>T$ nÃ£o pode ser sacado, transferido ou convertido em reais.</span></Rule>
          <Rule><FiCheck /><span>O limite Ã© conferido novamente quando o pagamento Ã© confirmado.</span></Rule>
          <Risk><FiAlertTriangle /><span>Recarga nÃ£o garante recuperaÃ§Ã£o. Suas decisÃµes podem reduzir novamente o saldo.</span></Risk>
        </RulesCard>
      </CheckoutGrid>

      {recarga && <PaymentCard>
        <PaymentHead><div><span>Pagamento Asaas</span><h2>{recarga.status === 'CONFIRMADA' ? 'Recarga confirmada' : recarga.status === 'PENDENTE' ? 'Aguardando confirmaÃ§Ã£o' : 'SituaÃ§Ã£o da recarga'}</h2></div><Status $status={recarga.status}>{recarga.status}</Status></PaymentHead>
        {recarga.status === 'CONFIRMADA'
          ? <Success><FiCheck /><div><strong>{formatTs(recarga.quantidadeTs)} adicionados ao saldo.</strong><p>Sua rentabilidade anterior foi preservada.</p></div></Success>
          : recarga.status === 'PENDENTE'
            ? <PaymentInstructions><p>Conclua a cobranÃ§a na pÃ¡gina segura do Asaas. O crÃ©dito serÃ¡ feito automaticamente apÃ³s a confirmaÃ§Ã£o oficial.</p>
                {validCheckoutUrl(checkoutUrl) && <CheckoutLink href={checkoutUrl} rel="noopener noreferrer"><FiExternalLink /> Continuar pagamento no Asaas</CheckoutLink>}
                <RefreshButton type="button" onClick={() => consultarStatus(recarga.id)}>Atualizar situaÃ§Ã£o</RefreshButton>
              </PaymentInstructions>
            : <Unavailable><FiInfo /><div><strong>{recarga.status === 'REEMBOLSADA' ? 'Pagamento reembolsado' : 'Pagamento nÃ£o concluÃ­do'}</strong><p>{recarga.motivoFalha || 'VocÃª pode tentar novamente quando estiver elegÃ­vel.'}</p></div></Unavailable>}
      </PaymentCard>}
      {erro && resumo && <InlineError>{erro}</InlineError>}
    </Page>
  );
}

export default withAuth(RecargaRecuperacaoPage);

const Page = styled.main`max-width:1180px;margin:0 auto;padding:34px 24px 72px;color:#eaf0f7;@media(max-width:640px){padding:22px 14px 52px}`;
const Hero = styled.section`display:flex;justify-content:space-between;gap:28px;align-items:flex-end;padding:30px;border:1px solid rgba(77,226,139,.18);border-radius:24px;background:radial-gradient(circle at 88% 10%,rgba(77,226,139,.14),transparent 32%),linear-gradient(145deg,#0b1724,#07101a);box-shadow:0 24px 60px rgba(0,0,0,.28);h1{font-size:clamp(2rem,5vw,3.35rem);line-height:1;margin:10px 0 14px;letter-spacing:-.04em}p{max-width:690px;color:#9dafc2;line-height:1.65;margin:0;font-size:1.02rem}@media(max-width:760px){align-items:stretch;flex-direction:column;padding:23px}`;
const HeroCopy = styled.div``;
const Eyebrow = styled.span`display:inline-flex;align-items:center;gap:8px;color:#4de28b;text-transform:uppercase;letter-spacing:.14em;font-size:.72rem;font-weight:800`;
const RateBadge = styled.div`min-width:210px;padding:18px;border-radius:17px;background:rgba(5,13,21,.72);border:1px solid rgba(255,255,255,.08);display:flex;flex-direction:column;gap:5px;span,small{color:#8295a9;font-size:.75rem}strong{font-size:1.2rem;color:#fff}`;
const SummaryGrid = styled.section`display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:18px 0;@media(max-width:760px){grid-template-columns:1fr}`;
const SummaryCard = styled.article`padding:19px 20px;border-radius:17px;background:#0c1723;border:1px solid rgba(255,255,255,.07);display:flex;flex-direction:column;gap:5px;span,small{color:#8295a9;font-size:.78rem}strong{font-size:1.32rem}.negative{color:#ff7b82}.positive{color:#4de28b}`;
const CheckoutGrid = styled.section`display:grid;grid-template-columns:minmax(0,1.7fr) minmax(280px,.8fr);gap:18px;align-items:start;@media(max-width:900px){grid-template-columns:1fr}`;
const BuilderCard = styled.article`padding:28px;border-radius:22px;background:linear-gradient(160deg,#101d2b,#09131e);border:1px solid rgba(77,226,139,.16);@media(max-width:640px){padding:20px 16px}`;
const SectionHead = styled.header`display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:26px;span{font-size:.77rem;color:#8fa1b5;text-transform:uppercase;letter-spacing:.09em}h2{font-size:2.25rem;margin:5px 0 0}@media(max-width:520px){align-items:flex-start;flex-direction:column}`;
const Price = styled.div`text-align:right;display:flex;flex-direction:column;gap:4px;strong{font-size:1.45rem;color:#4de28b}@media(max-width:520px){text-align:left}`;
const SliderLabels = styled.div`display:flex;justify-content:space-between;color:#8fa1b5;font-size:.78rem;margin-bottom:8px`;
const Slider = styled.input`width:100%;height:8px;appearance:none;border-radius:99px;background:linear-gradient(to right,#4de28b var(--progress),#243241 var(--progress));outline:none;&::-webkit-slider-thumb{appearance:none;width:26px;height:26px;border-radius:50%;background:#07121c;border:6px solid #4de28b;box-shadow:0 0 0 5px rgba(77,226,139,.15);cursor:grab}&::-moz-range-thumb{width:17px;height:17px;border-radius:50%;background:#07121c;border:6px solid #4de28b;cursor:grab}`;
const ConversionScale = styled.div`display:flex;justify-content:space-between;margin-top:8px;color:#607387;font-size:.74rem`;
const QuickActions = styled.div`display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:22px 0;button{border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:9px;background:#121f2d;color:#cbd6e1;font-weight:700;cursor:pointer;&:hover{border-color:#4de28b;color:#4de28b}}`;
const ExactField = styled.div`display:flex;justify-content:space-between;align-items:center;gap:18px;padding:14px 0;border-top:1px solid rgba(255,255,255,.07);border-bottom:1px solid rgba(255,255,255,.07);label{color:#9caec0;font-size:.86rem}div{display:flex;align-items:center;background:#07121c;border:1px solid #263646;border-radius:10px;overflow:hidden}span{padding-left:12px;color:#4de28b;font-weight:800}input{width:110px;padding:10px;background:transparent;border:0;outline:0;color:#fff;font-weight:800;font-size:1rem;text-align:right}@media(max-width:420px){align-items:stretch;flex-direction:column;div{justify-content:space-between}input{width:100%}}`;
const Projection = styled.div`display:grid;grid-template-columns:1fr auto 1fr auto 1fr auto 1fr;gap:10px;align-items:center;margin:22px 0;div{min-width:0;span{display:block;color:#718498;font-size:.7rem;margin-bottom:5px}strong{font-size:.96rem}}@media(max-width:640px){grid-template-columns:1fr;div{padding:8px 0}}`;
const Arrow = styled.span`color:#4de28b;font-weight:900;@media(max-width:640px){display:none}`;
const PayButton = styled.button`width:100%;border:0;border-radius:13px;padding:15px;background:linear-gradient(135deg,#34d77a,#4de28b);color:#04120a;font-size:1rem;font-weight:900;cursor:pointer;box-shadow:0 12px 28px rgba(77,226,139,.16);&:disabled{cursor:not-allowed;filter:grayscale(.8);opacity:.58}`;
const ConfigHint = styled.p`margin:11px 0 0;text-align:center;color:#f4c56a;font-size:.78rem`;
const RulesCard = styled.aside`padding:24px;border-radius:22px;background:#0c1723;border:1px solid rgba(255,255,255,.07);h3{display:flex;align-items:center;gap:9px;margin:0 0 20px;font-size:1.05rem;color:#fff}h3 svg{color:#4de28b}`;
const Rule = styled.div`display:flex;gap:10px;align-items:flex-start;margin:13px 0;color:#aab9c8;font-size:.86rem;line-height:1.5;svg{flex:0 0 auto;color:#4de28b;margin-top:3px}`;
const Risk = styled.div`display:flex;gap:10px;padding:14px;margin-top:18px;border-radius:12px;background:rgba(244,197,106,.08);color:#e8c879;font-size:.8rem;line-height:1.45;svg{flex:0 0 auto;margin-top:2px}`;
const Unavailable = styled.section`display:flex;gap:14px;align-items:flex-start;padding:22px;border:1px solid rgba(244,197,106,.2);background:rgba(244,197,106,.07);border-radius:18px;color:#f4c56a;strong{display:block;color:#fff;margin-bottom:5px}p{margin:0;color:#b8a77f;line-height:1.5}svg{flex:0 0 auto;margin-top:3px}`;
const PaymentCard = styled.section`margin-top:18px;padding:26px;border-radius:22px;background:#0c1723;border:1px solid rgba(77,226,139,.16)`;
const PaymentHead = styled.header`display:flex;justify-content:space-between;gap:18px;align-items:center;margin-bottom:20px;span{color:#8295a9;font-size:.75rem;text-transform:uppercase;letter-spacing:.1em}h2{margin:5px 0 0;font-size:1.4rem}`;
const Status = styled.strong`padding:7px 10px;border-radius:999px;background:${({$status})=>$status==='CONFIRMADA'?'rgba(77,226,139,.12)':'rgba(244,197,106,.1)'};color:${({$status})=>$status==='CONFIRMADA'?'#4de28b':'#f4c56a'};font-size:.72rem`;
const Success = styled.div`display:flex;align-items:center;gap:14px;padding:18px;border-radius:14px;background:rgba(77,226,139,.08);color:#4de28b;svg{font-size:1.8rem}strong{color:#fff}p{margin:5px 0 0;color:#91a79b}`;
const PaymentInstructions = styled.div`p{color:#9dafc2;line-height:1.6}`;
const CheckoutLink = styled.a`display:inline-flex;align-items:center;gap:8px;margin-top:10px;padding:12px 18px;border-radius:12px;background:#4de28b;color:#04120a;font-weight:800;text-decoration:none`;
const RefreshButton = styled.button`display:block;margin-top:15px;padding:10px 14px;border-radius:9px;background:#203347;color:#fff;border:0;cursor:pointer`;
const InlineError = styled.div`margin-top:14px;padding:12px 14px;border-radius:11px;background:rgba(255,91,100,.08);border:1px solid rgba(255,91,100,.18);color:#ff9298;font-size:.86rem`;
