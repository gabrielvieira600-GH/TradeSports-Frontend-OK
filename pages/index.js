import Link from "next/link";
import styled, { keyframes } from "styled-components";
import {
  FiArrowRight,
  FiBarChart2,
  FiBookOpen,
  FiCheck,
  FiChevronRight,
  FiClock,
  FiLayers,
  FiPieChart,
  FiShield,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from "react-icons/fi";

const CLUBES = [
  {
    sigla: "FLA",
    nome: "Flamengo",
    posicao: "1º",
    preco: "T$ 12,38",
    variacao: "+8,4%",
    cor: "#e11d48",
  },
  {
    sigla: "PAL",
    nome: "Palmeiras",
    posicao: "2º",
    preco: "T$ 11,79",
    variacao: "+5,2%",
    cor: "#16a34a",
  },
  {
    sigla: "BOT",
    nome: "Botafogo",
    posicao: "4º",
    preco: "T$ 10,69",
    variacao: "+2,7%",
    cor: "#f8fafc",
  },
  {
    sigla: "BAH",
    nome: "Bahia",
    posicao: "6º",
    preco: "T$ 9,70",
    variacao: "-1,1%",
    cor: "#2563eb",
    negativo: true,
  },
];

const PASSOS = [
  {
    numero: "01",
    titulo: "Escolha sua tese",
    texto:
      "Analise a tabela, o momento dos clubes e o preço antes de definir sua estratégia.",
  },
  {
    numero: "02",
    titulo: "Monte sua carteira",
    texto:
      "Compre cotas no IPO ou negocie com outros usuários pelo livro de ofertas.",
  },
  {
    numero: "03",
    titulo: "Acompanhe cada rodada",
    texto:
      "Veja o mercado reagir e ajuste suas posições conforme o campeonato evolui.",
  },
  {
    numero: "04",
    titulo: "Construa seu resultado",
    texto:
      "Gerencie risco, realize estratégias e acompanhe tudo em um extrato transparente.",
  },
];

const DIFERENCIAIS = [
  {
    icon: <FiTarget />,
    titulo: "Desempenho real",
    texto:
      "A classificação dos clubes orienta o preço de referência a cada rodada.",
  },
  {
    icon: <FiLayers />,
    titulo: "Livro de ofertas",
    texto:
      "Ordens de compra e venda, melhor bid, melhor ask e execuções parciais.",
  },
  {
    icon: <FiPieChart />,
    titulo: "Carteira completa",
    texto: "Preço médio, posição, valorização e histórico em uma única visão.",
  },
  {
    icon: <FiUsers />,
    titulo: "Comunidade",
    texto:
      "Perfis, feed e conexões para compartilhar leituras sobre o campeonato.",
  },
  {
    icon: <FiShield />,
    titulo: "Regras transparentes",
    texto:
      "Taxas, movimentações e critérios apresentados antes de cada decisão.",
  },
  {
    icon: <FiZap />,
    titulo: "Estratégia contínua",
    texto:
      "Não basta acertar um placar: o desafio acompanha a temporada inteira.",
  },
];

export default function Home() {
  return (
    <Page>
      <Glow $top />
      <Glow />

      <Hero>
        <HeroCopy>
          <Eyebrow>
            <LiveDot /> O futebol virou mercado
          </Eyebrow>
          <HeroTitle>
            Sua leitura do jogo.
            <br />
            <GradientText>Agora em movimento.</GradientText>
          </HeroTitle>
          <HeroText>
            Negocie cotas virtuais de clubes, monte sua carteira e transforme
            cada rodada em uma nova decisão estratégica.
          </HeroText>

          <HeroActions>
            <PrimaryLink href="/cadastro">
              Começar agora <FiArrowRight />
            </PrimaryLink>
            <SecondaryLink href="/como-funciona">
              <FiBookOpen /> Entenda a TradeSports
            </SecondaryLink>
          </HeroActions>

          <TrustRow>
            <TrustItem>
              <FiCheck /> Ambiente de simulação
            </TrustItem>
            <TrustItem>
              <FiCheck /> Valores em T$
            </TrustItem>
            <TrustItem>
              <FiCheck /> Estratégia, não sorte
            </TrustItem>
          </TrustRow>
        </HeroCopy>

        <MarketScene aria-label="Prévia ilustrativa do mercado TradeSports">
          <SceneGlow />
          <MarketCard>
            <MarketHeader>
              <div>
                <MarketLabel>Mercado ao vivo</MarketLabel>
                <MarketTitle>Campeonato Brasileiro</MarketTitle>
              </div>
              <MarketStatus>
                <StatusDot /> Mercado aberto
              </MarketStatus>
            </MarketHeader>

            <TickerHead>
              <span>Clube</span>
              <span>Pos.</span>
              <span>Último preço</span>
              <span>24h</span>
            </TickerHead>

            <TickerList>
              {CLUBES.map((clube, index) => (
                <TickerRow key={clube.sigla} $delay={index}>
                  <ClubInfo>
                    <ClubMark $cor={clube.cor}>
                      {clube.sigla.slice(0, 1)}
                    </ClubMark>
                    <div>
                      <strong>{clube.nome}</strong>
                      <small>{clube.sigla}</small>
                    </div>
                  </ClubInfo>
                  <Position>{clube.posicao}</Position>
                  <Price>{clube.preco}</Price>
                  <Variation $negativo={clube.negativo}>
                    {clube.variacao}
                  </Variation>
                </TickerRow>
              ))}
            </TickerList>

            <ChartArea>
              <ChartTop>
                <div>
                  <span>Índice TradeSports</span>
                  <strong>1.284,62 pts</strong>
                </div>
                <ChartBadge>
                  <FiTrendingUp /> +6,42%
                </ChartBadge>
              </ChartTop>
              <Chart>
                <ChartGrid />
                <svg
                  viewBox="0 0 600 150"
                  role="img"
                  aria-label="Gráfico ilustrativo de valorização"
                >
                  <defs>
                    <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity=".35" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,124 C44,121 58,94 99,102 C139,111 154,83 195,89 C241,95 250,53 294,69 C339,85 354,40 397,50 C442,61 463,22 507,35 C545,45 563,13 600,18 L600,150 L0,150 Z"
                    fill="url(#area)"
                  />
                  <path
                    d="M0,124 C44,121 58,94 99,102 C139,111 154,83 195,89 C241,95 250,53 294,69 C339,85 354,40 397,50 C442,61 463,22 507,35 C545,45 563,13 600,18"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </Chart>
            </ChartArea>
          </MarketCard>

          <FloatingCard $left>
            <FloatIcon>
              <FiBarChart2 />
            </FloatIcon>
            <div>
              <small>Melhor oportunidade</small>
              <strong>+12,8% na rodada</strong>
            </div>
          </FloatingCard>
          <FloatingCard>
            <FloatIcon $blue>
              <FiClock />
            </FloatIcon>
            <div>
              <small>Próxima atualização</small>
              <strong>Após o fim da rodada</strong>
            </div>
          </FloatingCard>
        </MarketScene>
      </Hero>

      <ProofBar>
        <ProofIntro>UMA EXPERIÊNCIA QUE UNE</ProofIntro>
        <ProofItem>
          <strong>Futebol</strong>
          <span>paixão em cada rodada</span>
        </ProofItem>
        <ProofDivider />
        <ProofItem>
          <strong>Mercado</strong>
          <span>oferta e demanda reais</span>
        </ProofItem>
        <ProofDivider />
        <ProofItem>
          <strong>Estratégia</strong>
          <span>decisões que constroem resultado</span>
        </ProofItem>
      </ProofBar>

      <Section>
        <SectionHeader>
          <SectionEyebrow>Um novo jeito de acompanhar futebol</SectionEyebrow>
          <SectionTitle>
            Você não assiste apenas à tabela.
            <br />
            <span>Você se posiciona nela.</span>
          </SectionTitle>
          <SectionText>
            A TradeSports conecta o desempenho esportivo a uma dinâmica de
            mercado. Cada escolha tem contexto, preço e consequência.
          </SectionText>
        </SectionHeader>

        <FeatureGrid>
          {DIFERENCIAIS.map((item, index) => (
            <FeatureCard
              key={item.titulo}
              $featured={index === 0 || index === 3}
            >
              <FeatureIcon>{item.icon}</FeatureIcon>
              <h3>{item.titulo}</h3>
              <p>{item.texto}</p>
              <FeatureLine />
            </FeatureCard>
          ))}
        </FeatureGrid>
      </Section>

      <DarkSection>
        <Section $compact>
          <SplitHeader>
            <div>
              <SectionEyebrow>Da análise à execução</SectionEyebrow>
              <SectionTitle>
                Uma temporada.
                <br />
                <span>Quatro movimentos.</span>
              </SectionTitle>
            </div>
            <SectionText>
              Comece em poucos minutos. A profundidade aparece conforme você
              acompanha o campeonato, entende o mercado e aprimora suas
              decisões.
            </SectionText>
          </SplitHeader>

          <StepsGrid>
            {PASSOS.map((passo, index) => (
              <StepCard key={passo.numero}>
                <StepTop>
                  <StepNumber>{passo.numero}</StepNumber>
                  {index < PASSOS.length - 1 && (
                    <StepArrow>
                      <FiChevronRight />
                    </StepArrow>
                  )}
                </StepTop>
                <h3>{passo.titulo}</h3>
                <p>{passo.texto}</p>
              </StepCard>
            ))}
          </StepsGrid>

          <HowLink href="/como-funciona">
            Conheça todas as regras, taxas e etapas <FiArrowRight />
          </HowLink>
        </Section>
      </DarkSection>

      <Section>
        <StrategyPanel>
          <StrategyCopy>
            <SectionEyebrow>Mais que um palpite</SectionEyebrow>
            <SectionTitle>
              O campeonato muda.
              <br />
              <span>Sua estratégia também.</span>
            </SectionTitle>
            <SectionText>
              Diversifique a carteira, acompanhe o preço médio, observe o livro
              de ofertas e escolha a hora de entrar, manter ou sair.
            </SectionText>
            <StrategyList>
              <li>
                <CheckIcon>
                  <FiCheck />
                </CheckIcon>
                <div>
                  <strong>Leia o cenário</strong>
                  <span>
                    Classificação, momento e expectativa em uma só análise.
                  </span>
                </div>
              </li>
              <li>
                <CheckIcon>
                  <FiCheck />
                </CheckIcon>
                <div>
                  <strong>Gerencie posições</strong>
                  <span>
                    Acompanhe cada clube e o impacto total na carteira.
                  </span>
                </div>
              </li>
              <li>
                <CheckIcon>
                  <FiCheck />
                </CheckIcon>
                <div>
                  <strong>Decida com clareza</strong>
                  <span>Histórico, taxas e movimentações sempre visíveis.</span>
                </div>
              </li>
            </StrategyList>
          </StrategyCopy>

          <PortfolioCard>
            <PortfolioHeader>
              <div>
                <span>Minha carteira</span>
                <strong>T$ 8.642,90</strong>
              </div>
              <PortfolioChange>+ T$ 684,12</PortfolioChange>
            </PortfolioHeader>
            <DonutWrap>
              <Donut>
                <DonutCenter>
                  <small>Rentabilidade</small>
                  <strong>+8,59%</strong>
                </DonutCenter>
              </Donut>
              <Legend>
                <LegendItem $color="#3b82f6">
                  <span>Flamengo</span>
                  <strong>38%</strong>
                </LegendItem>
                <LegendItem $color="#22c55e">
                  <span>Palmeiras</span>
                  <strong>27%</strong>
                </LegendItem>
                <LegendItem $color="#a78bfa">
                  <span>Botafogo</span>
                  <strong>21%</strong>
                </LegendItem>
                <LegendItem $color="#f59e0b">
                  <span>Outros</span>
                  <strong>14%</strong>
                </LegendItem>
              </Legend>
            </DonutWrap>
            <PortfolioFoot>
              <span>Resultado ilustrativo em moeda virtual T$.</span>
              <FiPieChart />
            </PortfolioFoot>
          </PortfolioCard>
        </StrategyPanel>
      </Section>

      <Transparency>
        <TransparencyIcon>
          <FiShield />
        </TransparencyIcon>
        <div>
          <SectionEyebrow>Transparência desde o primeiro clique</SectionEyebrow>
          <TransparencyTitle>Simulação com regras claras.</TransparencyTitle>
          <TransparencyText>
            A TradeSports utiliza moeda virtual T$. Não é uma casa de apostas,
            não vende promessa de rentabilidade e deixa taxas e critérios
            acessíveis.
          </TransparencyText>
        </div>
        <TextLink href="/como-funciona">
          Ver regras da plataforma <FiArrowRight />
        </TextLink>
      </Transparency>

      <FinalCta>
        <CtaGlow />
        <CtaContent>
          <CtaEyebrow>O próximo movimento é seu</CtaEyebrow>
          <CtaTitle>Veja o futebol com olhos de mercado.</CtaTitle>
          <CtaText>
            Crie sua conta, explore os clubes e comece a construir sua
            estratégia.
          </CtaText>
          <CtaActions>
            <PrimaryLink href="/cadastro">
              Criar minha conta <FiArrowRight />
            </PrimaryLink>
            <CtaLogin>
              Já tem uma conta? <Link href="/login">Entrar</Link>
            </CtaLogin>
          </CtaActions>
        </CtaContent>
      </FinalCta>

      <LegalNote>
        TradeSports é uma plataforma de simulação econômica esportiva. Todos os
        valores exibidos são fictícios e representados em T$.
      </LegalNote>
    </Page>
  );
}

const float = keyframes`0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}`;
const pulse = keyframes`0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(34,197,94,.4)}50%{opacity:.75;box-shadow:0 0 0 7px rgba(34,197,94,0)}`;
const rise = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;

const Page = styled.main`
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  color: #f8fafc;
  background: linear-gradient(
    180deg,
    #07101f 0%,
    #091426 18%,
    #070f1d 55%,
    #08111f 100%
  );
  isolation: isolate;
  * {
    box-sizing: border-box;
  }
`;
const Glow = styled.div`
  position: absolute;
  z-index: -1;
  width: 680px;
  height: 680px;
  right: -370px;
  top: 38%;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.07);
  filter: blur(80px);
  pointer-events: none;
  ${({ $top }) =>
    $top && `top:-330px;right:auto;left:18%;background:rgba(37,99,235,.16);`}
`;
const Hero = styled.section`
  width: min(1380px, calc(100% - 48px));
  min-height: 700px;
  margin: 0 auto;
  padding: 88px 0 100px;
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(520px, 1.1fr);
  gap: 68px;
  align-items: center;
  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
    min-height: auto;
    padding-top: 66px;
    gap: 70px;
  }
  @media (max-width: 640px) {
    width: min(100% - 28px, 1380px);
    padding: 50px 0 76px;
    gap: 54px;
  }
`;
const HeroCopy = styled.div`
  position: relative;
  z-index: 2;
  max-width: 650px;
  animation: ${rise} 0.65s ease both;
  @media (max-width: 1100px) {
    max-width: 760px;
  }
`;
const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 24px;
  padding: 8px 12px;
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.07);
  color: #86efac;
  font-size: 0.71rem;
  font-weight: 900;
  letter-spacing: 0.11em;
  text-transform: uppercase;
