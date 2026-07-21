import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import styled, { keyframes } from "styled-components";

const REGRAS = [
  { id: "tamanho", texto: "Pelo menos 8 caracteres", teste: (senha) => senha.length >= 8 },
  { id: "maiuscula", texto: "Uma letra maiúscula", teste: (senha) => /[A-Z]/.test(senha) },
  { id: "minuscula", texto: "Uma letra minúscula", teste: (senha) => /[a-z]/.test(senha) },
  { id: "numero", texto: "Um número", teste: (senha) => /\d/.test(senha) },
];

export default function RedefinirSenha() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [tokenPronto, setTokenPronto] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!router.isReady) return;
    const recebido = Array.isArray(router.query.token)
      ? router.query.token[0]
      : router.query.token;
    setToken(typeof recebido === "string" ? recebido.trim() : "");
    setTokenPronto(true);
  }, [router.isReady, router.query.token]);

  const regrasAtendidas = useMemo(
    () => REGRAS.map((regra) => ({ ...regra, ok: regra.teste(novaSenha) })),
    [novaSenha],
  );
  const senhaForte = regrasAtendidas.every((regra) => regra.ok);
  const senhasIguais = confirmacao.length > 0 && novaSenha === confirmacao;
  const tokenAusente = tokenPronto && !token;

  const limparErro = () => {
    if (erro) setErro("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (enviando || concluido) return;

    if (!token) {
      setErro("Este link de redefinição é inválido. Solicite um novo link.");
      return;
    }
    if (!senhaForte) {
      setErro("Crie uma senha que atenda a todos os requisitos de segurança.");
      return;
    }
    if (novaSenha !== confirmacao) {
      setErro("As senhas informadas não são iguais.");
      return;
    }

    setErro("");
    setEnviando(true);

    try {
      await axios.post(`${API}/resetar-senha`, { token, novaSenha });
      setConcluido(true);
      setNovaSenha("");
      setConfirmacao("");
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        setErro("Muitas tentativas foram realizadas. Aguarde alguns minutos e tente novamente.");
      } else {
        setErro(
          err.response?.data?.erro ||
            "Não foi possível redefinir sua senha agora. Tente novamente em instantes.",
        );
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Page>
      <Glow $top />
      <Glow />
      <Shell>
        <InfoPanel>
          <SimuladoBadge><StatusDot /> Ambiente simulado</SimuladoBadge>
          <InfoContent>
            <Eyebrow>PROTEÇÃO DA CONTA</Eyebrow>
            <InfoTitle>Uma nova senha para um acesso <Accent>mais seguro.</Accent></InfoTitle>
            <InfoText>
              Crie uma senha exclusiva para a TradeSports. O link é temporário e deixa de funcionar após a alteração.
            </InfoText>
            <SecurityList>
              <SecurityItem><Icon>✓</Icon><div><strong>Link de uso único</strong><span>Após a troca, ele é automaticamente invalidado.</span></div></SecurityItem>
              <SecurityItem><Icon>✓</Icon><div><strong>Proteção criptográfica</strong><span>O token não é armazenado em texto aberto.</span></div></SecurityItem>
              <SecurityItem><Icon>✓</Icon><div><strong>Senha protegida</strong><span>Sua nova senha é salva de forma segura.</span></div></SecurityItem>
            </SecurityList>
          </InfoContent>
          <SecurityNote><Shield>✓</Shield><div><strong>Importante</strong><span>A TradeSports nunca solicita sua senha por e-mail.</span></div></SecurityNote>
        </InfoPanel>

        <FormPanel>
          <FormWrap>
            {!tokenPronto ? (
              <Centered role="status"><Spinner $dark /><span>Verificando link...</span></Centered>
            ) : tokenAusente ? (
              <StateBox role="alert">
                <StateIcon $error>!</StateIcon>
                <FormEyebrow>LINK INVÁLIDO</FormEyebrow>
                <Title>Não foi possível continuar</Title>
                <Subtitle>Este endereço não contém um token de redefinição válido. Solicite um novo link para proteger sua conta.</Subtitle>
                <PrimaryLink href="/esqueci-senha">Solicitar novo link <Arrow>→</Arrow></PrimaryLink>
                <SecondaryLink href="/login">Voltar para o login</SecondaryLink>
              </StateBox>
            ) : concluido ? (
              <StateBox role="status" aria-live="polite">
                <StateIcon>✓</StateIcon>
                <FormEyebrow>SENHA ATUALIZADA</FormEyebrow>
                <Title>Tudo certo!</Title>
                <Subtitle>Sua senha foi redefinida com sucesso. Agora você já pode entrar novamente na sua conta.</Subtitle>
                <PrimaryLink href="/login">Entrar na TradeSports <Arrow>→</Arrow></PrimaryLink>
              </StateBox>
            ) : (
              <>
                <BackLink href="/login"><span>←</span> Voltar para o login</BackLink>
                <FormEyebrow>REDEFINIÇÃO DE SENHA</FormEyebrow>
                <Title>Crie sua nova senha</Title>
                <Subtitle>Escolha uma combinação segura e diferente das senhas que você usa em outros serviços.</Subtitle>

                <Form onSubmit={handleSubmit} noValidate>
                  <Field>
                    <Label htmlFor="novaSenha">Nova senha</Label>
                    <InputWrap>
                      <FieldIcon>●</FieldIcon>
                      <Input id="novaSenha" type={mostrarSenha ? "text" : "password"} autoComplete="new-password" value={novaSenha} onChange={(e) => { setNovaSenha(e.target.value); limparErro(); }} disabled={enviando} aria-invalid={Boolean(erro)} autoFocus />
                      <Toggle type="button" onClick={() => setMostrarSenha((v) => !v)} aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}>{mostrarSenha ? "Ocultar" : "Mostrar"}</Toggle>
                    </InputWrap>
                  </Field>

                  <Rules aria-label="Requisitos da senha">
                    {regrasAtendidas.map((regra) => <Rule key={regra.id} $ok={regra.ok}><RuleIcon>{regra.ok ? "✓" : "·"}</RuleIcon>{regra.texto}</Rule>)}
                  </Rules>

                  <Field>
                    <Label htmlFor="confirmacao">Confirme a nova senha</Label>
                    <InputWrap>
                      <FieldIcon>●</FieldIcon>
                      <Input id="confirmacao" type={mostrarConfirmacao ? "text" : "password"} autoComplete="new-password" value={confirmacao} onChange={(e) => { setConfirmacao(e.target.value); limparErro(); }} disabled={enviando} aria-invalid={confirmacao.length > 0 && !senhasIguais} />
                      <Toggle type="button" onClick={() => setMostrarConfirmacao((v) => !v)} aria-label={mostrarConfirmacao ? "Ocultar confirmação" : "Mostrar confirmação"}>{mostrarConfirmacao ? "Ocultar" : "Mostrar"}</Toggle>
                    </InputWrap>
                    {confirmacao.length > 0 && <Match $ok={senhasIguais}>{senhasIguais ? "✓ As senhas são iguais" : "As senhas ainda não são iguais"}</Match>}
                  </Field>

                  {erro && <Error role="alert"><ErrorIcon>!</ErrorIcon><span>{erro}</span></Error>}
                  <Submit type="submit" disabled={enviando || !senhaForte || !senhasIguais}>
                    {enviando ? <><Spinner /> Redefinindo...</> : <>Redefinir senha <Arrow>→</Arrow></>}
                  </Submit>
                </Form>
                <HelpText>Seu link expirou? <Link href="/esqueci-senha">Solicite outro</Link></HelpText>
              </>
            )}
          </FormWrap>
        </FormPanel>
      </Shell>
    </Page>
  );
}

