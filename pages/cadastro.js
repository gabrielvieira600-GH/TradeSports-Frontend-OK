import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useRouter } from "next/router";
import Link from "next/link";
import { useToast } from "../components/ToastProvider";
import PoliticaPrivacidadeModal from "../components/PoliticaPrivacidadeModal";

/**
 * Cadastro (TradeSports)
 * - Mantém o layout atual (cartão central) e adiciona:
 *   - Modal de Termos (com scroll obrigatório para habilitar "Aceitar")
 *   - Modal de Política de Risco
 *   - Modal de Política de Privacidade (componente separado)
 *
 * Observação: o checkbox de aceite só habilita depois do usuário aceitar no modal de Termos.
 */

const API = process.env.NEXT_PUBLIC_API_URL;
const VERSAO_TERMOS = "1.0";
const VERSAO_POLITICA_RISCO = 'v1.0';
const VERSAO_POLITICA_PRIVACIDADE = 'v1.0';


export default function Cadastro() {
  const router = useRouter();
  const { adicionarToast } = useToast();

  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    dataNascimento: "",
    cpf: "",
    genero: "",
    nomeUsuario: "",
    senha: "",
    confirmarSenha: "",
  });

  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Aceites
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [aceitouPoliticaRisco, setAceitouPoliticaRisco] = useState(false);
  const [aceitouPoliticaPrivacidade, setAceitouPoliticaPrivacidade] = useState(false);

  const [termosLiberados, setTermosLiberados] = useState(false);

  // Modais
  const [mostrarTermos, setMostrarTermos] = useState(false);
  const [mostrarPoliticaRisco, setMostrarPoliticaRisco] = useState(false);
  const [mostrarPoliticaPrivacidade, setMostrarPoliticaPrivacidade] = useState(false);

  // Controle de scroll do Termos
  const [termosScrollNoFim, setTermosScrollNoFim] = useState(false);
  const termosScrollRef = useRef(null);

  const termosTexto = useMemo(() => {
    return `TERMOS DE USO — TRADESPORTS

Última atualização: [DATA]

⸻

1. ACEITAÇÃO DOS TERMOS

Ao acessar e utilizar a plataforma TradeSports (“Plataforma”), o usuário declara ter lido, compreendido e aceitado integralmente estes Termos de Uso, bem como a Política de Privacidade e a Política de Risco.

Caso não concorde com qualquer disposição, o usuário não deverá utilizar a Plataforma.

⸻

2. DEFINIÇÕES

Para fins destes Termos:
	•	Plataforma: sistema digital operado pela TradeSports que permite a negociação de cotas virtuais entre usuários.
	•	Usuário: pessoa física cadastrada na Plataforma.
	•	Cotas Virtuais: unidades digitais representativas de ativos simulados vinculados ao desempenho esportivo de clubes.
	•	Saldo: registro contábil interno representando os valores disponíveis do usuário na Plataforma.
	•	Ordem: instrução de compra ou venda de cotas virtuais.
	•	Mercado: ambiente de negociação entre usuários baseado em oferta e demanda.

⸻

3. NATUREZA DA PLATAFORMA

A TradeSports é:

uma plataforma digital de negociação de cotas virtuais em ambiente próprio, com dinâmica econômica interna baseada na interação entre usuários, podendo integrar terceiros para determinadas etapas operacionais e financeiras.

A TradeSports:
	•	não se apresenta como banco, instituição financeira, corretora de valores mobiliários ou operadora de apostas de quota fixa;
	•	não garante rentabilidade, lucro ou valorização;
	•	não administra investimentos ou presta consultoria financeira.

⸻

4. NATUREZA DAS COTAS VIRTUAIS

As cotas virtuais:
	•	não representam participação societária;
	•	não constituem valores mobiliários;
	•	não representam crédito contra clubes;
	•	não conferem direitos esportivos, econômicos ou federativos;
	•	não são ativos financeiros regulados.

Tratam-se exclusivamente de:

ativos digitais simulados para fins de negociação dentro da Plataforma.

⸻

5. CADASTRO E CONTA

O usuário declara que:
	•	possui capacidade civil plena;
	•	fornece informações verdadeiras e atualizadas;
	•	é titular dos meios de pagamento utilizados.

A TradeSports poderá:
	•	solicitar verificação de identidade (KYC);
	•	suspender ou encerrar contas em caso de irregularidade;
	•	recusar cadastro sem obrigação de justificativa.

⸻

6. FUNCIONAMENTO DO MERCADO

A negociação ocorre exclusivamente entre usuários.

6.1 Formação de preço

Os preços das cotas:
	•	são definidos por oferta e demanda;
	•	podem sofrer alta volatilidade;
	•	podem apresentar baixa liquidez;
	•	podem não refletir qualquer valor econômico real.

⸻

6.2 Ordens
	•	ordens podem ser executadas total ou parcialmente;
	•	ordens podem permanecer abertas sem execução;
	•	cancelamentos podem estar sujeitos a regras operacionais e antifraude.

⸻

7. TAXAS

A TradeSports poderá cobrar:
	•	taxa de negociação (maker/taker);
	•	taxa de saque;
	•	outras taxas operacionais previamente informadas.

⸻

8. DEPÓSITOS E SAQUES

8.1 Depósitos
	•	realizados por meios de pagamento integrados;
	•	podem depender de parceiros terceiros;
	•	estão sujeitos a validação e aprovação.

⸻

8.2 Saques
	•	somente para contas de mesma titularidade;
	•	sujeitos a análise de segurança e antifraude;
	•	podem sofrer retenção temporária em caso de suspeita;
	•	prazos podem variar conforme o meio de pagamento.

⸻

8.3 Restrições

A TradeSports poderá:
	•	recusar depósitos ou saques;
	•	bloquear valores temporariamente;
	•	solicitar documentação adicional.

⸻

9. RISCOS

O usuário declara ciência de que:
	•	pode perder integralmente os valores utilizados;
	•	não há garantia de liquidez;
	•	o mercado pode ser volátil;
	•	eventos esportivos influenciam preços;
	•	falhas técnicas podem ocorrer.

⸻

10. NÃO RECOMENDAÇÃO (NO SUITABILITY)

A TradeSports:
	•	não presta consultoria;
	•	não realiza recomendações;
	•	não avalia perfil de risco do usuário;
	•	não garante adequação das operações.

O usuário é o único responsável por suas decisões.

⸻

11. CONDUTAS PROIBIDAS

É vedado ao usuário:
	•	fraudar ou manipular o mercado;
	•	utilizar contas de terceiros;
	•	explorar falhas do sistema;
	•	praticar lavagem de dinheiro;
	•	realizar auto-negociação (self-trade);
	•	manipular preços artificialmente.

⸻

12. MONITORAMENTO E COMPLIANCE

A TradeSports poderá:
	•	monitorar atividades;
	•	bloquear contas preventivamente;
	•	cancelar operações suspeitas;
	•	reportar atividades a autoridades competentes.

⸻

13. SUSPENSÃO E ENCERRAMENTO

A conta poderá ser:
	•	suspensa;
	•	limitada;
	•	encerrada;

em caso de:
	•	violação destes Termos;
	•	suspeita de fraude;
	•	exigência legal ou regulatória.

⸻

14. LIMITAÇÃO DE RESPONSABILIDADE

A TradeSports não se responsabiliza por:
	•	perdas financeiras do usuário;
	•	decisões de negociação;
	•	falta de liquidez;
	•	oscilações de preço;
	•	indisponibilidade temporária;
	•	falhas de terceiros (pagamentos, APIs, etc.).

A responsabilidade da TradeSports é limitada ao funcionamento da Plataforma conforme estes Termos.

⸻

15. PROPRIEDADE INTELECTUAL

Todos os elementos da Plataforma são de propriedade da TradeSports, incluindo:
	•	marca;
	•	software;
	•	layout;
	•	funcionalidades.

É proibida reprodução sem autorização.

⸻

16. COMUNICAÇÃO

As comunicações oficiais serão realizadas por:
	•	e-mail cadastrado;
	•	notificações na Plataforma.

O usuário é responsável por manter seus dados atualizados.

⸻

17. ALTERAÇÕES DOS TERMOS

A TradeSports poderá alterar estes Termos a qualquer momento.

As alterações entrarão em vigor na data de publicação.

O uso contínuo da Plataforma implica aceitação.

⸻

18. LEGISLAÇÃO E FORO

Estes Termos são regidos pelas leis da República Federativa do Brasil.

Fica eleito o foro da comarca de [CIDADE/UF], com renúncia a qualquer outro.`;
  }, []);

  const politicaRiscoTexto = useMemo(() => {
    return `POLÍTICA DE RISCO — TRADESPORTS

Última atualização: [DATA]

⸻

1. OBJETIVO

Esta Política de Risco tem como objetivo informar os usuários da TradeSports (“Plataforma”) sobre os principais riscos envolvidos na utilização do ambiente de negociação de cotas virtuais.

Ao utilizar a Plataforma, o usuário declara ciência e aceitação integral dos riscos descritos neste documento.

⸻

2. NATUREZA DA PLATAFORMA

A TradeSports é:

uma plataforma digital de negociação de cotas virtuais em ambiente próprio, cuja dinâmica econômica depende da interação entre usuários e de fatores externos, especialmente o desempenho esportivo real.

A Plataforma:
	•	não garante lucro ou rentabilidade;
	•	não presta consultoria financeira;
	•	não assegura liquidez;
	•	não controla o comportamento do mercado.

⸻

3. RISCO DE PERDA FINANCEIRA

O usuário reconhece que:
	•	poderá perder total ou parcialmente os valores utilizados;
	•	não há garantia de recuperação de capital;
	•	decisões de compra e venda são de responsabilidade exclusiva do usuário.

⸻

4. RISCO DE MERCADO

Os preços das cotas podem:
	•	variar significativamente em curtos períodos;
	•	sofrer oscilações abruptas;
	•	refletir comportamento coletivo e especulativo dos usuários.

⸻

5. RISCO DE LIQUIDEZ

O usuário poderá enfrentar situações em que:
	•	não haja compradores ou vendedores disponíveis;
	•	ordens não sejam executadas;
	•	seja necessário negociar a preços desfavoráveis;
	•	não seja possível sair de uma posição no momento desejado.

⸻

6. RISCO OPERACIONAL

A Plataforma pode estar sujeita a:
	•	indisponibilidade temporária;
	•	falhas técnicas;
	•	atrasos na execução de ordens;
	•	erros sistêmicos ou de integração com terceiros.

⸻

7. RISCO REGULATÓRIO E JURÍDICO

A TradeSports:

não se apresenta como banco, instituição financeira, corretora de valores mobiliários ou operadora de apostas de quota fixa;

No entanto:
	•	determinadas atividades relacionadas a pagamentos, verificação de identidade, prevenção a fraudes e movimentação de recursos podem depender de terceiros regulados;
	•	o ambiente regulatório pode evoluir ou ser interpretado de forma diversa por autoridades competentes;
	•	alterações legais ou regulatórias podem impactar a operação da Plataforma.

⸻

8. RISCO DE PARCEIROS E TERCEIROS

A operação depende de terceiros, incluindo:
	•	provedores de pagamento;
	•	APIs de dados esportivos;
	•	serviços de hospedagem e infraestrutura.

Eventuais falhas nesses serviços podem impactar:
	•	depósitos e saques;
	•	atualização de dados;
	•	funcionamento da Plataforma.

⸻

9. RISCO DE DEPÓSITOS E SAQUES

Operações financeiras podem estar sujeitas a:
	•	atrasos no processamento;
	•	bloqueios temporários;
	•	necessidade de verificação adicional;
	•	cancelamentos ou estornos, especialmente em meios como cartão de crédito.

⸻

10. RISCO DE CONTRAPARTE (PLATAFORMA)

A TradeSports poderá:
	•	suspender ou bloquear contas;
	•	reter valores temporariamente;
	•	revisar ou cancelar operações;

em casos de:
	•	suspeita de fraude;
	•	exigência legal;
	•	necessidade operacional.

⸻

11. RISCO DE ABUSO DE MERCADO

A Plataforma pode ser impactada por comportamentos como:
	•	manipulação de preços;
	•	operações artificiais;
	•	uso de múltiplas contas;
	•	estratégias abusivas de negociação.

Embora existam mecanismos de controle, tais práticas podem afetar:
	•	preços;
	•	liquidez;
	•	estabilidade do mercado.

⸻

12. RISCO DE CONCENTRAÇÃO

O mercado pode apresentar:
	•	baixa diversificação de participantes;
	•	concentração de cotas em poucos usuários;
	•	influência desproporcional de determinados agentes.

⸻

13. RISCO RELACIONADO AO DESEMPENHO ESPORTIVO

Os preços das cotas são influenciados por:
	•	resultados de partidas;
	•	classificação dos clubes;
	•	eventos esportivos imprevistos.

Fatores externos podem impactar significativamente o valor das cotas.

⸻

14. RISCO DE INTERRUPÇÃO DE SERVIÇO

Eventos extraordinários podem afetar a operação, incluindo:
	•	falhas técnicas;
	•	indisponibilidade de serviços externos;
	•	eventos de força maior;
	•	mudanças estruturais no campeonato.

⸻

15. RISCO DE SEGURANÇA DA CONTA

O usuário é responsável por:
	•	manter suas credenciais seguras;
	•	não compartilhar acesso;
	•	adotar medidas de proteção.

A TradeSports não se responsabiliza por acessos indevidos decorrentes de negligência do usuário.

⸻

16. RISCO DE DECISÃO DO USUÁRIO

O usuário reconhece que:
	•	todas as decisões são de sua responsabilidade;
	•	não há orientação personalizada;
	•	a Plataforma não garante adequação das operações ao seu perfil.

⸻

17. AUSÊNCIA DE GARANTIAS

A TradeSports não garante:
	•	lucro;
	•	liquidez;
	•	estabilidade de preços;
	•	continuidade ininterrupta da operação.

⸻

18. ATUALIZAÇÕES DA POLÍTICA

Esta Política poderá ser atualizada a qualquer momento.

O uso contínuo da Plataforma implica aceitação das alterações.

⸻

19. CONTATO

Dúvidas sobre esta Política:

📧 [email@tradesports.com]`;
  }, []);

  useEffect(() => {
    // Sempre que abrir o modal de termos, reseta o controle de scroll.
    if (mostrarTermos) {
      setTermosScrollNoFim(false);
      // leva o scroll pro topo quando abrir
      setTimeout(() => {
        if (termosScrollRef.current) {
          termosScrollRef.current.scrollTop = 0;
        }
      }, 0);
    }
  }, [mostrarTermos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErro("");

    // CPF: só números
    if (name === "cpf") {
      const onlyDigits = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, [name]: onlyDigits }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!aceitouTermos || !termosLiberados) {
      setErro("Você precisa aceitar os Termos de Uso para finalizar o cadastro.");
      return;
    }

    if (form.cpf.length !== 11) {
      setErro("Digite um CPF com 11 números.");
      return;
    }

    if (form.senha.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas não conferem.");
      return;
    }

    try {
      setEnviando(true);
      await axios.post(`${API}/cadastro`, {
        nome: form.nome,
        sobrenome: form.sobrenome,
        email: form.email,
        dataNascimento: form.dataNascimento,
        cpf: form.cpf,
        genero: form.genero,
        nomeUsuario: form.nomeUsuario,
        senha: form.senha,
      });

      adicionarToast("Cadastro realizado com sucesso!", "success");
      router.push("/login");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.erro ||
        "Erro ao cadastrar. Tente novamente.";
      setErro(msg);
      adicionarToast(msg, "error");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Container>
      <Shell>
        <BrandPanel>
          <BrandContent>
            <Eyebrow>Seu mercado. Sua estratégia.</Eyebrow>
            <BrandTitle>
              Transforme sua leitura do futebol em <em>decisões de mercado.</em>
            </BrandTitle>
            <BrandText>
              Monte sua carteira, acompanhe o desempenho dos clubes e negocie
              cotas virtuais em um ambiente competitivo e transparente.
            </BrandText>

            <BenefitList>
              <Benefit>
                <BenefitIcon>01</BenefitIcon>
                <div>
                  <strong>Mercado dinâmico</strong>
                  <span>Preços formados pela oferta e pela demanda.</span>
                </div>
              </Benefit>
              <Benefit>
                <BenefitIcon>02</BenefitIcon>
                <div>
                  <strong>Estratégia esportiva</strong>
                  <span>Informação e visão de jogo orientam suas escolhas.</span>
                </div>
              </Benefit>
              <Benefit>
                <BenefitIcon>03</BenefitIcon>
                <div>
                  <strong>Ambiente simulado</strong>
                  <span>Experiência expressa em moeda virtual T$.</span>
                </div>
              </Benefit>
            </BenefitList>
          </BrandContent>

          <PanelFooter>
            <StatusDot />
            Plataforma em ambiente de simulação
          </PanelFooter>
        </BrandPanel>

        <Card>
          <CardHeader>
            <StepLabel>Crie sua conta</StepLabel>
            <Titulo>Comece sua jornada</Titulo>
            <Subtitulo>
              Preencha seus dados para acessar o mercado TradeSports.
            </Subtitulo>
          </CardHeader>

        <Form onSubmit={handleSubmit}>
          <Linha2colunas>
            <Campo>
              <Label>Nome</Label>
              <Input
                name="nome"
                placeholder="Nome"
                value={form.nome}
                onChange={handleChange}
                required
              />
            </Campo>

            <Campo>
              <Label>Sobrenome completo</Label>
              <Input
                name="sobrenome"
                placeholder="Sobrenome completo"
                value={form.sobrenome}
                onChange={handleChange}
                required
              />
            </Campo>
          </Linha2colunas>

          <Linha2colunas>
            <Campo>
              <Label>E-mail</Label>
              <Input
                name="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </Campo>

            <Campo>
              <Label>Data de Nascimento</Label>
              <Input
                name="dataNascimento"
                type="date"
                value={form.dataNascimento}
                onChange={handleChange}
                required
              />
            </Campo>
          </Linha2colunas>

          <Linha2colunas>
            <Campo>
              <Label>CPF</Label>
              <Input
                name="cpf"
                placeholder="00000000000"
                inputMode="numeric"
                maxLength={11}
                value={form.cpf}
                onChange={handleChange}
                required
              />
            </Campo>

            <Campo>
              <Label>Gênero</Label>
              <Select name="genero" value={form.genero} onChange={handleChange} required>
                <option value="">Selecione o gênero</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
                <option value="Prefiro não informar">Prefiro não informar</option>
              </Select>
            </Campo>
          </Linha2colunas>

          <Campo>
            <Label>Nome de Usuário</Label>
            <Input
              name="nomeUsuario"
              placeholder="Ex: gvinvest"
              value={form.nomeUsuario}
              onChange={handleChange}
              required
            />
          </Campo>

          <Linha2colunas>
            <Campo>
              <Label>Senha</Label>
              <Input
                name="senha"
                type="password"
                placeholder="Mínimo de 8 caracteres"
                minLength={8}
                autoComplete="new-password"
                value={form.senha}
                onChange={handleChange}
                required
              />
            </Campo>

            <Campo>
              <Label>Confirmar Senha</Label>
              <Input
                name="confirmarSenha"
                type="password"
                placeholder="Repita sua senha"
                minLength={8}
                autoComplete="new-password"
                value={form.confirmarSenha}
                onChange={handleChange}
                required
              />
            </Campo>
          </Linha2colunas>

          {erro && <ErroMsg>{erro}</ErroMsg>}

          <AceiteLinha>
            <Checkbox
              type="checkbox"
              checked={aceitouTermos}
              disabled={!termosLiberados}
              onChange={(e) => setAceitouTermos(e.target.checked)}
              id="aceite-termos"
            />

            <AceiteTexto htmlFor="aceite-termos">
              Li e aceito os{" "}
              <LinkLike
                type="button"
                onClick={() => {
                  setMostrarTermos(true);
                  setTermosScrollNoFim(false);
                }}
              >
                Termos de Uso
              </LinkLike>{" "}
              , a{" "}
              <LinkLike type="button" onClick={() => setMostrarPoliticaRisco(true)}>
                Política de Risco
              </LinkLike>{" "}
              e a{" "}
              <LinkLike type="button" onClick={() => setMostrarPoliticaPrivacidade(true)}>
                Política de Privacidade
              </LinkLike>
              .
            </AceiteTexto>
          </AceiteLinha>

          <Botao
            type="submit"
            disabled={!aceitouTermos || !termosLiberados || enviando}
          >
            {enviando ? "Criando sua conta..." : "Criar minha conta"}
            {!enviando && <BotaoSeta aria-hidden="true">→</BotaoSeta>}
          </Botao>

          <LoginTexto>
            Já possui uma conta? <Link href="/login">Entrar agora</Link>
          </LoginTexto>

          <Nota>
            Ao criar sua conta, você declara ciência dos riscos e concorda com os Termos de Uso e as
            Políticas exibidas.
          </Nota>
        </Form>
        </Card>
      </Shell>

      {/* MODAL TERMOS (scroll obrigatório) */}
      {mostrarTermos && (
        <Overlay onClick={() => setMostrarTermos(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Termos de Uso (TradeSports)</ModalTitle>
              <Fechar type="button" onClick={() => setMostrarTermos(false)} aria-label="Fechar">
                ✕
              </Fechar>
            </ModalHeader>

            <ModalBody
              ref={termosScrollRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
                  setTermosScrollNoFim(true);
                }
              }}
            >
              <TermosPre>{termosTexto}</TermosPre>
            </ModalBody>

            <ModalFooter>
              <ModalHint>
                {!termosScrollNoFim
                  ? 'Role até o final dos Termos para habilitar o botão “Aceitar”.'
                  : `Ao aceitar, você concorda com esta versão (${VERSAO_TERMOS}).`}
              </ModalHint>

              <ModalActions>
                <BotaoSec type="button" onClick={() => setMostrarTermos(false)}>
                  Voltar
                </BotaoSec>
                <BotaoPrim
                  type="button"
                  disabled={!termosScrollNoFim}
                  onClick={() => {
                    setAceitouTermos(true);
                    setTermosLiberados(true);
                    setMostrarTermos(false);
                  }}
                >
                  Aceitar e continuar
                </BotaoPrim>
              </ModalActions>
            </ModalFooter>
          </Modal>
        </Overlay>
      )}

      {/* MODAL POLÍTICA DE RISCO */}
      {mostrarPoliticaRisco && (
        <Overlay onClick={() => { setAceitouPoliticaRisco(true); setMostrarPoliticaRisco(false); }}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Política de Risco (TradeSports)</ModalTitle>
              <Fechar
                type="button"
                onClick={() => { setAceitouPoliticaRisco(true); setMostrarPoliticaRisco(false); }}
                aria-label="Fechar"
              >
                ✕
              </Fechar>
            </ModalHeader>

            <ModalBody>
              <TermosPre>{politicaRiscoTexto}</TermosPre>
            </ModalBody>

            <ModalFooter>
              <ModalActions>
                <BotaoPrim type="button" onClick={() => { setAceitouPoliticaRisco(true); setMostrarPoliticaRisco(false); }}>
                  Entendi
                </BotaoPrim>
              </ModalActions>
            </ModalFooter>
          </Modal>
        </Overlay>
      )}

      {/* MODAL POLÍTICA DE PRIVACIDADE (componente separado) */}
      {mostrarPoliticaPrivacidade && (
        <PoliticaPrivacidadeModal onClose={() => setMostrarPoliticaPrivacidade(false)} onAceitar={() => setAceitouPoliticaPrivacidade(true)} />
      )}
    </Container>
  );
}

