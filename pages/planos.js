import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import api from '../lib/api';
import withAuth from '../components/withAuth';

function PlanosPage() {
  const router = useRouter();

  const [planoAtual, setPlanoAtual] = useState('lite');
  const [carregandoPlano, setCarregandoPlano] = useState(true);

  async function carregarPlanoAtual() {
    try {
      setCarregandoPlano(true);

      const { data } = await api.get('/usuario/plano');

      const plano =
        data?.plano === 'premium' ||
        data?.planoEfetivo === 'premium'
          ? 'premium'
          : 'lite';

      setPlanoAtual(plano);
    } catch (err) {
      console.error('Erro ao carregar plano atual:', err);
      setPlanoAtual('lite');
    } finally {
      setCarregandoPlano(false);
    }
  }

  useEffect(() => {
    carregarPlanoAtual();
  }, []);

  const usuarioPremium = planoAtual === 'premium';

  return (
    <Container>
      <Cabecalho>
        <Eyebrow>Planos TradeSports</Eyebrow>

        <Titulo>
          Escolha como quer competir
        </Titulo>

        <Subtitulo>
          Todos começam com o plano Lite. O Premium libera recursos sociais,
          rankings privados e análises mais completas sem alterar as regras de
          mercado, preços ou rentabilidade.
        </Subtitulo>
      </Cabecalho>

      <ResumoAtual>
        <ResumoLabel>Seu plano atual</ResumoLabel>

        <ResumoValor $premium={usuarioPremium}>
          {carregandoPlano
            ? 'Carregando...'
            : usuarioPremium
            ? 'Premium'
            : 'Lite'}
        </ResumoValor>
      </ResumoAtual>

      <CardsGrid>
        <PlanoCard>
          <PlanoTopo>
            <PlanoNome>Lite</PlanoNome>

            <PlanoBadge>
              Gratuito
            </PlanoBadge>
          </PlanoTopo>

          <PrecoArea>
            <Preco>R$ 0</Preco>
            <Periodo>/mês</Periodo>
          </PrecoArea>

          <Descricao>
            Para começar a negociar cotas, acompanhar sua carteira e competir
            no ranking geral da TradeSports.
          </Descricao>

          <ListaBeneficios>
            <Beneficio>
              <Check>✓</Check>
              <span>Acesso ao mercado simulado</span>
            </Beneficio>

            <Beneficio>
              <Check>✓</Check>
              <span>Saldo inicial em T$ para negociar</span>
            </Beneficio>

            <Beneficio>
              <Check>✓</Check>
              <span>Compra e venda de cotas dos clubes</span>
            </Beneficio>

            <Beneficio>
              <Check>✓</Check>
              <span>Carteira, extrato e histórico de transações</span>
            </Beneficio>

            <Beneficio>
              <Check>✓</Check>
              <span>Ranking geral e ranking Lite</span>
            </Beneficio>

            <Beneficio>
              <Check>✓</Check>
              <span>Perfil público com rentabilidade e patrimônio</span>
            </Beneficio>

            <Beneficio>
              <Check>✓</Check>
              <span>Seguir outros usuários</span>
            </Beneficio>

            <Beneficio $muted>
              <Block>×</Block>
              <span>Sem acesso às posições detalhadas de outros usuários</span>
            </Beneficio>

            <Beneficio $muted>
              <Block>×</Block>
              <span>Sem criação ou participação em rankings privados</span>
            </Beneficio>

            <Beneficio $muted>
              <Block>×</Block>
              <span>Limite de ordens por rodada esportiva</span>
            </Beneficio>
          </ListaBeneficios>

          <BotaoLite
            type="button"
            disabled
          >
            {usuarioPremium ? 'Plano inferior' : 'Plano atual'}
          </BotaoLite>
        </PlanoCard>

        <PlanoCard $destaque>
          <DestaqueFaixa>
            Mais completo
          </DestaqueFaixa>

          <PlanoTopo>
            <PlanoNome>Premium</PlanoNome>

            
          </PlanoTopo>

          <PrecoArea>
            <Preco>R$ 19,90</Preco>
            <Periodo>/mês</Periodo>
          </PrecoArea>

          <Descricao>
            Para quem quer competir em ligas privadas, analisar carteiras de
            outros usuários e ter uma experiência social completa.
          </Descricao>

          <ListaBeneficios>
            <Beneficio>
              <Check>✓</Check>
              <span>Tudo do plano Lite</span>
            </Beneficio>

            <Beneficio>
              <Check>✓</Check>
              <span>Acesso ao ranking Premium</span>
            </Beneficio>

            <Beneficio>
              <Check>✓</Check>
              <span>Criar rankings privados</span>
            </Beneficio>

            <Beneficio>
              <Check>✓</Check>
              <span>Participar de rankings privados por convite</span>
            </Beneficio>

            <Beneficio>
              <Check>✓</Check>
              <span>Convidar usuários Premium para ligas privadas</span>
            </Beneficio>

            <Beneficio>
              <Check>✓</Check>
              <span>Ver posições detalhadas de outros usuários</span>
            </Beneficio>

            <Beneficio>
              <Check>✓</Check>
              <span>Análise de carteiras públicas</span>
            </Beneficio>

            <Beneficio>
              <Check>✓</Check>
              <span>Ordens ilimitadas</span>
            </Beneficio>

            <Beneficio>
              <Check>✓</Check>
              <span>Recursos sociais avançados da Comunidade</span>
            </Beneficio>

            <Beneficio>
              <Check>✓</Check>
              <span>Novas funcionalidades Premium primeiro</span>
            </Beneficio>
          </ListaBeneficios>

          <BotaoPremium
            type="button"
            disabled={usuarioPremium}
            onClick={() => router.push('/checkout/premium')}
          >
            {usuarioPremium ? 'Plano atual' : 'Fazer upgrade'}
          </BotaoPremium>
        </PlanoCard>
      </CardsGrid>

      <Observacao>
        O plano Premium não altera preços, rentabilidade, cotação dos clubes ou
        regras econômicas do mercado. A vantagem Premium está em recursos
        sociais, análises e competições privadas.
      </Observacao>
    </Container>
  );
}

