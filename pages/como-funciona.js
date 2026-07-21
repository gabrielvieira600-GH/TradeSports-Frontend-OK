import Link from "next/link";
import styled from "styled-components";

const PARAMETROS = {
  cotasPorClube: 1000,
  precoBase: "T$ 5,00",
  variacaoPorPosicao: "5%",
  taxaMaker: "0,20%",
  taxaTaker: "0,50%",
  rodadasDividendos: 4,
};

const TOPICOS = [
  { id: "visao-geral", label: "Visão geral" },
  { id: "precos", label: "Preços" },
  { id: "ipo", label: "IPO" },
  { id: "mercado", label: "Mercado" },
  { id: "ordens", label: "Ordens e taxas" },
  { id: "carteira", label: "Carteira" },
  { id: "dividendos", label: "Dividendos" },
  { id: "liquidacao", label: "Liquidação" },
];

const FLUXO = [
  {
    numero: "01",
    titulo: "Analise o campeonato",
    texto:
      "Observe a classificação, o momento dos clubes e o preço de referência de cada posição.",
  },
  {
    numero: "02",
    titulo: "Escolha uma estratégia",
    texto:
      "Decida quais clubes deseja acompanhar e quanto do saldo virtual quer utilizar.",
  },
  {
    numero: "03",
    titulo: "Negocie cotas",
    texto:
      "Compre no IPO ou envie ordens ao livro de ofertas quando o clube estiver no mercado secundário.",
  },
  {
    numero: "04",
    titulo: "Acompanhe sua carteira",
    texto:
      "Revise posições, preço médio, ordens, transações, taxas e o resultado da sua estratégia.",
  },
];

