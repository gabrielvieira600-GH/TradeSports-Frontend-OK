import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { FiArchive, FiAward, FiBarChart2, FiCopy, FiLock, FiMessageCircle, FiPlus, FiSettings, FiShield, FiUsers } from 'react-icons/fi';
import api from '../lib/api';
import withAuth from './withAuth';

const dinheiro = (v) => `T$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const percentual = (v) => `${Number(v || 0) > 0 ? '+' : ''}${Number(v || 0).toFixed(2)}%`;

export function RankingsPrivadosPage({ embedded = false }) {
  const router = useRouter();
  const [lista, setLista] = useState(null);
  const [detalhe, setDetalhe] = useState(null);
  const [selecionado, setSelecionado] = useState('');
  const [aba, setAba] = useState('ranking');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [criando, setCriando] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [post, setPost] = useState('');
  const [form, setForm] = useState({ nome: '', descricao: '', imagemUrl: '', regras: '', visibilidade: 'convite', criterioClassificacao: 'rentabilidade', maxParticipantes: 50, aprovacaoManual: false, dataInicio: '', dataFim: '' });

  async function carregarLista(escolher = true) {
    const { data } = await api.get('/private-rankings');
    setLista(data);
    if (escolher && !selecionado && data.rankings?.length) setSelecionado(String(data.rankings[0]._id));
    return data;
  }
  async function carregarDetalhe(id = selecionado) {
    if (!id) { setDetalhe(null); return; }
    const { data } = await api.get(`/private-rankings/${id}`); setDetalhe(data);
  }
  useEffect(() => { carregarLista().catch((e) => setErro(e?.response?.data?.erro || 'Não foi possível carregar as competições.')).finally(() => setCarregando(false)); }, []);
  useEffect(() => { if (selecionado) carregarDetalhe(selecionado).catch((e) => setErro(e?.response?.data?.erro || 'Não foi possível abrir a competição.')); }, [selecionado]);
  useEffect(() => { if (router.query.codigo && lista) { setCodigo(String(router.query.codigo)); entrar(String(router.query.codigo)); } }, [router.query.codigo, lista]);

  async function executar(fn) { setErro(''); setSucesso(''); try { await fn(); } catch (e) { setErro(e?.response?.data?.erro || 'Não foi possível concluir a ação.'); } }
  async function criar(e) { e.preventDefault(); await executar(async () => { const { data } = await api.post('/private-rankings', form); setCriando(false); setSucesso('Competição criada. Compartilhe o código ou o link de convite.'); await carregarLista(false); setSelecionado(String(data.ranking._id)); }); }
  async function entrar(valor = codigo) { await executar(async () => { const { data } = await api.post(`/private-rankings/entrar/${String(valor).trim()}`); await carregarLista(false); setSelecionado(String(data.rankingId)); setSucesso(data.status === 'pendente' ? 'Solicitação enviada para aprovação.' : 'Você entrou na competição.'); }); }
  async function publicar(e) { e.preventDefault(); await executar(async () => { await api.post(`/private-rankings/${selecionado}/posts`, { texto: post }); setPost(''); await carregarDetalhe(); }); }
  async function acaoMembro(usuarioId, acao) { await executar(async () => { await api.patch(`/private-rankings/${selecionado}/membros/${usuarioId}`, { acao }); await carregarDetalhe(); setSucesso('Participante atualizado.'); }); }
  async function encerrar() { if (!window.confirm('Encerrar a competição e registrar o campeão atual?')) return; await executar(async () => { await api.post(`/private-rankings/${selecionado}/encerrar`); await carregarDetalhe(); await carregarLista(false); setSucesso('Competição encerrada e troféu concedido.'); }); }
  async function arquivar() { await executar(async () => { await api.post(`/private-rankings/${selecionado}/arquivar`); await carregarDetalhe(); await carregarLista(false); setSucesso('Competição arquivada.'); }); }
  function copiar() { const url = `${window.location.origin}/ranking?aba=privados&codigo=${detalhe.ranking.codigoConvite}`; navigator.clipboard.writeText(url); setSucesso('Link de convite copiado.'); }

  const ranking = detalhe?.ranking;
  const podeCriar = lista?.plano === 'premium';
  const membrosPendentes = useMemo(() => detalhe?.membros?.filter((m) => m.status === 'pendente') || [], [detalhe]);

  const Wrapper = embedded ? EmbeddedPage : Page;
  if (carregando) return <Wrapper><Loading>Carregando suas competições...</Loading></Wrapper>;
  return <Wrapper>
    <Hero><div><Eyebrow><FiAward/> Competições privadas</Eyebrow><h1>Rankings privados completos</h1><p>Crie ligas entre amigos, acompanhe a disputa e construa um histórico de campeões.</p></div><HeroActions><Join><input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Código de convite"/><button onClick={() => entrar()}>Entrar</button></Join><Create onClick={() => podeCriar ? setCriando(true) : router.push('/planos')}><FiPlus/>{podeCriar ? 'Criar competição' : 'Criar com Premium'}</Create></HeroActions></Hero>
    {lista?.plano === 'lite' && <LiteInfo><FiShield/><div><strong>Você pode participar de até duas competições</strong><span>A criação é Premium. Ao atingir o limite Lite, seus rankings existentes permanecem preservados.</span></div></LiteInfo>}
    {erro && <Alert $erro>{erro}</Alert>}{sucesso && <Alert>{sucesso}</Alert>}
    <Layout><Sidebar><SectionTitle>Suas competições</SectionTitle>{!lista?.rankings?.length ? <Empty>Você ainda não participa de uma competição.</Empty> : lista.rankings.map((r) => <LeagueButton key={r._id} $active={selecionado === String(r._id)} onClick={() => setSelecionado(String(r._id))}><Logo>{r.imagemUrl ? <img src={r.imagemUrl} alt=""/> : r.nome.slice(0,1)}</Logo><div><strong>{r.nome}</strong><span>{r.totalParticipantes} participantes · {r.status}</span></div></LeagueButton>)}</Sidebar>
      <Content>{!ranking ? <EmptyLarge><FiAward/><h2>Sua próxima disputa começa aqui</h2><p>Entre com um código de convite ou crie uma competição Premium.</p></EmptyLarge> : <>
        <LeagueHero><Logo $large>{ranking.imagemUrl ? <img src={ranking.imagemUrl} alt=""/> : ranking.nome.slice(0,1)}</Logo><div><Status>{ranking.visibilidade === 'publico' ? 'Pública' : 'Somente por convite'} · {ranking.status}</Status><h2>{ranking.nome}</h2><p>{ranking.descricao || 'Competição privada TradeSports'}</p></div><Invite><span>Código</span><strong>{ranking.codigoConvite}</strong><button onClick={copiar}><FiCopy/> Copiar link</button></Invite></LeagueHero>
        <Tabs>{[['ranking','Ranking',FiBarChart2],['feed','Feed',FiMessageCircle],['estatisticas','Estatísticas',FiUsers],['campeoes','Campeões',FiAward],['gestao','Gestão',FiSettings]].map(([id,label,Icon]) => <Tab key={id} $active={aba===id} onClick={() => setAba(id)}><Icon/>{label}</Tab>)}</Tabs>
        {aba === 'ranking' && <Panel><PanelHead><div><h3>Classificação</h3><p>Critério: {ranking.criterioClassificacao}</p></div><Badge>{detalhe.classificacao.length} participantes</Badge></PanelHead><Table><thead><tr><th>#</th><th>Usuário</th><th>Rentabilidade</th><th>Resultado</th><th>Patrimônio</th></tr></thead><tbody>{detalhe.classificacao.map((x) => <tr key={x.usuarioId}><td><Position $top={x.posicao <= 3}>{x.posicao}</Position></td><td><strong>{x.nomeUsuario || x.nome}</strong><small>{x.papel} · {x.plano}</small></td><td>{percentual(x.rentabilidade)}</td><td>{dinheiro(x.resultado)}</td><td>{dinheiro(x.patrimonio)}</td></tr>)}</tbody></Table></Panel>}
        {aba === 'feed' && <Panel><PanelHead><div><h3>Feed exclusivo</h3><p>Visível somente aos participantes.</p></div></PanelHead>{detalhe.participante ? <><PostForm onSubmit={publicar}><textarea value={post} onChange={(e) => setPost(e.target.value)} maxLength={1500} placeholder="Compartilhe uma atualização com a competição..."/><button>Publicar</button></PostForm>{detalhe.posts.map((p) => <Post key={p._id}><strong>@{p.autorId?.nomeUsuario || p.autorId?.nome}</strong><span>{new Date(p.createdAt).toLocaleString('pt-BR')}</span><p>{p.texto}</p></Post>)}</> : <Locked><FiLock/> Entre na competição para acessar o feed.</Locked>}</Panel>}
        {aba === 'estatisticas' && <Stats>{[['Participantes',detalhe.estatisticas.participantes],['Patrimônio médio',dinheiro(detalhe.estatisticas.patrimonioMedio)],['Rentabilidade média',percentual(detalhe.estatisticas.rentabilidadeMedia)],['Líder',detalhe.estatisticas.lider?.nomeUsuario || '—']].map(([l,v]) => <Stat key={l}><span>{l}</span><strong>{v}</strong></Stat>)}</Stats>}
        {aba === 'campeoes' && <Panel><PanelHead><div><h3>Histórico de campeões</h3><p>Troféus virtuais registrados ao encerramento.</p></div></PanelHead>{!detalhe.historicoCampeoes.length ? <Empty>Nenhuma edição encerrada ainda.</Empty> : detalhe.historicoCampeoes.map((c) => <Champion key={c.rankingId}><FiAward/><div><strong>@{c.campeao?.nomeUsuario || c.campeao?.nome}</strong><span>{c.nome} · {new Date(c.encerradoEm).toLocaleDateString('pt-BR')}</span></div></Champion>)}</Panel>}
        {aba === 'gestao' && <Panel><PanelHead><div><h3>Participantes e permissões</h3><p>Proprietário, administradores, participantes e solicitações.</p></div></PanelHead>{!detalhe.podeGerir ? <Locked><FiLock/> Apenas proprietário e administradores gerenciam participantes.</Locked> : <MemberList>{detalhe.membros.map((m) => <Member key={m._id}><div><strong>@{m.usuarioId?.nomeUsuario || m.usuarioId?.nome}</strong><span>{m.papel} · {m.status}</span></div>{m.papel !== 'proprietario' && <MemberActions>{m.status === 'pendente' && <button onClick={() => acaoMembro(m.usuarioId._id,'aprovar')}>Aprovar</button>}{detalhe.papel === 'proprietario' && m.status === 'aprovado' && <button onClick={() => acaoMembro(m.usuarioId._id,m.papel === 'administrador' ? 'participante' : 'administrador')}>{m.papel === 'administrador' ? 'Remover admin' : 'Tornar admin'}</button>}<button onClick={() => acaoMembro(m.usuarioId._id,'remover')}>Remover</button><button $danger onClick={() => acaoMembro(m.usuarioId._id,'bloquear')}>Bloquear</button></MemberActions>}</Member>)}</MemberList>}<Rules><strong>Regras</strong><p>{ranking.regras || 'Aplicam-se as regras gerais de mercado e o critério indicado na classificação.'}</p></Rules>{detalhe.papel === 'proprietario' && <DangerZone>{ranking.status === 'ativo' && <button onClick={encerrar}><FiAward/> Encerrar e premiar campeão</button>}{ranking.status === 'encerrado' && <button onClick={arquivar}><FiArchive/> Arquivar competição</button>}</DangerZone>}</Panel>}
      </>}</Content></Layout>
    {criando && <Modal onClick={() => setCriando(false)}><ModalCard onClick={(e) => e.stopPropagation()}><h2>Nova competição privada</h2><p>Somente o criador precisa ser Premium.</p><Form onSubmit={criar}><label>Nome<input required maxLength={80} value={form.nome} onChange={(e)=>setForm({...form,nome:e.target.value})}/></label><label>Descrição<textarea maxLength={500} value={form.descricao} onChange={(e)=>setForm({...form,descricao:e.target.value})}/></label><Two><label>Visibilidade<select value={form.visibilidade} onChange={(e)=>setForm({...form,visibilidade:e.target.value})}><option value="convite">Somente convite</option><option value="publico">Pública</option></select></label><label>Critério<select value={form.criterioClassificacao} onChange={(e)=>setForm({...form,criterioClassificacao:e.target.value})}><option value="rentabilidade">Rentabilidade</option><option value="patrimonio">Patrimônio</option><option value="resultado">Resultado</option></select></label></Two><label>Regras<textarea maxLength={3000} value={form.regras} onChange={(e)=>setForm({...form,regras:e.target.value})}/></label><Two><label>Início<input type="date" value={form.dataInicio} onChange={(e)=>setForm({...form,dataInicio:e.target.value})}/></label><label>Fim<input type="date" value={form.dataFim} onChange={(e)=>setForm({...form,dataFim:e.target.value})}/></label></Two><label><input type="checkbox" checked={form.aprovacaoManual} onChange={(e)=>setForm({...form,aprovacaoManual:e.target.checked})}/> Aprovar novos participantes manualmente</label><ModalActions><button type="button" onClick={()=>setCriando(false)}>Cancelar</button><Create type="submit">Criar competição</Create></ModalActions></Form></ModalCard></Modal>}
  </Wrapper>;
}
export default withAuth(RankingsPrivadosPage);

const Page=styled.main`padding:28px;max-width:1400px;margin:auto;color:#e7eef8;@media(max-width:700px){padding:14px}`;
const EmbeddedPage=styled.section`color:#e7eef8;margin-top:18px`;
const Hero=styled.section`background:linear-gradient(135deg,#071426,#0b2037);border:1px solid rgba(250,204,21,.2);border-radius:20px;padding:26px;display:flex;justify-content:space-between;gap:20px;align-items:center;h1{margin:6px 0;color:#fff;font-size:clamp(28px,4vw,42px)}p{margin:0;color:#9fb0c6}@media(max-width:850px){align-items:flex-start;flex-direction:column}`;
const Eyebrow=styled.span`color:#facc15;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.11em;display:flex;gap:8px;align-items:center`;
const HeroActions=styled.div`display:flex;gap:10px;flex-wrap:wrap`;
const Join=styled.div`display:flex;input{background:#0b1a2d;color:#fff;border:1px solid #29435f;padding:11px;border-radius:10px 0 0 10px;width:145px}button{border:0;background:#29435f;color:#fff;font-weight:800;border-radius:0 10px 10px 0;padding:0 14px;cursor:pointer}`;
const Create=styled.button`border:0;background:linear-gradient(135deg,#facc15,#eab308);color:#172033;border-radius:10px;padding:11px 16px;font-weight:900;cursor:pointer;display:flex;gap:7px;align-items:center;justify-content:center`;
const LiteInfo=styled.div`margin:14px 0;display:flex;gap:12px;align-items:center;padding:13px 16px;border-radius:12px;background:#0c1a2c;border:1px solid #263d56;color:#facc15;div{display:flex;flex-direction:column}span{color:#91a3b9;font-size:12px;margin-top:3px}`;
const Alert=styled.div`margin:13px 0;padding:11px 14px;border-radius:10px;background:${p=>p.$erro?'rgba(239,68,68,.1)':'rgba(34,197,94,.1)'};border:1px solid ${p=>p.$erro?'rgba(239,68,68,.3)':'rgba(34,197,94,.3)'};color:${p=>p.$erro?'#fca5a5':'#86efac'}`;
const Layout=styled.div`display:grid;grid-template-columns:280px minmax(0,1fr);gap:16px;margin-top:18px;@media(max-width:900px){grid-template-columns:1fr}`;
const Sidebar=styled.aside`background:#081626;border:1px solid #1b3047;border-radius:16px;padding:14px;height:max-content`;
const SectionTitle=styled.h3`margin:4px 5px 12px;color:#fff;font-size:14px`;
const LeagueButton=styled.button`width:100%;display:flex;gap:10px;text-align:left;align-items:center;border:1px solid ${p=>p.$active?'rgba(250,204,21,.3)':'transparent'};background:${p=>p.$active?'rgba(250,204,21,.08)':'transparent'};padding:10px;border-radius:11px;color:#fff;cursor:pointer;margin-bottom:5px;div{min-width:0}strong,span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}span{font-size:11px;color:#7f91a7;margin-top:3px}`;
const Logo=styled.div`width:${p=>p.$large?'58px':'38px'};height:${p=>p.$large?'58px':'38px'};border-radius:12px;background:#18334e;color:#fde68a;display:grid;place-items:center;font-weight:900;flex:none;overflow:hidden;img{width:100%;height:100%;object-fit:cover}`;
const Content=styled.section`min-width:0`;
const LeagueHero=styled.div`background:#081626;border:1px solid #1b3047;border-radius:16px;padding:18px;display:flex;gap:14px;align-items:center;h2{margin:4px 0;color:#fff}p{margin:0;color:#8da0b7}@media(max-width:650px){align-items:flex-start;flex-wrap:wrap}`;
const Status=styled.span`color:#d6b82d;font-size:11px;font-weight:800;text-transform:uppercase`;
const Invite=styled.div`margin-left:auto;text-align:right;span,strong{display:block}span{font-size:10px;color:#7f91a7;text-transform:uppercase}strong{color:#fde68a;letter-spacing:.12em}button{margin-top:5px;background:transparent;border:0;color:#91a3b9;cursor:pointer}`;
const Tabs=styled.div`display:flex;gap:7px;overflow:auto;margin:14px 0`;
const Tab=styled.button`display:flex;align-items:center;gap:6px;white-space:nowrap;padding:10px 13px;border-radius:9px;border:1px solid ${p=>p.$active?'rgba(250,204,21,.3)':'#20354d'};background:${p=>p.$active?'rgba(250,204,21,.08)':'#0c192b'};color:${p=>p.$active?'#fde68a':'#8da0b7'};cursor:pointer`;
const Panel=styled.section`background:#081626;border:1px solid #1b3047;border-radius:16px;padding:18px;overflow:auto`;
const PanelHead=styled.div`display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;h3{margin:0;color:#fff}p{margin:3px 0 0;color:#778aa1;font-size:12px}`;
const Badge=styled.span`background:#132941;color:#a9bbcf;border-radius:20px;padding:6px 10px;font-size:11px`;
const Table=styled.table`width:100%;border-collapse:collapse;min-width:650px;th{text-align:left;color:#72859b;font-size:11px;text-transform:uppercase;padding:10px}td{padding:12px 10px;border-top:1px solid #162a3f;color:#cbd7e5}td:first-child{width:50px}small{display:block;color:#6f8299;margin-top:2px}`;
const Position=styled.span`display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:${p=>p.$top?'rgba(250,204,21,.12)':'#13283e'};color:${p=>p.$top?'#fde68a':'#9eb0c4'};font-weight:900`;
const PostForm=styled.form`display:flex;gap:9px;margin-bottom:14px;textarea{flex:1;min-height:70px;background:#0d2034;border:1px solid #29435f;color:#fff;border-radius:10px;padding:11px}button{align-self:flex-end;background:#facc15;border:0;border-radius:9px;padding:10px 14px;font-weight:900}`;
const Post=styled.article`padding:13px;border:1px solid #172d44;border-radius:11px;margin-top:9px;background:#0b1a2c;span{color:#657991;font-size:10px;margin-left:8px}p{margin:8px 0 0;color:#c6d3e2;white-space:pre-wrap}`;
const Stats=styled.div`display:grid;grid-template-columns:repeat(4,1fr);gap:12px;@media(max-width:800px){grid-template-columns:1fr 1fr}@media(max-width:450px){grid-template-columns:1fr}`;
const Stat=styled.div`background:#081626;border:1px solid #1b3047;border-radius:14px;padding:18px;span{display:block;color:#7e91a7;font-size:12px}strong{display:block;color:#fff;font-size:21px;margin-top:7px}`;
const Champion=styled.div`display:flex;gap:12px;align-items:center;padding:12px;border-bottom:1px solid #172b40;color:#facc15;div strong,div span{display:block}span{color:#7e91a7;font-size:11px;margin-top:3px}`;
const MemberList=styled.div`display:flex;flex-direction:column;gap:8px`;
const Member=styled.div`display:flex;justify-content:space-between;gap:12px;align-items:center;background:#0b1a2c;border:1px solid #172d44;border-radius:10px;padding:11px;span{display:block;color:#71859b;font-size:11px;margin-top:3px}@media(max-width:650px){align-items:flex-start;flex-direction:column}`;
const MemberActions=styled.div`display:flex;gap:5px;flex-wrap:wrap;button{background:${p=>p.$danger?'rgba(239,68,68,.12)':'#17304a'};border:1px solid #29435f;color:#c8d6e5;border-radius:7px;padding:6px 8px;cursor:pointer;font-size:11px}`;
const Rules=styled.div`margin-top:18px;border-top:1px solid #172b40;padding-top:15px;color:#8fa1b6;p{white-space:pre-wrap}`;
const DangerZone=styled.div`margin-top:15px;button{background:transparent;border:1px solid rgba(250,204,21,.3);color:#fde68a;border-radius:9px;padding:9px 12px;cursor:pointer;display:flex;gap:6px;align-items:center}`;
const Empty=styled.div`color:#6f8299;padding:16px;text-align:center;font-size:12px`;
const EmptyLarge=styled.div`min-height:370px;background:#081626;border:1px solid #1b3047;border-radius:16px;display:grid;place-items:center;align-content:center;text-align:center;color:#7589a0;svg{font-size:42px;color:#d6b82d}h2{color:#fff;margin:12px 0 4px}p{margin:0}`;
const Locked=styled.div`display:flex;gap:8px;align-items:center;justify-content:center;padding:40px;color:#c7b86b`;
const Loading=styled.div`min-height:55vh;display:grid;place-items:center;color:#8da0b7`;
const Modal=styled.div`position:fixed;inset:0;z-index:3000;background:rgba(2,8,23,.78);display:grid;place-items:center;padding:15px`;
const ModalCard=styled.div`width:min(620px,100%);max-height:92vh;overflow:auto;background:#081626;border:1px solid rgba(250,204,21,.22);border-radius:18px;padding:22px;h2{margin:0;color:#fff}p{color:#8295ab}`;
const Form=styled.form`display:flex;flex-direction:column;gap:12px;label{color:#c5d2e1;font-size:12px;font-weight:700}input:not([type=checkbox]),textarea,select{display:block;width:100%;box-sizing:border-box;margin-top:6px;background:#0d2034;border:1px solid #29435f;color:#fff;border-radius:9px;padding:10px}textarea{min-height:70px}`;
const Two=styled.div`display:grid;grid-template-columns:1fr 1fr;gap:10px;@media(max-width:540px){grid-template-columns:1fr}`;
const ModalActions=styled.div`display:flex;justify-content:flex-end;gap:8px;margin-top:5px;button:not(${Create}){background:transparent;border:1px solid #29435f;color:#a9b9ca;border-radius:9px;padding:10px 14px}`;
