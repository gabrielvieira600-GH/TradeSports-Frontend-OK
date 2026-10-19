import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api';
import withAuth from '../../components/withAuth';

function PremiumCheckout(){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[data,setData]=useState(null),[status,setStatus]=useState(null);
 async function load(){try{const r=await api.get('/asaas/premium/status');setStatus(r.data.subscription);const p=await api.get('/asaas/premium/payment');setData(p.data.payment);}catch(e){if(e.response?.status!==404)setError(e.response?.data?.erro||'Não foi possível consultar a cobrança.');}}
 useEffect(()=>{load();},[]);
 async function create(){setBusy(true);setError('');try{await api.post('/asaas/premium/checkout',{billingType:'PIX'});await load();}catch(e){setError(e.response?.data?.erro||'Não foi possível iniciar a assinatura.');}finally{setBusy(false);}}
 return <main style={{maxWidth:650,margin:'40px auto',padding:24,color:'#f8fafc',background:'#101c32',borderRadius:20}}>
  <h1>TradeSports Premium</h1><p style={{fontSize:30,fontWeight:800}}>R$ 9,90 <small style={{fontSize:16}}>/ mês</small></p>
  <p>Assinatura mensal com cobrança Pix. O pagamento não é debitado automaticamente: você receberá uma nova cobrança a cada mês.</p>
  <p>Seu plano Premium é liberado após a confirmação do pagamento pelo Asaas.</p>
  {status?.status==='ACTIVE'&&<p>Assinatura ativa. Acesse <Link href="/planos">seus planos</Link>.</p>}
  {!data&&status?.status!=='ACTIVE'&&<button onClick={create} disabled={busy} style={{padding:14,borderRadius:10,background:'#eab308',color:'#111',fontWeight:800}}>{busy?'Aguarde...':'Gerar cobrança Pix'}</button>}
  {data&&<section><h2>Pagamento Pix</h2>{data.encodedImage&&<img alt="QR Code Pix" width="240" height="240" src={`data:image/png;base64,${data.encodedImage}`}/>}<p>Vencimento: {data.dueDate}</p><textarea readOnly value={data.payload||''} style={{width:'100%',minHeight:95}}/><button onClick={()=>navigator.clipboard.writeText(data.payload||'')}>Copiar código Pix</button></section>}
  <p><button onClick={load} disabled={busy}>Atualizar situação</button></p>
  {error&&<p role="alert" style={{color:'#fca5a5'}}>{error}</p>}
  <Link href="/planos">Voltar aos planos</Link>
 </main>;
}
export default withAuth(PremiumCheckout);