`;
const LiveDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  animation: ${pulse} 2s infinite;
`;
const HeroTitle = styled.h1`
  margin: 0;
  color: #fff;
  font-size: clamp(3.2rem, 5.7vw, 6.2rem);
  font-weight: 900;
  line-height: 0.96;
  letter-spacing: -0.065em;
  @media (max-width: 640px) {
    font-size: clamp(2.8rem, 14vw, 4.4rem);
    line-height: 0.98;
  }
`;
const GradientText = styled.span`
  background: linear-gradient(110deg, #60a5fa 5%, #67e8f9 47%, #4ade80 93%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;
const HeroText = styled.p`
  max-width: 590px;
  margin: 28px 0 0;
  color: #aab8cd;
  font-size: clamp(1.02rem, 1.3vw, 1.2rem);
  line-height: 1.72;
`;
const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 34px;
`;
const PrimaryLink = styled(Link)`
  min-height: 52px;
  padding: 0 22px;
  border-radius: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  box-shadow: 0 12px 32px rgba(22, 163, 74, 0.22);
  color: #fff;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 900;
  transition: 0.2s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 38px rgba(22, 163, 74, 0.3);
    filter: brightness(1.06);
  }
  svg {
    font-size: 1.05rem;
  }
`;
const SecondaryLink = styled(Link)`
  min-height: 52px;
  padding: 0 19px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.035);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: #dbeafe;
  text-decoration: none;
  font-size: 0.87rem;
  font-weight: 800;
  transition: 0.2s ease;
  &:hover {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(96, 165, 250, 0.35);
    color: #fff;
  }
`;
const TrustRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 17px 24px;
  margin-top: 25px;
