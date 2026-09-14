import Head from 'next/head';
import Link from 'next/link';
import styled from 'styled-components';

export default function InstitutionalLayout({
  title,
  description,
  canonicalPath,
  children,
}) {
  const canonical = `https://tradesports.com.br${canonicalPath}`;

  return (
    <>
      <Head>
        <title>{title} | TradeSports</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta name="robots" content="index,follow,max-image-preview:large" />
      </Head>

      <Shell>
        <Header>
          <Link href="/" aria-label="Voltar para a página inicial">
            <Logo>TradeSports</Logo>
          </Link>
          <Nav>
            <Link href="/como-funciona">Como funciona</Link>
            <Link href="/planos">Planos</Link>
            <Link href="/contato">Contato</Link>
          </Nav>
        </Header>

        <Main>
          {children}
        </Main>
      </Shell>
    </>
  );
}

export const PageTitle = styled.h1`
  margin: 0 0 12px;
  color: #f8fafc;
  font-size: clamp(2rem, 4vw, 3.2rem);
  line-height: 1.05;
`;

export const Lead = styled.p`
  margin: 0 0 28px;
  max-width: 850px;
  color: #cbd5e1;
  font-size: 1.03rem;
  line-height: 1.75;
`;

export const Card = styled.section`
  margin: 18px 0;
  padding: 24px;
  border: 1px solid rgba(148,163,184,.16);
  border-radius: 18px;
  background: rgba(15,23,42,.72);

  h2 {
    margin: 0 0 12px;
    color: #f8fafc;
    font-size: 1.18rem;
  }

  p, li {
    color: #cbd5e1;
    line-height: 1.72;
  }

  a {
    color: #60a5fa;
    overflow-wrap: anywhere;
  }
`;

export const Note = styled.div`
  margin: 18px 0;
  padding: 16px 18px;
  border-left: 4px solid #00ff95;
  border-radius: 10px;
  background: rgba(0,255,149,.07);
  color: #dbeafe;
  line-height: 1.65;
`;

const Shell = styled.div`
  min-height: 100vh;
  background:
    radial-gradient(circle at 15% 0%, rgba(37,99,235,.16), transparent 34%),
    #07111f;
`;

const Header = styled.header`
  max-width: 1040px;
  margin: 0 auto;
  padding: 24px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;

  a { text-decoration: none; }

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const Logo = styled.strong`
  color: #00ff95;
  font-size: 1.25rem;
  letter-spacing: -.02em;
`;

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 18px;

  a {
    color: #cbd5e1;
    font-size: .92rem;
  }
`;

const Main = styled.main`
  max-width: 1040px;
  margin: 0 auto;
  padding: 44px 22px 72px;
`;
