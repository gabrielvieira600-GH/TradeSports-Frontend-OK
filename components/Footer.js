import Link from 'next/link';
import styled from 'styled-components';

export default function Footer() {
  return (
    <FooterShell>
      <Grid>
        <Column>
          <Title>TradeSports</Title>
          <Text>
            Plataforma de simulação econômica esportiva. O ambiente público atual
            utiliza unidades virtuais T$ e não oferece depósito, saque ou conversão
            em dinheiro real.
          </Text>
        </Column>

        <Column>
          <Title>Plataforma</Title>
          <FooterLink href="/como-funciona">Como funciona</FooterLink>
          <FooterLink href="/planos">Planos</FooterLink>
          <FooterLink href="/contato">Contato</FooterLink>
          <FooterLink href="/suporte">Suporte para usuários</FooterLink>
        </Column>

        <Column>
          <Title>Legal e privacidade</Title>
          <FooterLink href="/termos">Termos de Uso</FooterLink>
          <FooterLink href="/privacidade">Política de Privacidade</FooterLink>
          <FooterLink href="/cookies">Política de Cookies</FooterLink>
        </Column>

        <Column>
          <Title>Transparência</Title>
          <Text>
            T$ é uma unidade virtual da experiência TradeSports. Cotas virtuais
            não representam participação societária, investimento, aposta ou
            direito perante clubes e ligas.
          </Text>
        </Column>
      </Grid>

      <Bottom>
        <span>© {new Date().getFullYear()} TradeSports. Todos os direitos reservados.</span>
        <span>Ambiente de simulação · 18+</span>
      </Bottom>
    </FooterShell>
  );
}

const FooterShell = styled.footer`
  width: 100%;
  padding: 30px 22px 20px;
  border-top: 1px solid rgba(148,163,184,.12);
  background: #070d18;
  color: #cbd5e1;
`;

const Grid = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1.4fr;
  gap: 28px;

  @media (max-width: 850px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 540px) {
    grid-template-columns: 1fr;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Title = styled.div`
  margin-bottom: 4px;
  color: #f8fafc;
  font-size: .78rem;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
`;

const Text = styled.p`
  margin: 0;
  color: #94a3b8;
  font-size: .82rem;
  line-height: 1.65;
`;

const FooterLink = styled(Link)`
  width: fit-content;
  color: #cbd5e1;
  font-size: .83rem;
  text-decoration: none;

  &:hover {
    color: #00ff95;
  }
`;

const Bottom = styled.div`
  max-width: 1300px;
  margin: 24px auto 0;
  padding-top: 16px;
  border-top: 1px solid rgba(148,163,184,.1);
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 18px;
  color: #64748b;
  font-size: .76rem;
`;