`;
const TrustItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #718198;
  font-size: 0.72rem;
  font-weight: 700;
  svg {
    color: #4ade80;
  }
`;
const MarketScene = styled.div`
  position: relative;
  min-height: 560px;
  display: flex;
  align-items: center;
  justify-content: center;
  @media (max-width: 640px) {
    min-height: 510px;
  }
`;
const SceneGlow = styled.div`
  position: absolute;
  inset: 7% 4%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.25), transparent 68%);
  filter: blur(25px);
`;
const MarketCard = styled.div`
  position: relative;
  width: 100%;
  max-width: 680px;
  padding: 22px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 25px;
  background: linear-gradient(
    145deg,
    rgba(15, 28, 50, 0.96),
    rgba(7, 15, 29, 0.98)
  );
  box-shadow:
    0 40px 100px rgba(0, 0, 0, 0.46),
    inset 0 1px rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  @media (max-width: 640px) {
    padding: 14px;
    border-radius: 19px;
  }
`;
const MarketHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 3px 2px 19px;
`;
const MarketLabel = styled.div`
  margin-bottom: 5px;
  color: #64748b;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.09em;
`;
const MarketTitle = styled.strong`
  font-size: 1rem;
  color: #f8fafc;
`;
const MarketStatus = styled.span`
  display: flex;
  align-items: center;
  gap: 7px;
  color: #86efac;
  font-size: 0.68rem;
  font-weight: 800;
  white-space: nowrap;
