import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useToast } from '../components/ToastProvider';
import {
  POLITICA_COMUNIDADE_PUBLICA,
  POLITICA_PRIVACIDADE_PUBLICA,
  POLITICA_RISCO_PUBLICA,
  TERMOS_USO_PUBLICOS,
} from '../lib/legal/publicDocuments';

const API = process.env.NEXT_PUBLIC_API_URL;
const VERSAO_TERMOS = '1.1';
const VERSAO_POLITICA_RISCO = '1.1';
const VERSAO_POLITICA_PRIVACIDADE = '1.1';
const VERSAO_POLITICA_COMUNIDADE = '1.1';

const docs = {
  termos: { title: 'Termos de Uso', text: TERMOS_USO_PUBLICOS },
  risco: { title: 'Aviso de Riscos', text: POLITICA_RISCO_PUBLICA },
  privacidade: { title: 'Política de Privacidade', text: POLITICA_PRIVACIDADE_PUBLICA },
  comunidade: { title: 'Política da Comunidade', text: POLITICA_COMUNIDADE_PUBLICA },
};

export default function Cadastro() {
  const router = useRouter();
  const { adicionarToast } = useToast();
  const [form, setForm] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    dataNascimento: '',
    cpf: '',
    genero: '',
    nomeUsuario: '',
    senha: '',
    confirmarSenha: '',
  });
  const [aceites, setAceites] = useState({
    termos: false,
    risco: false,
    privacidade: false,
    comunidade: false,
  });
  const [modal, setModal] = useState(null);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const todosAceitos = Object.values(aceites).every(Boolean);

  const setCampo = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const validar = () => {
    if (!Object.values(form).every((v) => String(v).trim())) return 'Preencha todos os campos.';
    if (form.senha.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
    if (form.senha !== form.confirmarSenha) return 'As senhas não coincidem.';
    if (!todosAceitos) return 'Leia e aceite os documentos obrigatórios.';
    return '';
  };

  const cadastrar = async (e) => {
    e.preventDefault();
    setErro('');
    const falha = validar();
    if (falha) {
      setErro(falha);
      return;
    }
    if (!API) {
      setErro('Endereço da API não configurado.');
      return;
    }

    try {
      setEnviando(true);
      const resposta = await axios.post(`${API}/cadastro`, {
        nome: form.nome.trim(),
        sobrenome: form.sobrenome.trim(),
        email: form.email.trim(),
        dataNascimento: form.dataNascimento,
        cpf: form.cpf.replace(/\D/g, ''),
        genero: form.genero,
        nomeUsuario: form.nomeUsuario.trim(),
        senha: form.senha,
        aceitouTermos: true,
        versaoTermos: VERSAO_TERMOS,
        aceites: {
          termosUso: { versao: VERSAO_TERMOS, aceitou: aceites.termos },
          politicaRisco: { versao: VERSAO_POLITICA_RISCO, aceitou: aceites.risco },
          politicaPrivacidade: { versao: VERSAO_POLITICA_PRIVACIDADE, aceitou: aceites.privacidade },
          politicaComunidade: { versao: VERSAO_POLITICA_COMUNIDADE, aceitou: aceites.comunidade },
        },
      });

      adicionarToast?.(
        resposta.data?.mensagem || 'Cadastro realizado. Verifique seu e-mail.',
        'sucesso'
      );
      router.push('/login');
    } catch (err) {
      setErro(err.response?.data?.erro || err.response?.data?.mensagem || 'Não foi possível concluir o cadastro.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Page>
      <Card>
        <Brand>TradeSports</Brand>
        <h1>Criar conta</h1>
        <Intro>
          Ambiente de simulação econômica esportiva com unidades virtuais T$.
        </Intro>

        <form onSubmit={cadastrar}>
          <Grid>
            <Field>
              <label>Nome</label>
              <input value={form.nome} onChange={(e) => setCampo('nome', e.target.value)} />
            </Field>
            <Field>
              <label>Sobrenome</label>
              <input value={form.sobrenome} onChange={(e) => setCampo('sobrenome', e.target.value)} />
            </Field>
            <Field $wide>
              <label>E-mail</label>
              <input type="email" value={form.email} onChange={(e) => setCampo('email', e.target.value)} />
            </Field>
            <Field>
              <label>Data de nascimento</label>
              <input type="date" value={form.dataNascimento} onChange={(e) => setCampo('dataNascimento', e.target.value)} />
            </Field>
            <Field>
              <label>CPF</label>
              <input inputMode="numeric" value={form.cpf} onChange={(e) => setCampo('cpf', e.target.value)} />
            </Field>
            <Field>
              <label>Gênero</label>
              <select value={form.genero} onChange={(e) => setCampo('genero', e.target.value)}>
                <option value="">Selecione</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
                <option value="prefiro_nao_informar">Prefiro não informar</option>
              </select>
            </Field>
            <Field>
              <label>Nome de usuário</label>
              <input value={form.nomeUsuario} onChange={(e) => setCampo('nomeUsuario', e.target.value)} />
            </Field>
            <Field>
              <label>Senha</label>
              <input type="password" value={form.senha} onChange={(e) => setCampo('senha', e.target.value)} />
            </Field>
            <Field>
              <label>Confirmar senha</label>
              <input type="password" value={form.confirmarSenha} onChange={(e) => setCampo('confirmarSenha', e.target.value)} />
            </Field>
          </Grid>

          <LegalBox>
            {Object.entries(docs).map(([key, doc]) => (
              <LegalRow key={key}>
                <input
                  type="checkbox"
                  checked={aceites[key]}
                  onChange={(e) => setAceites((prev) => ({ ...prev, [key]: e.target.checked }))}
                />
                <span>
                  Li e aceito{' '}
                  <button type="button" onClick={() => setModal(key)}>
                    {doc.title}
                  </button>
                </span>
              </LegalRow>
            ))}
          </LegalBox>

          {erro && <Error>{erro}</Error>}

          <Submit type="submit" disabled={enviando || !todosAceitos}>
            {enviando ? 'Criando conta...' : 'Criar conta'}
          </Submit>
        </form>

        <BottomText>
          Já tem uma conta? <Link href="/login">Entrar</Link>
        </BottomText>
      </Card>

      {modal && (
        <LegalModal
          title={docs[modal].title}
          text={docs[modal].text}
          onClose={() => setModal(null)}
          onAccept={() => {
            setAceites((prev) => ({ ...prev, [modal]: true }));
            setModal(null);
          }}
        />
      )}
    </Page>
  );
}

function LegalModal({ title, text, onClose, onAccept }) {
  return (
    <Overlay role="dialog" aria-modal="true">
      <Modal>
        <ModalHeader>
          <strong>{title}</strong>
          <button type="button" onClick={onClose}>×</button>
        </ModalHeader>
        <ModalBody><pre>{text}</pre></ModalBody>
        <ModalActions>
          <button type="button" onClick={onClose}>Fechar</button>
          <Accept type="button" onClick={onAccept}>Li e aceito</Accept>
        </ModalActions>
      </Modal>
    </Overlay>
  );
}

const Page = styled.div`
  min-height: 100vh;
  padding: 40px 18px;
  display: grid;
  place-items: center;
  background: #07111f;
`;

const Card = styled.div`
  width: min(760px, 100%);
  padding: 28px;
  border: 1px solid #1e293b;
  border-radius: 18px;
  background: #0f172a;
  color: #f8fafc;

  h1 { margin: 8px 0; }
`;

const Brand = styled.div`
  color: #00ff95;
  font-weight: 800;
`;

const Intro = styled.p`
  color: #94a3b8;
  margin-bottom: 24px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  grid-column: ${({ $wide }) => ($wide ? '1 / -1' : 'auto')};

  label {
    display: block;
    margin-bottom: 6px;
    color: #cbd5e1;
    font-size: .85rem;
    font-weight: 600;
  }

  input, select {
    width: 100%;
    box-sizing: border-box;
    padding: 11px 12px;
    border: 1px solid #334155;
    border-radius: 9px;
    background: #07111f;
    color: #f8fafc;
  }
`;

const LegalBox = styled.div`
  margin-top: 22px;
  padding: 16px;
  border: 1px solid #334155;
  border-radius: 12px;
  background: rgba(2,6,23,.45);
`;

const LegalRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 10px 0;
  color: #cbd5e1;
  font-size: .88rem;

  button {
    padding: 0;
    border: 0;
    background: transparent;
    color: #60a5fa;
    cursor: pointer;
    text-decoration: underline;
  }
`;

const Error = styled.p`
  color: #f87171;
  font-weight: 600;
`;

const Submit = styled.button`
  width: 100%;
  margin-top: 18px;
  padding: 13px;
  border: 0;
  border-radius: 10px;
  background: #00d881;
  color: #04100b;
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    opacity: .45;
    cursor: not-allowed;
  }
`;

const BottomText = styled.p`
  margin: 18px 0 0;
  color: #94a3b8;
  text-align: center;

  a { color: #60a5fa; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  padding: 18px;
  display: grid;
  place-items: center;
  background: rgba(0,0,0,.65);
`;

const Modal = styled.div`
  width: min(900px, 96vw);
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 14px;
  background: #fff;
  color: #111827;
`;

const ModalHeader = styled.div`
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;

  button {
    border: 0;
    background: transparent;
    font-size: 1.3rem;
    cursor: pointer;
  }
`;

const ModalBody = styled.div`
  padding: 18px;
  overflow: auto;

  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font: inherit;
    font-size: .88rem;
    line-height: 1.65;
  }
`;

const ModalActions = styled.div`
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #e5e7eb;

  button {
    padding: 10px 14px;
    border: 1px solid #d1d5db;
    border-radius: 9px;
    background: #fff;
    cursor: pointer;
    font-weight: 700;
  }
`;

const Accept = styled.button`
  && {
    border-color: #2563eb;
    background: #2563eb;
    color: #fff;
  }
`;
