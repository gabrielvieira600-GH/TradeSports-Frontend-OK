import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import styled, { keyframes } from "styled-components";

const RESPOSTA_NEUTRA =
  "Se os dados informados estiverem associados a uma conta, você receberá um e-mail com as instruções para redefinir sua senha.";

export default function EsqueciSenha() {
  const [emailOuUsuario, setEmailOuUsuario] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (enviando) return;

    const identificador = emailOuUsuario.trim();
    if (!identificador) {
      setErro("Informe seu e-mail ou nome de usuário.");
      return;
    }

    setErro("");
    setEnviando(true);

    try {
      await axios.post(`${API}/esqueci-senha`, {
        emailOuUsuario: identificador,
      });
      setEnviado(true);
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        setErro(
          "Muitas solicitações foram realizadas. Aguarde alguns minutos e tente novamente.",
        );
      } else {
        setErro(
          err.response?.data?.erro ||
            "Não foi possível enviar as instruções agora. Tente novamente em instantes.",
        );
      }
    } finally {
      setEnviando(false);
    }
  };

  const tentarNovamente = () => {
    setEnviado(false);
    setErro("");
  };

  return (
    <Page>
      <Glow $top />
      <Glow />

      <Shell>
        <InfoPanel>
          <SimuladoBadge>
            <StatusDot /> Ambiente simulado
          </SimuladoBadge>

          <InfoContent>
            <Eyebrow>SEGURANÇA DA CONTA</Eyebrow>
            <InfoTitle>
              Recupere seu acesso com <Accent>segurança.</Accent>
            </InfoTitle>
            <InfoText>
              Enviaremos um link temporário e de uso único para o e-mail
              associado à sua conta.
            </InfoText>

            <Steps aria-label="Etapas da recuperação de senha">
              <Step>
                <StepNumber>1</StepNumber>
                <div>
                  <strong>Informe seus dados</strong>
                  <span>Use o e-mail ou usuário cadastrado.</span>
                </div>
              </Step>
              <Step>
                <StepNumber>2</StepNumber>
                <div>
                  <strong>Confira seu e-mail</strong>
                  <span>O link de redefinição é válido por uma hora.</span>
                </div>
              </Step>
              <Step>
                <StepNumber>3</StepNumber>
                <div>
                  <strong>Crie uma nova senha</strong>
                  <span>Depois, você poderá acessar normalmente.</span>
                </div>
              </Step>
            </Steps>
          </InfoContent>

          <SecurityNote>
            <Shield aria-hidden="true">✓</Shield>
            <div>
              <strong>Proteção TradeSports</strong>
              <span>Nunca solicitaremos sua senha atual por e-mail.</span>
            </div>
          </SecurityNote>
        </InfoPanel>

        <FormPanel>
          <FormWrap>
            {!enviado ? (
              <>
                <BackLink href="/login">
                  <span aria-hidden="true">←</span> Voltar para o login
                </BackLink>
                <FormEyebrow>RECUPERAÇÃO DE ACESSO</FormEyebrow>
                <Title>Esqueceu sua senha?</Title>
                <Subtitle>
                  Informe seu e-mail ou nome de usuário. Se encontrarmos uma
                  conta, enviaremos as próximas instruções.
                </Subtitle>

                <Form onSubmit={handleSubmit} noValidate>
                  <Field>
                    <Label htmlFor="emailOuUsuario">
                      E-mail ou nome de usuário
                    </Label>
                    <InputWrap>
                      <FieldIcon aria-hidden="true">@</FieldIcon>
                      <Input
                        id="emailOuUsuario"
                        name="emailOuUsuario"
                        type="text"
                        autoComplete="username"
                        autoCapitalize="none"
                        spellCheck="false"
                        placeholder="Digite seu e-mail ou usuário"
                        value={emailOuUsuario}
                        onChange={(event) => {
                          setEmailOuUsuario(event.target.value);
                          if (erro) setErro("");
                        }}
                        disabled={enviando}
                        aria-invalid={Boolean(erro)}
                        aria-describedby={erro ? "erro-recuperacao" : undefined}
                        autoFocus
                        required
                      />
                    </InputWrap>
                  </Field>

                  {erro && (
                    <Error id="erro-recuperacao" role="alert">
                      <ErrorIcon aria-hidden="true">!</ErrorIcon>
                      <span>{erro}</span>
                    </Error>
                  )}

                  <Submit type="submit" disabled={enviando}>
                    {enviando ? (
                      <>
                        <Spinner /> Enviando...
                      </>
                    ) : (
                      <>
                        Enviar instruções <Arrow>→</Arrow>
                      </>
                    )}
                  </Submit>
                </Form>

                <HelpText>
                  Lembrou sua senha? <Link href="/login">Entrar na conta</Link>
                </HelpText>
              </>
            ) : (
              <Success role="status" aria-live="polite">
                <SuccessIcon aria-hidden="true">✓</SuccessIcon>
                <FormEyebrow>SOLICITAÇÃO RECEBIDA</FormEyebrow>
                <Title>Confira seu e-mail</Title>
                <SuccessText>{RESPOSTA_NEUTRA}</SuccessText>
                <TipBox>
                  O e-mail pode levar alguns minutos. Confira também as pastas
                  de spam, lixo eletrônico e promoções.
                </TipBox>
                <PrimaryLink href="/login">
                  Voltar para o login <Arrow>→</Arrow>
                </PrimaryLink>
                <Retry type="button" onClick={tentarNovamente}>
                  Usar outro e-mail ou usuário
                </Retry>
              </Success>
            )}

            <Privacy>
              Por segurança, não informamos se um e-mail ou usuário está
              cadastrado na plataforma.
            </Privacy>
          </FormWrap>
        </FormPanel>
      </Shell>
    </Page>
  );
}