function ComoFunciona() {
  return (
    <Page>
      <Hero>
        <HeroGlow />

        <HeroContent>
          <Eyebrow>Guia da plataforma</Eyebrow>

          <Title>Futebol, mercado e estratégia em uma só experiência.</Title>

          <HeroText>
            Na TradeSports, você utiliza créditos virtuais para negociar cotas
            de clubes e testar suas decisões ao longo do campeonato. O
            desempenho esportivo influencia a referência econômica; o mercado
            entre usuários define o preço efetivamente negociado.
          </HeroText>

          <HeroActions>
            <PrimaryLink href="/cadastro">Criar conta</PrimaryLink>
            <SecondaryLink href="#visao-geral">
              Entender as regras
            </SecondaryLink>
          </HeroActions>

          <SimulationNotice>
            <NoticeIcon aria-hidden="true">i</NoticeIcon>
            <span>
              A TradeSports é um ambiente de simulação. T$ são créditos
              fictícios, não possuem valor monetário e não podem ser convertidos
              em dinheiro.
            </span>
          </SimulationNotice>
        </HeroContent>

        <HeroPanel aria-label="Resumo da dinâmica TradeSports">
          <PanelLabel>O ciclo da estratégia</PanelLabel>

          <Cycle>
            <CycleItem>
              <CycleNumber>1</CycleNumber>
              <div>
                <strong>Classificação</strong>
                <span>gera uma referência</span>
              </div>
            </CycleItem>

            <CycleLine />

            <CycleItem>
              <CycleNumber>2</CycleNumber>
              <div>
                <strong>Oferta e demanda</strong>
                <span>formam o mercado</span>
              </div>
            </CycleItem>

            <CycleLine />

            <CycleItem>
              <CycleNumber>3</CycleNumber>
              <div>
                <strong>Sua estratégia</strong>
                <span>define o resultado</span>
              </div>
            </CycleItem>
          </Cycle>
        </HeroPanel>
      </Hero>

      <TopicNav aria-label="Tópicos da página">
        {TOPICOS.map((topico) => (
          <TopicLink key={topico.id} href={`#${topico.id}`}>
            {topico.label}
          </TopicLink>
        ))}
      </TopicNav>

      <Main>
        <Section id="visao-geral">
          <SectionHead>
            <SectionIndex>01</SectionIndex>
            <div>
              <SectionEyebrow>Visão geral</SectionEyebrow>
              <H2>Como a TradeSports funciona</H2>
            </div>
          </SectionHead>

          <Intro>
            Cada clube participante possui cotas virtuais. Você pode adquirir,
            manter ou vender essas cotas conforme sua leitura do campeonato. A
            experiência combina regras esportivas objetivas com um livro de
            ofertas formado pelas decisões dos usuários.
          </Intro>

          <FlowGrid>
            {FLUXO.map((item) => (
              <FlowCard key={item.numero}>
                <FlowNumber>{item.numero}</FlowNumber>
                <h3>{item.titulo}</h3>
                <p>{item.texto}</p>
              </FlowCard>
            ))}
          </FlowGrid>

          <ConceptGrid>
            <ConceptCard>
              <ConceptTag $blue>Esporte</ConceptTag>
              <h3>O campeonato é a base</h3>
              <p>
                A posição real de cada clube na tabela determina seu preço de
                referência e também pode gerar eventos previstos nas regras da
                temporada.
              </p>
            </ConceptCard>

            <ConceptCard>
              <ConceptTag $green>Mercado</ConceptTag>
              <h3>Usuários negociam entre si</h3>
              <p>
                Após o fim do IPO, compradores e vendedores enviam ofertas. Uma
                negociação ocorre quando preços compatíveis se encontram.
              </p>
            </ConceptCard>

            <ConceptCard>
              <ConceptTag $yellow>Estratégia</ConceptTag>
              <h3>Não existe resultado garantido</h3>
              <p>
                Preço, liquidez e desempenho esportivo podem variar. Toda
                decisão deve considerar o risco da simulação e o horizonte da
                temporada.
              </p>
            </ConceptCard>
          </ConceptGrid>
        </Section>

        <Section id="precos">
          <SectionHead>
            <SectionIndex>02</SectionIndex>
            <div>
              <SectionEyebrow>Formação de preço</SectionEyebrow>
              <H2>Referência esportiva não é preço de mercado</H2>
            </div>
          </SectionHead>

          <TwoColumns>
            <TextBlock>
              <H3>Preço de referência</H3>
              <P>
                É calculado a partir da posição do clube na classificação. A
                referência da 20ª posição começa em{" "}
                <Strong>{PARAMETROS.precoBase}</Strong>, e cada posição acima
                acrescenta <Strong>{PARAMETROS.variacaoPorPosicao}</Strong>{" "}
                sobre a posição imediatamente inferior.
              </P>
              <P>
                Essa régua conecta o desempenho real do clube à lógica econômica
                da temporada e também serve de base para a liquidação final.
              </P>
            </TextBlock>

            <TextBlock $accent>
              <H3>Preço de mercado</H3>
              <P>
                É o preço definido pelas ordens de compra e venda disponíveis no
                livro. Ele pode ficar acima ou abaixo da referência porque
                reflete expectativas, oferta, demanda e liquidez naquele
                momento.
              </P>
              <P>
                O último preço negociado registra uma execução passada; ele não
                garante que exista quantidade disponível pelo mesmo valor.
              </P>
            </TextBlock>
          </TwoColumns>

          <ExampleBox>
            <ExampleBadge>Exemplo</ExampleBadge>
            <div>
              <strong>Referência e negociação podem divergir.</strong>
              <p>
                Um clube pode ter referência de T$ 8,14 e, ainda assim, receber
                ofertas de compra a T$ 7,90 e ofertas de venda a T$ 8,30. A
                operação só acontece quando uma ordem encontra outra em preço
                compatível.
              </p>
            </div>
          </ExampleBox>
        </Section>

        <Section id="ipo">
          <SectionHead>
            <SectionIndex>03</SectionIndex>
            <div>
              <SectionEyebrow>Emissão inicial</SectionEyebrow>
              <H2>IPO: a primeira distribuição de cotas</H2>
            </div>
          </SectionHead>

          <Intro>
            Cada clube inicia a temporada com um lote de{" "}
            <Strong>
              {PARAMETROS.cotasPorClube.toLocaleString("pt-BR")} cotas
            </Strong>
            . Enquanto houver unidades disponíveis, as compras são realizadas
            diretamente no IPO pelo preço vigente dessa fase.
          </Intro>

          <RuleGrid>
            <RuleCard>
              <RuleIcon>1</RuleIcon>
              <div>
                <h3>Lote limitado</h3>
                <p>
                  O estoque inicial diminui a cada compra confirmada. Uma ordem
                  não pode adquirir mais cotas do que o saldo ainda disponível.
                </p>
              </div>
            </RuleCard>

            <RuleCard>
              <RuleIcon>2</RuleIcon>
              <div>
                <h3>Compra com saldo virtual</h3>
                <p>
                  O custo é debitado em T$ e as cotas adquiridas passam a compor
                  a carteira do usuário.
                </p>
              </div>
            </RuleCard>

            <RuleCard>
              <RuleIcon>3</RuleIcon>
              <div>
                <h3>Transição automática</h3>
                <p>
                  Quando as {PARAMETROS.cotasPorClube.toLocaleString("pt-BR")}{" "}
                  cotas são distribuídas, novas compras e vendas passam a
                  ocorrer no mercado secundário.
                </p>
              </div>
            </RuleCard>
          </RuleGrid>
        </Section>

        <Section id="mercado">
          <SectionHead>
            <SectionIndex>04</SectionIndex>
            <div>
              <SectionEyebrow>Mercado secundário</SectionEyebrow>
              <H2>O livro de ofertas conecta compradores e vendedores</H2>
            </div>
          </SectionHead>

          <TwoColumns>
            <TextBlock>
              <H3>Ofertas de compra</H3>
              <P>
                Mostram quanto os usuários estão dispostos a pagar e qual
                quantidade desejam adquirir. A maior oferta é o melhor preço de
                compra disponível.
              </P>
            </TextBlock>

            <TextBlock>
              <H3>Ofertas de venda</H3>
              <P>
                Mostram por quanto os usuários aceitam vender suas cotas. A
                menor oferta é o melhor preço de venda disponível.
              </P>
            </TextBlock>
          </TwoColumns>

          <OrderBook aria-label="Exemplo de livro de ofertas">
            <OrderSide>
              <OrderTitle $buy>Compra</OrderTitle>
              <OrderHeader>
                <span>Quantidade</span>
                <span>Preço</span>
              </OrderHeader>
              <OrderRow $buy>
                <span>20 cotas</span>
                <strong>T$ 7,90</strong>
              </OrderRow>
              <OrderRow $buy>
                <span>35 cotas</span>
                <strong>T$ 7,85</strong>
              </OrderRow>
            </OrderSide>

            <Spread>
              <span>Spread</span>
              <strong>T$ 0,40</strong>
              <small>diferença entre as melhores ofertas</small>
            </Spread>

            <OrderSide>
              <OrderTitle>Venda</OrderTitle>
              <OrderHeader>
                <span>Preço</span>
                <span>Quantidade</span>
              </OrderHeader>
              <OrderRow>
                <strong>T$ 8,30</strong>
                <span>15 cotas</span>
              </OrderRow>
              <OrderRow>
                <strong>T$ 8,35</strong>
                <span>40 cotas</span>
              </OrderRow>
            </OrderSide>
          </OrderBook>

          <InlineNotice>
            A TradeSports organiza as ordens, mas não atua como contraparte no
            mercado secundário. Sem uma oferta compatível do outro lado, não há
            execução.
          </InlineNotice>
        </Section>

        <Section id="ordens">
          <SectionHead>
            <SectionIndex>05</SectionIndex>
            <div>
              <SectionEyebrow>Execução</SectionEyebrow>
              <H2>Ordens, prioridade, execução parcial e taxas</H2>
            </div>
          </SectionHead>

          <RuleGrid>
            <RuleCard>
              <RuleIcon>A</RuleIcon>
              <div>
                <h3>Preço e quantidade</h3>
                <p>
                  Você informa quantas cotas deseja negociar e o preço limite
                  que aceita pagar ou receber.
                </p>
              </div>
            </RuleCard>

            <RuleCard>
              <RuleIcon>B</RuleIcon>
              <div>
                <h3>Prioridade do livro</h3>
                <p>
                  As melhores ofertas têm prioridade. Para ofertas no mesmo
                  preço, a ordem enviada primeiro fica à frente.
                </p>
              </div>
            </RuleCard>

            <RuleCard>
              <RuleIcon>C</RuleIcon>
              <div>
                <h3>Execução parcial</h3>
                <p>
                  Se houver apenas parte da quantidade compatível, essa parcela
                  é executada e o restante permanece aberto no livro.
                </p>
              </div>
            </RuleCard>
          </RuleGrid>

          <Fees>
            <FeeCard $maker>
              <FeeTop>
                <span>Maker</span>
                <strong>{PARAMETROS.taxaMaker}</strong>
              </FeeTop>
              <p>
                É quem adiciona liquidez: a ordem entra no livro e aguarda outra
                oferta compatível para ser executada.
              </p>
            </FeeCard>

            <FeeCard>
              <FeeTop>
                <span>Taker</span>
                <strong>{PARAMETROS.taxaTaker}</strong>
              </FeeTop>
              <p>
                É quem retira liquidez: a ordem encontra uma oferta já
                disponível e é executada imediatamente, no todo ou em parte.
              </p>
            </FeeCard>
          </Fees>

          <SmallPrint>
            A taxa incide sobre o valor efetivamente executado, não sobre a
            parte da ordem que continua aberta. Uma mesma ordem pode ter
            execuções em momentos e preços diferentes.
          </SmallPrint>
        </Section>

        <Section id="carteira">
          <SectionHead>
            <SectionIndex>06</SectionIndex>
            <div>
              <SectionEyebrow>Acompanhamento</SectionEyebrow>
              <H2>Sua carteira reúne posições e resultados</H2>
            </div>
          </SectionHead>

          <Intro>
            Depois de comprar cotas, você acompanha a quantidade mantida, o
            preço médio de aquisição, a cotação utilizada pela plataforma e a
            variação da posição. Ordens e movimentações financeiras ficam
            disponíveis nas áreas de histórico e extrato.
          </Intro>

          <MetricGrid>
            <MetricCard>
              <span>Posição</span>
              <strong>Cotas mantidas</strong>
              <p>Quantidade que pertence à sua carteira naquele clube.</p>
            </MetricCard>
            <MetricCard>
              <span>Custo</span>
              <strong>Preço médio</strong>
              <p>Média dos preços pagos nas aquisições que formam a posição.</p>
            </MetricCard>
            <MetricCard>
              <span>Mercado</span>
              <strong>Valor atual</strong>
              <p>Estimativa da posição com base na cotação exibida.</p>
            </MetricCard>
            <MetricCard>
              <span>Resultado</span>
              <strong>Variação</strong>
              <p>
                Diferença estimada entre o valor atual e o custo da posição.
              </p>
            </MetricCard>
          </MetricGrid>

          <InlineNotice $warning>
            O valor exibido na carteira é uma estimativa. A venda efetiva
            depende da existência de compradores e pode ocorrer por outro preço.
          </InlineNotice>
        </Section>

        <Section id="dividendos">
          <SectionHead>
            <SectionIndex>07</SectionIndex>
            <div>
              <SectionEyebrow>Recompensa por consistência</SectionEyebrow>
              <H2>Dividendos virtuais para clubes do Top 4</H2>
            </div>
          </SectionHead>

          <TwoColumns>
            <TextBlock $accent>
              <H3>Regra esportiva</H3>
              <P>
                Um clube pode gerar dividendos virtuais quando permanece na
                mesma posição do Top 4 por, no mínimo,{" "}
                <Strong>
                  {PARAMETROS.rodadasDividendos} rodadas consecutivas
                </Strong>
                , conforme o processamento oficial da temporada.
              </P>
            </TextBlock>

            <TextBlock>
              <H3>Regra de titularidade</H3>
              <P>
                O crédito considera as cotas elegíveis mantidas pelo usuário nos
                registros da plataforma. Comprar após o período necessário ou
                vender antes da apuração pode alterar ou eliminar o direito ao
                pagamento daquela janela.
              </P>
            </TextBlock>
          </TwoColumns>

          <SmallPrint>
            Dividendos são créditos exclusivamente virtuais e dependem do
            cumprimento integral das regras da temporada. Não representam renda,
            rendimento financeiro ou promessa de retorno.
          </SmallPrint>
        </Section>

        <Section id="liquidacao">
          <SectionHead>
            <SectionIndex>08</SectionIndex>
            <div>
              <SectionEyebrow>Encerramento da temporada</SectionEyebrow>
              <H2>A classificação final determina a liquidação</H2>
            </div>
          </SectionHead>

          <Intro>
            Ao término do campeonato, cada clube recebe o valor de liquidação
            correspondente à sua posição final na tabela, conforme a régua de
            referência. As cotas elegíveis são encerradas por esse valor e o
            crédito virtual resultante é registrado no saldo do usuário.
          </Intro>

          <LiquidationFlow>
            <LiquidationItem>
              <span>1</span>
              <div>
                <strong>Campeonato encerrado</strong>
                <p>A classificação final é consolidada.</p>
              </div>
            </LiquidationItem>
            <Arrow aria-hidden="true">→</Arrow>
            <LiquidationItem>
              <span>2</span>
              <div>
                <strong>Valor calculado</strong>
                <p>A posição define a referência final.</p>
              </div>
            </LiquidationItem>
            <Arrow aria-hidden="true">→</Arrow>
            <LiquidationItem>
              <span>3</span>
              <div>
                <strong>Cotas liquidadas</strong>
                <p>O resultado é lançado no extrato.</p>
              </div>
            </LiquidationItem>
          </LiquidationFlow>

          <ExampleBox>
            <ExampleBadge>Importante</ExampleBadge>
            <div>
              <strong>A liquidação não utiliza o último negócio.</strong>
              <p>
                O preço final segue a posição definitiva do clube e a tabela de
                referência da temporada, ainda que a última negociação no
                mercado secundário tenha ocorrido por outro valor.
              </p>
            </div>
          </ExampleBox>
        </Section>

        <FinalCard>
          <div>
            <FinalEyebrow>Pronto para começar?</FinalEyebrow>
            <FinalTitle>
              Transforme sua leitura do campeonato em estratégia.
            </FinalTitle>
            <FinalText>
              Crie sua conta, explore a tabela e teste suas decisões em um
              ambiente totalmente simulado.
            </FinalText>
          </div>

          <FinalActions>
            <PrimaryLink href="/cadastro">Criar conta</PrimaryLink>
            <SecondaryLink href="/">Voltar ao início</SecondaryLink>
          </FinalActions>
        </FinalCard>

        <LegalNotice>
          <strong>Aviso sobre a simulação</strong>
          <p>
            A TradeSports é uma plataforma de entretenimento e simulação
            econômica esportiva. Todos os saldos, preços, cotas, dividendos e
            resultados são fictícios, denominados em T$, sem valor monetário,
            possibilidade de saque ou promessa de rentabilidade. O desempenho
            passado de clubes ou estratégias não garante resultados futuros
            dentro da simulação.
          </p>
        </LegalNotice>
      </Main>
    </Page>
  );
}