/* ======= Styles ======= */

const Container = styled.main`
  position: relative;
  min-height: 100vh;
  padding: 42px 24px;
  display: grid;
  place-items: center;
  overflow: hidden;
  background:
    linear-gradient(rgba(3, 12, 24, 0.9), rgba(3, 12, 24, 0.97)),
    radial-gradient(circle at 12% 12%, #12365b 0, transparent 42%),
    #030c18;
  color: #e5edf8;

  @media (max-width: 700px) {
    padding: 18px 12px;
    place-items: start center;
  }
`;

const Glow = styled.div`
  position: absolute;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  filter: blur(110px);
  opacity: 0.17;
  pointer-events: none;
  background: ${({ $um }) => ($um ? "#1d6fff" : "#13d97c")};
  top: ${({ $um }) => ($um ? "-180px" : "auto")};
  left: ${({ $um }) => ($um ? "-120px" : "auto")};
  right: ${({ $dois }) => ($dois ? "-160px" : "auto")};
  bottom: ${({ $dois }) => ($dois ? "-180px" : "auto")};
`;

const Shell = styled.section`
  position: relative;
  z-index: 1;
  width: min(1120px, 100%);
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(520px, 1.1fr);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 28px;
  overflow: hidden;
  background: rgba(8, 22, 39, 0.86);
  box-shadow: 0 34px 90px rgba(0, 0, 0, 0.42);

  @media (max-width: 940px) {
    grid-template-columns: 1fr;
    max-width: 680px;
  }
`;