const pulse = keyframes`0%,100%{opacity:1}50%{opacity:.4}`;
const spin = keyframes`to{transform:rotate(360deg)}`;
const appear = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;

const Page = styled.main`
  position: relative;
  min-height: calc(100vh - 64px);
  overflow: hidden;
  display: grid;
  place-items: center;
  padding: 38px 24px;
  color: #e5e7eb;
  background: #030712;
  @media (max-width: 900px) {
    padding: 24px 16px;
  }
  @media (max-width: 520px) {
    padding: 0;
    place-items: stretch;
  }
`;
const Glow = styled.div`
  position: absolute;
  right: -12%;
  bottom: -35%;
  width: 620px;
  height: 620px;
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.1), transparent 67%);
  ${({ $top }) =>
    $top &&
    `right:auto;bottom:auto;left:-15%;top:-35%;background:radial-gradient(circle,rgba(37,99,235,.14),transparent 67%);`}
`;
const Shell = styled.section`
  position: relative;
  z-index: 1;
  width: min(1040px, 100%);
  min-height: 640px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 28px;
  background: rgba(15, 23, 42, 0.86);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.45);
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    min-height: auto;
    max-width: 600px;
  }
  @media (max-width: 520px) {
    border: 0;
    border-radius: 0;
    min-height: calc(100vh - 64px);
  }
`;
const InfoPanel = styled.aside`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 38px 42px 32px;
  background: linear-gradient(145deg, #071426 0%, #0b1f3a 54%, #07182a 100%);
  border-right: 1px solid rgba(148, 163, 184, 0.12);
  @media (max-width: 900px) {
    display: none;
  }
`;
const SimuladoBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: max-content;
  padding: 7px 11px;
  border: 1px solid rgba(34, 197, 94, 0.18);
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.07);
  color: #86efac;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;
const StatusDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.7);
  animation: ${pulse} 2s infinite;
`;
const InfoContent = styled.div`
  margin: auto 0;
`;
const Eyebrow = styled.div`
  margin-bottom: 15px;
  color: #60a5fa;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.15em;
`;
const InfoTitle = styled.h2`
  max-width: 430px;
  margin: 0;
  color: #fff;
  font-size: clamp(2.25rem, 4vw, 3.4rem);
  line-height: 1.02;
  letter-spacing: -0.055em;
`;
const Accent = styled.span`
  display: block;
  color: #22c55e;
`;
const InfoText = styled.p`
  max-width: 430px;
  margin: 20px 0 30px;
  color: #9badc2;
  font-size: 0.93rem;
  line-height: 1.7;
`;
const Steps = styled.div`
  display: grid;
  gap: 12px;
`;
const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 13px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.03);
  strong,
  span {
    display: block;
  }
  strong {
    color: #e8f0fa;
    font-size: 0.78rem;
  }
  span {
    margin-top: 3px;
    color: #71859d;
    font-size: 0.68rem;
  }
`;
const StepNumber = styled.span`
  width: 34px;
  height: 34px;
  display: grid !important;
  place-items: center;
  flex: 0 0 auto;
  margin: 0 !important;
  border-radius: 10px;
  background: rgba(37, 99, 235, 0.14);
  color: #7eb0ff !important;
  font-weight: 900;
`;
const SecurityNote = styled.div`
  display: flex;
  align-items: center;
  gap: 11px;
  color: #6f8299;
  strong,
  span {
    display: block;
  }
  strong {
    color: #aab9ca;
    font-size: 0.7rem;
  }
  span {
    margin-top: 2px;
    font-size: 0.63rem;
  }
`;
const Shield = styled.span`
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  border: 1px solid rgba(34, 197, 94, 0.22);
  background: rgba(34, 197, 94, 0.08);
  color: #4ade80;
  font-weight: 900;
`;
const FormPanel = styled.div`
  display: grid;
  place-items: center;
  padding: 52px 54px;
  background: rgba(5, 13, 27, 0.94);
  @media (max-width: 600px) {
    padding: 38px 24px;
  }
  @media (max-width: 520px) {
    padding: 34px 20px;
    place-items: start center;
  }
`;
const FormWrap = styled.div`
  width: 100%;
  max-width: 410px;
`;
const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 42px;
  color: #7f93aa;
  font-size: 0.72rem;
  font-weight: 800;
  text-decoration: none;
  &:hover {
    color: #a9c7f5;
  }
