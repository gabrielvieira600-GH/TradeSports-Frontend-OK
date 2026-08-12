import { useRouter } from 'next/router';
import styled from 'styled-components';
import { FiArrowLeft, FiShield } from 'react-icons/fi';
import withAuth from '../components/withAuth';

function SaqueIndisponivel() {
  const router = useRouter();
  return (
    <Page>
      <Card>
        <Icon><FiShield /></Icon>
        <span>Ambiente totalmente simulado</span>
        <h1>T$ não pode ser sacado</h1>
        <p>
          O saldo TradeSports é uma unidade virtual fechada, sem conversão para reais,
          transferência entre usuários, prêmio econômico ou uso fora da plataforma.
        </p>
        <button type="button" onClick={() => router.push('/carteira')}><FiArrowLeft /> Voltar para a carteira</button>
      </Card>
    </Page>
  );
}

export default withAuth(SaqueIndisponivel);

const Page = styled.main`min-height:65vh;display:grid;place-items:center;padding:32px 18px;color:#eef4fa;`;
const Card = styled.section`width:min(100%,620px);padding:36px;border-radius:24px;text-align:center;background:linear-gradient(150deg,#0d1a27,#07111b);border:1px solid rgba(77,226,139,.16);box-shadow:0 24px 60px rgba(0,0,0,.28);>span{display:block;color:#4de28b;text-transform:uppercase;letter-spacing:.13em;font-size:.72rem;font-weight:800}h1{margin:12px 0;font-size:clamp(2rem,6vw,3rem)}p{margin:0 auto 24px;max-width:500px;color:#95a8bb;line-height:1.7}button{display:inline-flex;align-items:center;gap:8px;border:0;border-radius:12px;padding:13px 18px;background:#4de28b;color:#04120a;font-weight:900;cursor:pointer}`;
const Icon = styled.div`width:58px;height:58px;margin:0 auto 18px;border-radius:18px;display:grid;place-items:center;background:rgba(77,226,139,.1);color:#4de28b;font-size:1.7rem;`;