export default ComoFunciona;

const Page = styled.div`
  min-height: 100vh;
  padding: 28px 24px 64px;
  color: #e5e7eb;
  scroll-behavior: smooth;

  @media (max-width: 760px) {
    padding: 18px 12px 42px;
  }
`;

const Hero = styled.header`
  position: relative;
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 48px;
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.65fr);
  gap: 46px;
  align-items: center;
  overflow: hidden;
  border: 1px solid rgba(96, 165, 250, 0.16);
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(37, 99, 235, 0.12), transparent 42%),
    rgba(15, 23, 42, 0.72);
  box-sizing: border-box;

  @media (max-width: 960px) {
    padding: 36px 28px;
    grid-template-columns: 1fr;
  }

  @media (max-width: 560px) {
    padding: 28px 20px;
    border-radius: 18px;
  }
`;

const HeroGlow = styled.div`
  position: absolute;
  width: 360px;
  height: 360px;
  right: -120px;
  top: -170px;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.14);
  filter: blur(70px);
  pointer-events: none;
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
`;

const Eyebrow = styled.div`
  margin-bottom: 12px;
  color: #60a5fa;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
`;

const Title = styled.h1`
  max-width: 760px;
  margin: 0;
  color: #ffffff;
  font-size: clamp(2rem, 4.2vw, 3.65rem);
  line-height: 1.06;
  letter-spacing: -0.04em;
`;