export default withAuth(PlanosPage);

const Container = styled.div`
  width: 100%;
  padding: 0.2rem 0 2rem;
  color: #f8fafc;

  @media (max-width: 640px) {
    padding: 0 0 1rem;
  }
`;

const Cabecalho = styled.header`
  margin-bottom: 18px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);

  @media (max-width: 640px) {
    margin-bottom: 12px;
    padding-bottom: 12px;
  }
`;

const Eyebrow = styled.div`
  margin-bottom: 7px;
  color: #60a5fa;
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;

  @media (max-width: 640px) {
    font-size: 0.66rem;
  }
`;

const Titulo = styled.h1`
  margin: 0;
  color: #f8fafc;
  font-size: 2rem;
  line-height: 1.1;

  @media (max-width: 640px) {
    font-size: 1.35rem;
  }
`;

const Subtitulo = styled.p`
  margin: 10px 0 0;
  max-width: 820px;
  color: #94a3b8;
  font-size: 0.95rem;
  line-height: 1.55;

  @media (max-width: 640px) {
    margin-top: 8px;
    font-size: 0.78rem;
    line-height: 1.45;
  }
`;

const ResumoAtual = styled.div`
  margin-bottom: 18px;
  width: fit-content;
  min-width: 180px;
  padding: 13px 15px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.66);

  @media (max-width: 640px) {
    margin-bottom: 12px;
    min-width: 0;
    width: 100%;
    padding: 11px 12px;
    border-radius: 13px;
  }
`;

const ResumoLabel = styled.div`
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;

  @media (max-width: 640px) {
    font-size: 0.62rem;
  }
`;

const ResumoValor = styled.strong`
  display: block;
  margin-top: 5px;
  color: ${({ $premium }) => ($premium ? '#fde68a' : '#86efac')};
  font-size: 1.2rem;

  @media (max-width: 640px) {
    font-size: 1rem;
  }
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  align-items: stretch;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 640px) {
    gap: 12px;
  }
`;

const PlanoCard = styled.article`
  position: relative;
  overflow: hidden;

  padding: 22px;
  border-radius: 24px;

  border: 1px solid
    ${({ $destaque }) =>
      $destaque
        ? 'rgba(250, 204, 21, 0.28)'
        : 'rgba(148, 163, 184, 0.14)'};

  background: ${({ $destaque }) =>
    $destaque
      ? `
        radial-gradient(circle at top right, rgba(250, 204, 21, 0.14), transparent 36%),
        radial-gradient(circle at top left, rgba(59, 130, 246, 0.12), transparent 34%),
        rgba(15, 23, 42, 0.76)
      `
      : `
        radial-gradient(circle at top left, rgba(59, 130, 246, 0.1), transparent 34%),
        rgba(15, 23, 42, 0.66)
      `};

  box-shadow: ${({ $destaque }) =>
    $destaque
      ? '0 22px 70px rgba(250, 204, 21, 0.08)'
      : 'none'};

  @media (max-width: 640px) {
    padding: 15px;
    border-radius: 18px;
  }
`;

const DestaqueFaixa = styled.div`
  position: absolute;
  top: 15px;
  right: -38px;
  width: 150px;
  padding: 6px 0;

  transform: rotate(38deg);

  background: rgba(250, 204, 21, 0.18);
  color: #fde68a;
  border: 1px solid rgba(250, 204, 21, 0.22);

  text-align: center;
  font-size: 0.63rem;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  @media (max-width: 640px) {
    top: 12px;
    right: -43px;
    width: 150px;
    font-size: 0.55rem;
  }
`;