const BrandPanel = styled.aside`
  position: relative;
  min-height: 720px;
  padding: 38px;
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(150deg, rgba(18, 55, 91, 0.62), rgba(4, 18, 33, 0.94)),
    radial-gradient(circle at 30% 20%, rgba(31, 111, 235, 0.28), transparent 48%);
  border-right: 1px solid rgba(148, 163, 184, 0.12);

  @media (max-width: 940px) {
    display: none;
  }
`;

const BrandLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 11px;
  width: fit-content;
  color: #fff;
  text-decoration: none;
`;

const MobileBrand = styled(BrandLink)`
  display: none;
  margin-bottom: 26px;

  @media (max-width: 940px) {
    display: inline-flex;
  }
`;

const BrandMark = styled.span`
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  position: relative;
  border-radius: 13px;
  background: linear-gradient(145deg, #20db83, #0bad65);
  box-shadow: 0 10px 28px rgba(19, 217, 124, 0.2);

  span {
    position: absolute;
    color: #031423;
    font-size: 19px;
    font-weight: 950;
    line-height: 1;
  }

  span:first-child {
    transform: translate(-5px, -5px);
  }

  span:last-child {
    transform: translate(5px, 5px);
  }
`;

const BrandName = styled.strong`
  color: #fff;
  font-size: 1.24rem;
  font-weight: 900;
  letter-spacing: -0.04em;

  span {
    color: #21dc83;
  }
`;

const BrandContent = styled.div`
  margin: auto 0;
`;

const Eyebrow = styled.div`
  margin-bottom: 16px;
  color: #6ee7b7;
  font-size: 0.69rem;
  font-weight: 900;
  letter-spacing: 0.15em;
  text-transform: uppercase;
`;

const BrandTitle = styled.h2`
  margin: 0;
  max-width: 430px;
  color: #fff;
  font-size: clamp(2rem, 3vw, 3.25rem);
  line-height: 1.02;
  letter-spacing: -0.055em;

  em {
    color: #21dc83;
    font-style: normal;
  }
`;

const BrandText = styled.p`
  max-width: 430px;
  margin: 20px 0 30px;
  color: #9db0c7;
  font-size: 0.94rem;
  line-height: 1.7;
`;

const BenefitList = styled.div`
  display: grid;
  gap: 12px;
`;

const Benefit = styled.div`
  padding: 13px;
  display: flex;
  align-items: center;
  gap: 13px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.035);

  strong, span { display: block; }
  strong { color: #e8f0fa; font-size: 0.79rem; }
  span { margin-top: 3px; color: #72869e; font-size: 0.69rem; }
`;

const BenefitIcon = styled.span`
  width: 35px;
  height: 35px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 10px;
  background: rgba(32, 219, 131, 0.1);
  color: #4ade9d;
  font-size: 0.66rem;
  font-weight: 900;
`;

const PanelFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #71859d;
  font-size: 0.68rem;
`;

const StatusDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #21dc83;
  box-shadow: 0 0 12px rgba(33, 220, 131, 0.7);
`;

const Card = styled.div`
  padding: 42px 48px;
  background: rgba(6, 18, 33, 0.94);

  @media (max-width: 600px) {
    padding: 26px 20px 30px;
  }
`;

const CardHeader = styled.header`
  margin-bottom: 25px;
`;

const StepLabel = styled.div`
  margin-bottom: 8px;
  color: #4d94ff;
  font-size: 0.69rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const Titulo = styled.h1`
  margin: 0;
  color: #fff;
  font-size: clamp(1.8rem, 3vw, 2.35rem);
  line-height: 1.1;
  letter-spacing: -0.045em;
`;

const Subtitulo = styled.p`
  margin: 9px 0 0;
  color: #8295ac;
  font-size: 0.82rem;
  line-height: 1.55;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Linha2colunas = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 13px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Campo = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

const Label = styled.label`
  color: #b5c2d2;
  font-size: 0.7rem;
  font-weight: 750;
`;

const inputBase = `
  width: 100%;
  height: 46px;
  box-sizing: border-box;
  padding: 0 13px;
  border: 1px solid rgba(148, 163, 184, 0.17);
  border-radius: 11px;
  background: rgba(2, 10, 20, 0.72);
  color: #eef5fc;
  font: inherit;
  font-size: 0.79rem;
  outline: none;
  transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;

  &::placeholder { color: #53657b; }
  &:hover { border-color: rgba(148, 163, 184, 0.28); }
  &:focus {
    border-color: rgba(65, 133, 255, 0.75);
    background: rgba(4, 17, 31, 0.94);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.13);
  }
`;

const Input = styled.input`${inputBase}`;
const Select = styled.select`
  ${inputBase}
  color-scheme: dark;
  cursor: pointer;
`;

const ErroMsg = styled.div`
  padding: 11px 13px;
  border: 1px solid rgba(248, 113, 113, 0.25);
  border-radius: 11px;
  background: rgba(239, 68, 68, 0.09);
  color: #fca5a5;
  font-size: 0.74rem;
  line-height: 1.45;
`;

const AceiteLinha = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 2px;
  padding: 12px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.025);
`;

const Checkbox = styled.input`
  width: 17px;
  height: 17px;
  margin: 1px 0 0;
  flex: 0 0 auto;
  accent-color: #17c978;
`;

const AceiteTexto = styled.label`
  color: #8fa2b8;
  font-size: 0.7rem;
  line-height: 1.55;
`;

const LinkLike = styled.button`
  padding: 0;
  border: 0;
  background: transparent;
  color: #69a3ff;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  &:hover { color: #93bdff; text-decoration: underline; }
`;

const Botao = styled.button`
  height: 48px;
  margin-top: 2px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 11px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #19d47e, #10b96c);
  color: #03160e;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(16, 185, 108, 0.17);
  transition: transform 160ms ease, box-shadow 160ms ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 15px 34px rgba(16, 185, 108, 0.25);
  }

  &:disabled { opacity: 0.48; cursor: not-allowed; box-shadow: none; }
`;

const BotaoSeta = styled.span`
  font-size: 1.1rem;
`;

const LoginTexto = styled.p`
  margin: 0;
  color: #6f829a;
  font-size: 0.73rem;
  text-align: center;

  a {
    color: #7eafff;
    font-weight: 850;
    text-decoration: none;
  }
  a:hover { text-decoration: underline; }
`;

const Nota = styled.p`
  margin: -3px 0 0;
  color: #53657b;
  font-size: 0.65rem;
  line-height: 1.5;
  text-align: center;
`;

/* Modal */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(1, 6, 13, 0.82);
  backdrop-filter: blur(8px);
`;

const Modal = styled.div`
  width: 100%;
  max-width: 780px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 18px;
  background: #f8fafc;
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #0f172a;
  font-size: 0.95rem;
`;

const Fechar = styled.button`
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 9px;
  background: #eaf0f6;
  color: #334155;
  cursor: pointer;
`;

const ModalBody = styled.div`
  max-height: 60vh;
  padding: 18px;
  overflow: auto;
`;

const TermosPre = styled.pre`
  margin: 0;
  color: #1e293b;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 0.76rem;
  line-height: 1.65;
`;

const ModalFooter = styled.div`
  padding: 13px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid #e2e8f0;

  @media (max-width: 560px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const ModalHint = styled.div`
  color: #64748b;
  font-size: 0.69rem;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 9px;
`;

const BotaoSec = styled.button`
  height: 38px;
  padding: 0 15px;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  background: #fff;
  color: #334155;
  font-weight: 800;
  cursor: pointer;
`;

const BotaoPrim = styled.button`
  height: 38px;
  padding: 0 15px;
  border: 0;
  border-radius: 9px;
  background: #2563eb;
  color: #fff;
  font-weight: 850;
  cursor: pointer;

  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