const HeroText = styled.p`
  max-width: 720px;
  margin: 20px 0 0;
  color: #a8b4c7;
  font-size: 1rem;
  line-height: 1.7;
`;

const HeroActions = styled.div`
  margin-top: 26px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const PrimaryLink = styled(Link)`
  min-height: 44px;
  padding: 0 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: #2563eb;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 900;
  text-decoration: none;

  &:hover {
    background: #1d4ed8;
  }
`;

const SecondaryLink = styled(Link)`
  min-height: 44px;
  padding: 0 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.04);
  color: #e2e8f0;
  font-size: 0.85rem;
  font-weight: 800;
  text-decoration: none;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const SimulationNotice = styled.div`
  max-width: 720px;
  margin-top: 24px;
  padding: 11px 13px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  border: 1px solid rgba(96, 165, 250, 0.18);
  border-radius: 11px;
  background: rgba(37, 99, 235, 0.07);
  color: #bfdbfe;
  font-size: 0.72rem;
  line-height: 1.5;
`;

const NoticeIcon = styled.span`
  width: 19px;
  height: 19px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: rgba(96, 165, 250, 0.18);
  color: #93c5fd;
  font-weight: 900;
`;

const HeroPanel = styled.div`
  position: relative;
  z-index: 1;
  padding: 22px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 18px;
  background: rgba(2, 6, 23, 0.42);
`;