`;
const FormEyebrow = styled.div`
  margin-bottom: 9px;
  color: #4d94ff;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.13em;
`;
const Title = styled.h1`
  margin: 0;
  color: #fff;
  font-size: clamp(1.9rem, 3vw, 2.5rem);
  line-height: 1.08;
  letter-spacing: -0.045em;
`;
const Subtitle = styled.p`
  margin: 12px 0 28px;
  color: #8295ac;
  font-size: 0.8rem;
  line-height: 1.65;
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 17px;
`;
const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const Label = styled.label`
  color: #b8c5d5;
  font-size: 0.7rem;
  font-weight: 800;
`;
const InputWrap = styled.div`
  position: relative;
`;
const FieldIcon = styled.span`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  color: #60748d;
  font-size: 0.78rem;
  font-weight: 900;
`;
const Input = styled.input`
  width: 100%;
  height: 50px;
  box-sizing: border-box;
  padding: 0 14px 0 40px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
  background: rgba(2, 10, 20, 0.75);
  color: #eef5fc;
  font: inherit;
  font-size: 0.8rem;
  outline: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background 160ms ease;
  &::placeholder {
    color: #53657b;
  }
  &:hover {
    border-color: rgba(148, 163, 184, 0.3);
  }
  &:focus {
    border-color: rgba(65, 133, 255, 0.78);
    background: rgba(4, 17, 31, 0.96);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.13);
  }
  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;
const Error = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 11px 13px;
  border: 1px solid rgba(248, 113, 113, 0.25);
  border-radius: 11px;
  background: rgba(239, 68, 68, 0.09);
  color: #fca5a5;
  font-size: 0.72rem;
  line-height: 1.45;
`;
const ErrorIcon = styled.span`
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: rgba(248, 113, 113, 0.16);
  font-weight: 900;
`;
const Submit = styled.button`
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #19d47e, #10b96c);
  color: #03160e;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(16, 185, 108, 0.17);
  transition:
    transform 160ms ease,
    box-shadow 160ms ease;
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 15px 34px rgba(16, 185, 108, 0.25);
  }
  &:disabled {
    opacity: 0.58;
    cursor: not-allowed;
    box-shadow: none;
  }
`;
const Arrow = styled.span`
  font-size: 1.05rem;
`;
const Spinner = styled.span`
  width: 15px;
  height: 15px;
  border: 2px solid rgba(3, 22, 14, 0.3);
  border-top-color: #03160e;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;
const HelpText = styled.p`
  margin: 24px 0 0;
  color: #6f829a;
  font-size: 0.72rem;
  text-align: center;
  a {
    margin-left: 4px;
    color: #7eafff;
    font-weight: 850;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
`;
const Privacy = styled.p`
  margin: 34px 0 0;
  padding-top: 19px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  color: #53657b;
  font-size: 0.64rem;
  line-height: 1.55;
  text-align: center;
`;
const Success = styled.div`
  animation: ${appear} 280ms ease both;
  text-align: center;
`;
const SuccessIcon = styled.div`
  width: 66px;
  height: 66px;
  display: grid;
  place-items: center;
  margin: 0 auto 24px;
  border: 1px solid rgba(34, 197, 94, 0.25);
  border-radius: 20px;
  background: linear-gradient(
    145deg,
    rgba(34, 197, 94, 0.16),
    rgba(16, 185, 108, 0.07)
  );
  color: #4ade80;
  font-size: 1.65rem;
  font-weight: 900;
  box-shadow: 0 16px 38px rgba(16, 185, 108, 0.1);
`;
const SuccessText = styled.p`
  margin: 16px 0 20px;
  color: #9badc2;
  font-size: 0.8rem;
  line-height: 1.65;
`;
const TipBox = styled.div`
  margin-bottom: 20px;
  padding: 13px 14px;
  border: 1px solid rgba(96, 165, 250, 0.14);
  border-radius: 11px;
  background: rgba(37, 99, 235, 0.06);
  color: #8298b1;
  font-size: 0.69rem;
  line-height: 1.55;
  text-align: left;
`;
const PrimaryLink = styled(Link)`
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 12px;
  background: linear-gradient(135deg, #19d47e, #10b96c);
  color: #03160e;
  font-size: 0.82rem;
  font-weight: 900;
  text-decoration: none;
`;
const Retry = styled.button`
  margin-top: 17px;
  padding: 5px;
  border: 0;
  background: transparent;
  color: #79aafa;
  font: inherit;
  font-size: 0.7rem;
  font-weight: 800;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
    color: #a1c5ff;
  }
`;
