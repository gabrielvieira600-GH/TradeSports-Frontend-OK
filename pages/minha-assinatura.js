import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import api from '../lib/api';
import withAuth from '../components/withAuth';

const panel={padding:22,background:'#14223a',border:'1px solid #304360',borderRadius:16};
const action={background:'#e9b60b',color:'#0a1528',border:0,borderRadius:10,padding:'12px 18px',fontWeight:800,cursor:'pointer'};
const date=d=>d?new Date(d).toLocaleDateString('pt-BR'):'—';
const remaining=d=>{
 if(!d)return null;
 const ms=new Date(d).getTime()-Date.now();
 if(!Number.isFinite(ms)||ms<=0)return 'Período encerrado';
 const days=Math.ceil(ms/86400000);
 return days>=30?`${Math.floor(days/30)} mês(es) e ${days%30} dia(s) restantes`:`${days} dia(s) restantes`;
};
function MinhaAssinatura(){
 const [billing,setBilling]=useState(null),[sub,setSub]=useState(null),[plan,setPlan]=useState(null);
 const [cpf,setCpf]=useState(''),[password,setPassword]=useState(''),[editing,setEditing]=useState(false);
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const load=useCallback(async()=>{
  setLoading(true);setError('');
  const results=await Promise.allSettled([api.get('/usuario/dados-faturamento'),api.get('/asaas/premium/status'),api.get('/usuario/plano')]);
  if(results[0].status==='fulfilled')setBilling(results[0].value.data);
  else setError('Não foi possível consultar o CPF cadastrado.');
  if(results[1].status==='fulfilled')setSub(results[1].value.data.subscription||null);
  else setError('Não foi possível consultar a assinatura.');
  if(results[2].status==='fulfilled')setPlan(results[2].value.data);
  setLoading(false);
 },[]);
 useEffect(()=>{load();},[load]);
 async function saveCpf(e){
  e.preventDefault();setBusy(true);setError('');setNotice('');
  try{
   const {data}=await api.put('/usuario/dados-faturamento',{cpf,senhaAtual:password});
   setBilling({cpfMascarado:data.cpfMascarado,cpfCadastrado:true,cpfValido:true});
   setCpf('');setPassword('');setEditing(false);setNotice('CPF atualizado com sucesso.');
  }catch(e){setError(e.response?.data?.erro||'Não foi possível atualizar o CPF.');}
  finally{setBusy(false);}
 }
 async function cancel(){
  if(!window.confirm('Deseja cancelar as futuras renovações? O período já pago será preservado.'))return;
  setBusy(true);setError('');setNotice('');
  try{await api.post('/asaas/premium/cancel');await load();setNotice('Renovações futuras canceladas.');}
  catch(e){setError(e.response?.data?.erro||'Não foi possível cancelar.');}
  finally{setBusy(false);}
 }
 const active=Boolean(sub?.active||(!sub&&plan?.plano==='premium'&&plan?.premiumAtivo));
 const until=sub?.paidUntil||plan?.premiumFim||null;
 const canContract=!sub||(['CANCELLED','EXPIRED','REVOKED'].includes(sub.status)&&!sub.active);
 return <main style={{maxWidth:930,margin:'28px auto',padding:'0 18px 60px',color:'#f8fafc'}}>
  <Link href="/editarperfil" style={{color:'#9dc5f5'}}>← Voltar ao perfil</Link>
  <h1 style={{margin:'20px 0 6px',fontSize:'clamp(25px,4vw,34px)'}}>Dados de faturamento e meu plano</h1>
  <p style={{color:'#9fb1c9',marginBottom:24}}>Gerencie seu CPF e sua assinatura TradeSports Premium.</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,350px),1fr))',gap:18}}>
   <section style={panel}>
    <h2 style={{marginTop:0}}>Dados de faturamento</h2>
    <p><strong>CPF:</strong> {loading?'Consultando...':billing?.cpfMascarado||'Não cadastrado'}</p>
    {billing&&!billing.cpfValido&&<p style={{color:'#fbbf24'}}>CPF ausente ou inválido. Corrija para contratar o Premium.</p>}
    {!editing?<button type="button" style={action} onClick={()=>setEditing(true)}>Cadastrar ou corrigir CPF</button>:
    <form onSubmit={saveCpf} autoComplete="off">
     <label htmlFor="billing-cpf" style={{display:'block',marginBottom:7}}>Novo CPF</label>
     <input id="billing-cpf" inputMode="numeric" autoComplete="off" value={cpf} onChange={e=>setCpf(e.target.value)} maxLength={14} placeholder="000.000.000-00" required style={{width:'100%',padding:12,boxSizing:'border-box',borderRadius:8,marginBottom:12}}/>
     <label htmlFor="billing-password" style={{display:'block',marginBottom:7}}>Confirme sua senha atual</label>
     <input id="billing-password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required style={{width:'100%',padding:12,boxSizing:'border-box',borderRadius:8,marginBottom:12}}/>
     <div style={{display:'flex',gap:10,flexWrap:'wrap'}}><button type="submit" disabled={busy} style={action}>{busy?'Salvando...':'Salvar CPF'}</button><button type="button" onClick={()=>{setEditing(false);setCpf('');setPassword('');}} style={{...action,background:'#304360',color:'#fff'}}>Cancelar</button></div>
     <p style={{color:'#9fb1c9',fontSize:12}}>CPF protegido e parcialmente oculto. Para alterar dados já associados ao Asaas, contate o suporte.</p>
    </form>}
   </section>
   <section style={panel}>
    <h2 style={{marginTop:0}}>Administração do plano</h2>
    <p><strong>Plano:</strong> {active?'Premium':'Lite'}{sub?.status?` · ${sub.status}`:''}</p>
    {until&&<><p><strong>Benefícios até:</strong> {date(until)}</p><p style={{color:'#86efac',fontWeight:800}}>{remaining(until)}</p></>}
    {sub?.cancelledAt&&<p style={{color:'#fcd34d'}}>Renovação cancelada em {date(sub.cancelledAt)}. O período já pago permanece válido até seu vencimento.</p>}
    {sub&&!sub.cancelledAt&&['ACTIVE','PENDING'].includes(sub.status)&&<button type="button" disabled={busy} onClick={cancel} style={{...action,background:'#b91c1c',color:'#fff'}}>Cancelar renovação Premium</button>}
    {canContract&&<p><Link href="/checkout/premium" style={{...action,display:'inline-block',textDecoration:'none'}}>{sub?.cancelledAt?'Recontratar Premium':'Contratar Premium'}</Link></p>}
    {sub?.status==='PENDING'&&<p style={{color:'#fcd34d'}}>Existe uma assinatura aguardando pagamento. <Link href="/checkout/premium" style={{color:'#93c5fd'}}>Ver cobrança</Link></p>}
    {active&&sub?.cancelledAt&&<p style={{fontSize:13,color:'#9fb1c9'}}>Você poderá recontratar após o término do período vigente, evitando cobranças sobrepostas.</p>}
    <button type="button" disabled={loading||busy} onClick={load} style={{...action,background:'#304360',color:'#fff',marginTop:12}}>Atualizar situação</button>
   </section>
  </div>
  {error&&<p role="alert" style={{color:'#fca5a5'}}>{error}</p>}
  {notice&&<p role="status" style={{color:'#86efac'}}>{notice}</p>}
  <p style={{fontSize:12,color:'#9fb1c9',marginTop:18}}>Pagamentos Premium em ambiente Sandbox. Nenhuma operação modifica seu saldo virtual T$.</p>
 </main>;
}
export default withAuth(MinhaAssinatura);