const PanelLabel = styled.div`
  margin-bottom: 18px;
  color: #64748b;
  font-size: 0.67rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.09em;
`;

const Cycle = styled.div`
  display: grid;
  gap: 8px;
`;

const CycleItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  strong,
  span {
    display: block;
  }

  strong {
    color: #f8fafc;
    font-size: 0.84rem;
  }

  span {
    margin-top: 2px;
    color: #64748b;
    font-size: 0.7rem;
  }
`;

const CycleNumber = styled.div`
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border: 1px solid rgba(34, 197, 94, 0.24);
  border-radius: 10px;
  background: rgba(34, 197, 94, 0.09);
  color: #86efac;
  font-size: 0.76rem;
  font-weight: 900;
`;

const CycleLine = styled.div`
  width: 1px;
  height: 16px;
  margin-left: 17px;
  background: rgba(148, 163, 184, 0.18);
`;

const TopicNav = styled.nav`
  position: sticky;
  top: 12px;
  z-index: 20;
  width: fit-content;
  max-width: calc(100% - 24px);
  margin: 18px auto 0;
  padding: 6px;
  display: flex;
  gap: 4px;
  overflow-x: auto;
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 13px;
  background: rgba(15, 23, 42, 0.94);
  box-shadow: 0 10px 30px rgba(2, 6, 23, 0.22);
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 760px) {
    width: calc(100% - 12px);
    max-width: none;
  }