`;
const StatusDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 10px #22c55e;
`;
const TickerHead = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 0.42fr 0.7fr 0.45fr;
  padding: 8px 11px;
  color: #4f6077;
  font-size: 0.58rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  text-align: right;
  span:first-child {
    text-align: left;
  }
  @media (max-width: 520px) {
    grid-template-columns: 1.4fr 0.45fr 0.65fr;
    span:nth-child(2) {
      display: none;
    }
  }
`;
const TickerList = styled.div`
  display: grid;
  gap: 6px;
`;
const TickerRow = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 0.42fr 0.7fr 0.45fr;
  align-items: center;
  padding: 9px 11px;
  border: 1px solid rgba(148, 163, 184, 0.07);
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.025);
  animation: ${rise} 0.45s ease both;
  animation-delay: ${({ $delay }) => $delay * 0.09}s;
  @media (max-width: 520px) {
    grid-template-columns: 1.4fr 0.45fr 0.65fr;
    > *:nth-child(2) {
      display: none;
    }
  }
`;
const ClubInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  strong,
  small {
    display: block;
  }
  strong {
    color: #e8eef8;
    font-size: 0.75rem;
  }
  small {
    margin-top: 2px;
    color: #4f6077;
    font-size: 0.56rem;
    font-weight: 800;
  }
