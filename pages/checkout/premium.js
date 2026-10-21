import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import api from '../../lib/api';
import withAuth from '../../components/withAuth';

const money=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const date=d=>d?String(d).slice(0,10).split('-').reverse().join('/'):'—';
const labels={PENDING:'Aguardando pagamento',ACTIVE:'Ativa',CANCELLED:'Cancelada',EXPIRED:'Expirada',REVOKED:'Suspensa'};
const panel={background:'#14223a',border:'1px solid #293c5c',borderRadius:16,padding:22};
const btn={border:0,borderRadius:10,padding:'13px 18px',fontSize:14,fontWeight:750,cursor:'pointer'};
function CheckoutPremium(){
 const [method,setMethod]=useState('PIX'),[sub,setSub]=useState(null),[payment,setPayment]=useState(null),[history,setHistory]=useState([]);
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const load=useCallback(async(refresh=false)=>{
  setLoading(true);setError('');
  try{
   const r=refresh?await api.post('/asaas/premium/refresh'):await api.get('/asaas/premium/status');
   const s=r.data.subscription||null;setSub(s);
   const requests=[api.get('/asaas/premium/history')];
   if(s&&!s.cancelledAt&&!s.active&&s.billingType==='PIX')requests.push(api.get('/asaas/premium/payment'));
   const results=await Promise.allSettled(requests);
   setHistory(results[0].status==='fulfilled'?results[0].value.data.payments||[]:[]);
   setPayment(results[1]?.status==='fulfilled'?results[1].value.data.payment||null:null);
  }catch(e){setError(e.response?.data?.erro||'Não foi possível consultar a assinatura.');}
  finally{setLoading(false);}
 },[]);
 useEffect(()=>{load();},[load]);
 const pending=Boolean(sub?.status==='PENDING'&&!sub?.cancelledAt&&!sub?.active);
 const switching=pending&&sub?.billingType!==method;
 const canStart=!loading&&(!sub||(!sub.active&&['CANCELLED','EXPIRED','REVOKED'].includes(sub.status)));
 async function start(){
  setBusy(true);setError('');setNotice('');
  try{
   if(switching){
    const msg='Trocar a forma de pagamento? A cobrança Pix pendente será cancelada no Asaas. Não faça o pagamento do código antigo após confirmar.';
    if(!window.confirm(msg))return;
    await api.post('/asaas/premium/change-method',{billingType:method});
   }
   if(method==='PIX'){
    await api.post('/asaas/premium/checkout',{billingType:'PIX'});
    await load(true);
    setNotice('Cobrança Pix disponível. O pagamento é manual a cada mês.');
   }else{
    const {data}=await api.post('/asaas/card/start');
    const url=String(data.url||'');
    if(!/^https:\/\/([a-z0-9-]+\.)*asaas\.com\/checkoutSession\/show\?id=/i.test(url))throw new Error('Link do Asaas inválido.');
    window.location.assign(url);
   }
  }catch(e){await load();setError(e.response?.data?.erro||e.message||'Não foi possível iniciar o pagamento.');}
  finally{setBusy(false);}
 }
 async function cancel(){
  if(!window.confirm('Cancelar futuras renovações? O período já pago será preservado.'))return;
  setBusy(true);setError('');setNotice('');
  try{await api.post('/asaas/premium/cancel');await load();setNotice('Renovações canceladas.');}
  catch(e){setError(e.response?.data?.erro||'Não foi possível cancelar.');}
  finally{setBusy(false);}
 }
 async function copy(){
  try{await navigator.clipboard.writeText(payment?.payload||'');setNotice('Código Pix copiado.');}
  catch{setNotice('Selecione o código para copiar manualmente.');}
 }
 return <main style={{maxWidth:1080,margin:'28px auto',padding:'0 16px 60px',color:'#f1f5f9'}}>
  <Link href="/planos" style={{color:'#9db8db'}}>← Voltar aos planos</Link>
  <p><Link href="/minha-assinatura" style={{color:'#9db8db'}}>Gerenciar assinatura →</Link></p>
  <h1 style={{fontSize:'clamp(26px,4vw,35px)',marginBottom:8}}>Assinar TradeSports Premium</h1>
  <p style={{color:'#a7b7d0'}}>Escolha a forma de pagamento. Nenhuma cobrança altera seu saldo virtual T$.</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,310px),1fr))',gap:18,alignItems:'start'}}>
   <div style={{display:'grid',gap:16}}>
    <section style={panel}>
     <div style={{display:'flex',justifyContent:'space-between',gap:10}}><h2 style={{margin:0,fontSize:19}}>1. Forma de pagamento</h2><span style={{color:'#93c5fd',fontSize:12}}>Sandbox</span></div>
     <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:18}}>
      {['PIX','CREDIT_CARD'].map(m=><button key={m} type="button" onClick={()=>{setMethod(m);setError('');}} aria-pressed={method===m} style={{...btn,minHeight:78,textAlign:'left',color:'#fff',border:'1px solid '+(method===m?'#2bdf9d':'#3b4c65'),background:method===m?'#133d3c':'#17253d'}}>{m==='PIX'?'◇ Pix':'▣ Cartão de crédito'}</button>)}
     </div>
     <p style={{fontSize:13,lineHeight:1.6,color:'#b8c7da'}}>{method==='PIX'?'Pix mensal manual: um novo QR Code será disponibilizado a cada mês. Não é Pix Automático.':'Cartão de crédito com cobrança recorrente. Dados do cartão são preenchidos somente no checkout hospedado pelo Asaas.'}</p>
    </section>
    <section style={panel}>
     <h2 style={{margin:'0 0 14px',fontSize:19}}>2. Minha assinatura</h2>
     <p><strong>Status:</strong> {loading?'Consultando...':sub?labels[sub.status]||sub.status:'Ainda não contratada'}</p>
     {sub?.paidUntil&&<p><strong>Premium válido até:</strong> {date(sub.paidUntil)}</p>}
     {sub?.active&&<p style={{color:'#86efac'}}>Benefícios Premium ativos</p>}
     {pending&&<p style={{color:'#fbd38d',fontSize:13}}>Existe uma cobrança {sub.billingType==='PIX'?'Pix':'por cartão'} pendente. {switching?'Você pode trocar de modalidade antes de pagar.':'Conclua o pagamento ou cancele a cobrança.'}</p>}
     {(canStart||switching)&&<button type="button" disabled={busy} onClick={start} style={{...btn,background:'#e9b60b',color:'#0c1729',width:'100%'}}>{busy?'Aguarde...':switching?'Trocar para '+(method==='PIX'?'Pix':'cartão de crédito'):method==='PIX'?'Gerar cobrança Pix':'Continuar para o Asaas →'}</button>}
     {sub&&!sub.cancelledAt&&['PENDING','ACTIVE'].includes(sub.status)&&<button type="button" disabled={busy} onClick={cancel} style={{...btn,background:'#263951',color:'#fff',marginTop:12}}>Cancelar renovação</button>}
    </section>
    {payment&&<section style={panel}>
     <h2 style={{marginTop:0}}>Cobrança Pix</h2>
     {payment.encodedImage&&<div style={{display:'inline-block',background:'#fff',padding:12,borderRadius:12}}><img alt="QR Code Pix" src={'data:image/png;base64,'+payment.encodedImage} width="218" height="218" style={{display:'block',maxWidth:'100%',height:'auto'}}/></div>}
     <p><strong>Valor:</strong> {money(payment.value)}</p><p><strong>Vencimento:</strong> {date(payment.dueDate)}</p>
     <label htmlFor="pixcode">Pix Copia e Cola</label>
     <textarea id="pixcode" readOnly value={payment.payload||''} style={{width:'100%',minHeight:90,marginTop:8,boxSizing:'border-box',borderRadius:9,padding:10}}/>
     <button type="button" onClick={copy} style={{...btn,background:'#e9b60b'}}>Copiar código Pix</button>
    </section>}
   </div>
   <aside style={{display:'grid',gap:16}}>
    <section style={panel}><h2 style={{marginTop:0,fontSize:19}}>Resumo do pedido</h2><div style={{display:'flex',justifyContent:'space-between'}}><span>TradeSports Premium</span><strong>R$ 9,90</strong></div><p style={{fontSize:13,color:'#9cacc5'}}>Assinatura mensal</p><hr style={{border:0,borderTop:'1px solid #30415c',margin:'18px 0'}}/><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><strong>Total hoje</strong><strong style={{fontSize:26}}>R$ 9,90</strong></div><p style={{fontSize:12,color:'#9cacc5',lineHeight:1.6}}>Cartão: renovação automática mensal. Pix: pagamento manual a cada mês. Benefícios dependem da confirmação do pagamento.</p></section>
    <section style={panel}><h2 style={{marginTop:0,fontSize:18}}>Proteção e transparência</h2><p style={{fontSize:13,lineHeight:1.8,color:'#b8c7da'}}>✓ Processamento pelo Asaas<br/>✓ Dados do cartão somente no Asaas<br/>✓ Premium após confirmação<br/>✓ Cancelamento e histórico disponíveis</p></section>
   </aside>
  </div>
  <section style={{...panel,marginTop:18}}>
   <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center',flexWrap:'wrap'}}><h2 style={{margin:0,fontSize:19}}>Histórico de cobranças</h2><button type="button" disabled={loading||busy} onClick={()=>load(true)} style={{...btn,background:'#263951',color:'#fff'}}>Atualizar situação</button></div>
   {history.length?<div style={{overflowX:'auto',marginTop:16}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}><thead><tr><th align="left">Vencimento</th><th align="left">Valor</th><th align="left">Situação</th></tr></thead><tbody>{history.map(p=><tr key={p.id}><td style={{padding:'12px 4px',borderTop:'1px solid #30415c'}}>{date(p.dueDate)}</td><td style={{borderTop:'1px solid #30415c'}}>{money(p.value)}</td><td style={{borderTop:'1px solid #30415c'}}>{p.status}</td></tr>)}</tbody></table></div>:<p style={{color:'#a7b7d0'}}>Nenhuma cobrança registrada.</p>}
  </section>
  {notice&&!error&&<p role="status" style={{color:'#86efac'}}>{notice}</p>}
  {error&&<p role="alert" style={{color:'#fca5a5'}}>{error}</p>}
  <p style={{fontSize:12,color:'#a7b7d0'}}>Sandbox: não utilize dinheiro real. A ativação do cartão depende da confirmação e vinculação pelo webhook.</p>
 </main>;
}
export default withAuth(CheckoutPremium);
