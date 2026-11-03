const fs=require('fs'),p='pages/editarperfil.js';if(!fs.existsSync(p))throw Error('Execute na raiz do frontend');let s=fs.readFileSync(p,'utf8');const original=s;
function sub(a,b){if(!s.includes(a))throw Error('Âncora não encontrada: '+a.slice(0,60));s=s.replace(a,b)}
sub("  const [pushBusy, setPushBusy] = useState(false);",`  const [pushBusy, setPushBusy] = useState(false);
  const [exclusaoAberta,setExclusaoAberta]=useState(false);
  const [senhaExclusao,setSenhaExclusao]=useState('');
  const [fraseExclusao,setFraseExclusao]=useState('');
  const [excluindo,setExcluindo]=useState(false);`);
sub('  if (!usuario) return <Loading aria-label="Carregando perfil" />;',`  const excluirConta=async()=>{
    setExcluindo(true);setFeedback(null);
    try{
      await axios.delete(\`\${API}/usuario/conta\`,{headers:{authorization:\`Bearer \${token}\`},data:{senha:senhaExclusao,confirmacao:fraseExclusao}});
      localStorage.removeItem('token');localStorage.removeItem('usuario');
      window.dispatchEvent(new Event('force-topbar-update'));
      router.replace('/login');
    }catch(e){exibirFeedback('erro',e?.response?.data?.erro||'Não foi possível excluir a conta.');setExclusaoAberta(false)}
    finally{setExcluindo(false)}
  };
  if (!usuario) return <Loading aria-label="Carregando perfil" />;`);
sub('        </NotificationCard>\n      </Content>',`        </NotificationCard>
        <section style={{marginTop:24,padding:24,border:'1px solid rgba(248,113,113,.35)',borderRadius:20,background:'rgba(127,29,29,.08)'}}>
          <h2>Excluir minha conta</h2>
          <p style={{color:'#cbd5e1',lineHeight:1.6}}>Exclua seu perfil e encerre seu acesso à TradeSports. Registros necessários para auditoria e obrigações legais poderão ser conservados. A exclusão não cancela assinaturas nem ordens automaticamente.</p>
          {!exclusaoAberta?<DangerButton type="button" onClick={()=>setExclusaoAberta(true)}><FiTrash2/> Excluir conta</DangerButton>:(
            <div style={{display:'grid',gap:12,maxWidth:440}}>
              <p style={{color:'#fca5a5'}}>Ação irreversível. Cancele ordens e resolva sua assinatura antes de prosseguir.</p>
              <label htmlFor="senha-exclusao">Senha atual</label>
              <input id="senha-exclusao" type="password" value={senhaExclusao} onChange={e=>setSenhaExclusao(e.target.value)} style={{padding:12,background:'#091321',color:'white',border:'1px solid #475569',borderRadius:8}}/>
              <label htmlFor="frase-exclusao">Digite EXCLUIR MINHA CONTA</label>
              <input id="frase-exclusao" value={fraseExclusao} onChange={e=>setFraseExclusao(e.target.value)} style={{padding:12,background:'#091321',color:'white',border:'1px solid #475569',borderRadius:8}}/>
              <div style={{display:'flex',gap:12}}>
                <DangerButton type="button" disabled={excluindo||!senhaExclusao||fraseExclusao!=='EXCLUIR MINHA CONTA'} onClick={excluirConta}>{excluindo?'Excluindo...':'Confirmar exclusão'}</DangerButton>
                <TextButton type="button" onClick={()=>setExclusaoAberta(false)}>Cancelar</TextButton>
              </div>
            </div>
          )}
        </section>
      </Content>`);
if(s===original)throw Error('Sem alterações');fs.copyFileSync(p,p+'.bak-exclusao');fs.writeFileSync(p,s);console.log('Editar perfil atualizado');