`;
const ClubMark = styled.span`
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 9px;
  background: ${({ $cor }) => $cor};
  color: ${({ $cor }) => ($cor === "#f8fafc" ? "#020617" : "#fff")};
  font-size: 0.7rem;
  font-weight: 900;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.15);
`;
const Position = styled.span`
  color: #94a3b8;
  font-size: 0.7rem;
  text-align: right;
`;
const Price = styled.strong`
  color: #f1f5f9;
  font-size: 0.72rem;
  text-align: right;
  white-space: nowrap;
`;
const Variation = styled.strong`
  color: ${({ $negativo }) => ($negativo ? "#fb7185" : "#4ade80")};
  font-size: 0.68rem;
  text-align: right;
`;
const ChartArea = styled.div`
  margin-top: 13px;
  padding: 15px 15px 7px;
  border: 1px solid rgba(59, 130, 246, 0.11);
  border-radius: 15px;
  background: rgba(2, 6, 23, 0.36);
`;
const ChartTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  span,
  strong {
    display: block;
  }
  span {
    color: #64748b;
    font-size: 0.62rem;
  }
  strong {
    margin-top: 4px;
    color: #f8fafc;
    font-size: 0.92rem;
  }
`;
const ChartBadge = styled.span`
  display: flex !important;
  align-items: center;
  gap: 5px;
  color: #4ade80 !important;
  font-weight: 800;
`;
const Chart = styled.div`
  position: relative;
  height: 125px;
  margin-top: 8px;
  svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
`;
const ChartGrid = styled.div`
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent 30px,
    rgba(148, 163, 184, 0.055) 31px
  );
`;
const FloatingCard = styled.div`
  position: absolute;
  right: -24px;
  bottom: 3%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 14px;
  background: rgba(12, 23, 42, 0.93);
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.3);
  animation: ${float} 4s ease-in-out infinite;
  ${({ $left }) =>
    $left &&
    `right:auto;left:-28px;bottom:auto;top:5%;animation-delay:-1.6s;`} small,strong {
    display: block;
  }
  small {
    color: #64748b;
    font-size: 0.58rem;
  }
  strong {
    margin-top: 3px;
    color: #e2e8f0;
    font-size: 0.7rem;
  }
  @media (max-width: 740px) {
    display: none;
  }
`;
const FloatIcon = styled.span`
  width: 31px;
  height: 31px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
  ${({ $blue }) => $blue && `background:rgba(59,130,246,.13);color:#60a5fa;`}
