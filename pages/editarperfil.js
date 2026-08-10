import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useRouter } from 'next/router';
import {
  FiArrowLeft,
  FiCamera,
  FiCheckCircle,
  FiImage,
  FiLock,
  FiMail,
  FiSave,
  FiShield,
  FiTrash2,
  FiUser,
  FiXCircle,
} from 'react-icons/fi';
import UserAvatar from '../components/UserAvatar';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function EditarPerfil() {
  const [usuario, setUsuario] = useState(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [foto, setFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState('');
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const inputFotoRef = useRef(null);
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    try {
      const usuarioLocal = localStorage.getItem('usuario');
      if (usuarioLocal && usuarioLocal !== 'undefined') {
        const u = JSON.parse(usuarioLocal);
        setUsuario(u);
        setNome(u.nome || '');
        setEmail(u.email || '');
      }
    } catch {
      setFeedback({ tipo: 'erro', texto: 'Não foi possível carregar os dados do perfil.' });
    }
  }, []);

  useEffect(() => () => {
    if (previewFoto) URL.revokeObjectURL(previewFoto);
  }, [previewFoto]);

  const exibirFeedback = (tipo, texto) => setFeedback({ tipo, texto });

  const selecionarFoto = (event) => {
    const arquivo = event.target.files?.[0] || null;
    setFeedback(null);
    if (!arquivo) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(arquivo.type)) {
      exibirFeedback('erro', 'Envie uma imagem JPG, PNG ou WebP.');
      event.target.value = '';
      return;
    }
    if (arquivo.size > 5 * 1024 * 1024) {
      exibirFeedback('erro', 'A foto deve ter no máximo 5 MB.');
      event.target.value = '';
      return;
    }
    if (previewFoto) URL.revokeObjectURL(previewFoto);
    setFoto(arquivo);
    setPreviewFoto(URL.createObjectURL(arquivo));
  };

  const atualizarUsuarioLocal = (atualizacoes) => {
    const atualizado = { ...usuario, ...atualizacoes };
    setUsuario(atualizado);
    localStorage.setItem('usuario', JSON.stringify(atualizado));
    window.dispatchEvent(new Event('force-topbar-update'));
  };

  const limparSelecaoFoto = () => {
    if (previewFoto) URL.revokeObjectURL(previewFoto);
    setFoto(null);
    setPreviewFoto('');
    if (inputFotoRef.current) inputFotoRef.current.value = '';
  };

  const enviarFoto = async () => {
    if (!foto) return;
    try {
      setEnviandoFoto(true);
      setFeedback(null);
      const dados = new FormData();
      dados.append('foto', foto);
      const { data } = await axios.put(`${API}/usuario/foto-perfil`, dados, {
        headers: { authorization: `Bearer ${token}` },
      });
      atualizarUsuarioLocal({ fotoPerfilUrl: data.fotoPerfilUrl });
      limparSelecaoFoto();
      exibirFeedback('sucesso', 'Foto de perfil atualizada com sucesso!');
    } catch (err) {
      exibirFeedback('erro', err?.response?.data?.erro || 'Erro ao atualizar a foto de perfil.');
    } finally {
      setEnviandoFoto(false);
    }
  };

  const removerFoto = async () => {
    try {
      setEnviandoFoto(true);
      setFeedback(null);
      await axios.delete(`${API}/usuario/foto-perfil`, {
        headers: { authorization: `Bearer ${token}` },
      });
      atualizarUsuarioLocal({ fotoPerfilUrl: '' });
      limparSelecaoFoto();
      exibirFeedback('sucesso', 'Foto de perfil removida.');
    } catch (err) {
      exibirFeedback('erro', err?.response?.data?.erro || 'Erro ao remover a foto de perfil.');
    } finally {
      setEnviandoFoto(false);
    }
  };

  const atualizarPerfil = async (event) => {
    event.preventDefault();
    setFeedback(null);
    try {
      setSalvandoPerfil(true);
      const { data } = await axios.put(`${API}/usuario/perfil`, { nome, email }, {
        headers: { authorization: `Bearer ${token}` },
      });
      const dadosAtualizados = data?.usuario || { nome, email };
      atualizarUsuarioLocal(dadosAtualizados);
      exibirFeedback('sucesso', 'Dados pessoais atualizados com sucesso!');
    } catch (err) {
      exibirFeedback('erro', err?.response?.data?.erro || 'Erro ao atualizar o perfil.');
    } finally {
      setSalvandoPerfil(false);
    }
  };

  const trocarSenha = async (event) => {
    event.preventDefault();
    setFeedback(null);
    try {
      setSalvandoSenha(true);
      await axios.post(`${API}/usuario/trocar-senha`, { senhaAtual, novaSenha }, {
        headers: { authorization: `Bearer ${token}` },
      });
      setSenhaAtual('');
      setNovaSenha('');
      exibirFeedback('sucesso', 'Senha atualizada com sucesso!');
    } catch (err) {
      exibirFeedback('erro', err?.response?.data?.erro || 'Erro ao trocar a senha.');
    } finally {
      setSalvandoSenha(false);
    }
  };

  if (!usuario) return <Loading aria-label="Carregando perfil" />;

  return (
    <Page>
      <GlowTop />
      <Content>
        <BackButton type="button" onClick={() => router.back()}>
          <FiArrowLeft /> Voltar
        </BackButton>

        <Header>
          <HeaderCopy>
            <Eyebrow>CONFIGURAÇÕES DA CONTA</Eyebrow>
            <h1>Editar perfil</h1>
            <p>Personalize sua presença na TradeSports e mantenha seus dados protegidos.</p>
          </HeaderCopy>
          <SecurityBadge><FiShield /><span>Conta protegida<small>Ambiente seguro</small></span></SecurityBadge>
        </Header>

        {feedback && (
          <Feedback $tipo={feedback.tipo} role="status">
            {feedback.tipo === 'sucesso' ? <FiCheckCircle /> : <FiXCircle />}
            <span>{feedback.texto}</span>
            <button type="button" onClick={() => setFeedback(null)} aria-label="Fechar mensagem">×</button>
          </Feedback>
        )}

        <ProfileCard>
          <AvatarColumn>
            <AvatarFrame>
              <UserAvatar usuario={usuario} src={previewFoto || usuario.fotoPerfilUrl} size={132} />
              <CameraButton type="button" onClick={() => inputFotoRef.current?.click()} aria-label="Escolher foto">
                <FiCamera />
              </CameraButton>
            </AvatarFrame>
          </AvatarColumn>

          <PhotoCopy>
            <CardKicker><FiImage /> FOTO DE PERFIL</CardKicker>
            <h2>{foto ? 'Sua nova foto está pronta' : 'Uma imagem que representa você'}</h2>
            <p>{foto ? `Arquivo selecionado: ${foto.name}` : 'Sua foto aparecerá no perfil, rankings, feed e em todas as interações da plataforma.'}</p>
            <PhotoActions>
              <ChooseButton type="button" onClick={() => inputFotoRef.current?.click()}>
                <FiCamera /> {usuario.fotoPerfilUrl || previewFoto ? 'Trocar foto' : 'Escolher foto'}
              </ChooseButton>
              {foto && (
                <PrimaryButton type="button" onClick={enviarFoto} disabled={enviandoFoto}>
                  <FiSave /> {enviandoFoto ? 'Enviando...' : 'Salvar nova foto'}
                </PrimaryButton>
              )}
              {!foto && usuario.fotoPerfilUrl && (
                <DangerButton type="button" onClick={removerFoto} disabled={enviandoFoto}>
                  <FiTrash2 /> Remover
                </DangerButton>
              )}
              {foto && <TextButton type="button" onClick={limparSelecaoFoto}>Cancelar</TextButton>}
            </PhotoActions>
            <input ref={inputFotoRef} id="foto-perfil" type="file" accept="image/jpeg,image/png,image/webp" onChange={selecionarFoto} hidden />
            <FileHint>JPG, PNG ou WebP • Máximo de 5 MB • Corte automático em formato quadrado</FileHint>
          </PhotoCopy>
        </ProfileCard>

        <FormGrid>
          <FormCard onSubmit={atualizarPerfil}>
            <CardHeader>
              <IconBox><FiUser /></IconBox>
              <div><h2>Dados pessoais</h2><p>Informações usadas para identificar sua conta.</p></div>
            </CardHeader>
            <Fields>
              <Field>
                <label htmlFor="nome">Nome completo</label>
                <InputWrap><FiUser /><input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" required /></InputWrap>
              </Field>
              <Field>
                <label htmlFor="email">E-mail</label>
                <InputWrap><FiMail /><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" required /></InputWrap>
              </Field>
            </Fields>
            <CardFooter><PrimaryButton type="submit" disabled={salvandoPerfil}><FiSave /> {salvandoPerfil ? 'Salvando...' : 'Salvar alterações'}</PrimaryButton></CardFooter>
          </FormCard>

          <FormCard onSubmit={trocarSenha}>
            <CardHeader>
              <IconBox $green><FiLock /></IconBox>
              <div><h2>Segurança</h2><p>Atualize sua senha de acesso à plataforma.</p></div>
            </CardHeader>
            <Fields>
              <Field>
                <label htmlFor="senha-atual">Senha atual</label>
                <InputWrap><FiLock /><input id="senha-atual" type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} placeholder="Digite sua senha atual" required autoComplete="current-password" /></InputWrap>
              </Field>
              <Field>
                <label htmlFor="nova-senha">Nova senha</label>
                <InputWrap><FiShield /><input id="nova-senha" type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="Digite a nova senha" required autoComplete="new-password" /></InputWrap>
              </Field>
            </Fields>
            <CardFooter><PrimaryButton type="submit" disabled={salvandoSenha}><FiLock /> {salvandoSenha ? 'Atualizando...' : 'Atualizar senha'}</PrimaryButton></CardFooter>
          </FormCard>
        </FormGrid>
      </Content>
    </Page>
  );
}