`;

const TopicLink = styled.a`
  padding: 8px 11px;
  border-radius: 8px;
  color: #94a3b8;
  font-size: 0.7rem;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    background: rgba(59, 130, 246, 0.1);
    color: #bfdbfe;
  }
`;

const Main = styled.main`
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
`;

const Section = styled.section`
  padding: 72px 0 4px;
  scroll-margin-top: 76px;

  @media (max-width: 760px) {
    padding-top: 54px;
  }
`;

const SectionHead = styled.div`
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
`;

const SectionIndex = styled.span`
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.08);
  color: #60a5fa;
  font-size: 0.72rem;
  font-weight: 900;
`;

const SectionEyebrow = styled.div`
  margin-bottom: 3px;
  color: #64748b;
  font-size: 0.67rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const H2 = styled.h2`
  margin: 0;
  color: #f8fafc;
  font-size: clamp(1.35rem, 2.5vw, 2rem);
  line-height: 1.2;
  letter-spacing: -0.025em;
`;

const H3 = styled.h3`
  margin: 0 0 8px;
  color: #f8fafc;
  font-size: 0.94rem;
`;

const P = styled.p`
  margin: 0;
  color: #94a3b8;
  font-size: 0.84rem;
  line-height: 1.68;

  & + & {
    margin-top: 12px;
  }
`;

const Strong = styled.strong`
  color: #e2e8f0;
`;

const Intro = styled.p`
  max-width: 850px;
  margin: 0;
  color: #a8b4c7;
  font-size: 0.94rem;
  line-height: 1.72;
`;

const FlowGrid = styled.div`
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const FlowCard = styled.article`
  padding: 16px;
  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.55);

  h3 {
    margin: 12px 0 7px;
    color: #f1f5f9;
    font-size: 0.83rem;
  }

  p {
    margin: 0;
    color: #718096;
    font-size: 0.72rem;
    line-height: 1.55;
  }