`;
const ProofBar = styled.section`
  width: min(1380px, calc(100% - 48px));
  margin: 0 auto;
  padding: 23px 30px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.025);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  @media (max-width: 850px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 640px) {
    width: min(100% - 28px, 1380px);
    grid-template-columns: 1fr;
    padding: 21px;
  }
`;
const ProofIntro = styled.span`
  color: #526178;
  font-size: 0.63rem;
  font-weight: 900;
  letter-spacing: 0.12em;
`;
const ProofItem = styled.div`
  strong,
  span {
    display: block;
  }
  strong {
    color: #dbeafe;
    font-size: 0.88rem;
  }
  span {
    margin-top: 3px;
    color: #5e6e84;
    font-size: 0.65rem;
  }
`;
const ProofDivider = styled.span`
  width: 1px;
  height: 32px;
  background: rgba(148, 163, 184, 0.12);
  @media (max-width: 850px) {
    display: none;
  }
`;
const Section = styled.section`
  width: min(1240px, calc(100% - 48px));
  margin: 0 auto;
  padding: ${({ $compact }) => ($compact ? "104px 0" : "118px 0")};
  @media (max-width: 640px) {
    width: min(100% - 28px, 1240px);
    padding: 82px 0;
  }
`;
const SectionHeader = styled.div`
  max-width: 770px;
  margin: 0 auto 54px;
  text-align: center;
`;
const SectionEyebrow = styled.div`
  margin-bottom: 15px;
  color: #60a5fa;
  font-size: 0.67rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;
const SectionTitle = styled.h2`
  margin: 0;
  color: #f8fafc;
  font-size: clamp(2.2rem, 4.2vw, 4rem);
  line-height: 1.04;
  letter-spacing: -0.045em;
  span {
    color: #7f91a9;
  }
`;
const SectionText = styled.p`
  max-width: 650px;
  margin: 21px auto 0;
  color: #8291a7;
  font-size: 0.94rem;
  line-height: 1.75;
`;
const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 580px) {
    grid-template-columns: 1fr;
  }
`;
const FeatureCard = styled.article`
  position: relative;
  min-height: 220px;
  padding: 25px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 18px;
  background: ${({ $featured }) =>
    $featured
      ? "linear-gradient(145deg,rgba(37,99,235,.09),rgba(255,255,255,.022))"
      : "rgba(255,255,255,.022)"};
  overflow: hidden;
  transition: 0.25s ease;
  &:hover {
    transform: translateY(-4px);
    border-color: rgba(96, 165, 250, 0.24);
    background: rgba(59, 130, 246, 0.07);
  }
  h3 {
    margin: 20px 0 9px;
    font-size: 1rem;
  }
  p {
    margin: 0;
    color: #718198;
    font-size: 0.78rem;
    line-height: 1.65;
  }
