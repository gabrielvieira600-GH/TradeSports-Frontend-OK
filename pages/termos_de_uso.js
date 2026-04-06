import Head from 'next/head';
import styled from 'styled-components';

const termos = `
TERMOS DE USO – TRADESPORTS
Versão: v1.0

Última atualização: [dd/mm/aaaa]

1. OBJETO
A TradeSports é uma plataforma de simulação econômica esportiva que permite aos usuários adquirir e negociar cotas virtuais vinculadas ao desempenho esportivo de clubes em campeonatos.

Cole aqui o restante completo do texto atual dos seus termos.
`;

export default function TermosDeUsoPage() {
  return (
    <>
      <Head>
        <title>Termos de Uso | TradeSports</title>
        <meta name="description" content="Termos de Uso da plataforma TradeSports" />
      </Head>

      <Container>
        <Header>
          <Title>Termos de Uso</Title>
          <Subtitle>TradeSports</Subtitle>
        </Header>

        <Content>
          {termos.split('\n').map((linha, index) => (
            <Paragraph key={index}>
              {linha.trim() === '' ? '\u00A0' : linha}
            </Paragraph>
          ))}
        </Content>
      </Container>
    </>
  );
}

const Container = styled.main`
  min-height: 100vh;
  padding: 32px 20px 48px;
  color: #e5e7eb;
  max-width: 960px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 28px;
`;

const Title = styled.h1`
  margin: 0 0 8px;
  font-size: 2rem;
  color: #fff;
`;

const Subtitle = styled.p`
  margin: 0;
  color: #94a3b8;
`;

const Content = styled.section`
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 16px;
  padding: 24px;
`;

const Paragraph = styled.p`
  margin: 0 0 12px;
  line-height: 1.7;
  white-space: pre-wrap;
  color: #e5e7eb;
`;