`;

const FlowNumber = styled.span`
  color: #60a5fa;
  font-size: 0.7rem;
  font-weight: 900;
`;

const ConceptGrid = styled.div`
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const ConceptCard = styled.article`
  padding: 17px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.025);

  h3 {
    margin: 11px 0 7px;
    color: #e2e8f0;
    font-size: 0.86rem;
  }

  p {
    margin: 0;
    color: #718096;
    font-size: 0.73rem;
    line-height: 1.55;
  }
`;

const ConceptTag = styled.span`
  display: inline-flex;
  padding: 5px 8px;
  border-radius: 999px;
  background: ${({ $green, $yellow }) =>
    $green
      ? "rgba(34, 197, 94, 0.1)"
      : $yellow
        ? "rgba(250, 204, 21, 0.1)"
        : "rgba(59, 130, 246, 0.1)"};
  color: ${({ $green, $yellow }) =>
    $green ? "#86efac" : $yellow ? "#fde68a" : "#93c5fd"};
  font-size: 0.62rem;
  font-weight: 900;
  text-transform: uppercase;
`;

const TwoColumns = styled.div`
  margin-top: 22px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const TextBlock = styled.article`
  padding: 19px;
  border: 1px solid
    ${({ $accent }) =>
      $accent ? "rgba(34, 197, 94, 0.18)" : "rgba(148, 163, 184, 0.13)"};
  border-radius: 15px;
  background: ${({ $accent }) =>
    $accent ? "rgba(34, 197, 94, 0.055)" : "rgba(15, 23, 42, 0.52)"};
`;

const ExampleBox = styled.div`
  margin-top: 12px;
  padding: 16px;
  display: flex;
  gap: 13px;
  align-items: flex-start;
  border: 1px solid rgba(96, 165, 250, 0.16);
  border-radius: 13px;
  background: rgba(37, 99, 235, 0.055);

  strong {
    display: block;
    color: #dbeafe;
    font-size: 0.82rem;
  }

  p {
    margin: 5px 0 0;
    color: #7f91aa;
    font-size: 0.73rem;
    line-height: 1.55;
  }

  @media (max-width: 500px) {
    flex-direction: column;
  }
`;

const ExampleBadge = styled.span`
  padding: 5px 8px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.13);
  color: #93c5fd;
  font-size: 0.61rem;
  font-weight: 900;
  text-transform: uppercase;
`;

const RuleGrid = styled.div`
  margin-top: 22px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const RuleCard = styled.article`
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.52);

  h3 {
    margin: 1px 0 6px;
    color: #e2e8f0;
    font-size: 0.83rem;
  }

  p {
    margin: 0;
    color: #718096;
    font-size: 0.71rem;
    line-height: 1.55;
  }
`;

const RuleIcon = styled.span`
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 9px;
  background: rgba(59, 130, 246, 0.1);
  color: #93c5fd;
  font-size: 0.7rem;
  font-weight: 900;
`;

const OrderBook = styled.div`
  margin-top: 22px;
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr 160px 1fr;
  gap: 12px;
  align-items: stretch;
  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.55);

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const OrderSide = styled.div`
  min-width: 0;
`;

const OrderTitle = styled.strong`
  display: block;
  margin-bottom: 9px;
  color: ${({ $buy }) => ($buy ? "#86efac" : "#fca5a5")};
  font-size: 0.75rem;
`;

const OrderHeader = styled.div`
  padding: 0 9px 6px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  color: #475569;
  font-size: 0.62rem;

  span:last-child {
    text-align: right;
  }
`;

const OrderRow = styled.div`
  margin-top: 4px;
  padding: 9px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-radius: 8px;
  background: ${({ $buy }) =>
    $buy ? "rgba(34, 197, 94, 0.06)" : "rgba(239, 68, 68, 0.06)"};
  color: #94a3b8;
  font-size: 0.7rem;

  *:last-child {
    text-align: right;
  }

  strong {
    color: ${({ $buy }) => ($buy ? "#86efac" : "#fca5a5")};
  }
`;

const Spread = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(148, 163, 184, 0.15);
  border-radius: 12px;
  text-align: center;

  span,
  small {
    color: #64748b;
    font-size: 0.63rem;
  }

  strong {
    margin: 5px 0;
    color: #f8fafc;
    font-size: 0.86rem;
  }
`;