`;
const FeatureIcon = styled.span`
  width: 43px;
  height: 43px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(96, 165, 250, 0.17);
  border-radius: 13px;
  background: rgba(59, 130, 246, 0.09);
  color: #60a5fa;
  font-size: 1.15rem;
`;
const FeatureLine = styled.span`
  position: absolute;
  left: 25px;
  bottom: 0;
  width: 46px;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #22c55e);
`;
const DarkSection = styled.div`
  border-top: 1px solid rgba(148, 163, 184, 0.08);
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
  background: linear-gradient(
    180deg,
    rgba(2, 6, 23, 0.28),
    rgba(15, 23, 42, 0.2)
  );
`;
const SplitHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 0.82fr;
  align-items: end;
  gap: 60px;
  margin-bottom: 55px;
  ${SectionText} {
    margin: 0;
  }
  @media (max-width: 800px) {
    grid-template-columns: 1fr;
    gap: 20px;
    ${SectionText} {
      margin: 0;
    }
  }
`;
const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 540px) {
    grid-template-columns: 1fr;
  }
`;
const StepCard = styled.article`
  padding: 22px 18px 25px;
  border: 1px solid rgba(148, 163, 184, 0.09);
  border-radius: 17px;
  background: rgba(255, 255, 255, 0.022);
  h3 {
    margin: 24px 0 9px;
    font-size: 0.95rem;
  }
  p {
    margin: 0;
    color: #718198;
    font-size: 0.75rem;
    line-height: 1.62;
  }
`;
const StepTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const StepNumber = styled.span`
  font-size: 1.9rem;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: rgba(96, 165, 250, 0.36);
`;
const StepArrow = styled.span`
  color: #334155;
  font-size: 1.2rem;
  @media (max-width: 900px) {
    display: none;
  }
`;
const HowLink = styled(Link)`
  width: max-content;
  margin: 30px auto 0;
  display: flex;
  align-items: center;
  gap: 9px;
  color: #93c5fd;
  font-size: 0.78rem;
  font-weight: 800;
  text-decoration: none;
  &:hover {
    color: #fff;
  }
  @media (max-width: 540px) {
    width: auto;
    text-align: center;
  }
`;
const StrategyPanel = styled.div`
  display: grid;
  grid-template-columns: 1fr 0.9fr;
  gap: 80px;
  align-items: center;
  @media (max-width: 950px) {
    grid-template-columns: 1fr;
    gap: 55px;
  }
`;
const StrategyCopy = styled.div`
  ${SectionText} {
    margin-left: 0;
  }
`;
const StrategyList = styled.ul`
  list-style: none;
  margin: 30px 0 0;
  padding: 0;
  display: grid;
  gap: 18px;
  li {
    display: flex;
    gap: 12px;
  }
  strong,
  span {
    display: block;
  }
  strong {
    font-size: 0.83rem;
  }
  span {
    margin-top: 4px;
    color: #6f7f95;
    font-size: 0.72rem;
    line-height: 1.5;
  }
`;
const CheckIcon = styled.i`
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 9px;
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
  font-style: normal;
`;
const PortfolioCard = styled.div`
  padding: 28px;
  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 24px;
  background: linear-gradient(
    145deg,
    rgba(18, 34, 59, 0.94),
    rgba(7, 15, 29, 0.98)
  );
  box-shadow: 0 34px 80px rgba(0, 0, 0, 0.32);
  @media (max-width: 520px) {
    padding: 20px;
  }
`;
const PortfolioHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding-bottom: 21px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.09);
  span,
  strong {
    display: block;
  }
  span {
    color: #64748b;
    font-size: 0.68rem;
  }
  strong {
    margin-top: 6px;
    font-size: 1.35rem;
  }
`;
const PortfolioChange = styled.strong`
  align-self: center;
  color: #4ade80 !important;
  font-size: 0.74rem !important;
`;
const DonutWrap = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 32px;
  padding: 32px 0;
  @media (max-width: 450px) {
    grid-template-columns: 1fr;
  }