const spin = keyframes`to { transform: rotate(360deg); }`;
const Page = styled.main`min-height:100vh;background:#060b18;color:#fff;display:grid;place-items:center;padding:32px;position:relative;overflow:hidden;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;@media(max-width:720px){padding:0;background:#fff;}`;
const Glow = styled.div`position:absolute;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(38,218,139,.12),transparent 68%);right:-220px;bottom:-220px;pointer-events:none;${({$top})=>$top&&`right:auto;bottom:auto;left:-260px;top:-260px;background:radial-gradient(circle,rgba(30,95,210,.16),transparent 68%);`}`;
const Shell = styled.section`width:min(1120px,100%);min-height:680px;display:grid;grid-template-columns:1.02fr .98fr;background:#fff;border:1px solid rgba(255,255,255,.1);border-radius:26px;overflow:hidden;box-shadow:0 32px 90px rgba(0,0,0,.36);position:relative;z-index:1;@media(max-width:850px){grid-template-columns:1fr;max-width:600px;}@media(max-width:720px){min-height:100vh;border:0;border-radius:0;box-shadow:none;}`;
const InfoPanel = styled.aside`background:linear-gradient(150deg,#071328 0%,#0b2040 62%,#0a2c38 100%);padding:48px;display:flex;flex-direction:column;justify-content:space-between;position:relative;@media(max-width:850px){display:none;}`;
const SimuladoBadge = styled.div`align-self:flex-start;display:flex;align-items:center;gap:9px;padding:9px 13px;border:1px solid rgba(107,226,170,.22);border-radius:999px;background:rgba(24,184,116,.08);color:#bbf7d5;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;`;
const StatusDot = styled.span`width:7px;height:7px;border-radius:50%;background:#35dc91;box-shadow:0 0 12px #35dc91;`;
const InfoContent = styled.div`max-width:450px;`;
const Eyebrow = styled.p`margin:0 0 16px;color:#49df9b;font-size:12px;font-weight:800;letter-spacing:.17em;`;
const InfoTitle = styled.h1`margin:0;font-size:clamp(38px,4vw,55px);line-height:1.03;letter-spacing:-.045em;`;
const Accent = styled.span`color:#39dc91;`;
const InfoText = styled.p`margin:22px 0 30px;color:#aabbd2;font-size:16px;line-height:1.65;`;
const SecurityList = styled.div`display:grid;gap:18px;`;
const SecurityItem = styled.div`display:flex;gap:13px;align-items:flex-start;strong,span{display:block}strong{font-size:14px;margin-bottom:4px}span{color:#91a5bf;font-size:13px;line-height:1.45}`;
const Icon = styled.span`width:25px;height:25px;flex:0 0 25px;display:grid;place-items:center;border-radius:50%;background:rgba(53,220,145,.13);color:#4ce09b;font-weight:900;`;
const SecurityNote = styled.div`display:flex;align-items:center;gap:12px;padding:15px;border:1px solid rgba(255,255,255,.09);border-radius:14px;background:rgba(255,255,255,.04);strong,span{display:block}strong{font-size:13px}span{color:#8fa3bd;font-size:12px;margin-top:3px}`;
const Shield = styled.span`width:34px;height:34px;border-radius:10px;background:#153755;color:#44df97;display:grid;place-items:center;font-weight:900;`;
const FormPanel = styled.div`color:#10213b;display:grid;place-items:center;padding:50px 60px;@media(max-width:720px){padding:38px 24px;align-items:start;}`;
const FormWrap = styled.div`width:100%;max-width:430px;`;
const BackLink = styled(Link)`display:inline-flex;gap:9px;align-items:center;color:#65748a;text-decoration:none;font-size:13px;font-weight:700;margin-bottom:34px;&:hover{color:#168b5c}`;
const FormEyebrow = styled.p`margin:0 0 11px;color:#178c5c;font-size:11px;font-weight:900;letter-spacing:.15em;`;
const Title = styled.h2`margin:0;color:#0c1b31;font-size:34px;line-height:1.15;letter-spacing:-.035em;`;
const Subtitle = styled.p`margin:14px 0 28px;color:#68778c;font-size:14px;line-height:1.6;`;
const Form = styled.form`display:grid;gap:18px;`;
const Field = styled.div`display:grid;gap:8px;`;
const Label = styled.label`font-size:13px;font-weight:800;color:#24354d;`;
const InputWrap = styled.div`position:relative;display:flex;align-items:center;`;
const FieldIcon = styled.span`position:absolute;left:15px;color:#9aabc0;font-size:10px;z-index:1;`;
const Input = styled.input`width:100%;height:50px;border:1px solid #dbe2eb;border-radius:12px;background:#f8fafc;padding:0 82px 0 38px;color:#12233d;font:inherit;font-size:14px;outline:none;transition:.2s;&:focus{border-color:#28b879;background:#fff;box-shadow:0 0 0 3px rgba(40,184,121,.1)}&:disabled{opacity:.7}`;
const Toggle = styled.button`position:absolute;right:13px;border:0;background:transparent;color:#51708d;font-size:11px;font-weight:800;cursor:pointer;padding:8px;`;
const Rules = styled.ul`display:grid;grid-template-columns:1fr 1fr;gap:7px 12px;list-style:none;margin:-7px 0 2px;padding:0;@media(max-width:420px){grid-template-columns:1fr;}`;
const Rule = styled.li`font-size:11px;color:${({$ok})=>$ok?"#168b5c":"#8290a3"};display:flex;align-items:center;gap:6px;transition:.2s;`;
const RuleIcon = styled.span`font-weight:900;width:13px;text-align:center;`;
const Match = styled.span`font-size:11px;color:${({$ok})=>$ok?"#168b5c":"#b64b4b"};font-weight:700;`;
const Error = styled.div`display:flex;align-items:flex-start;gap:10px;padding:12px 13px;border:1px solid #f1c6c6;border-radius:11px;background:#fff5f5;color:#a33535;font-size:12px;line-height:1.45;`;
const ErrorIcon = styled.span`width:19px;height:19px;flex:0 0 19px;border-radius:50%;background:#c84d4d;color:#fff;display:grid;place-items:center;font-weight:900;`;
const Submit = styled.button`height:51px;border:0;border-radius:12px;background:linear-gradient(135deg,#19a969,#34d88d);color:#fff;font-weight:900;font-size:14px;display:flex;align-items:center;justify-content:center;gap:10px;cursor:pointer;box-shadow:0 12px 25px rgba(27,174,108,.2);transition:.2s;&:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 15px 30px rgba(27,174,108,.28)}&:disabled{opacity:.48;cursor:not-allowed;box-shadow:none}`;
const Arrow = styled.span`font-size:18px;`;
const Spinner = styled.span`width:17px;height:17px;border:2px solid rgba(255,255,255,.38);border-top-color:${({$dark})=>$dark?"#168b5c":"#fff"};border-radius:50%;animation:${spin} .7s linear infinite;`;
const HelpText = styled.p`text-align:center;color:#77869a;font-size:12px;margin:22px 0 0;a{color:#178c5c;font-weight:800;text-decoration:none}`;
const Centered = styled.div`min-height:360px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:#64748b;font-size:13px;`;
const StateBox = styled.div`text-align:center;display:flex;flex-direction:column;align-items:center;`;
const StateIcon = styled.div`width:62px;height:62px;border-radius:20px;display:grid;place-items:center;background:${({$error})=>$error?"#fff1f1":"#eafaf2"};color:${({$error})=>$error?"#bc4141":"#13905b"};font-size:27px;font-weight:900;margin-bottom:24px;`;
const PrimaryLink = styled(Link)`width:100%;height:51px;border-radius:12px;background:linear-gradient(135deg,#19a969,#34d88d);color:#fff;text-decoration:none;font-weight:900;font-size:14px;display:flex;align-items:center;justify-content:center;gap:10px;margin-top:4px;`;
const SecondaryLink = styled(Link)`color:#64748b;text-decoration:none;font-size:12px;font-weight:800;margin-top:19px;`;
