import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled, { keyframes } from 'styled-components';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function VerificarEmail() {
  const router = useRouter();
  const tokenProcessado = useRef('');
  const [status, setStatus] = useState('inicial');
  const [mensagem, setMensagem] = useState('');
  const [identificador, setIdentificador] = useState('');
  const [reenviando, setReenviando] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const salvo = typeof window !== 'undefined'
      ? window.sessionStorage.getItem('emailVerificacaoPendente') || ''
      : '';

    setIdentificador(String(router.query.emailOuUsuario || salvo || '').trim());

    const token = String(router.query.token || '');
    if (!token) {
      setStatus('pendente');
      setMensagem(
        router.query.cadastro === '1'
          ? 'Enviamos um link de confirmação para o seu e-mail.'
          : 'Informe seu e-mail ou nome de usuário para receber um novo link.'
      );
      return;
    }

    if (tokenProcessado.current === token) return;
    tokenProcessado.current = token;
    setStatus('carregando');

    async function verificar() {
      if (!API) {
        setStatus('erro');
        setMensagem('A conexão com o servidor não está configurada.');
        return;
      }

      try {
        const res = await fetch(
          `${API}/verificar-email?token=${encodeURIComponent(token)}`
        );
        const data = await res.json();

        if (!res.ok) {
          setStatus('erro');
          setMensagem(data.erro || 'Não foi possível confirmar seu e-mail.');
          return;
        }

        window.sessionStorage.removeItem('emailVerificacaoPendente');
        setStatus('ok');
        setMensagem(data.mensagem || 'E-mail confirmado com sucesso!');
      } catch (_) {
        setStatus('erro');
        setMensagem('Erro ao conectar com o servidor.');
      }
    }

    verificar();
  }, [router.isReady, router.query.token, router.query.cadastro, router.query.emailOuUsuario]);

  async function reenviar(event) {
    event.preventDefault();
    const valor = identificador.trim();

    if (!valor) {
      setStatus('erro');
      setMensagem('Informe seu e-mail ou nome de usuário.');
      return;
    }

    if (!API) {
      setStatus('erro');
      setMensagem('A conexão com o servidor não está configurada.');
      return;
    }

    setReenviando(true);
    setMensagem('');

    try {
      const res = await fetch(`${API}/reenviar-verificacao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOuUsuario: valor }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus('erro');
        setMensagem(data.erro || 'Não foi possível reenviar o e-mail.');
        return;
      }

      window.sessionStorage.setItem('emailVerificacaoPendente', valor);
      setStatus('reenviado');
      setMensagem(data.mensagem);
    } catch (_) {
      setStatus('erro');
      setMensagem('Erro ao conectar com o servidor.');
    } finally {
      setReenviando(false);
    }
  }

  const sucesso = status === 'ok';
  const podeReenviar = ['pendente', 'erro', 'reenviado'].includes(status);

  return (
    <Page>
      <Card>
        <Logo src="/tradesports-logo.png" alt="TradeSports" />
        <Icone $sucesso={sucesso} $erro={status === 'erro'}>
          {status === 'carregando' ? <Spinner /> : sucesso ? '✓' : '@'}
        </Icone>
        <Titulo>
          {status === 'carregando'
            ? 'Confirmando seu e-mail...'
            : sucesso
              ? 'E-mail confirmado!'
              : status === 'reenviado'
                ? 'Novo link solicitado'
                : 'Confirme seu cadastro'}
        </Titulo>
        {mensagem && (
          <Mensagem role={status === 'erro' ? 'alert' : undefined}>
            {mensagem}
          </Mensagem>
        )}
        {podeReenviar && (
          <Form onSubmit={reenviar}>
            <Label htmlFor="emailOuUsuario">E-mail ou nome de usuário</Label>
            <Input
              id="emailOuUsuario"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              placeholder="seuemail@exemplo.com"
              autoCapitalize="none"
              autoComplete="email"
              disabled={reenviando}
            />
            <Botao type="submit" disabled={reenviando}>
              {reenviando ? 'Enviando...' : 'Reenviar e-mail de confirmação'}
            </Botao>
          </Form>
        )}
        {sucesso && <BotaoLink href="/login">Entrar na TradeSports</BotaoLink>}
        {!sucesso && <Voltar href="/login">Voltar para o login</Voltar>}
        <Nota>
          O link é de uso único e expira em 24 horas. Verifique também spam e lixo eletrônico.
        </Nota>
      </Card>
    </Page>
  );
}

const girar = keyframes`to{transform:rotate(360deg)}`;
const Page = styled.main`
  min-height:calc(100vh - 64px);display:grid;place-items:center;padding:32px 18px;
  background:radial-gradient(circle at 15% 10%,rgba(37,99,235,.2),transparent 35%),
  radial-gradient(circle at 85% 90%,rgba(34,197,94,.13),transparent 35%),#030712;color:#e5e7eb;
`;
const Card = styled.section`
  width:min(470px,100%);padding:34px;border:1px solid rgba(148,163,184,.16);
  border-radius:22px;background:rgba(15,23,42,.95);box-shadow:0 24px 70px rgba(0,0,0,.4);text-align:center;
`;
const Logo = styled.img`display:block;width:220px;max-width:80%;height:auto;margin:0 auto 26px`;
const Icone = styled.div`
  width:58px;height:58px;display:grid;place-items:center;margin:0 auto 18px;border-radius:50%;
  border:1px solid ${({$sucesso,$erro})=>$sucesso?'rgba(34,197,94,.35)':$erro?'rgba(239,68,68,.35)':'rgba(96,165,250,.35)'};
  background:${({$sucesso,$erro})=>$sucesso?'rgba(34,197,94,.12)':$erro?'rgba(239,68,68,.1)':'rgba(59,130,246,.11)'};
  color:${({$sucesso,$erro})=>$sucesso?'#4ade80':$erro?'#fca5a5':'#93c5fd'};font-size:1.35rem;font-weight:900;
`;
const Spinner = styled.span`width:22px;height:22px;border:3px solid rgba(147,197,253,.25);border-top-color:#93c5fd;border-radius:50%;animation:${girar} .75s linear infinite`;
const Titulo = styled.h1`margin:0;color:#f8fafc;font-size:1.75rem;letter-spacing:-.035em`;
const Mensagem = styled.p`margin:12px auto 22px;color:#94a3b8;font-size:.84rem;line-height:1.65`;
const Form = styled.form`display:grid;gap:9px;margin-top:20px;text-align:left`;
const Label = styled.label`color:#cbd5e1;font-size:.72rem;font-weight:800`;
const Input = styled.input`
  width:100%;box-sizing:border-box;min-height:46px;padding:0 13px;border:1px solid rgba(148,163,184,.2);
  border-radius:11px;outline:none;background:rgba(2,6,23,.6);color:#f8fafc;font-size:.82rem;
  &:focus{border-color:rgba(59,130,246,.75);box-shadow:0 0 0 3px rgba(59,130,246,.1)}
`;
const Botao = styled.button`
  min-height:46px;margin-top:4px;border:0;border-radius:11px;background:linear-gradient(135deg,#2563eb,#1d4ed8);
  color:#fff;font-size:.76rem;font-weight:900;cursor:pointer;&:disabled{opacity:.6;cursor:not-allowed}
`;
const BotaoLink = styled(Link)`
  min-height:46px;display:grid;place-items:center;margin-top:22px;border-radius:11px;
  background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-size:.78rem;font-weight:900;text-decoration:none;
`;
const Voltar = styled(Link)`display:inline-block;margin-top:20px;color:#93c5fd;font-size:.75rem;font-weight:800;text-decoration:none`;
const Nota = styled.p`margin:24px 0 0;padding-top:18px;border-top:1px solid rgba(148,163,184,.12);color:#64748b;font-size:.67rem;line-height:1.55`;