`;
const Donut = styled.div`
  width: 160px;
  aspect-ratio: 1;
  margin: auto;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: conic-gradient(
    #3b82f6 0 38%,
    #22c55e 38% 65%,
    #a78bfa 65% 86%,
    #f59e0b 86%
  );
  position: relative;
  &:after {
    content: "";
    position: absolute;
    width: 112px;
    aspect-ratio: 1;
    border-radius: 50%;
    background: #0c192c;
  }
`;
const DonutCenter = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  small,
  strong {
    display: block;
  }
  small {
    color: #64748b;
    font-size: 0.57rem;
  }
  strong {
    margin-top: 4px;
    color: #4ade80;
    font-size: 1rem;
  }
`;
const Legend = styled.div`
  display: grid;
  gap: 13px;
`;
const LegendItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  color: #8291a7;
  font-size: 0.68rem;
  &:before {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
  }
  span {
    flex: 1;
  }
  strong {
    color: #dbeafe;
  }
`;
const PortfolioFoot = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 17px;
  border-top: 1px solid rgba(148, 163, 184, 0.09);
  color: #526178;
  font-size: 0.6rem;
  svg {
    color: #60a5fa;
    font-size: 1rem;
  }
`;
const Transparency = styled.section`
  width: min(1240px, calc(100% - 48px));
  margin: 0 auto 110px;
  padding: 35px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 24px;
  border: 1px solid rgba(34, 197, 94, 0.14);
  border-radius: 21px;
  background: linear-gradient(
    100deg,
    rgba(34, 197, 94, 0.065),
    rgba(59, 130, 246, 0.04)
  );
  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    width: min(100% - 28px, 1240px);
    padding: 27px;
  }
`;
const TransparencyIcon = styled.span`
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 17px;
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
  font-size: 1.5rem;
`;
const TransparencyTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
`;
const TransparencyText = styled.p`
  max-width: 730px;
  margin: 7px 0 0;
  color: #718198;
  font-size: 0.74rem;
  line-height: 1.6;
`;
const TextLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #86efac;
  text-decoration: none;
  font-size: 0.72rem;
  font-weight: 900;
  white-space: nowrap;
  &:hover {
    color: #fff;
  }
`;
const FinalCta = styled.section`
  position: relative;
  width: min(1240px, calc(100% - 48px));
  margin: 0 auto 28px;
  padding: 82px 28px;
  border: 1px solid rgba(96, 165, 250, 0.16);
  border-radius: 28px;
  background: linear-gradient(135deg, #0d213f, #0a172a 58%, #0a281f);
  overflow: hidden;
  text-align: center;
  @media (max-width: 640px) {
    width: min(100% - 28px, 1240px);
    padding: 65px 20px;
  }
`;
const CtaGlow = styled.div`
  position: absolute;
  width: 500px;
  height: 500px;
  left: 50%;
  top: -330px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.33);
  filter: blur(75px);
`;
const CtaContent = styled.div`
  position: relative;
  z-index: 1;
`;
const CtaEyebrow = styled.div`
  margin-bottom: 15px;
  color: #86efac;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;
const CtaTitle = styled.h2`
  max-width: 760px;
  margin: 0 auto;
  color: #fff;
  font-size: clamp(2.35rem, 5vw, 4.6rem);
  line-height: 1;
  letter-spacing: -0.055em;
`;
const CtaText = styled.p`
  margin: 22px auto 0;
  color: #8fa0b6;
  font-size: 0.9rem;
`;
const CtaActions = styled.div`
  margin-top: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 22px;
  flex-wrap: wrap;
`;
const CtaLogin = styled.span`
  color: #718198;
  font-size: 0.72rem;
  a {
    color: #dbeafe;
    font-weight: 800;
    text-decoration: none;
    &:hover {
      color: #fff;
    }
  }
`;
const LegalNote = styled.p`
  width: min(900px, calc(100% - 40px));
  margin: 0 auto;
  padding: 17px 0 30px;
  color: #46556a;
  font-size: 0.61rem;
  line-height: 1.6;
  text-align: center;
`;