const InlineNotice = styled.div`
  margin-top: 12px;
  padding: 12px 14px;
  border: 1px solid
    ${({ $warning }) =>
      $warning ? "rgba(250, 204, 21, 0.17)" : "rgba(96, 165, 250, 0.16)"};
  border-radius: 11px;
  background: ${({ $warning }) =>
    $warning ? "rgba(250, 204, 21, 0.05)" : "rgba(59, 130, 246, 0.05)"};
  color: ${({ $warning }) => ($warning ? "#d6c78d" : "#9db6d9")};
  font-size: 0.72rem;
  line-height: 1.55;
`;

const Fees = styled.div`
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const FeeCard = styled.article`
  padding: 18px;
  border: 1px solid
    ${({ $maker }) =>
      $maker ? "rgba(34, 197, 94, 0.18)" : "rgba(96, 165, 250, 0.18)"};
  border-radius: 14px;
  background: ${({ $maker }) =>
    $maker ? "rgba(34, 197, 94, 0.055)" : "rgba(59, 130, 246, 0.055)"};

  p {
    margin: 11px 0 0;
    color: #7f91aa;
    font-size: 0.73rem;
    line-height: 1.55;
  }
`;

const FeeTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  span {
    color: #e2e8f0;
    font-size: 0.85rem;
    font-weight: 900;
  }

  strong {
    color: #ffffff;
    font-size: 1.2rem;
  }
`;

const SmallPrint = styled.p`
  margin: 12px 0 0;
  color: #64748b;
  font-size: 0.68rem;
  line-height: 1.55;
`;

const MetricGrid = styled.div`
  margin-top: 22px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 850px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.article`
  padding: 16px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 13px;
  background: rgba(15, 23, 42, 0.5);

  span {
    display: block;
    color: #60a5fa;
    font-size: 0.61rem;
    font-weight: 900;
    text-transform: uppercase;
  }

  strong {
    display: block;
    margin-top: 7px;
    color: #e2e8f0;
    font-size: 0.83rem;
  }

  p {
    margin: 7px 0 0;
    color: #64748b;
    font-size: 0.69rem;
    line-height: 1.5;
  }
`;

const LiquidationFlow = styled.div`
  margin-top: 22px;
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  gap: 12px;
  align-items: center;
  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 15px;
  background: rgba(15, 23, 42, 0.52);

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const LiquidationItem = styled.div`
  display: flex;
  align-items: center;
  gap: 11px;

  > span {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: 9px;
    background: rgba(34, 197, 94, 0.09);
    color: #86efac;
    font-size: 0.68rem;
    font-weight: 900;
  }

  strong {
    display: block;
    color: #e2e8f0;
    font-size: 0.78rem;
  }

  p {
    margin: 4px 0 0;
    color: #64748b;
    font-size: 0.67rem;
  }
`;

const Arrow = styled.span`
  color: #334155;

  @media (max-width: 720px) {
    display: none;
  }
`;

const FinalCard = styled.section`
  margin-top: 76px;
  padding: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border: 1px solid rgba(34, 197, 94, 0.18);
  border-radius: 20px;
  background:
    linear-gradient(135deg, rgba(34, 197, 94, 0.075), transparent 55%),
    rgba(15, 23, 42, 0.62);

  @media (max-width: 720px) {
    padding: 24px 20px;
    align-items: flex-start;
    flex-direction: column;
  }
`;

const FinalEyebrow = styled.div`
  margin-bottom: 7px;
  color: #86efac;
  font-size: 0.65rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const FinalTitle = styled.h2`
  margin: 0;
  color: #f8fafc;
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
`;

const FinalText = styled.p`
  max-width: 650px;
  margin: 8px 0 0;
  color: #7f91aa;
  font-size: 0.8rem;
  line-height: 1.55;
`;

const FinalActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  flex: 0 0 auto;
`;

const LegalNotice = styled.footer`
  margin-top: 14px;
  padding: 16px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 13px;
  background: rgba(2, 6, 23, 0.24);

  strong {
    display: block;
    color: #94a3b8;
    font-size: 0.7rem;
  }

  p {
    margin: 6px 0 0;
    color: #526075;
    font-size: 0.66rem;
    line-height: 1.55;
  }
`;