import { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useRouter } from 'next/router';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Suporte() {
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [status, setStatus] = useState('');
  const router = useRouter();

  useEffect(() => {
    const usuarioLocal = localStorage.getItem('usuario');
    if (!usuarioLocal || usuarioLocal === 'undefined') {
      router.replace('/login');
    }
  }, [router]);

  const enviarMensagem = async () => {
    setStatus('');

    if (!assunto.trim() || !mensagem.trim()) {
      setStatus('❌ Preencha todos os campos.');
      return;
    }

    if (!API) {
      setStatus('❌ Serviço de suporte temporariamente indisponível.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API}/suporte`,
        { assunto: assunto.trim(), mensagem: mensagem.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus(`✅ ${res.data?.mensagem || 'Mensagem enviada.'}`);
      setAssunto('');
      setMensagem('');
    } catch (err) {
      const erro = err.response?.data?.erro || 'Erro ao enviar mensagem.';
      setStatus(`❌ ${erro}`);
    }
  };

  return (
    <Container>
      <h1>Central de Suporte</h1>
      <Descricao>
        Se você tiver dúvidas, sugestões ou encontrou algum problema, envie uma
        mensagem para a equipe.
      </Descricao>

      <Form>
        <label>Assunto</label>
        <Input
          type="text"
          placeholder="Ex.: dúvida sobre minha conta"
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
        />

        <label>Mensagem</label>
        <Textarea
          rows={6}
          placeholder="Descreva sua solicitação com detalhes."
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
        />

        <Botao type="button" onClick={enviarMensagem}>Enviar mensagem</Botao>
        {status && <Status $ok={status.startsWith('✅')}>{status}</Status>}
      </Form>
    </Container>
  );
}

const Container = styled.div`
  max-width: 860px;
  margin: 0 auto;
  padding: 2rem;
  color: white;
`;

const Descricao = styled.p`
  color: #cbd5e1;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const Form = styled.div`
  background: #1e293b;
  padding: 1.5rem;
  border-radius: 12px;

  label {
    font-weight: 600;
    margin-top: 1rem;
    display: block;
    color: #e2e8f0;
  }
`;

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: .75rem;
  margin-top: .5rem;
  background: #0f172a;
  border: 1px solid #334155;
  color: white;
  border-radius: 8px;
`;

const Textarea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  padding: .75rem;
  margin-top: .5rem;
  background: #0f172a;
  border: 1px solid #334155;
  color: white;
  border-radius: 8px;
  resize: vertical;
`;

const Botao = styled.button`
  margin-top: 1.5rem;
  padding: .75rem 1.5rem;
  background: #2563eb;
  color: white;
  border: 0;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
`;

const Status = styled.p`
  margin-top: 1rem;
  font-weight: 600;
  color: ${({ $ok }) => ($ok ? '#22c55e' : '#f87171')};
`;
