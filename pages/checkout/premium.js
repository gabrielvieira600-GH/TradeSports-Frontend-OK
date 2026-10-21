import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api';
import withAuth from '../../components/withAuth';

const money = n => Number(n || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const date = d => d ? String(d).slice(0,10).split('-').reverse().join('/') : '—';
const states = {PENDING:'Aguardando pagamento',ACTIVE:'Ativa',CANCELLED:'Cancelada',EXPIRED:'Expirada',REVOKED:'Suspensa'};
const panel = {background:'#14223a',border:'1px solid #293c5c',borderRadius:16,padding:22};
const button = {border:0,borderRadius:10,padding:'14px 18px',fontSize:15,fontWeight:750,cursor:'pointer'};
function PremiumCheckout(){
 const [method,setMethod]=useState('PIX');
 const [sub,setSub]=useState(null),[payment,setPayment]=useState(null),[history,setHistory]=useState([]);
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const load=useCallback(async (refresh=false)=>{
  setLoading(true);setError('');
  try{
   const result=refresh?await api.post('/asaas/premium/refresh'):await api.get('/asaas/premium/status');
   const subscription=result.data.subscription||null;setSub(subscription);
   const tasks=[api.get('/asaas/premium/history')];
   if(subscription&&!subscription.cancelledAt&&!subscription.active&&subscription.billingType==='PIX')tasks.push(api.get('/asaas/premium/payment'));
   const results=await Promise.allSettled(tasks);
   setHistory(results[0].status==='fulfilled'?(results[0].value.data.payments||[]):[]);
   setPayment(results[1]?.status==='fulfilled'?results[1].value.data.payment||null:null);
   if(results[1]?.status==='rejected'&&results[1].reason?.response?.status!==404)setError('Não foi possível consultar a cobrança Pix.');
  }catch(e){setError(e.response?.data?.erro||'Não foi possível consultar sua assinatura.');}
  finally{setLoading(false);}
 },[]);
 useEffect(()=>{load();},[load]);
 const canStart=!sub||(['CANCELLED','EXPIRED','REVOKED'].includes(sub.status)&&!sub.active);
 async function start(){
  setBusy(true);setError('');setNotice('');
  try{
   if(method==='PIX'){
    await api.post('/asaas/premium/checkout',{billingType:'PIX'});await load(true);
   }else{
    const {data}=await api.post('/asaas/card/start');
    if(!data.url||!data.url.startsWith('https://asaas.com/checkoutSession/show?id='))throw new Error('Link de checkout inválido.');
    window.location.assign(data.url);
   }
  }catch(e){setError(e.response?.data?.erro||e.message||'Não foi possível iniciar o pagamento.');}
  finally{setBusy(false);}
 }
 async function cancel(){
  if(!window.confirm('Cancelar futuras renovações? O período já pago continuará disponível até o vencimento.'))return;
  setBusy(true);setError('');
  try{await api.post('/asaas/premium/cancel');setNotice('Renovação cancelada.');await load();}
  catch(e){setError(e.response?.data?.erro||'Não foi possível cancelar a assinatura.');}
  finally{setBusy(false);}
 }
 async function copy(){try{await navigator.clipboard.writeText(payment?.payload||'');setNotice('Código Pix copiado.');}catch{setNotice('Selecione o código para copiar manualmente.');}}
 return <main style={{maxWidth:1080,margin:'28px auto',padding:'0 16px 60px',color:'#f1f5f9',boxSizing:'border-box'}}>
  <Link href="/planos" style={{color:'#9db8db',textDecoration:'none'}}>← Voltar aos planos</Link>
 <p>
  <Link href="/minha-assinatura">
    Gerenciar assinatura →
  </Link>
</p>
  <div style={{display:'flex',alignItems:'center',gap:12,margin:'22px 0 8px',flexWrap:'wrap'}}><h1 style={{fontSize:'clamp(25px,4vw,35px)',margin:0}}>Assinar TradeSports Premium</h1><span style={{fontSize:12,padding:'5px 10px',borderRadius:20,background:'#123c32',color:'#80f1b7'}}>Pagamento seguro</span></div>
  <p style={{color:'#a7b7d0',margin:'0 0 24px'}}>Escolha como deseja pagar sua assinatura. Nenhum pagamento altera seu saldo virtual T$.</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,310px),1fr))',gap:18,alignItems:'start'}}>
   <div style={{display:'grid',gap:16}}>
    <section style={panel}><div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><h2 style={{margin:0,fontSize:19}}>1. Forma de pagamento</h2><span style={{fontSize:12,color:'#93c5fd'}}>Sandbox</span></div>
     <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:18}}>
      {['PIX','CREDIT_CARD'].map(m=><button type="button" key={m} onClick={()=>{setMethod(m);setError('');}} aria-pressed={method===m} style={{...button,textAlign:'left',border:'1px solid '+(method===m?'#2bdf9d':'#3b4c65'),background:method===m?'#133d3c':'#17253d',color:'#fff',minHeight:78}}><span style={{fontSize:20}}>{m==='PIX'?'◇':'▣'}</span><div style={{marginTop:5}}>{m==='PIX'?'Pix':'Cartão de crédito'}</div></button>)}
     </div>
     {method==='PIX'?<p style={{color:'#b8c7da',fontSize:13,lineHeight:1.6}}>Pagamento por QR Code ou Pix Copia e Cola. Uma nova cobrança será disponibilizada mensalmente; não é Pix Automático.</p>:<div style={{color:'#b8c7da',fontSize:13,lineHeight:1.7,marginTop:14}}>Pagamento recorrente por cartão de crédito. Os campos de número do cartão, nome impresso, validade, CVV e dados do titular são apresentados no ambiente seguro do Asaas. A TradeSports não recebe nem armazena esses dados.</div>}
    </section>
    <section style={panel}><h2 style={{margin:'0 0 14px',fontSize:19}}>2. Minha assinatura</h2><p><strong>Status:</strong> {loading?'Consultando...':sub?(states[sub.status]||sub.status):'Ainda não contratada'}</p>{sub?.paidUntil&&<p><strong>Premium válido até:</strong> {date(sub.paidUntil)}</p>}{sub?.active&&<p style={{color:'#8af3c0'}}>✓ Benefícios Premium ativos</p>}
     {canStart&&!loading&&<button disabled={busy} onClick={start} style={{...button,width:'100%',background:'#e9b60b',color:'#0c1729'}}>{busy?'Aguarde...':method==='PIX'?'Gerar cobrança Pix':'Continuar para pagamento seguro →'}</button>}
     {sub&&!sub.cancelledAt&&['PENDING','ACTIVE'].includes(sub.status)&&<button disabled={busy} onClick={cancel} style={{...button,background:'#243750',color:'#fff',marginTop:10}}>Cancelar renovação</button>}
     {sub?.status==='PENDING'&&<p style={{fontSize:13,color:'#fbd38d'}}>Já existe uma assinatura pendente. Conclua o pagamento existente antes de iniciar outra.</p>}
    </section>
    {payment&&<section style={panel}><h2 style={{marginTop:0}}>Cobrança Pix</h2><div style={{display:'inline-block',padding:12,background:'#fff',borderRadius:12}}>{payment.encodedImage&&<img alt="QR Code Pix" src={'data:image/png;base64,'+payment.encodedImage} width="218" height="218" style={{display:'block',maxWidth:'100%',height:'auto'}}/>}</div><p><strong>Valor:</strong> {money(payment.value)}</p><p><strong>Vencimento:</strong> {date(payment.dueDate)}</p><label htmlFor="pixcode">Pix Copia e Cola</label><textarea id="pixcode" readOnly value={payment.payload||''} style={{width:'100%',minHeight:88,marginTop:8,boxSizing:'border-box',borderRadius:9,padding:10,color:'#111',background:'#f1f5f9'}}/><button style={{...button,background:'#e9b60b',color:'#111'}} onClick={copy}>Copiar código Pix</button></section>}
   </div>
   <aside style={{display:'grid',gap:16}}>
    <section style={panel}><h2 style={{margin:'0 0 18px',fontSize:19}}>Resumo do pedido</h2><div style={{display:'flex',justifyContent:'space-between',gap:10}}><span>TradeSports Premium</span><strong>R$ 9,90</strong></div><p style={{color:'#9cacc5',fontSize:13}}>Assinatura mensal</p><hr style={{border:0,borderTop:'1px solid #30415c',margin:'18px 0'}}/><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><strong>Total hoje</strong><strong style={{fontSize:27}}>R$ 9,90</strong></div><p style={{fontSize:12,color:'#9cacc5',lineHeight:1.6}}>Renovação mensal de R$ 9,90. Você pode solicitar cancelamento das futuras renovações na área de assinatura. Os benefícios dependem da confirmação do pagamento.</p></section>
    <section style={panel}><h2 style={{margin:'0 0 12px',fontSize:18}}>Proteção e transparência</h2><p style={{fontSize:13,color:'#b8c7da',lineHeight:1.8}}>✓ Transação processada pelo Asaas<br/>✓ Dados de cartão inseridos no Asaas<br/>✓ Premium somente após confirmação<br/>✓ Histórico e cancelamento disponíveis</p></section>
   </aside>
  </div>
  <section style={{...panel,marginTop:18}}><div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap',alignItems:'center'}}><h2 style={{fontSize:19,margin:0}}>Histórico de cobranças</h2><button disabled={loading||busy} onClick={()=>load(true)} style={{...button,background:'#263951',color:'#fff'}}>Atualizar situação</button></div>{history.length?<div style={{overflowX:'auto',marginTop:14}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}><thead><tr><th align="left">Vencimento</th><th align="left">Valor</th><th align="left">Situação</th></tr></thead><tbody>{history.map(p=><tr key={p.id}><td style={{padding:'12px 4px',borderTop:'1px solid #30415c'}}>{date(p.dueDate)}</td><td style={{borderTop:'1px solid #30415c'}}>{money(p.value)}</td><td style={{borderTop:'1px solid #30415c'}}>{p.status}</td></tr>)}</tbody></table></div>:<p style={{color:'#a7b7d0',fontSize:13}}>Nenhuma cobrança registrada.</p>}</section>
  {notice&&!error&&<p role="status" style={{color:'#86efac'}}>{notice}</p>}{error&&<p role="alert" style={{color:'#fca5a5'}}>{error}</p>}
  <p style={{color:'#a7b7d0',fontSize:12}}>Ambiente de testes (Sandbox). Não utilize dinheiro real. A confirmação do cartão e a vinculação automática da assinatura ainda exigem validação do webhook.</p>
 </main>;
}
export default withAuth(PremiumCheckout);
