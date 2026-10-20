import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import api from '../../lib/api';
import withAuth from '../../components/withAuth';
const btn={padding:'12px 16px',borderRadius:10,border:'1px solid #64748b',cursor:'pointer',fontWeight:700};
const date=d=>d?new Date(d).toLocaleDateString('pt-BR',{timeZone:'UTC'}):'—';
const states={PENDING:'Aguardando pagamento',ACTIVE:'Ativa',CANCELLED:'Cancelada (sem renovação)',EXPIRED:'Expirada',REVOKED:'Suspensa para revisão'};
function PremiumCheckout(){
 const [sub,setSub]=useState(null),[payment,setPayment]=useState(null),[history,setHistory]=useState([]),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const load=useCallback(async(refresh=false)=>{
  setLoading(true);setError('');
  try{
   const s=refresh?await api.post('/asaas/premium/refresh'):await api.get('/asaas/premium/status');
   const subscription=s.data.subscription||null;setSub(subscription);
   const requests=[api.get('/asaas/premium/history')];
   if(subscription&&!subscription.cancelledAt)requests.push(api.get('/asaas/premium/payment'));
   const results=await Promise.allSettled(requests);
   if(results[0].status==='fulfilled')setHistory(results[0].value.data.payments||[]);
   else setError('Não foi possível consultar o histórico de cobranças.');
   if(results[1]?.status==='fulfilled')setPayment(results[1].value.data.payment||null);
   else if(results[1]?.status==='rejected'&&results[1].reason.response?.status!==404)setError('Não foi possível consultar o QR Code. Tente novamente.');
   if(!subscription||subscription.cancelledAt||subscription.active)setPayment(null);
  }catch(e){setError(e.response?.data?.erro||'Não foi possível consultar a assinatura.');}
  finally{setLoading(false);}
 },[]);
 useEffect(()=>{load();},[load]);
 async function start(){setBusy(true);setError('');try{await api.post('/asaas/premium/checkout',{billingType:'PIX'});await load(true);}catch(e){setError(e.response?.data?.erro||'Falha ao criar assinatura.');}finally{setBusy(false);}}
 async function cancel(){if(!window.confirm('Cancelar a renovação mensal? O acesso já pago permanece até o fim do período.'))return;setBusy(true);setError('');try{await api.post('/asaas/premium/cancel');setNotice('Renovação cancelada. O período pago permanece disponível até o vencimento.');await load();}catch(e){setError(e.response?.data?.erro||'Não foi possível cancelar.');}finally{setBusy(false);}}
 async function copy(){try{await navigator.clipboard.writeText(payment?.payload||'');setNotice('Código Pix copiado.');}catch(e){setNotice('Copie manualmente o código abaixo.');}}
 const canStart=!sub||['CANCELLED','EXPIRED','REVOKED'].includes(sub.status)&&!sub.active;
 return <main style={{width:'min(100% - 24px,720px)',margin:'24px auto',padding:'clamp(18px,4vw,32px)',boxSizing:'border-box',color:'#f8fafc',background:'#101c32',border:'1px solid #253451',borderRadius:20}}>
  <h1 style={{fontSize:'clamp(26px,5vw,36px)'}}>TradeSports Premium</h1>
  <p style={{fontSize:28,fontWeight:800}}>R$ 9,90 <small style={{fontSize:16}}>/ mês</small></p>
  <p>Pagamento mensal via Pix convencional. Não há débito automático.</p>
  <section style={{padding:16,borderRadius:12,background:'#192b45',margin:'20px 0'}}>
   <h2 style={{marginTop:0,fontSize:20}}>Minha assinatura</h2>
   <p><strong>Situação:</strong> {loading?'Consultando...':sub?(states[sub.status]||sub.status):'Sem assinatura'}</p>
   {sub?.paidUntil&&<p><strong>Benefícios pagos até:</strong> {date(sub.paidUntil)}</p>}
   {sub?.cancelledAt&&<p><strong>Cancelamento solicitado:</strong> {date(sub.cancelledAt)}</p>}
   {sub?.active&&<p style={{color:'#86efac'}}>Seu acesso Premium está ativo.</p>}
   {sub&&!sub.cancelledAt&&['ACTIVE','PENDING'].includes(sub.status)&&<button type="button" disabled={busy} onClick={cancel} style={{...btn,background:'#334155',color:'#fff'}}>Cancelar renovação</button>}
   {canStart&&!loading&&<button type="button" disabled={busy} onClick={start} style={{...btn,background:'#eab308',color:'#111'}}>Assinar por Pix</button>}
  </section>
  {payment&&<section style={{margin:'22px 0'}}><h2>Próxima cobrança Pix</h2><div style={{background:'#fff',padding:12,borderRadius:12,width:'fit-content'}}>{payment.encodedImage&&<img src={`data:image/png;base64,${payment.encodedImage}`} width="220" height="220" alt="QR Code Pix" style={{display:'block',maxWidth:'100%',height:'auto'}}/>}</div><p>Valor: R$ {Number(payment.value).toFixed(2).replace('.',',')}</p><p>Vencimento: {payment.dueDate?.split('-').reverse().join('/')}</p><textarea readOnly aria-label="Pix Copia e Cola" value={payment.payload||''} style={{width:'100%',boxSizing:'border-box',minHeight:90,padding:10,borderRadius:8,background:'#e2e8f0',color:'#111827'}}/><button type="button" style={{...btn,background:'#eab308',color:'#111'}} onClick={copy}>Copiar Pix</button></section>}
  <section style={{margin:'24px 0'}}><h2>Histórico de cobranças</h2>{history.length?<div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:14}}><thead><tr><th align="left">Vencimento</th><th align="left">Valor</th><th align="left">Situação</th></tr></thead><tbody>{history.map(p=><tr key={p.id}><td style={{padding:'10px 4px'}}>{p.dueDate?.split('-').reverse().join('/')}</td><td>R$ {Number(p.value).toFixed(2).replace('.',',')}</td><td>{p.status}</td></tr>)}</tbody></table></div>:<p>Nenhuma cobrança encontrada.</p>}</section>
  <button type="button" disabled={busy||loading} style={{...btn,background:'#1e293b',color:'#fff'}} onClick={()=>load(true)}>{loading?'Consultando...':'Atualizar situação'}</button>
  {notice&&!error&&<p role="status" style={{color:'#86efac'}}>{notice}</p>}{error&&<p role="alert" style={{color:'#fca5a5'}}>{error}</p>}
  <p style={{fontSize:13,color:'#94a3b8'}}>Ambiente Sandbox: não realize pagamentos reais.</p><Link href="/planos" style={{color:'#93c5fd'}}>Voltar aos planos</Link>
 </main>;
}
export default withAuth(PremiumCheckout);