const PlanoTopo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const PlanoNome = styled.h2`
  margin: 0;
  color: #f8fafc;
  font-size: 1.45rem;

  @media (max-width: 640px) {
    font-size: 1.12rem;
  }
`;

const PlanoBadge = styled.span`
  width: fit-content;
  padding: 6px 9px;
  border-radius: 999px;

  background: ${({ $premium }) =>
    $premium
      ? 'rgba(250, 204, 21, 0.13)'
      : 'rgba(34, 197, 94, 0.1)'};

  color: ${({ $premium }) =>
    $premium ? '#fde68a' : '#86efac'};

  border: 1px solid
    ${({ $premium }) =>
      $premium
        ? 'rgba(250, 204, 21, 0.22)'
        : 'rgba(34, 197, 94, 0.18)'};

  font-size: 0.7rem;
  font-weight: 950;
  text-transform: uppercase;

  @media (max-width: 640px) {
    padding: 4px 7px;
    font-size: 0.58rem;
  }
`;

const PrecoArea = styled.div`
  margin-top: 18px;
  display: flex;
  align-items: flex-end;
  gap: 6px;

  @media (max-width: 640px) {
    margin-top: 12px;
  }
`;

const Preco = styled.strong`
  color: #f8fafc;
  font-size: 2.3rem;
  line-height: 1;

  @media (max-width: 640px) {
    font-size: 1.6rem;
  }
`;

const Periodo = styled.span`
  padding-bottom: 3px;
  color: #94a3b8;
  font-size: 0.9rem;

  @media (max-width: 640px) {
    font-size: 0.72rem;
  }
`;

const Descricao = styled.p`
  margin: 14px 0 18px;
  color: #cbd5e1;
  font-size: 0.92rem;
  line-height: 1.52;

  @media (max-width: 640px) {
    margin: 10px 0 12px;
    font-size: 0.75rem;
    line-height: 1.4;
  }
`;

const ListaBeneficios = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 22px;

  @media (max-width: 640px) {
    gap: 7px;
    margin-bottom: 15px;
  }
`;

const Beneficio = styled.div`
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: 8px;
  align-items: flex-start;

  color: ${({ $muted }) => ($muted ? '#64748b' : '#e5e7eb')};
  font-size: 0.88rem;
  line-height: 1.35;

  @media (max-width: 640px) {
    grid-template-columns: 18px 1fr;
    gap: 6px;
    font-size: 0.72rem;
  }
`;

const Check = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 999px;

  display: grid;
  place-items: center;

  background: rgba(34, 197, 94, 0.11);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.18);

  font-size: 0.72rem;
  font-weight: 950;

  @media (max-width: 640px) {
    width: 18px;
    height: 18px;
    font-size: 0.58rem;
  }
`;

const Block = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 999px;

  display: grid;
  place-items: center;

  background: rgba(148, 163, 184, 0.08);
  color: #64748b;
  border: 1px solid rgba(148, 163, 184, 0.14);

  font-size: 0.72rem;
  font-weight: 950;

  @media (max-width: 640px) {
    width: 18px;
    height: 18px;
    font-size: 0.58rem;
  }
`;

const BotaoLite = styled.button`
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 13px;
  padding: 12px 15px;

  background: rgba(255, 255, 255, 0.045);
  color: #cbd5e1;
  font-weight: 950;
  cursor: default;

  &:disabled {
    opacity: 0.75;
  }

  @media (max-width: 640px) {
    padding: 10px 12px;
    border-radius: 11px;
    font-size: 0.78rem;
  }
`;

const BotaoPremium = styled.button`
  width: 100%;
  border: 1px solid rgba(250, 204, 21, 0.32);
  border-radius: 13px;
  padding: 12px 15px;

  background: rgba(250, 204, 21, 0.16);
  color: #fde68a;
  font-weight: 950;
  cursor: pointer;

  &:hover {
    background: rgba(250, 204, 21, 0.24);
  }

  &:disabled {
    opacity: 0.75;
    cursor: default;
  }

  @media (max-width: 640px) {
    padding: 10px 12px;
    border-radius: 11px;
    font-size: 0.78rem;
  }
`;

const Observacao = styled.div`
  margin-top: 18px;
  padding: 14px 16px;

  border: 1px solid rgba(59, 130, 246, 0.16);
  border-radius: 16px;

  background: rgba(59, 130, 246, 0.07);
  color: #bfdbfe;

  font-size: 0.85rem;
  line-height: 1.5;

  @media (max-width: 640px) {
    margin-top: 12px;
    padding: 11px 12px;
    border-radius: 13px;
    font-size: 0.72rem;
    line-height: 1.4;
  }
`;