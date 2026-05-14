import styled from 'styled-components';
import { LeagueBadge } from '../components/ClubBadge';

export default function NFLOeste() {
  return (
    <Container>
      <Header>
        <LeagueBadge liga="nfl" size={46} />
        <div>
          <Title>NFL - Conferência Oeste</Title>
          <Subtitle>Mercado em desenvolvimento</Subtitle>
        </div>
      </Header>

      <Card>
        <p>
          A página da Conferência Oeste da NFL será disponibilizada em breve.
        </p>
      </Card>
    </Container>
  );
}

const Container = styled.div`
  padding: 0.2rem 0 1rem;
  color: white;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.55rem;
  color: #f8fafc;
`;

const Subtitle = styled.div`
  margin-top: 5px;
  color: #94a3b8;
  font-size: 0.85rem;
`;

const Card = styled.div`
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(15, 23, 42, 0.7);
  border-radius: 18px;
  padding: 18px;
  color: #cbd5e1;
`;