const Page = styled.main`
  position: relative; min-height: calc(100vh - 64px); overflow: hidden;
  color: #f8fafc; background: radial-gradient(circle at 18% 0%, rgba(37,99,235,.13), transparent 34%), #07101f;
`;
const GlowTop = styled.div`position:absolute;top:-220px;right:-140px;width:520px;height:520px;border-radius:50%;background:rgba(16,185,129,.07);filter:blur(40px);pointer-events:none;`;
const Content = styled.div`position:relative;width:min(1160px,calc(100% - 40px));margin:0 auto;padding:38px 0 72px;@media(max-width:640px){width:min(100% - 28px,560px);padding:24px 0 48px;}`;
const BackButton = styled.button`display:inline-flex;align-items:center;gap:8px;border:0;background:transparent;color:#94a3b8;font-weight:700;font-size:.9rem;padding:0;margin:0 0 24px;cursor:pointer;transition:.2s;&:hover{color:#fff;transform:translateX(-2px);}`;
const Header = styled.header`display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:30px;@media(max-width:700px){align-items:flex-start;flex-direction:column;margin-bottom:24px;}`;
const HeaderCopy = styled.div`h1{font-size:clamp(2rem,4vw,3.15rem);line-height:1.04;letter-spacing:-.045em;margin:7px 0 12px;}p{max-width:650px;margin:0;color:#94a3b8;font-size:1.03rem;line-height:1.6;}`;
const Eyebrow = styled.span`font-size:.72rem;font-weight:900;letter-spacing:.18em;color:#34d399;`;
const SecurityBadge = styled.div`display:flex;align-items:center;gap:11px;padding:12px 16px;border:1px solid rgba(52,211,153,.2);border-radius:14px;background:rgba(15,23,42,.65);color:#34d399;white-space:nowrap;svg{font-size:1.25rem;}span{display:grid;color:#e2e8f0;font-weight:800;font-size:.82rem;}small{color:#64748b;font-size:.69rem;margin-top:2px;}@media(max-width:700px){display:none;}`;
const Feedback = styled.div`display:flex;align-items:center;gap:11px;margin-bottom:20px;padding:14px 16px;border-radius:13px;border:1px solid ${({$tipo})=>$tipo==='sucesso'?'rgba(52,211,153,.3)':'rgba(248,113,113,.3)'};background:${({$tipo})=>$tipo==='sucesso'?'rgba(16,185,129,.1)':'rgba(239,68,68,.1)'};color:${({$tipo})=>$tipo==='sucesso'?'#a7f3d0':'#fecaca'};font-weight:700;font-size:.9rem;svg{font-size:1.15rem;flex:none;}span{flex:1;}button{border:0;background:transparent;color:inherit;font-size:1.25rem;cursor:pointer;}`;
const ProfileCard = styled.section`display:grid;grid-template-columns:180px 1fr;align-items:center;gap:20px;padding:30px;margin-bottom:22px;border:1px solid rgba(96,165,250,.17);border-radius:22px;background:linear-gradient(125deg,rgba(30,41,59,.94),rgba(15,23,42,.88));box-shadow:0 24px 65px rgba(0,0,0,.22);@media(max-width:700px){grid-template-columns:1fr;text-align:center;padding:26px 20px;}`;
const AvatarColumn = styled.div`display:flex;justify-content:center;`;
const AvatarFrame = styled.div`position:relative;padding:6px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#22c55e);box-shadow:0 0 0 6px rgba(59,130,246,.08),0 18px 42px rgba(0,0,0,.28);>div{border:4px solid #111c2e;}`;
const CameraButton = styled.button`position:absolute;right:3px;bottom:7px;width:38px;height:38px;display:grid;place-items:center;border:3px solid #111c2e;border-radius:50%;background:#2563eb;color:#fff;cursor:pointer;font-size:1rem;transition:.2s;&:hover{background:#3b82f6;transform:scale(1.06);}`;
const PhotoCopy = styled.div`h2{font-size:1.45rem;margin:8px 0 7px;letter-spacing:-.02em;}p{color:#94a3b8;margin:0;line-height:1.55;}@media(max-width:700px){display:flex;flex-direction:column;align-items:center;}`;
const CardKicker = styled.span`display:flex;align-items:center;gap:7px;color:#60a5fa;font-size:.7rem;font-weight:900;letter-spacing:.14em;@media(max-width:700px){justify-content:center;margin-top:7px;}`;
const PhotoActions = styled.div`display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:18px;@media(max-width:700px){justify-content:center;width:100%;button{flex:1 1 150px;justify-content:center;}}`;
const ButtonBase = styled.button`min-height:43px;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:0 17px;border-radius:11px;font-size:.87rem;font-weight:800;cursor:pointer;transition:.2s;border:0;&:disabled{opacity:.55;cursor:not-allowed;transform:none!important;}`;
const PrimaryButton = styled(ButtonBase)`background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;box-shadow:0 8px 20px rgba(37,99,235,.2);&:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.09);}`;
const ChooseButton = styled(ButtonBase)`background:#f8fafc;color:#0f172a;&:hover{background:#e2e8f0;transform:translateY(-1px);}`;
const DangerButton = styled(ButtonBase)`border:1px solid rgba(248,113,113,.3);background:rgba(239,68,68,.07);color:#fca5a5;&:hover:not(:disabled){background:rgba(239,68,68,.15);}`;
const TextButton = styled(ButtonBase)`background:transparent;color:#94a3b8;padding:0 8px;&:hover{color:#fff;}`;
const FileHint = styled.small`display:block;margin-top:13px;color:#64748b;font-size:.72rem;line-height:1.5;`;
const FormGrid = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:22px;@media(max-width:880px){grid-template-columns:1fr;}`;
const FormCard = styled.form`display:flex;flex-direction:column;min-width:0;border:1px solid rgba(148,163,184,.12);border-radius:20px;background:rgba(15,23,42,.84);box-shadow:0 18px 50px rgba(0,0,0,.16);overflow:hidden;`;
const CardHeader = styled.div`display:flex;align-items:center;gap:14px;padding:22px 24px;border-bottom:1px solid rgba(148,163,184,.09);h2{font-size:1.06rem;margin:0 0 4px;}p{color:#64748b;font-size:.77rem;margin:0;line-height:1.45;}@media(max-width:480px){padding:20px;}`;
const IconBox = styled.div`width:42px;height:42px;flex:none;display:grid;place-items:center;border-radius:12px;background:${({$green})=>$green?'rgba(16,185,129,.12)':'rgba(59,130,246,.13)'};color:${({$green})=>$green?'#34d399':'#60a5fa'};font-size:1.13rem;`;
const Fields = styled.div`display:grid;gap:18px;padding:24px;@media(max-width:480px){padding:20px;}`;
const Field = styled.div`label{display:block;margin-bottom:8px;color:#cbd5e1;font-size:.78rem;font-weight:800;}`;
const InputWrap = styled.div`height:48px;display:flex;align-items:center;gap:11px;padding:0 14px;border:1px solid rgba(148,163,184,.15);border-radius:11px;background:#091321;color:#64748b;transition:.2s;&:focus-within{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.1);color:#60a5fa;}input{width:100%;min-width:0;border:0;outline:0;background:transparent;color:#f8fafc;font-size:.9rem;&::placeholder{color:#475569;}}`;
const CardFooter = styled.div`display:flex;justify-content:flex-end;margin-top:auto;padding:0 24px 24px;@media(max-width:480px){padding:0 20px 20px;button{width:100%;}}`;
const Loading = styled.div`width:34px;height:34px;margin:120px auto;border:3px solid rgba(96,165,250,.2);border-top-color:#3b82f6;border-radius:50%;animation:girar .8s linear infinite;@keyframes girar{to{transform:rotate(360deg)}}`;
