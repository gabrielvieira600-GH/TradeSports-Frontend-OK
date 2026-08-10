import { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useRouter } from 'next/router';
import UserAvatar from '../components/UserAvatar';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function EditarPerfil() {
  const [usuario, setUsuario] = useState(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [foto, setFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState('');
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    const usuarioLocal = localStorage.getItem('usuario');
    if (usuarioLocal && usuarioLocal !== 'undefined') {
      const u = JSON.parse(usuarioLocal);
      setUsuario(u);
      setNome(u.nome || '');
      setEmail(u.email || '');
    }
  }, []);

  useEffect(() => () => {
    if (previewFoto) URL.revokeObjectURL(previewFoto);
  }, [previewFoto]);

  const selecionarFoto = (event) => {
    const arquivo = event.target.files?.[0] || null;
    setMensagem('');
    if (!arquivo) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(arquivo.type)) {
      setMensagem('Envie uma imagem JPG, PNG ou WebP.');
      return;
    }
    if (arquivo.size > 5 * 1024 * 1024) {
      setMensagem('A foto deve ter no máximo 5 MB.');
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

  const enviarFoto = async () => {
    if (!foto) return;
    try {
      setEnviandoFoto(true);
      setMensagem('');
      const dados = new FormData();
      dados.append('foto', foto);
      const { data } = await axios.put(`${API}/usuario/foto-perfil`, dados, {
        headers: { authorization: `Bearer ${token}` },
      });
      atualizarUsuarioLocal({ fotoPerfilUrl: data.fotoPerfilUrl });
      setFoto(null);
      setPreviewFoto('');
      setMensagem('Foto de perfil atualizada com sucesso!');
    } catch (err) {
      setMensagem(err?.response?.data?.erro || 'Erro ao atualizar a foto de perfil.');
    } finally {
      setEnviandoFoto(false);
    }
  };

  const removerFoto = async () => {
    try {
      setEnviandoFoto(true);
      setMensagem('');
      await axios.delete(`${API}/usuario/foto-perfil`, {
        headers: { authorization: `Bearer ${token}` },
      });
      atualizarUsuarioLocal({ fotoPerfilUrl: '' });
      setFoto(null);
      setPreviewFoto('');
      setMensagem('Foto de perfil removida.');
    } catch (err) {
      setMensagem(err?.response?.data?.erro || 'Erro ao remover a foto de perfil.');
    } finally {
      setEnviandoFoto(false);
    }
  };

  const atualizarPerfil = async (e) => {
    e.preventDefault();
    setMensagem('');
    try {
      const res = await axios.put(`${API}/usuario/perfil`, {
        nome,
        email
      }, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
      setMensagem('Perfil atualizado com sucesso!');
    } catch (err) {
      setMensagem('Erro ao atualizar perfil.');
    }
  };

  const trocarSenha = async (e) => {
    e.preventDefault();
    setMensagem('');
    try {
      await axios.post(`${API}/usuario/trocar-senha`, {
        senhaAtual,
        novaSenha
      }, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      setMensagem('Senha atualizada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
    } catch (err) {
      setMensagem('Erro ao trocar senha.');
    }
  };

  if (!usuario) return null;
  return (
    <Container>
      <h1>Editar Perfil</h1>

      {mensagem && <Mensagem>{mensagem}</Mensagem>}

      <Form as="section">
        <h2>Foto de perfil</h2>
        <FotoArea>
          <UserAvatar usuario={usuario} src={previewFoto || usuario.fotoPerfilUrl} size={112} />
          <FotoControles>
            <label htmlFor="foto-perfil">Escolher foto</label>
            <input id="foto-perfil" type="file" accept="image/jpeg,image/png,image/webp" onChange={selecionarFoto} />
            <small>JPG, PNG ou WebP. Tamanho máximo: 5 MB.</small>
            <BotoesFoto>
              <Botao type="button" onClick={enviarFoto} disabled={!foto || enviandoFoto}>
                {enviandoFoto ? 'Enviando...' : 'Salvar foto'}
              </Botao>
              {usuario.fotoPerfilUrl && (
                <BotaoRemover type="button" onClick={removerFoto} disabled={enviandoFoto}>
                  Remover foto
                </BotaoRemover>
              )}
            </BotoesFoto>
          </FotoControles>
        </FotoArea>
      </Form>

      <Form onSubmit={atualizarPerfil}>
        <h2>Dados Pessoais</h2>
        <label>Nome</label>
        <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
        <label>Email</label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Botao type="submit">Atualizar Perfil</Botao>
      </Form>

      <Form onSubmit={trocarSenha}>
        <h2>Alterar Senha</h2>
        <label>Senha Atual</label>
        <Input
          type="password"
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
          required
        />
        <label>Nova Senha</label>
        <Input
          type="password"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          required
        />
        <Botao type="submit">Atualizar Senha</Botao>
      </Form>
    </Container>
  );
}

const Container = styled.div`
  padding: 2rem;
  color: white;
`;

const Form = styled.form`
  background-color: #1e293b;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 2rem;

  h2 {
    margin-bottom: 1rem;
    color: #38bdf8;
  }

  label {
    display: block;
    margin-top: 1rem;
    color: #cbd5e1;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.6rem;
  margin-top: 0.3rem;
  border: none;
  border-radius: 4px;
  background-color: #0f172a;
  color: white;
`;

const Botao = styled.button`
  margin-top: 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #2563eb;
  }
`;

const Mensagem = styled.p`
  margin-top: 1rem;
  color: #22c55e;
`;

const FotoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

const FotoControles = styled.div`
  display: grid;
  gap: 0.55rem;
  label { color: #fff; font-weight: 700; cursor: pointer; }
  input { color: #cbd5e1; }
  small { color: #94a3b8; }
`;

const BotoesFoto = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const BotaoRemover = styled.button`
  margin-top: 1.5rem;
  border: 1px solid #ef4444;
  background: transparent;
  color: #fca5a5;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;
