import { useContext, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled, { keyframes } from 'styled-components';
import { AuthContext } from '../contexts/AuthContexts';
import LiveMarketTable from '../components/LiveMarketTable';

const DESTAQUES = [
  'Mercado esportivo em tempo real',
  'Ordens e carteira em um só lugar',
  'Experiência 100% simulada em T$',
];

function rotaSegura(valor) {
  if (typeof valor !== 'string') return '/';
  if (!valor.startsWith('/') || valor.startsWith('//')) return '/';
  return valor;
}

export default function Login() {
  const [formData, setFormData] = useState({ identificador: '', senha: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const router = useRouter();
  const { login } = useContext(AuthContext);
  const API = process.env.NEXT_PUBLIC_API_URL;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((anterior) => ({ ...anterior, [name]: value }));
    if (erro) setErro('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (carregando) return;

    const identificador = formData.identificador.trim();
    if (!identificador || !formData.senha) {
      setErro('Preencha seu e-mail ou usuário e a sua senha.');
      return;
    }

    setErro('');
    setCarregando(true);

    try {
      const resposta = await axios.post(`${API}/api/login`, {
        identificador,
        senha: formData.senha,
      });

      if (!resposta.data?.usuario || !resposta.data?.token) {
        setErro('Não foi possível concluir o acesso. Tente novamente.');
        return;
      }

      login(resposta.data.usuario, resposta.data.token);
      await router.push(rotaSegura(router.query.next));
    } catch (err) {
      setErro(
        err.response?.data?.erro ||
          err.response?.data?.mensagem ||
          'Não foi possível entrar. Confira seus dados e tente novamente.'
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Page>
      <Glow $top />
      <Glow />

      <Shell>
        <BrandPanel>
          <BrandTop>
            <SimuladoBadge>
              <StatusDot /> Ambiente simulado
            </SimuladoBadge>
          </BrandTop>

          <BrandContent>
            <Eyebrow>Bem-vindo de volta</Eyebrow>
            <BrandTitle>
              O esporte muda a cada rodada.
              <Accent> Sua estratégia também.</Accent>
            </BrandTitle>
            <BrandText>
              Acompanhe o mercado, gerencie suas cotas e tome decisões com base
              no desempenho dos clubes.
            </BrandText>

            <FeatureList>
              {DESTAQUES.map((item) => (
                <Feature key={item}>
                  <Check aria-hidden="true">✓</Check>
                  {item}
                </Feature>
              ))}
            </FeatureList>
          </BrandContent>

          <LoginMarketTable variant="login" limit={3} />

          <BrandFooter>
            Informação, estratégia e esporte em uma experiência única.
          </BrandFooter>
        </BrandPanel>

        <FormPanel>
          <FormWrap>
            <FormEyebrow>ACESSO À PLATAFORMA</FormEyebrow>
            <Title>Entre na sua conta</Title>
            <Subtitle>
              Use seu e-mail ou nome de usuário para continuar.
            </Subtitle>

            <Form onSubmit={handleSubmit} noValidate>
              <Field>
                <Label htmlFor="identificador">E-mail ou nome de usuário</Label>
                <InputWrap>
                  <FieldIcon aria-hidden="true">@</FieldIcon>
                  <Input
                    id="identificador"
                    name="identificador"
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck="false"
                    placeholder="Digite seu e-mail ou usuário"
                    value={formData.identificador}
                    onChange={handleChange}
                    disabled={carregando}
                    aria-invalid={Boolean(erro)}
                    required
                  />
                </InputWrap>
              </Field>

              <Field>
                <FieldTop>
                  <Label htmlFor="senha">Senha</Label>
                  <Forgot href="/esqueci-senha">Esqueci minha senha</Forgot>
                </FieldTop>
                <InputWrap>
                  <FieldIcon aria-hidden="true">●</FieldIcon>
                  <Input
                    id="senha"
                    name="senha"
                    type={mostrarSenha ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Digite sua senha"
                    value={formData.senha}
                    onChange={handleChange}
                    disabled={carregando}
                    aria-invalid={Boolean(erro)}
                    required
                    $comAcao
                  />
                  <ShowPassword
                    type="button"
                    onClick={() => setMostrarSenha((valor) => !valor)}
                    disabled={carregando}
                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {mostrarSenha ? 'Ocultar' : 'Mostrar'}
                  </ShowPassword>
                </InputWrap>
              </Field>

              {erro && (
                <Error role="alert">
                  <ErrorIcon aria-hidden="true">!</ErrorIcon>
                  <span>{erro}</span>
                </Error>
              )}

              <Submit type="submit" disabled={carregando}>
                {carregando ? <><Spinner /> Entrando...</> : <>Entrar na TradeSports <Arrow>→</Arrow></>}
              </Submit>
            </Form>

            <Divider><span>ou</span></Divider>

            <RegisterText>
              Ainda não tem uma conta?
              <RegisterLink href="/cadastro">Criar conta gratuitamente</RegisterLink>
            </RegisterText>

            <Notice>
              <NoticeIcon aria-hidden="true">i</NoticeIcon>
              <span>
                A TradeSports utiliza moeda virtual T$. Não há depósitos,
                saques ou ganhos em dinheiro real.
              </span>
            </Notice>

            <Legal>
              Ao acessar, você concorda com os documentos apresentados no
              cadastro. <Link href="/como-funciona">Entenda como funciona</Link>.
            </Legal>
          </FormWrap>
        </FormPanel>
      </Shell>
    </Page>
  );
}

const pulse = keyframes`0%,100%{opacity:1}50%{opacity:.4}`;
const spin = keyframes`to{transform:rotate(360deg)}`;

const Page = styled.main`
  position: relative; min-height: calc(100vh - 64px); overflow: hidden;
  display: grid; place-items: center; padding: 38px 24px;
  color: #e5e7eb; background: #030712;
  @media (max-width: 900px) { padding: 24px 16px; }
  @media (max-width: 520px) { padding: 0; place-items: stretch; }
`;
const Glow = styled.div`
  position:absolute; right:-12%; bottom:-35%; width:620px; height:620px;
  border-radius:50%; pointer-events:none; filter:blur(16px);
  background:radial-gradient(circle,rgba(34,197,94,.1),transparent 67%);
  ${({$top})=>$top&&`right:auto;bottom:auto;left:-15%;top:-35%;background:radial-gradient(circle,rgba(37,99,235,.14),transparent 67%);`}
`;
const Shell = styled.section`
  position:relative; z-index:1; width:min(1120px,100%); min-height:690px;
  display:grid; grid-template-columns:1.02fr .98fr; overflow:hidden;
  border:1px solid rgba(148,163,184,.15); border-radius:28px;
  background:rgba(15,23,42,.86); box-shadow:0 30px 90px rgba(0,0,0,.45);
  @media(max-width:900px){grid-template-columns:1fr;min-height:auto;max-width:600px}
  @media(max-width:520px){border:0;border-radius:0;min-height:calc(100vh - 64px)}
`;
const BrandPanel=styled.div`
  position:relative; display:flex; flex-direction:column; padding:38px 42px 30px;
  overflow:hidden; background:linear-gradient(145deg,#071426 0%,#0b1f3a 54%,#07182a 100%);
  border-right:1px solid rgba(148,163,184,.12);
  &::after{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(rgba(96,165,250,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(96,165,250,.035) 1px,transparent 1px);background-size:38px 38px;mask-image:linear-gradient(to bottom,black,transparent 85%)}
  @media(max-width:900px){display:none}
`;
const BrandTop=styled.div`position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:16px`;
const Brand=styled(Link)`display:inline-flex;align-items:center;gap:10px;color:white;text-decoration:none`;
const MobileBrand=styled(Brand)`display:none;@media(max-width:900px){display:inline-flex;margin:28px 30px 0}@media(max-width:520px){margin:23px 22px 0}`;
const BrandMark=styled.span`position:relative;width:34px;height:34px;display:flex;align-items:flex-end;gap:3px;padding:8px 7px;border-radius:10px;background:linear-gradient(135deg,#2563eb,#16a34a);box-shadow:0 8px 24px rgba(37,99,235,.25)`;
const MarkBar=styled.i`display:block;width:5px;height:16px;border-radius:2px;background:#fff;transform:skew(-18deg);${({$small})=>$small&&'height:10px;opacity:.72;'}`;
const MarkArrow=styled.i`position:absolute;right:5px;top:1px;color:#fff;font-size:15px;font-style:normal;font-weight:900`;
const BrandName=styled.strong`font-size:1.12rem;letter-spacing:-.025em`;
const SimuladoBadge=styled.span`display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border:1px solid rgba(34,197,94,.2);border-radius:999px;background:rgba(34,197,94,.07);color:#86efac;font-size:.66rem;font-weight:850;text-transform:uppercase;letter-spacing:.06em`;
const StatusDot=styled.i`width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 10px #22c55e;animation:${pulse} 2s infinite`;
const BrandContent=styled.div`position:relative;z-index:1;margin:auto 0 25px`;
const Eyebrow=styled.div`margin-bottom:12px;color:#60a5fa;font-size:.72rem;font-weight:900;text-transform:uppercase;letter-spacing:.12em`;
const BrandTitle=styled.h1`max-width:500px;margin:0;color:#f8fafc;font-size:clamp(2.25rem,3.2vw,3.25rem);line-height:1.04;letter-spacing:-.048em`;
const Accent=styled.span`color:#4ade80`;
const BrandText=styled.p`max-width:480px;margin:20px 0 0;color:#94a3b8;font-size:.98rem;line-height:1.7`;
const FeatureList=styled.div`display:grid;gap:11px;margin-top:25px`;
const Feature=styled.div`display:flex;align-items:center;gap:10px;color:#cbd5e1;font-size:.8rem;font-weight:650`;
const Check=styled.span`width:20px;height:20px;display:grid;place-items:center;border-radius:50%;background:rgba(34,197,94,.12);color:#4ade80;font-size:.68rem`;
const LoginMarketTable=styled(LiveMarketTable)`position:relative;z-index:1;background:rgba(2,6,23,.38);backdrop-filter:blur(8px)`;
const BrandFooter=styled.div`position:relative;z-index:1;margin-top:18px;color:#475569;font-size:.64rem;text-align:center`;
const FormPanel=styled.div`display:flex;flex-direction:column;justify-content:center;padding:55px 58px;background:linear-gradient(155deg,rgba(15,23,42,.98),rgba(6,12,25,.98));@media(max-width:900px){padding:38px 55px 54px}@media(max-width:520px){padding:28px 22px 40px}`;
const FormWrap=styled.div`width:100%;max-width:430px;margin:auto`;
const FormEyebrow=styled.div`margin-bottom:8px;color:#60a5fa;font-size:.67rem;font-weight:900;letter-spacing:.12em`;
const Title=styled.h2`margin:0;color:#f8fafc;font-size:2rem;line-height:1.15;letter-spacing:-.035em;@media(max-width:520px){font-size:1.72rem}`;
const Subtitle=styled.p`margin:10px 0 28px;color:#64748b;font-size:.82rem;line-height:1.55`;
const Form=styled.form`display:grid;gap:18px`;
const Field=styled.div`display:grid;gap:7px`;
const FieldTop=styled.div`display:flex;align-items:center;justify-content:space-between;gap:15px`;
const Label=styled.label`color:#cbd5e1;font-size:.72rem;font-weight:800`;
const Forgot=styled(Link)`color:#60a5fa;font-size:.68rem;font-weight:750;text-decoration:none;&:hover{color:#93c5fd}`;
const InputWrap=styled.div`position:relative`;
const FieldIcon=styled.span`position:absolute;left:14px;top:50%;transform:translateY(-50%);width:19px;height:19px;display:grid;place-items:center;border-radius:6px;background:rgba(59,130,246,.1);color:#60a5fa;font-size:.65rem;font-weight:900;pointer-events:none`;
const Input=styled.input`width:100%;box-sizing:border-box;padding:13px ${({$comAcao})=>$comAcao?'80px':'14px'} 13px 43px;border:1px solid rgba(148,163,184,.16);border-radius:12px;outline:none;background:rgba(2,6,23,.55);color:#f8fafc;font-size:.82rem;transition:.2s;&::placeholder{color:#475569}&:hover{border-color:rgba(148,163,184,.27)}&:focus{border-color:rgba(59,130,246,.7);box-shadow:0 0 0 3px rgba(59,130,246,.1);background:rgba(2,6,23,.78)}&:disabled{opacity:.65;cursor:not-allowed}`;
const ShowPassword=styled.button`position:absolute;right:12px;top:50%;transform:translateY(-50%);padding:4px;border:0;background:transparent;color:#64748b;font-size:.63rem;font-weight:800;cursor:pointer;&:hover{color:#93c5fd}&:disabled{cursor:not-allowed}`;
const Error=styled.div`display:flex;align-items:flex-start;gap:9px;padding:11px 12px;border:1px solid rgba(239,68,68,.22);border-radius:10px;background:rgba(239,68,68,.07);color:#fca5a5;font-size:.71rem;line-height:1.45`;
const ErrorIcon=styled.span`width:17px;height:17px;display:grid;place-items:center;flex:0 0 auto;border-radius:50%;background:rgba(239,68,68,.18);font-size:.62rem;font-weight:900`;
const Submit=styled.button`min-height:48px;display:flex;align-items:center;justify-content:center;gap:9px;margin-top:2px;border:0;border-radius:12px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:white;font-size:.78rem;font-weight:900;cursor:pointer;box-shadow:0 12px 30px rgba(37,99,235,.22);transition:.2s;&:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 15px 34px rgba(37,99,235,.32)}&:disabled{opacity:.65;cursor:not-allowed}`;
const Arrow=styled.span`font-size:1.05rem`;
const Spinner=styled.span`width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:${spin} .7s linear infinite`;
const Divider=styled.div`display:flex;align-items:center;gap:12px;margin:22px 0;color:#475569;font-size:.65rem;&::before,&::after{content:'';height:1px;flex:1;background:rgba(148,163,184,.12)}`;
const RegisterText=styled.div`display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;color:#64748b;font-size:.73rem`;
const RegisterLink=styled(Link)`color:#4ade80;font-weight:850;text-decoration:none;&:hover{color:#86efac}`;
const Notice=styled.div`display:flex;align-items:flex-start;gap:10px;margin-top:25px;padding:12px;border:1px solid rgba(34,197,94,.13);border-radius:11px;background:rgba(34,197,94,.045);color:#94a3b8;font-size:.65rem;line-height:1.5`;
const NoticeIcon=styled.span`width:18px;height:18px;display:grid;place-items:center;flex:0 0 auto;border:1px solid rgba(74,222,128,.28);border-radius:50%;color:#4ade80;font-size:.62rem;font-weight:900`;
const Legal=styled.p`margin:16px 0 0;color:#475569;font-size:.61rem;line-height:1.5;text-align:center;a{color:#64748b;text-decoration:underline;text-underline-offset:2px;&:hover{color:#94a3b8}}`;
