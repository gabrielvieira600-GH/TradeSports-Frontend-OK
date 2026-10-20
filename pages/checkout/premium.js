import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api';
import withAuth from '../../components/withAuth';

const btn = { padding:'12px 16px', borderRadius:10, border:'1px solid #64748b', fontWeight:700, cursor:'pointer' };
function PremiumCheckout() {
  const [busy,setBusy] = useState(false);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [payment,setPayment] = useState(null);
  const [status,setStatus] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const {data:plan} = await api.get('/asaas/premium/status');
      setStatus(plan.subscription || null);
      if (plan.subscription?.status === 'ACTIVE') {
        setPayment(null);
        setNotice('Sua assinatura Premium está ativa.');
        return;
      }
      try {
        const {data:result} = await api.get('/asaas/premium/payment');
        setPayment(result.payment || null);
        if (result.payment) setNotice('Cobrança Pix disponível para pagamento.');
        else setNotice(plan.subscription ? 'Ainda não há cobrança pendente.' : '');
      } catch(e) {
        if (e.response?.status === 404) {
          setPayment(null);
          setNotice('Nenhuma assinatura iniciada.');
        } else {
          setError(e.response?.data?.erro || 'Não foi possível atualizar o pagamento.');
        }
      }
    } catch(e) {
      setError(e.response?.data?.erro || 'Não foi possível consultar a assinatura.');
    } finally {setLoading(false);}
  }, []);

  useEffect(()=>{load();},[load]);

  async function create() {
    setBusy(true);setError('');setNotice('');
    try {
      await api.post('/asaas/premium/checkout',{billingType:'PIX'});
      await load();
    } catch(e) {
      setError(e.response?.data?.erro || 'Não foi possível gerar a cobrança.');
    } finally {setBusy(false);}
  }
  async function copy() {
    if (!payment?.payload) return;
    try {
      await navigator.clipboard.writeText(payment.payload);
      setNotice('Código Pix copiado.');
    } catch(e) {
      setNotice('Selecione e copie manualmente o código Pix abaixo.');
    }
  }
  const dateText = payment?.dueDate
    ? payment.dueDate.split('-').reverse().join('/')
    : 'Não informado';

  return <main style={{width:'min(100% - 24px, 680px)',margin:'24px auto',padding:'clamp(18px,4vw,32px)',boxSizing:'border-box',color:'#f8fafc',background:'#101c32',border:'1px solid #253451',borderRadius:20}}>
    <h1 style={{fontSize:'clamp(26px,5vw,36px)',margin:'0 0 16px'}}>TradeSports Premium</h1>
    <p style={{fontSize:30,fontWeight:800,margin:'0 0 14px'}}>R$ 9,90 <small style={{fontSize:16}}>/ mês</small></p>
    <p style={{lineHeight:1.55}}>Assinatura mensal com cobrança Pix. O pagamento não é debitado automaticamente: uma nova cobrança será emitida a cada mês.</p>
    <p style={{lineHeight:1.55}}>O Premium é liberado após a confirmação do pagamento pelo Asaas.</p>
    {status?.status === 'ACTIVE' ? <div role="status" style={{padding:16,borderRadius:12,background:'#123d32',color:'#a7f3d0'}}>Sua assinatura Premium está ativa. <Link href="/planos">Ver planos</Link>.</div> : <>
      {!payment && !loading && <button type="button" onClick={create} disabled={busy} style={{...btn,background:'#eab308',color:'#111827'}}>{busy?'Gerando...':status?.status==='PENDING'?'Consultar cobrança Pix':'Gerar cobrança Pix'}</button>}
      {payment && <section style={{marginTop:22}}>
        <h2 style={{fontSize:22}}>Pagamento Pix</h2>
        <div style={{padding:14,background:'#fff',borderRadius:12,width:'fit-content',maxWidth:'100%'}}>
          {payment.encodedImage && <img alt="QR Code da cobrança Pix" width={240} height={240} style={{display:'block',maxWidth:'100%',height:'auto'}} src={`data:image/png;base64,${payment.encodedImage}`}/>}
        </div>
        <p><strong>Valor:</strong> R$ {Number(payment.value || 9.90).toFixed(2).replace('.',',')}</p>
        <p><strong>Vencimento:</strong> {dateText}</p>
        <label htmlFor="pix-copy">Pix Copia e Cola</label>
        <textarea id="pix-copy" readOnly value={payment.payload || ''} style={{display:'block',width:'100%',boxSizing:'border-box',margin:'8px 0 12px',minHeight:90,resize:'vertical',borderRadius:10,padding:12,background:'#e2e8f0',color:'#0f172a',overflowWrap:'anywhere'}}/>
        <button type="button" onClick={copy} style={{...btn,background:'#eab308',color:'#111827'}}>Copiar código Pix</button>
        <p style={{fontSize:13,color:'#94a3b8'}}>Ambiente de testes: não realize pagamentos reais.</p>
      </section>}
    </>}
    <div style={{marginTop:22}}>
      <button type="button" onClick={load} disabled={busy || loading} style={{...btn,background:'#1e293b',color:'#f8fafc'}}>{loading?'Consultando...':'Atualizar situação'}</button>
    </div>
    {notice && !error && <p role="status" style={{color:'#86efac'}}>{notice}</p>}
    {error && <p role="alert" style={{color:'#fca5a5'}}>{error}</p>}
    <p style={{marginTop:20}}><Link href="/planos" style={{color:'#93c5fd'}}>Voltar aos planos</Link></p>
  </main>;
}
export default withAuth(PremiumCheckout);
