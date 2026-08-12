import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { FiAlertTriangle, FiCheck, FiCopy, FiInfo, FiRefreshCw, FiShield } from 'react-icons/fi';
import { loadStripe } from '@stripe/stripe-js';
import api from '../lib/api';
import withAuth from '../components/withAuth';
import EstadoInterface from '../components/EstadoInterface';
import { useToast } from '../components/ToastProvider';
import { AuthContext } from '../contexts/AuthContexts';

const formatTs = (value) => `T$ ${Number(value || 0).toLocaleString('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

const formatBrl = (value) => Number(value || 0).toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const formatPercent = (value) => `${Number(value || 0).toLocaleString('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}%`;

function RecargaRecuperacaoPage() {
  const [resumo, setResumo] = useState(null);
  const [quantidade, setQuantidade] = useState(100);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');
  const [recarga, setRecarga] = useState(null);
  const [pix, setPix] = useState(null);
  const pollingRef = useRef(null);
  const { adicionarToast } = useToast();
  const { usuario, refreshSaldo, refreshUsuario } = useContext(AuthContext);

  const carregarResumo = useCallback(async () => {
    try {
      setCarregando(true);
      setErro('');
      const { data } = await api.get('/recarga-recuperacao/resumo');
      setResumo(data);
      setQuantidade((atual) => {
        const maximo = Number(data.maximoTs || 0);
        if (maximo < Number(data.minimoTs || 100)) return Number(data.minimoTs || 100);
        return Math.min(Math.max(Number(data.minimoTs || 100), atual), maximo);
      });
    } catch (error) {
      setErro(error?.response?.data?.erro || 'Não foi possível calcular seu limite de recuperação.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarResumo();
    return () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current);
    };
  }, [carregarResumo]);

  const maximo = Number(resumo?.maximoTs || 0);
  const minimo = Number(resumo?.minimoTs || 100);
  const passo = Number(resumo?.passoTs || 10);
  const valorReais = useMemo(
    () => (Number(quantidade || 0) * Number(resumo?.centavosPorTs || 5)) / 100,
    [quantidade, resumo]
  );
  const patrimonioProjetado = Number(resumo?.patrimonio || 0) + Number(quantidade || 0);
  const progresso = maximo > minimo
    ? ((quantidade - minimo) / (maximo - minimo)) * 100
    : 100;

  const selecionarPercentual = (percentual) => {
    if (maximo < minimo) return;
    if (percentual === 1) {
      setQuantidade(maximo);
      return;
    }
    const bruto = minimo + (maximo - minimo) * percentual;
    const ajustado = Math.round(bruto / passo) * passo;
    setQuantidade(Math.min(maximo, Math.max(minimo, ajustado)));
  };

  const consultarStatus = useCallback(async (id) => {
    try {
      const { data } = await api.get(`/recarga-recuperacao/intencoes/${id}`);
      const atual = data.recarga;
      setRecarga(atual);
      if (atual.status === 'CONFIRMADA') {
        if (pollingRef.current) window.clearInterval(pollingRef.current);
        pollingRef.current = null;
        await Promise.all([refreshSaldo(), refreshUsuario()]);
        adicionarToast(`Recarga de T$ ${atual.quantidadeTs} confirmada.`, 'sucesso');
        await carregarResumo();
      } else if (['FALHA', 'EXPIRADA', 'CANCELADA', 'REEMBOLSADA'].includes(atual.status)) {
        if (pollingRef.current) window.clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    } catch (_) {
      // O próximo ciclo tenta novamente; a confirmação oficial continua no webhook.
    }
  }, [adicionarToast, carregarResumo, refreshSaldo, refreshUsuario]);

  const iniciarPagamento = async () => {
    if (!resumo?.elegivel || processando) return;
    if (!resumo.pixConfigurado || !resumo.stripePublishableKey) {
      adicionarToast('O pagamento PIX ainda não foi ativado pela TradeSports.', 'erro');
      return;
    }

    try {
      setProcessando(true);
      setErro('');
      setPix(null);
      const key = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const { data } = await api.post(
        '/recarga-recuperacao/intencoes',
        { quantidadeTs: Number(quantidade) },
        { headers: { 'Idempotency-Key': key } }
      );
      setRecarga(data.recarga);

      const stripe = await loadStripe(data.stripePublishableKey);
      if (!stripe || !data.clientSecret) throw new Error('Não foi possível abrir o pagamento PIX.');

      const result = await stripe.confirmPixPayment(
        data.clientSecret,
        {
          payment_method: {
            billing_details: {
              name: [usuario?.nome, usuario?.sobrenome].filter(Boolean).join(' ') || usuario?.nomeUsuario,
              email: usuario?.email,
              tax_id: String(usuario?.cpf || '').replace(/\D/g, ''),
            },
          },
        },
        { handleActions: false }
      );

      if (result.error) throw new Error(result.error.message);
      const details = result.paymentIntent?.next_action?.pix_display_qr_code;
      if (!details) throw new Error('O código PIX não foi gerado. Tente novamente.');
      setPix({
        copiaECola: details.data,
        qrCode: details.image_url_png || details.image_url_svg,
        instrucoes: details.hosted_instructions_url,
        expiraEm: details.expires_at ? new Date(details.expires_at * 1000) : new Date(data.recarga.expiraEm),
      });

      if (pollingRef.current) window.clearInterval(pollingRef.current);
      pollingRef.current = window.setInterval(() => consultarStatus(data.recarga.id), 4000);
      consultarStatus(data.recarga.id);
    } catch (error) {
      const mensagem = error?.response?.data?.erro || error?.message || 'Não foi possível iniciar o pagamento.';
      setErro(mensagem);
      adicionarToast(mensagem, 'erro');
    } finally {
      setProcessando(false);
    }
  };

  const copiarPix = async () => {
    try {
      await navigator.clipboard.writeText(pix?.copiaECola || '');
      adicionarToast('Código PIX copiado.', 'sucesso');
    } catch (_) {
      adicionarToast('Não foi possível copiar o código PIX.', 'erro');
    }
  };

  if (carregando) {
    return <Page><EstadoInterface tipo="loading" titulo="Calculando seu limite" descricao="Estamos marcando suas posições a mercado." /></Page>;
  }

  if (erro && !resumo) {
    return <Page><EstadoInterface tipo="error" titulo="Limite indisponível" descricao={erro} acao="Tentar novamente" onAcao={carregarResumo} /></Page>;
  }

  return (
    <Page>
      <Hero>
        <HeroCopy>
          <Eyebrow><FiRefreshCw /> Continuidade competitiva</Eyebrow>
          <h1>Recarga de Recuperação</h1>
          <p>Recomponha seu patrimônio até T$ 1.000 sem apagar prejuízos nem melhorar artificialmente sua posição no ranking.</p>
        </HeroCopy>
        <RateBadge><span>Cotação fixa</span><strong>R$ 1 = T$ 20</strong><small>sem bônus ou desconto progressivo</small></RateBadge>
      </Hero>

      <SummaryGrid>
        <SummaryCard><span>Patrimônio total</span><strong>{formatTs(resumo?.patrimonio)}</strong><small>saldo, ordens e posições a mercado</small></SummaryCard>
        <SummaryCard><span>Rentabilidade preservada</span><strong className={Number(resumo?.rentabilidade) < 0 ? 'negative' : 'positive'}>{formatPercent(resumo?.rentabilidade)}</strong><small>a recarga não altera este percentual</small></SummaryCard>
        <SummaryCard><span>Limite disponível</span><strong>{formatTs(maximo)}</strong><small>diferença permitida até T$ 1.000</small></SummaryCard>
      </SummaryGrid>

      {!resumo?.elegivel ? (
        <Unavailable>
          <FiInfo />
          <div><strong>Recarga indisponível agora</strong><p>{resumo?.motivoInelegibilidade}</p></div>
        </Unavailable>
      ) : (
        <CheckoutGrid>
          <BuilderCard>
            <SectionHead><div><span>Escolha sua recarga</span><h2>{formatTs(quantidade)}</h2></div><Price><span>Você pagará</span><strong>{formatBrl(valorReais)}</strong></Price></SectionHead>

            <SliderLabels><span>{formatTs(minimo)}</span><span>{formatTs(maximo)}</span></SliderLabels>
            <Slider
              type="range"
              min={minimo}
              max={maximo}
              step={passo}
              value={Math.min(maximo, Math.max(minimo, quantidade))}
              onChange={(event) => setQuantidade(Number(event.target.value))}
              style={{ '--progress': `${Math.max(0, Math.min(100, progresso))}%` }}
              aria-label="Quantidade de T$ para recarregar"
            />
            <ConversionScale><span>{formatBrl(minimo * 0.05)}</span><span>{formatBrl(maximo * 0.05)}</span></ConversionScale>

            <QuickActions>
              <button type="button" onClick={() => selecionarPercentual(0.25)}>25%</button>
              <button type="button" onClick={() => selecionarPercentual(0.5)}>50%</button>
              <button type="button" onClick={() => selecionarPercentual(0.75)}>75%</button>
              <button type="button" onClick={() => selecionarPercentual(1)}>Máximo</button>
            </QuickActions>

            <ExactField>
              <label htmlFor="quantidade-ts">Quantidade exata</label>
              <div><span>T$</span><input id="quantidade-ts" type="number" min={minimo} max={maximo} step={passo} value={quantidade} onChange={(event) => {
                const value = Number(event.target.value);
                if (Number.isFinite(value)) setQuantidade(Math.min(maximo, Math.max(minimo, Math.round(value / passo) * passo)));
              }} /></div>
            </ExactField>

            <Projection>
              <div><span>Patrimônio atual</span><strong>{formatTs(resumo?.patrimonio)}</strong></div>
              <Arrow>+</Arrow>
              <div><span>Recarga</span><strong>{formatTs(quantidade)}</strong></div>
              <Arrow>=</Arrow>
              <div><span>Patrimônio projetado</span><strong>{formatTs(patrimonioProjetado)}</strong></div>
            </Projection>

            <PayButton type="button" onClick={iniciarPagamento} disabled={processando || !resumo.pixConfigurado}>
              {processando ? 'Gerando PIX...' : resumo.pixConfigurado ? `Pagar ${formatBrl(valorReais)} via PIX` : 'PIX aguardando ativação'}
            </PayButton>
            {!resumo.pixConfigurado && <ConfigHint>O ambiente está pronto; falta cadastrar as chaves PIX da conta TradeSports.</ConfigHint>}
          </BuilderCard>

          <RulesCard>
            <h3><FiShield /> Proteção da competição</h3>
            <Rule><FiCheck /><span>Você só pode comprar a diferença até T$ 1.000.</span></Rule>
            <Rule><FiCheck /><span>A rentabilidade negativa e todo o histórico permanecem.</span></Rule>
            <Rule><FiCheck /><span>O aporte é neutralizado nos rankings Geral, Premium e Privados.</span></Rule>
            <Rule><FiCheck /><span>T$ não pode ser sacado, transferido ou convertido em reais.</span></Rule>
            <Rule><FiCheck /><span>O limite é conferido novamente quando o PIX é confirmado.</span></Rule>
            <Risk><FiAlertTriangle /><span>Recarga não garante recuperação. Suas decisões podem reduzir novamente o saldo.</span></Risk>
          </RulesCard>
        </CheckoutGrid>
      )}

      {(pix || recarga) && (
        <PaymentCard>
          <PaymentHead><div><span>Pagamento PIX</span><h2>{recarga?.status === 'CONFIRMADA' ? 'Recarga confirmada' : 'Aguardando pagamento'}</h2></div><Status $status={recarga?.status}>{recarga?.status || 'PENDENTE'}</Status></PaymentHead>
          {recarga?.status === 'CONFIRMADA' ? (
            <Success><FiCheck /><div><strong>{formatTs(recarga.quantidadeTs)} adicionados ao saldo.</strong><p>Sua rentabilidade anterior foi preservada.</p></div></Success>
          ) : recarga?.status === 'REEMBOLSADA' ? (
            <Unavailable><FiInfo /><div><strong>Pagamento reembolsado</strong><p>{recarga.motivoFalha}</p></div></Unavailable>
          ) : pix ? (
            <PixGrid>
              <Qr>{pix.qrCode && (
                // O QR Code é temporário e assinado pela Stripe; não deve passar pelo otimizador de imagens.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pix.qrCode} alt="QR Code PIX da recarga" />
              )}</Qr>
              <PixInfo>
                <strong>Escaneie o QR Code ou use o Pix Copia e Cola</strong>
                <p>O saldo será atualizado automaticamente após a confirmação.</p>
                <PixCode><span>{pix.copiaECola}</span><button type="button" onClick={copiarPix} aria-label="Copiar código PIX"><FiCopy /></button></PixCode>
                <small>Expira em {pix.expiraEm?.toLocaleString('pt-BR')}</small>
              </PixInfo>
            </PixGrid>
          ) : null}
        </PaymentCard>
      )}

      {erro && resumo && <InlineError>{erro}</InlineError>}
    </Page>
  );
}

export default withAuth(RecargaRecuperacaoPage);

const Page = styled.main`max-width: 1180px; margin: 0 auto; padding: 34px 24px 72px; color: #eaf0f7; @media (max-width: 640px){padding: 22px 14px 52px;}`;
const Hero = styled.section`display:flex;justify-content:space-between;gap:28px;align-items:flex-end;padding:30px;border:1px solid rgba(77,226,139,.18);border-radius:24px;background:radial-gradient(circle at 88% 10%,rgba(77,226,139,.14),transparent 32%),linear-gradient(145deg,#0b1724,#07101a);box-shadow:0 24px 60px rgba(0,0,0,.28); h1{font-size:clamp(2rem,5vw,3.35rem);line-height:1;margin:10px 0 14px;letter-spacing:-.04em} p{max-width:690px;color:#9dafc2;line-height:1.65;margin:0;font-size:1.02rem}@media(max-width:760px){align-items:stretch;flex-direction:column;padding:23px;}`;
const HeroCopy = styled.div``;
const Eyebrow = styled.span`display:inline-flex;align-items:center;gap:8px;color:#4de28b;text-transform:uppercase;letter-spacing:.14em;font-size:.72rem;font-weight:800;`;
const RateBadge = styled.div`min-width:210px;padding:18px;border-radius:17px;background:rgba(5,13,21,.72);border:1px solid rgba(255,255,255,.08);display:flex;flex-direction:column;gap:5px;span,small{color:#8295a9;font-size:.75rem}strong{font-size:1.2rem;color:#fff}`;
const SummaryGrid = styled.section`display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:18px 0;@media(max-width:760px){grid-template-columns:1fr;}`;
const SummaryCard = styled.article`padding:19px 20px;border-radius:17px;background:#0c1723;border:1px solid rgba(255,255,255,.07);display:flex;flex-direction:column;gap:5px;span,small{color:#8295a9;font-size:.78rem}strong{font-size:1.32rem}.negative{color:#ff7b82}.positive{color:#4de28b}`;
const CheckoutGrid = styled.section`display:grid;grid-template-columns:minmax(0,1.7fr) minmax(280px,.8fr);gap:18px;align-items:start;@media(max-width:900px){grid-template-columns:1fr;}`;
const BuilderCard = styled.article`padding:28px;border-radius:22px;background:linear-gradient(160deg,#101d2b,#09131e);border:1px solid rgba(77,226,139,.16);@media(max-width:640px){padding:20px 16px;}`;
const SectionHead = styled.header`display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:26px;span{font-size:.77rem;color:#8fa1b5;text-transform:uppercase;letter-spacing:.09em}h2{font-size:2.25rem;margin:5px 0 0}.negative{color:#ff7b82}@media(max-width:520px){align-items:flex-start;flex-direction:column;}`;
const Price = styled.div`text-align:right;display:flex;flex-direction:column;gap:4px;strong{font-size:1.45rem;color:#4de28b}@media(max-width:520px){text-align:left;}`;
const SliderLabels = styled.div`display:flex;justify-content:space-between;color:#8fa1b5;font-size:.78rem;margin-bottom:8px;`;
const Slider = styled.input`width:100%;height:8px;appearance:none;border-radius:99px;background:linear-gradient(to right,#4de28b var(--progress),#243241 var(--progress));outline:none;&::-webkit-slider-thumb{appearance:none;width:26px;height:26px;border-radius:50%;background:#07121c;border:6px solid #4de28b;box-shadow:0 0 0 5px rgba(77,226,139,.15);cursor:grab}&::-moz-range-thumb{width:17px;height:17px;border-radius:50%;background:#07121c;border:6px solid #4de28b;cursor:grab}`;
const ConversionScale = styled.div`display:flex;justify-content:space-between;margin-top:8px;color:#607387;font-size:.74rem;`;
const QuickActions = styled.div`display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:22px 0;button{border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:9px;background:#121f2d;color:#cbd6e1;font-weight:700;cursor:pointer;&:hover{border-color:#4de28b;color:#4de28b}}`;
const ExactField = styled.div`display:flex;justify-content:space-between;align-items:center;gap:18px;padding:14px 0;border-top:1px solid rgba(255,255,255,.07);border-bottom:1px solid rgba(255,255,255,.07);label{color:#9caec0;font-size:.86rem}div{display:flex;align-items:center;background:#07121c;border:1px solid #263646;border-radius:10px;overflow:hidden}span{padding-left:12px;color:#4de28b;font-weight:800}input{width:110px;padding:10px;background:transparent;border:0;outline:0;color:#fff;font-weight:800;font-size:1rem;text-align:right}@media(max-width:420px){align-items:stretch;flex-direction:column;div{justify-content:space-between}input{width:100%}}`;
const Projection = styled.div`display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:10px;align-items:center;margin:22px 0;div{min-width:0;span{display:block;color:#718498;font-size:.7rem;margin-bottom:5px}strong{font-size:.96rem}}@media(max-width:640px){grid-template-columns:1fr;div{padding:8px 0}}`;
const Arrow = styled.span`color:#4de28b;font-weight:900;@media(max-width:640px){display:none;}`;
const PayButton = styled.button`width:100%;border:0;border-radius:13px;padding:15px;background:linear-gradient(135deg,#34d77a,#4de28b);color:#04120a;font-size:1rem;font-weight:900;cursor:pointer;box-shadow:0 12px 28px rgba(77,226,139,.16);&:disabled{cursor:not-allowed;filter:grayscale(.8);opacity:.58}`;
const ConfigHint = styled.p`margin:11px 0 0;text-align:center;color:#f4c56a;font-size:.78rem;`;
const RulesCard = styled.aside`padding:24px;border-radius:22px;background:#0c1723;border:1px solid rgba(255,255,255,.07);h3{display:flex;align-items:center;gap:9px;margin:0 0 20px;font-size:1.05rem;color:#fff}h3 svg{color:#4de28b}`;
const Rule = styled.div`display:flex;gap:10px;align-items:flex-start;margin:13px 0;color:#aab9c8;font-size:.86rem;line-height:1.5;svg{flex:0 0 auto;color:#4de28b;margin-top:3px}`;
const Risk = styled.div`display:flex;gap:10px;padding:14px;margin-top:18px;border-radius:12px;background:rgba(244,197,106,.08);color:#e8c879;font-size:.8rem;line-height:1.45;svg{flex:0 0 auto;margin-top:2px}`;
const Unavailable = styled.section`display:flex;gap:14px;align-items:flex-start;padding:22px;border:1px solid rgba(244,197,106,.2);background:rgba(244,197,106,.07);border-radius:18px;color:#f4c56a;strong{display:block;color:#fff;margin-bottom:5px}p{margin:0;color:#b8a77f;line-height:1.5}svg{flex:0 0 auto;margin-top:3px}`;
const PaymentCard = styled.section`margin-top:18px;padding:26px;border-radius:22px;background:#0c1723;border:1px solid rgba(77,226,139,.16);`;
const PaymentHead = styled.header`display:flex;justify-content:space-between;gap:18px;align-items:center;margin-bottom:20px;span{color:#8295a9;font-size:.75rem;text-transform:uppercase;letter-spacing:.1em}h2{margin:5px 0 0;font-size:1.4rem}`;
const Status = styled.strong`padding:7px 10px;border-radius:999px;background:${({$status})=>$status==='CONFIRMADA'?'rgba(77,226,139,.12)':'rgba(244,197,106,.1)'};color:${({$status})=>$status==='CONFIRMADA'?'#4de28b':'#f4c56a'};font-size:.72rem;`;
const PixGrid = styled.div`display:grid;grid-template-columns:210px 1fr;gap:24px;align-items:center;@media(max-width:620px){grid-template-columns:1fr;}`;
const Qr = styled.div`display:grid;place-items:center;background:#fff;border-radius:16px;padding:12px;min-height:190px;img{display:block;width:100%;max-width:190px}`;
const PixInfo = styled.div`p{color:#8fa1b5;line-height:1.5}small{color:#718498}`;
const PixCode = styled.div`display:flex;align-items:center;gap:10px;margin:14px 0;padding:10px 10px 10px 13px;border-radius:11px;background:#07121c;border:1px solid #243444;span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#9db0c2;font-size:.78rem}button{margin-left:auto;display:grid;place-items:center;border:0;border-radius:8px;padding:9px;background:#183126;color:#4de28b;cursor:pointer}`;
const Success = styled.div`display:flex;align-items:center;gap:14px;padding:18px;border-radius:14px;background:rgba(77,226,139,.08);color:#4de28b;svg{font-size:1.8rem}strong{color:#fff}p{margin:5px 0 0;color:#91a79b}`;
const InlineError = styled.div`margin-top:14px;padding:12px 14px;border-radius:11px;background:rgba(255,91,100,.08);border:1px solid rgba(255,91,100,.18);color:#ff9298;font-size:.86rem;`;
